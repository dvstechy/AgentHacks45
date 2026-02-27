import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { TransferDialog } from "@/components/operations/transfer-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function ReceiptsPage() {
  const result = await getTransfers("INCOMING");
  const transfers = result.success ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`Receipts (${transfers?.length || 0})`}
          description="Manage incoming shipments from vendors"
        />
        <TransferDialog type="INCOMING" />
      </div>
      <Separator />
      <TransferList transfers={transfers || []} type="INCOMING" />
    </div>
  );
}
