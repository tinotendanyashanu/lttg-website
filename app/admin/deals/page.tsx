import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

async function getDeals() {
  await dbConnect();
  return Deal.find({}).populate('partnerId', 'name email').sort({ createdAt: -1 }).lean();
}

export default async function AdminDealsPage() {
  const deals = await getDeals();

  const tableData = deals.map((deal: any) => ({
      ...deal,
      id: deal._id.toString(),
      _id: deal._id.toString(),
      partnerName: deal.partnerId?.name || 'Unknown',
      valueFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.estimatedValue),
      createdAtString: new Date(deal.createdAt).toLocaleDateString(),
  }));

  const columns = [
      {
          header: 'Client',
          accessor: 'clientName',
          className: 'font-medium text-slate-900'
      },
      {
          header: 'Partner',
          accessor: 'partnerName'
      },
      {
          header: 'Value',
          accessor: 'valueFormatted'
      },
      {
          header: 'Status',
          accessor: (item: any) => (
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                ${item.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                  item.dealStatus === 'closed' ? 'bg-blue-100 text-blue-800' :
                  item.dealStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'}`}>
                {item.dealStatus.replace('_', ' ')}
            </span>
          )
      },
      {
          header: 'Date',
          accessor: 'createdAtString'
      }
  ];

  const actions = (item: any) => (
      <Link href={`/admin/deals/${item.id}`} className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm">
          <Eye className="h-4 w-4 mr-1" /> View
      </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Deal Pipeline</h2>
          <p className="text-slate-500">Manage registered deals and process commissions.</p>
        </div>
      </div>

      <DataTable 
          data={tableData} 
          columns={columns} 
          searchKeys={['clientName', 'partnerName', 'dealStatus']}
          actions={actions}
      />
    </div>
  );
}
