"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AIOptimizer({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runAI = async () => {
        setLoading(true);

        const res = await fetch("/api/agent/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        setResult(data);
        setLoading(false);
    };

    return (
        <div className="mt-8 rounded-xl border p-6 bg-card">
            <h2 className="text-lg font-bold mb-4">
                🧠 AI Inventory Optimization
            </h2>

            <Button onClick={runAI} disabled={loading}>
                {loading ? "Running AI..." : "Run AI Optimization"}
            </Button>

            {result && (
                <div className="mt-6 space-y-4 text-sm">
                    <div>
                        <strong>Trace ID:</strong> {result.traceId}
                    </div>

                    {result.actions?.map((a: any, i: number) => (
                        <div key={i} className="border rounded p-3">
                            <p><strong>Type:</strong> {a.type}</p>
                            <p><strong>Quantity:</strong> {a.quantity}</p>
                            <p><strong>Reason:</strong> {a.reason}</p>
                            {a.selectedSupplierId && (
                                <p><strong>Supplier:</strong> {a.selectedSupplierId}</p>
                            )}
                        </div>
                    ))}

                    <div>
                        <h3 className="font-semibold">AI Reasoning Trace</h3>
                        {result.auditLogs?.map((log: any, i: number) => (
                            <div key={i} className="border p-2 rounded mt-2">
                                <p className="font-semibold">{log.nodeName}</p>
                                <p>{log.reasoningString}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}