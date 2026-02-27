"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface SiteHeaderProps {
  session: any;
}

export function SiteHeader({ session }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      {/* Gradient Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="container mx-auto flex h-16 md:h-18 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
          <div className="relative flex h-9 w-9 items-center justify-center transition-all duration-300 group-hover:scale-110">
            <Image src="/logo.png" alt="IMS Logo" width={36} height={36} className="object-contain transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="bg-linear-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent font-extrabold transition-all duration-300">
            IMS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#solutions">Solutions</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          {session && (
            <NavLink href="/dashboard" active>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button 
                size="sm" 
                className="rounded-full px-6 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button 
                  size="sm" 
                  className="rounded-full px-6 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-slide-down">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <MobileNavLink href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </MobileNavLink>
            <MobileNavLink href="#solutions" onClick={() => setMobileMenuOpen(false)}>
              Solutions
            </MobileNavLink>
            <MobileNavLink href="#pricing" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </MobileNavLink>
            {session && (
              <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </MobileNavLink>
            )}
            {!session && (
              <Link href="/sign-in" className="sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}

function NavLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href as any}
      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group ${
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      }`}
    >
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300"></span>
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href as any}
      onClick={onClick}
      className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-primary/5"
    >
      {children}
    </Link>
  );
}
