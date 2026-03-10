import dbConnect from '@/lib/mongodb';
import Partner, { IPartner } from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';
import Analytics from '@/models/Analytics';
import {
  Users,
  Briefcase,
  CreditCard,
  Activity,
  Globe,
  MousePointer2,
  Clock,
  FolderOpen,
  DollarSign,
  Receipt,
  MessageCircle,
  Ticket,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import KPICard from '@/components/admin/KPICard';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
import SimpleLineChart from '@/components/admin/SimpleLineChart';
import { getAdminDashboardStats } from '@/lib/actions/portal-admin';

async function getClientOpsStats() {
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { MessageThread } = await import('@/models/MessageThread');

  const [
    outstandingAmount,
    overdueCount,
    openTickets,
    urgentTickets,
    unreadMessages,
    totalInvoices,
  ] = await Promise.all([
    ClientInvoice.aggregate([
      { $match: { status: { $in: ['issued', 'sent', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).then((r: any[]) => r[0]?.total || 0),
    ClientInvoice.countDocuments({ status: 'overdue' }),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    SupportTicket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
    MessageThread.aggregate([
      { $group: { _id: null, total: { $sum: '$unreadByTeam' } } },
    ]).then((r: any[]) => r[0]?.total || 0),
    ClientInvoice.countDocuments(),
  ]);

  return { outstandingAmount, overdueCount, openTickets, urgentTickets, unreadMessages, totalInvoices };
}


async function getAdminStats() {
  await dbConnect();

  const partnerCount = await Partner.countDocuments({ role: 'partner' });
  const pendingPartners = await Partner.countDocuments({ status: 'pending' });

  const dealCount = await Deal.countDocuments({ commissionSource: { $ne: 'ACADEMY_BONUS' } });
  const pendingDeals = await Deal.countDocuments({ dealStatus: 'registered', commissionSource: { $ne: 'ACADEMY_BONUS' } });

  const totalPayouts = await Payout.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const recentPartners = await Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).limit(5).lean();

  // Traffic chart (7-day unique visitors)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trafficStats = await Analytics.aggregate([
    { $match: { timestamp: { $gte: sevenDaysAgo } } },
    { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, visitor: '$visitorId' } } },
    { $group: { _id: '$_id.date', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const trafficData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const found = trafficStats.find((s: { _id: string; count: number }) => s._id === dateStr);
    trafficData.push({ label: dayLabel, value: found ? found.count : 0 });
  }

  const totalPageViews = await Analytics.estimatedDocumentCount();
  const sessions = await Analytics.aggregate([
    { $match: { timestamp: { $gte: sevenDaysAgo } } },
    { $group: { _id: '$sessionId', count: { $sum: 1 } } },
    { $group: { _id: null, avgViews: { $avg: '$count' } } },
  ]);
  const avgViewsPerSession = sessions[0]?.avgViews || 1;

  const locationStats = await Analytics.aggregate([
    { $match: { timestamp: { $gte: sevenDaysAgo } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  const formattedLocations = locationStats.map((loc: { _id: string; count: number }) => ({
    name: loc._id || 'Unknown',
    value: loc.count,
  }));

  // Real revenue: sum of deal values (finalValue ?? estimatedValue) for closed/approved deals, by month
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
  sevenMonthsAgo.setDate(1);
  sevenMonthsAgo.setHours(0, 0, 0, 0);

  const rawRevenue = await Deal.aggregate([
    {
      $match: {
        dealStatus: { $in: ['approved', 'closed'] },
        commissionSource: { $ne: 'ACADEMY_BONUS' },
        updatedAt: { $gte: sevenMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
        total: { $sum: { $ifNull: ['$finalValue', '$estimatedValue'] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Real partner growth: cumulative partner signups by month
  const rawPartnerGrowth = await Partner.aggregate([
    { $match: { role: 'partner', createdAt: { $gte: sevenMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Build last 7 month labels and look up real values
  const revenueData: { label: string; value: number }[] = [];
  const partnerGrowthData: { label: string; value: number }[] = [];
  let cumulativePartners = await Partner.countDocuments({
    role: 'partner',
    createdAt: { $lt: sevenMonthsAgo },
  });
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
    const rev = rawRevenue.find((r: { _id: string; total: number }) => r._id === monthKey);
    revenueData.push({ label: monthLabel, value: rev ? Math.round(rev.total) : 0 });
    const pg = rawPartnerGrowth.find((p: { _id: string; count: number }) => p._id === monthKey);
    cumulativePartners += pg ? pg.count : 0;
    partnerGrowthData.push({ label: monthLabel, value: cumulativePartners });
  }

  return {
    partnerCount, pendingPartners, dealCount, pendingDeals,
    totalPayouts: totalPayouts[0]?.total || 0,
    recentPartners, revenueData, partnerGrowthData,
    trafficData, totalPageViews, avgViewsPerSession, formattedLocations,
  };
}

export default async function AdminDashboard() {
  const [partnerResult, portalResult, clientOpsResult] = await Promise.allSettled([
    getAdminStats(),
    getAdminDashboardStats(),
    getClientOpsStats(),
  ]);

  const stats = partnerResult.status === 'fulfilled' ? partnerResult.value : null;
  const portalStats = portalResult.status === 'fulfilled' ? portalResult.value?.data : null;
  const clientOps = clientOpsResult.status === 'fulfilled' ? clientOpsResult.value : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Partner domain KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Partners"
          value={stats?.partnerCount ?? 0}
          icon={Users}
          color="bg-blue-500"
          trend={{ value: 12, label: 'vs last month', positive: true }}
        />
        <KPICard
          title="Active Deals"
          value={stats?.dealCount ?? 0}
          icon={Briefcase}
          color="bg-purple-500"
          trend={{ value: 5, label: 'vs last month', positive: true }}
        />
        <KPICard
          title="Total Payouts"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats?.totalPayouts ?? 0)}
          icon={CreditCard}
          color="bg-emerald-500"
          trend={{ value: 8, label: 'vs last month', positive: true }}
        />
        <KPICard
          title="Pending Actions"
          value={stats ? stats.pendingPartners + stats.pendingDeals : 0}
          icon={Activity}
          color="bg-amber-500"
          trend={(stats && (stats.pendingPartners + stats.pendingDeals) > 0)
            ? { value: stats.pendingPartners + stats.pendingDeals, label: 'Requires attention', positive: false }
            : undefined}
        />
      </div>

      {/* Portal operations KPIs */}
      {portalStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <KPICard
            title="Active Cases"
            value={portalStats.activeCasesCount ?? 0}
            icon={FolderOpen}
            color="bg-sky-500"
            trend={{ value: 0, label: 'open cases', positive: true }}
          />
          <KPICard
            title="Pending Commissions"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(portalStats.pendingCommissionLiability ?? 0)}
            icon={DollarSign}
            color="bg-orange-500"
            trend={{ value: 0, label: 'internal liability', positive: false }}
          />
          <KPICard
            title="Paid Commissions"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(portalStats.totalPaidCommission ?? 0)}
            icon={CreditCard}
            color="bg-teal-500"
            trend={{ value: 0, label: 'total paid out', positive: true }}
          />
        </div>
      )}

      {/* Client Operations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Client Operations</h2>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <KPICard
            title="Outstanding Invoices"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(clientOps?.outstandingAmount ?? 0)}
            icon={Receipt}
            color="bg-amber-500"
            trend={clientOps?.overdueCount ? { value: clientOps.overdueCount, label: 'overdue', positive: false } : undefined}
          />
          <KPICard
            title="Total Invoices"
            value={clientOps?.totalInvoices ?? 0}
            icon={DollarSign}
            color="bg-indigo-500"
            trend={{ value: 0, label: 'all time', positive: true }}
          />
          <KPICard
            title="Open Tickets"
            value={clientOps?.openTickets ?? 0}
            icon={Ticket}
            color={clientOps?.urgentTickets ? 'bg-red-500' : 'bg-sky-500'}
            trend={clientOps?.urgentTickets ? { value: clientOps.urgentTickets, label: 'urgent', positive: false } : undefined}
          />
          <KPICard
            title="Unread Messages"
            value={clientOps?.unreadMessages ?? 0}
            icon={MessageCircle}
            color={clientOps?.unreadMessages ? 'bg-violet-500' : 'bg-gray-400'}
            trend={clientOps?.unreadMessages ? { value: clientOps.unreadMessages, label: 'need response', positive: false } : undefined}
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/invoices"
            className="group flex items-center justify-between bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-4 hover:border-brand-primary/30 dark:hover:border-brand-primary/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Invoices</p>
                <p className="text-xs text-gray-400">Create, send &amp; track</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-lg px-2 py-1 flex items-center gap-1">
                <Plus className="h-3 w-3" />New
              </span>
              <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-[18px] group-hover:text-brand-primary transition-colors">chevron_right</span>
            </div>
          </Link>

          <Link
            href="/admin/tickets"
            className="group flex items-center justify-between bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-4 hover:border-brand-primary/30 dark:hover:border-brand-primary/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Support Tickets</p>
                <p className="text-xs text-gray-400">Reply &amp; resolve</p>
              </div>
            </div>
            {(clientOps?.openTickets ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5.5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {clientOps?.openTickets}
              </span>
            )}
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-[18px] group-hover:text-brand-primary transition-colors">chevron_right</span>
          </Link>

          <Link
            href="/admin/messages"
            className="group flex items-center justify-between bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-4 hover:border-brand-primary/30 dark:hover:border-brand-primary/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Client Messages</p>
                <p className="text-xs text-gray-400">Read &amp; respond</p>
              </div>
            </div>
            {(clientOps?.unreadMessages ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5.5 px-1.5 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                {clientOps?.unreadMessages}
              </span>
            )}
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-[18px] group-hover:text-brand-primary transition-colors">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Site Matrix */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <Globe className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Site Matrix</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <SimpleLineChart
              title="Weekly Traffic (Unique Visitors)"
              data={stats?.trafficData ?? []}
              color="stroke-blue-500"
              height={240}
            />
          </div>
          <div className="space-y-5">
            <KPICard
              title="Total Page Views"
              value={new Intl.NumberFormat('en-US', { notation: 'compact' }).format(stats?.totalPageViews ?? 0)}
              icon={MousePointer2}
              color="bg-blue-500"
              trend={{ value: 100, label: 'tracking active', positive: true }}
            />
            <KPICard
              title="Views / Session"
              value={(stats?.avgViewsPerSession ?? 0).toFixed(1)}
              icon={Clock}
              color="bg-slate-700"
              trend={{ value: 0, label: 'last 7 days', positive: true }}
            />
            <div className="bg-white dark:bg-[#27272a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">Top Locations</h3>
              <div className="space-y-3">
                {stats?.formattedLocations && stats.formattedLocations.length > 0 ? (
                  stats.formattedLocations.map((loc: { name: string; value: number }, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="flex items-center text-gray-700 dark:text-gray-300 gap-1">
                        <span className="w-5 text-gray-400 font-mono text-xs">{i + 1}.</span>
                        {loc.name}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white tabular-nums">{loc.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">No location data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Performance */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
            <Activity className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Financial Performance</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <SimpleBarChart title="Revenue Overview" data={stats?.revenueData ?? []} color="bg-emerald-500" />
          </div>
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <SimpleBarChart title="Partner Growth" data={stats?.partnerGrowthData ?? []} color="bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Bottom: Partners table + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">

        {/* Newest Partners */}
        <div className="lg:col-span-2 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Newest Partners</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Recently onboarded affiliates</p>
            </div>
            <Link href="/admin/partners" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-0.5">
              View All
              <span className="material-icons-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {(stats?.recentPartners ?? []).map((partner: IPartner) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <tr key={(partner._id as any).toString()} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">{partner.name}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{partner.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${
                        partner.status === 'active'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40' :
                        partner.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40' :
                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40'
                      }`}>
                        {partner.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium text-xs">
                      {new Date(partner.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Link href={`/admin/partners/${(partner._id as any).toString()}`}
                        className="text-xs text-brand-primary hover:underline font-semibold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {(stats?.recentPartners?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-gray-600 text-sm">No partners yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden flex flex-col">
          <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">System Activity</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Latest portal mutations</p>
            </div>
            <Link href="/admin/activity" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-0.5">
              View All
              <span className="material-icons-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {portalStats?.recentActivity && portalStats.recentActivity.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              portalStats.recentActivity.slice(0, 8).map((log: any) => (
                <div key={log._id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                    {(log.actorAccountId?.fullName?.[0] || log.actorAccountId?.email?.[0] || 'S').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 capitalize leading-tight">
                      {log.actionType?.replace(/_/g, ' ') ?? 'Action'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 truncate">
                      {log.actorAccountId?.email || 'System'}
                    </p>
                    <p className="text-[11px] text-brand-primary mt-0.5">
                      {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <span className="material-icons-outlined text-3xl text-gray-300 dark:text-gray-700">history</span>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">No recent activity</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
