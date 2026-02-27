import { getProducts } from "@/app/actions/product";
import { ProductsView } from "@/components/inventory/products-view";

export default async function InventoryPage() {
  const result = await getProducts();

  if (!result.success || !result.data) {
    return <div>Failed to load products</div>;
  }

  return (
    <div className="space-y-6">
      <ProductsView initialProducts={result.data} />
    </div>
  );
}
