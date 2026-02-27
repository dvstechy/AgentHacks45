import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { TransferDialog } from "@/components/operations/transfer-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ArrowDownToLine, Package, Truck, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ReceiptsPage() {
  const result = await getTransfers("INCOMING");
  const transfers = result.success ? result.data : [];
  const transferCount = transfers?.length || 0;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-primary rounded-full" />
              <Heading
                title={`Receipts (${transferCount})`}
                description="Manage incoming shipments from vendors"
              />
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-in fade-in slide-in-from-left-2 duration-500">
                <ArrowDownToLine className="h-3.5 w-3.5" />
                <span>{transferCount} pending receipts</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                <Clock className="h-3.5 w-3.5" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
            <TransferDialog type="INCOMING" />
            <Link href="/dashboard/operations">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                View all operations
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Content Section */}
      <div className="space-y-4">
        {/* Status Tabs or Filters (if needed) */}
        {transferCount > 0 && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{transferCount} receipts found</span>
            </div>
          </div>
        )}

        {/* Transfer List */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <TransferList transfers={transfers || []} type="INCOMING" />
        </div>

        {/* Empty State (if TransferList doesn't handle it) */}
        {transferCount === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-700">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No receipts yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Create your first receipt to start tracking incoming inventory
            </p>
            <TransferDialog type="INCOMING" />
          </div>
        )}
      </div>
    </div>
  );
}