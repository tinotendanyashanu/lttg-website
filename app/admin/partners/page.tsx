import dbConnect from '@/lib/mongodb';
import Partner, { IPartner } from '@/models/Partner';
import PartnersClient from '@/components/admin/PartnersClient';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { Account } from '@/models/Account';
import { calculatePerformanceMetrics } from '@/lib/services/performance';

async function getPartners() {
  await dbConnect();
  const raw = await Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).lean();
  
  // Enhance partners with performance data
  const enhancedPartners = await Promise.all(raw.map(async (partner) => {
    const account = await Account.findOne({ email: partner.email }).select('_id').lean();
    let performance = null;
    if (account) {
      performance = await calculatePerformanceMetrics(account._id.toString());
    }
    return {
      ...partner,
      performance
    };
  }));

  return JSON.parse(JSON.stringify(enhancedPartners));
}

export default async function AdminPartnersPage() {
  const partners = await getPartners();
  
  // Transform data for table to ensure serializable
  const tableData = partners.map((partner: any) => ({
      ...partner,
      id: partner._id.toString(),
      _id: partner._id.toString(),
      createdAtString: new Date(partner.createdAt).toLocaleDateString(),
      revenueFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalReferredRevenue),
      performanceStatus: partner.performance?.status || 'N/A',
      isTopPerformer: partner.performance?.isTopPerformer || false,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="handshake"
        title="Partner Management"
        description="Approve applications, manage tiers, and oversee partner accounts."
      />
      <PartnersClient data={tableData} />
    </div>
  );
}
