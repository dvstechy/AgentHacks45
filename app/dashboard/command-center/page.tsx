/**
 * SprintStock AI Command Center - Integrated Dashboard
 * Displays Chainlit chatbot, Leaflet map, and agent audit trail
 * Powered by @chainlit/react-client + LangGraph
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CommandCenterClient } from "./command-center-client";
import {
  Brain,
  Bot,
  Map,
  Activity,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Cpu
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Command Center | SprintStock",
  description:
    "Intelligent inventory rebalancing powered by LangGraph and Multi-Agent AI",
};

export default async function CommandCenterPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-transparent p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-orange-500/5 to-purple-500/5 blur-3xl animate-spin-slow" />

          {/* Floating particles - AI themed */}
          <div className="absolute inset-0">
            {[
              { top: 10, left: 20 },
              { top: 35, left: 65 },
              { top: 70, left: 35 },
              { top: 25, left: 80 },
              { top: 55, left: 15 },
              { top: 80, left: 50 },
              { top: 45, left: 90 },
              { top: 90, left: 30 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-orange-500/30 rounded-full animate-float"
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${4 + i}s`
                }}
              />
            ))}
          </div>

          {/* Neural network lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {[...Array(3)].map((_, i) => (
              <circle
                key={i}
                cx={`${20 + i * 30}%`}
                cy={`${30 + i * 20}%`}
                r={2}
                fill="url(#neural-gradient)"
                className="animate-ping"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  AI Command Center
                </h1>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-medium bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                    Multi-Agent System
                  </span>
                </div>
              </div>
              <p className="text-base text-muted-foreground mt-1 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Intelligent inventory rebalancing powered by LangGraph
              </p>
            </div>
          </div>

          {/* AI Status Badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-in fade-in slide-in-from-left-2 duration-500">
              <Bot className="h-3.5 w-3.5" />
              <span>3 Active Agents</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
              <Activity className="h-3.5 w-3.5" />
              <span>Real-time Monitoring</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
              <Map className="h-3.5 w-3.5" />
              <span>Live Location Tracking</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
              <Shield className="h-3.5 w-3.5" />
              <span>End-to-End Encryption</span>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasks Today</p>
                  <p className="text-2xl font-bold text-blue-500">147</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-500">98%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Locations</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-orange-500 to-purple-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Command Interface
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Idle</span>
            </div>
          </div>
        </div>

        {/* Command Center Client with Suspense */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card/50 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/10 to-purple-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <Brain className="h-12 w-12 text-orange-500/40 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                Initializing AI Command Center
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Loading multi-agent system, map interface, and audit trail...
              </p>
            </div>

            {/* Loading Progress */}
            <div className="mt-6 w-64">
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full animate-loading-bar" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Establishing secure connection...
              </p>
            </div>

            {/* Agent Status Placeholders */}
            <div className="flex gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Agent {i}</span>
                </div>
              ))}
            </div>
          </div>
        }>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <CommandCenterClient />
          </div>
        </Suspense>
      </div>

      {/* Info Footer */}
      <div className="rounded-lg border border-border/50 bg-gradient-to-r from-orange-500/5 to-purple-500/5 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-500" />
              <span>
                <span className="font-medium text-foreground">LangGraph</span> Multi-Agent System
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-500" />
              <span>
                <span className="font-medium text-foreground">3</span> Active Agents
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Session ID: {String(session?.userId ?? "").slice(0, 8)}...</span>
            <span>•</span>
            <span>Last sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Agent Activity Bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Agent Activity:</span>
          <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: '45%' }} />
            <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: '30%' }} />
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '25%' }} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            45% Processing | 30% Idle | 25% Active
          </span>
        </div>
      </div>
    </div>
  );
}