import { Suspense } from "react";
import { getStockMoves } from "@/app/actions/stock";
import { MovesContainer } from "@/components/inventory/moves-container";

export default async function StockMovesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const { data: moves } = await getStockMoves(query);

  return (
    <div className="space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Stock Moves History
        </h1>
        <p className="text-muted-foreground">
          View the history of all product movements across your warehouses.
        </p>
      </div>

      <Suspense fallback={<div>Loading moves...</div>}>
        <MovesContainer moves={moves || []} />
      </Suspense>
    </div>
  );
}
