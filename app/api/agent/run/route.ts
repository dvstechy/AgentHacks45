import { prisma } from "@/lib/prisma"
import { runMultiAgentSystem } from "@/lib/agents/langgraph-agent";
import { randomUUID } from "crypto";

async function executeAgent() {
  const user = await prisma.user.findFirst({
    where: { email: "bhosvivek123@gmail.com" }
  })

  if (!user) {
    console.log("User not found")
    return { error: "User not found" }
  }

  const traceId = randomUUID();
  try {
    const result = await runMultiAgentSystem(user.id, traceId);
    return {
      message: "Agent executed",
      traceId,
      summary: {
        alerts: result.lowStockAlerts.length,
        actions: result.rebalancingActions.length,
      }
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function GET() {
  const result = await executeAgent()
  if ('error' in result) {
    return Response.json(result, { status: 500 })
  }
  return Response.json({ ...result, message: result.message + " (GET)" })
}

export async function POST() {
  const result = await executeAgent()
  if ('error' in result) {
    return Response.json(result, { status: 500 })
  }
  return Response.json({ ...result, message: result.message + " (POST)" })
}