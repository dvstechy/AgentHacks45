import { NextResponse } from "next/server";
import { runMultiAgentSystem } from "@/lib/agents/langgraph-agent";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const traceId = crypto.randomUUID();

    const result = await runMultiAgentSystem(userId, traceId, "Run full inventory analysis and rebalancing");

    return NextResponse.json({
      traceId,
      alerts: result.lowStockAlerts,
      actions: result.rebalancingActions,
      auditLogs: result.auditLogs,
      impactMetrics: result.impactMetrics,
    });

  } catch (error) {
    console.error("AGENT ERROR:", error);
    return NextResponse.json(
      { error: "Agent execution failed", details: String(error) },
      { status: 500 }
    );
  }
}