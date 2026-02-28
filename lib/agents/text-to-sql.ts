/**
 * Text-to-SQL Agent
 * Converts natural language questions into SQL queries,
 * validates and executes them, and returns structured results.
 * 
 * Uses Vercel AI SDK + Groq for query generation with schema-aware prompting.
 * Only allows READ operations (SELECT) for safety.
 */

import { prisma } from "@/lib/prisma";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// ─────────────────────────────────────────────────────────────────
// Schema Definition for LLM Context
// ─────────────────────────────────────────────────────────────────

const DB_SCHEMA = `
PostgreSQL Database Schema (all tables use "public" schema):

TABLE "Product" (
  id TEXT PRIMARY KEY,
  name TEXT,
  sku TEXT,
  description TEXT,
  type TEXT, -- 'STORABLE' | 'CONSUMABLE' | 'SERVICE'
  "unitOfMeasure" TEXT DEFAULT 'Units',
  "costPrice" DECIMAL DEFAULT 0,
  "salesPrice" DECIMAL DEFAULT 0,
  "categoryId" TEXT REFERENCES "Category"(id),
  "minStock" INT DEFAULT 0,
  "maxStock" INT,
  "userId" TEXT REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ
)

TABLE "Category" (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  "parentId" TEXT SELF-REFERENCE,
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "Warehouse" (
  id TEXT PRIMARY KEY,
  name TEXT,
  "shortCode" TEXT,
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  status TEXT, -- 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "Location" (
  id TEXT PRIMARY KEY,
  name TEXT,
  "shortCode" TEXT,
  type TEXT, -- 'VIEW' | 'INTERNAL' | 'CUSTOMER' | 'VENDOR'
  "warehouseId" TEXT REFERENCES "Warehouse"(id),
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "StockLevel" (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES "Product"(id),
  "locationId" TEXT REFERENCES "Location"(id),
  quantity INT DEFAULT 0,
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "StockMove" (
  id TEXT PRIMARY KEY,
  "transferId" TEXT REFERENCES "StockTransfer"(id),
  "productId" TEXT REFERENCES "Product"(id),
  quantity INT,
  "sourceLocationId" TEXT REFERENCES "Location"(id),
  "destinationLocationId" TEXT REFERENCES "Location"(id),
  status TEXT, -- 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED'
  "userId" TEXT REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ
)

TABLE "StockTransfer" (
  id TEXT PRIMARY KEY,
  reference TEXT,
  type TEXT, -- 'INCOMING' | 'OUTGOING' | 'INTERNAL' | 'ADJUSTMENT'
  status TEXT,
  "sourceLocationId" TEXT REFERENCES "Location"(id),
  "destinationLocationId" TEXT REFERENCES "Location"(id),
  "contactId" TEXT REFERENCES "Contact"(id),
  "scheduledDate" TIMESTAMPTZ,
  "effectiveDate" TIMESTAMPTZ,
  "userId" TEXT REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ
)

TABLE "DemandHistory" (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES "Product"(id),
  quantity INT,
  date TIMESTAMPTZ,
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "Contact" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  type TEXT, -- 'VENDOR' | 'CUSTOMER'
  address TEXT,
  "userId" TEXT REFERENCES "User"(id)
)

TABLE "SupplierProfile" (
  id TEXT PRIMARY KEY,
  "contactId" TEXT UNIQUE REFERENCES "Contact"(id),
  "leadTimeDays" INT DEFAULT 3,
  "reliabilityScore" FLOAT DEFAULT 0.95,
  "capacityPerMonth" INT DEFAULT 10000,
  "costPerUnit" DECIMAL DEFAULT 0,
  "userId" TEXT REFERENCES "User"(id)
)

IMPORTANT NOTES:
- All column names with camelCase MUST be double-quoted in SQL, e.g. "userId", "productId"
- Always filter by "userId" = $1 for data isolation
- Use JOINs to connect related tables
- Return meaningful column aliases
`;

// ─────────────────────────────────────────────────────────────────
// Chart Config Type (shared with dynamic-chart component)
// ─────────────────────────────────────────────────────────────────

export interface ChartConfig {
    chartType: "bar" | "line" | "pie" | "doughnut" | "horizontalBar";
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }[];
}

// ─────────────────────────────────────────────────────────────────
// Agent State
// ─────────────────────────────────────────────────────────────────

export interface TextToSQLResult {
    question: string;
    sql: string;
    data: Record<string, any>[];
    summary: string;
    rowCount: number;
    columns: string[];
    chartType: "table" | "bar" | "metric" | "list";
    chartConfig?: ChartConfig | null;
    error?: string;
}

// ─────────────────────────────────────────────────────────────────
// Node 1: Generate SQL from Natural Language
// ─────────────────────────────────────────────────────────────────

async function generateSQL(question: string, userId: string): Promise<{ sql: string; chartType: string }> {
    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are a PostgreSQL SQL expert. Convert the user's question into a safe, read-only SQL query.

${DB_SCHEMA}

RULES:
1. ONLY generate SELECT statements. No INSERT, UPDATE, DELETE, DROP, ALTER, CREATE.
2. ALWAYS filter with WHERE "userId" = '$USER_ID' for security. Use the exact placeholder $USER_ID.
3. Use double quotes for camelCase columns: "userId", "productId", "costPrice", etc.
4. Use meaningful column aliases with AS.
5. Limit results to 50 rows max with LIMIT 50.
6. For aggregations, use GROUP BY and ORDER BY.
7. When JOINing tables, add the "userId" = '$USER_ID' filter on the PRIMARY table only.
8. Return ONLY a JSON object with:
   - "sql": the SQL query string (MUST contain $USER_ID placeholder)
   - "chartType": one of "table", "bar", "metric", "list"
     * "metric" for single-value queries (count, sum, avg)
     * "bar" for grouped aggregations
     * "table" for multi-row multi-column results
     * "list" for name-only lists

Respond with ONLY the JSON object, no markdown, no explanation.`,
        prompt: question,
        temperature: 0,
        maxOutputTokens: 500,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse SQL from LLM response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Replace $USER_ID placeholder with actual userId
    let sql = parsed.sql.replace(/\$USER_ID/g, userId);

    return { sql, chartType: parsed.chartType };
}

// ─────────────────────────────────────────────────────────────────
// Node 2: Validate SQL (security guard)
// ─────────────────────────────────────────────────────────────────

function validateAndCorrectSQL(sql: string, userId: string): { sql: string; valid: boolean; error?: string; corrected?: boolean } {
    const upperSQL = sql.toUpperCase().trim();

    // Block dangerous operations
    const blocked = ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP ", "ALTER ", "CREATE ", "TRUNCATE ", "GRANT ", "REVOKE ", "EXEC "];
    for (const keyword of blocked) {
        if (upperSQL.includes(keyword)) {
            return { sql, valid: false, error: `Blocked: ${keyword.trim()} operation not allowed` };
        }
    }

    // Must start with SELECT or WITH (CTE)
    if (!upperSQL.startsWith("SELECT") && !upperSQL.startsWith("WITH")) {
        return { sql, valid: false, error: "Only SELECT queries are allowed" };
    }

    // AUTO-CORRECTION: If userId is missing, inject it
    if (!sql.includes(userId)) {
        console.log("[Text-to-SQL] Auto-correcting: injecting userId filter");

        // Find the main table and inject WHERE clause
        if (upperSQL.includes("WHERE")) {
            // Add userId filter to existing WHERE clause
            sql = sql.replace(/WHERE/i, `WHERE "userId" = '${userId}' AND`);
        } else if (upperSQL.includes("GROUP BY")) {
            // Insert WHERE before GROUP BY
            sql = sql.replace(/GROUP BY/i, `WHERE "userId" = '${userId}' GROUP BY`);
        } else if (upperSQL.includes("ORDER BY")) {
            // Insert WHERE before ORDER BY
            sql = sql.replace(/ORDER BY/i, `WHERE "userId" = '${userId}' ORDER BY`);
        } else if (upperSQL.includes("LIMIT")) {
            // Insert WHERE before LIMIT
            sql = sql.replace(/LIMIT/i, `WHERE "userId" = '${userId}' LIMIT`);
        } else {
            // Append WHERE at the end
            sql = sql.replace(/;?\s*$/, ` WHERE "userId" = '${userId}'`);
        }

        return { sql, valid: true, corrected: true };
    }

    return { sql, valid: true };
}

// ─────────────────────────────────────────────────────────────────
// Node 3: Execute SQL
// ─────────────────────────────────────────────────────────────────

async function executeSQL(sql: string): Promise<Record<string, any>[]> {
    try {
        const results = await prisma.$queryRawUnsafe(sql);
        return (results as any[]).map((row: any) => {
            const cleaned: Record<string, any> = {};
            for (const [key, val] of Object.entries(row)) {
                cleaned[key] = typeof val === "bigint" ? Number(val) : val;
            }
            return cleaned;
        });
    } catch (error) {
        throw new Error(`SQL Execution Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ─────────────────────────────────────────────────────────────────
// Node 4: Summarize Results
// ─────────────────────────────────────────────────────────────────

async function summarizeResults(
    question: string,
    data: Record<string, any>[],
    columns: string[]
): Promise<string> {
    try {
        if (data.length === 0) return "No results found for your query.";
        if (data.length === 1 && columns.length === 1) return `Result: ${Object.values(data[0])[0]}`;

        const preview = JSON.stringify(data.slice(0, 5), null, 2);

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: "You are an inventory data analyst. Summarize the SQL query results in 1-2 concise sentences. Be specific with numbers and names. Do not use markdown.",
            prompt: `Question: "${question}"\nResults (${data.length} rows):\n${preview}`,
            temperature: 0.3,
            maxOutputTokens: 150,
        });

        return text || `Found ${data.length} result(s).`;
    } catch {
        return `Found ${data.length} result(s) across ${columns.length} column(s).`;
    }
}

// ─────────────────────────────────────────────────────────────────
// Node 5: Generate Chart Config via LLM
// ─────────────────────────────────────────────────────────────────

async function generateChartConfig(
    question: string,
    data: Record<string, any>[],
    columns: string[]
): Promise<ChartConfig | null> {
    if (!data || data.length === 0 || columns.length < 2) return null;

    try {
        const preview = JSON.stringify(data.slice(0, 8), null, 2);

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are a data visualization expert. Given SQL query results, generate a Chart.js config.

Rules:
- Choose the BEST chart type: "bar", "line", "pie", "doughnut", or "horizontalBar"
- Use "pie"/"doughnut" for category distributions (< 8 items)
- Use "bar" for comparing values across categories
- Use "horizontalBar" when labels are long names
- Use "line" for time-series or trend data
- Extract labels from the first text/name column
- Extract data values from numeric columns
- Create a short, descriptive title

Return ONLY a JSON object matching this schema:
{
  "chartType": "bar|line|pie|doughnut|horizontalBar",
  "title": "Chart Title",
  "labels": ["label1", "label2"],
  "datasets": [{"label": "Series Name", "data": [10, 20]}]
}`,
            prompt: `Question: "${question}"\nColumns: ${columns.join(", ")}\nData (${data.length} rows):\n${preview}`,
            temperature: 0,
            maxOutputTokens: 400,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallbackChartConfig(data, columns);

        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.labels || !parsed.datasets || !Array.isArray(parsed.datasets)) {
            return fallbackChartConfig(data, columns);
        }

        return parsed as ChartConfig;
    } catch {
        return fallbackChartConfig(data, columns);
    }
}

function fallbackChartConfig(
    data: Record<string, any>[],
    columns: string[]
): ChartConfig | null {
    if (data.length === 0 || columns.length < 2) return null;

    const labelCol = columns[0];
    const valueCol = columns.find((c, i) => i > 0 && typeof data[0][c] === "number") || columns[1];

    const labels = data.slice(0, 15).map(r => String(r[labelCol] ?? ""));
    const values = data.slice(0, 15).map(r => Number(r[valueCol] ?? 0));

    const chartType = data.length <= 6 ? "doughnut" : labels.some(l => l.length > 15) ? "horizontalBar" : "bar";

    return {
        chartType,
        title: `${valueCol} by ${labelCol}`,
        labels,
        datasets: [{ label: valueCol.replace(/_/g, " "), data: values }],
    };
}

// ─────────────────────────────────────────────────────────────────
// Main Agent Pipeline
// ─────────────────────────────────────────────────────────────────

export async function runTextToSQLAgent(
    question: string,
    userId: string
): Promise<TextToSQLResult> {
    try {
        // Step 1: Generate SQL
        const { sql: rawSQL, chartType } = await generateSQL(question, userId);
        console.log("[Text-to-SQL] Generated:", rawSQL);

        // Step 2: Validate & Auto-Correct (HITL layer)
        const validation = validateAndCorrectSQL(rawSQL, userId);
        if (!validation.valid) {
            return {
                question, sql: rawSQL, data: [], summary: `⚠️ Query rejected: ${validation.error}`,
                rowCount: 0, columns: [], chartType: "table", error: validation.error,
            };
        }

        const sql = validation.sql;
        if (validation.corrected) {
            console.log("[Text-to-SQL] Auto-corrected SQL:", sql);
        }

        // Step 3: Execute (with retry on failure)
        let data: Record<string, any>[];
        try {
            data = await executeSQL(sql);
        } catch (execError) {
            console.warn("[Text-to-SQL] First execution failed, retrying with simplified query");
            // Retry: try without the correction, or with a simpler approach
            try {
                // Generate a simpler fallback query
                const fallbackSQL = generateFallbackSQL(question, userId);
                if (fallbackSQL) {
                    data = await executeSQL(fallbackSQL);
                } else {
                    throw execError;
                }
            } catch {
                throw execError;
            }
        }

        const columns = data.length > 0 ? Object.keys(data[0]) : [];

        // Step 4: Summarize
        const summary = await summarizeResults(question, data, columns);

        // Step 5: Generate Chart Config
        let chartConfig: ChartConfig | null = null;
        if (data.length > 1 && columns.length >= 2) {
            chartConfig = await generateChartConfig(question, data, columns);
        }

        return {
            question, sql, data: data.slice(0, 50), summary,
            rowCount: data.length, columns, chartType: (chartType as any) || "table", chartConfig,
        };
    } catch (error) {
        console.error("[Text-to-SQL] Error:", error);
        return {
            question, sql: "", data: [], summary: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            rowCount: 0, columns: [], chartType: "table",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Fallback: generate a simple query based on keyword detection
 */
function generateFallbackSQL(question: string, userId: string): string | null {
    const q = question.toLowerCase();

    if (q.includes("product")) {
        return `SELECT name, sku, type, "costPrice", "salesPrice", "minStock" FROM "Product" WHERE "userId" = '${userId}' LIMIT 50`;
    }
    if (q.includes("warehouse")) {
        return `SELECT name, "shortCode", address, status FROM "Warehouse" WHERE "userId" = '${userId}' LIMIT 50`;
    }
    if (q.includes("stock level") || q.includes("stock")) {
        return `SELECT p.name AS product, sl.quantity FROM "StockLevel" sl JOIN "Product" p ON p.id = sl."productId" WHERE sl."userId" = '${userId}' LIMIT 50`;
    }
    if (q.includes("category")) {
        return `SELECT name, description FROM "Category" WHERE "userId" = '${userId}' LIMIT 50`;
    }
    if (q.includes("contact") || q.includes("supplier") || q.includes("vendor")) {
        return `SELECT name, email, phone, type FROM "Contact" WHERE "userId" = '${userId}' LIMIT 50`;
    }

    return null;
}
