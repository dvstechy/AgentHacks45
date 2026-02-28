"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface AuditLog {
  id: string;
  traceId: string;
  nodeName: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  reasoningString: string;
  decision: string;
  createdAt: Date;
}

interface AuditFeedProps {
  traceId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onLogClick?: (log: AuditLog) => void;
}

export function AuditFeed({
  traceId,
  autoRefresh = true,
  refreshInterval = 3000,
  onLogClick,
}: AuditFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!traceId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/audit-logs?traceId=${traceId}`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, refreshInterval);
    return () => clearInterval(interval);
  }, [traceId, autoRefresh, refreshInterval]);

  if (!traceId) {
    return (
      <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No trace selected</p>
      </Card>
    );
  }

  const nodeColors: Record<string, string> = {
    Perception: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    Forecast: "bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
    Geocoding: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
    Rebalancing: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    PageIndex: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    Arbiter: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
  };

  const nodeBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Perception: "default",
    Forecast: "secondary",
    Geocoding: "secondary",
    Rebalancing: "outline",
    PageIndex: "outline",
    Arbiter: "outline",
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Agent Audit Trail</h3>
        {isLoading && (
          <div className="flex items-center gap-1">
            <Loader className="w-3 h-3 animate-spin" />
            <span className="text-xs text-gray-500">Refreshing...</span>
          </div>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {logs.length} log{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Trace ID */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs font-mono">
        <span className="text-gray-600 dark:text-gray-400">Trace:</span>
        <span className="text-gray-800 dark:text-gray-200">{traceId}</span>
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">No audit logs yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log, index) => (
            <AuditLogCard
              key={log.id}
              log={log}
              isExpanded={expandedId === log.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === log.id ? null : log.id)
              }
              onLogClick={onLogClick}
              backgroundColor={nodeColors[log.nodeName] || "bg-gray-50 dark:bg-gray-900"}
              badgeVariant={nodeBadgeVariants[log.nodeName] || "default"}
              stepNumber={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AuditLogCardProps {
  log: AuditLog;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLogClick?: (log: AuditLog) => void;
  backgroundColor: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  stepNumber: number;
}

function AuditLogCard({
  log,
  isExpanded,
  onToggleExpand,
  onLogClick,
  backgroundColor,
  badgeVariant,
  stepNumber,
}: AuditLogCardProps) {
  return (
    <Card className={`border ${backgroundColor} transition-colors`}>
      <button
        onClick={onToggleExpand}
        className="w-full text-left p-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-start gap-3">
          {/* Step number */}
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 text-xs font-semibold">
            {stepNumber}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={badgeVariant}>{log.nodeName}</Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(log.createdAt), "HH:mm:ss")}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {log.reasoningString}
            </p>
          </div>

          {/* Expand icon */}
          <div className="flex-shrink-0 text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Decision */}
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Decision
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {log.decision}
              </p>
            </div>

            {/* Input Data */}
            {Object.keys(log.inputData).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Input
                </p>
                <pre className="text-xs bg-white dark:bg-slate-900 p-2 rounded overflow-auto max-h-32 border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(log.inputData, null, 2)}
                </pre>
              </div>
            )}

            {/* Output Data */}
            {Object.keys(log.outputData).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Output
                </p>
                <pre className="text-xs bg-white dark:bg-slate-900 p-2 rounded overflow-auto max-h-32 border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(log.outputData, null, 2)}
                </pre>
              </div>
            )}

            {/* Action button */}
            {onLogClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogClick(log);
                }}
                className="mt-2 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                View Details
              </button>
            )}
          </div>
        )}
      </button>
    </Card>
  );
}
