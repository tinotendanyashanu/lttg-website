import dbConnect from '@/lib/mongodb';
import Partner, { IPartner } from '@/models/Partner';
import PartnersClient from '@/components/admin/PartnersClient';
import AdminPageBanner from '@/components/admin/AdminPageBanner';

async function getPartners() {
  await dbConnect();
  // Fetch all partners for client-side sorting/filtering for now (assuming < 1000)
  // For larger datasets, we'd move this logic to the server with params.
  const raw = await Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).lean();
  // Serialize to strip all Mongoose-specific objects (ObjectIds, Buffers, etc.)
  return JSON.parse(JSON.stringify(raw)) as IPartner[];
}

export default async function AdminPartnersPage() {
  const partners = await getPartners();
  
  // Transform data for table to ensure serializable
  const tableData = partners.map((partner: IPartner) => ({
      ...partner,
      id: partner._id.toString(),
      _id: partner._id.toString(),
      createdAtString: new Date(partner.createdAt).toLocaleDateString(),
      revenueFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalReferredRevenue),
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
