import { getContacts } from "@/app/actions/contact";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactDialog } from "@/components/contacts/contact-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function ContactsPage() {
  const result = await getContacts();
  const contacts = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`Contacts (${contacts?.length || 0})`}
          description="Manage customers and vendors"
        />
        <ContactDialog />
      </div>
      <Separator />
      <ContactList initialContacts={contacts || []} />
    </div>
  );
}
