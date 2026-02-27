"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, LayoutList, Plus, Search } from "lucide-react";
import { MovesTable } from "./moves-table";
import { MovesKanban } from "./moves-kanban";
import { TransferDialog } from "@/components/operations/transfer-dialog";

interface MovesContainerProps {
  moves: any[];
}

export function MovesContainer({ moves }: MovesContainerProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isNewMoveOpen, setIsNewMoveOpen] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`?${params.toString()}`);
  }, 300);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setIsNewMoveOpen(true)}>
            <Plus className="h-4 w-4" />
            NEW
          </Button>
          <TransferDialog
            open={isNewMoveOpen}
            onOpenChange={setIsNewMoveOpen}
            type="INTERNAL"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by reference or contact..."
              className="pl-8"
              defaultValue={searchParams.get("query")?.toString()}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-md border bg-background p-1">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <MovesTable moves={moves} />
      ) : (
        <MovesKanban moves={moves} />
      )}
    </div>
  );
}
