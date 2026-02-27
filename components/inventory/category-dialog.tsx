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
import {
  createCategory,
  updateCategory,
  getCategories,
} from "@/app/actions/category";
import { 
  Plus, 
  FolderTree, 
  Sparkles, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

interface CategoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  categoryToEdit?: any;
}

export function CategoryDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  categoryToEdit,
}: CategoryDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "none",
    },
  });

  // Use TanStack Query for fetching categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      if (!res.success) throw new Error(res.error as string);
      return res.data || [];
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Filter out the category itself to prevent circular dependency if editing
  const availableCategories = categories.filter(
    (c) => !categoryToEdit || c.id !== categoryToEdit.id
  );

  useEffect(() => {
    if (categoryToEdit) {
      form.reset({
        name: categoryToEdit.name,
        description: categoryToEdit.description || "",
        parentId: categoryToEdit.parentId || "none",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        parentId: "none",
      });
    }
  }, [categoryToEdit, form, isOpen]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Category created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create category",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to create category", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCategory(id, data),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Category updated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update category",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update category", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      console.error(error);
    },
  });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    const data = {
      ...values,
      parentId: values.parentId === "none" ? undefined : values.parentId,
    };

    if (categoryToEdit) {
      updateMutation.mutate({ id: categoryToEdit.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add Category
            <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[560px] p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          categoryToEdit 
            ? "from-purple-500/10 to-primary/5 border-purple-500/20" 
            : "from-primary/10 to-purple-500/5 border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <FolderTree className={cn(
                "h-5 w-5",
                categoryToEdit ? "text-purple-500" : "text-primary"
              )} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {categoryToEdit ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {categoryToEdit
                  ? "Update category details and information."
                  : "Add a new category to organize your products. Fields marked with * are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    Category Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Electronics, Furniture, Clothing" 
                      {...field} 
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Keep names short and distinct for filtering and navigation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Category */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Parent Category
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">None (Root Category)</span>
                        </div>
                      </SelectItem>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{cat.name}</span>
                            {cat._count?.products ? (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({cat._count.products} products)
                              </span>
                            ) : null}
                          </div>
                        </SelectItem>
                      ))}
                      {availableCategories.length === 0 && (
                        <SelectItem value="no-categories" disabled>
                          No other categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Optional: Select a parent to create a subcategory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
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
                      placeholder="Enter category description, scope, or notes for your team..."
                      {...field}
                      className="min-h-[100px] bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 resize-y"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional: Add context or examples for your team
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {categoryToEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {categoryToEdit ? "Update Category" : "Create Category"}
                    <Sparkles className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </DialogFooter>

            {/* Preview Section (optional, shows hierarchy preview) */}
            {form.watch("parentId") && form.watch("parentId") !== "none" && (
              <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Hierarchy:</span>
                  <span className="font-medium">
                    {categories.find(c => c.id === form.watch("parentId"))?.name}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-primary">
                    {form.watch("name") || "New Category"}
                  </span>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}