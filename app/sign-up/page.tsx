import { SignUpForm } from "@/components/auth/sign-up-form";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Rocket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Gift,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Clock,
  Star,
  Medal,
  Package
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Route } from "next";

export default async function SignUpPage() {
  const session = await getSession();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  const benefits = [
    { icon: Zap, text: "14-day free trial", color: "yellow", description: "No credit card required" },
    { icon: Users, text: "Up to 5 team members", color: "blue", description: "Collaborate seamlessly" },
    { icon: BarChart3, text: "Advanced analytics", color: "green", description: "Real-time insights" },
    { icon: Shield, text: "Enterprise security", color: "purple", description: "Bank-level encryption" }
  ];

  const features = [
    { icon: Package, text: "Inventory Tracking", color: "blue" },
    { icon: TrendingUp, text: "Demand Forecasting", color: "green" },
    { icon: Globe, text: "Multi-warehouse", color: "purple" },
    { icon: Clock, text: "Real-time Updates", color: "orange" }
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50M+", label: "Items Tracked", icon: Package },
    { value: "99.9%", label: "Uptime", icon: Shield },
    { value: "24/7", label: "Support", icon: Clock }
  ];

  const reviews = [
    { rating: 5, text: "Best inventory system I've used", author: "TechCrunch" },
    { rating: 5, text: "Game-changer for our business", author: "Forbes" },
    { rating: 5, text: "Incredible ROI within weeks", author: "Inc. Magazine" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SiteHeader session={session} />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-8 lg:py-12 px-4">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-spin-slow" />

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full animate-float"
                style={{
                  top: `${Math.random() * 100}% `,
                  left: `${Math.random() * 100}% `,
                  animationDelay: `${Math.random() * 5} s`,
                  animationDuration: `${4 + Math.random() * 6} s`
                }}
              />
            ))}
          </div>

          {/* Animated Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="primary" stopOpacity="0.1" />
                <stop offset="100%" stopColor="purple" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}% `}
                y1={`${Math.random() * 100}% `}
                x2={`${Math.random() * 100}% `}
                y2={`${Math.random() * 100}% `}
                stroke="url(#grad)"
                strokeWidth="1"
                className="animate-draw-line"
                style={{ animationDelay: `${i * 0.5} s` }}
              />
            ))}
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Value Proposition */}
            <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-2 duration-700">
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl xl:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="text-foreground">Inventory Management</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Join thousands of businesses that have streamlined their operations,
                  reduced costs, and increased efficiency with our platform.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  const colors = {
                    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
                    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
                    green: { bg: "bg-green-500/10", text: "text-green-500" },
                    purple: { bg: "bg-purple-500/10", text: "text-purple-500" }
                  };
                  const colorConfig = colors[benefit.color as keyof typeof colors];
                  return (
                    <div
                      key={benefit.text}
                      className="group p-4 rounded-xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:bg-secondary/50 transition-all duration-300 hover:scale-105 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300", colorConfig.bg)}>
                        <Icon className={cn("h-5 w-5", colorConfig.text)} />
                      </div>
                      <h3 className="font-semibold mb-1">{benefit.text}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="relative animate-in fade-in slide-in-from-right-2 duration-700">
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-tr from-pink-500/20 to-primary/20 rounded-full blur-3xl" />

              {/* Mobile Welcome Banner */}
              <div className="lg:hidden mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
                  <Rocket className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Start Free Trial</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                <p className="text-sm text-muted-foreground">
                  Join 10,000+ businesses already growing with us
                </p>
              </div>

              {/* Form Container */}
              <div className="relative">
                {/* Animated Gradient Border */}
                {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-500 animate-gradient-xy" /> */}

                {/* Form Card */}
                <div className="p-6 md:p-8">
                  <SignUpForm />
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