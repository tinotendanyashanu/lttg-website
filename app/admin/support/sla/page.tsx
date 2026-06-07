import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getSlaMonitorTickets } from '@/lib/actions/support-center';
import { formatDueIn } from '@/lib/services/support-sla';
import { STATUS_LABELS, type TicketStatus } from '@/lib/support/constants';

export const metadata = { title: 'SLA Monitor | Support' };
export const dynamic = 'force-dynamic';

const STATE_STYLES: Record<string, string> = {
  breached: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  due_soon: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  met: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const STATE_LABEL: Record<string, string> = {
  breached: 'Breached',
  due_soon: 'Due soon',
  ok: 'On track',
  met: 'Met',
};

export default async function SlaMonitorPage() {
  const rows = await getSlaMonitorTickets();

  const breached = rows.filter((r) => r.overall === 'breached').length;
  const dueSoon = rows.filter((r) => r.overall === 'due_soon').length;
  const onTrack = rows.filter((r) => r.overall === 'ok').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="timer"
        title="SLA Monitor"
        description="Live first-response and resolution targets across all active tickets."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'SLA Breaches', value: breached, color: 'text-red-600 dark:text-red-400' },
          { label: 'Due Soon', value: dueSoon, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'On Track', value: onTrack, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((c) => (
          <div key={c.label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{c.label}</p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">timer</span>
            <p className="text-gray-500 dark:text-gray-400">No active tickets — every SLA is clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Ticket', 'Client', 'Status', 'Priority', 'First Response', 'Resolution'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {rows.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/tickets/${r._id}`} className="font-medium text-gray-900 dark:text-white hover:text-brand-primary transition-colors line-clamp-1">
                        {r.subject}
                      </Link>
                      <span className="font-mono text-[11px] text-gray-400">{r.ticketId}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{r.clientName || '—'}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 capitalize">{STATUS_LABELS[r.status as TicketStatus] || r.status}</td>
                    <td className="px-5 py-4 capitalize text-gray-700 dark:text-gray-200">{r.priority}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${STATE_STYLES[r.firstResponseState]}`}>
                        {STATE_LABEL[r.firstResponseState]}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1">{formatDueIn(r.firstResponseDueInMs)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${STATE_STYLES[r.resolutionState]}`}>
                        {STATE_LABEL[r.resolutionState]}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1">{formatDueIn(r.resolutionDueInMs)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
