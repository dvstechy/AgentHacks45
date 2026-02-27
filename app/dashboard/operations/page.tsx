import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function OperationsPage() {
  const result = await getTransfers();
  const transfers = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`All Operations (${transfers?.length || 0})`}
          description="Manage receipts, deliveries, and internal transfers."
        />
      </div>
      <Separator />
      <TransferList transfers={transfers || []} />
    </div>
  );
}
