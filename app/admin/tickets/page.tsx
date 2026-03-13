import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';
import { Account } from '@/models/Account';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import TicketsTable from '@/components/admin/TicketsTable';

export const metadata = { title: 'Support Tickets | Admin' };
export const dynamic = 'force-dynamic';

async function getTickets() {
  await dbConnect();
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const clientIds = [...new Set(tickets.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: acc.fullName, email: acc.email };
  }

  const openCount     = tickets.filter((t: any) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t: any) => t.status === 'in_progress').length;
  const urgentCount   = tickets.filter((t: any) => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length;

  return { tickets, accountMap, openCount, inProgressCount, urgentCount };
}

export default async function AdminTicketsPage() {
  const { tickets, accountMap, openCount, inProgressCount, urgentCount } = await getTickets();

  // Serialize for client component
  const serializedTickets = tickets.map((t: any) => ({
    _id:       String(t._id),
    ticketId:  t.ticketId,
    subject:   t.subject,
    category:  t.category,
    status:    t.status,
    priority:  t.priority,
    createdAt: t.createdAt?.toISOString?.() ?? String(t.createdAt),
    clientId:  String(t.clientId),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="support_agent"
        title="Support Tickets"
        description="Manage all client support tickets raised through the client portal."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Open</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{openCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">In Progress</p>
          <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Urgent</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{urgentCount}</p>
        </div>
      </div>

      <TicketsTable tickets={serializedTickets} accountMap={accountMap} />
    </div>
  );
}
