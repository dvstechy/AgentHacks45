/**
 * API endpoint to fetch agent audit logs
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const traceId = searchParams.get("traceId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!traceId) {
      return NextResponse.json(
        { error: "traceId parameter required" },
        { status: 400 }
      );
    }

    // Fetch audit logs for the trace
    const logs = await prisma.agentAuditLog.findMany({
      where: {
        traceId,
        userId: session.userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      count: logs.length,
    });
  } catch (error) {
    console.error("Audit logs API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
