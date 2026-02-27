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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateWarehouse, createWarehouse } from "@/app/actions/warehouse";
import toast from "react-hot-toast";
import { Plus, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortCode: z
    .string()
    .min(2, "Short code must be at least 2 characters")
    .max(5, "Keep it short (max 5 chars)"),
  address: z.string().optional(),
});

interface WarehouseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  warehouseToEdit?: {
    id: string;
    name: string;
    shortCode: string;
    address: string | null;
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
        toast.success("Warehouse created");
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create warehouse"
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to create warehouse");
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
        toast.success("Warehouse updated");
        queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update warehouse"
        );
        console.error(result.error);
      }
    },
    onError: (error) => {
      toast.error("Failed to update warehouse");
      console.error(error);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortCode: "",
      address: "",
    },
  });

  useEffect(() => {
    if (warehouseToEdit) {
      form.reset({
        name: warehouseToEdit.name,
        shortCode: warehouseToEdit.shortCode,
        address: warehouseToEdit.address || "",
      });
    } else {
      form.reset({
        name: "",
        shortCode: "",
        address: "",
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

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {warehouseToEdit ? "Edit Warehouse" : "Add Warehouse"}
          </DialogTitle>
          <DialogDescription>
            {warehouseToEdit
              ? "Update warehouse details."
              : "Create a new warehouse to manage stock locations."}
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
                    <Input placeholder="Main Warehouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Code</FormLabel>
                  <FormControl>
                    <Input placeholder="WH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Storage St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
