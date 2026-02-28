/**
 * SprintStock AI Chatbot - Premium Chainlit UI
 * Built with @chainlit/react-client patterns
 * Features: Streaming SSE, Agent Audit Logs, Smart Message Bubbles
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type ChatMessage,
  type StockAlert,
  type RebalancingRecommendation,
  useAuditLogs,
} from "@/lib/chainlit/hooks";
import { DynamicChart } from "@/components/chainlit/dynamic-chart";
import {
  Send,
  Zap,
  StopCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Bot,
  User,
  Brain,
  Network,
  FileSearch,
  Shield,
  MapPin,
  Package,
  ArrowRightLeft,
  Loader2,
  Sparkles,
  Activity,
  XCircle,
  History,
  Clock,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Node Icon Mapping
// ─────────────────────────────────────────────────────────────────

const NODE_ICONS: Record<string, React.ReactNode> = {
  Perception: <Brain className="w-3.5 h-3.5" />,
  Geocoding: <MapPin className="w-3.5 h-3.5" />,
  Rebalancing: <ArrowRightLeft className="w-3.5 h-3.5" />,
  PageIndex: <FileSearch className="w-3.5 h-3.5" />,
  Arbiter: <Shield className="w-3.5 h-3.5" />,
  "Bulk Optimizer": <Zap className="w-3.5 h-3.5" />,
  "AI Process Summary": <Sparkles className="w-3.5 h-3.5" />,
};

const NODE_COLORS: Record<string, string> = {
  Perception:
    "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800",
  Geocoding:
    "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
  Rebalancing:
    "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
  PageIndex:
    "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
  Arbiter:
    "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
  "Bulk Optimizer":
    "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800",
  "AI Process Summary":
    "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
};

const NODE_BADGE_COLORS: Record<string, string> = {
  Perception: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  Geocoding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Rebalancing: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  PageIndex: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Arbiter: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  "Bulk Optimizer": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "AI Process Summary": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

// ─────────────────────────────────────────────────────────────────
// Starters / Quick Actions
// ─────────────────────────────────────────────────────────────────

const STARTERS = [
  {
    label: "Analyze Low Stock",
    message: "Analyze low stock levels and suggest rebalancing",
    icon: <Package className="w-4 h-4" />,
    color: "from-red-500 to-orange-500",
  },
  {
    label: "Run Rebalancing",
    message: "Check rebalancing options for all warehouses",
    icon: <ArrowRightLeft className="w-4 h-4" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "Supplier Check",
    message: "View supplier status and contract details",
    icon: <Network className="w-4 h-4" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    label: "System Health",
    message: "Run full agent pipeline diagnostic",
    icon: <Activity className="w-4 h-4" />,
    color: "from-emerald-500 to-teal-500",
  },
];

// ─────────────────────────────────────────────────────────────────
// Main Chatbot Component
// ─────────────────────────────────────────────────────────────────

interface ChatbotProps {
  streamState: {
    messages: ChatMessage[];
    isLoading: boolean;
    isConnected: boolean;
    currentTraceId: string | null;
    threads: { id: string; title: string; messageCount: number; updatedAt: string }[];
    sendMessage: (content: string) => Promise<void>;
    stopTask: () => void;
    clearMessages: () => void;
    fetchThreads: () => Promise<void>;
    loadThread: (id: string) => Promise<void>;
  };
}

export function ChainlitChatbot({ streamState }: ChatbotProps) {
  const {
    messages,
    isLoading,
    isConnected,
    currentTraceId,
    threads,
    sendMessage,
    stopTask,
    clearMessages,
    fetchThreads,
    loadThread,
  } = streamState;

  const { logs: auditLogs, fetchLogs } = useAuditLogs(currentTraceId);
  const [input, setInput] = useState("");
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch threads when history panel opens
  useEffect(() => {
    if (showHistory) fetchThreads();
  }, [showHistory, fetchThreads]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch audit logs when trace completes
  useEffect(() => {
    if (
      currentTraceId &&
      messages.some((m) => m.type === "complete" && m.traceId === currentTraceId)
    ) {
      fetchLogs();
    }
  }, [currentTraceId, messages, fetchLogs]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim()) {
        sendMessage(input);
        setInput("");
        inputRef.current?.focus();
      }
    },
    [input, sendMessage]
  );

  const handleStarterClick = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950 dark:to-slate-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${isConnected
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-red-400"
                  }`}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                SprintStock AI
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Processing..."
                  : isConnected
                    ? "LangGraph Agent Ready"
                    : "Reconnecting..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowHistory(!showHistory); setShowAuditPanel(false); }}
              className={`h-8 text-xs gap-1.5 ${showHistory ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'} hover:text-slate-900 dark:hover:text-white`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </Button>
            {currentTraceId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowAuditPanel(!showAuditPanel); setShowHistory(false); }}
                className="h-8 text-xs gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Activity className="w-3.5 h-3.5" />
                Audit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Audit Panel (Slide down) */}
      {showAuditPanel && auditLogs.length > 0 && (
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-3 max-h-48 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Agent Audit Trail — Trace {currentTraceId?.slice(0, 8)}...
          </p>
          <div className="space-y-1.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-xs"
              >
                <Badge
                  variant="outline"
                  className={`text-[10px] flex-shrink-0 ${NODE_BADGE_COLORS[log.nodeName] || ""
                    }`}
                >
                  {log.nodeName}
                </Badge>
                <span className="text-slate-600 dark:text-slate-400 line-clamp-1">
                  {log.decision}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-3 max-h-60 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Past Conversations
          </p>
          {threads.length === 0 ? (
            <p className="text-xs text-slate-400">No history yet. Start a conversation!</p>
          ) : (
            <div className="space-y-1.5">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { loadThread(t.id); setShowHistory(false); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm transition-all group"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.messageCount} messages · {new Date(t.updatedAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <EmptyState onStarterClick={handleStarterClick} />
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isExpanded={expandedNodeId === msg.id}
                onToggleExpand={() =>
                  setExpandedNodeId(
                    expandedNodeId === msg.id ? null : msg.id
                  )
                }
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Agent is processing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 py-3.5">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory, rebalancing, or suppliers..."
                disabled={isLoading}
                className="pr-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 rounded-xl h-11 text-sm transition-all"
              />
            </div>
            {isLoading ? (
              <Button
                type="button"
                onClick={stopTask}
                variant="destructive"
                className="rounded-xl h-11 px-4 gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim()}
                className="rounded-xl h-11 px-4 gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            )}
          </form>

          {/* Quick Actions (when not loading) */}
          {messages.length > 0 && !isLoading && (
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {STARTERS.slice(0, 3).map((starter) => (
                <button
                  key={starter.label}
                  onClick={() => handleStarterClick(starter.message)}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────

function EmptyState({
  onStarterClick,
}: {
  onStarterClick: (message: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      {/* Logo */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
          <Sparkles className="w-9 h-9 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        SprintStock AI Agent
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        Multi-agent inventory intelligence powered by LangGraph. Ask me to
        analyze stock levels, suggest rebalancing, or check suppliers.
      </p>

      {/* Starter Cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {STARTERS.map((starter) => (
          <button
            key={starter.label}
            onClick={() => onStarterClick(starter.message)}
            className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-3.5 text-left hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${starter.color} flex items-center justify-center mb-2.5 text-white shadow-sm group-hover:scale-110 transition-transform`}
            >
              {starter.icon}
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {starter.label}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {starter.message}
            </p>
          </button>
        ))}
      </div>

      {/* Pipeline Info */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <Brain className="w-3 h-3" />
        <span>Perception</span>
        <ChevronRight className="w-3 h-3" />
        <MapPin className="w-3 h-3" />
        <span>Geocoding</span>
        <ChevronRight className="w-3 h-3" />
        <ArrowRightLeft className="w-3 h-3" />
        <span>Rebalance</span>
        <ChevronRight className="w-3 h-3" />
        <Shield className="w-3 h-3" />
        <span>Arbiter</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Message Bubble Component
// ─────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function MessageBubble({
  message,
  isExpanded,
  onToggleExpand,
}: MessageBubbleProps) {
  // User message
  if (message.type === "user") {
    return (
      <div className="flex justify-end gap-2 items-end animate-in slide-in-from-right-2 fade-in duration-300">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] shadow-md shadow-orange-500/10">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        </div>
      </div>
    );
  }

  // Thinking / Processing
  if (message.type === "thinking") {
    return (
      <div className="flex gap-2 items-start animate-in slide-in-from-left-2 fade-in duration-300">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (message.type === "error") {
    return (
      <div className="flex gap-2 items-start animate-in slide-in-from-left-2 fade-in duration-300">
        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/70 dark:border-red-800/50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
          <p className="text-sm text-red-700 dark:text-red-300">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // System message
  if (message.type === "system") {
    return (
      <div className="flex justify-center animate-in fade-in duration-300">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Audit node step
  if (message.type === "audit") {
    const nodeColor = NODE_COLORS[message.nodeName || ""] || "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
    const badgeColor = NODE_BADGE_COLORS[message.nodeName || ""] || "";
    const nodeIcon = NODE_ICONS[message.nodeName || ""] || <Bot className="w-3.5 h-3.5" />;

    return (
      <div className="animate-in slide-in-from-left-2 fade-in duration-300">
        <Card
          className={`cursor-pointer border ${nodeColor} overflow-hidden transition-all hover:shadow-sm`}
          onClick={onToggleExpand}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${badgeColor}`}>
                  {nodeIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${badgeColor}`}
                    >
                      {message.nodeName || "Agent"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {message.reasoningString || message.content}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2.5">
                {message.decision && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {message.decision}
                    </p>
                  </div>
                )}

                {/* ────── VISUAL RENDERERS PER NODE ────── */}

                {/* Perception Node */}
                {message.nodeName === "Perception" && message.outputData && (
                  <div className="space-y-2">
                    {message.outputData.totalStockLevels !== undefined && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{String(message.outputData.totalStockLevels)}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold">Stock Levels</p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-red-500">{String(message.outputData.alertCount ?? message.outputData.lowStockCount ?? 0)}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold">Alerts</p>
                        </div>
                      </div>
                    )}
                    {message.outputData.weatherImpact && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-800/30">
                        <span className="text-sm">🌤️</span>
                        <span className="text-[10px] text-sky-700 dark:text-sky-300">{String(message.outputData.weatherImpact)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Forecast Node */}
                {message.nodeName === "Forecast" && message.outputData && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{String(message.outputData.predictedDemand ?? "—")}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">30d Demand</p>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{String(message.outputData.demandGrowthRate ?? "—")}%</p>
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">Growth</p>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        {(() => {
                          const rl = String(message.outputData.riskLevel ?? "LOW");
                          const color = rl === "HIGH" ? "text-red-500" : rl === "MEDIUM" ? "text-amber-500" : "text-emerald-500";
                          return <p className={`text-sm font-bold ${color}`}>{rl}</p>;
                        })()}
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">Risk</p>
                      </div>
                    </div>
                    {message.outputData.riskScore !== undefined && (
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                          <span>Risk Score</span>
                          <span className="font-bold">{String(message.outputData.riskScore)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${Number(message.outputData.riskScore) > 1.5 ? 'bg-red-500' : Number(message.outputData.riskScore) > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, Number(message.outputData.riskScore) * 40)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Geocoding Node */}
                {message.nodeName === "Geocoding" && message.outputData && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(message.outputData as Record<string, unknown>).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                          {typeof val === 'object' && val !== null ? `${(val as any).lat?.toFixed(2)}, ${(val as any).lon?.toFixed(2)}` : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rebalancing Node */}
                {message.nodeName === "Rebalancing" && message.outputData && (
                  <div className="space-y-1.5">
                    {(message.outputData.actions as any[] ?? []).map((action: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${action?.type === 'INTERNAL_TRANSFER' ? 'bg-purple-500' : action?.type === 'VENDOR_ORDER' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                          {action?.type === 'INTERNAL_TRANSFER' ? '↔️ Transfer' : action?.type === 'VENDOR_ORDER' ? '📦 Vendor Order' : '📉 Overstock'} · {action?.quantity ?? '—'} units
                        </span>
                      </div>
                    ))}
                    {message.outputData.shortage !== undefined && (
                      <div className="text-[10px] text-slate-400">Total shortage: <span className="font-bold text-red-500">{String(message.outputData.shortage)}</span> units</div>
                    )}
                  </div>
                )}

                {/* PageIndex Node */}
                {message.nodeName === "PageIndex" && message.outputData && (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{message.outputData.contractFound ? "✓" : "✗"}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">Contract</p>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{String(message.outputData.leadTime ?? "—")}d</p>
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">Lead Time</p>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{message.outputData.coldChain ? "❄️" : "—"}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-semibold">Cold Chain</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Arbiter Node */}
                {message.nodeName === "Arbiter" && message.outputData && (
                  <div className="space-y-1.5">
                    {(message.outputData.validatedActions as any[] ?? []).map((action: any, i: number) => (
                      <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                          {action?.validationPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {action?.type === 'INTERNAL_TRANSFER' ? 'Transfer' : action?.type === 'VENDOR_ORDER' ? 'Vendor Order' : action?.type} · {action?.quantity ?? 0} units
                          </span>
                        </div>
                        <Badge variant="outline" className={`text-[8px] ${action?.validationPassed ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'}`}>
                          {action?.validationPassed ? 'Validated' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bulk Optimizer Node */}
                {message.nodeName === "Bulk Optimizer" && message.outputData && (
                  <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Parallel processing {String(message.outputData.totalSKUs ?? message.outputData.skuCount ?? "—")} SKUs</p>
                      <p className="text-[9px] text-slate-400">Optimizing across all warehouse routes simultaneously</p>
                    </div>
                  </div>
                )}

                {/* AI Process Summary — SVG Charts */}
                {message.nodeName === "AI Process Summary" && message.outputData && (
                  <div className="space-y-3">
                    {/* Stat Metric Cards */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "SKUs", value: message.outputData.totalSKUsAnalyzed ?? message.outputData.SKUs, color: "text-indigo-500" },
                        { label: "Transfers", value: message.outputData.transferCount, color: "text-purple-500" },
                        { label: "Overstock", value: message.outputData.overstockCount, color: "text-amber-500" },
                        { label: "Vendors", value: message.outputData.vendorCount, color: "text-blue-500" },
                      ].filter(s => s.value !== undefined).map((stat) => (
                        <div key={stat.label} className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-1.5 text-center">
                          <p className={`text-sm font-bold ${stat.color}`}>{String(stat.value)}</p>
                          <p className="text-[7px] text-slate-400 uppercase font-semibold">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 items-center">
                      {/* Risk Donut */}
                      {message.outputData.riskLevel && (
                        <div className="flex flex-col items-center gap-1">
                          <svg width="52" height="52" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="20" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                            <circle
                              cx="26" cy="26" r="20" fill="none"
                              stroke={message.outputData.riskLevel === "HIGH" ? "#ef4444" : message.outputData.riskLevel === "MEDIUM" ? "#f59e0b" : "#10b981"}
                              strokeWidth="6"
                              strokeDasharray={`${((message.outputData.riskLevel === "HIGH" ? 0.85 : message.outputData.riskLevel === "MEDIUM" ? 0.55 : 0.25) * 125.6).toFixed(0)} 125.6`}
                              strokeLinecap="round"
                              transform="rotate(-90 26 26)"
                            />
                            <text x="26" y="29" textAnchor="middle" className="text-[9px] font-bold fill-slate-700 dark:fill-slate-200">
                              {String(message.outputData.riskLevel)}
                            </text>
                          </svg>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">Risk</span>
                        </div>
                      )}

                      {/* Action Breakdown Bar */}
                      {(message.outputData.transferCount !== undefined || message.outputData.overstockCount !== undefined) && (
                        <div className="flex-1">
                          <p className="text-[9px] text-slate-400 font-semibold uppercase mb-1">Action Breakdown</p>
                          <div className="flex h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                            {Number(message.outputData.transferCount) > 0 && (
                              <div className="bg-purple-500 flex items-center justify-center" style={{ width: `${Math.max(25, (Number(message.outputData.transferCount) / Math.max(1, Number(message.outputData.transferCount) + Number(message.outputData.overstockCount) + Number(message.outputData.vendorCount))) * 100)}%` }}>
                                <span className="text-[8px] text-white font-bold">{String(message.outputData.transferCount)} T</span>
                              </div>
                            )}
                            {Number(message.outputData.overstockCount) > 0 && (
                              <div className="bg-amber-500 flex items-center justify-center" style={{ width: `${Math.max(25, (Number(message.outputData.overstockCount) / Math.max(1, Number(message.outputData.transferCount) + Number(message.outputData.overstockCount) + Number(message.outputData.vendorCount))) * 100)}%` }}>
                                <span className="text-[8px] text-white font-bold">{String(message.outputData.overstockCount)} O</span>
                              </div>
                            )}
                            {Number(message.outputData.vendorCount) > 0 && (
                              <div className="bg-blue-500 flex items-center justify-center" style={{ width: `${Math.max(25, (Number(message.outputData.vendorCount) / Math.max(1, Number(message.outputData.transferCount) + Number(message.outputData.overstockCount) + Number(message.outputData.vendorCount))) * 100)}%` }}>
                                <span className="text-[8px] text-white font-bold">{String(message.outputData.vendorCount)} V</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-[8px] text-purple-500">● Transfer</span>
                            <span className="text-[8px] text-amber-500">● Overstock</span>
                            <span className="text-[8px] text-blue-500">● Vendor</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback: Catch-all for unknown nodes — still show prettily, NOT raw JSON */}
                {message.outputData &&
                  Object.keys(message.outputData).length > 0 &&
                  !["AI Process Summary", "Perception", "Forecast", "Geocoding", "Rebalancing", "PageIndex", "Arbiter", "Bulk Optimizer"].includes(message.nodeName || "") && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(message.outputData as Record<string, unknown>).map(([key, val]) => (
                        <div key={key} className="bg-white/60 dark:bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                          <p className="text-[8px] text-slate-400 uppercase font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ─── SQL Query Result ───
  if (message.type === "sql_result") {
    const sqlData = (message.data as any) || {};
    const rows = sqlData.data || [];
    const columns = sqlData.columns || [];
    const chartType = sqlData.chartType || "table";
    const sql = sqlData.sql || "";

    return (
      <div className="animate-in slide-in-from-left-2 fade-in duration-300">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200/70 dark:border-cyan-800/50 overflow-hidden">
          <div className="px-4 py-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <FileSearch className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                SQL Query Result
              </p>
              <Badge variant="outline" className="text-[9px] border-cyan-300 text-cyan-700 dark:text-cyan-300 ml-auto">
                {rows.length} row{rows.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
              {message.content}
            </p>

            {/* ─── Chart.js Visualization ─── */}
            {sqlData.chartConfig && (
              <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-2 mb-3">
                <DynamicChart config={sqlData.chartConfig} />
              </div>
            )}

            {/* Metric View */}
            {chartType === "metric" && rows.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mb-3">
                {Object.entries(rows[0]).map(([key, val]) => (
                  <div key={key} className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{String(val)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{key.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bar Chart View */}
            {chartType === "bar" && rows.length > 0 && columns.length >= 2 && (
              <div className="space-y-1.5 mb-3">
                {rows.slice(0, 10).map((row: any, i: number) => {
                  const label = String(row[columns[0]] ?? "");
                  const value = Number(row[columns[1]] ?? 0);
                  const maxVal = Math.max(...rows.map((r: any) => Number(r[columns[1]] ?? 0)), 1);
                  const width = Math.max(8, (value / maxVal) * 100);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 w-24 truncate text-right font-medium">{label}</span>
                      <div className="flex-1 bg-white/50 dark:bg-slate-700/50 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-[9px] text-white font-bold">{value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {(chartType === "table" || chartType === "list") && rows.length > 0 && (
              <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg overflow-hidden mb-3">
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                        {columns.map((col: string) => (
                          <th key={col} className="px-2.5 py-1.5 text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                            {col.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 20).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20">
                          {columns.map((col: string) => (
                            <td key={col} className="px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
                              {String(row[col] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results */}
            {rows.length === 0 && !sqlData.error && (
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center mb-3">
                <p className="text-xs text-slate-400">No data found for this query</p>
              </div>
            )}

            {/* SQL Code (collapsible) */}
            {sql && (
              <details className="group">
                <summary className="cursor-pointer text-[9px] text-slate-400 hover:text-cyan-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                  View SQL
                </summary>
                <pre className="mt-1.5 text-[10px] bg-slate-900 text-cyan-300 p-2.5 rounded-lg overflow-x-auto font-mono">
                  {sql}
                </pre>
              </details>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Data Mutation Result
  if (message.type === "mutation_result") {
    const mutData = (message.data as any) || {};
    const success = mutData.success;
    const record = mutData.record;

    return (
      <div key={message.id} className="flex justify-start">
        <Card className={`max-w-[85%] p-4 border ${success ? "border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" : "border-red-500/30 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{success ? "✅" : "❌"}</span>
            <span className="font-semibold text-sm">{success ? "Operation Successful" : "Operation Failed"}</span>
            <Badge variant="outline" className={`ml-auto text-[9px] ${success ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600"}`}>
              {mutData.operation?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </div>

          <p className="text-xs leading-relaxed mb-2">{message.content}</p>

          {record && Object.keys(record).length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-[9px] text-slate-400 hover:text-cyan-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                View Record Details
              </summary>
              <div className="mt-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 space-y-1">
                {Object.entries(record)
                  .filter(([k]) => !["userId", "id"].includes(k))
                  .map(([key, val]) => (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">{key}</span>
                      <span className="text-slate-700 dark:text-slate-200 font-mono">{String(val ?? "—")}</span>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </Card>
      </div>
    );
  }

  // Stock Alerts
  if (message.type === "alerts") {
    const alerts = (message.data as StockAlert[]) || [];
    return (
      <div className="animate-in slide-in-from-left-2 fade-in duration-300">
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200/70 dark:border-red-800/50 overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                {message.content}
              </p>
            </div>
            <div className="space-y-1.5">
              {alerts.slice(0, 5).map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/60 dark:bg-red-900/20 px-3 py-1.5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-medium text-red-800 dark:text-red-200">
                      {alert.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-5"
                    >
                      -{alert.shortfall} units
                    </Badge>
                    {alert.warehouseName && (
                      <span className="text-[10px] text-red-600 dark:text-red-400">
                        @ {alert.warehouseName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-[11px] text-red-600 dark:text-red-400 text-center pt-1">
                  +{alerts.length - 5} more alerts
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Recommendations
  if (message.type === "recommendations") {
    const recs = (message.data as RebalancingRecommendation[]) || [];
    return (
      <div className="animate-in slide-in-from-left-2 fade-in duration-300">
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/50 overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {message.content}
              </p>
            </div>
            <div className="space-y-2">
              {recs.map((rec, i) => (
                <div
                  key={i}
                  className="bg-white/60 dark:bg-emerald-900/20 px-3 py-2.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                    >
                      {rec.type === "INTERNAL_TRANSFER"
                        ? "Internal Transfer"
                        : rec.type === "VENDOR_ORDER"
                          ? "Vendor Order"
                          : rec.type}
                    </Badge>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      {rec.quantity} units
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Completion
  if (message.type === "complete") {
    return (
      <div className="animate-in slide-in-from-left-2 fade-in duration-300">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <div>
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              {message.content}
            </span>
            {message.traceId && (
              <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/40 block mt-0.5 font-mono">
                Trace: {message.traceId.slice(0, 12)}...
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default assistant message
  return (
    <div className="flex gap-2 items-start animate-in slide-in-from-left-2 fade-in duration-300">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%] shadow-sm">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}
