import dbConnect from '@/lib/mongodb';
import DealModel from '@/models/Deal';
import mongoose from 'mongoose';
import { TrendingUp, DollarSign, Percent, Presentation } from 'lucide-react';
import MonthlyRevenueChart from './MonthlyRevenueChart';

export default async function PerformanceAnalyticsPanel({
  partnerId,
  stats
}: {
  partnerId: string;
  stats: any;
}) {
  await dbConnect();

  // Aggregate monthly revenue for the last 6 months
  // Exclude academy_bonus and refunded deals
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start of the month 6 months ago

  const pipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        partnerId: new mongoose.Types.ObjectId(partnerId),
        dealStatus: 'closed',
        commissionStatus: { $nin: ['Refunded', 'Reversed'] },
        commissionSource: 'DEAL',
        closedAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$closedAt' },
          month: { $month: '$closedAt' }
        },
        revenue: { $sum: { $ifNull: ['$finalValue', '$estimatedValue'] } }
      }
    },
    {
      $sort: { '_id.year': 1 as 1, '_id.month': 1 as 1 }
    }
  ];

  const rawData = await DealModel.aggregate(pipeline);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Fill missing months with 0
  const chartData = [];
  const currentMonthIdx = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed for MongoDB match

      const found = rawData.find(r => r._id.year === y && r._id.month === m);
      chartData.push({
          month: monthNames[m - 1],
          revenue: found ? found.revenue : 0
      });
  }

  // Averages calculations
  // Get all valid deals to calculate average deal value
  const allDealsAgg = await DealModel.aggregate([
    {
      $match: {
        partnerId: new mongoose.Types.ObjectId(partnerId),
        dealStatus: 'closed',
        commissionStatus: { $nin: ['Refunded', 'Reversed'] },
        commissionSource: 'DEAL',
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $ifNull: ['$finalValue', '$estimatedValue'] } },
        count: { $sum: 1 }
      }
    }
  ]);

  const avgDealValue = allDealsAgg.length > 0 && allDealsAgg[0].count > 0 
    ? allDealsAgg[0].totalRevenue / allDealsAgg[0].count 
    : 0;

  const conversionRate = (stats.referralClicks || 0) > 0 
    ? ((stats.referralLeads || 0) / stats.referralClicks) * 100 
    : 0;

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden mb-8 p-4 sm:p-8">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-lg font-bold text-slate-900">Performance Analytics</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Stats Grid */}
        <div className="w-full lg:w-1/3 grid grid-cols-2 lg:grid-cols-1 gap-4 shrink-0">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start flex-col gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
               <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Avg. Deal Size</p>
              <p className="text-xl font-bold text-slate-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgDealValue)}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start flex-col gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
               <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Valid Revenue</p>
              <p className="text-xl font-bold text-slate-900">
                 {/* This differs slightly from totalReferredRevenue as it guarantees exclusion of refunds strictly across history */}
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(allDealsAgg[0]?.totalRevenue || 0)}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start flex-col gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
               <Presentation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Paid Commissions</p>
              <p className="text-xl font-bold text-slate-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.paidCommission || 0)}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start flex-col gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
               <Percent className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Link Conversion</p>
              <p className="text-xl font-bold text-slate-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Right Chart Area */}
        <div className="flex-1 w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6">
          <h4 className="font-bold text-slate-900">Revenue Volume (6 Months)</h4>
          <p className="text-xs text-slate-500 mt-1">Closed deals value over time.</p>
          <MonthlyRevenueChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
