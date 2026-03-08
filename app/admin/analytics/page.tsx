import dbConnect from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import SimpleLineChart from '@/components/admin/SimpleLineChart';
import KPICard from '@/components/admin/KPICard';
import { Globe, MousePointer2, Users, Clock, TrendingUp, Layers } from 'lucide-react';

export const metadata = { title: 'Analytics | Admin' };
export const dynamic = 'force-dynamic';

async function getSiteAnalytics() {
  await dbConnect();

  const now = new Date();

  // --- 30-day window ---
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // --- 7-day window ---
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // KPIs
  const [totalViews, uniqueVisitors30d, sessionAgg, uniqueVisitors7d] = await Promise.all([
    Analytics.estimatedDocumentCount(),
    Analytics.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$visitorId' } },
      { $count: 'total' },
    ]),
    Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
      { $group: { _id: null, avgViews: { $avg: '$count' }, totalSessions: { $sum: 1 } } },
    ]),
    Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$visitorId' } },
      { $count: 'total' },
    ]),
  ]);

  const uniqueVisitors30dCount: number = uniqueVisitors30d[0]?.total ?? 0;
  const uniqueVisitors7dCount: number = uniqueVisitors7d[0]?.total ?? 0;
  const avgViewsPerSession: number = sessionAgg[0]?.avgViews ?? 1;
  const totalSessions: number = sessionAgg[0]?.totalSessions ?? 0;

  // 30-day daily unique visitor trend
  const dailyTrend = await Analytics.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          visitor: '$visitorId',
        },
      },
    },
    { $group: { _id: '$_id.date', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const trendData: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Compact label: show date only on every 5th entry to avoid crowding
    const label = i % 5 === 0 || i === 0
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    const found = dailyTrend.find((s: { _id: string; count: number }) => s._id === dateStr);
    trendData.push({ label, value: found ? found.count : 0 });
  }

  // Top 10 pages by views (last 30 days)
  const topPages = await Analytics.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$path', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);

  // Top 10 countries
  const topCountries = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: thirtyDaysAgo },
        country: { $nin: [null, ''] },
      },
    },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // New vs returning visitors (30 days) — visitors with only 1 session = new
  const visitorFrequency = await Analytics.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$visitorId', sessions: { $addToSet: '$sessionId' } } },
    {
      $group: {
        _id: null,
        newVisitors: { $sum: { $cond: [{ $eq: [{ $size: '$sessions' }, 1] }, 1, 0] } },
        returningVisitors: { $sum: { $cond: [{ $gt: [{ $size: '$sessions' }, 1] }, 1, 0] } },
      },
    },
  ]);

  const newVisitors: number = visitorFrequency[0]?.newVisitors ?? 0;
  const returningVisitors: number = visitorFrequency[0]?.returningVisitors ?? 0;

  // Browser breakdown from userAgent (rough)
  const rawBrowsers = await Analytics.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    {
      $addFields: {
        browser: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: '$userAgent', regex: /Edg\// } }, then: 'Edge' },
              { case: { $regexMatch: { input: '$userAgent', regex: /OPR|Opera/ } }, then: 'Opera' },
              { case: { $regexMatch: { input: '$userAgent', regex: /Chrome/ } }, then: 'Chrome' },
              { case: { $regexMatch: { input: '$userAgent', regex: /Firefox/ } }, then: 'Firefox' },
              { case: { $regexMatch: { input: '$userAgent', regex: /Safari/ } }, then: 'Safari' },
            ],
            default: 'Other',
          },
        },
      },
    },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    totalViews,
    uniqueVisitors30dCount,
    uniqueVisitors7dCount,
    avgViewsPerSession,
    totalSessions,
    newVisitors,
    returningVisitors,
    trendData,
    topPages: topPages as { _id: string; views: number }[],
    topCountries: topCountries as { _id: string; count: number }[],
    browsers: rawBrowsers as { _id: string; count: number }[],
  };
}

export default async function AdminAnalyticsPage() {
  const s = await getSiteAnalytics();
  const maxPageViews = Math.max(...s.topPages.map(p => p.views), 1);
  const maxCountryViews = Math.max(...s.topCountries.map(c => c.count), 1);
  const maxBrowserViews = Math.max(...s.browsers.map(b => b.count), 1);
  const totalVisitors = s.newVisitors + s.returningVisitors;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="bar_chart"
        title="Website Analytics"
        description="Real-time data from your own first-party tracking — no third parties, no cookies required."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Page Views"
          value={new Intl.NumberFormat('en-US', { notation: 'compact' }).format(s.totalViews)}
          icon={MousePointer2}
          color="bg-blue-500"
        />
        <KPICard
          title="Unique Visitors (30d)"
          value={new Intl.NumberFormat('en-US', { notation: 'compact' }).format(s.uniqueVisitors30dCount)}
          icon={Users}
          color="bg-violet-500"
        />
        <KPICard
          title="Sessions (7d)"
          value={new Intl.NumberFormat('en-US').format(s.totalSessions)}
          icon={Layers}
          color="bg-sky-500"
        />
        <KPICard
          title="Avg Pages / Session"
          value={s.avgViewsPerSession.toFixed(1)}
          icon={Clock}
          color="bg-amber-500"
        />
      </div>

      {/* 30-day trend */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
        <SimpleLineChart
          title="30-Day Unique Visitor Trend"
          data={s.trendData}
          color="stroke-blue-500"
          height={260}
        />
      </div>

      {/* Three column detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Pages (Last 30 Days)</h3>
          </div>
          {s.topPages.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 italic">No page view data yet.</p>
          ) : (
            <div className="space-y-3">
              {s.topPages.map((page, i) => (
                <div key={page._id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-600 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={page._id}>
                        {page._id || '/'}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white ml-3 shrink-0 tabular-nums">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(page.views / maxPageViews) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visitor type + locations */}
        <div className="space-y-5">
          {/* New vs Returning */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Visitor Type (30d)</h3>
            </div>
            {totalVisitors === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-600 italic">No data yet.</p>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <div
                    className="h-2.5 rounded-full bg-violet-500"
                    style={{ width: `${(s.newVisitors / totalVisitors) * 100}%` }}
                  />
                  <div
                    className="h-2.5 rounded-full bg-sky-400"
                    style={{ width: `${(s.returningVisitors / totalVisitors) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                    New <span className="font-bold text-gray-900 dark:text-white ml-1">{s.newVisitors.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                    Returning <span className="font-bold text-gray-900 dark:text-white ml-1">{s.returningVisitors.toLocaleString()}</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Browsers */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">Browsers (30d)</h3>
            {s.browsers.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-600 italic">No data.</p>
            ) : (
              <div className="space-y-2.5">
                {s.browsers.map(b => (
                  <div key={b._id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 dark:text-gray-300 w-14 shrink-0">{b._id}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(b.count / maxBrowserViews) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums w-8 text-right">{b.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
            <Globe className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Locations (Last 30 Days)</h3>
          <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">— resolved via GeoIP</span>
        </div>
        {s.topCountries.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600 italic">
            No location data yet. GeoIP resolves on new visits — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.topCountries.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-600 w-4 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c._id}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{c.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(c.count / maxCountryViews) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
