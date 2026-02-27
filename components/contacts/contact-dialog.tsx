"use client";

import { useState } from "react";
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
import { createContact } from "@/app/actions/contact";
import { 
  Plus, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Sparkles,
  Users,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["CUSTOMER", "VENDOR"]),
  address: z.string().optional(),
});

interface ContactDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContactDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ContactDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "CUSTOMER" as const,
      address: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: (result) => {
      if (result.success) {
        setOpen(false);
        form.reset();
        toast.success("Contact created successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create contact",
          {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          }
        );
      }
    },
    onError: () => {
      toast.error("Failed to create contact", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });
  const isSubmitting = createMutation.isPending;

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    createMutation.mutate(values);
  };

  const watchType = form.watch("type");

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add Contact
            <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[560px] p-0 border-border/50 bg-background/95 backdrop-blur-xl">
        {/* Header with Gradient */}
        <DialogHeader className={cn(
          "border-b bg-gradient-to-r p-6",
          watchType === "VENDOR" 
            ? "from-purple-500/10 to-primary/5 border-purple-500/20" 
            : "from-green-500/10 to-primary/5 border-green-500/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              {watchType === "VENDOR" ? (
                <Building2 className="h-5 w-5 text-purple-500" />
              ) : (
                <Users className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Add New Contact</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new customer or vendor. Fields marked with * are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. John Doe or Company Name" 
                      {...field} 
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Use company or person name used in transactions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Phone Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {field.value === "VENDOR" ? (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                      Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:ring-primary/20">
                          <SelectValue placeholder="Select contact type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. +1 234 567 890" 
                        {...field} 
                        className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. contact@example.com" 
                      type="email"
                      {...field} 
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field */}
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
                      placeholder="e.g. 123 Business St, City, Country" 
                      {...field} 
                      className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            {form.watch("name") && (
              <div className="rounded-lg bg-muted/30 p-4 border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Contact Preview
                </h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {watchType === "VENDOR" ? (
                      <Building2 className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Users className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {form.watch("name")}
                      </span>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs",
                          watchType === "VENDOR" 
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            : "bg-green-500/10 text-green-600 border-green-500/20"
                        )}
                      >
                        {watchType === "VENDOR" ? (
                          <Building2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Users className="h-3 w-3 mr-1" />
                        )}
                        {watchType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {form.watch("email") && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {form.watch("email")}
                        </span>
                      )}
                      {form.watch("phone") && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {form.watch("phone")}
                        </span>
                      )}
                      {!form.watch("email") && !form.watch("phone") && (
                        <span className="text-muted-foreground/50">No contact details</span>
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
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Contact
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