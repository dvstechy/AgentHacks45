import { getCategories } from "@/app/actions/category";
import { CategoryList } from "@/components/inventory/category-list";

export default async function CategoriesPage() {
  const result = await getCategories();

  if (!result.success || !result.data) {
    return <div>Failed to load categories</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      <CategoryList initialCategories={result.data} />
    </div>
  );
}
