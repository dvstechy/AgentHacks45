/**
 * Chat Thread Detail API
 * GET: Fetch all messages in a thread
 * DELETE: Delete a thread
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.userId || typeof session.userId !== "string") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threadId } = await params;

        const thread = await db.chatThread.findFirst({
            where: { id: threadId, userId: session.userId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!thread) {
            return NextResponse.json({ error: "Thread not found" }, { status: 404 });
        }

        return NextResponse.json({
            thread: {
                id: thread.id,
                title: thread.title,
                messages: thread.messages.map((m: any) => ({
                    id: m.id,
                    type: m.type,
                    content: m.content,
                    metadata: m.metadata,
                    traceId: m.traceId,
                    createdAt: m.createdAt,
                })),
            },
        });
    } catch (error) {
        console.error("Thread detail error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.userId || typeof session.userId !== "string") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threadId } = await params;

        await db.chatThread.deleteMany({
            where: { id: threadId, userId: session.userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete thread error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
