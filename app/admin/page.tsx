import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
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
  await dbConnect();
  
  const partnerCount = await Partner.countDocuments({ role: 'partner' });
  const pendingPartners = await Partner.countDocuments({ status: 'pending' });
  
  const dealCount = await Deal.countDocuments();
  const pendingDeals = await Deal.countDocuments({ dealStatus: 'registered' });
  
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
      
      const found = trafficStats.find((s: any) => s._id === dateStr);
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
  
  const formattedLocations = locationStats.map((loc: any) => ({
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
       <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-indigo-500" />
              Site Matrix (Web Analytics)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart */}
              <div className="lg:col-span-2">
                  <SimpleLineChart 
                      title="Weekly Traffic (Unique Visitors)" 
                      data={stats.trafficData} 
                      color="stroke-indigo-500"
                      height={240}
                  />
              </div>

              {/* Engagement Stats */}
              <div className="space-y-4">
                  <KPICard 
                       title="Total Page Views"
                       value={new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.totalPageViews)}
                       icon={MousePointer2}
                       color="bg-indigo-500"
                       trend={{ value: 100, label: 'tracking active', positive: true }}
                  />
                   <KPICard 
                       title="Views / Session"
                       value={stats.avgViewsPerSession.toFixed(1)}
                       icon={Clock}
                       color="bg-cyan-500"
                       trend={{ value: 0, label: 'last 7 days', positive: true }}
                  />
                  
                  {/* Top Locations */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Top Locations</h3>
                      <div className="space-y-3">
                          {stats.formattedLocations && stats.formattedLocations.length > 0 ? (
                              stats.formattedLocations.map((loc: any, i: number) => (
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
      <h2 className="text-xl font-bold text-slate-800 flex items-center pt-4">
            <Activity className="h-5 w-5 mr-2 text-emerald-500" />
            Financial Performance
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleBarChart 
              title="Revenue Overview" 
              data={stats.revenueData} 
              color="bg-emerald-500"
          />
          <SimpleBarChart 
              title="Partner Growth" 
              data={stats.partnerGrowthData} 
              color="bg-blue-500"
          />
      </div>

      {/* Recent Partners Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Newest Partners</h3>
            <Link href="/admin/partners" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">Manage All &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {stats.recentPartners.map((partner: any) => (
                        <tr key={partner._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{partner.name}</div>
                                <div className="text-slate-400 text-xs">{partner.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                    ${partner.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                                      partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                      'bg-amber-100 text-amber-800'}`}>
                                    {partner.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{new Date(partner.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                                <Link href={`/admin/partners/${partner._id}`} className="text-purple-600 hover:text-purple-700 font-medium">View</Link>
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
