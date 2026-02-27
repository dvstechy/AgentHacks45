import { getDashboardStats, getReorderRecommendations } from "@/app/actions/dashboard";
import { OperationCard } from "@/components/dashboard/operation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Loader } from "@/components/ui/loader";
import {
  AlertTriangle,
  DollarSign,
  Package,
  Plus,
  Truck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { AIOptimizer } from "@/components/dashboard/ai-optimizer";

export default async function DashboardPage() {
  const [{ data: stats }, { data: recommendations }] = await Promise.all([
    getDashboardStats(),
    getReorderRecommendations(),
  ]);

  if (!stats) {
    return <Loader variant="logo" size="lg" text="Loading dashboard..." fullScreen />;
  }
  const demoUserId = "cmm550afg0000rzjo76ot3h1t";

  // Calculate additional metrics
  const totalOperations = stats.receipts.total + stats.deliveries.total + stats.internal.total;
  const completionRate = totalOperations > 0
    ? Math.round(((stats.receipts.completed + stats.deliveries.completed + stats.internal.completed) / totalOperations) * 100)
    : 0;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full animate-pulse" />
              <Heading
                title="Welcome back!"
                description="Here's what's happening with your inventory today"
              />
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500">
                <Activity className="h-3.5 w-3.5" />
                <span>All systems operational</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
            <Link href="/dashboard/operations/receipts" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Stock
                <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link href="/dashboard/operations/deliveries" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto group relative overflow-hidden border-2 hover:bg-secondary/80 transition-all duration-300 hover:scale-105 active:scale-95">
                <Truck className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1" />
                Deliver Stock
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Operations",
            value: totalOperations,
            icon: BarChart3,
            color: "blue",
            change: "+8.2%",
            trend: "up"
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: CheckCircle2,
            color: "green",
            change: "+5.1%",
            trend: "up"
          },
          {
            label: "Pending Tasks",
            value: stats.receipts.pending + stats.deliveries.pending + stats.internal.pending,
            icon: Clock,
            color: "yellow",
            change: "-3",
            trend: "down"
          },
          {
            label: "Issues",
            value: stats.receipts.issues + stats.deliveries.issues + stats.internal.issues,
            icon: XCircle,
            color: "red",
            change: "+2",
            trend: "up"
          }
        ].map((stat, index) => {
          const colorVariants = {
            blue: "bg-blue-500/10 text-blue-500 from-blue-500/5",
            green: "bg-green-500/10 text-green-500 from-green-500/5",
            yellow: "bg-yellow-500/10 text-yellow-500 from-yellow-500/5",
            red: "bg-red-500/10 text-red-500 from-red-500/5",
          };
          const colors = colorVariants[stat.color as keyof typeof colorVariants];

          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", colors.split(' ')[2])} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300", colors.split(' ').slice(0, 2).join(' '))}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl lg:text-xl sm:text-2xl font-bold">{stat.value}</span>
                  <span className={cn("text-xs font-medium flex items-center gap-0.5",
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {stat.change}
                    <TrendingUp className={cn("h-3 w-3", stat.trend === 'down' && 'rotate-180')} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight">Operations Overview</h2>
          </div>
          <Link
            href="/dashboard/operations"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
          >
            View all
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
            <OperationCard
              title="Receipts"
              stats={stats.receipts}
              href="/dashboard/operations/receipts"
              color="blue"
              icon={ArrowDownToLine}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
            <OperationCard
              title="Deliveries"
              stats={stats.deliveries}
              href="/dashboard/operations/deliveries"
              color="green"
              icon={ArrowUpFromLine}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '300ms' }}>
            <OperationCard
              title="Internal Transfers"
              stats={stats.internal}
              href="/dashboard/operations/internal"
              color="purple"
              icon={ArrowRightLeft}
            />
          </div>
        </div>
      </div>

      {/* Inventory Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight">Inventory Overview</h2>
          </div>
          <Link
            href="/dashboard/inventory"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
          >
            Manage inventory
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Inventory Value Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Inventory Value
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-xl sm:text-2xl font-bold">
                  {formatINR(stats.totalValue)}
                </div>
                <div className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +12.3%
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Estimated cost value</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>Last 30 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-destructive/30 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Low Stock Alerts
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 group-hover:scale-110 transition-all duration-300">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-bold text-destructive">
                  {stats.lowStockCount}
                </div>
                {stats.lowStockCount > 0 && (
                  <Link
                    href="/dashboard/inventory?filter=low-stock"
                    className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full hover:bg-destructive/20 transition-colors group/link"
                  >
                    View details
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Products below minimum stock level
              </p>
              {stats.lowStockCount > 0 && (
                <div className="mt-3 h-1.5 w-full bg-destructive/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.lowStockCount / stats.totalProducts) * 100, 100)}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Products Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Products
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-secondary/80 group-hover:scale-110 transition-all duration-300">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl lg:text-3xl font-bold">
                  {stats.totalProducts}
                </div>
                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Across {stats.warehouseCount || 3} warehouses</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>{stats.categoryCount || 12} categories</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reorder Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-500/50 rounded-full" />
            <h2 className="text-xl font-bold tracking-tight">Reorder Recommendations</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((item, index) => (
              <Card
                key={item.productId}
                className="group border border-border/50 bg-card/50 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      item.priority === 'HIGH' ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                    )}>
                      {item.priority} PRIORITY
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.sku}</span>
                  </div>
                  <CardTitle className="text-sm font-bold truncate mt-2">{item.productName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Current Stock</span>
                    <span className="font-bold">{item.currentStock}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Suggest Order</span>
                    <span className="font-bold text-primary">+{item.suggestedOrderQty}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" className="w-full h-8 text-[11px] group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <Link href={`/dashboard/operations/receipts?productId=${item.productId}`}>
                        Create Receipt
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <AIOptimizer userId={demoUserId} />
    </div>
  );
}