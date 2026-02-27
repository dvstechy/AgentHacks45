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
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
        toast.success("Product created");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create product"
        );
      }
    },
    onError: (error) => {
      toast.error("Failed to create product");
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
        toast.success("Product updated");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update product"
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update product");
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

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (productToEdit) {
      updateMutation.mutate({ id: productToEdit.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5">
          <DialogTitle>
            {productToEdit ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {productToEdit
              ? "Update product details."
              : "Add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use a clear and searchable product name.
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
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-123" {...field} />
                    </FormControl>
                    <FormDescription>
                      Keep SKU unique (e.g. CAT-ITEM-001).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STORABLE">
                          Storable Product
                        </SelectItem>
                        <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                        <SelectItem value="SERVICE">Service</SelectItem>
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
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salesPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormDescription>INR selling price.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormDescription>INR purchase/cost price.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Product description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? productToEdit
                    ? "Updating..."
                    : "Creating..."
                  : productToEdit
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
