import { getLocations } from "@/app/actions/warehouse";
import { LocationDialog } from "@/components/inventory/location-dialog";
import { LocationList } from "@/components/inventory/location-list";

export default async function LocationsPage() {
  const { data: locations } = await getLocations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">
            Manage your warehouse locations and hierarchy.
          </p>
        </div>
        <LocationDialog />
      </div>
      <LocationList locations={locations || []} />
    </div>
  );
}
