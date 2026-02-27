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
import { useState } from "react";

export function CommandCenterClient() {
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    const agents = [
        { name: "Perception", icon: Brain, color: "violet", description: "Queries stock levels and weather data" },
        { name: "Geocoding", icon: MapPin, color: "blue", description: "Converts warehouse addresses to coordinates" },
        { name: "Rebalancing", icon: ArrowRightLeft, color: "emerald", description: "Finds surplus and suggests transfers" },
        { name: "PageIndex", icon: FileSearch, color: "amber", description: "Looks up supplier contract data" },
        { name: "Arbiter", icon: Shield, color: "rose", description: "Validates against cold chain and capacity" },
    ];

    return (
        <div className="space-y-6">

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Chat Placeholder (2 columns) - Redesigned */}
                <div className="lg:col-span-2">
                    <Card className="relative overflow-hidden h-[600px] flex flex-col items-center justify-center shadow-xl border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Floating particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[
                                { top: 15, left: 25 },
                                { top: 45, left: 70 },
                                { top: 75, left: 40 },
                                { top: 30, left: 85 },
                                { top: 60, left: 10 },
                                { top: 85, left: 55 },
                            ].map((pos, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-orange-500/20 rounded-full animate-float"
                                    style={{
                                        top: `${pos.top}%`,
                                        left: `${pos.left}%`,
                                        animationDelay: `${i * 0.3}s`,
                                        animationDuration: `${3 + i}s`
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative flex flex-col items-center gap-5 text-center p-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-xl animate-pulse" />
                                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center border border-orange-500/20">
                                    <MessageSquare className="h-10 w-10 text-orange-500/60" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">AI Chatbot Interface</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    The AI chatbot requires the <code className="px-1.5 py-0.5 rounded bg-muted/80 text-xs font-mono">@chainlit/react-client</code> package to be installed.
                                </p>
                            </div>

                            {/* Installation Instructions */}
                            <div className="w-full max-w-md p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Installation Required</span>
                                </div>
                                <div className="bg-background/50 rounded-lg p-3 font-mono text-xs">
                                    <span className="text-muted-foreground">$</span>{" "}
                                    <span className="text-primary">npm install</span> @chainlit/react-client recoil --legacy-peer-deps
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    After installation, restart the development server.
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="gap-1">
                                    <Brain className="w-3 h-3" />
                                    Analyze Stock
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <ArrowRightLeft className="w-3 h-3" />
                                    Run Rebalancing
                                </Badge>
                            </div>
                        </div>

                        {/* Decorative bottom bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
                    </Card>
                </div>

                {/* Right: Info Panel - Redesigned */}
                <div className="space-y-5">
                    {/* How It Works Card */}
                    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.02]" />

                        <div className="relative p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-sm">How It Works</h3>
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

                            <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                                    Try: "Analyze low stock" or "Run rebalancing"
                                </p>
                            </div>
                        </div>

                        {/* Decorative corner gradient */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                    </Card>

                    {/* Agent Status Card */}
                    <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold text-sm">Agent Status</h3>
                        </div>

                        <div className="space-y-3">
                            {agents.map((agent) => (
                                <div key={agent.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs">{agent.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5">
                                        Active
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">System Load</span>
                                <span className="font-medium">42%</span>
                            </div>
                            <div className="mt-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                <div className="h-full w-[42%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}