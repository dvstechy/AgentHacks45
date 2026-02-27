import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRightLeft,
  Activity,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package
} from "lucide-react";
import Link from "next/link";

export default async function OperationsPage() {
  const result = await getTransfers();
  const transfers = result.success ? (result.data ?? []) : [];
  const transferCount = transfers?.length || 0;

  // Calculate statistics
  const receiptsCount = transfers.filter(t => t.type === "INCOMING").length;
  const deliveriesCount = transfers.filter(t => t.type === "OUTGOING").length;
  const internalCount = transfers.filter(t => t.type === "INTERNAL").length;
  const pendingCount = transfers.filter(t => t.status === "DRAFT").length;
  const completedCount = transfers.filter(t => t.status === "DONE").length;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <Heading
                  title={`Operations (${transferCount})`}
                  description="Manage receipts, deliveries, and internal transfers"
                />
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-in fade-in slide-in-from-left-2 duration-500">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  <span>{receiptsCount} Receipts</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                  <ArrowUpFromLine className="h-3.5 w-3.5" />
                  <span>{deliveriesCount} Deliveries</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>{internalCount} Internal</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{transferCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold text-green-500">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-yellow-500">{pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-lg font-bold">{transferCount - completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Content Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              All Operations
            </h2>
          </div>

          {/* Quick Filters (just visual indicators) */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Receipts
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Deliveries
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Internal
            </span>
          </div>
        </div>

        {/* Transfer List */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <TransferList transfers={transfers || []} />
        </div>

        {/* Empty State (if needed) */}
        {transferCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6 border border-primary/20">
                <ArrowRightLeft className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No operations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Get started by creating your first receipt, delivery, or internal transfer
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/dashboard/operations/receipts">
                <button className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all duration-200 hover:scale-105">
                  Create Receipt
                </button>
              </Link>
              <Link href="/dashboard/operations/deliveries">
                <button className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all duration-200 hover:scale-105">
                  Create Delivery
                </button>
              </Link>
              <Link href="/dashboard/operations/internal">
                <button className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-all duration-200 hover:scale-105">
                  Create Transfer
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}