import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

async function getReportData(clientId: string) {
  try {
    await dbConnect();
    const { ClientCase } = await import('@/models/ClientCase');
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const { SupportTicket } = await import('@/models/SupportTicket');
    const { ClientEvidence } = await import('@/models/ClientEvidence');

    const [cases, invoices, tickets, evidence] = await Promise.all([
      ClientCase.find({ clientId }).lean(),
      ClientInvoice.find({ clientId }).lean(),
      SupportTicket.find({ clientId }).lean(),
      ClientEvidence.find({ clientId }).lean(),
    ]);

    const casesByStatus: Record<string, number> = {};
    for (const c of cases) {
      casesByStatus[c.status as string] = (casesByStatus[c.status as string] || 0) + 1;
    }

    const invoiceTotal = invoices
      .filter((i: any) => i.status === 'paid')
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

    return {
      totalCases: cases.length,
      activeCases: cases.filter((c: any) => !['resolved', 'closed'].includes(c.status)).length,
      resolvedCases: cases.filter((c: any) => c.status === 'resolved').length,
      totalTickets: tickets.length,
      openTickets: tickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).length,
      totalEvidence: evidence.length,
      totalPaid: invoiceTotal,
      casesByStatus: JSON.parse(JSON.stringify(casesByStatus)),
    };
  } catch (_) {
    return null;
  }
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getReportData(session.user.id);

  const stats = data
    ? [
        { label: 'Total Cases', value: data.totalCases, icon: 'folder_shared', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Active Cases', value: data.activeCases, icon: 'pending_actions', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
        { label: 'Resolved', value: data.resolvedCases, icon: 'task_alt', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
        { label: 'Evidence Items', value: data.totalEvidence, icon: 'lock', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Support Tickets', value: data.totalTickets, icon: 'support_agent', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Total Paid', value: `$${(data.totalPaid || 0).toLocaleString()}`, icon: 'payments', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <span className="material-icons-outlined">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {data && Object.keys(data.casesByStatus).length > 0 && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cases by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.casesByStatus).map(([status, count]) => {
              const pct = data.totalCases > 0 ? Math.round(((count as number) / data.totalCases) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300 capitalize">
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 text-xs">{count as number} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/portal/client/cases', icon: 'folder_shared', label: 'My Cases' },
            { href: '/portal/client/evidence/library', icon: 'lock', label: 'Evidence' },
            { href: '/portal/client/invoices', icon: 'receipt_long', label: 'Invoices' },
            { href: '/portal/client/tickets', icon: 'support_agent', label: 'Tickets' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              <span className="material-icons-outlined text-gray-500 dark:text-gray-400">{item.icon}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
