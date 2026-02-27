import { getTransfers } from "@/app/actions/operation";
import { TransferList } from "@/components/operations/transfer-list";
import { TransferDialog } from "@/components/operations/transfer-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function InternalTransfersPage() {
    const result = await getTransfers("INTERNAL");
    const transfers = result.success ? result.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title={`Internal Transfers (${transfers?.length || 0})`}
                    description="Manage stock movements between your locations"
                />
                <TransferDialog type="INTERNAL" />
            </div>
            <Separator />
            <TransferList transfers={transfers || []} type="INTERNAL" />
        </div>
    );
}
