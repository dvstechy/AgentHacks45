/**
 * Command Center Client Component
 * Renders the full AI command center with agent pipeline info
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MapPin,
  ArrowRightLeft,
  FileSearch,
  Shield,
  Activity,
  Network,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChainlitChatbot } from "@/components/chainlit/chatbot";
import { useChatStream, type ChatMessage } from "@/lib/chainlit/hooks";
import { useMemo, useState, useEffect } from "react";
import { DemandForecastCard } from "@/components/dashboard/demand-forecast-card";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import dynamic from "next/dynamic";
const InventoryMap = dynamic(
  () =>
    import("@/components/inventory/inventory-map").then(
      (m) => m.InventoryMap
    ),
  { ssr: false }
);
import { getWarehouses } from "@/lib/actions/warehouse";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ── Types ── */
interface AgentMeta {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface AgentWithStatus extends AgentMeta {
  status: "Idle" | "Processing" | "Completed";
}

interface WarehouseRow {
  id: string;
  name: string;
  shortCode: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  capacityStats: Record<string, unknown> | null;
}

interface TransferRecommendation {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  type: "INTERNAL_TRANSFER" | "VENDOR_ORDER";
  quantity: number;
}

/* ── Static agent definitions ── */
const AGENTS: AgentMeta[] = [
  {
    id: "perception",
    name: "Perception",
    icon: Brain,
    description: "Queries stock levels and weather data",
  },
  {
    id: "geocoding",
    name: "Geocoding",
    icon: MapPin,
    description: "Converts warehouse addresses to coordinates",
  },
  {
    id: "rebalancing",
    name: "Rebalancing",
    icon: ArrowRightLeft,
    description: "Finds surplus and suggests transfers",
  },
  {
    id: "pageIndex",
    name: "PageIndex",
    icon: FileSearch,
    description: "Looks up supplier contract data",
  },
  {
    id: "arbiter",
    name: "Arbiter",
    icon: Shield,
    description: "Validates against cold chain and capacity",
  },
];

export function CommandCenterClient() {
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
  } = useChatStream();

  const [dbWarehouses, setDbWarehouses] = useState<WarehouseRow[]>([]);

  // Re-fetch warehouses whenever AI analysis completes
  const hasCompleted = messages.some((m) => m.type === "complete");

  useEffect(() => {
    getWarehouses()
      .then((wh) => setDbWarehouses(wh as WarehouseRow[]))
      .catch(console.error);
  }, [hasCompleted]);

  /* ── Derive agent statuses ── */
  const agents: AgentWithStatus[] = useMemo(() => {
    const auditNodes = messages
      .filter((m) => m.type === "audit")
      .map((m) => m.nodeName?.toLowerCase());

    const isComplete = messages.some((m) => m.type === "complete");
    const lastAuditNode =
      auditNodes.length > 0 ? auditNodes[auditNodes.length - 1] : null;

    return AGENTS.map((agent) => {
      let status: "Idle" | "Processing" | "Completed" = "Idle";

      if (isComplete) {
        status = "Completed";
      } else if (isLoading) {
        if (auditNodes.includes(agent.id.toLowerCase())) {
          status =
            lastAuditNode === agent.id.toLowerCase()
              ? "Processing"
              : "Completed";
        } else if (agent.id === "perception" && auditNodes.length === 0) {
          status = "Processing";
        }
      }

      return { ...agent, status };
    });
  }, [messages, isLoading]);

  /* ── Map data from chat messages ── */
  const mapData = useMemo(() => {
    const transfers: {
      from: [number, number];
      to: [number, number];
      type: "INTERNAL_TRANSFER" | "VENDOR_ORDER";
      quantity: number;
      productName: string;
    }[] = [];

    messages.forEach((m) => {
      if (m.type === "recommendations" && Array.isArray(m.data)) {
        const recs = m.data as TransferRecommendation[];
        recs.forEach((rec) => {
          const fromWh = dbWarehouses.find(
            (w) => w.id === rec.sourceWarehouseId
          );
          const toWh = dbWarehouses.find(
            (w) => w.id === rec.destinationWarehouseId
          );

          if (
            fromWh?.latitude &&
            fromWh?.longitude &&
            toWh?.latitude &&
            toWh?.longitude
          ) {
            transfers.push({
              from: [fromWh.latitude, fromWh.longitude],
              to: [toWh.latitude, toWh.longitude],
              type: rec.type,
              quantity: rec.quantity,
              productName: "Inventory Output",
            });
          }
        });
      }
    });

    return {
      warehouses: dbWarehouses.map((w) => ({
        id: w.id,
        name: w.name,
        shortCode: w.shortCode,
        latitude: w.latitude,
        longitude: w.longitude,
        status: w.status,
        capacityStats: w.capacityStats,
      })),
      transfers,
    };
  }, [messages, dbWarehouses]);

  return (
    <div className="space-y-4">
      {/* ── Main 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Chatbot (takes 3/5) */}
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden h-[620px] sm:h-[680px] flex flex-col border-border/50 bg-card">
            <ChainlitChatbot
              streamState={{
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
              }}
            />
          </Card>
        </div>

        {/* Right: Tabbed panel (takes 2/5) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="network" className="w-full">
            <TabsList className="grid grid-cols-3 mb-3 bg-muted/50 border border-border/50 h-8">
              <TabsTrigger value="network" className="gap-1.5 text-xs py-1">
                <Network className="w-3 h-3" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger
                value="intelligence"
                className="gap-1.5 text-xs py-1"
              >
                <Brain className="w-3 h-3" />
                <span className="hidden sm:inline">Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-1.5 text-xs py-1">
                <Activity className="w-3 h-3" />
                <span className="hidden sm:inline">Ops</span>
              </TabsTrigger>
            </TabsList>

            {/* ── NETWORK TAB ── */}
            <TabsContent value="network" className="space-y-3 mt-0">
              <InventoryMap
                warehouses={mapData.warehouses}
                transfers={mapData.transfers}
                className="h-[360px] sm:h-[420px]"
              />

              {/* Compact pipeline status */}
              <Card className="border-border/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <h3 className="font-medium text-xs">Live Pipeline</h3>
                  </div>
                  {currentTraceId && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {currentTraceId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agents.map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center gap-1 bg-muted/40 border border-border/40 px-2 py-0.5 rounded-md"
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          agent.status === "Processing" &&
                            "bg-amber-500 animate-pulse",
                          agent.status === "Completed" && "bg-emerald-500",
                          agent.status === "Idle" && "bg-muted-foreground/30"
                        )}
                      />
                      <span className="text-[10px]">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* ── INTELLIGENCE TAB ── */}
            <TabsContent value="intelligence" className="space-y-3 mt-0">
              <AIInsightsCard />
              <DemandForecastCard />
            </TabsContent>

            {/* ── OPERATIONS TAB ── */}
            <TabsContent value="operations" className="space-y-3 mt-0">
              {/* Agent detail list */}
              <Card className="border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">Agent Status</h3>
                </div>

                <div className="space-y-2">
                  {agents.map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            agent.status === "Processing" &&
                              "bg-amber-500 animate-pulse",
                            agent.status === "Completed" && "bg-emerald-500",
                            agent.status === "Idle" &&
                              "bg-muted-foreground/30"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            agent.status === "Idle"
                              ? "text-muted-foreground"
                              : "text-foreground font-medium"
                          )}
                        >
                          {agent.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-5",
                          agent.status === "Processing" &&
                            "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          agent.status === "Completed" &&
                            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          agent.status === "Idle" && "opacity-40"
                        )}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System Topology */}
              <Card className="border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">System Topology</h3>
                </div>

                <div className="space-y-1.5">
                  {agents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <div
                        key={agent.name}
                        className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-tight">
                            {agent.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight truncate">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}