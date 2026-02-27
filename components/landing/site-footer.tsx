import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Heart,
  Star,
  Twitter,
  Facebook,
  Instagram,
  Award,
  TrendingUp,
  Package,
  Truck,
  Warehouse,
  Users,
  Rocket,
  LayoutDashboard
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

const productLinks = [
  { href: "#features" as Route, label: "Features", icon: Sparkles },
  { href: "#solutions" as Route, label: "Solutions", icon: Zap },
  { href: "#results" as Route, label: "Results", icon: TrendingUp },
  { href: "#pricing" as Route, label: "Pricing", icon: Package },
];

const companyLinks = [
  { href: "/about" as Route, label: "About Us", icon: Heart },
  { href: "/blog" as Route, label: "Blog", icon: Star },
  { href: "/careers" as Route, label: "Careers", icon: Users },
  { href: "/contact" as Route, label: "Contact", icon: Mail },
];

const resourceLinks = [
  { href: "/sign-up" as Route, label: "Get Started", icon: Rocket, highlight: true },
  { href: "/sign-in" as Route, label: "Sign In", icon: ArrowRight },
  { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
  { href: "/help" as Route, label: "Help Center", icon: Shield },
];

const solutions = [
  { icon: Package, label: "Inventory", color: "blue" },
  { icon: Truck, label: "Logistics", color: "green" },
  { icon: Warehouse, label: "Warehousing", color: "purple" },
  { icon: TrendingUp, label: "Analytics", color: "orange" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 p-8 md:p-10 overflow-hidden border border-primary/20">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Stay Updated</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Get inventory insights
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  delivered to your inbox
                </span>
              </h3>
              <p className="text-muted-foreground">
                Join 10,000+ operations managers getting weekly tips and updates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none"
              />
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group">
                Subscribe
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand Column - Expanded */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur group-hover:bg-primary/30 transition-all duration-300" />
                <Image
                  src="/logo_1.png"
                  alt="AgentHacks IMS"
                  width={44}
                  height={44}
                  className="relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AgentHacks IMS
              </span>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Enterprise-grade inventory management platform that helps teams
              streamline operations, reduce costs, and make data-driven decisions.
            </p>

            {/* Solution Tags */}
            <div className="flex flex-wrap gap-2">
              {solutions.map((item) => {
                const Icon = item.icon;
                const colors = {
                  blue: "text-blue-500",
                  green: "text-green-500",
                  purple: "text-purple-500",
                  orange: "text-orange-500"
                };
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs hover:bg-secondary/70 transition-all duration-300 hover:scale-105 cursor-default"
                  >
                    <Icon className={cn("h-3 w-3", colors[item.color as keyof typeof colors])} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Connect with us
              </h4>
              <div className="flex items-center gap-2">
                <Social href="#" label="GitHub" icon={Github} color="gray" />
                <Social href="#" label="LinkedIn" icon={Linkedin} color="blue" />
                <Social href="#" label="Twitter" icon={Twitter} color="sky" />
                <Social href="#" label="Facebook" icon={Facebook} color="blue" />
                <Social href="#" label="Instagram" icon={Instagram} color="pink" />
              </div>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">SOC2 Type II Certified</span>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterCol title="Product" links={productLinks} />
            <FooterCol title="Company" links={companyLinks} />
            <FooterCol title="Resources" links={resourceLinks} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © {currentYear} AgentHacks IMS. All rights reserved.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-green-500" />
                <span className="text-muted-foreground">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-muted-foreground">10K+ Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-muted-foreground">#1 Rated</span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                href={"/privacy" as Route}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href={"/terms" as Route}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href={"/cookies" as Route}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Made with love */}
          <div className="mt-6 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/50">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
            <span>by AgentHacks team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links
}: {
  title: string;
  links: Array<{ href: Route; label: string; icon?: ComponentType<{ className?: string }>; highlight?: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  "group inline-flex items-center gap-2 text-sm transition-all duration-200",
                  link.highlight
                    ? "text-primary font-medium hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && (
                  <Icon className={cn(
                    "h-4 w-4 transition-all duration-200",
                    link.highlight ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <span>{link.label}</span>
                {link.highlight && (
                  <Sparkles className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Social({
  href,
  label,
  icon: Icon,
  color = "gray"
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color?: string;
}) {
  const colorClasses = {
    gray: "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300",
    blue: "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400",
    sky: "hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400",
    pink: "hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/50 backdrop-blur-sm text-muted-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg",
        colorClasses[color as keyof typeof colorClasses]
      )}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}