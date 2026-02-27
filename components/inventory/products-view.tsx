"use client";

import { useState } from "react";
import { ProductList } from "./product-list";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Package, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Boxes,
  Tag,
  Layers
} from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

interface ProductsViewProps {
  initialProducts: {
    id: string;
    name: string;
    sku: string;
    type: string;
    salesPrice: number;
    costPrice: number;
    minStock?: number;
    category?: { name: string } | null;
    stockLevels: { quantity: number; location?: { name: string; type: string } | null }[];
    [key: string]: unknown;
  }[];
}

export function ProductsView({ initialProducts }: ProductsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const productCount = initialProducts.length;

  // Calculate some basic stats from products
  const getStock = (p: ProductsViewProps["initialProducts"][number]) =>
    p.stockLevels.reduce((acc, sl) => {
      if (sl.location?.type?.toUpperCase().trim() === "INTERNAL") return acc + sl.quantity;
      return acc;
    }, 0);

  const lowStockCount = initialProducts.filter(p => getStock(p) <= (p.minStock ?? 0)).length;
  const totalValue = initialProducts.reduce((sum, p) => sum + (getStock(p) * p.costPrice), 0);
  const categoryCount = new Set(initialProducts.map(p => p.category?.name).filter(Boolean)).size;

  return (
    <div className="flex-1 space-y-6 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <Heading
                  title={`Products (${productCount})`}
                  description="Manage products and services"
                />
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-500">
                  <Package className="h-3.5 w-3.5" />
                  <span>{productCount} Total Products</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{lowStockCount} Low Stock</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>₹{totalValue.toLocaleString()}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{categoryCount} Categories</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="animate-in fade-in slide-in-from-right-2 duration-500">
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Product
                <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Stock</p>
                  <p className="text-lg font-bold">
                    {initialProducts.reduce((sum, p) => sum + getStock(p), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Price</p>
                  <p className="text-lg font-bold text-green-500">
                    ₹{productCount > 0 ? Math.round(totalValue / productCount).toLocaleString() : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-lg font-bold text-yellow-500">{lowStockCount}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Boxes className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categories</p>
                  <p className="text-lg font-bold">{categoryCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Content Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Product List
            </h2>
          </div>
          
          {/* Quick Filters Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {categoryCount} categories
            </span>
          </div>
        </div>

        {/* Product List */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <ProductList products={initialProducts} />
        </div>

        {/* Empty State */}
        {productCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6 border border-primary/20">
                <Package className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Get started by adding your first product to the inventory
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </div>
        )}

        {/* Summary Footer (when there are products) */}
        {productCount > 0 && (
          <div className="rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{productCount}</span> total products
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{categoryCount}</span> categories
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{lowStockCount}</span> low stock
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Dialog */}
      <ProductDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}