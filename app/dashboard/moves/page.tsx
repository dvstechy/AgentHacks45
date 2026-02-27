import { Suspense } from "react";
import { getStockMoves } from "@/app/actions/stock";
import { MovesContainer } from "@/components/inventory/moves-container";
import { 
  History, 
  Package, 
  TrendingUp, 
  ArrowRightLeft,
  Sparkles,
  Clock,
  Activity
} from "lucide-react";

export default async function StockMovesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const { data: moves } = await getStockMoves(query);
  const moveCount = moves?.length || 0;

  // Calculate some stats
  const uniqueProducts = new Set(moves?.map(m => m.productId)).size || 0;
  const totalQuantity = moves?.reduce((sum, m) => sum + m.quantity, 0) || 0;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Stock Moves History
                    </h1>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {moveCount} moves
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground mt-1">
                    View the history of all product movements across your warehouses
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary border border-primary/20">
                <History className="h-3.5 w-3.5" />
                {moveCount} total moves
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Package className="h-3.5 w-3.5" />
                {uniqueProducts} products
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20">
                <TrendingUp className="h-3.5 w-3.5" />
                {totalQuantity} units
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Moves</p>
                  <p className="text-xl sm:text-2xl font-bold">{moveCount}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-500">{uniqueProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Units</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-500">{totalQuantity}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg per Move</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {moveCount > 0 ? Math.round(totalQuantity / moveCount) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Movement History
            </h2>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Inbound</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Outbound</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Transfer</span>
            </div>
          </div>
        </div>

        {/* Moves Container with Suspense */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mb-4 border border-primary/20 animate-pulse">
                <Activity className="h-8 w-8 text-primary/40" />
              </div>
            </div>
            <p className="text-sm font-medium">Loading movement history...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we fetch your data
            </p>
          </div>
        }>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <MovesContainer moves={moves || []} />
          </div>
        </Suspense>

        {/* Empty State */}
        {moveCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mb-6 border border-primary/20">
                <History className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No stock moves yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Stock movements will appear here when you create receipts, deliveries, or transfers
            </p>
          </div>
        )}

        {/* Info Footer */}
        {moveCount > 0 && (
          <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span>
                  <span className="font-medium text-foreground">{moveCount}</span> total movements
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span>
                  <span className="font-medium text-foreground">{uniqueProducts}</span> unique products
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>
                  <span className="font-medium text-foreground">{totalQuantity}</span> units moved
                </span>
              </div>
              <div className="text-xs w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}