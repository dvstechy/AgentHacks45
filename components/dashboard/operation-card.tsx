import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, ArrowRight } from "lucide-react";

interface OperationStats {
  toProcess: number;
  late: number;
  waiting: number;
}

interface OperationCardProps {
  title: string;
  stats: OperationStats;
  href: string;
  color?: "blue" | "green" | "purple" | "orange";
}

export function OperationCard({
  title,
  stats,
  href,
  color = "blue",
}: OperationCardProps) {
  const colorConfig = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      bg: "bg-blue-500/10",
      hoverBg: "hover:bg-blue-500/20",
      text: "text-blue-500",
      border: "border-blue-500/30",
      shadow: "shadow-blue-500/20",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      hoverGradient: "hover:from-green-600 hover:to-green-700",
      bg: "bg-green-500/10",
      hoverBg: "hover:bg-green-500/20",
      text: "text-green-500",
      border: "border-green-500/30",
      shadow: "shadow-green-500/20",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "hover:from-purple-600 hover:to-purple-700",
      bg: "bg-purple-500/10",
      hoverBg: "hover:bg-purple-500/20",
      text: "text-purple-500",
      border: "border-purple-500/30",
      shadow: "shadow-purple-500/20",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "hover:from-orange-600 hover:to-orange-700",
      bg: "bg-orange-500/10",
      hoverBg: "hover:bg-orange-500/20",
      text: "text-orange-500",
      border: "border-orange-500/30",
      shadow: "shadow-orange-500/20",
    },
  };

  const config = colorConfig[color];

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30">
      {/* Background Gradient Effect */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          config.bg
        )}
      ></div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              "text-lg font-bold transition-colors group-hover:text-primary",
              config.text
            )}
          >
            {title}
          </CardTitle>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          {/* Main Action Button */}
          <Link href={`${href}?status=ready` as any} className="flex-1">
            <Button
              className={cn(
                "w-full h-auto flex-col items-start px-6 py-4 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
                `bg-linear-to-br ${config.gradient} ${config.hoverGradient}`,
                config.shadow
              )}
            >
              <span className="text-4xl font-extrabold mb-1">
                {stats.toProcess}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                To Process
              </span>
            </Button>
          </Link>

          {/* Status Indicators */}
          <div className="flex flex-col gap-3">
            {/* Late Status */}
            <Link
              href={`${href}?status=late` as any}
              className={cn(
                "group/item flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 hover:scale-105",
                stats.late > 0
                  ? "bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <AlertCircle
                className={cn(
                  "h-4 w-4",
                  stats.late > 0 ? "text-orange-500" : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col items-start">
                <span
                  className={cn(
                    "text-sm font-bold",
                    stats.late > 0 ? "text-orange-600" : "text-muted-foreground"
                  )}
                >
                  {stats.late}
                </span>
                <span className="text-xs text-muted-foreground">Late</span>
              </div>
            </Link>

            {/* Waiting Status */}
            <Link
              href={`${href}?status=waiting` as any}
              className="group/item flex items-center gap-2 rounded-lg px-3 py-2 bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-muted-foreground">
                  {stats.waiting}
                </span>
                <span className="text-xs text-muted-foreground">Waiting</span>
              </div>
            </Link>
          </div>
        </div>
      </CardContent>

      {/* Bottom Border Accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left",
          `bg-linear-to-r ${config.gradient}`
        )}
      ></div>
    </Card>
  );
}
