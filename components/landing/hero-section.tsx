"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Users, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  session: any;
}

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
      {/* Multi-layer Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background"></div>
        
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-linear-to-br from-primary/10 via-purple-500/10 to-transparent blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        {/* Badge with Sparkle Effect */}
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-linear-to-r from-background/95 to-background/80 backdrop-blur-xl px-4 py-1.5 text-sm font-medium shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 hover:scale-105 group mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary mr-2 animate-pulse" />
          <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent font-semibold">
            New: Advanced Analytics Dashboard
          </span>
          <span className="ml-2 text-xs text-muted-foreground">→</span>
        </div>

        {/* Main Heading with Staggered Animation */}
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-4 animate-fade-in-up">
          <span className="block text-foreground">
            Master Your Inventory
          </span>
          <span className="block mt-2 bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
            Optimize Your Growth
          </span>
        </h1>

        {/* Subtitle with Enhanced Typography */}
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed mb-6 animate-fade-in-up animation-delay-200">
          The all-in-one platform to manage warehouses, track stock movements, and forecast demand with{" "}
          <span className="text-foreground font-semibold">precision</span>. Built for modern businesses.
        </p>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Free 14-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Enterprise-grade security</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>10,000+ businesses</span>
          </div>
        </div>

        {/* CTA Buttons with Enhanced Effects */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12 animate-fade-in-up animation-delay-400">
          <Link href={session ? "/dashboard" : "/sign-up"} className="group">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 h-11 px-8 text-base font-semibold rounded-full bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {session ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-11 px-8 text-base font-semibold rounded-full border-2 hover:bg-secondary/80 hover:border-primary/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl group"
            >
              <span className="flex items-center gap-2">
                View Demo
                <TrendingUp className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview with 3D Perspective Effect */}
        <div className="relative w-full max-w-6xl mx-auto animate-fade-in-up animation-delay-600 perspective-1000">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50 animate-pulse-slow"></div>
          
          {/* Main Preview Container */}
          <div className="relative rounded-2xl border border-border/50 bg-linear-to-br from-background/80 to-background/40 p-2 shadow-2xl backdrop-blur-xl lg:rounded-3xl lg:p-3 transform-gpu hover:rotate-y-2 transition-transform duration-500 group">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 mb-2 px-3 py-2 border-b border-border/50">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 mx-3 h-5 bg-muted/50 rounded-md flex items-center px-3 text-xs text-muted-foreground">
                <span className="opacity-60">yourapp.com/dashboard</span>
              </div>
            </div>
            
            {/* Dashboard Image */}
            <div className="rounded-xl border border-border/50 bg-background overflow-hidden aspect-video relative shadow-inner">
              <Image 
                src="/hero.png" 
                alt="Dashboard Preview" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-linear-to-tr from-pink-500/20 to-primary/20 rounded-full blur-2xl animate-float animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* Custom Animations Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </section>
  );
}
