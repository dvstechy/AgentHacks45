"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  session: unknown;
}

const highlights = [
  { icon: Shield, label: "Secure access control" },
  { icon: TrendingUp, label: "Live stock intelligence" },
  { icon: Users, label: "Built for operations teams" },
];

export function HeroSection({ session }: HeroSectionProps) {
  const isAuthenticated = Boolean(session);

  return (
    <section className="relative overflow-hidden pb-16 pt-10 md:pb-20 md:pt-14 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.1),transparent_40%)]" />

      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="space-y-8 animate-enter-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Production-ready inventory operations
          </div>

          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Move stock faster,
              <span className="block text-primary">without losing control.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              AgentHacks IMS helps warehouses run smoother with realtime inventory,
              structured workflows, and clear operational visibility from receipt to delivery.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
              <Button className="h-11 w-full gap-2 rounded-xl px-7 sm:w-auto" size="lg">
                {isAuthenticated ? "Open Dashboard" : "Start Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="h-11 w-full rounded-xl px-7 sm:w-auto" size="lg">
                Explore features
              </Button>
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2">
                <Icon className="h-4 w-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-enter-up-delay">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-400/20 to-sky-400/20 blur-2xl" />
          <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 border-b border-border/60 px-2 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="ml-3 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                /dashboard
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border bg-background">
              <Image
                src="/hero.png"
                alt="Inventory dashboard preview"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
