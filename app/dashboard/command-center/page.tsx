/**
 * SprintStock AI Command Center - Compact & Professional Dashboard
 * Displays Chainlit chatbot, Leaflet map, and agent audit trail
 * Powered by @chainlit/react-client + LangGraph
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CommandCenterClient } from "./command-center-client";
import { Brain, Bot, Zap, Globe, Activity } from "lucide-react";

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
    <div className="flex-1 space-y-4 sm:space-y-5 pb-6">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              AI Command Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Multi-agent inventory intelligence powered by LangGraph
            </p>
          </div>
        </div>

        {/* Compact stats row */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <StatPill icon={Bot} label="Agents" value="5" />
          <StatPill icon={Activity} label="Tasks" value="147" />
          <StatPill icon={Zap} label="Success" value="98%" />
          <StatPill icon={Globe} label="Locations" value="12" />
        </div>
      </div>

      {/* Command Center Client with Suspense */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-7 w-7 text-primary/40 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Initializing AI Command Center…
            </p>
            <div className="mt-4 w-48">
              <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-primary/60 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        }
      >
        <CommandCenterClient />
      </Suspense>

      {/* Minimal footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Brain className="h-3 w-3 text-primary" />
            <span className="font-medium text-foreground">LangGraph</span>{" "}
            Multi-Agent
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            System Online
          </span>
        </div>
        <span>
          Session: {String(session?.userId ?? "").slice(0, 8)}…
        </span>
      </div>
    </div>
  );
}

/* ── Stat Pill ── */
function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground hidden sm:inline">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}