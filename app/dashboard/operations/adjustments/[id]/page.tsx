import { getTransferById } from "@/app/actions/operation";
import { ReceiptView } from "@/components/operations/receipt-view";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdjustmentDetailPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getTransferById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <ReceiptView transfer={result.data} />
        </div>
    );
}
