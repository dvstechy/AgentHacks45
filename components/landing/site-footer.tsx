"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin, Mail, ArrowRight, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/40 bg-background/50 backdrop-blur-sm overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Gradient Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12 md:mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
              <div className="relative flex h-10 w-10 items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Image src="/logo.png" alt="IMS Logo" width={40} height={40} className="object-contain transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <span className="bg-linear-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent font-extrabold">
                IMS
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Modern inventory management for the modern business. Scalable, secure, and simple.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <SocialLink href="#" icon={Twitter} label="Twitter" />
              <SocialLink href="#" icon={Github} label="GitHub" />
              <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
              <SocialLink href="#" icon={Mail} label="Email" />
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-foreground flex items-center gap-2">
              Product
              <span className="h-px flex-1 bg-linear-to-r from-primary/50 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#pricing">Pricing</FooterLink>
              <FooterLink href="#integrations">Integrations</FooterLink>
              <FooterLink href="#changelog">Changelog</FooterLink>
              <FooterLink href="#roadmap">Roadmap</FooterLink>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-foreground flex items-center gap-2">
              Company
              <span className="h-px flex-1 bg-linear-to-r from-primary/50 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#about">About</FooterLink>
              <FooterLink href="#blog">Blog</FooterLink>
              <FooterLink href="#careers">Careers</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
              <FooterLink href="#press">Press Kit</FooterLink>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-foreground flex items-center gap-2">
              Legal
              <span className="h-px flex-1 bg-linear-to-r from-primary/50 to-transparent"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#privacy">Privacy Policy</FooterLink>
              <FooterLink href="#terms">Terms of Service</FooterLink>
              <FooterLink href="#security">Security</FooterLink>
              <FooterLink href="#cookies">Cookie Policy</FooterLink>
              <FooterLink href="#gdpr">GDPR</FooterLink>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-12 md:mb-16 p-6 md:p-8 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-purple-500/5 to-transparent backdrop-blur-sm">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h3 className="text-xl md:text-2xl font-bold">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest updates on new features, tips, and industry insights.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                className="group px-6 py-2.5 rounded-full bg-linear-to-r from-primary to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            © 2025 IMS Inc. All rights reserved. Made with{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />{" "}
            for businesses worldwide.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="#status" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Status
            </Link>
            <Link href="#docs" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link href="#api" className="hover:text-primary transition-colors">
              API
            </Link>
            <Link href="#support" className="hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href as any}
        className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-200">{children}</span>
        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
    </li>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 group"
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}
