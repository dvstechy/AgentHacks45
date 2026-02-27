/**
 * PageIndex API Route
 * Provides endpoints for managing supplier contract documents via PageIndex.ai
 * 
 * GET  - List all documents or query supplier contracts
 * POST - Upload a new supplier contract PDF
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
    listDocuments,
    chatWithDocuments,
    findSupplierDocuments,
} from "@/lib/pageindex/client";

// GET: List documents or query contracts
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action") || "list";

        if (action === "list") {
            const limit = parseInt(searchParams.get("limit") || "50");
            const offset = parseInt(searchParams.get("offset") || "0");
            const result = await listDocuments(limit, offset);
            return NextResponse.json(result);
        }

        if (action === "suppliers") {
            const docs = await findSupplierDocuments();
            return NextResponse.json({ documents: docs, count: docs.length });
        }

        if (action === "query") {
            const query = searchParams.get("q");
            const docId = searchParams.get("docId") || undefined;

            if (!query) {
                return NextResponse.json(
                    { error: "Query parameter 'q' is required" },
                    { status: 400 }
                );
            }

            const response = await chatWithDocuments(query, docId);
            return NextResponse.json(response);
        }

        return NextResponse.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
        );
    } catch (error) {
        console.error("PageIndex API error:", error);
        return NextResponse.json(
            {
                error: "PageIndex API error",
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

// POST: Upload a document or query contracts
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = request.headers.get("content-type") || "";

        // Handle JSON queries
        if (contentType.includes("application/json")) {
            const body = await request.json();
            const { query, docId } = body;

            if (!query) {
                return NextResponse.json(
                    { error: "Query is required" },
                    { status: 400 }
                );
            }

            const response = await chatWithDocuments(query, docId);
            return NextResponse.json(response);
        }

        // Handle file uploads
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: "File is required" },
                    { status: 400 }
                );
            }

            const { submitDocument } = await import("@/lib/pageindex/client");
            const buffer = await file.arrayBuffer();
            const result = await submitDocument(buffer, file.name, "mcp");
            return NextResponse.json(result);
        }

        return NextResponse.json(
            { error: "Unsupported content type" },
            { status: 415 }
        );
    } catch (error) {
        console.error("PageIndex upload error:", error);
        return NextResponse.json(
            {
                error: "Upload failed",
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
