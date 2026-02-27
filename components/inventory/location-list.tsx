"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  MoreVertical, 
  Pencil, 
  Search, 
  Trash2,
  MapPin,
  Warehouse,
  Layers,
  Calendar,
  X,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  TreePine
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LocationDialog } from "./location-dialog";
import { deleteLocation, getLocations } from "@/app/actions/warehouse";
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

interface Location {
  id: string;
  name: string;
  shortCode: string;
  type: string;
  warehouseId?: string | null;
  parentId?: string | null;
  warehouse?: {
    name: string;
  } | null;
  parent?: {
    name: string;
  } | null;
  createdAt: Date;
}

interface LocationListProps {
  locations: Location[];
}

export function LocationList({
  locations: initialLocations,
}: LocationListProps) {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await getLocations();
      if (!res.success) throw new Error(res.error as string);
      return (res.data || []) as unknown as Location[];
    },
    initialData: initialLocations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Location deleted successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["locations"] });
      } else {
        toast.error(result.error as string, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
    onError: () => {
      toast.error("Failed to delete location", {
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
  const filteredLocations = locations.filter((location) => {
    if (!normalizedSearch) return true;

    return (
      location.name.toLowerCase().includes(normalizedSearch) ||
      location.shortCode.toLowerCase().includes(normalizedSearch) ||
      location.type.toLowerCase().includes(normalizedSearch) ||
      (location.warehouse?.name || "").toLowerCase().includes(normalizedSearch) ||
      (location.parent?.name || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "INTERNAL":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "EXTERNAL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "VIRTUAL":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border/50";
    }
  };

  const rootLocations = locations.filter(l => !l.parentId).length;

  return (
    <>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search locations by name, code, type, warehouse..."
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
            Showing <span className="font-medium text-foreground">{filteredLocations.length}</span> of{" "}
            <span className="font-medium text-foreground">{locations.length}</span> locations
          </span>
        </div>
      </div>

      {/* Locations Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Short Code</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Warehouse</TableHead>
                <TableHead className="font-semibold">Parent</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No results found</p>
                          <p className="text-xs mt-1">
                            No locations match your search criteria
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
                          <MapPin className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No locations found</p>
                          <p className="text-xs mt-1">
                            Create your first location to start organizing warehouse space
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location, index) => (
                  <TableRow
                    key={location.id}
                    className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span>{location.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="font-mono bg-primary/5 border-primary/20"
                      >
                        {location.shortCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center border font-medium px-2.5 py-0.5 text-xs",
                          getTypeColor(location.type)
                        )}
                      >
                        {location.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {location.warehouse?.name ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{location.warehouse.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {location.parent?.name ? (
                        <div className="flex items-center gap-1 text-sm">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{location.parent.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(location.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
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
                            onClick={() => setEditingLocation(location)}
                            className="cursor-pointer hover:bg-muted/80 transition-colors"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer hover:bg-red-500/10 transition-colors"
                            onClick={() => setDeletingId(location.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        {filteredLocations.length > 0 && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{filteredLocations.length} locations shown</span>
                </span>
                <span className="flex items-center gap-1">
                  <TreePine className="h-3.5 w-3.5 text-green-500" />
                  <span>{rootLocations} root locations</span>
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {searchQuery && `${filteredLocations.length} of ${locations.length} locations`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Location Dialog */}
      <LocationDialog
        open={!!editingLocation}
        onOpenChange={(open) => !open && setEditingLocation(null)}
        locationToEdit={editingLocation}
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
              Delete Location?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              location and may affect child locations in the hierarchy.
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