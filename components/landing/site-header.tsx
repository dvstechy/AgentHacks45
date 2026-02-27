"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const isAuthenticated = Boolean(session);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="AgentHacks IMS" width={34} height={34} />
          <span className="text-base font-extrabold tracking-tight md:text-lg">
            AgentHacks <span className="text-primary">IMS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-lg">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="rounded-lg">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-lg">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container mx-auto max-w-6xl px-4 py-4 md:px-6">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {item.label}
                </a>
              ))}
              {!isAuthenticated && (
                <Link href="/sign-in" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  Sign in
                </Link>
              )}
              {isAuthenticated && (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  Dashboard
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
