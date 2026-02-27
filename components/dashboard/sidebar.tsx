"use client";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Tags,
  Users,
  Warehouse,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Route } from "next";

const sidebarGroups = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Receipts",
        href: "/dashboard/operations/receipts",
        icon: ArrowDownToLine,
      },
      {
        title: "Deliveries",
        href: "/dashboard/operations/deliveries",
        icon: ArrowUpFromLine,
      },
      {
        title: "All Operations",
        href: "/dashboard/operations",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Products",
        href: "/dashboard/inventory",
        icon: Package,
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
        icon: Tags,
      },
      {
        title: "Warehouses",
        href: "/dashboard/warehouses",
        icon: Warehouse,
      },
      {
        title: "Locations",
        href: "/dashboard/inventory/locations",
        icon: MapPin,
      },
    ],
  },
  {
    title: "Reporting",
    items: [
      {
        title: "Stock Moves",
        href: "/dashboard/moves",
        icon: History,
      },
      {
        title: "Current Stock",
        href: "/dashboard/stock",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Users",
        href: "/dashboard/contacts",
        icon: Users,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  mobile?: boolean;
  onMobileClose?: () => void;
}

function SidebarGroup({
  group,
  pathname,
  index,
}: {
  group: (typeof sidebarGroups)[0];
  pathname: string;
  index: number;
}) {
  const isActiveGroup = group.items.some((item) => item.href === pathname);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isActiveGroup) {
      setIsOpen(true);
    }
  }, [isActiveGroup]);

  return (
    <div 
      className="px-3 py-1.5 animate-in fade-in slide-in-from-left-2 duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between hover:bg-primary/5 hover:text-primary p-0 h-auto mb-2 px-4 group transition-all duration-200",
          isActiveGroup && "text-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className={cn(
          "text-xs font-semibold uppercase tracking-wider transition-colors duration-200",
          isActiveGroup ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )}>
          {group.title}
        </h3>
        <div className={cn(
          "transition-transform duration-200",
          isOpen ? "rotate-180" : "rotate-0"
        )}>
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </Button>
      
      <div className={cn(
        "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        {group.items.map((item, itemIndex) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-200 relative group/item",
                "hover:translate-x-1 hover:bg-primary/5",
                isActive && "bg-primary/10 text-primary font-medium shadow-sm",
                !isActive && "text-muted-foreground hover:text-foreground"
              )}
              asChild
            >
              <Link href={item.href as Route}>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full animate-in fade-in slide-in-from-left-1" />
                )}
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-primary",
                    "group-hover/item:scale-110"
                  )}
                />
                <span className="text-sm">{item.title}</span>
                {isActive && (
                  <Sparkles className="ml-auto h-3 w-3 text-primary/50 animate-pulse" />
                )}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ className, mobile, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        mobile ? "fixed left-0 top-0 z-50 w-72 animate-in slide-in-from-left-full" : "relative",
        className
      )}>
        {/* Header */}
        <div className="p-6 flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="relative h-10 w-10 shrink-0 group">
            <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
            <Image
              src="/logo.png"
              alt="IMS Logo"
              fill
              className="object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              AgentHacks IMS
            </h2>
            <p className="text-xs text-muted-foreground">Inventory Management</p>
          </div>
          {mobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onMobileClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20">
          <div className="space-y-2">
            {sidebarGroups.map((group, index) => (
              <SidebarGroup 
                key={group.title} 
                group={group} 
                pathname={pathname} 
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          
          <form action={signOut}>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Sign Out</span>
              <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                → 
              </span>
            </Button>
          </form>
          
          <div className="pt-2 text-center">
            <p className="text-[10px] text-muted-foreground/50">
              v2.0.0 • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 animate-in fade-in slide-in-from-left-2"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}