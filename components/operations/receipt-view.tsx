"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, Download, Printer, Package2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReceiptViewProps {
  transfer: any;
}

export function ReceiptView({ transfer }: ReceiptViewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsDownloading(true);
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${transfer.reference}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case "INCOMING":
        return "Receipt";
      case "OUTGOING":
        return "Delivery Order";
      case "INTERNAL":
        return "Internal Transfer";
      case "ADJUSTMENT":
        return "Inventory Adjustment";
      default:
        return "Transfer";
    }
  };

  const getBackLink = (type: string) => {
    switch (type) {
      case "INCOMING":
        return "/dashboard/operations/receipts" as const;
      case "OUTGOING":
        return "/dashboard/operations/deliveries" as const;
      case "INTERNAL":
        return "/dashboard/operations/internal" as const;
      case "ADJUSTMENT":
        return "/dashboard/operations/adjustments" as const;
      default:
        return "/dashboard/operations/receipts" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={getBackLink(transfer.type) as any}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {transfer.reference}
          </h1>
          <Badge variant={transfer.status === "DONE" ? "default" : "secondary"}>
            {transfer.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-medium">{transfer.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled Date:</span>
              <span className="font-medium">
                {transfer.scheduledDate
                  ? format(new Date(transfer.scheduledDate), "PPP")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">
                {transfer.sourceLocation?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-medium">
                {transfer.destinationLocation?.name || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">
                {transfer.contact?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">
                {transfer.contact?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">
                {transfer.contact?.phone || "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable Receipt Area */}
      <div className="hidden">
        {/* This is a hidden duplicate for PDF generation if we wanted a specific print layout, 
            but for now we will capture the visible card below or a specific container. 
            Actually, let's just capture the visible content or a dedicated print view.
            I'll wrap the content below in a ref to capture it.
        */}
      </div>

      <Card
        ref={receiptRef}
        className="bg-white text-black p-10 shadow-none border-0"
      >
        {/* Header with Logo */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                IMS
              </h1>
              <p className="text-sm text-gray-500">
                Inventory Management System
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900">
              {getTitle(transfer.type)}
            </h2>
            <p className="text-gray-500 mt-1">#{transfer.reference}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {transfer.status}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              From
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-gray-900 text-lg mb-1">
                {transfer.contact?.name || "Unknown Vendor"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                {transfer.contact?.email}
              </p>
              <p className="text-sm text-gray-600">{transfer.contact?.phone}</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-400 uppercase">
                  Source Location
                </p>
                <p className="text-sm font-medium">
                  {transfer.sourceLocation?.name}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              To
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-gray-900 text-lg mb-1">My Company</p>
              <p className="text-sm text-gray-600 mb-1">123 Warehouse St.</p>
              <p className="text-sm text-gray-600">Logistics City, 12345</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-400 uppercase">
                  Destination Location
                </p>
                <p className="text-sm font-medium">
                  {transfer.destinationLocation?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <p className="text-sm text-gray-500">Scheduled Date</p>
            <p className="font-medium">
              {transfer.scheduledDate
                ? format(new Date(transfer.scheduledDate), "PPP")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Effective Date</p>
            <p className="font-medium">
              {transfer.effectiveDate
                ? format(new Date(transfer.effectiveDate), "PPP")
                : format(new Date(), "PPP")}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 overflow-x-auto mb-8">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-gray-700">
                  Product
                </TableHead>
                <TableHead className="text-right font-bold text-gray-700">
                  Quantity
                </TableHead>
                <TableHead className="text-right font-bold text-gray-700">
                  Unit Price
                </TableHead>
                <TableHead className="text-right font-bold text-gray-700">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.stockMoves.map((move: any) => (
                <TableRow key={move.id}>
                  <TableCell className="font-medium">
                    {move.product.name}
                  </TableCell>
                  <TableCell className="text-right">{move.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${move.product.costPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(move.quantity * move.product.costPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>
                $
                {transfer.stockMoves
                  .reduce(
                    (acc: number, move: any) =>
                      acc + move.quantity * move.product.costPrice,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-xl text-primary">
              <span>Total</span>
              <span>
                $
                {transfer.stockMoves
                  .reduce(
                    (acc: number, move: any) =>
                      acc + move.quantity * move.product.costPrice,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          <p>Thank you for your business!</p>
          <p className="mt-1">
            Generated by IMS on {format(new Date(), "PPP p")}
          </p>
        </div>
      </Card>
    </div>
  );
}
