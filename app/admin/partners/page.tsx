import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Link from 'next/link';
import { updatePartnerStatus, deletePartner } from '@/lib/actions/admin';
import { MoreVertical, Check, Shield, Trash2, Eye } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

async function getPartners() {
  await dbConnect();
  // Fetch all partners for client-side sorting/filtering for now (assuming < 1000)
  // For larger datasets, we'd move this logic to the server with params.
  return Partner.find({ role: 'partner' }).sort({ createdAt: -1 }).lean();
}

export default async function AdminPartnersPage() {
  const partners = await getPartners();
  
  // Transform data for table to ensure serializable
  const tableData = partners.map((partner: any) => ({
      ...partner,
      id: partner._id.toString(),
      _id: partner._id.toString(),
      createdAtString: new Date(partner.createdAt).toLocaleDateString(),
      revenueFormatted: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalReferredRevenue)
  }));

  const columns = [
      {
          header: 'Partner',
          accessor: (item: any) => (
              <div>
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-slate-400 text-xs">{item.email}</div>
              </div>
          )
      },
      {
          header: 'Status',
          accessor: (item: any) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                  ${item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                    item.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'}`}>
                  {item.status}
              </span>
          )
      },
      {
          header: 'Tier',
          accessor: (item: any) => (
             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 capitalize">
                {item.tier}
            </span>
          )
      },
       {
          header: 'Revenue',
          accessor: 'revenueFormatted'
      },
      {
          header: 'Joined',
          accessor: 'createdAtString'
      }
  ];

  const actions = (item: any) => (
      <div className="flex items-center justify-end space-x-2">
          <Link href={`/admin/partners/${item.id}`} className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="View Details">
              <Eye className="h-4 w-4" />
          </Link>
          {item.status === 'pending' && (
              <form action={updatePartnerStatus.bind(null, item.id, 'active', item.tier)}>
                  <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve">
                      <Check className="h-4 w-4" />
                  </button>
              </form>
          )}
          {item.status === 'active' && (
              <form action={updatePartnerStatus.bind(null, item.id, 'suspended', item.tier)}>
                  <button type="submit" className="p-1 text-red-600 hover:bg-red-50 rounded" title="Suspend">
                      <Shield className="h-4 w-4" />
                  </button>
              </form>
          )}
          <form action={deletePartner.bind(null, item.id)}>
              <button type="submit" className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                  <Trash2 className="h-4 w-4" />
              </button>
          </form>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Partner Management</h2>
          <p className="text-slate-500">Approve applications and manage partner accounts.</p>
        </div>
      </div>

      <DataTable 
          data={tableData} 
          columns={columns} 
          searchKeys={['name', 'email', 'status', 'tier']}
          actions={actions}
      />
    </div>
  );
}
