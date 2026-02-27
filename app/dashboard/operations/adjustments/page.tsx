import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { TransferDialog } from "@/components/operations/transfer-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function AdjustmentsPage() {
    const result = await getTransfers("ADJUSTMENT");
    const transfers = result.success ? result.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title={`Inventory Adjustments (${transfers?.length || 0})`}
                    description="Manage manual stock adjustments and corrections"
                />
                <TransferDialog type="ADJUSTMENT" />
            </div>
            <Separator />
            <TransferList transfers={transfers || []} type="ADJUSTMENT" />
        </div>
    );
}
