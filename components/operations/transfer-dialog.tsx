"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { createTransfer } from "@/app/actions/operation";
import { getContacts } from "@/app/actions/contact";
import { getLocations } from "@/app/actions/warehouse";
import { getProducts } from "@/app/actions/product";
import {
  Plus,
  Trash2,
  ArrowRight,
  Package,
  MapPin,
  Building2,
  User,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const moveSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const transferSchema = z
  .object({
    contactId: z.string().optional(),
    sourceLocationId: z.string().optional(),
    destinationLocationId: z.string().optional(),
    items: z.array(moveSchema).min(1, "At least one item is required"),
  })
  .refine(
    (data) => {
      if (data.sourceLocationId && data.destinationLocationId) {
        return data.sourceLocationId !== data.destinationLocationId;
      }
      return true;
    },
    {
      message: "Source and Destination locations cannot be the same",
      path: ["destinationLocationId"],
    }
  );

interface TransferDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  type: "INCOMING" | "OUTGOING" | "INTERNAL" | "ADJUSTMENT";
}

export function TransferDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  type,
}: TransferDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", type === "INCOMING" ? "VENDOR" : "CUSTOMER"],
    queryFn: async () => {
      const res = await getContacts(
        type === "INCOMING" ? "VENDOR" : "CUSTOMER"
      );
      return res.success ? res.data : [];
    },
    enabled: isOpen,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await getLocations();
      return res.success ? res.data : [];
    },
    enabled: isOpen,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      return res.success ? res.data : [];
    },
    enabled: isOpen,
  });

  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      contactId: "",
      sourceLocationId: "",
      destinationLocationId: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof transferSchema>) => createTransfer({ ...data, type }),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Transfer created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["transfers", type] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create transfer",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
      }
    },
    onError: () => {
      toast.error("Failed to create transfer", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });
  const isSubmitting = createMutation.isPending;

  const onSubmit = (values: z.infer<typeof transferSchema>) => {
    const sourceLocationId =
      values.sourceLocationId && values.sourceLocationId !== "none"
        ? values.sourceLocationId
        : "";
    const destinationLocationId =
      values.destinationLocationId && values.destinationLocationId !== "none"
        ? values.destinationLocationId
        : "";
    const contactId =
      values.contactId && values.contactId !== "none" ? values.contactId : "";

    // Manual validation based on type
    if (type === "INCOMING" && !destinationLocationId) {
      form.setError("destinationLocationId", {
        type: "manual",
        message: "Destination location is required for receipts",
      });
      return;
    }
    if (type === "OUTGOING" && !sourceLocationId) {
      form.setError("sourceLocationId", {
        type: "manual",
        message: "Source location is required for deliveries",
      });
      return;
    }
    if (type === "INTERNAL") {
      let hasError = false;
      if (!sourceLocationId) {
        form.setError("sourceLocationId", {
          type: "manual",
          message: "Source location is required",
        });
        hasError = true;
      }
      if (!destinationLocationId) {
        form.setError("destinationLocationId", {
          type: "manual",
          message: "Destination location is required",
        });
        hasError = true;
      }
      if (hasError) return;
    }

    // Sanitize optional fields
    const data = {
      ...values,
      contactId: contactId || undefined,
      sourceLocationId: sourceLocationId || undefined,
      destinationLocationId: destinationLocationId || undefined,
    };
    createMutation.mutate(data);
  };

  const getTypeIcon = () => {
    switch (type) {
      case "INCOMING":
        return <ArrowDownToLine className="h-5 w-5 text-blue-500" />;
      case "OUTGOING":
        return <ArrowUpFromLine className="h-5 w-5 text-green-500" />;
      case "INTERNAL":
        return <ArrowRightLeft className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-primary" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "INCOMING":
        return "from-blue-500/10 to-blue-500/5 border-blue-500/20";
      case "OUTGOING":
        return "from-green-500/10 to-green-500/5 border-green-500/20";
      case "INTERNAL":
        return "from-purple-500/10 to-purple-500/5 border-purple-500/20";
      default:
        return "from-primary/10 to-primary/5 border-primary/20";
    }
  };

  const title =
    type === "INCOMING"
      ? "Receive Goods"
      : type === "OUTGOING"
        ? "Deliver Goods"
        : "Transfer Stock";

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Create {type === "INCOMING" ? "Receipt" : type === "OUTGOING" ? "Delivery" : "Transfer"}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[960px] max-h-[90vh] overflow-y-auto p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          getTypeColor()
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              {getTypeIcon()}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new {type.toLowerCase()} transfer. All fields with * are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* General Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  General Information
                </h3>
              </div>

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {type === "INCOMING" ? "Vendor" : "Customer"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors">
                          <SelectValue placeholder="Select contact (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {contacts?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      {type === "INCOMING"
                        ? "Optional vendor reference for incoming goods."
                        : "Optional customer reference for outgoing goods."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sourceLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Source Location
                        {(type === "OUTGOING" || type === "INTERNAL") && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors">
                            <SelectValue placeholder="Select source location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {locations?.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name} ({l.shortCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {type === "OUTGOING" || type === "INTERNAL"
                          ? "Required for deliveries/internal transfers."
                          : "Optional for this transfer type."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Destination Location
                        {(type === "INCOMING" || type === "INTERNAL") && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors">
                            <SelectValue placeholder="Select destination location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {locations?.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name} ({l.shortCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {type === "INCOMING" || type === "INTERNAL"
                          ? "Required for receipts/internal transfers."
                          : "Optional for this transfer type."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Products
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: 1 })}
                  className="border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 group"
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="group relative rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/30 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute -top-2 -left-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={index !== 0 ? "sr-only" : "text-xs"}>
                              Product
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel className={index !== 0 ? "sr-only" : "text-xs"}>
                              Quantity
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                value={field.value as number}
                                className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className={index === 0 ? "pt-8" : "pt-0"}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.items?.message && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {form.formState.errors.items.message}
                </p>
              )}
            </div>

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
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Transfer
                    <ArrowRight className="h-4 w-4" />
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

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}