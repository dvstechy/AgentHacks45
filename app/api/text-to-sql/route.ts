/**
 * Text-to-SQL API Route
 * Accepts natural language questions and returns SQL-backed data
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { runTextToSQLAgent } from "@/lib/agents/text-to-sql";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId || typeof session.userId !== "string") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question } = await request.json();
        if (!question || typeof question !== "string") {
            return NextResponse.json({ error: "No question provided" }, { status: 400 });
        }

        const result = await runTextToSQLAgent(question, session.userId);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Text-to-SQL error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal error" },
            { status: 500 }
        );
    }
}
