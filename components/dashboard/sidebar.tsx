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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarGroup({
  group,
  pathname,
}: {
  group: (typeof sidebarGroups)[0];
  pathname: string;
}) {
  const isActiveGroup = group.items.some((item) => item.href === pathname);
  const [isOpen, setIsOpen] = useState(true);

  // Auto-open if a child is active, but allow manual toggle
  useEffect(() => {
    if (isActiveGroup) {
      setIsOpen(true);
    }
  }, [isActiveGroup]);

  return (
    <div className="px-3 py-2">
      <Button
        variant="ghost"
        className="w-full justify-between hover:bg-transparent hover:text-primary p-0 h-auto mb-2 px-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          {group.title}
        </h3>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
      {isOpen && (
        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-colors",
                  isActive && "bg-secondary/50 font-medium text-primary"
                )}
                asChild
              >
                <Link href={item.href as any}>
                  <item.icon
                    className={cn(
                      "mr-2 h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="relative h-8 w-8 shrink-0">
          <Image
            src="/logo.png"
            alt="IMS Logo"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          IMS
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {sidebarGroups.map((group) => (
            <SidebarGroup key={group.title} group={group} pathname={pathname} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/10">
        <form action={signOut}>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
