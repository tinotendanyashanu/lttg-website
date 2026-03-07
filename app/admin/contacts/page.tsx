
import dbConnect from '@/lib/mongodb';
import Contact, { IContact } from '@/models/Contact';
import ContactsClient from '@/components/admin/ContactsClient';
import AdminPageBanner from '@/components/admin/AdminPageBanner';

async function getContacts() {
  await dbConnect();
  // Fetch specific fields or all. Lean() for performance.
  const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
  return contacts;
}

export default async function AdminContactsPage() {
  const contacts = await getContacts();

  // Transform data for table
  const tableData = contacts.map((contact: IContact) => ({
      ...contact,
      id: contact._id.toString(),
      _id: contact._id.toString(),
      createdAtString: new Date(contact.createdAt).toLocaleDateString() + ' ' + new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      budget: contact.budget || 'N/A',
      timeline: contact.timeline || 'N/A',
      budgetFormatted: contact.budget ? contact.budget : 'N/A',
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="message"
        title="Contact Submissions"
        description="View and manage inquiries from the contact form."
      />
      <ContactsClient data={tableData} />
    </div>
  );
}
