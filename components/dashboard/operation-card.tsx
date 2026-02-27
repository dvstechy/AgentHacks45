import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Clock, AlertCircle, ArrowRight } from "lucide-react";
import type { Route } from "next";
import type { OperationStats } from "@/app/actions/dashboard";

interface OperationCardProps {
  title: string;
  stats: OperationStats;
  href: string;
  color?: "blue" | "green" | "purple" | "orange";
  icon?: LucideIcon;
}

export function OperationCard({
  title,
  stats,
  href,
  color = "blue",
  icon: Icon = ArrowRight,
}: OperationCardProps) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 theme-blue",
    green: "text-green-500 bg-green-500/10 border-green-500/20 theme-green",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 theme-purple",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 theme-orange",
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold transition-colors group-hover:text-primary">
            {title}
          </CardTitle>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110", colorMap[color])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          {/* Main Action Button */}
          <Link href={`${href}?status=ready` as Route} className="flex-1">
            <Button
              variant="secondary"
              className="w-full h-auto flex-col items-start px-4 py-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95"
            >
              <span className="text-2xl font-bold mb-0.5">
                {stats.toProcess}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                To Process
              </span>
            </Button>
          </Link>

          {/* Status Indicators */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Late Status */}
            <Link
              href={`${href}?status=late` as Route}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 transition-all duration-300 hover:bg-destructive/10",
                stats.late > 0 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs font-bold">{stats.late}</span>
              <span className="text-[10px] hidden sm:inline">Late</span>
            </Link>

            {/* Waiting Status */}
            <Link
              href={`${href}?status=waiting` as Route}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground transition-all duration-300 hover:bg-muted"
            >
              <Clock className="h-3 w-3" />
              <span className="text-xs font-bold">{stats.waiting}</span>
              <span className="text-[10px] hidden sm:inline">Waiting</span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
