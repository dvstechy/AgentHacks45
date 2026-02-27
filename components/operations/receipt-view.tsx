"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  Printer,
  Package2,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface StockMoveItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    costPrice: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TransferData {
  reference: string;
  type: string;
  status: string;
  scheduledDate?: string | Date | null;
  effectiveDate?: string | Date | null;
  sourceLocation?: { name: string;[key: string]: unknown } | null;
  destinationLocation?: { name: string;[key: string]: unknown } | null;
  contact?: { name: string; email?: string | null; phone?: string | null;[key: string]: unknown } | null;
  stockMoves: StockMoveItem[];
  [key: string]: unknown;
}

interface ReceiptViewProps {
  transfer: TransferData;
}

export function ReceiptView({ transfer }: ReceiptViewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const subtotal = transfer.stockMoves.reduce(
    (acc: number, move: StockMoveItem) => acc + move.quantity * move.product.costPrice,
    0
  );

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

  const handlePrint = () => {
    window.print();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case "DRAFT":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "CANCELED":
        return <XCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "CANCELED":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border/50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INCOMING":
        return "from-blue-500/10 to-blue-500/5 border-blue-500/20";
      case "OUTGOING":
        return "from-green-500/10 to-green-500/5 border-green-500/20";
      case "INTERNAL":
        return "from-purple-500/10 to-purple-500/5 border-purple-500/20";
      default:
        return "from-primary/10 to-primary/5 border-primary/20";
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-3">
          <Link href={getBackLink(transfer.type) as any}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50 hover:bg-muted/80 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {transfer.reference}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center border font-medium px-3 py-1",
                getStatusColor(transfer.status)
              )}
            >
              {getStatusIcon(transfer.status)}
              {transfer.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-border/50 hover:bg-muted/80 transition-all duration-200 hover:scale-105"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Generating...
              </span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        {/* Transfer Details Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5" />
                Reference:
              </span>
              <span className="text-sm font-medium">{transfer.reference}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Scheduled Date:
              </span>
              <span className="text-sm font-medium">
                {transfer.scheduledDate
                  ? format(new Date(transfer.scheduledDate), "PPP")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Source:
              </span>
              <span className="text-sm font-medium">
                {transfer.sourceLocation?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Destination:
              </span>
              <span className="text-sm font-medium">
                {transfer.destinationLocation?.name || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Name:
              </span>
              <span className="text-sm font-medium">
                {transfer.contact?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email:
              </span>
              <span className="text-sm font-medium">
                {transfer.contact?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                Phone:
              </span>
              <span className="text-sm font-medium">
                {transfer.contact?.phone || "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable Receipt */}
      <div
        ref={receiptRef}
        className={cn(
          "rounded-xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200",
          getTypeColor(transfer.type)
        )}
      >
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-background via-background to-background/50 p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Package2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  IMS
                </h1>
                <p className="text-sm text-muted-foreground">
                  Inventory Management System
                </p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary">
                {getTitle(transfer.type)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                #{transfer.reference}
              </p>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "inline-flex items-center border font-medium px-3 py-1",
                    getStatusColor(transfer.status)
                  )}
                >
                  {getStatusIcon(transfer.status)}
                  {transfer.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Address Grid */}
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* From Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-4 w-1 bg-primary rounded-full" />
              From
            </h3>
            <div className="rounded-lg bg-muted/30 p-5 border border-border/50">
              <p className="font-bold text-foreground text-lg mb-2">
                {transfer.type === "INCOMING"
                  ? (transfer.contact?.name || "Vendor")
                  : "My Company"}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {transfer.type === "INCOMING" ? transfer.contact?.email : "warehouse@example.com"}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {transfer.type === "INCOMING" ? transfer.contact?.phone : "+1 234 567 890"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  Source Location
                </p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {transfer.sourceLocation?.name || "Virtual/Vendor"}
                </p>
              </div>
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-4 w-1 bg-primary rounded-full" />
              To
            </h3>
            <div className="rounded-lg bg-muted/30 p-5 border border-border/50">
              <p className="font-bold text-foreground text-lg mb-2">
                {transfer.type === "OUTGOING"
                  ? (transfer.contact?.name || "Customer")
                  : "My Company"}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {transfer.type === "OUTGOING" ? transfer.contact?.email : "warehouse@example.com"}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {transfer.type === "OUTGOING" ? transfer.contact?.phone : "+1 234 567 890"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  Destination Location
                </p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {transfer.destinationLocation?.name || "Virtual/Customer"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-8 px-8 pb-8">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Scheduled Date
            </p>
            <p className="font-medium">
              {transfer.scheduledDate
                ? format(new Date(transfer.scheduledDate), "PPP")
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Effective Date
            </p>
            <p className="font-medium">
              {transfer.effectiveDate
                ? format(new Date(transfer.effectiveDate), "PPP")
                : format(new Date(), "PPP")}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 pb-8">
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="text-right font-semibold">Quantity</TableHead>
                  <TableHead className="text-right font-semibold">Unit Price</TableHead>
                  <TableHead className="text-right font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.stockMoves.map((move: any, index: number) => (
                  <TableRow
                    key={move.id}
                    className="animate-in fade-in slide-in-from-bottom-1"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">
                      {move.product.name}
                    </TableCell>
                    <TableCell className="text-right">{move.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatINR(move.product.costPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatINR(move.quantity * move.product.costPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-8 pb-8">
          <div className="w-full md:w-1/3 space-y-3 p-5 bg-muted/30 rounded-xl border border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (0%)</span>
              <span className="font-medium">{formatINR(0)}</span>
            </div>
            <Separator className="bg-border/50" />
            <div className="flex justify-between font-bold text-lg text-primary">
              <span>Total</span>
              <span>{formatINR(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-gradient-to-r from-primary/5 to-transparent p-6 text-center">
          <p className="text-sm text-muted-foreground">Thank you for your business!</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Generated by IMS on {format(new Date(), "PPP p")}
          </p>
        </div>
      </div>
    </div>
  );
}