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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Check,
  Trash2,
  Calendar,
  Package,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  X
} from "lucide-react";
import {
  deleteTransfer,
  validateTransfer,
  getTransfers,
} from "@/app/actions/operation";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TransferType } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Route } from "next";

interface Transfer {
  id: string;
  reference: string;
  type: string;
  status: string;
  contact?: { name: string } | null;
  sourceLocation?: { name: string } | null;
  destinationLocation?: { name: string } | null;
  scheduledDate?: Date | string | null;
  stockMoves: { id: string }[];
}

interface TransferListProps {
  transfers: Transfer[];
  type?: TransferType;
}

export function TransferList({
  transfers: initialTransfers,
  type,
}: TransferListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: transfers = [] } = useQuery({
    queryKey: ["transfers", type || "ALL"],
    queryFn: async () => {
      const res = await getTransfers(type);
      if (!res.success) throw new Error(res.error as string);
      return res.data as Transfer[];
    },
    initialData: initialTransfers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransfer,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Transfer deleted successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["transfers", type || "ALL"] });
      } else {
        toast.error(result.error || "Failed to delete transfer", {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
  });

  const validateMutation = useMutation({
    mutationFn: validateTransfer,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Transfer validated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        queryClient.invalidateQueries({ queryKey: ["transfers", type || "ALL"] });
      } else {
        toast.error(result.error as string, {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
        });
      }
    },
  });

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const handleValidate = () => {
    if (validatingId) {
      validateMutation.mutate(validatingId);
      setValidatingId(null);
    }
  };

  const getLinkPath = (type: string): "receipts" | "deliveries" | "internal" | "adjustments" => {
    switch (type) {
      case "INCOMING":
        return "receipts";
      case "OUTGOING":
        return "deliveries";
      case "INTERNAL":
        return "internal";
      case "ADJUSTMENT":
        return "adjustments";
      default:
        return "receipts";
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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTransfers = transfers.filter((transfer) => {
    if (!normalizedSearch) return true;

    return (
      transfer.reference.toLowerCase().includes(normalizedSearch) ||
      (transfer.contact?.name || "").toLowerCase().includes(normalizedSearch) ||
      (transfer.sourceLocation?.name || "").toLowerCase().includes(normalizedSearch) ||
      (transfer.destinationLocation?.name || "").toLowerCase().includes(normalizedSearch) ||
      transfer.status.toLowerCase().includes(normalizedSearch) ||
      transfer.type.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <>
      <div className="space-y-4">
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Search by reference, contact, location, status..."
              className="pl-9 pr-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-right-2 duration-500">
            <Filter className="h-4 w-4" />
            <span>
              Showing <span className="font-medium text-foreground">{filteredTransfers.length}</span> of{" "}
              <span className="font-medium text-foreground">{transfers.length}</span> transfers
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Source</TableHead>
                  <TableHead className="font-semibold">Destination</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Items</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        {searchQuery ? (
                          <>
                            <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                            <p className="text-sm font-medium">No results found</p>
                            <p className="text-xs mt-1">
                              No transfers match your search criteria
                            </p>
                            <Button
                              variant="link"
                              onClick={() => setSearchQuery("")}
                              className="mt-2 text-primary"
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          <>
                            <Package className="h-12 w-12 mb-3 text-muted-foreground/30" />
                            <p className="text-sm font-medium">No transfers found</p>
                            <p className="text-xs mt-1">
                              Create a new transfer to get started
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers.map((transfer, index) => (
                    <TableRow
                      key={transfer.id}
                      className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/operations/${getLinkPath(transfer.type)}/${transfer.id}` as any}
                          className="inline-flex items-center gap-1 text-primary hover:underline group/link"
                        >
                          {transfer.reference}
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-all duration-200 group-hover/link:translate-x-0.5" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        {transfer.contact?.name ? (
                          <span className="text-sm font-medium">{transfer.contact.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transfer.sourceLocation?.name ? (
                          <span className="text-sm">{transfer.sourceLocation.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transfer.destinationLocation?.name ? (
                          <span className="text-sm">{transfer.destinationLocation.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transfer.scheduledDate ? (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-3.5 w-3.5" />
                            <span className="font-medium">
                              {format(new Date(transfer.scheduledDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Package className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{transfer.stockMoves?.length || 0}</span>
                          <span className="text-muted-foreground ml-1 text-xs">items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "inline-flex items-center border font-medium px-2.5 py-0.5 text-xs",
                            getStatusColor(transfer.status)
                          )}
                        >
                          {getStatusIcon(transfer.status)}
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {transfer.status === "DRAFT" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setValidatingId(transfer.id)}
                                className="h-8 px-3 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-500/10 transition-all duration-200"
                                disabled={validateMutation.isPending}
                              >
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                Validate
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingId(transfer.id)}
                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Link
                              href={`/dashboard/operations/${getLinkPath(transfer.type)}/${transfer.id}` as any}
                              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group/view"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover/view:opacity-100 transition-all duration-200 group-hover/view:translate-x-0.5" />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Summary */}
          {filteredTransfers.length > 0 && (
            <div className="border-t border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Showing {filteredTransfers.length} transfers</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {transfers.filter(t => t.status === "DONE").length} Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    {transfers.filter(t => t.status === "DRAFT").length} Pending
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Transfer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              transfer and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-muted/80 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validate Confirmation Dialog */}
      <AlertDialog
        open={!!validatingId}
        onOpenChange={(open) => !open && setValidatingId(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Validate Transfer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will update stock levels permanently. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-muted/80 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidate}
              className="bg-green-600 hover:bg-green-700 text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Validating...
                </span>
              ) : (
                "Validate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}