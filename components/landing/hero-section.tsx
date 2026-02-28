"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeroSectionProps {
  session: unknown;
}

const highlights = [
  { icon: Shield, label: "Secure access control" },
  { icon: TrendingUp, label: "Live stock intelligence" },
  { icon: Users, label: "Built for ops teams" },
];

const trustedBy = ["Warehouse Pro", "LogiCo", "StockOps", "TradeFlow"];

export function HeroSection({ session }: HeroSectionProps) {
  const isAuthenticated = Boolean(session);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden pb-10 pt-6 md:pb-14 md:pt-10">
      {/* Subtle background grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid-slate-900[0.02] dark:bg-grid-slate-100[0.02] absolute inset-0" />
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Left Column */}
        <div className="flex flex-col gap-6 md:gap-7">
          {/* Status badge */}
          <Badge
            variant="secondary"
            className="w-fit border-primary/25 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/15"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Production-ready · AgentHacks IMS
          </Badge>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Move stock faster,{" "}
              <span className="text-primary">without losing control.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              AgentHacks IMS helps warehouses run smoother with realtime
              inventory, structured workflows, and clear operational visibility
              from receipt to delivery.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
              <Button
                className="h-11 w-full gap-2 rounded-xl px-7 shadow-md sm:w-auto"
                size="lg"
              >
                {isAuthenticated ? "Open Dashboard" : "Start Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                className="group h-11 w-full gap-2 rounded-xl px-7 sm:w-auto"
                size="lg"
              >
                <Play className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
                See how it works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
              {highlights.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/30"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-xs leading-tight font-medium">{label}</span>
                </div>
              ))}
            </div>
            {/* Trusted by */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium">Trusted by:</span>
              {trustedBy.map((name) => (
                <span key={name} className="font-semibold text-foreground/70">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — browser mockup */}
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute -inset-4 rounded-2xl bg-primary/8 blur-2xl" />

          <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
                app.agenthacks.io/dashboard
              </div>
              <div className="h-6 w-6 rounded-md bg-muted/60 flex items-center justify-center">
                <div className="h-1.5 w-3.5 rounded-sm bg-muted-foreground/40" />
              </div>
            </div>

            {/* Screenshot */}
            <div className="relative overflow-hidden rounded-b-2xl">
              {!imgLoaded && (
                <div className="aspect-video w-full animate-pulse bg-muted" />
              )}
              <Image
                src="/hero.png"
                alt="Inventory dashboard preview"
                width={1200}
                height={675}
                priority
                className="w-full object-cover object-top transition-opacity duration-500"
                style={{ opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
              />
              {/* Overlay badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-border/60 bg-background/90 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
