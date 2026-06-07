import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getSupportInboxTickets } from '@/lib/actions/support-center';
import { STATUS_LABELS, PRIORITY_LABELS, categoryLabel, channelIcon, channelLabel } from '@/lib/support/constants';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  new:            'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
  open:           'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  in_progress:    'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
  waiting_client: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  escalated:      'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  resolved:       'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  closed:         'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  medium:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  high:     'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  urgent:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const SLA_STYLES: Record<string, string> = {
  breached: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  due_soon: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  ok:       'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  met:      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const SLA_LABELS: Record<string, string> = {
  breached: 'Breached',
  due_soon: 'Due soon',
  ok: 'On track',
  met: 'Met',
};

export default async function EmployeeSupportInboxPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee') redirect('/portal');

  let data;
  try {
    data = await getSupportInboxTickets();
  } catch {
    redirect('/portal');
  }
  const { tickets, counts } = data;

  const stats = [
    { label: 'Active Tickets', value: counts.active, icon: 'inbox', tone: 'text-brand-primary' },
    { label: 'Awaiting Reply', value: counts.unanswered, icon: 'mark_chat_unread', tone: 'text-amber-500' },
    { label: 'SLA Breached', value: counts.breached, icon: 'warning', tone: 'text-red-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      <AdminPageBanner
        icon="support_agent"
        title="Support Inbox"
        description="Triage and respond to client support tickets."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5 flex items-center gap-4"
          >
            <span className={`material-icons-outlined text-3xl ${s.tone}`}>{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-700 mb-2">inbox</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">No support tickets yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">SLA</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/portal/employee/support/${t._id}`} className="block group">
                        <span className="flex items-center gap-2">
                          {t.channel && t.channel !== 'web' && (
                            <span
                              className="material-icons-outlined text-[15px] text-gray-400 shrink-0"
                              title={channelLabel(t.channel)}
                            >
                              {channelIcon(t.channel)}
                            </span>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                            {t.subject}
                          </span>
                          {t.unanswered && (
                            <span className="shrink-0 inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-1.5 py-0.5">
                              NEEDS REPLY
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.ticketId} · {categoryLabel(t.category)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{t.clientName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${STATUS_STYLES[t.status] || STATUS_STYLES.open}`}>
                        {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS] || t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold capitalize ${PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium}`}>
                        {PRIORITY_LABELS[t.priority as keyof typeof PRIORITY_LABELS] || t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${SLA_STYLES[t.slaOverall] || SLA_STYLES.met}`}>
                        {SLA_LABELS[t.slaOverall] || t.slaOverall}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
