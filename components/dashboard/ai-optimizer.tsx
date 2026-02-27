"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Sparkles, 
  Cpu, 
  Network, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  FileSearch,
  ArrowRightLeft,
  Shield,
  MapPin,
  Package,
  Users,
  Building2,
  Clock,
  ChevronRight,
  Copy,
  Download,
  Activity,
  Globe,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AIOptimizerProps {
  userId: string;
}

export function AIOptimizer({ userId }: AIOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const runAI = async () => {
    setLoading(true);
    const res = await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const toggleLog = (index: number) => {
    const newSet = new Set(expandedLogs);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedLogs(newSet);
  };

  const copyTraceId = () => {
    if (result?.traceId) {
      navigator.clipboard.writeText(result.traceId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Clean and modern */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-600/20 rounded-2xl blur-xl" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">AI Inventory Optimizer</h1>
                <Badge variant="outline" className="border-border/50 bg-muted/30 text-muted-foreground text-xs">
                  Multi-Agent
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground/80 mt-0.5">
                Intelligent inventory rebalancing powered by LangGraph
              </p>
            </div>
          </div>

          {/* Agent Pipeline - Simple text links */}
          <div className="flex flex-wrap items-center gap-3 mt-6 text-sm">
            {["Perception", "Geocoding", "Rebalancing", "Arbiter"].map((agent, index) => (
              <div key={agent} className="flex items-center">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
                  {agent}
                </span>
                {index < 3 && <span className="text-muted-foreground/20 mx-2">/</span>}
              </div>
            ))}
          </div>

          {/* Quick Stats - Simple horizontal layout */}
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500/70" />
              <span className="text-muted-foreground">Active Agents: <span className="text-foreground font-medium">5</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500/70" />
              <span className="text-muted-foreground">Analyzed Items: <span className="text-foreground font-medium">1,247</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500/70" />
              <span className="text-muted-foreground">Optimizations: <span className="text-foreground font-medium">86</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="p-6">
          {/* Run Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-foreground">
                <Cpu className="h-5 w-5 text-muted-foreground" />
                Start Optimization
              </h3>
              <p className="text-sm text-muted-foreground/80">
                Run AI analysis to identify surplus inventory and suggest transfers
              </p>
            </div>
            <Button
              onClick={runAI}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Run AI Optimization
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="border-t border-border/50">
            <div className="p-6 space-y-6">
              {/* Header with Trace ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-foreground">Analysis Complete</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="px-2 py-1 rounded bg-muted/30 border border-border/50 font-mono text-muted-foreground">
                    Trace: {result.traceId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={copyTraceId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Actions Grid */}
              {result.actions?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary rounded-full" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Recommended Actions ({result.actions.length})
                    </h4>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.actions.map((action: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center">
                            {action.type === 'transfer' && <ArrowRightLeft className="h-4 w-4 text-blue-500" />}
                            {action.type === 'purchase' && <Package className="h-4 w-4 text-green-500" />}
                            {action.type === 'rebalance' && <Zap className="h-4 w-4 text-orange-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="border-border/50 bg-muted/30 text-muted-foreground">
                                {action.type}
                              </Badge>
                              <span className="text-sm font-bold text-foreground">
                                {action.quantity} units
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground/80 mb-2">
                              {action.reason}
                            </p>
                            {action.selectedSupplierId && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                                <Building2 className="h-3 w-3" />
                                <span>Supplier: {action.selectedSupplierId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Reasoning Trace */}
              {result.auditLogs?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-purple-500 rounded-full" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Reasoning Trace
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {result.auditLogs.map((log: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleLog(i)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {log.nodeName}
                            </span>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
                            expandedLogs.has(i) ? "rotate-90" : ""
                          )} />
                        </button>
                        
                        {expandedLogs.has(i) && (
                          <div className="px-4 pb-3 pt-1 border-t border-border/50">
                            <p className="text-xs text-muted-foreground/80">
                              {log.reasoningString}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/70 border-t border-border/50 pt-4">
        <div className="flex items-center gap-4">
          <span>User ID: {userId.slice(0, 8)}...</span>
          <span>•</span>
          <span>5 Active Agents</span>
        </div>
        <span>Last run: {result ? new Date().toLocaleTimeString() : 'Never'}</span>
      </div>
    </div>
  );
}