"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  Sparkles,
  Filter,
  X,
  ArrowRightLeft,
  Calendar,
  Clock
} from "lucide-react";
import { MovesTable } from "./moves-table";
import { MovesKanban } from "./moves-kanban";
import { TransferDialog } from "@/components/operations/transfer-dialog";

interface StockMove {
  id: string;
  createdAt: Date;
  product: {
    name: string;
    sku: string;
  };
  sourceLocation?: {
    name: string;
  } | null;
  destinationLocation?: {
    name: string;
  } | null;
  quantity: number;
  status: string;
  transfer?: {
    reference: string;
    type: string;
    contact?: {
      name: string;
    } | null;
  } | null;
}

interface MovesContainerProps {
  moves: StockMove[];
}

export function MovesContainer({ moves }: MovesContainerProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isNewMoveOpen, setIsNewMoveOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("query")?.toString() || "");

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`?${params.toString()}`);
  }, 300);

  const clearSearch = () => {
    setSearchValue("");
    handleSearch("");
  };

  // Calculate some stats
  const todayMoves = moves.filter(m => {
    const today = new Date();
    const moveDate = new Date(m.createdAt);
    return moveDate.toDateString() === today.toDateString();
  }).length;

  const uniqueProducts = new Set(moves.map(m => m.product.sku)).size;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-blue-500/5 to-transparent p-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Section - Title and Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Movement Overview
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>{moves.length} Total Moves</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{todayMoves} Today</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{uniqueProducts} Products</span>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsNewMoveOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                New Move
                <Sparkles className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              <TransferDialog
                open={isNewMoveOpen}
                onOpenChange={setIsNewMoveOpen}
                type="INTERNAL"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search by product, SKU, location, or reference..."
            className="pl-9 pr-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              Showing <span className="font-medium text-foreground">{moves.length}</span> moves
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-1">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-8 w-8 transition-all duration-200",
                view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setView("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-8 w-8 transition-all duration-200",
                view === "kanban" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {view === "list" ? (
          <MovesTable moves={moves} />
        ) : (
          <MovesKanban moves={moves} />
        )}
      </div>

      {/* Summary Footer */}
      {moves.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Latest move: <span className="font-medium text-foreground">
                    {new Date(moves[0]?.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{uniqueProducts}</span> products affected
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {searchValue && `${moves.length} results for "${searchValue}"`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}