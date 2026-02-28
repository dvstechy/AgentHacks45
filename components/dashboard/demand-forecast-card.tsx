"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemandForecastCard() {
    // SVG Chart Dimensions
    const width = 400;
    const height = 120;
    const padding = 10;

    // Mock Data Points (6 months past + 2 months future)
    // Values representing normalized demand units
    const pastData = [35, 42, 38, 55, 48, 62];
    const projectedData = [75, 88];
    const allData = [...pastData, ...projectedData];

    const maxValue = Math.max(...allData) * 1.1;
    const stepX = (width - padding * 2) / (allData.length - 1);

    // Calculate Points for SVG path
    const points = allData.map((val, i) => ({
        x: padding + i * stepX,
        y: height - padding - (val / maxValue) * (height - padding * 2)
    }));

    // Path for Past Data (Solid)
    const pastPath = points.slice(0, pastData.length).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Path for Projected Data (Dashed)
    const projectedPath = points.slice(pastData.length - 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Gradient area path
    const areaPath = [
        ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
        `L ${points[points.length - 1].x} ${height}`,
        `L ${points[0].x} ${height}`,
        'Z'
    ].join(' ');

    return (
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-lg group">
            {/* Background visual flair */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity group-hover:opacity-100" />

            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Demand Intelligence</h3>
                        <p className="text-[10px] text-muted-foreground">30-Day Predictive Forecast</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Mar 2026 - Oct 2026</span>
                </div>
            </div>

            <div className="relative h-32 w-full mt-2">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                            <stop offset="100%" stopColor="rgb(168, 85, 247)" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />

                    {/* Gradient area */}
                    <path d={areaPath} fill="url(#areaGradient)" />

                    {/* Past Data Line */}
                    <path d={pastPath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Projected Data Line (Dashed) */}
                    <path d={projectedPath} fill="none" stroke="rgb(168, 85, 247)" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Projection Indicator Point */}
                    <circle cx={points[pastData.length - 1].x} cy={points[pastData.length - 1].y} r="4" fill="white" stroke="rgb(168, 85, 247)" strokeWidth="2" />

                    {/* Future trend indicator */}
                    <text x={points[points.length - 1].x - 40} y={points[points.length - 1].y - 12} className="text-[12px] fill-purple-500 font-bold italic" textAnchor="middle">
                        +28% Projected
                    </text>
                </svg>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground">Reliability Score</span>
                        <span className="text-sm font-bold text-indigo-500">92.4</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground">Confidence</span>
                        <span className="text-sm font-bold text-purple-500">High</span>
                    </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-indigo-500/5 text-indigo-500 border-indigo-500/20">
                    ML Training Active
                </Badge>
            </div>
        </Card>
    );
}
