import dbConnect from '@/lib/mongodb';
import Partner, { IPartner } from '@/models/Partner';
import PartnersClient from '@/components/admin/PartnersClient';

async function getPartners() {
  await dbConnect();
  // Fetch all partners for client-side sorting/filtering for now (assuming < 1000)
  // For larger datasets, we'd move this logic to the server with params.
  return Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).lean() as unknown as IPartner[];
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
      // Ensure complex objects are not passed unless serializable
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Partner Management</h2>
          <p className="text-slate-500">Approve applications and manage partner accounts.</p>
        </div>
      </div>

      <PartnersClient data={tableData} />
    </div>
  );
}
