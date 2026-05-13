import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  reviewing: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  investigating: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  awaiting_client: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  resolved: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

const NOTIF_ICONS: Record<string, string> = {
  case_update: 'folder_shared',
  new_message: 'chat',
  ticket_response: 'support_agent',
  invoice_alert: 'receipt_long',
  payment_received: 'payments',
  contract_update: 'description',
  system: 'info',
};

async function getDashboardData(clientId: string) {
  try {
    await dbConnect();
    const { ClientCase } = await import('@/models/ClientCase');
    const { SupportTicket } = await import('@/models/SupportTicket');
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const { MessageThread } = await import('@/models/MessageThread');
    const { ClientNotification } = await import('@/models/ClientNotification');

    const [activeCases, openTickets, unpaidInvoices, unreadMessages, recentNotifications] =
      await Promise.all([
        ClientCase.find({ clientId, status: { $nin: ['resolved', 'closed'] } })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),
        SupportTicket.countDocuments({
          clientId,
          status: { $in: ['open', 'in_progress', 'waiting_client'] },
        }),
        ClientInvoice.find({ clientId, status: { $in: ['issued', 'sent', 'overdue'] } })
          .sort({ dueAt: 1 })
          .limit(3)
          .lean(),
        MessageThread.countDocuments({ clientId, unreadByClient: { $gt: 0 } }),
        ClientNotification.find({ clientId }).sort({ createdAt: -1 }).limit(8).lean(),
      ]);

    return {
      activeCases: JSON.parse(JSON.stringify(activeCases)),
      openTickets,
      unpaidInvoices: JSON.parse(JSON.stringify(unpaidInvoices)),
      unreadMessages,
      recentNotifications: JSON.parse(JSON.stringify(recentNotifications)),
    };
  } catch (_) {
    return {
      activeCases: [],
      openTickets: 0,
      unpaidInvoices: [],
      unreadMessages: 0,
      recentNotifications: [],
    };
  }
}

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getDashboardData(session.user.id);
  const firstName = (session.user.name || session.user.email?.split('@')[0] || 'Client').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {firstName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            Here&apos;s an overview of your account
          </p>
        </div>
        <Link
          href="/portal/client/evidence/upload"
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">upload_file</span>
          Upload Evidence
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Cases',
            value: data.activeCases.length,
            icon: 'folder_shared',
            href: '/portal/client/cases',
            iconClass: 'text-blue-600 dark:text-blue-400',
            bgClass: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Open Tickets',
            value: data.openTickets,
            icon: 'support_agent',
            href: '/portal/client/tickets',
            iconClass: 'text-purple-600 dark:text-purple-400',
            bgClass: 'bg-purple-50 dark:bg-purple-900/20',
          },
          {
            label: 'Unread Messages',
            value: data.unreadMessages,
            icon: 'chat',
            href: '/portal/client/messages',
            iconClass: 'text-green-600 dark:text-green-400',
            bgClass: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            label: 'Unpaid Invoices',
            value: data.unpaidInvoices.length,
            icon: 'receipt_long',
            href: '/portal/client/invoices',
            iconClass: 'text-orange-600 dark:text-orange-400',
            bgClass: 'bg-orange-50 dark:bg-orange-900/20',
          },
        ].map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-white dark:bg-[#27272a] p-5 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bgClass}`}>
                <span className={`material-icons-outlined text-[20px] ${kpi.iconClass}`}>
                  {kpi.icon}
                </span>
              </div>
              <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-[16px] group-hover:text-gray-400 transition-colors">
                arrow_forward
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <div className="lg:col-span-2 bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Cases</h3>
            <Link
              href="/portal/client/cases"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          {data.activeCases.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">
                folder_shared
              </span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active cases</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.activeCases.map((c: any) => (
                <Link
                  key={c._id}
                  href={`/portal/client/cases/${c._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-400">{c.caseNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          STATUS_STYLES[c.status] || STATUS_STYLES.submitted
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.caseType} · Updated {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="material-icons-outlined text-gray-300 dark:text-gray-700 group-hover:text-gray-500 transition-colors ml-4">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link
              href="/portal/client/notifications"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          {data.recentNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">
                notifications
              </span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recentNotifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`px-6 py-3.5 ${
                    !n.read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-icons-outlined text-[14px] text-gray-500">
                        {NOTIF_ICONS[n.type] || 'info'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unpaid Invoices Alert */}
      {data.unpaidInvoices.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
            <span className="material-icons-outlined text-orange-600 dark:text-orange-400">
              receipt_long
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
              {data.unpaidInvoices.length} invoice
              {data.unpaidInvoices.length > 1 ? 's' : ''} awaiting payment
            </p>
            <p className="text-orange-600 dark:text-orange-400 text-xs mt-0.5">
              Total due: $
              {data.unpaidInvoices
                .reduce((a: number, i: any) => a + (i.amount || 0), 0)
                .toLocaleString()}
            </p>
          </div>
          <Link
            href="/portal/client/invoices"
            className="shrink-0 self-start sm:self-auto bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            View Invoices
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: '/portal/client/evidence/upload',
              icon: 'upload_file',
              label: 'Upload Evidence',
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              href: '/portal/client/tickets/create',
              icon: 'add_circle',
              label: 'New Ticket',
              color: 'text-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              href: '/portal/client/messages',
              icon: 'chat',
              label: 'Send Message',
              color: 'text-green-600',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              href: '/portal/client/knowledgebase',
              icon: 'menu_book',
              label: 'Knowledge Base',
              color: 'text-gray-600',
              bg: 'bg-gray-100 dark:bg-gray-800',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg}`}>
                <span className={`material-icons-outlined ${action.color} dark:text-opacity-80`}>
                  {action.icon}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
