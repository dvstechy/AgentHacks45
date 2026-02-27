import { runMultiAgentSystem } from "@/lib/agents/langgraph-agent";
import { randomUUID } from "crypto";

export async function GET() {
  const userId = "cmm4lmteq0000rzepq19zanls";
  const traceId = randomUUID();
  
  try {
    const result = await runMultiAgentSystem(userId, traceId);
    return Response.json({ 
      message: "Agent executed (GET)",
      traceId,
      summary: {
        alerts: result.lowStockAlerts.length,
        actions: result.rebalancingActions.length,
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const userId = "cmm4lmteq0000rzepq19zanls";
  const traceId = randomUUID();
  
  try {
    const result = await runMultiAgentSystem(userId, traceId);
    return Response.json({ 
      message: "Agent executed (POST)",
      traceId,
      summary: {
        alerts: result.lowStockAlerts.length,
        actions: result.rebalancingActions.length,
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}