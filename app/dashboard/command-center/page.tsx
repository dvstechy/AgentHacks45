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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading Command Center...
            </p>
          </div>
        </div>
      }
    >
      <CommandCenterClient />
    </Suspense>
  );
}
