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
import toast from "react-hot-toast";
import { signIn } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, User } from "lucide-react";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or Login ID is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(values: SignInValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("identifier", values.identifier);
      formData.append("password", values.password);

      const result = await signIn(null, formData);

      if (result?.errors) {
        Object.entries(result.errors).forEach(([key, errors]) => {
          form.setError(key as any, { message: errors[0] });
        });
      } else if (result?.message) {
        toast.error(result.message);
      }
    });
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
            <span className="text-xs font-semibold text-primary">Secure Login</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access your inventory dashboard
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Email or Login ID</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="john@example.com or username123"
                        type="text"
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
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                href={"/forgot-password" as any}
                className="text-sm font-medium text-primary hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] font-semibold group"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center relative z-10 pt-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
