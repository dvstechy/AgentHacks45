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
import { Plus, Trash2, ArrowRight } from "lucide-react";
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
    mutationFn: (data: any) => createTransfer({ ...data, type }),
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Transfer created");
        queryClient.invalidateQueries({ queryKey: ["transfers", type] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create transfer"
        );
      }
    },
    onError: () => {
      toast.error("Failed to create transfer");
    },
  });

  const onSubmit = (values: z.infer<typeof transferSchema>) => {
    // Manual validation based on type
    if (type === "INCOMING" && !values.destinationLocationId) {
      form.setError("destinationLocationId", {
        type: "manual",
        message: "Destination location is required for receipts",
      });
      return;
    }
    if (type === "OUTGOING" && !values.sourceLocationId) {
      form.setError("sourceLocationId", {
        type: "manual",
        message: "Source location is required for deliveries",
      });
      return;
    }
    if (type === "INTERNAL") {
      let hasError = false;
      if (!values.sourceLocationId) {
        form.setError("sourceLocationId", {
          type: "manual",
          message: "Source location is required",
        });
        hasError = true;
      }
      if (!values.destinationLocationId) {
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
      contactId: values.contactId || null,
      sourceLocationId: values.sourceLocationId || null,
      destinationLocationId: values.destinationLocationId || null,
    };
    createMutation.mutate(data);
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create {type === "INCOMING" ? "Receipt" : "Delivery"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Create a new {type.toLowerCase()} transfer.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* General Info Section */}
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === "INCOMING" ? "Vendor" : "Customer"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <FormLabel>Source Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name} ({l.shortCode})
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
                  name="destinationLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name} ({l.shortCode})
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

            <Separator />

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">
                  Products
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: 1 })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Product
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              value={field.value as number}
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
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage>{form.formState.errors.items?.message}</FormMessage>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                Create Transfer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
