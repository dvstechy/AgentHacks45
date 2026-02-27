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
  return (
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
          {stock.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No stock found.
              </TableCell>
            </TableRow>
          ) : (
            stock.map((item) => (
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
  );
}
