"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLocation,
  updateLocation,
  getWarehouses,
  getLocations,
} from "@/app/actions/warehouse";
import {
  Plus,
  MapPin,
  Hash,
  Layers,
  Building2,
  TreePine,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const locationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  shortCode: z
    .string()
    .min(2, "Short code is required")
    .max(20, "Short code too long"),
  type: z.enum([
    "VIEW",
    "INTERNAL",
    "CUSTOMER",
    "VENDOR",
    "INVENTORY_LOSS",
    "PRODUCTION",
    "TRANSIT",
  ]),
  warehouseId: z.string().optional(),
  parentId: z.string().optional(),
});

interface LocationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  locationToEdit?: {
    id: string;
    name: string;
    shortCode: string;
    type: string;
    warehouseId?: string | null;
    parentId?: string | null;
  } | null;
}

export function LocationDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  locationToEdit,
}: LocationDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      shortCode: "",
      type: "INTERNAL",
      warehouseId: "none",
      parentId: "none",
    },
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await getWarehouses();
      if (!res.success) throw new Error(res.error as string);
      return res.data || [];
    },
    enabled: isOpen,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await getLocations();
      if (!res.success) throw new Error(res.error as string);
      return res.data || [];
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Location created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["locations"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create location",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to create location", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof locationSchema> }) =>
      updateLocation(id, data),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Location updated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        queryClient.invalidateQueries({ queryKey: ["locations"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update location",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update location", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (locationToEdit) {
      form.reset({
        name: locationToEdit.name,
        shortCode: locationToEdit.shortCode,
        type: locationToEdit.type as z.infer<typeof locationSchema>["type"],
        warehouseId: locationToEdit.warehouseId || "none",
        parentId: locationToEdit.parentId || "none",
      });
    } else {
      form.reset({
        name: "",
        shortCode: "",
        type: "INTERNAL",
        warehouseId: "none",
        parentId: "none",
      });
    }
  }, [locationToEdit, form, isOpen]);

  async function onSubmit(values: z.infer<typeof locationSchema>) {
    if (locationToEdit) {
      updateMutation.mutate({ id: locationToEdit.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "CUSTOMER":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "VENDOR":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "INVENTORY_LOSS":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "PRODUCTION":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "TRANSIT":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "VIEW":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-muted-foreground bg-muted/10 border-border/50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add Location
            <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[620px] p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          locationToEdit
            ? "from-emerald-500/10 to-primary/5 border-emerald-500/20"
            : "from-primary/10 to-emerald-500/5 border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <MapPin className={cn(
                "h-5 w-5",
                locationToEdit ? "text-emerald-500" : "text-primary"
              )} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {locationToEdit ? "Edit Location" : "Create New Location"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {locationToEdit
                  ? "Update location details and hierarchy."
                  : "Add a new location to organize your inventory. Fields marked with * are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6">
            {/* Name and Short Code */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Shelf A-1, Rack 12"
                        {...field}
                        className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Human-readable location name for teams
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Short Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. WH/STOCK/A1"
                        {...field}
                        className="font-mono bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Unique code used in stock movement references
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Location Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select a location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INTERNAL">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Internal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CUSTOMER">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Customer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="VENDOR">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          <span>Vendor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INVENTORY_LOSS">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Inventory Loss</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PRODUCTION">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span>Production</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="TRANSIT">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <span>Transit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="VIEW">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>View</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warehouse Selection */}
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Warehouse
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{wh.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({wh.shortCode})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Optional: Assign to a specific warehouse
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Location Selection */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-muted-foreground" />
                    Parent Location
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select a parent location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">None (Root Location)</span>
                      </SelectItem>
                      {locations
                        .filter(l => !locationToEdit || l.id !== locationToEdit.id)
                        .map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{loc.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({loc.shortCode})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Optional: Create a hierarchy by setting a parent location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            {form.watch("name") && (
              <div className="rounded-lg bg-muted/30 p-4 border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Location Preview
                </h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {form.watch("name")}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {form.watch("shortCode") || "CODE"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getTypeColor(form.watch("type"))
                        )}
                      >
                        {form.watch("type")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {form.watch("warehouseId") && form.watch("warehouseId") !== "none" && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {warehouses.find(w => w.id === form.watch("warehouseId"))?.name}
                        </span>
                      )}
                      {form.watch("parentId") && form.watch("parentId") !== "none" && (
                        <span className="flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {locations.find(l => l.id === form.watch("parentId"))?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer */}
            <DialogFooter className="border-t border-border/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-border/50 hover:bg-muted/80 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {locationToEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {locationToEdit ? "Update Location" : "Create Location"}
                    <Sparkles className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Badge component for preview
function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variant === "outline" && "border border-border bg-background",
      className
    )}>
      {children}
    </span>
  );
}