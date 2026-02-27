"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface StockLevel {
  id: string;
  quantity: number;
  product: {
    name: string;
    sku: string;
    unitOfMeasure: string;
  };
  location: {
    name: string;
    shortCode: string;
    type: string;
  };
}

interface StockTableProps {
  stock: StockLevel[];
}

export function StockTable({ stock }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredStock = stock.filter((item) => {
    if (!normalizedSearch) return true;

    return (
      item.product.name.toLowerCase().includes(normalizedSearch) ||
      item.product.sku.toLowerCase().includes(normalizedSearch) ||
      item.location.name.toLowerCase().includes(normalizedSearch) ||
      item.location.shortCode.toLowerCase().includes(normalizedSearch) ||
      item.location.type.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stock by product, SKU, location..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  {stock.length === 0
                    ? "No stock found."
                    : "No stock entries match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredStock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product.name}
                  </TableCell>
                  <TableCell>{item.product.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.location.name} ({item.location.shortCode})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.location.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.quantity < 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {item.quantity} {item.product.unitOfMeasure}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
