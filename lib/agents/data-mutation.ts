/**
 * Data Mutation Agent
 * Handles add/create/update/delete operations using Prisma + LLM.
 * Uses Vercel AI SDK + Groq to parse user intent into structured Prisma operations.
 */

import { prisma } from "@/lib/prisma";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

const db = prisma as any;

export interface MutationResult {
    success: boolean;
    operation: string;
    summary: string;
    record?: Record<string, any>;
    error?: string;
}

/**
 * Parse user's mutation request and execute it via Prisma
 */
export async function runDataMutation(
    question: string,
    userId: string
): Promise<MutationResult> {
    try {
        // Step 1: Use LLM to parse the mutation intent into structured data
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are a data mutation parser for an inventory management system.

Parse the user's request into a structured JSON operation.

Available models and their fields:
- Product: { name, sku, description, type ("STORABLE"|"CONSUMABLE"|"SERVICE"), unitOfMeasure, costPrice, salesPrice, minStock, maxStock }
- Category: { name, description }
- Warehouse: { name, shortCode, address, latitude, longitude, status ("ACTIVE"|"MAINTENANCE"|"INACTIVE") }
- Contact: { name, email, phone, type ("VENDOR"|"CUSTOMER"), address }

Rules:
1. For CREATE: extract all mentioned fields. Generate reasonable defaults for missing required fields.
   - For Product: default type is "STORABLE", default unitOfMeasure is "Units", generate a SKU from the name (e.g., "Motorola" → "MOT-001")
   - For Category: just need a name
   - For Warehouse: generate a shortCode from name (e.g., "Downtown Hub" → "DTH")
   - For Contact: need at minimum a name and type
2. For UPDATE: specify which model, the identifying field (usually name), and the fields to update.
3. For DELETE: specify which model and the identifying field.

Return ONLY a JSON object:
{
  "operation": "create" | "update" | "delete",
  "model": "Product" | "Category" | "Warehouse" | "Contact",
  "data": { ...fields },
  "where": { "name": "..." }  // for update/delete only
}`,
            prompt: question,
            temperature: 0,
            maxOutputTokens: 300,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, operation: "unknown", summary: "Could not parse your request. Please be more specific." };
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const { operation, model, data, where } = parsed;

        // Validate model
        const validModels = ["Product", "Category", "Warehouse", "Contact"];
        const modelName = validModels.find(m => m.toLowerCase() === model?.toLowerCase());
        if (!modelName) {
            return {
                success: false,
                operation: operation || "unknown",
                summary: `Unknown model "${model}". Supported: ${validModels.join(", ")}`,
            };
        }

        const prismaModel = modelName.charAt(0).toLowerCase() + modelName.slice(1);

        // Step 2: Execute the operation
        if (operation === "create") {
            const record = await db[prismaModel].create({
                data: {
                    ...data,
                    userId,
                },
            });

            // Convert any non-serializable values
            const cleanRecord = cleanOutput(record);

            return {
                success: true,
                operation: "create",
                summary: `✅ Successfully created new ${modelName}: "${data.name || "record"}"`,
                record: cleanRecord,
            };
        }

        if (operation === "update") {
            // Find the record first
            const existing = await db[prismaModel].findFirst({
                where: { ...where, userId },
            });

            if (!existing) {
                return {
                    success: false,
                    operation: "update",
                    summary: `❌ Could not find ${modelName} matching "${JSON.stringify(where)}"`,
                };
            }

            const record = await db[prismaModel].update({
                where: { id: existing.id },
                data,
            });

            return {
                success: true,
                operation: "update",
                summary: `✅ Successfully updated ${modelName}: "${existing.name || existing.id}"`,
                record: cleanOutput(record),
            };
        }

        if (operation === "delete") {
            const existing = await db[prismaModel].findFirst({
                where: { ...where, userId },
            });

            if (!existing) {
                return {
                    success: false,
                    operation: "delete",
                    summary: `❌ Could not find ${modelName} matching "${JSON.stringify(where)}"`,
                };
            }

            await db[prismaModel].delete({ where: { id: existing.id } });

            return {
                success: true,
                operation: "delete",
                summary: `✅ Successfully deleted ${modelName}: "${existing.name || existing.id}"`,
            };
        }

        return {
            success: false,
            operation: operation || "unknown",
            summary: `Unsupported operation "${operation}". Supported: create, update, delete.`,
        };
    } catch (error) {
        console.error("[DataMutation] Error:", error);
        return {
            success: false,
            operation: "error",
            summary: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

function cleanOutput(record: any): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(record)) {
        if (val instanceof Date) {
            clean[key] = val.toISOString();
        } else if (typeof val === "bigint") {
            clean[key] = Number(val);
        } else {
            clean[key] = val;
        }
    }
    return clean;
}
