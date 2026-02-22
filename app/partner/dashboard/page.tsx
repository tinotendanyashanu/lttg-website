export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import DealModel from '@/models/Deal';
import CourseModel from '@/models/Course';
import AffiliateRiskFlagModel from '@/models/AffiliateRiskFlag';
import { getPartnerBalances } from '@/lib/services/ledger';
import { evaluatePartnerPayoutEligibility } from '@/lib/actions/payouts';
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
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronsUp
} from 'lucide-react';
import Link from 'next/link';
import OnboardingChecklist from '@/components/partner/OnboardingChecklist';
import ReferralLinkGenerator from '@/components/partner/ReferralLinkGenerator';
import PerformanceAnalyticsPanel from '@/components/partner/PerformanceAnalyticsPanel';
import CommissionForecastPanel from '@/components/partner/CommissionForecastPanel';

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
    
  // Fetch eligibility & risk flags
  const eligibility = await evaluatePartnerPayoutEligibility(partner._id.toString());
  const riskFlags = await AffiliateRiskFlagModel.find({ 
    partnerId: partner._id, 
    resolved: false, 
    severity: 'high' 
  }).lean();

  const hasDeals = await DealModel.exists({ partnerId: partner._id });

  return { partner, deals, totalCourses, completedCourses, eligibility, hasRiskFlags: riskFlags.length > 0, hasDeals: !!hasDeals };
}

// Tier helper
function getTierProgress(tier: string, revenue: number) {
  if (tier === 'referral') return { next: 'Agency', threshold: 10000, current: revenue, pct: Math.min((revenue / 10000) * 100, 100) };
  if (tier === 'agency') return { next: 'Enterprise', threshold: 50000, current: revenue, pct: Math.min((revenue / 50000) * 100, 100) };
  return null; // enterprise or creator
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const data = await getDashboardData(session.user.email);
  if (!data) return <div>Partner not found</div>;

  const { partner, deals, totalCourses, completedCourses, eligibility, hasRiskFlags, hasDeals } = data;
  // Tier is PURELY economic — it never controls feature or sidebar visibility.
  // All partners see identical dashboard layout. Tier affects badge + commission % only.
  const tierProgress = getTierProgress(partner.tier || 'referral', partner.stats.totalReferredRevenue || 0);

  // Unified stats for ALL partner tiers and types
  const stats = [
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
      {/* Welcome Section — all partners see same header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
            <p className="text-slate-500">Welcome back, {partner.name}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link href="/partner/dashboard/deals/register" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            + Register Deal
        </Link>
      </div>

      <OnboardingChecklist 
        profileComplete={!!partner.bankDetails?.accountName || !!partner.payoutMethod || !!partner.localRemittanceDetails?.fullName}
        payoutMethodSet={!!partner.payoutMethod}
        academyFinished={partner.hasCompletedOnboarding || false}
        dealRegistered={hasDeals}
        standardsReviewed={partner.termsAccepted || false}
      />

      {/* Referral Link Generator — available to ALL partner types */}
      <ReferralLinkGenerator 
        referralCode={partner.referralCode || ''}
        clicks={partner.stats.referralClicks || 0}
        conversions={partner.stats.referralLeads || 0}
      />

      {/* Warning Banners */}
      <div className="space-y-3">
        {hasRiskFlags && (
          <div className="flex items-start p-4 rounded-xl text-sm font-medium bg-slate-50 text-slate-800 border border-slate-200">
            <Info className="h-5 w-5 mr-3 shrink-0 text-slate-500 mt-0.5" />
            <p>Your account has activity under review. This does not block your earnings but may require manual verification.</p>
          </div>
        )}
        
        {(partner as any).debtBalance > 0 && (
          <div className="flex items-start p-4 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            <AlertTriangle className="h-5 w-5 mr-3 shrink-0 text-red-600 mt-0.5" />
            <p>A previous client refund resulted in a balance adjustment. Future commissions will first offset this amount. Current debt: <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((partner as any).debtBalance)}</strong></p>
          </div>
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

      <CommissionForecastPanel 
        isEligible={eligibility.isEligible}
        reasons={eligibility.reasons}
        approvedBalance={partner.stats.approvedBalance || 0}
        pendingCommission={partner.stats.pendingCommission || 0}
      />

      <PerformanceAnalyticsPanel partnerId={partner._id.toString()} stats={partner.stats} />

      {/* Tier Progression */}
      {tierProgress && (
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-8">
          <div className="flex items-center mb-6">
            <ChevronsUp className="h-6 w-6 text-emerald-500 mr-2" />
            <h3 className="text-lg font-bold text-slate-900">Tier Progression</h3>
          </div>
          
          <div className="mb-2 flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 font-medium">Current Tier</p>
              <p className="text-xl font-bold text-slate-900 capitalize">{partner.tier || 'Referral'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium">Next Tier: <span className="text-slate-900 font-bold">{tierProgress.next}</span></p>
              <p className="text-sm font-bold text-emerald-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tierProgress.current)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tierProgress.threshold)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden relative">
            <div 
              className="bg-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${tierProgress.pct}%` }}
            />
          </div>
          
          <p className="text-sm text-slate-600">
            You are <strong className="text-slate-900">{tierProgress.pct.toFixed(1)}%</strong> toward the <strong className="text-slate-900">{tierProgress.next} Tier</strong>. 
            Keep referring to unlock higher commissions and exclusive benefits!
          </p>
        </div>
      )}

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
            <div className="flex items-start p-4 rounded-xl bg-linear-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100">
              <div className="p-2 bg-emerald-500 rounded-lg mr-4 mt-0.5 shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">New Academy Courses Available</p>
                <p className="text-xs text-slate-500 mt-1">5 new courses have been added to the Partner Academy — including &quot;Advanced Closing Techniques&quot; and &quot;Understanding Our Tech Stack&quot;. Complete them to sharpen your skills.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Feb 2026</p>
              </div>
            </div>
            <div className="flex items-start p-4 rounded-xl bg-linear-to-r from-blue-50 to-blue-50/50 border border-blue-100">
              <div className="p-2 bg-blue-500 rounded-lg mr-4 mt-0.5 shrink-0">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Tier Upgrades Are Automatic</p>
                <p className="text-xs text-slate-500 mt-1">Reminder: your partner tier automatically upgrades when your lifetime referred revenue crosses $10K (Agency) or $50K (Enterprise). No application needed.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Feb 2026</p>
              </div>
            </div>
            <div className="flex items-start p-4 rounded-xl bg-linear-to-r from-amber-50 to-amber-50/50 border border-amber-100">
              <div className="p-2 bg-amber-500 rounded-lg mr-4 mt-0.5 shrink-0">
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
