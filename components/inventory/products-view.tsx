"use client";

import { useState } from "react";
import { ProductList } from "./product-list";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

interface ProductsViewProps {
  initialProducts: {
    id: string;
    name: string;
    sku: string;
    type: string;
    salesPrice: number;
    costPrice: number;
    category?: { name: string } | null;
    stockLevels: { quantity: number; location?: { name: string; type: string } | null }[];
    [key: string]: unknown;
  }[];
}

export function ProductsView({ initialProducts }: ProductsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${initialProducts.length})`}
          description="Manage products and services"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <Separator />

      <ProductList products={initialProducts} />

      <ProductDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
