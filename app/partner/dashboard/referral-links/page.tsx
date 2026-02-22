import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import ReferralClickModel from '@/models/ReferralClick';
import LeadModel from '@/models/Lead';
import DealModel from '@/models/Deal';
import { Partner } from '@/types';
import ReferralLinksDashboard from '@/components/partner/ReferralLinksDashboard';

async function getReferralStats(userId: string) {
  await dbConnect();
  const partner = (await PartnerModel.findById(userId).lean()) as unknown as Partner;
  if (!partner) return null;

  const partnerId = partner._id;

  // Total clicks
  const totalClicks = await ReferralClickModel.countDocuments({ partnerId });

  // Total leads from referral sources
  const totalLeads = await LeadModel.countDocuments({
    partnerId,
    source: { $in: ['referral_link', 'contact_form', 'consultation_form', 'project_inquiry'] },
  });

  // Total converted deals (from leads that have been converted)
  const totalConvertedDeals = await LeadModel.countDocuments({
    partnerId,
    status: 'converted',
    relatedDealId: { $ne: null },
  });

  // Recent clicks (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentClicks = await ReferralClickModel.countDocuments({
    partnerId,
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Click history for chart (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const clicksByDay = await ReferralClickModel.aggregate([
    {
      $match: {
        partnerId: partner._id,
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    referralCode: partner.referralCode || '',
    totalClicks,
    totalLeads,
    totalConvertedDeals,
    recentClicks,
    conversionRate: totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : '0.0',
    dealConversionRate: totalLeads > 0 ? ((totalConvertedDeals / totalLeads) * 100).toFixed(1) : '0.0',
    clicksByDay: clicksByDay.map((d: { _id: string; count: number }) => ({
      date: d._id,
      clicks: d.count,
    })),
  };
}

export default async function ReferralLinksPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stats = await getReferralStats(session.user.id);
  if (!stats) return null;

  return <ReferralLinksDashboard stats={stats} />;
}
