"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  session: unknown;
}

const highlights = [
  { icon: Shield, label: "Secure access control" },
  { icon: TrendingUp, label: "Live stock intelligence" },
  { icon: Users, label: "Built for ops teams" },
];

export function HeroSection({ session }: HeroSectionProps) {
  const isAuthenticated = Boolean(session);

  return (
    <section className="relative overflow-hidden pb-12 pt-8 md:pb-16 md:pt-12">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="space-y-6 md:space-y-8">
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-primary/20">
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            Production-ready inventory operations
          </Badge>

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
              <Button className="h-11 w-full gap-2 rounded-lg px-7 sm:w-auto shadow-sm" size="lg">
                {isAuthenticated ? "Open Dashboard" : "Start Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="h-11 w-full rounded-lg px-7 sm:w-auto" size="lg">
                Explore features
              </Button>
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-xl border border-border/60 bg-card p-2 md:p-3 shadow-xl">
            <div className="mb-2 md:mb-3 flex items-center gap-2 border-b border-border/60 px-2 pb-2 md:pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
              <div className="ml-3 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground font-mono">
                /dashboard
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <Image
                src="/hero.png"
                alt="Inventory dashboard preview"
                fill
                priority
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
