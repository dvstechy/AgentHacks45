import { getTransferById } from "@/app/actions/operation";
import { ReceiptView } from "@/components/operations/receipt-view";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTransferById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ReceiptView transfer={result.data} />
    </div>
  );
}
