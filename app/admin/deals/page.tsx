import dbConnect from '@/lib/mongodb';
import Deal, { IDeal } from '@/models/Deal';
import { IPartner } from '@/models/Partner';
import DealsClient from '@/components/admin/DealsClient';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Deal Pipeline</h2>
          <p className="text-slate-500">Manage registered deals and process commissions.</p>
        </div>
      </div>

      <DealsClient data={tableData} />
    </div>
  );
}
