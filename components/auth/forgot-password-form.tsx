"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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
import { forgotPassword, resetPassword } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, KeyRound, ArrowRight, Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z
  .object({
    otp: z.string().length(4, "OTP must be 4 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");

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

        {/* Title with Icon Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
            {step === "EMAIL" ? (
              <>
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary">Secure Recovery</span>
              </>
            ) : (
              <>
                <KeyRound className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary">Reset Password</span>
              </>
            )}
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {step === "EMAIL" ? "Forgot Password?" : "Create New Password"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === "EMAIL"
              ? "No worries! Enter your email to receive a secure OTP."
              : `Enter the 4-digit code sent to ${email}`}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {step === "EMAIL" ? (
          <EmailForm
            onSuccess={(email) => {
              setEmail(email);
              setStep("OTP");
            }}
          />
        ) : (
          <ResetForm email={email} onBack={() => setStep("EMAIL")} />
        )}
      </CardContent>

      <CardFooter className="flex justify-center relative z-10 pt-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
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

function EmailForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  function onEmailSubmit(values: EmailValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);

      const result = await forgotPassword(null, formData);

      if (result?.errors) {
        Object.entries(result.errors).forEach(([key, errors]) => {
          emailForm.setError(key as any, { message: errors[0] });
        });
      } else if (result?.message) {
        if (result.success) {
          toast.success(result.message);
          onSuccess(values.email);
        } else {
          toast.error(result.message);
        }
      }
    });
  }

  return (
    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
        className="space-y-5"
      >
        <FormField
          control={emailForm.control}
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

        {/* Info Box */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Quick tip:</strong> Check your spam folder if you don't see the OTP in your inbox within a few minutes.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] font-semibold group"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Sending OTP...
            </>
          ) : (
            <>
              Send Recovery Code
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

function ResetForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onResetSubmit(values: ResetValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", values.otp);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      const result = await resetPassword(null, formData);

      if (result?.errors) {
        Object.entries(result.errors).forEach(([key, errors]) => {
          resetForm.setError(key as any, { message: errors[0] });
        });
      } else if (result?.message) {
        if (result.success) {
          toast.success(result.message);
          router.push("/sign-in");
        } else {
          toast.error(result.message);
        }
      }
    });
  }

  return (
    <Form {...resetForm}>
      <form
        onSubmit={resetForm.handleSubmit(onResetSubmit)}
        className="space-y-5"
      >
        <FormField
          control={resetForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Verification Code</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="1234"
                    maxLength={4}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    autoFocus
                    className="h-12 border-border/50 focus:border-primary/50 bg-background/50 transition-all text-center text-2xl tracking-[0.5em] font-mono font-bold"
                    {...field}
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                    <KeyRound className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="mt-7" />
            </FormItem>
          )}
        />
        <FormField
          control={resetForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">New Password</FormLabel>
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
        <FormField
          control={resetForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-10 h-11 border-border/50 focus:border-primary/50 bg-background/50 transition-all"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1.5">
                Must be at least 6 characters long
              </p>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-11 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] font-semibold group"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full h-11 hover:bg-muted/50 transition-colors group"
          onClick={onBack}
          disabled={isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Email
        </Button>
      </form>
    </Form>
  );
}
