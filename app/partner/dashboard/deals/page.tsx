import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import DealModel from '@/models/Deal';
import PartnerModel from '@/models/Partner';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react'; // Kept Search, changed Plus to PlusCircle in the edit, but Plus is used in the JSX. I will keep Plus as it's used.
import { Deal, Partner } from '@/types';

async function getDeals(userId: string, query: string, status: string) {
  await dbConnect();
  // Using findById since we are passing session.user.id
  const partner = await PartnerModel.findById(userId).lean() as unknown as Partner;
  if (!partner) return [];

  // Build filter
  const filter: any = { partnerId: partner._id };
  
  if (status !== 'all') {
    filter.dealStatus = status;
  }

  if (query) {
    // Basic search on client name
    filter.clientName = { $regex: query, $options: 'i' };
  }

  const deals = await DealModel.find(filter)
    .sort({ createdAt: -1 })
    .lean() as unknown as Deal[];
    
  return deals;
}


export default async function DealsPage(props: {
    searchParams: Promise<{ q?: string; status?: string }>;
  }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const status = searchParams.status || 'all';
  const deals = await getDeals(session.user.id, query, status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Deals</h2>
          <p className="text-slate-500">Manage your registered opportunities.</p>
        </div>
        <Link 
          href="/partner/dashboard/deals/register" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Register New Deal
        </Link>
      </div>

       {/* Filters */}
       <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <form>
                <input 
                    name="q" 
                    defaultValue={query} 
                    placeholder="Search by client name..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                />
                <input type="hidden" name="status" value={status} />
              </form>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0">
              {['all', 'registered', 'approved', 'closed', 'commission_paid'].map((s) => (
                  <Link 
                    key={s} 
                    href={`?status=${s}&q=${query}`}
                    className={`px-4 py-2.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                        status === s 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                      {s.replace('_', ' ')}
                  </Link>
              ))}
          </div>
      </div>

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-500 font-bold uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-8 py-6 border-b border-slate-50">Client</th>
                        <th className="px-8 py-6 border-b border-slate-50">Est. Value</th>
                        <th className="px-8 py-6 border-b border-slate-50">Commission %</th>
                        <th className="px-8 py-6 border-b border-slate-50">Potential Earnings</th>
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
                                    {deal.finalValue && deal.finalValue !== deal.estimatedValue && <span className="ml-2 text-xs text-slate-400 line-through">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.estimatedValue)}</span>}
                                </td>
                                <td className="px-8 py-5 font-medium text-slate-500">{(deal.commissionRate * 100).toFixed(0)}%</td>
                                <td className="px-8 py-5 font-bold text-emerald-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.commissionAmount || ((deal.finalValue || deal.estimatedValue) * deal.commissionRate))}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize 
                                        ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                          deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-700' :
                                          deal.dealStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                          'bg-amber-100 text-amber-700'}`}>
                                        {deal.dealStatus.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-400 font-medium">{new Date(deal.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium">
                                No deals found. <Link href="/partner/dashboard/deals/register" className="text-emerald-600 hover:underline">Register your first deal</Link> to start earning.
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
