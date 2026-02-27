import { getDashboardStats } from "@/app/actions/dashboard";
import { OperationCard } from "@/components/dashboard/operation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/ui/loader";
import { AlertTriangle, DollarSign, Package, Plus, Truck, TrendingUp, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { data: stats } = await getDashboardStats();

  if (!stats) {
    return <Loader variant="logo" size="lg" text="Loading dashboard..." fullScreen />;
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Heading
            title="Dashboard"
            description="Overview of your inventory operations"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Link href="/dashboard/operations/receipts" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto shadow-sm transition-all duration-300 hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Stock
            </Button>
          </Link>
          <Link href="/dashboard/operations/deliveries" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto border-2 hover:bg-secondary transition-all duration-300 hover:scale-105 active:scale-95">
              <Truck className="mr-2 h-4 w-4" /> Deliver Stock
            </Button>
          </Link>
        </div>
      </div>
      
      <Separator />

      {/* Operations Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold">Operations</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OperationCard
            title="Receipts"
            stats={stats.receipts}
            href="/dashboard/operations/receipts"
            color="blue"
          />
          <OperationCard
            title="Deliveries"
            stats={stats.deliveries}
            href="/dashboard/operations/deliveries"
            color="green"
          />
          <OperationCard
            title="Internal Transfers"
            stats={stats.internal}
            href="/dashboard/operations/internal"
            color="purple"
          />
        </div>
      </div>

      {/* Inventory Summary Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold">Inventory Overview</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Inventory Value Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Value
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">
                  ${stats.totalValue.toLocaleString()}
                </div>
                <div className="flex items-center text-[10px] text-green-500 font-medium">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Estimated cost value
              </p>
            </CardContent>
          </Card>

          {/* Low Stock Alerts Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-destructive/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Low Stock
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-all duration-300">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-destructive">
                  {stats.lowStockCount}
                </div>
                {stats.lowStockCount > 0 && (
                  <Link href="/dashboard/inventory" className="text-[10px] text-destructive font-medium hover:underline flex items-center gap-0.5">
                    View
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </Link>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Below minimum stock level
              </p>
            </CardContent>
          </Card>

          {/* Total Products Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Products
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-all duration-300">
                <Package className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">
                  {stats.totalProducts}
                </div>
                <div className="flex items-center text-[10px] text-green-500 font-medium">
                  <span>Active</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Active product variants
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
