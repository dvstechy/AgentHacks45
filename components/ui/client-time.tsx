"use client";

import { useEffect, useState } from "react";

interface ClientTimeProps {
    format?: "time" | "full";
    className?: string;
}

export function ClientTime({ format = "time", className }: ClientTimeProps) {
    const [mounted, setMounted] = useState(false);
    const [time, setTime] = useState("");

    useEffect(() => {
        setMounted(true);
        const now = new Date();
        setTime(format === "time" ? now.toLocaleTimeString() : now.toLocaleString());
    }, [format]);

    if (!mounted) {
        return <span className={className}>Loading...</span>;
    }

    return <span className={className}>{time}</span>;
}
