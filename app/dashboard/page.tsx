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
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 pt-6">
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
            <Button className="w-full sm:w-auto bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Add Stock
            </Button>
          </Link>
          <Link href="/dashboard/operations/deliveries" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto border-2 hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <Truck className="mr-2 h-4 w-4" /> Deliver Stock
            </Button>
          </Link>
        </div>
      </div>
      
      <Separator className="bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Operations Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-linear-to-b from-primary to-purple-600 rounded-full"></div>
          <h2 className="text-xl font-bold">Operations</h2>
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
          <div className="h-8 w-1 bg-linear-to-b from-primary to-purple-600 rounded-full"></div>
          <h2 className="text-xl font-bold">Inventory Overview</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Inventory Value Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Inventory Value
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold group-hover:text-primary transition-colors">
                  ${stats.totalValue.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-500 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Estimated cost value of all stock
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Card>

          {/* Low Stock Alerts Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 hover:border-orange-500/30">
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Low Stock Alerts
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
                <AlertTriangle className="h-5 w-5 text-orange-500 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold group-hover:text-orange-500 transition-colors">
                  {stats.lowStockCount}
                </div>
                {stats.lowStockCount > 0 && (
                  <Link href="/dashboard/inventory" className="text-xs text-orange-500 font-medium hover:underline flex items-center gap-1">
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Products below minimum stock level
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Card>

          {/* Total Products Card */}
          <Card className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:border-purple-500/30">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Total Products
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold group-hover:text-purple-500 transition-colors">
                  {stats.totalProducts}
                </div>
                <div className="flex items-center text-xs text-green-500 font-medium">
                  <span>Active</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active product variants
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
