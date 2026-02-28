"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
}

interface TabsContextType {
    value: string;
    setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({ defaultValue, className, children }: TabsProps) {
    const [value, setValue] = React.useState(defaultValue);
    return (
        <TabsContext.Provider value={{ value, setValue }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full", className)}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
        <button
            onClick={() => context.setValue(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full",
                isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return (
        <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in duration-300", className)}>
            {children}
        </div>
    );
}
