"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { signUp } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const signUpSchema = z.object({
  name: z
    .string()
    .min(6, "Login ID must be at least 6 characters")
    .max(12, "Login ID must not exceed 12 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Login ID can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  role: z.enum(["MANAGER", "STAFF", "STOCK_MASTER"]).optional(),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: SignUpValues) => {
      const result = await signUp(values);
      return result;
    },
    onSuccess: (result) => {
      if (result?.errors) {
        Object.entries(result.errors).forEach(([key, errors]) => {
          form.setError(key as any, { message: errors[0] });
        });
      } else if (result?.message) {
        toast.error(result.message);
      } else if (result?.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  function onSubmit(values: SignUpValues) {
    mutate(values);
  }

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

      <CardHeader className="space-y-3 flex flex-col items-center text-center relative z-10 pb-8">
        {/* Logo */}
        <div className="relative flex h-16 w-16 items-center justify-center mb-2 group hover:scale-110 transition-transform duration-300">
          <Image src="/logo.png" alt="IMS Logo" width={64} height={64} className="object-contain transition-transform duration-300 group-hover:rotate-12" />
        </div>

        {/* Title with Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Get Started Free</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Join us to manage your inventory efficiently
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Login ID</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="username123"
                        className="pl-10 h-11 border-border/50 focus:border-primary/50 bg-background/50 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    6-12 characters, letters, numbers, and underscores only
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        className="pl-10 h-11 border-border/50 focus:border-primary/50 bg-background/50 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Password</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11 border-border/50 focus:border-primary/50 bg-background/50 transition-all"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Minimum 8 characters with uppercase, lowercase, and special character
                  </p>
                </FormItem>
              )}
            />

            {/* Benefits List */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">What you'll get:</p>
              <div className="space-y-1.5">
                {[
                  "Real-time inventory tracking",
                  "Advanced analytics dashboard",
                  "Multi-warehouse support",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] font-semibold group"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center relative z-10 pt-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
