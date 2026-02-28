/**
 * Dynamic Pricing Agent
 * 
 * Uses LangChain DuckDuckGoSearch + demand history + LLM analysis to:
 * 1. Search market trends for product demand signals
 * 2. Analyze internal demand history (from DemandHistory table)
 * 3. Calculate dynamic pricing based on cost, quantity, and demand
 * 4. Recommend optimal selling price
 * 
 * Pipeline: Search Market → Fetch Internal Data → LLM Analysis → Price Recommendation
 */

import { prisma } from "@/lib/prisma";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PricingResult {
    productName: string;
    currentCostPrice: number;
    currentSalesPrice: number;
    currentStock: number;
    recommendedSalesPrice: number;
    recommendedCostPrice: number;
    demandTrend: "rising" | "stable" | "declining";
    demandScore: number; // 0-100
    priceChangePercent: number;
    reasoning: string;
    marketInsights: string[];
    factors: {
        label: string;
        impact: "positive" | "negative" | "neutral";
        detail: string;
    }[];
    error?: string;
}

// ─────────────────────────────────────────────────────────────
// Node 1: LangChain DuckDuckGoSearch for Market Intelligence
// ─────────────────────────────────────────────────────────────

// Helper: delay between requests to avoid rate limiting
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// LangChain DDG search tool (reusable singleton)
const ddgTool = new DuckDuckGoSearch({ maxResults: 4 });

// Helper: search using LangChain DuckDuckGoSearch with retry
async function ddgSearchWithRetry(query: string, retries = 2): Promise<string[]> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            if (attempt > 0) {
                // Exponential backoff: 2s, 4s
                await delay(2000 * attempt);
            }
            const rawResult = await ddgTool.invoke(query);

            // LangChain DDG returns a JSON string array of results
            if (rawResult && typeof rawResult === "string") {
                try {
                    const parsed = JSON.parse(rawResult);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.slice(0, 3).map(
                            (r: any) => `${r.title}: ${r.snippet || r.description || ""}`
                        );
                    }
                } catch {
                    // If not valid JSON, use as plain text insight
                    if (rawResult.trim().length > 10) {
                        return [rawResult.trim().slice(0, 500)];
                    }
                }
            }
            return [];
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.warn(`[PricingAgent] LangChain DDG search attempt ${attempt + 1} failed for "${query}": ${msg}`);
            if (attempt === retries) {
                return []; // all retries exhausted
            }
        }
    }
    return [];
}

// Fallback: use Groq LLM to generate market-aware insights when web search is unavailable
async function generateLLMMarketInsights(productName: string): Promise<string[]> {
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are a market analyst. Given a product name, provide 3-4 brief market insights about its current demand trends, pricing trends, and supply chain status. Base this on your general knowledge. Each insight should be one sentence. Return them as a JSON array of strings.`,
            prompt: `Provide current market insights for: ${productName}`,
            temperature: 0.3,
            maxOutputTokens: 300,
        });

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.slice(0, 4).map(String);
            }
        }
        return [`General market analysis for ${productName} based on AI knowledge.`];
    } catch {
        return [`Market insights generated from AI knowledge base for ${productName}.`];
    }
}

async function searchMarketTrends(productName: string): Promise<string[]> {
    try {
        const queries = [
            `${productName} market demand trend 2025 2026`,
            `${productName} price trend supply chain`,
        ];

        const insights: string[] = [];

        // Try LangChain DDG search with delays between queries
        for (let i = 0; i < queries.length; i++) {
            if (i > 0) await delay(1500); // 1.5s gap between queries
            const results = await ddgSearchWithRetry(queries[i], 1);
            insights.push(...results);
        }

        // If DDG failed entirely, use LLM-based market insights as fallback
        if (insights.length === 0) {
            console.log("[PricingAgent] DDG search unavailable, using LLM market insights fallback");
            const llmInsights = await generateLLMMarketInsights(productName);
            insights.push(...llmInsights);
        }

        if (insights.length === 0) {
            insights.push("Market analysis based on internal data and AI knowledge.");
        }

        return insights.slice(0, 6);
    } catch (error) {
        console.warn("[PricingAgent] Market search error:", error);
        // Ultimate fallback: use LLM insights
        try {
            return await generateLLMMarketInsights(productName);
        } catch {
            return ["Market search unavailable — pricing based on internal data only."];
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Node 2: Fetch Internal Product + Demand Data
// ─────────────────────────────────────────────────────────────

interface ProductData {
    name: string;
    sku: string;
    costPrice: number;
    salesPrice: number;
    minStock: number;
    maxStock: number | null;
    totalStock: number;
    demandHistory: { quantity: number; date: Date }[];
    category: string;
}

async function fetchProductData(
    productQuery: string,
    userId: string
): Promise<ProductData | null> {
    try {
        // Find matching product(s)
        const products = await prisma.product.findMany({
            where: {
                userId,
                OR: [
                    { name: { contains: productQuery, mode: "insensitive" } },
                    { sku: { contains: productQuery, mode: "insensitive" } },
                ],
            },
            include: {
                stockLevels: true,
                demandHistory: {
                    orderBy: { date: "desc" },
                    take: 30,
                },
                category: true,
            },
            take: 1,
        });

        if (products.length === 0) {
            // Try broader search
            const allProducts = await prisma.product.findMany({
                where: { userId },
                include: {
                    stockLevels: true,
                    demandHistory: {
                        orderBy: { date: "desc" },
                        take: 30,
                    },
                    category: true,
                },
                take: 1,
            });

            if (allProducts.length === 0) return null;
            const p = allProducts[0];
            return {
                name: p.name,
                sku: p.sku,
                costPrice: Number(p.costPrice),
                salesPrice: Number(p.salesPrice),
                minStock: p.minStock,
                maxStock: p.maxStock,
                totalStock: p.stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0),
                demandHistory: p.demandHistory.map((d: any) => ({
                    quantity: d.quantity,
                    date: d.date,
                })),
                category: p.category?.name || "Uncategorized",
            };
        }

        const p = products[0];
        return {
            name: p.name,
            sku: p.sku,
            costPrice: Number(p.costPrice),
            salesPrice: Number(p.salesPrice),
            minStock: p.minStock,
            maxStock: p.maxStock,
            totalStock: p.stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0),
            demandHistory: p.demandHistory.map((d: any) => ({
                quantity: d.quantity,
                date: d.date,
            })),
            category: p.category?.name || "Uncategorized",
        };
    } catch (error) {
        console.error("[PricingAgent] DB error:", error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Node 3: Demand Forecasting
// ─────────────────────────────────────────────────────────────

function analyzeDemand(demandHistory: { quantity: number; date: Date }[]): {
    trend: "rising" | "stable" | "declining";
    avgDemand: number;
    growthRate: number;
    demandScore: number;
} {
    if (demandHistory.length === 0) {
        return { trend: "stable", avgDemand: 0, growthRate: 0, demandScore: 50 };
    }

    const quantities = demandHistory.map((d) => d.quantity);
    const avgDemand = quantities.reduce((a, b) => a + b, 0) / quantities.length;

    // Compare recent half vs older half
    const mid = Math.floor(quantities.length / 2);
    const recentAvg =
        quantities.slice(0, mid).reduce((a, b) => a + b, 0) / Math.max(mid, 1);
    const olderAvg =
        quantities.slice(mid).reduce((a, b) => a + b, 0) / Math.max(quantities.length - mid, 1);

    const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    let trend: "rising" | "stable" | "declining" = "stable";
    if (growthRate > 10) trend = "rising";
    else if (growthRate < -10) trend = "declining";

    // Score: 0-100 (higher = more demand)
    const demandScore = Math.min(100, Math.max(0, 50 + growthRate));

    return { trend, avgDemand, growthRate, demandScore };
}

// ─────────────────────────────────────────────────────────────
// Node 4: LLM-Based Price Recommendation
// ─────────────────────────────────────────────────────────────

async function generatePriceRecommendation(
    product: ProductData,
    demandAnalysis: { trend: string; avgDemand: number; growthRate: number; demandScore: number },
    marketInsights: string[]
): Promise<{
    recommendedSalesPrice: number;
    recommendedCostPrice: number;
    reasoning: string;
    factors: { label: string; impact: string; detail: string }[];
}> {
    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are a pricing strategist for an inventory management system.

Your job is to recommend optimal selling price and cost price adjustments based on:
1. Current pricing and stock levels
2. Internal demand trend analysis
3. Market intelligence from web search

Pricing Rules:
- Minimum margin: 15% above cost price
- If demand is RISING: increase price by 5-20% (demand premium)
- If demand is DECLINING: decrease price by 5-15% (clearance pricing)  
- If stock is LOW (below minStock): increase price by 5-10% (scarcity premium)
- If stock is HIGH (above maxStock or 2x minStock): decrease price by 5-10% (volume pricing)
- Consider market trends from web search for broader context
- Never set sales price below cost price

Return ONLY a JSON object:
{
  "recommendedSalesPrice": <number>,
  "recommendedCostPrice": <number>,
  "reasoning": "<2-3 sentences explaining the recommendation>",
  "factors": [
    {"label": "<factor name>", "impact": "positive|negative|neutral", "detail": "<brief explanation>"}
  ]
}`,
        prompt: `Product: ${product.name} (SKU: ${product.sku})
Category: ${product.category}
Current Cost Price: ₹${product.costPrice}
Current Sales Price: ₹${product.salesPrice}
Current Stock: ${product.totalStock} units
Min Stock: ${product.minStock}, Max Stock: ${product.maxStock || "N/A"}

Demand Analysis:
- Trend: ${demandAnalysis.trend}
- Avg Daily Demand: ${demandAnalysis.avgDemand.toFixed(1)} units
- Growth Rate: ${demandAnalysis.growthRate.toFixed(1)}%
- Demand Score: ${demandAnalysis.demandScore}/100

Market Intelligence:
${marketInsights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Generate pricing recommendation:`,
        temperature: 0.2,
        maxOutputTokens: 400,
    });

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in LLM response");
        const parsed = JSON.parse(jsonMatch[0]);

        // Safety: never let sales price go below cost
        const safeSalesPrice = Math.max(
            parsed.recommendedSalesPrice || product.salesPrice,
            (parsed.recommendedCostPrice || product.costPrice) * 1.15
        );

        return {
            recommendedSalesPrice: Math.round(safeSalesPrice * 100) / 100,
            recommendedCostPrice: Math.round((parsed.recommendedCostPrice || product.costPrice) * 100) / 100,
            reasoning: parsed.reasoning || "Price adjusted based on demand and market analysis.",
            factors: parsed.factors || [],
        };
    } catch {
        // Fallback: simple demand-based pricing
        let multiplier = 1.0;
        if (demandAnalysis.trend === "rising") multiplier = 1.1;
        else if (demandAnalysis.trend === "declining") multiplier = 0.9;

        if (product.totalStock < product.minStock) multiplier *= 1.05;

        const recommendedSalesPrice = Math.max(
            product.costPrice * 1.15,
            product.salesPrice * multiplier
        );

        return {
            recommendedSalesPrice: Math.round(recommendedSalesPrice * 100) / 100,
            recommendedCostPrice: product.costPrice,
            reasoning: `Pricing adjusted by ${((multiplier - 1) * 100).toFixed(0)}% based on ${demandAnalysis.trend} demand trend.`,
            factors: [
                { label: "Demand Trend", impact: demandAnalysis.trend === "rising" ? "positive" : demandAnalysis.trend === "declining" ? "negative" : "neutral", detail: `${demandAnalysis.trend} at ${demandAnalysis.growthRate.toFixed(1)}% growth` },
                { label: "Stock Level", impact: product.totalStock < product.minStock ? "positive" : "neutral", detail: `${product.totalStock} units in stock` },
            ],
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Main Pipeline
// ─────────────────────────────────────────────────────────────

export async function runPricingAgent(
    query: string,
    userId: string
): Promise<PricingResult> {
    try {
        // Extract product name from query using LLM
        const { text: extractedName } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `Extract the product name from the user's pricing query. Return ONLY the product name, nothing else. If no specific product is mentioned, return "all".`,
            prompt: query,
            temperature: 0,
            maxOutputTokens: 50,
        });

        const productName = extractedName.trim().replace(/['"]/g, "");

        // Step 1: Fetch internal data
        const productData = await fetchProductData(productName, userId);
        if (!productData) {
            // Even without a product, try to fetch market insights for the query
            let marketInsights: string[] = [];
            try {
                marketInsights = await searchMarketTrends(productName);
            } catch { /* ignore */ }

            return {
                productName: productName,
                currentCostPrice: 0,
                currentSalesPrice: 0,
                currentStock: 0,
                recommendedSalesPrice: 0,
                recommendedCostPrice: 0,
                demandTrend: "stable",
                demandScore: 50,
                priceChangePercent: 0,
                reasoning: `No product found matching "${productName}" in your inventory. Add this product first, then request pricing analysis. ${marketInsights.length > 0 ? 'However, here are some market insights we found:' : ''}`,
                marketInsights,
                factors: [
                    { label: "Product Status", impact: "negative" as const, detail: "Not found in inventory" },
                    { label: "Action Required", impact: "neutral" as const, detail: "Add product via 'Add a product called ...'" },
                ],
                error: "Product not found",
            };
        }

        // Step 2: Search market trends (parallel with demand analysis)
        const [marketInsights, demandAnalysis] = await Promise.all([
            searchMarketTrends(productData.name),
            Promise.resolve(analyzeDemand(productData.demandHistory)),
        ]);

        // Step 3: Generate price recommendation
        const recommendation = await generatePriceRecommendation(
            productData,
            demandAnalysis,
            marketInsights
        );

        const priceChangePercent =
            productData.salesPrice > 0
                ? ((recommendation.recommendedSalesPrice - productData.salesPrice) /
                    productData.salesPrice) * 100
                : 0;

        return {
            productName: productData.name,
            currentCostPrice: productData.costPrice,
            currentSalesPrice: productData.salesPrice,
            currentStock: productData.totalStock,
            recommendedSalesPrice: recommendation.recommendedSalesPrice,
            recommendedCostPrice: recommendation.recommendedCostPrice,
            demandTrend: demandAnalysis.trend as "rising" | "stable" | "declining",
            demandScore: demandAnalysis.demandScore,
            priceChangePercent: Math.round(priceChangePercent * 100) / 100,
            reasoning: recommendation.reasoning,
            marketInsights,
            factors: recommendation.factors as PricingResult["factors"],
        };
    } catch (error) {
        console.error("[PricingAgent] Error:", error);
        return {
            productName: "Unknown",
            currentCostPrice: 0,
            currentSalesPrice: 0,
            currentStock: 0,
            recommendedSalesPrice: 0,
            recommendedCostPrice: 0,
            demandTrend: "stable",
            demandScore: 50,
            priceChangePercent: 0,
            reasoning: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            marketInsights: [],
            factors: [],
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
