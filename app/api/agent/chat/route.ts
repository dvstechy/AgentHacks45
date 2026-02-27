import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, userId } = body as { message: string; userId: string };

        if (!message || !userId) {
            return NextResponse.json(
                { error: "message and userId are required" },
                { status: 400 }
            );
        }

        // TODO: Implement chat agent logic
        return NextResponse.json({
            reply: "Chat agent is not yet implemented.",
        });
    } catch (error) {
        console.error("CHAT AGENT ERROR:", error);
        return NextResponse.json(
            { error: "Chat agent failed", details: String(error) },
            { status: 500 }
        );
    }
}
