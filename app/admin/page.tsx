import dbConnect from '@/lib/mongodb';
import Partner, { IPartner } from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';
import { 
  Users, 
  Briefcase, 
  CreditCard,
  Activity,
  Globe,
  MousePointer2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import KPICard from '@/components/admin/KPICard';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
import SimpleLineChart from '@/components/admin/SimpleLineChart';

import Analytics from '@/models/Analytics';

async function getAdminStats() {
  console.log('[getAdminStats] Starting...');
  await dbConnect();
  console.log('[getAdminStats] Connected to DB');
  
  const partnerCount = await Partner.countDocuments({ role: 'partner' });
  const pendingPartners = await Partner.countDocuments({ status: 'pending' });
  
  const dealCount = await Deal.countDocuments({ commissionSource: { $ne: 'ACADEMY_BONUS' } });
  const pendingDeals = await Deal.countDocuments({ dealStatus: 'registered', commissionSource: { $ne: 'ACADEMY_BONUS' } });
  
  const totalPayouts = await Payout.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const recentPartners = await Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).limit(5).lean();

  // Real Analytics Data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 1. Traffic Chart (Daily Unique Visitors)
  const trafficStats = await Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
          $group: {
              _id: { 
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                  visitor: "$visitorId" 
              }
          }
      },
      {
          $group: {
              _id: "$_id.date",
              count: { $sum: 1 }
          }
      },
      { $sort: { _id: 1 } }
  ]);

  // Fill in missing days
  const trafficData = [];
  for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = trafficStats.find((s: { _id: string; count: number }) => s._id === dateStr);
      trafficData.push({
          label: dayLabel,
          value: found ? found.count : 0
      });
  }

  // 2. Engagement Stats
  const totalPageViews = await Analytics.estimatedDocumentCount();
  
  // Calculate Avg Session Duration efficiently (approx) or View per Session
  // For now, let's do Views Per Session for the last 7 days to keep it fast
  const sessions = await Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } },
      { $group: { _id: null, avgViews: { $avg: "$count" } } }
  ]);
  const avgViewsPerSession = sessions[0]?.avgViews || 1;

  // 3. Top Regions (Countries)
  const locationStats = await Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
  ]);
  
  const formattedLocations = locationStats.map((loc: { _id: string; count: number }) => ({
      name: loc._id || 'Unknown',
      value: loc.count
  }));

  // Mock data for financial charts (still mocked as no real historical financial data source yet)
  const revenueData = [
      { label: 'Jan', value: 4000 },
      { label: 'Feb', value: 3000 },
      { label: 'Mar', value: 2000 },
      { label: 'Apr', value: 2780 },
      { label: 'May', value: 1890 },
      { label: 'Jun', value: 2390 },
      { label: 'Jul', value: 3490 },
  ];

  const partnerGrowthData = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 15 },
      { label: 'Mar', value: 20 },
      { label: 'Apr', value: 25 },
      { label: 'May', value: 35 },
      { label: 'Jun', value: 45 },
      { label: 'Jul', value: 60 },
  ];

  return {
    partnerCount,
    pendingPartners,
    dealCount,
    pendingDeals,
    totalPayouts: totalPayouts[0]?.total || 0,
    recentPartners,
    revenueData,
    partnerGrowthData,
    trafficData,
    totalPageViews,
    avgViewsPerSession,
    formattedLocations
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
             title="Total Partners"
             value={stats.partnerCount}
             icon={Users}
             color="bg-blue-500"
             trend={{ value: 12, label: 'vs last month', positive: true }}
        />
        <KPICard 
             title="Active Deals"
             value={stats.dealCount}
             icon={Briefcase}
             color="bg-purple-500"
             trend={{ value: 5, label: 'vs last month', positive: true }}
        />
        <KPICard 
             title="Total Payouts"
             value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalPayouts)}
             icon={CreditCard}
             color="bg-emerald-500"
             trend={{ value: 8, label: 'vs last month', positive: true }}
        />
         <KPICard 
             title="Pending Actions"
             value={stats.pendingPartners + stats.pendingDeals}
             icon={Activity}
             color="bg-amber-500"
             trend={stats.pendingPartners + stats.pendingDeals > 0 ? { value: stats.pendingPartners + stats.pendingDeals, label: 'Requires attention', positive: false } : undefined}
        />
      </div>

      {/* Site Matrix / Web Analytics Section */}
       <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                      <Globe className="h-4 w-4" />
                  </div>
                  Site Matrix
              </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
                  <SimpleLineChart 
                      title="Weekly Traffic (Unique Visitors)" 
                      data={stats.trafficData} 
                      color="stroke-blue-500"
                      height={240}
                  />
              </div>

              {/* Engagement Stats */}
              <div className="space-y-6">
                  <KPICard 
                       title="Total Page Views"
                       value={new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.totalPageViews)}
                       icon={MousePointer2}
                       color="bg-blue-500"
                       trend={{ value: 100, label: 'tracking active', positive: true }}
                  />
                   <KPICard 
                       title="Views / Session"
                       value={stats.avgViewsPerSession.toFixed(1)}
                       icon={Clock}
                       color="bg-slate-700"
                       trend={{ value: 0, label: 'last 7 days', positive: true }}
                  />
                  
                  {/* Top Locations */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">Top Locations</h3>
                      <div className="space-y-4">
                          {stats.formattedLocations && stats.formattedLocations.length > 0 ? (
                              stats.formattedLocations.map((loc: { name: string; value: number }, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="flex items-center text-slate-700">
                                          <span className="w-6 text-slate-400 font-mono text-xs">{i + 1}.</span>
                                          {loc.name}
                                      </span>
                                      <span className="font-medium text-slate-900">{loc.value}</span>
                                  </div>
                              ))
                          ) : (
                              <p className="text-sm text-slate-400 italic">No location data yet.</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
       </div>

      {/* Financial Charts Section */}
      <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mr-3">
                      <Activity className="h-4 w-4" />
                  </div>
                  Financial Performance
              </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
                  <SimpleBarChart 
                      title="Revenue Overview" 
                      data={stats.revenueData} 
                      color="bg-emerald-500"
                  />
              </div>
              <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
                  <SimpleBarChart 
                      title="Partner Growth" 
                      data={stats.partnerGrowthData} 
                      color="bg-blue-500"
                  />
              </div>
          </div>
      </div>

      {/* Recent Partners Table */}
      <div className="mt-8 bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden mb-12">
        <div className="p-6 md:p-8 flex justify-between items-center bg-white border-b border-slate-100">
            <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Newest Partners</h3>
                <p className="text-sm text-slate-500 mt-1">Recently onboarded affiliates</p>
            </div>
            <Link href="/admin/partners" className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs tracking-wider uppercase border-b border-slate-100">
                    <tr>
                        <th className="px-8 py-4">Name</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Joined</th>
                        <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {stats.recentPartners.map((partner: IPartner) => (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <tr key={(partner._id as any).toString()} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5">
                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{partner.name}</div>
                                <div className="text-slate-500 text-xs mt-0.5">{partner.email}</div>
                            </td>
                            <td className="px-8 py-5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize border
                                    ${partner.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                      partner.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {partner.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>}
                                    {partner.status}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-slate-500 font-medium">{new Date(partner.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-8 py-5 text-right">
                                <Link href={`/admin/partners/${partner._id}`} className="text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">View</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
