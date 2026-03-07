import dbConnect from '@/lib/mongodb';
import Deal, { IDeal } from '@/models/Deal';
import { IPartner } from '@/models/Partner';
import DealsClient from '@/components/admin/DealsClient';
import AdminPageBanner from '@/components/admin/AdminPageBanner';

type PopulatedDeal = Omit<IDeal, 'partnerId'> & { partnerId: IPartner };

async function getDeals() {
  await dbConnect();
  return Deal.find({ commissionSource: { $ne: 'ACADEMY_BONUS' } }).populate('partnerId', 'name email').sort({ createdAt: -1 }).lean();
}

export default async function AdminDealsPage() {
  const deals = await getDeals() as unknown as PopulatedDeal[];

  const tableData = deals.map((deal: PopulatedDeal) => ({
      id: deal._id.toString(),
      clientName: deal.clientName,
      partnerName: deal.partnerId?.name || 'Unknown',
      dealStatus: deal.dealStatus,
      estimatedValue: deal.estimatedValue,
      valueFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.estimatedValue),
      createdAtString: new Date(deal.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="work"
        title="Deal Pipeline"
        description="Manage registered deals, update statuses, and process commissions."
      />
      <DealsClient data={tableData} />
    </div>
  );
}
