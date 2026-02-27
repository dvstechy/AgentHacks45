import { getCurrentStock } from "@/app/actions/stock";
import { StockTable } from "@/components/inventory/stock-table";

export default async function CurrentStockPage() {
  const { data: stock } = await getCurrentStock();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Current Stock</h1>
        <p className="text-muted-foreground">
          View current stock levels by location.
        </p>
      </div>

      <StockTable stock={stock || []} />
    </div>
  );
}
