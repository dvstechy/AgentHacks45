"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";

export function MovesToolbar() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const view = searchParams.get("view") || "list";

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`?${params.toString()}`);
  }, 300);

  const handleViewChange = (newView: "list" | "kanban") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/operations">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            NEW
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-1 sm:max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference or contact..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
          />
        </div>
        <div className="flex items-center border rounded-md bg-background">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none first:rounded-l-md"
            onClick={() => handleViewChange("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none last:rounded-r-md"
            onClick={() => handleViewChange("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Kanban View</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
