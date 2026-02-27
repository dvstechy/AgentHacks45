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
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import {
  Plus,
  Package,
  Tag,
  DollarSign,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
  Boxes
} from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().optional(),
  type: z.enum(["STORABLE", "CONSUMABLE", "SERVICE"]),
  unitOfMeasure: z.string().default("Units"),
  costPrice: z.coerce.number().min(0),
  salesPrice: z.coerce.number().min(0),
  categoryId: z.string().optional(),
  minStock: z.coerce.number().min(0).default(0),
  maxStock: z.coerce.number().min(0).optional(),
});

interface ProductDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  productToEdit?: any;
}

export function ProductDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  productToEdit,
}: ProductDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      if (!res.success) throw new Error(res.error as string);
      return res.data || [];
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Product created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create product",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
      }
    },
    onError: (error) => {
      toast.error("Failed to create product", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Product updated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update product",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update product", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      type: "STORABLE" as const,
      unitOfMeasure: "Units",
      costPrice: 0,
      salesPrice: 0,
      categoryId: "none",
      minStock: 0,
    },
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        name: productToEdit.name,
        sku: productToEdit.sku,
        description: productToEdit.description || "",
        type: productToEdit.type,
        unitOfMeasure: productToEdit.unitOfMeasure,
        costPrice: Number(productToEdit.costPrice),
        salesPrice: Number(productToEdit.salesPrice),
        categoryId: productToEdit.categoryId || "none",
        minStock: productToEdit.minStock,
        maxStock: productToEdit.maxStock,
      });
    } else {
      form.reset({
        name: "",
        sku: "",
        description: "",
        type: "STORABLE",
        unitOfMeasure: "Units",
        costPrice: 0,
        salesPrice: 0,
        categoryId: "none",
        minStock: 0,
      });
    }
  }, [productToEdit, form, isOpen]);

  // Watch prices for margin calculation
  const watchSalesPrice = form.watch("salesPrice");
  const watchCostPrice = form.watch("costPrice");

  const salesNum = Number(watchSalesPrice) || 0;
  const costNum = Number(watchCostPrice) || 0;
  const marginAmt = salesNum - costNum;
  const marginPct = costNum > 0 ? (marginAmt / costNum) * 100 : 0;

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const formattedValues = {
      ...values,
      categoryId: values.categoryId === "none" ? undefined : values.categoryId,
    };

    if (productToEdit) {
      updateMutation.mutate({ id: productToEdit.id, data: formattedValues });
    } else {
      createMutation.mutate(formattedValues);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "STORABLE":
        return <Boxes className="h-4 w-4 text-blue-500" />;
      case "CONSUMABLE":
        return <Package className="h-4 w-4 text-green-500" />;
      case "SERVICE":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add Product
            <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          productToEdit
            ? "from-purple-500/10 to-primary/5 border-purple-500/20"
            : "from-primary/10 to-purple-500/5 border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              {productToEdit ? (
                getTypeIcon(productToEdit.type)
              ) : (
                <Package className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {productToEdit ? "Edit Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {productToEdit
                  ? "Update product details and information."
                  : "Add a new product to your inventory. Fields marked with * are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Wireless Mouse"
                          {...field}
                          className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Use a clear and searchable product name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        SKU <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. WH-123-MOUSE"
                          {...field}
                          className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200 font-mono"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Keep SKU unique (e.g. CAT-ITEM-001)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Classification
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STORABLE">
                            <div className="flex items-center gap-2">
                              <Boxes className="h-4 w-4 text-blue-500" />
                              <span>Storable Product</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CONSUMABLE">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-green-500" />
                              <span>Consumable</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="SERVICE">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              <span>Service</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Pricing
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="salesPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Sales Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value as number}
                            className="pl-7 bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Selling price in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Cost Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value as number}
                            className="pl-7 bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Purchase/cost price in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Margin Preview (calculated but not stored) */}
              {salesNum > 0 && costNum > 0 && (
                <div className="rounded-lg bg-muted/30 p-4 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Estimated Margin:</span>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-lg",
                        marginAmt >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        ₹{marginAmt.toFixed(2)}
                      </p>
                      <p className={cn(
                        "text-xs font-semibold",
                        marginAmt >= 0 ? "text-green-500/80" : "text-red-500/80"
                      )}>
                        {marginAmt >= 0 ? "+" : ""}{Math.round(marginPct)}% Return
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Additional Details
                </h3>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description, specifications, or notes..."
                        {...field}
                        className="min-h-[100px] bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {productToEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {productToEdit ? "Update Product" : "Create Product"}
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