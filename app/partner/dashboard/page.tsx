export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import DealModel from '@/models/Deal';
import CourseModel from '@/models/Course';
import { getPartnerBalances } from '@/lib/services/ledger';
import { Partner, Deal, Course } from '@/types';
import { 
  DollarSign, 
  TrendingUp, 
  Clock,
  GraduationCap,
  ArrowRight,
  Shield,
  Settings,
  PlusCircle,
  Megaphone,
  Sparkles,
  CalendarCheck,
  Star,
  MousePointer2,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

async function getDashboardData(email: string) {
  await dbConnect();
  const partner = await PartnerModel.findOne({ email }).lean() as unknown as Partner;
  
  if (!partner) return null;

  const ledgerBalances = await getPartnerBalances(partner._id.toString());
  partner.stats = {
    ...partner.stats,
    ...ledgerBalances
  };

  const deals = await DealModel.find({ partnerId: partner._id })
    .populate('payoutBatchId', 'referenceNumber status payoutMonth')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean() as unknown as Deal[];

  // Fetch course progress
  const courses = await CourseModel.find({ published: true }).lean() as unknown as Course[];
  const progressList = partner.partnerProgress || [];
  const totalCourses = courses.length;
  const completedCourses = progressList.filter((p) => p.isCompleted).length;
    
  return { partner, deals, totalCourses, completedCourses };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const data = await getDashboardData(session.user.email);
  if (!data) return <div>Partner not found</div>;

  const { partner, deals, totalCourses, completedCourses } = data;
  const isCreator = partner.partnerType === 'creator';

  const stats = isCreator ? [
    {
      name: 'Referral Clicks',
      value: (partner.stats.referralClicks || 0).toLocaleString(),
      icon: MousePointer2,
      color: 'bg-blue-500',
      href: '#'
    },
    {
      name: 'Leads Generated',
      value: (partner.stats.referralLeads || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      href: '/partner/dashboard/leads'
    },
    {
      name: 'Total Earnings',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalCommissionEarned),
      icon: DollarSign,
      color: 'bg-amber-500',
      href: '/partner/dashboard/earnings'
    },
    {
      name: 'Academy Progress',
      value: `${completedCourses}/${totalCourses} Courses`,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      href: '/partner/dashboard/academy'
    },
  ] : [
    {
      name: 'Total Revenue Referred',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalReferredRevenue),
      icon: TrendingUp,
      color: 'bg-blue-500',
      href: '/partner/dashboard/deals'
    },
    {
      name: 'Lifetime Commission',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalCommissionEarned),
      icon: DollarSign,
      color: 'bg-emerald-500',
      href: '/partner/dashboard/earnings'
    },
    {
      name: 'Pending Commission',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.pendingCommission),
      icon: Clock,
      color: 'bg-amber-500',
      href: '/partner/dashboard/earnings'
    },
    {
      name: 'Academy Progress',
      value: `${completedCourses}/${totalCourses} Courses`,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      href: '/partner/dashboard/academy'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
            <p className="text-slate-500">Welcome back, {partner.name}. Here&apos;s what&apos;s happening today.</p>
        </div>
        
        {isCreator && partner.referralCode ? (
             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 w-full md:w-auto">
                <div className="text-sm font-medium text-slate-500 whitespace-nowrap">Your Referral Link:</div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-700 select-all">
                    leosystems.com?ref={partner.referralCode}
                </div>
                {/* Simple Copy Button could go here */}
             </div>
        ) : (
            <Link href="/partner/dashboard/deals/register" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                + Register Deal
            </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="group block bg-white p-6 rounded-4xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
            <div className="flex items-start justify-between mb-6">
               <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
               </div>
               <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
               </div>
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Payout Settings & Status */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
               <h3 className="text-lg font-bold text-slate-900 flex items-center">
                 <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
                 Payout Status
               </h3>
               <p className="text-sm text-slate-500 mt-1">Next Payout Date: <span className="font-bold text-slate-800">5th of Next Month</span></p>
            </div>
            <Link href="/partner/dashboard/settings" className="self-start sm:self-auto px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
              Update Payout Method
            </Link>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
               <p className="text-sm font-semibold text-slate-500 mb-1">Approved Balance</p>
               <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.approvedBalance || 0)}
               </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
               <p className="text-sm font-semibold text-slate-500 mb-1">Pending Earnings</p>
               <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.pendingCommission || 0)}
               </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
               <p className="text-sm font-semibold text-slate-500 mb-1">Minimum Threshold</p>
               <p className="text-xl sm:text-2xl font-bold text-slate-900">$50.00</p>
            </div>
         </div>

         {(partner.stats.approvedBalance || 0) < 50 ? (
            <div className="flex items-start sm:items-center p-4 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
               <Shield className="h-5 w-5 mr-3 shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
               <p><strong>Below Threshold:</strong> Your approved balance is below the $50 minimum. Payouts will roll over to the next month once the threshold is reached.</p>
            </div>
         ) : (
            <div className="flex items-start sm:items-center p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
               <CheckCircle className="h-5 w-5 mr-3 shrink-0 text-emerald-600 mt-0.5 sm:mt-0" />
               <p><strong>Eligible for Payout:</strong> Your approved balance meets the $50 minimum threshold. Your payout will be generated securely on the 5th.</p>
            </div>
         )}
      </div>

      {/* Quick Actions & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-4xl shadow-sm border border-slate-100 p-4 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/partner/dashboard/deals/register"
              className="flex items-center p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors group"
            >
              <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                <PlusCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">Register New Deal</span>
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/partner/dashboard/academy"
              className="flex items-center p-3 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors group"
            >
              <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">View Academy</span>
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/partner/dashboard/rules"
              className="flex items-center p-3 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors group"
            >
              <div className="p-2 bg-slate-800 rounded-lg mr-3">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">Program Rules</span>
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/partner/dashboard/settings"
              className="flex items-center p-3 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors group"
            >
              <div className="p-2 bg-slate-600 rounded-lg mr-3">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">Settings</span>
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 bg-white rounded-4xl shadow-sm border border-slate-100 p-4 sm:p-8">
          <div className="flex items-center mb-4">
            <Megaphone className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-bold text-slate-900">Program Announcements</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100">
              <div className="p-2 bg-emerald-500 rounded-lg mr-4 mt-0.5 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">New Academy Courses Available</p>
                <p className="text-xs text-slate-500 mt-1">5 new courses have been added to the Partner Academy — including &quot;Advanced Closing Techniques&quot; and &quot;Understanding Our Tech Stack&quot;. Complete them to sharpen your skills.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Feb 2026</p>
              </div>
            </div>
            <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100">
              <div className="p-2 bg-blue-500 rounded-lg mr-4 mt-0.5 flex-shrink-0">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Tier Upgrades Are Automatic</p>
                <p className="text-xs text-slate-500 mt-1">Reminder: your partner tier automatically upgrades when your lifetime referred revenue crosses $10K (Agency) or $50K (Enterprise). No application needed.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Feb 2026</p>
              </div>
            </div>
            <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-100">
              <div className="p-2 bg-amber-500 rounded-lg mr-4 mt-0.5 flex-shrink-0">
                <CalendarCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Payout Schedule Update</p>
                <p className="text-xs text-slate-500 mt-1">Commissions are now processed within 14 business days of client payment clearing. Make sure your bank details are up to date in Settings.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Jan 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Deals */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Deals</h3>
                <p className="text-sm text-slate-500">Your latest registered opportunities.</p>
            </div>
            <Link href="/partner/dashboard/deals" className="text-sm text-emerald-600 hover:text-emerald-700 font-bold px-4 py-2 bg-emerald-50 rounded-full transition-colors shrink-0">View All &rarr;</Link>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-slate-50">
          {deals.length > 0 ? (
            deals.map((deal) => (
              <div key={deal._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900 text-sm">{deal.clientName}</p>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize 
                    ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-700' :
                      deal.dealStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'}`}>
                    {deal.dealStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.finalValue || deal.estimatedValue)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</p>
                </div>
                {deal.commissionStatus === 'Paid' && deal.payoutBatchId?.referenceNumber && (
                  <p className="text-xs text-slate-500 font-mono flex items-center">
                    <CheckCircle className="h-3 w-3 text-emerald-500 mr-1 shrink-0" />
                    Ref: {deal.payoutBatchId.referenceNumber}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-slate-400 font-medium text-sm">
              No deals yet. <Link href="/partner/dashboard/deals" className="text-emerald-600 hover:underline">Register your first deal</Link>.
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-500 font-bold uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-8 py-6 border-b border-slate-50">Client</th>
                        <th className="px-8 py-6 border-b border-slate-50">Value</th>
                        <th className="px-8 py-6 border-b border-slate-50">Status</th>
                        <th className="px-8 py-6 border-b border-slate-50">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {deals.length > 0 ? (
                        deals.map((deal) => (
                            <tr key={deal._id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-5 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{deal.clientName}</td>
                                <td className="px-8 py-5 font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.finalValue || deal.estimatedValue)}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize 
                                        ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                          deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-700' :
                                          deal.dealStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                          'bg-amber-100 text-amber-700'}`}>
                                        {deal.dealStatus.replace('_', ' ')}
                                    </span>
                                    {deal.commissionStatus === 'Paid' && deal.payoutBatchId?.referenceNumber && (
                                       <div className="mt-1.5 text-xs text-slate-500 font-mono flex items-center">
                                          <CheckCircle className="h-3 w-3 text-emerald-500 mr-1 shrink-0" />
                                          Ref: {deal.payoutBatchId.referenceNumber}
                                       </div>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-slate-400 font-medium">{new Date(deal.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium">
                                No deals registered yet. <Link href="/partner/dashboard/deals" className="text-emerald-600 hover:underline">Register your first deal</Link>.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
