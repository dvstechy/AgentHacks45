"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Box,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Warehouse,
  X,
  Filter,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
  Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WarehouseDialog } from "./warehouse-dialog";
import { deleteWarehouse, getWarehouses } from "@/app/actions/warehouse";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string | null;
  locations: any[];
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

export function WarehouseList({
  warehouses: initialWarehouses,
}: {
  warehouses: Warehouse[];
}) {
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await getWarehouses();
      if (!res.success) throw new Error(res.error as string);
      return (res.data || []) as unknown as Warehouse[];
    },
    initialData: initialWarehouses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Warehouse deleted successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      } else {
        toast.error(result.error as string, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
    onError: () => {
      toast.error("Failed to delete warehouse", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId);
    setDeletingId(null);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredWarehouses = warehouses.filter((warehouse) => {
    if (!normalizedSearch) return true;

    return (
      warehouse.name.toLowerCase().includes(normalizedSearch) ||
      warehouse.shortCode.toLowerCase().includes(normalizedSearch) ||
      (warehouse.address || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const totalLocations = warehouses.reduce((sum, w) => sum + w.locations.length, 0);

  return (
    <>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search warehouses by name, code, address..."
            className="pl-9 pr-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-500">
          <Filter className="h-4 w-4" />
          <span>
            Showing <span className="font-medium text-foreground">{filteredWarehouses.length}</span> of{" "}
            <span className="font-medium text-foreground">{warehouses.length}</span> warehouses
          </span>
        </div>
      </div>

      {/* Warehouse Grid */}
      {filteredWarehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50 backdrop-blur-sm animate-in fade-in duration-500">
          {searchQuery ? (
            <>
              <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                No warehouses match your search criteria
              </p>
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-primary"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center border border-primary/20">
                  <Warehouse className="h-12 w-12 text-primary/40" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No warehouses found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Create your first warehouse to start managing physical storage locations
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarehouses.map((warehouse, index) => (
            <Card
              key={warehouse.id}
              className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold">{warehouse.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 border-primary/20 font-mono"
                    >
                      {warehouse.shortCode}
                    </Badge>
                    {warehouse.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "transition-all duration-300",
                          warehouse.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            warehouse.status === "MAINTENANCE" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                        )}
                      >
                        {warehouse.status}
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted/80 transition-all duration-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-sm">
                        <DropdownMenuItem
                          onClick={() => setEditingWarehouse(warehouse)}
                          className="cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer hover:bg-red-500/10 transition-colors"
                          onClick={() => setDeletingId(warehouse.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-start gap-1.5 text-sm">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">
                    {warehouse.address || "No address provided"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>Locations</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-semibold",
                      warehouse.locations.length > 0
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {warehouse.locations.length}
                  </Badge>
                </div>

                {/* Progress Bar for Locations (visual only) */}
                <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((warehouse.locations.length / 10) * 100, 100)}%`
                    }}
                  />
                </div>
              </CardContent>

              {/* Hover Actions Indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] text-muted-foreground">
                  Click ••• to manage
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredWarehouses.length > 0 && (
        <div className="mt-4 rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 to-orange-500/5 p-4 text-sm animate-in fade-in duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{warehouses.length}</span> total warehouses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{totalLocations}</span> total locations
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {searchQuery && `${filteredWarehouses.length} of ${warehouses.length} shown`}
            </div>
          </div>
        </div>
      )}

      {/* Edit Warehouse Dialog */}
      <WarehouseDialog
        open={!!editingWarehouse}
        onOpenChange={(open) => !open && setEditingWarehouse(null)}
        warehouseToEdit={editingWarehouse}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Warehouse?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              warehouse and remove all associated locations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-muted/80 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}