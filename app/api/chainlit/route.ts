import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";
import { runMultiAgentSystem } from "@/lib/agents/langgraph-agent";
import { runTextToSQLAgent } from "@/lib/agents/text-to-sql";
import { runDataMutation } from "@/lib/agents/data-mutation";
import { classifyIntent, generateDirectResponse } from "@/lib/agents/intent-router";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const db = prisma as any;

export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const session = await getSession();
    if (!session?.userId || typeof session.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, threadId: existingThreadId } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1];
    if (userMessage.type !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    const traceId = randomUUID() as string;
    const prompt = userMessage.content || "";

    // ─── STEP 1: LLM-BASED INTENT CLASSIFICATION ───
    const intentResult = await classifyIntent(prompt);
    console.log(`[IntentRouter] Intent: ${intentResult.intent} (${intentResult.confidence}) - ${intentResult.reasoning}`);

    // Create or reuse a chat thread
    const threadId = existingThreadId || (await db.chatThread.create({
      data: { userId: session.userId, title: prompt.slice(0, 60) || "New Conversation" },
    })).id;

    // Persist the user message
    await db.chatMessage.create({
      data: { threadId, type: "user", content: prompt },
    });

    // ─── STEP 2: ROUTE TO APPROPRIATE AGENT ───
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ═══════════════════════════════════════════
          // ROUTE: general_chat → Direct LLM Response
          // ═══════════════════════════════════════════
          if (intentResult.intent === "general_chat") {
            const thinkingMsg = JSON.stringify({
              type: "thinking",
              content: "💬 Understanding your question...",
              traceId,
              threadId,
            });
            controller.enqueue(`data: ${thinkingMsg}\n\n`);

            const answer = await generateDirectResponse(prompt);

            const assistantMsg = JSON.stringify({
              type: "assistant",
              content: answer,
              traceId,
            });
            controller.enqueue(`data: ${assistantMsg}\n\n`);

            await db.chatMessage.create({
              data: { threadId, type: "assistant", content: answer, traceId },
            }).catch(() => { });

            const completeMsg = JSON.stringify({ type: "complete", content: "Response complete", traceId });
            controller.enqueue(`data: ${completeMsg}\n\n`);
            controller.close();
            return;
          }

          // ═══════════════════════════════════════════
          // ROUTE: data_mutation → Prisma Create/Update/Delete
          // ═══════════════════════════════════════════
          if (intentResult.intent === "data_mutation") {
            const thinkingMsg = JSON.stringify({
              type: "thinking",
              content: "✏️ Processing your data request...",
              traceId,
              threadId,
            });
            controller.enqueue(`data: ${thinkingMsg}\n\n`);

            const mutationResult = await runDataMutation(prompt, session.userId as string);

            const resultMsg = JSON.stringify({
              type: "mutation_result",
              content: mutationResult.summary,
              data: mutationResult,
              traceId,
            });
            controller.enqueue(`data: ${resultMsg}\n\n`);

            await db.chatMessage.create({
              data: {
                threadId,
                type: "mutation_result",
                content: mutationResult.summary,
                traceId,
                metadata: { operation: mutationResult.operation, success: mutationResult.success, record: mutationResult.record },
              },
            }).catch(() => { });

            const completeMsg2 = JSON.stringify({ type: "complete", content: "Operation complete", traceId });
            controller.enqueue(`data: ${completeMsg2}\n\n`);
            controller.close();
            return;
          }

          // ═══════════════════════════════════════════
          // ROUTE: data_query → Text-to-SQL Agent
          // ═══════════════════════════════════════════
          if (intentResult.intent === "data_query") {
            const thinkingMsg = JSON.stringify({
              type: "thinking",
              content: "🔍 Analyzing your question and generating SQL query...",
              traceId,
              threadId,
            });
            controller.enqueue(`data: ${thinkingMsg}\n\n`);

            const sqlResult = await runTextToSQLAgent(prompt, session.userId as string);

            const resultMsg = JSON.stringify({
              type: "sql_result",
              content: sqlResult.summary,
              data: sqlResult,
              traceId,
            });
            controller.enqueue(`data: ${resultMsg}\n\n`);

            await db.chatMessage.create({
              data: {
                threadId,
                type: "sql_result",
                content: sqlResult.summary,
                traceId,
                metadata: { sql: sqlResult.sql, chartType: sqlResult.chartType, rowCount: sqlResult.rowCount },
              },
            }).catch(() => { });

            const completeMsg = JSON.stringify({ type: "complete", content: "Query complete", traceId });
            controller.enqueue(`data: ${completeMsg}\n\n`);
            controller.close();
            return;
          }

          // ═══════════════════════════════════════════
          // ROUTE: rebalancing / supplier_audit → Multi-Agent System
          // ═══════════════════════════════════════════
          const isSupplierMode = intentResult.intent === "supplier_audit";

          const thinkingMessage = JSON.stringify({
            type: "thinking",
            content: isSupplierMode
              ? "🔎 Auditing supplier networks and analyzing contract performance... [Context Aware]"
              : "⚙️ Analyzing inventory state and determining optimal rebalancing strategy... [Context Aware]",
            traceId,
            threadId,
          });
          controller.enqueue(`data: ${thinkingMessage}\n\n`);

          // Run the multi-agent system with real-time log streaming
          const agentState = await runMultiAgentSystem(
            session.userId as string,
            traceId as string,
            prompt,
            async (log) => {
              console.log(`[SSE] Streaming Audit Log: ${log.nodeName}`);
              const auditMessage = JSON.stringify({
                type: "audit",
                nodeName: log.nodeName,
                reasoningString: log.reasoningString,
                decision: log.decision,
                outputData: log.outputData,
                traceId,
              });
              controller.enqueue(`data: ${auditMessage}\n\n`);

              await db.chatMessage.create({
                data: {
                  threadId,
                  type: "audit",
                  content: log.reasoningString || "",
                  traceId,
                  metadata: { nodeName: log.nodeName, decision: log.decision, outputData: log.outputData },
                },
              }).catch(() => { });
            }
          );

          // Stream final recommendations
          const recommendations = agentState.rebalancingActions
            .filter((a: any) => a.validationPassed)
            .map((a: any) => ({
              type: a.type,
              sourceWarehouseId: a.sourceWarehouseId,
              destinationWarehouseId: a.destinationWarehouseId,
              quantity: a.quantity,
              reason: a.reason,
            }));

          if (recommendations.length > 0) {
            const recMessage = JSON.stringify({
              type: "recommendations",
              content: `Generated ${recommendations.length} rebalancing action(s):`,
              data: recommendations,
              traceId,
            });
            controller.enqueue(`data: ${recMessage}\n\n`);

            await db.chatMessage.create({
              data: {
                threadId,
                type: "recommendations",
                content: `Generated ${recommendations.length} rebalancing action(s)`,
                traceId,
                metadata: { recommendations },
              },
            }).catch(() => { });
          }

          // Send completion
          const completeContent = isSupplierMode ? "Supplier audit complete" : "Rebalancing analysis complete";
          const completeMessage = JSON.stringify({
            type: "complete",
            content: completeContent,
            traceId,
          });
          controller.enqueue(`data: ${completeMessage}\n\n`);

          await db.chatMessage.create({
            data: { threadId, type: "complete", content: completeContent, traceId },
          }).catch(() => { });

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
      intentRouter: true,
      streamingChat: true,
      textToSQL: true,
      agentAudit: true,
      rebalancing: true,
      supplierAudit: true,
    },
  });
}
