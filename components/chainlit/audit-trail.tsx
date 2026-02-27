/**
 * Agent Audit Trail Viewer
 * Displays a visual timeline of agent node executions
 * Connected to the audit-logs API
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Brain,
    MapPin,
    ArrowRightLeft,
    FileSearch,
    Shield,
    Clock,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Activity,
} from "lucide-react";

interface AuditLog {
    id: string;
    traceId: string;
    nodeName: string;
    inputData: Record<string, unknown>;
    outputData: Record<string, unknown>;
    reasoningString: string;
    decision: string;
    createdAt: string;
}

const NODE_META: Record<
    string,
    { icon: React.ReactNode; color: string; label: string }
> = {
    Perception: {
        icon: <Brain className="w-4 h-4" />,
        color: "text-violet-500 bg-violet-100 dark:bg-violet-900/40",
        label: "Perception",
    },
    Geocoding: {
        icon: <MapPin className="w-4 h-4" />,
        color: "text-blue-500 bg-blue-100 dark:bg-blue-900/40",
        label: "Geocoding",
    },
    Rebalancing: {
        icon: <ArrowRightLeft className="w-4 h-4" />,
        color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40",
        label: "Rebalancing",
    },
    PageIndex: {
        icon: <FileSearch className="w-4 h-4" />,
        color: "text-amber-500 bg-amber-100 dark:bg-amber-900/40",
        label: "Supplier Lookup",
    },
    Arbiter: {
        icon: <Shield className="w-4 h-4" />,
        color: "text-rose-500 bg-rose-100 dark:bg-rose-900/40",
        label: "Arbiter",
    },
};

interface AuditTrailProps {
    traceId?: string | null;
}

export function AuditTrail({ traceId }: AuditTrailProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    useEffect(() => {
        if (traceId) fetchLogs();
    }, [traceId, fetchLogs]);

    if (!traceId) {
        return (
            <Card className="p-6 text-center">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Run an agent analysis to see the audit trail
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Agent Audit Trail
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Trace: {traceId.slice(0, 12)}...
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchLogs}
                    disabled={isLoading}
                    className="h-7 text-xs"
                >
                    <RefreshCw
                        className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[17px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-300 via-emerald-300 to-rose-300 dark:from-violet-700 dark:via-emerald-700 dark:to-rose-700" />

                <div className="space-y-3">
                    {logs.map((log, index) => {
                        const meta = NODE_META[log.nodeName] || {
                            icon: <Activity className="w-4 h-4" />,
                            color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
                            label: log.nodeName,
                        };
                        const isExpanded = expandedId === log.id;

                        return (
                            <div key={log.id} className="relative flex gap-3 pl-1">
                                {/* Node Icon */}
                                <div
                                    className={`z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}
                                >
                                    {meta.icon}
                                </div>

                                {/* Content */}
                                <Card
                                    className="flex-1 cursor-pointer hover:shadow-sm transition-shadow"
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : log.id)
                                    }
                                >
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px]">
                                                    Node {index + 1}
                                                </Badge>
                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {log.reasoningString}
                                        </p>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                        Decision
                                                    </p>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300">
                                                        {log.decision}
                                                    </p>
                                                </div>
                                                {Object.keys(log.outputData || {}).length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                            Output
                                                        </p>
                                                        <pre className="text-[11px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg overflow-auto max-h-32 font-mono text-slate-600 dark:text-slate-400">
                                                            {JSON.stringify(log.outputData, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
