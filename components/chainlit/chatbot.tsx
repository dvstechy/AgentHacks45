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
    sendMessage: (content: string) => Promise<void>;
    stopTask: () => void;
    clearMessages: () => void;
  };
}

export function ChainlitChatbot({ streamState }: ChatbotProps) {
  const {
    messages,
    isLoading,
    isConnected,
    currentTraceId,
    sendMessage,
    stopTask,
    clearMessages,
  } = streamState;

  const { logs: auditLogs, fetchLogs } = useAuditLogs(currentTraceId);
  const [input, setInput] = useState("");
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
            {currentTraceId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuditPanel(!showAuditPanel)}
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
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Decision
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {message.decision}
                    </p>
                  </div>
                )}
                {message.outputData &&
                  Object.keys(message.outputData).length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Output Data
                      </p>
                      <pre className="text-[11px] bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg overflow-auto max-h-40 font-mono text-slate-600 dark:text-slate-400">
                        {JSON.stringify(message.outputData, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>
            )}
          </div>
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
