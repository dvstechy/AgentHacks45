/**
 * LLM-Based Intent Router
 * Uses Vercel AI SDK + Groq to classify user intent and route to the right agent.
 * 
 * Intent Categories:
 * - data_query:     Questions about data → Text-to-SQL agent
 * - data_mutation:  Add/create/update/delete records → Prisma mutation handler
 * - rebalancing:    Stock/inventory optimization → Multi-Agent system
 * - supplier_audit: Supplier/vendor/contract analysis → Multi-Agent (supplier mode)
 * - general_chat:   General questions → Direct LLM response
 */

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export type IntentType = "data_query" | "data_mutation" | "rebalancing" | "supplier_audit" | "general_chat";

export interface IntentResult {
    intent: IntentType;
    confidence: number;
    reasoning: string;
}

/**
 * Classify user intent using Groq via Vercel AI SDK
 */
export async function classifyIntent(query: string): Promise<IntentResult> {
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are an intent classifier for an inventory management system chatbot.

Classify the user's message into EXACTLY ONE of these intents:

1. "data_query" - User wants to LOOK UP, COUNT, LIST, or VIEW existing data. READ-ONLY.
   Examples: "How many products?", "Show all warehouses", "List stock levels", "What's the total inventory value?"

2. "data_mutation" - User wants to ADD, CREATE, UPDATE, EDIT, DELETE, or REMOVE data records.
   Examples: "Add a product called Motorola", "Create a new warehouse", "Delete product X", "Update stock for item Y", "Add a new category"

3. "rebalancing" - User wants to OPTIMIZE, REBALANCE, or FIX inventory/stock issues using AI analysis.
   Examples: "Optimize my inventory", "Rebalance stock across warehouses", "Fix low stock issues", "Run inventory analysis"

4. "supplier_audit" - User wants to AUDIT, REVIEW, or ANALYZE suppliers/vendors/contracts.
   Examples: "Audit supplier performance", "Check vendor contracts", "Supplier analysis"

5. "general_chat" - General questions, greetings, help, or anything else.
   Examples: "Hello", "How does this work?", "What can you do?", "Help"

IMPORTANT: If the user wants to ADD or CREATE new records, that is "data_mutation", NOT "data_query".

Respond ONLY with a JSON object:
{"intent": "...", "confidence": 0.0-1.0, "reasoning": "brief reason"}`,
            prompt: query,
            temperature: 0,
            maxOutputTokens: 100,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallbackClassify(query);

        const parsed = JSON.parse(jsonMatch[0]);
        const validIntents: IntentType[] = ["data_query", "data_mutation", "rebalancing", "supplier_audit", "general_chat"];

        return {
            intent: validIntents.includes(parsed.intent) ? parsed.intent : "general_chat",
            confidence: Math.min(1, Math.max(0, parsed.confidence || 0.8)),
            reasoning: parsed.reasoning || "LLM classified",
        };
    } catch (error) {
        console.warn("[IntentRouter] Classification error, using fallback:", error);
        return fallbackClassify(query);
    }
}

/**
 * Generate a direct LLM response for general chat queries
 */
export async function generateDirectResponse(query: string): Promise<string> {
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are an AI assistant for an inventory management system called "AgentHacks IMS".

You can help users with:
1. **Data Queries** - Look up products, warehouses, stock levels, demand history (say "Try asking: show me all products")
2. **Add/Modify Data** - Add new products, warehouses, categories, contacts (say "Try asking: add a product called iPhone")
3. **Inventory Rebalancing** - Optimize stock across warehouses using AI agents (say "Try asking: optimize my inventory")
4. **Supplier Audits** - Analyze vendor performance and contracts (say "Try asking: audit supplier performance")

Be helpful, concise, and friendly. If the user is greeting you, introduce yourself and list your capabilities.
Keep responses to 2-3 sentences max.`,
            prompt: query,
            temperature: 0.7,
            maxOutputTokens: 200,
        });

        return text || "I'm your inventory management assistant. Try asking me to analyze stock levels, optimize inventory, or query your data!";
    } catch {
        return "I'm your inventory management assistant. Ask me about stock levels, rebalancing, or supplier analysis!";
    }
}

/**
 * Fallback regex-based classification when LLM is unavailable
 */
function fallbackClassify(query: string): IntentResult {
    const q = query.toLowerCase();

    // Mutation keywords FIRST (before data_query, since "add product" contains "product")
    if (/\b(add|create|insert|new|update|edit|modify|change|delete|remove)\b/.test(q)) {
        return { intent: "data_mutation", confidence: 0.7, reasoning: "Regex: mutation keywords detected" };
    }

    if (/how many|show me|list all|total|count|average|top \d|which warehouse|what products|display|find all|get all|stock level|demand history|most|least|highest|lowest/.test(q)) {
        return { intent: "data_query", confidence: 0.7, reasoning: "Regex: data query keywords detected" };
    }

    if (/supplier|contract|vendor|audit supplier/.test(q)) {
        return { intent: "supplier_audit", confidence: 0.7, reasoning: "Regex: supplier keywords detected" };
    }

    if (/rebalanc|optimiz|fix stock|low stock|inventory analysis|analyze|check stock|run agent|stock issue/.test(q)) {
        return { intent: "rebalancing", confidence: 0.7, reasoning: "Regex: rebalancing keywords detected" };
    }

    return { intent: "general_chat", confidence: 0.5, reasoning: "Regex: no specific intent matched" };
}
