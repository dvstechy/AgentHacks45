"use client";

/**
 * Dynamic Chart Component
 * Renders Chart.js charts based on LLM-suggested configurations.
 * Supports: Bar, Line, Pie, Doughnut, Horizontal Bar
 */

import { useRef, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ─────────────────────────────────────────────────────────────────
// Chart Config type (matches TextToSQLResult.chartConfig)
// ─────────────────────────────────────────────────────────────────

export interface ChartConfig {
    chartType: "bar" | "line" | "pie" | "doughnut" | "horizontalBar";
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }[];
}

// ─────────────────────────────────────────────────────────────────
// Color Palettes
// ─────────────────────────────────────────────────────────────────

const CHART_COLORS = [
    "rgba(99, 102, 241, 0.8)",   // Indigo
    "rgba(168, 85, 247, 0.8)",   // Purple
    "rgba(14, 165, 233, 0.8)",   // Sky
    "rgba(16, 185, 129, 0.8)",   // Emerald
    "rgba(245, 158, 11, 0.8)",   // Amber
    "rgba(239, 68, 68, 0.8)",    // Red
    "rgba(236, 72, 153, 0.8)",   // Pink
    "rgba(34, 197, 94, 0.8)",    // Green
    "rgba(59, 130, 246, 0.8)",   // Blue
    "rgba(251, 146, 60, 0.8)",   // Orange
];

const CHART_BORDERS = CHART_COLORS.map((c) => c.replace("0.8", "1"));

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

interface DynamicChartProps {
    config: ChartConfig;
}

export function DynamicChart({ config }: DynamicChartProps) {
    const chartRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    if (!config || !config.labels || config.labels.length === 0) {
        return null;
    }

    // Auto-assign colors if not provided
    const datasets = config.datasets.map((ds, i) => ({
        ...ds,
        backgroundColor:
            ds.backgroundColor ||
            (config.chartType === "pie" || config.chartType === "doughnut"
                ? CHART_COLORS.slice(0, config.labels.length)
                : CHART_COLORS[i % CHART_COLORS.length]),
        borderColor:
            ds.borderColor ||
            (config.chartType === "pie" || config.chartType === "doughnut"
                ? CHART_BORDERS.slice(0, config.labels.length)
                : CHART_BORDERS[i % CHART_BORDERS.length]),
        borderWidth: ds.borderWidth || (config.chartType === "line" ? 2 : 1),
        fill: ds.fill ?? config.chartType === "line",
        tension: 0.4,
        pointRadius: config.chartType === "line" ? 4 : undefined,
        pointHoverRadius: config.chartType === "line" ? 6 : undefined,
    }));

    const chartData = { labels: config.labels, datasets };

    const basePlugins = {
        legend: {
            display:
                config.datasets.length > 1 ||
                config.chartType === "pie" ||
                config.chartType === "doughnut",
            position: "bottom" as const,
            labels: {
                font: { size: 10 },
                padding: 8,
                usePointStyle: true,
                pointStyleWidth: 8,
            },
        },
        title: {
            display: !!config.title,
            text: config.title,
            font: { size: 12, weight: "bold" as const },
            padding: { bottom: 8 },
        },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            padding: 8,
            cornerRadius: 6,
        },
    };

    const barLineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins,
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 }, maxRotation: 45 },
            },
            y: {
                grid: { color: "rgba(148, 163, 184, 0.1)" },
                ticks: { font: { size: 10 } },
                beginAtZero: true,
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins,
    };

    const horizontalOptions = {
        ...barLineOptions,
        indexAxis: "y" as const,
    };

    return (
        <div className="w-full h-48 mt-2">
            {config.chartType === "bar" && (
                <Bar data={chartData} options={barLineOptions} />
            )}
            {config.chartType === "horizontalBar" && (
                <Bar data={chartData} options={horizontalOptions} />
            )}
            {config.chartType === "line" && (
                <Line data={chartData} options={barLineOptions} />
            )}
            {config.chartType === "pie" && (
                <Pie data={chartData} options={pieOptions} />
            )}
            {config.chartType === "doughnut" && (
                <Doughnut data={chartData} options={pieOptions} />
            )}
        </div>
    );
}
