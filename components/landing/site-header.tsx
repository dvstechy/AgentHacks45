"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  session: unknown;
}

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#solutions", label: "Solutions" },
  { href: "#results", label: "Results" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader({ session }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto flex h-15 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <Image src="/logo_1.png" alt="AgentHacks IMS" width={32} height={32} className="transition-transform duration-300 group-hover:scale-105" />
          </div>
          <span className="text-base font-extrabold tracking-tight md:text-lg">
            AgentHacks <span className="text-primary">IMS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-xl">Dashboard →</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-xl shadow-sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="container mx-auto max-w-6xl px-4 py-3 md:px-6">
            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
                {!isAuthenticated && (
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl" size="sm">
                      Sign in
                    </Button>
                  </Link>
                )}
                <Link
                  href={isAuthenticated ? "/dashboard" : "/sign-up"}
                  onClick={() => setOpen(false)}
                >
                  <Button className="w-full rounded-xl" size="sm">
                    {isAuthenticated ? "Dashboard" : "Get started →"}
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
