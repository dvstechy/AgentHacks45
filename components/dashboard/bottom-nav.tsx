"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Sparkles,
  Menu,
} from "lucide-react";
import type { Route } from "next";

const bottomNavItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "AI",
    href: "/dashboard/command-center",
    icon: Sparkles,
    highlight: true,
  },
  {
    title: "Operations",
    href: "/dashboard/operations",
    icon: ArrowRightLeft,
  },
];

interface BottomNavProps {
  onMenuClick: () => void;
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Frosted glass background */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {/* Safe area padding for devices with home indicator */}
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95",
                  item.highlight && !isActive && "text-primary/60"
                )}
              >
                {/* Active indicator dot */}
                <div className="relative">
                  {item.highlight ? (
                    <div
                      className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                          : "bg-primary/10"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                  ) : (
                    <>
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-200",
                          isActive && "scale-110"
                        )}
                      />
                      {isActive && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary animate-in fade-in zoom-in duration-200" />
                      )}
                    </>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-all duration-200",
                    isActive ? "text-primary font-semibold" : "",
                    item.highlight && !isActive && "text-primary/60"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}

          {/* More button to open sidebar */}
          <button
            onClick={onMenuClick}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl text-muted-foreground transition-all duration-200 active:scale-95"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
