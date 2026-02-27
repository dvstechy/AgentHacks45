"use client";

import { deleteContact, getContacts } from "@/app/actions/contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Trash2, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  X,
  Filter,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  type: "CUSTOMER" | "VENDOR";
  address?: string | null;
}

interface ContactListProps {
  initialContacts: Contact[];
}

export function ContactList({ initialContacts }: ContactListProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await getContacts();
      if (!res.success) throw new Error(res.error as string);
      return (res.data || []) as Contact[];
    },
    initialData: initialContacts,
  });

  const { mutate: deleteContactFn, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteContact(id);
      if (!res.success) throw new Error(res.error as string);
      return res;
    },
    onSuccess: () => {
      toast.success("Contact deleted successfully", {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      toast.error(error.message, {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredContacts = contacts.filter((contact) => {
    if (!normalizedSearch) return true;

    return (
      contact.name.toLowerCase().includes(normalizedSearch) ||
      contact.type.toLowerCase().includes(normalizedSearch) ||
      (contact.email || "").toLowerCase().includes(normalizedSearch) ||
      (contact.phone || "").toLowerCase().includes(normalizedSearch) ||
      (contact.address || "").toLowerCase().includes(normalizedSearch)
    );
  });

  // Calculate stats
  const vendors = contacts.filter(c => c.type === "VENDOR").length;
  const customers = contacts.filter(c => c.type === "CUSTOMER").length;
  const contactsWithEmail = contacts.filter(c => c.email).length;
  const contactsWithPhone = contacts.filter(c => c.phone).length;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md group animate-in fade-in slide-in-from-left-2 duration-500">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search by name, type, email, phone..."
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
            Showing <span className="font-medium text-foreground">{filteredContacts.length}</span> of{" "}
            <span className="font-medium text-foreground">{contacts.length}</span> contacts
          </span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Vendors</span>
          </div>
          <p className="text-lg font-bold text-purple-500 mt-1">{vendors}</p>
        </div>
        
        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Customers</span>
          </div>
          <p className="text-lg font-bold text-green-500 mt-1">{customers}</p>
        </div>
        
        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">With Email</span>
          </div>
          <p className="text-lg font-bold text-blue-500 mt-1">{contactsWithEmail}</p>
        </div>
        
        <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">With Phone</span>
          </div>
          <p className="text-lg font-bold text-amber-500 mt-1">{contactsWithPhone}</p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          <Search className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No results found</p>
                          <p className="text-xs mt-1">
                            No contacts match your search criteria
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
                          <Users className="h-12 w-12 mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No contacts found</p>
                          <p className="text-xs mt-1">
                            Add your first vendor or customer to get started
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact, index) => (
                  <TableRow
                    key={contact.id}
                    className="group hover:bg-muted/50 transition-colors duration-200 border-b border-border/50 animate-in fade-in slide-in-from-bottom-1"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          {contact.type === "VENDOR" ? (
                            <Building2 className="h-4 w-4 text-purple-500" />
                          ) : (
                            <Users className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <span>{contact.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          contact.type === "VENDOR" 
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        )}
                      >
                        {contact.type === "VENDOR" ? (
                          <Building2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Users className="h-3 w-3 mr-1" />
                        )}
                        {contact.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{contact.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.address ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground line-clamp-1 max-w-[200px]">
                            {contact.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm("Are you sure you want to delete this contact?")
                          ) {
                            deleteContactFn(contact.id);
                          }
                        }}
                        disabled={isDeleting}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        {filteredContacts.length > 0 && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-purple-500" />
                  <span>{vendors} vendors</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-green-500" />
                  <span>{customers} customers</span>
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {searchQuery && `${filteredContacts.length} of ${contacts.length} contacts`}
              </div>
            </div>

            {/* Contact Type Distribution Bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Distribution:</span>
              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${(vendors / contacts.length) * 100}%` }}
                />
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(customers / contacts.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {Math.round((vendors / contacts.length) * 100)}% Vendors
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}