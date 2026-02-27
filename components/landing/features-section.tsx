"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Box,
  ShieldCheck,
  Truck,
  Warehouse,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative container mx-auto px-4 md:px-6 py-16 md:py-20 lg:py-24 space-y-12 md:space-y-16 overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center justify-center px-3 py-1 mb-2 text-xs font-semibold text-primary bg-primary/10 rounded-full">
          Features
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Everything you need to{" "}
          <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            scale
          </span>
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Powerful features designed to help you maintain control over your
          inventory as your business grows.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <FeatureCard
          icon={Warehouse}
          title="Multi-Warehouse Management"
          description="Manage multiple warehouses and locations with hierarchical structures. Track stock across different physical locations effortlessly."
          color="text-blue-500"
          bg="bg-blue-500/10"
          hoverBg="group-hover:bg-blue-500/20"
          gradient="from-blue-500/20"
          index={0}
        />
        <FeatureCard
          icon={Box}
          title="Smart Product Tracking"
          description="Track storable, consumable, and service products. Manage variants, serial numbers, and batches with detailed attributes."
          color="text-green-500"
          bg="bg-green-500/10"
          hoverBg="group-hover:bg-green-500/20"
          gradient="from-green-500/20"
          index={1}
        />
        <FeatureCard
          icon={Truck}
          title="Automated Operations"
          description="Streamline receipts, deliveries, and internal transfers. Automate replenishment rules to never run out of stock."
          color="text-orange-500"
          bg="bg-orange-500/10"
          hoverBg="group-hover:bg-orange-500/20"
          gradient="from-orange-500/20"
          index={2}
        />
        <FeatureCard
          icon={BarChart3}
          title="Real-time Analytics"
          description="Get instant insights into stock levels, valuation, and turnover rates. Make data-driven decisions with customizable reports."
          color="text-purple-500"
          bg="bg-purple-500/10"
          hoverBg="group-hover:bg-purple-500/20"
          gradient="from-purple-500/20"
          index={3}
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Enterprise Security"
          description="Role-based access control (RBAC) ensures your data is secure. Audit logs track every movement and change in the system."
          color="text-red-500"
          bg="bg-red-500/10"
          hoverBg="group-hover:bg-red-500/20"
          gradient="from-red-500/20"
          index={4}
        />
        <FeatureCard
          icon={Globe}
          title="Global Scalability"
          description="Built to scale with your business. Support for multiple currencies, languages, and tax rules for international operations."
          color="text-cyan-500"
          bg="bg-cyan-500/10"
          hoverBg="group-hover:bg-cyan-500/20"
          gradient="from-cyan-500/20"
          index={5}
        />
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  bg,
  hoverBg,
  gradient,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  bg: string;
  hoverBg: string;
  gradient: string;
  index: number;
}) {
  return (
    <Card
      className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient Overlay on Hover */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      ></div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

      <CardHeader className="relative z-10 pb-3">
        {/* Icon Container with Advanced Styling */}
        <div className="relative mb-4 inline-flex">
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 ${bg} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-xl`}
          ></div>

          {/* Icon Background */}
          <div
            className={`relative h-14 w-14 flex items-center justify-center rounded-xl ${bg} ${hoverBg} ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}
          >
            <Icon
              className="h-7 w-7 transition-transform duration-500 group-hover:scale-110"
              strokeWidth={2}
            />
          </div>
        </div>

        <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
          {title}
          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90">
          {description}
        </CardDescription>
      </CardContent>

      {/* Bottom Border Accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
      ></div>
    </Card>
  );
}
