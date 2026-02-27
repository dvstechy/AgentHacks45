"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Search,
  FolderTree,
  Package,
  Layers,
  X,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { CategoryDialog } from "./category-dialog";
import { deleteCategory, getCategories } from "@/app/actions/category";
import toast from "react-hot-toast";
import { Category } from "@/app/actions/category";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      if (!res.success) throw new Error(res.error as string);
      return res.data || [];
    },
    initialData: initialCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Category deleted successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error("Failed to delete category", {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
    onError: () => {
      toast.error("Failed to delete category", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  // Calculate stats
  const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0);
  const rootCategories = categories.filter(cat => !cat.parentId).length;

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Category Management
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize products with categories and subcategories
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 group animate-in fade-in slide-in-from-left-2 duration-500">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
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
          
          {/* Add Category Button (handled by CategoryDialog) */}
          <CategoryDialog />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Root Categories</p>
              <p className="text-2xl font-bold">{rootCategories}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Showing</p>
              <p className="text-2xl font-bold">{filteredCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Parent Category</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="text-right font-semibold">Products</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No results found</p>
                          <p className="text-xs mt-1">
                            No categories match your search criteria
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
                          <FolderOpen className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No categories found</p>
                          <p className="text-xs mt-1">
                            Create your first category to organize products
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <FolderTree className="h-4 w-4 text-primary" />
                        </div>
                        <span>{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.parent?.name ? (
                        <div className="flex items-center gap-1 text-sm">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{category.parent.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.description ? (
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {category.description}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center border font-medium px-2.5 py-0.5 text-xs",
                          (category._count?.products || 0) > 0
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : "bg-muted text-muted-foreground border-border/50"
                        )}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        {category._count?.products || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted/80 transition-all duration-200"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-sm">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingCategory(category);
                              setIsDialogOpen(true);
                            }}
                            className="cursor-pointer hover:bg-muted/80 transition-colors"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer hover:bg-red-500/10 transition-colors"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        {filteredCategories.length > 0 && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FolderTree className="h-3.5 w-3.5 text-primary" />
                  <span>{filteredCategories.length} categories shown</span>
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-green-500" />
                  <span>{totalProducts} products categorized</span>
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {searchQuery && `${filteredCategories.length} of ${categories.length} categories`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Category Dialog */}
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}

// Badge component
function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variant === "outline" && "border border-border bg-background",
      className
    )}>
      {children}
    </span>
  );
}