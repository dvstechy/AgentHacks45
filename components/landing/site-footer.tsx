import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import type { ComponentType } from "react";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#solutions", label: "Solutions" },
  { href: "#results", label: "Results" },
];

const companyLinks = [
  { href: "/sign-up", label: "Get Started" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6 md:py-14">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AgentHacks IMS" width={34} height={34} />
            <span className="text-base font-extrabold tracking-tight">AgentHacks IMS</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Inventory management for teams that need reliable stock data, faster operations,
            and cleaner process control.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Social href="#" label="GitHub" icon={Github} />
            <Social href="#" label="LinkedIn" icon={Linkedin} />
            <Social href="#" label="Email" icon={Mail} />
          </div>
        </div>

        <FooterCol title="Product" links={productLinks} />
        <FooterCol title="Company" links={companyLinks} />
      </div>

      <div className="border-t border-border/60">
        <div className="container mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>© 2026 AgentHacks IMS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
