"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  MapPin,
  Tag,
  Layers,
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StockLevel {
  id: string;
  quantity: number;
  product: {
    name: string;
    sku: string;
    unitOfMeasure: string;
  };
  location: {
    name: string;
    shortCode: string;
    type: string;
  };
}

interface StockTableProps {
  stock: StockLevel[];
}

export function StockTable({ stock }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredStock = stock.filter((item) => {
    if (!normalizedSearch) return true;

    return (
      item.product.name.toLowerCase().includes(normalizedSearch) ||
      item.product.sku.toLowerCase().includes(normalizedSearch) ||
      item.location.name.toLowerCase().includes(normalizedSearch) ||
      item.location.shortCode.toLowerCase().includes(normalizedSearch) ||
      item.location.type.toLowerCase().includes(normalizedSearch)
    );
  });

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "text-red-600 dark:text-red-400", icon: TrendingDown };
    if (quantity < 10) return { label: "Low Stock", color: "text-yellow-600 dark:text-yellow-400", icon: Minus };
    return { label: "In Stock", color: "text-green-600 dark:text-green-400", icon: TrendingUp };
  };

  const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = new Set(stock.map(item => item.product.sku)).size;
  const uniqueLocations = new Set(stock.map(item => item.location.shortCode)).size;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search by product, SKU, location, type..."
            className="pl-9 pr-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-500">
          <Filter className="h-4 w-4" />
          <span>
            Showing <span className="font-medium text-foreground">{filteredStock.length}</span> of{" "}
            <span className="font-medium text-foreground">{stock.length}</span> entries
          </span>
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="text-right font-semibold">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No results found</p>
                          <p className="text-xs mt-1">
                            No stock entries match your search criteria
                          </p>
                          <Button
                            variant="link"
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-primary"
                          >
                            Clear search
                          </Button>
                        </>
                      ) : (
                        <>
                          <Package className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No stock found</p>
                          <p className="text-xs mt-1">
                            Stock levels will appear here when you create receipts or deliveries
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock.map((item, index) => {
                  const status = getStockStatus(item.quantity);
                  const StatusIcon = status.icon;

                  return (
                    <TableRow
                      key={item.id}
                      className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span>{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted/50 px-2 py-1 rounded border border-border/50">
                          {item.product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-primary/5 border-primary/20 font-mono"
                        >
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {item.location.name} ({item.location.shortCode})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-secondary/50"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {item.location.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StatusIcon className={cn("h-4 w-4", status.color)} />
                          <span className={cn(
                            "font-semibold",
                            status.color
                          )}>
                            {item.quantity} {item.product.unitOfMeasure}
                          </span>
                        </div>

                        {/* Progress bar for visual quantity indicator */}
                        <div className="mt-1 h-1 w-24 ml-auto bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              item.quantity <= 0 ? "bg-red-500" :
                                item.quantity < 10 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{
                              width: `${Math.min((item.quantity / 50) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Summary */}
        {filteredStock.length > 0 && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  <span>{filteredStock.length} entries shown</span>
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  <span>{uniqueProducts} products</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-green-500" />
                  <span>{uniqueLocations} locations</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  <span>In Stock: {stock.filter(s => s.quantity > 10).length}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Minus className="h-3.5 w-3.5 text-yellow-500" />
                  <span>Low: {stock.filter(s => s.quantity > 0 && s.quantity < 10).length}</span>
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  <span>Out: {stock.filter(s => s.quantity <= 0).length}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {filteredStock.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">In Stock</span>
            </div>
            <p className="text-lg font-bold text-green-500 mt-1">
              {stock.filter(s => s.quantity > 10).length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {totalQuantity} total units
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 p-3">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Low Stock</span>
            </div>
            <p className="text-lg font-bold text-yellow-500 mt-1">
              {stock.filter(s => s.quantity > 0 && s.quantity < 10).length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Below minimum threshold
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Out of Stock</span>
            </div>
            <p className="text-lg font-bold text-red-500 mt-1">
              {stock.filter(s => s.quantity <= 0).length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Need reordering
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Button component for empty state
function Button({ children, variant, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        className
      )}
    >
      {children}
    </button>
  );
}