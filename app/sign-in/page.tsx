import { SignInForm } from "@/components/auth/sign-in-form";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Shield,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
  TrendingUp,
  Users,
  Warehouse
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Route } from "next";

export default async function SignInPage() {
  const session = await getSession();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  const features = [
    { icon: Package, label: "Inventory Management", color: "blue" },
    { icon: TrendingUp, label: "Real-time Analytics", color: "green" },
    { icon: Users, label: "Team Collaboration", color: "purple" },
    { icon: Warehouse, label: "Multi-warehouse", color: "orange" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SiteHeader session={session} />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-8 lg:py-12 px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Animated Gradient Orbs */}
          <div className="absolute top-0 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-spin-slow-fade" />

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
                style={{
                  top: `${(i * 5.5) % 100}%`,
                  left: `${(i * 7.3) % 100}%`,
                  animationDelay: `${(i * 0.25) % 5}s`,
                  animationDuration: `${3 + (i % 4)}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Brand Message */}
            <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-2 duration-700">

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl xl:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                  <br />
                  <span className="text-foreground">to Your Dashboard</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Access your inventory management system with real-time insights,
                  team collaboration, and powerful analytics at your fingertips.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-primary">U{i}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-foreground">10,000+</span>
                  <span className="text-muted-foreground"> businesses trust us</span>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const colors = {
                    blue: "text-blue-500",
                    green: "text-green-500",
                    purple: "text-purple-500",
                    orange: "text-orange-500"
                  };
                  return (
                    <div
                      key={feature.label}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm hover:bg-secondary/80 transition-all duration-300 hover:scale-105 cursor-default group animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Icon className={cn("h-4 w-4", colors[feature.color as keyof typeof colors])} />
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="relative animate-in fade-in slide-in-from-right-2 duration-700">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              {/* Security Badge for Mobile */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Secure Login</span>
                </div>
              </div>

              {/* Form Container */}
              <div className="relative">
                {/* Gradient Border */}
                {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl opacity-20 blur" /> */}

                {/* Form Card */}
                {/* <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"> */}
                  {/* Header Gradient */}
                  {/* <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" /> */}

                  <div className="p-8">
                    <SignInForm />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}