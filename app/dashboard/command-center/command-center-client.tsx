/**
 * Command Center Client Component
 * Renders the full AI command center with Chainlit chatbot,
 * inventory map, and audit trail in a responsive layout
 */

"use client";

import { ChainlitChatbot } from "@/components/chainlit/chatbot";
import { ChainlitProvider } from "@/components/chainlit/provider";
import { AuditTrail } from "@/components/chainlit/audit-trail";
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
} from "lucide-react";

export function CommandCenterClient() {
    return (
        <ChainlitProvider>
            <div className="space-y-5">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />

                    <div className="relative">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">
                                    AI Command Center
                                </h1>
                                <p className="text-sm text-white/75">
                                    Multi-Agent Inventory Intelligence
                                </p>
                            </div>
                        </div>

                        {/* Agent Pipeline */}
                        <div className="flex items-center gap-1.5 mt-4 text-[11px] text-white/60 flex-wrap">
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] gap-1">
                                <Brain className="w-3 h-3" /> Perception
                            </Badge>
                            <Sparkles className="w-3 h-3 text-white/30" />
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] gap-1">
                                <MapPin className="w-3 h-3" /> Geocoding
                            </Badge>
                            <Sparkles className="w-3 h-3 text-white/30" />
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] gap-1">
                                <ArrowRightLeft className="w-3 h-3" /> Rebalancing
                            </Badge>
                            <Sparkles className="w-3 h-3 text-white/30" />
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] gap-1">
                                <FileSearch className="w-3 h-3" /> PageIndex
                            </Badge>
                            <Sparkles className="w-3 h-3 text-white/30" />
                            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] gap-1">
                                <Shield className="w-3 h-3" /> Arbiter
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left: Chatbot (2 columns) */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden h-[600px] flex flex-col shadow-lg border-slate-200/60 dark:border-slate-700/60">
                            <ChainlitChatbot />
                        </Card>
                    </div>

                    {/* Right: Audit Trail + Info */}
                    <div className="space-y-5">
                        {/* Audit Trail */}
                        <Card className="p-4 shadow-lg border-slate-200/60 dark:border-slate-700/60 max-h-[400px] overflow-y-auto">
                            <AuditTrail traceId={null} />
                        </Card>

                        {/* Info Box */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/60 dark:border-blue-800/40 p-4">
                            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2.5 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                How It Works
                            </h3>
                            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                                <li className="flex items-start gap-2">
                                    <Brain className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Perception:</strong> Queries stock levels and weather data
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Geocoding:</strong> Converts warehouse addresses to coordinates
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Rebalancing:</strong> Finds surplus and suggests transfers
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FileSearch className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>PageIndex:</strong> Looks up supplier contract data
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Arbiter:</strong> Validates against cold chain and capacity
                                    </span>
                                </li>
                            </ul>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-3">
                                💡 Try: &quot;Analyze low stock&quot; or &quot;Run rebalancing&quot;
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </ChainlitProvider>
    );
}
