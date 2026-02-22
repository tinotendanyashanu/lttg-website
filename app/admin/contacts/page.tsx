
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Contact, { IContact } from '@/models/Contact';
import ContactsClient from '@/components/admin/ContactsClient';
import { redirect } from 'next/navigation';

async function getContacts() {
  await dbConnect();
  // Fetch specific fields or all. Lean() for performance.
  const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
  return contacts;
}

export default async function AdminContactsPage() {
  const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/partner/login');
    }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contact Submissions</h2>
          <p className="text-slate-500">View and manage inquiries from the contact form.</p>
        </div>
      </div>

      <ContactsClient data={tableData} />
    </div>
  );
}
