/**
 * Streaming API route for Chainlit chatbot integration
 * Streams agent reasoning and audit logs in real-time
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";
import { runMultiAgentSystem } from "@/lib/agents/langgraph-agent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const session = await getSession();
    if (!session?.userId || typeof session.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1];
    if (userMessage.type !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    const traceId = randomUUID() as string;

    // Create a stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial thinking message
          const thinkingMessage = JSON.stringify({
            type: "thinking",
            content: "Analyzing inventory state and determining optimal rebalancing strategy...",
          });
          controller.enqueue(`data: ${thinkingMessage}\n\n`);

          // Run the multi-agent system
          const agentState = await runMultiAgentSystem(session.userId as string, traceId as string);

          // Stream low stock alerts
          if (agentState.lowStockAlerts.length > 0) {
            const alertsMessage = JSON.stringify({
              type: "alerts",
              content: `Found ${agentState.lowStockAlerts.length} low-stock alerts:`,
              data: agentState.lowStockAlerts,
            } as Record<string, unknown>);
            controller.enqueue(`data: ${alertsMessage}\n\n`);
          }

          // Stream each agent's audit log
          for (const log of agentState.auditLogs) {
            const auditMessage = JSON.stringify({
              type: "audit",
              nodeName: log.nodeName,
              reasoningString: log.reasoningString,
              decision: log.decision,
              outputData: log.outputData,
            });
            controller.enqueue(`data: ${auditMessage}\n\n`);

            // Small delay for better streaming effect
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          // Stream final recommendations
          const recommendations = agentState.rebalancingActions
            .filter((a) => a.validationPassed)
            .map((a) => ({
              type: a.type,
              sourceWarehouse: a.sourceWarehouseId,
              destinationWarehouse: a.destinationWarehouseId,
              quantity: a.quantity,
              reason: a.reason,
            }));

          if (recommendations.length > 0) {
            const recMessage = JSON.stringify({
              type: "recommendations",
              content: `Generated ${recommendations.length} rebalancing action(s):`,
              data: recommendations,
            });
            controller.enqueue(`data: ${recMessage}\n\n`);
          }

          // Send completion message
          const completeMessage = JSON.stringify({
            type: "complete",
            content: "Rebalancing analysis complete",
            traceId,
          });
          controller.enqueue(`data: ${completeMessage}\n\n`);

          controller.close();
        } catch (error) {
          const errorMessage = JSON.stringify({
            type: "error",
            content: error instanceof Error ? error.message : "Unknown error",
          });
          controller.enqueue(`data: ${errorMessage}\n\n`);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chainlit API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and capabilities
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    capabilities: {
      streamingChat: true,
      agentAudit: true,
      rebalancing: true,
    },
  });
}
