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
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
        toast.success("Category created");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create category"
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to create category");
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
        toast.success("Category updated");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update category"
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update category");
      console.error(error);
    },
  });

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {categoryToEdit
              ? "Update category details."
              : "Add a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableCategories.map((cat) => (
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Category description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {categoryToEdit ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
