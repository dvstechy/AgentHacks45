import { getCategories } from "@/app/actions/category";
import { CategoryList } from "@/components/inventory/category-list";
import { 
  FolderTree, 
  Layers, 
  Package, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const result = await getCategories();

  if (!result.success || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-red-500/10 rounded-full w-24 h-24 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Failed to load categories
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There was an error loading the categories. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all duration-200 hover:scale-105"
          >
            Refresh Page
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const categories = result.data;
  const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0);
  const rootCategories = categories.filter(cat => !cat.parentId).length;

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
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
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Categories
                    </h1>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {categories.length} total
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground mt-1">
                    Organize and manage product categories
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <FolderTree className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Categories</p>
                  <p className="text-lg font-bold leading-none">{categories.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <Layers className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Root</p>
                  <p className="text-lg font-bold leading-none">{rootCategories}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <Package className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="text-lg font-bold leading-none">{totalProducts}</p>
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
            <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              All Categories
            </h2>
          </div>
          
          {/* Hierarchy Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Root</span>
            </div>
            <ChevronRight className="h-3 w-3" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Subcategories</span>
            </div>
          </div>
        </div>

        {/* Category List Component */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <CategoryList initialCategories={categories} />
        </div>

        {/* Info Footer */}
        <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" />
              <span>
                <span className="font-medium text-foreground">{categories.length}</span> total categories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-500" />
              <span>
                <span className="font-medium text-foreground">{rootCategories}</span> root categories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              <span>
                <span className="font-medium text-foreground">{totalProducts}</span> products categorized
              </span>
            </div>
            <div className="text-xs w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper ChevronRight component since it's used
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}