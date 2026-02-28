"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    AlertTriangle,
    Leaf,
    Zap,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AIInsightsCard() {
    return (
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl text-white">
            {/* Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-bold text-sm tracking-tight">AI Live Intelligence</h3>
            </div>

            <div className="relative space-y-4">
                {/* Confidence Section */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Optimization Confidence</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px]">Low Risk</Badge>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-white">87%</span>
                        <span className="text-[10px] text-slate-500 mb-1.5 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Verified Logic
                        </span>
                    </div>
                </div>

                {/* Expiry / Perishability Section */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[11px] font-bold text-amber-200">Expiry Alert</span>
                        </div>
                        <p className="text-lg font-bold text-white">12% <span className="text-[10px] font-normal text-slate-400">Stock</span></p>
                        <p className="text-[9px] text-amber-500/70 leading-tight mt-0.5">Near expiry in North-West sector</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-200">Condition</span>
                        </div>
                        <p className="text-[11px] font-bold text-white leading-tight">Cold Chain Verified</p>
                        <p className="text-[9px] text-emerald-500/70 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Standard: FS-92
                        </p>
                    </div>
                </div>

                {/* Demand Spike Detection */}
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between group cursor-help">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse">
                            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-rose-200">Demand Spike Detected</p>
                            <p className="text-[10px] text-slate-400">Warehouse North (+27% spike)</p>
                        </div>
                    </div>
                    <AlertCircle className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
                </div>
            </div>

            {/* Footer Meta */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500">
                <span>Model: SprintStock-v4 (GPT-4o)</span>
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Real-time analysis active
                </span>
            </div>
        </Card>
    );
}
