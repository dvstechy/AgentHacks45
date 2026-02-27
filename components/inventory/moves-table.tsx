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
import { format } from "date-fns";

import { cn } from "@/lib/utils";

interface StockMove {
  id: string;
  createdAt: Date;
  product: {
    name: string;
    sku: string;
  };
  sourceLocation?: {
    name: string;
  } | null;
  destinationLocation?: {
    name: string;
  } | null;
  quantity: number;
  status: string;
  transfer?: {
    reference: string;
    type: string;
    contact?: {
      name: string;
    } | null;
  } | null;
}

interface MovesTableProps {
  moves: StockMove[];
}

export function MovesTable({ moves }: MovesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No stock moves found.
              </TableCell>
            </TableRow>
          ) : (
            moves.map((move) => {
              const isIncoming = move.transfer?.type === "INCOMING";
              const isOutgoing = move.transfer?.type === "OUTGOING";

              return (
                <TableRow key={move.id}>
                  <TableCell className="font-medium">
                    {move.transfer?.reference || "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(move.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{move.transfer?.contact?.name || "-"}</TableCell>
                  <TableCell
                    className={cn(isIncoming && "text-green-600 font-medium")}
                  >
                    {move.sourceLocation?.name || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(isOutgoing && "text-red-600 font-medium")}
                  >
                    {move.destinationLocation?.name || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span>{move.quantity}</span>
                      <span className="text-xs text-muted-foreground">
                        {move.product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{move.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
