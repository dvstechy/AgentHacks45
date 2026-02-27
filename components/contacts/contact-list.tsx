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
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
      toast.success("Contact deleted");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      toast.error(error.message);
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

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search contacts by name, type, email..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {contacts.length === 0
                    ? "No contacts found."
                    : "No contacts match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        contact.type === "VENDOR" ? "secondary" : "outline"
                      }
                    >
                      {contact.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>{contact.phone || "-"}</TableCell>
                  <TableCell>{contact.address || "-"}</TableCell>
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
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
