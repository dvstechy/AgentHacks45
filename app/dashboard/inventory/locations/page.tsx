import { getLocations } from "@/app/actions/warehouse";
import { LocationDialog } from "@/components/inventory/location-dialog";
import { LocationList } from "@/components/inventory/location-list";
import { 
  MapPin, 
  Layers, 
  Building2, 
  Warehouse,
  Sparkles,
  ArrowRight,
  Boxes,
  TreePine
} from "lucide-react";
import Link from "next/link";

export default async function LocationsPage() {
  const { data: locations } = await getLocations();
  const locationCount = locations?.length || 0;
  
  // Calculate some stats
  const rootLocations = locations?.filter(l => !l.parentId).length || 0;
  const warehouses = new Set(locations?.map(l => l.warehouseId)).size || 0;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 animate-pulse delay-1000" />
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
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-emerald-500 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Locations
                    </h1>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {locationCount} total
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground mt-1">
                    Manage your warehouse locations and hierarchy
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="animate-in fade-in slide-in-from-right-2 duration-500">
              <LocationDialog />
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Locations</p>
                  <p className="text-xl sm:text-2xl font-bold">{locationCount}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TreePine className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Root Locations</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-500">{rootLocations}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warehouses</p>
                  <p className="text-xl sm:text-2xl font-bold">{warehouses}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Depth</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {locationCount > 0 ? Math.ceil(locationCount / rootLocations) : 0}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-primary to-emerald-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Location Hierarchy
            </h2>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Root</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Child</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Warehouse</span>
            </div>
          </div>
        </div>

        {/* Location List Component */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <LocationList locations={locations || []} />
        </div>

        {/* Empty State */}
        {locationCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-6 border border-primary/20">
                <MapPin className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No locations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Create your first location to start organizing your warehouse space
            </p>
            <LocationDialog />
          </div>
        )}

        {/* Info Footer */}
        {locationCount > 0 && (
          <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-emerald-500/5 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  <span className="font-medium text-foreground">{locationCount}</span> total locations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TreePine className="h-4 w-4 text-green-500" />
                <span>
                  <span className="font-medium text-foreground">{rootLocations}</span> root locations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>
                  <span className="font-medium text-foreground">{warehouses}</span> warehouses
                </span>
              </div>
              <div className="text-xs w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>

            {/* Hierarchy Depth Visualization */}
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Hierarchy depth:</span>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-500" : "bg-blue-500"
                  )} />
                  {i < 2 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground/50" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}