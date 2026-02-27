"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="w-full justify-start px-2">
                <Sun className="h-4 w-4 mr-2" />
                <span className="text-sm">Theme</span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            {theme === "light" ? (
                <>
                    <Moon className="h-4 w-4 mr-2" />
                    <span>Dark Mode</span>
                </>
            ) : (
                <>
                    <Sun className="h-4 w-4 mr-2" />
                    <span>Light Mode</span>
                </>
            )}
        </Button>
    );
}
