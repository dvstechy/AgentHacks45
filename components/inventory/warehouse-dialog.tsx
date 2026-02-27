"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateWarehouse, createWarehouse } from "@/app/actions/warehouse";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Warehouse,
  MapPin,
  Hash,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Building2
} from "lucide-react";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortCode: z
    .string()
    .min(2, "Short code must be at least 2 characters")
    .max(5, "Keep it short (max 5 chars)")
    .regex(/^[A-Z0-9]+$/, "Use only uppercase letters and numbers"),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).default("ACTIVE"),
});

interface WarehouseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  warehouseToEdit?: {
    id: string;
    name: string;
    shortCode: string;
    address: string | null;
    status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  } | null;
}

export function WarehouseDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  warehouseToEdit,
}: WarehouseDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const createMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Warehouse created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create warehouse",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to create warehouse", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateWarehouse(id, data),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Warehouse updated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update warehouse",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update warehouse", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortCode: "",
      address: "",
      status: "ACTIVE" as const,
    },
  });

  useEffect(() => {
    if (warehouseToEdit) {
      form.reset({
        name: warehouseToEdit.name,
        shortCode: warehouseToEdit.shortCode,
        address: warehouseToEdit.address || "",
        status: warehouseToEdit.status,
      });
    } else {
      form.reset({
        name: "",
        shortCode: "",
        address: "",
        status: "ACTIVE",
      });
    }
  }, [warehouseToEdit, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (warehouseToEdit) {
      updateMutation.mutate({ id: warehouseToEdit.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  // Generate preview shortcode from name (for demo purposes only, not stored)
  const getPreviewCode = () => {
    const name = form.watch("name");
    if (name && !form.watch("shortCode")) {
      return name.substring(0, 3).toUpperCase();
    }
    return form.watch("shortCode") || "WH";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add Warehouse
            <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[520px] p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          warehouseToEdit
            ? "from-orange-500/10 to-primary/5 border-orange-500/20"
            : "from-primary/10 to-orange-500/5 border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Building2 className={cn(
                "h-5 w-5",
                warehouseToEdit ? "text-orange-500" : "text-primary"
              )} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {warehouseToEdit ? "Edit Warehouse" : "Create New Warehouse"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {warehouseToEdit
                  ? "Update warehouse details and information."
                  : "Add a new warehouse to manage stock locations. Fields marked with * are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6">
            {/* Warehouse Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Warehouse Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mumbai Main Warehouse"
                      {...field}
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Use a descriptive name that identifies this location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short Code */}
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
                      placeholder="e.g. MUM"
                      {...field}
                      className="font-mono uppercase bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    2-5 characters, uppercase letters and numbers only (e.g., MUM, WH01)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Storage Street, Industrial Area"
                      {...field}
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional: Physical location of the warehouse
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            {(form.watch("name") || form.watch("shortCode")) && (
              <div className="rounded-lg bg-muted/30 p-4 border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Preview
                </h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {form.watch("name") || "Warehouse Name"}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {getPreviewCode()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {form.watch("address") || "Address not specified"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    Status
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MAINTENANCE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <span>Maintenance</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Current operational state of this warehouse
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {warehouseToEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {warehouseToEdit ? "Update Warehouse" : "Create Warehouse"}
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