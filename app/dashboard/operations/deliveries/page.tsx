import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { TransferDialog } from "@/components/operations/transfer-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpFromLine,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  MapPin,
  Users,
  ArrowRight
} from "lucide-react";
import { ClientTime } from "@/components/ui/client-time";
import Link from "next/link";

export default async function DeliveriesPage() {
  const result = await getTransfers("OUTGOING");
  const transfers = result.success ? (result.data ?? []) : [];
  const transferCount = transfers?.length || 0;

  // Calculate statistics
  const pendingDeliveries = transfers.filter(t => t.status === "DRAFT").length;
  const completedDeliveries = transfers.filter(t => t.status === "DONE").length;
  const cancelledDeliveries = transfers.filter(t => t.status === "CANCELED").length;
  const totalItems = transfers.reduce((sum, t) => sum + (t.stockMoves?.length || 0), 0);

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-green-500/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
              <Heading
                title={`Deliveries (${transferCount})`}
                description="Manage outgoing shipments to customers"
              />
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500">
                <ArrowUpFromLine className="h-3.5 w-3.5" />
                <span>{transferCount} Total Deliveries</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                <Clock className="h-3.5 w-3.5" />
                <span>{pendingDeliveries} Pending</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completedDeliveries} Completed</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
                <Package className="h-3.5 w-3.5" />
                <span>{totalItems} Items</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
            <TransferDialog type="OUTGOING" />
            <Link href="/dashboard/operations">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                View all operations
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-bold">{transferCount - completedDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destinations</p>
                <p className="text-lg font-bold">
                  {new Set(transfers.map(t => t.destinationLocation?.name).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="text-lg font-bold">
                  {new Set(transfers.map(t => t.contact?.name).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-lg font-bold">
                  {transferCount > 0 ? Math.round((completedDeliveries / transferCount) * 100) : 0}%
                </p>
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
            <div className="h-6 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Delivery List
            </h2>
          </div>

          {/* Quick Filters Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Draft
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Cancelled
            </span>
          </div>
        </div>

        {/* Transfer List */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <TransferList transfers={transfers || []} type="OUTGOING" />
        </div>

        {/* Empty State */}
        {transferCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                <Truck className="h-16 w-16 text-green-500/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No deliveries yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Create your first delivery to start managing outgoing shipments to customers
            </p>
            <TransferDialog type="OUTGOING" />
          </div>
        )}

        {/* Summary Footer (when there are deliveries) */}
        {transferCount > 0 && (
          <div className="rounded-xl border border-border/50 bg-gradient-to-r from-green-500/5 to-transparent p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{completedDeliveries}</span> completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{pendingDeliveries}</span> pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{totalItems}</span> total items
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: <ClientTime format="full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}