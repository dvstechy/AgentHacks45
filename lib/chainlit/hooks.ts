/**
 * Custom Chainlit Chat Hooks
 * Bridges the @chainlit/react-client patterns with our Next.js streaming API
 * Provides useChatStream, useAuditLogs hooks for the SprintStock AI system
 */

"use client";

import { useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    type:
    | "user"
    | "assistant"
    | "thinking"
    | "audit"
    | "alerts"
    | "recommendations"
    | "complete"
    | "error"
    | "system"
    | "sql_result"
    | "mutation_result";
    content: string;
    nodeName?: string;
    reasoningString?: string;
    decision?: string;
    outputData?: Record<string, any>;
    data?: unknown;
    traceId?: string;
    timestamp: Date;
    streaming?: boolean;
}

export interface StockAlert {
    productId: string;
    productName: string;
    sku: string;
    currentQuantity: number;
    minStock: number;
    shortfall: number;
    warehouseId?: string;
    warehouseName?: string;
}

export interface RebalancingRecommendation {
    type: "INTERNAL_TRANSFER" | "VENDOR_ORDER" | "NONE";
    sourceWarehouse?: string;
    destinationWarehouse?: string;
    quantity: number;
    reason: string;
    validationPassed?: boolean;
    constraints?: string[];
}

export interface AuditLogEntry {
    id: string;
    traceId: string;
    nodeName: string;
    inputData: Record<string, unknown>;
    outputData: Record<string, any>;
    reasoningString: string;
    decision: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────
// useChatStream Hook
// ─────────────────────────────────────────────────────────────────

export function useChatStream() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [currentTraceId, setCurrentTraceId] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [threads, setThreads] = useState<{ id: string; title: string; messageCount: number; updatedAt: string }[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const fetchThreads = useCallback(async () => {
        try {
            const res = await fetch("/api/chat-history");
            if (res.ok) {
                const data = await res.json();
                setThreads(data.threads || []);
            }
        } catch (e) {
            console.error("Failed to fetch threads:", e);
        }
    }, []);

    const loadThread = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/chat-history/${id}`);
            if (res.ok) {
                const data = await res.json();
                const restored: ChatMessage[] = (data.thread?.messages || []).map((m: any) => ({
                    id: m.id,
                    type: m.type,
                    content: m.content,
                    nodeName: m.metadata?.nodeName,
                    reasoningString: m.content,
                    decision: m.metadata?.decision,
                    outputData: m.metadata?.outputData,
                    data: m.metadata?.recommendations,
                    traceId: m.traceId,
                    timestamp: new Date(m.createdAt),
                }));
                setMessages(restored);
                setThreadId(id);
                setCurrentTraceId(restored.find(m => m.traceId)?.traceId || null);
            }
        } catch (e) {
            console.error("Failed to load thread:", e);
        }
    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            // Add user message
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                type: "user",
                content: content.trim(),
                timestamp: new Date(),
            };
            addMessage(userMessage);
            setIsLoading(true);

            // Create abort controller for cancellation
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                const response = await fetch("/api/chainlit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        threadId,
                        messages: [
                            ...messages
                                .filter((m) => m.type === "user" || m.type === "assistant")
                                .map((m) => ({
                                    type: m.type === "user" ? "user" : "assistant",
                                    content: m.content,
                                })),
                            { type: "user", content: content.trim() },
                        ],
                    }),
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                // Parse SSE stream
                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

                                // Track trace ID
                                if (data.traceId) {
                                    setCurrentTraceId(data.traceId);
                                }

                                // Track thread ID from server
                                if (data.threadId) {
                                    setThreadId(data.threadId);
                                }

                                const newMessage: ChatMessage = {
                                    id: messageId,
                                    timestamp: new Date(),
                                    type: data.type || "assistant",
                                    content: data.content || "",
                                    nodeName: data.nodeName,
                                    reasoningString: data.reasoningString,
                                    decision: data.decision,
                                    outputData: data.outputData,
                                    data: data.data,
                                    traceId: data.traceId,
                                    streaming: data.type === "thinking",
                                };

                                addMessage(newMessage);
                            } catch {
                                console.warn("Failed to parse SSE data:", line);
                            }
                        }
                    }
                }

                // Refresh threads list after completion
                fetchThreads();
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    addMessage({
                        id: `abort-${Date.now()}`,
                        type: "system",
                        content: "Request cancelled",
                        timestamp: new Date(),
                    });
                } else {
                    addMessage({
                        id: `error-${Date.now()}`,
                        type: "error",
                        content:
                            error instanceof Error
                                ? error.message
                                : "Failed to process request",
                        timestamp: new Date(),
                    });
                }
                setIsConnected(false);
                setTimeout(() => setIsConnected(true), 3000);
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [messages, isLoading, addMessage, threadId, fetchThreads]
    );

    const stopTask = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentTraceId(null);
        setThreadId(null);
    }, []);

    return {
        messages,
        isLoading,
        isConnected,
        currentTraceId,
        threadId,
        threads,
        sendMessage,
        stopTask,
        clearMessages,
        addMessage,
        fetchThreads,
        loadThread,
    };
}

// ─────────────────────────────────────────────────────────────────
// useAuditLogs Hook
// ─────────────────────────────────────────────────────────────────

export function useAuditLogs(traceId: string | null) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        if (!traceId) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/audit-logs?traceId=${encodeURIComponent(traceId)}`
            );
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setIsLoading(false);
        }
    }, [traceId]);

    return { logs, isLoading, fetchLogs };
}
