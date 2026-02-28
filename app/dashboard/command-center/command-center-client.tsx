/**
 * Command Center Client Component
 * Renders the full AI command center with agent pipeline info
 * TODO: Re-add Chainlit chatbot once @chainlit/react-client is installed
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    Brain,
    MapPin,
    ArrowRightLeft,
    FileSearch,
    Shield,
    Sparkles,
    MessageSquare,
    AlertCircle,
    Cpu,
    Activity,
    Globe,
    Network,
    Bot,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChainlitChatbot } from "@/components/chainlit/chatbot";
import { useChatStream } from "@/lib/chainlit/hooks";
import { useMemo, useState, useEffect } from "react";
import { DemandForecastCard } from "@/components/dashboard/demand-forecast-card";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import dynamic from "next/dynamic";
const InventoryMap = dynamic(() => import("@/components/inventory/inventory-map").then(m => m.InventoryMap), { ssr: false });
import { getWarehouses } from "@/lib/actions/warehouse";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

    const [dbWarehouses, setDbWarehouses] = useState<any[]>([]);

    // Re-fetch warehouses whenever AI analysis completes (coordinates may have been seeded during the run)
    const hasCompleted = messages.some((m: any) => m.type === "complete");

    useEffect(() => {
        getWarehouses().then(setDbWarehouses).catch(console.error);
    }, [hasCompleted]);

    const agentsData = [
        { id: "perception", name: "Perception", icon: Brain, color: "violet", description: "Queries stock levels and weather data" },
        { id: "geocoding", name: "Geocoding", icon: MapPin, color: "blue", description: "Converts warehouse addresses to coordinates" },
        { id: "rebalancing", name: "Rebalancing", icon: ArrowRightLeft, color: "emerald", description: "Finds surplus and suggests transfers" },
        { id: "pageIndex", name: "PageIndex", icon: FileSearch, color: "amber", description: "Looks up supplier contract data" },
        { id: "arbiter", name: "Arbiter", icon: Shield, color: "rose", description: "Validates against cold chain and capacity" },
    ];

    // Determine status for each agent
    const agents = useMemo(() => {
        // Find all "audit" messages in the current stream
        const auditNodes = messages
            .filter((m: any) => m.type === "audit")
            .map((m: any) => m.nodeName?.toLowerCase());

        const isComplete = messages.some((m: any) => m.type === "complete");
        const lastAuditNode = auditNodes.length > 0 ? auditNodes[auditNodes.length - 1] : null;

        return agentsData.map((agent) => {
            let status: "Idle" | "Processing" | "Completed" = "Idle";

            if (isComplete) {
                status = "Completed";
            } else if (isLoading) {
                if (auditNodes.includes(agent.id.toLowerCase())) {
                    // Check if it's the *current* one or a previous one
                    if (lastAuditNode === agent.id.toLowerCase()) {
                        status = "Processing";
                    } else {
                        status = "Completed";
                    }
                } else if (agent.id === "perception" && auditNodes.length === 0) {
                    // Perception is usually first
                    status = "Processing";
                }
            }

            return { ...agent, status };
        });
    }, [messages, isLoading, agentsData]);

    // Derive transfers for the map from messages
    const mapData = useMemo(() => {
        const transfers: any[] = [];

        // Look for recommendations or audit logs with transfer data
        messages.forEach((m: any) => {
            if (m.type === "recommendations" && Array.isArray(m.data)) {
                console.log("[MAP DEBUG] Recommendations found:", m.data);
                console.log("[MAP DEBUG] dbWarehouses:", dbWarehouses.map(w => ({ id: w.id, name: w.name, lat: w.latitude, lon: w.longitude })));

                m.data.forEach((rec: any) => {
                    const fromWh = dbWarehouses.find(w => w.id === rec.sourceWarehouseId);
                    const toWh = dbWarehouses.find(w => w.id === rec.destinationWarehouseId);

                    console.log(`[MAP DEBUG] Transfer: ${rec.type} | From: ${fromWh?.name} (${fromWh?.latitude},${fromWh?.longitude}) | To: ${toWh?.name} (${toWh?.latitude},${toWh?.longitude})`);

                    if (fromWh?.latitude && fromWh?.longitude && toWh?.latitude && toWh?.longitude) {
                        transfers.push({
                            from: [fromWh.latitude, fromWh.longitude],
                            to: [toWh.latitude, toWh.longitude],
                            type: rec.type,
                            quantity: rec.quantity,
                            productName: "Inventory Output" // Simplified
                        });
                    } else {
                        console.warn("[MAP DEBUG] Missing coordinates, line NOT drawn.", { fromWh, toWh });
                    }
                });
            }
        });

        return {
            warehouses: dbWarehouses.map(w => ({
                id: w.id,
                name: w.name,
                shortCode: w.shortCode,
                latitude: w.latitude,
                longitude: w.longitude,
                status: w.status,
                capacityStats: w.capacityStats
            })),
            transfers
        };
    }, [messages, dbWarehouses]);

    return (
        <div className="space-y-6">

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Real AI Chatbot Interface */}
                <div className="lg:col-span-2">
                    <Card className="relative overflow-hidden h-[600px] flex flex-col shadow-xl border-border/50 bg-card overflow-hidden">
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

                {/* Right: Info Panel - Redesigned with AI Intelligence Tabs */}
                <div className="space-y-5">
                    <Tabs defaultValue="network" className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4 bg-muted/50 backdrop-blur-sm border border-border/50">
                            <TabsTrigger value="network" className="gap-2">
                                <Network className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Network</span>
                            </TabsTrigger>
                            <TabsTrigger value="intelligence" className="gap-2">
                                <Brain className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Intelligence</span>
                            </TabsTrigger>
                            <TabsTrigger value="operations" className="gap-2">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ops</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* LIVE NETWORK TAB */}
                        <TabsContent value="network" className="space-y-4">
                            <InventoryMap
                                warehouses={mapData.warehouses}
                                transfers={mapData.transfers}
                                className="h-[400px] sm:h-[500px]"
                            />

                            {/* Agent Status (Compact) - Grouped with Network for flow */}
                            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-semibold text-xs tracking-wider uppercase">Live Pipeline</h3>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-4">
                                        Active Trace: {currentTraceId?.slice(0, 8)}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {agents.map((agent) => (
                                        <div key={agent.name} className="flex items-center gap-1.5 bg-background/50 border border-border/50 px-2 py-1 rounded-md">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                agent.status === "Processing" ? "bg-amber-500 animate-pulse" :
                                                    agent.status === "Completed" ? "bg-emerald-500" : "bg-slate-300"
                                            )} />
                                            <span className="text-[10px] whitespace-nowrap">{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </TabsContent>

                        {/* AI INTELLIGENCE TAB */}
                        <TabsContent value="intelligence" className="space-y-5">
                            <AIInsightsCard />
                            <DemandForecastCard />
                        </TabsContent>

                        {/* OPERATIONS TAB */}
                        <TabsContent value="operations" className="space-y-5">
                            {/* Full Status Card */}
                            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h3 className="font-semibold text-sm">Detailed Agent Status</h3>
                                </div>

                                <div className="space-y-3">
                                    {agents.map((agent) => (
                                        <div key={agent.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full transition-all duration-300",
                                                    agent.status === "Processing" ? "bg-amber-500 animate-pulse" :
                                                        agent.status === "Completed" ? "bg-emerald-500" : "bg-slate-300"
                                                )} />
                                                <span className={cn(
                                                    "text-xs transition-colors",
                                                    agent.status === "Idle" ? "text-muted-foreground" : "text-foreground font-medium"
                                                )}>{agent.name}</span>
                                            </div>
                                            <Badge
                                                variant={agent.status === "Processing" ? "default" : "outline"}
                                                className={cn(
                                                    "text-[10px] h-5 transition-all",
                                                    agent.status === "Processing" && "bg-amber-500 hover:bg-amber-600 border-none",
                                                    agent.status === "Completed" && "text-emerald-600 border-emerald-200 bg-emerald-50",
                                                    agent.status === "Idle" && "opacity-50"
                                                )}
                                            >
                                                {agent.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* How It Works Card */}
                            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.02]" />

                                <div className="relative p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <h3 className="font-semibold text-sm">System Topology</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {agents.map((agent, index) => {
                                            const Icon = agent.icon;
                                            return (
                                                <div
                                                    key={agent.name}
                                                    className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in slide-in-from-left-2"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <div className={cn(
                                                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                                                        `bg-${agent.color}-500/10 text-${agent.color}-500`
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium mb-0.5">
                                                            {agent.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {agent.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}