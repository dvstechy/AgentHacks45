import { getWarehouses } from "@/app/actions/warehouse";
import { WarehouseDialog } from "@/components/inventory/warehouse-dialog";
import { WarehouseList } from "@/components/inventory/warehouse-list";

export default async function WarehousesPage() {
  const { data: warehouses } = await getWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage your physical storage locations.
          </p>
        </div>
        <WarehouseDialog />
      </div>

      <WarehouseList warehouses={warehouses || []} />
    </div>
  );
}
