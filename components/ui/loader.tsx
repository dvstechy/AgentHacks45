"use client";

import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bars" | "logo";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = "md",
  variant = "logo",
  text,
  className,
  fullScreen = false,
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex items-center justify-center p-8";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-4">
        {/* Loader Variants */}
        {variant === "spinner" && <SpinnerLoader size={sizeClasses[size]} />}
        {variant === "dots" && <DotsLoader size={size} />}
        {variant === "pulse" && <PulseLoader size={sizeClasses[size]} />}
        {variant === "bars" && <BarsLoader size={size} />}
        {variant === "logo" && <LogoLoader size={sizeClasses[size]} />}

        {/* Loading Text */}
        {text && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Spinner Loader - Classic spinning circle
function SpinnerLoader({ size }: { size: string }) {
  return (
    <div className="relative">
      <div
        className={cn(
          size,
          "rounded-full border-4 border-muted animate-spin border-t-primary"
        )}
      />
      <div
        className={cn(
          size,
          "absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin-slow opacity-50"
        )}
      />
    </div>
  );
}

// Dots Loader - Three bouncing dots
function DotsLoader({ size }: { size: string }) {
  const dotSizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  const dotSize = dotSizes[size as keyof typeof dotSizes];

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(dotSize, "rounded-full bg-primary animate-bounce")}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={cn(dotSize, "rounded-full bg-purple-500 animate-bounce")}
        style={{ animationDelay: "0.15s" }}
      />
      <div
        className={cn(dotSize, "rounded-full bg-pink-500 animate-bounce")}
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

// Pulse Loader - Expanding circles
function PulseLoader({ size }: { size: string }) {
  return (
    <div className="relative">
      <div
        className={cn(size, "rounded-full bg-primary animate-ping opacity-75")}
      />
      <div
        className={cn(
          size,
          "absolute inset-0 rounded-full bg-linear-to-br from-primary to-purple-600"
        )}
      />
    </div>
  );
}

// Bars Loader - Animated bars
function BarsLoader({ size }: { size: string }) {
  const barHeights = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };

  const barWidth = {
    sm: "w-1",
    md: "w-1.5",
    lg: "w-2",
    xl: "w-3",
  };

  const height = barHeights[size as keyof typeof barHeights];
  const width = barWidth[size as keyof typeof barWidth];

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            width,
            height,
            "rounded-full bg-linear-to-t from-primary to-purple-600 animate-bar-scale origin-bottom"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Logo Loader - Branded loader with logo
function LogoLoader({ size }: { size: string }) {
  return (
    <div className="relative">
      {/* Outer rotating ring */}
      <div
        className={cn(
          size,
          "absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"
        )}
      />

      {/* Middle rotating ring */}
      <div
        className={cn(
          size,
          "absolute inset-0 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin-slow-reverse"
        )}
      />

      {/* Inner glow */}
      <div
        className={cn(
          size,
          "absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-purple-500/20 blur-md animate-pulse-slow"
        )}
      />

      {/* Logo in center */}
      <div
        className={cn(size, "flex items-center justify-center relative z-10")}
      >
        <div className="flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-purple-600 p-2 shadow-lg">
          <Box className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Page Loader - Full screen loader for page transitions
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Logo and Loader */}
      <div className="relative">
        <LogoLoader size="h-24 w-24" />
      </div>

      {/* Loading Text */}
      <div className="mt-8 space-y-2 text-center">
        <p className="text-lg font-semibold">{text}</p>
        <div className="flex items-center justify-center gap-1">
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader - For content loading
export function SkeletonLoader({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

// Card Skeleton - For card loading states
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonLoader className="h-8 w-32" />
      <SkeletonLoader className="h-3 w-full" />
    </div>
  );
}

// Table Skeleton - For table loading states
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonLoader className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-3/4" />
            <SkeletonLoader className="h-3 w-1/2" />
          </div>
          <SkeletonLoader className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// Custom Animations (add to globals.css or use inline styles)
const styles = `
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-slow-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes bar-scale {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-spin-slow-reverse {
  animation: spin-slow-reverse 4s linear infinite;
}

.animate-bar-scale {
  animation: bar-scale 1s ease-in-out infinite;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;
