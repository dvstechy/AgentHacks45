/**
 * Chat History API Routes
 * GET: List all threads for the current user
 * POST: Create a new thread
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId || typeof session.userId !== "string") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const threads = await db.chatThread.findMany({
            where: { userId: session.userId },
            orderBy: { updatedAt: "desc" },
            take: 20,
            include: {
                _count: { select: { messages: true } },
                messages: {
                    where: { type: "user" },
                    orderBy: { createdAt: "asc" },
                    take: 1,
                    select: { content: true },
                },
            },
        });

        return NextResponse.json({
            threads: threads.map((t: any) => ({
                id: t.id,
                title: t.messages[0]?.content?.slice(0, 60) || t.title,
                messageCount: t._count.messages,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
            })),
        });
    } catch (error) {
        console.error("Chat history error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getSession();
        if (!session?.userId || typeof session.userId !== "string") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const thread = await db.chatThread.create({
            data: {
                userId: session.userId,
                title: "New Conversation",
            },
        });

        return NextResponse.json({ threadId: thread.id });
    } catch (error) {
        console.error("Create thread error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
