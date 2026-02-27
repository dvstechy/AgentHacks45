"use client";

import { useState } from "react";
import { ProductList } from "./product-list";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

interface ProductsViewProps {
  initialProducts: any[];
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
