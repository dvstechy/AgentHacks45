import { getWarehouses } from "@/app/actions/warehouse";
import { WarehouseDialog } from "@/components/inventory/warehouse-dialog";
import { WarehouseList } from "@/components/inventory/warehouse-list";
import {
  Warehouse,
  MapPin,
  Package,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Building2,
  Boxes
} from "lucide-react";
import Link from "next/link";

export default async function WarehousesPage() {
  const { data: warehouses } = await getWarehouses();
  const warehouseCount = warehouses?.length || 0;

  // Calculate some stats
  const totalLocations = warehouses?.reduce((sum, w) => sum + (w.locations?.length || 0), 0) || 0;
  const activeWarehouses = ((warehouses || []) as any[]).filter(w => w.status === "ACTIVE").length || 0;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-orange-500 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      Warehouses
                    </h1>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {warehouseCount} total
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground mt-1">
                    Manage your physical storage locations and inventory spaces
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="animate-in fade-in slide-in-from-right-2 duration-500">
              <WarehouseDialog />
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Warehouse className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Warehouses</p>
                  <p className="text-2xl font-bold">{warehouseCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-500">{activeWarehouses}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Locations</p>
                  <p className="text-2xl font-bold">{totalLocations}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Locations</p>
                  <p className="text-2xl font-bold">
                    {warehouseCount > 0 ? Math.round(totalLocations / warehouseCount) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-primary to-orange-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Warehouse List
            </h2>
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Inactive</span>
            </div>
          </div>
        </div>

        {/* Warehouse List Component */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <WarehouseList warehouses={warehouses || []} />
        </div>

        {/* Empty State */}
        {warehouseCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center mb-6 border border-primary/20">
                <Warehouse className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No warehouses yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Create your first warehouse to start managing physical storage locations
            </p>
            <WarehouseDialog />
          </div>
        )}

        {/* Info Footer */}
        {warehouseCount > 0 && (
          <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-orange-500/5 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" />
                <span>
                  <span className="font-medium text-foreground">{warehouseCount}</span> warehouses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>
                  <span className="font-medium text-foreground">{totalLocations}</span> total locations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-500" />
                <span>
                  <span className="font-medium text-foreground">{activeWarehouses}</span> active
                </span>
              </div>
              <div className="text-xs ml-auto">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}