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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Pencil, 
  Search, 
  Trash2,
  Package,
  Tag,
  Layers,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Filter
} from "lucide-react";
import * as React from "react";
import { ProductDialog } from "./product-dialog";
import { deleteProduct, getProducts } from "@/app/actions/product";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatINR } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  category?: {
    name: string;
  };
  stockLevels: any[];
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products: initialProducts }: ProductListProps) {
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      if (!res.success) throw new Error(res.error as string);
      return (res.data || []) as unknown as Product[];
    },
    initialData: initialProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product deleted successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error("Failed to delete product", {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
    onError: () => {
      toast.error("Failed to delete product", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId);
    setDeletingId(null);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedSearch) return true;

    return (
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.sku.toLowerCase().includes(normalizedSearch) ||
      (product.category?.name || "").toLowerCase().includes(normalizedSearch) ||
      product.type.toLowerCase().includes(normalizedSearch)
    );
  });

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "GOODS":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "SERVICE":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border/50";
    }
  };

  const getStockStatus = (totalStock: number) => {
    if (totalStock <= 0) return { label: "Out of Stock", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: AlertCircle };
    if (totalStock < 10) return { label: "Low Stock", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", icon: AlertCircle };
    return { label: "In Stock", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: CheckCircle2 };
  };

  return (
    <>
      {/* Search and Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search products by name, SKU, category..."
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
            Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of{" "}
            <span className="font-medium text-foreground">{products.length}</span> products
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="text-right font-semibold">Sales Price</TableHead>
                <TableHead className="text-right font-semibold">Cost Price</TableHead>
                <TableHead className="text-right font-semibold">Stock</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No results found</p>
                          <p className="text-xs mt-1">
                            No products match your search criteria
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
                          <p className="text-sm font-medium">No products found</p>
                          <p className="text-xs mt-1">
                            Add your first product to get started
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => {
                  const totalStock = product.stockLevels.reduce((acc, curr) => {
                    const type = curr.location?.type
                      ?.toString()
                      .toUpperCase()
                      .trim();
                    if (type === "INTERNAL") {
                      return acc + curr.quantity;
                    }
                    return acc;
                  }, 0);

                  const stockBreakdown = product.stockLevels.map((sl) => ({
                    name: sl.location?.name || "Unknown",
                    type: sl.location?.type || "Unknown",
                    qty: sl.quantity,
                  }));

                  const stockStatus = getStockStatus(totalStock);
                  const margin = product.salesPrice - product.costPrice;
                  const marginPercentage = product.costPrice > 0 
                    ? Math.round((margin / product.costPrice) * 100) 
                    : 0;

                  return (
                    <TableRow
                      key={product.id}
                      className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted/50 px-2 py-1 rounded border border-border/50">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        {product.category?.name ? (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{product.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "inline-flex items-center border font-medium px-2.5 py-0.5 text-xs",
                            getTypeColor(product.type)
                          )}
                        >
                          {product.type || "GOODS"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-medium">{formatINR(Number(product.salesPrice))}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span>{formatINR(Number(product.costPrice))}</span>
                        </div>
                        {margin > 0 && (
                          <span className="text-[10px] text-green-500 ml-1">
                            +{marginPercentage}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "cursor-help inline-flex items-center gap-1 border font-medium px-2.5 py-1",
                                  stockStatus.color
                                )}
                              >
                                {stockStatus.icon === AlertCircle ? (
                                  <AlertCircle className="h-3 w-3" />
                                ) : stockStatus.icon === CheckCircle2 ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : null}
                                {totalStock} units
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-card/95 backdrop-blur-sm border-border/50">
                              <div className="text-xs space-y-2 p-1">
                                <p className="font-semibold flex items-center gap-1">
                                  <Layers className="h-3.5 w-3.5" />
                                  Stock Breakdown:
                                </p>
                                {stockBreakdown.length === 0 ? (
                                  <p className="text-muted-foreground">No stock records</p>
                                ) : (
                                  <div className="space-y-1">
                                    {stockBreakdown.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between gap-4 text-muted-foreground"
                                      >
                                        <span>{item.name}</span>
                                        <span className="font-medium text-foreground">{item.qty}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="pt-1 mt-1 border-t border-border/50">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={stockStatus.color.split(' ')[1]}>
                                      {stockStatus.label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted/80 transition-all duration-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-sm">
                            <DropdownMenuItem
                              onClick={() => setEditingProduct(product)}
                              className="cursor-pointer hover:bg-muted/80 transition-colors"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer hover:bg-red-500/10 transition-colors"
                              onClick={() => setDeletingId(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Summary */}
        {filteredProducts.length > 0 && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Showing {filteredProducts.length} products</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {products.filter(p => {
                    const stock = p.stockLevels.reduce((acc, curr) => {
                      if (curr.location?.type === "INTERNAL") return acc + curr.quantity;
                      return acc;
                    }, 0);
                    return stock > 0;
                  }).length} In Stock
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  {products.filter(p => {
                    const stock = p.stockLevels.reduce((acc, curr) => {
                      if (curr.location?.type === "INTERNAL") return acc + curr.quantity;
                      return acc;
                    }, 0);
                    return stock > 0 && stock < 10;
                  }).length} Low Stock
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-primary" />
                  {products.length} Total
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      <ProductDialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              product and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-muted/80 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}