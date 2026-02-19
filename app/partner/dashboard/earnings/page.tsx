import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import PayoutModel from '@/models/Payout';
import { DollarSign, CreditCard, Clock } from 'lucide-react';
import { Partner, Payout } from '@/types';

async function getEarningsData(email: string) {
  await dbConnect();
  const partner = await PartnerModel.findOne({ email }).lean() as unknown as Partner;
  
  if (!partner) return null;

  const payouts = await PayoutModel.find({ partnerId: partner._id })
    .sort({ createdAt: -1 })
    .lean() as unknown as Payout[];

  return { partner, payouts };
}

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const data = await getEarningsData(session.user.email);
  if (!data) return <div>Partner not found</div>;

  const { partner, payouts } = data;

  const stats = [
    {
      name: 'Total Earned',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.totalCommissionEarned),
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      name: 'Paid Out',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.paidCommission),
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    {
       name: 'Pending',
       value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats.pendingCommission),
       icon: Clock,
       color: 'bg-amber-500',
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h2>
        <p className="text-slate-500">Track your commissions and payment history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
             <div className="flex items-center justify-between mb-6">
                 <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10`}>
                     <stat.icon className={`h-8 w-8 ${stat.color.replace('bg-', 'text-')}`} />
                 </div>
             </div>
             <div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{stat.value}</p>
                <p className="text-base font-semibold text-slate-500">{stat.name}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Payout History</h3>
              <p className="text-sm text-slate-500">Record of all processed payments.</p>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white text-slate-500 font-bold uppercase text-xs tracking-wider">
                      <tr>
                          <th className="px-8 py-6 border-b border-slate-50">Reference</th>
                          <th className="px-8 py-6 border-b border-slate-50">Amount</th>
                          <th className="px-8 py-6 border-b border-slate-50">Method</th>
                          <th className="px-8 py-6 border-b border-slate-50">Date</th>
                          <th className="px-8 py-6 border-b border-slate-50">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {payouts.length > 0 ? (
                          payouts.map((payout) => (
                              <tr key={payout._id} className="group hover:bg-slate-50/80 transition-colors">
                                  <td className="px-8 py-5 font-mono text-slate-500 text-xs">{payout.reference || '-'}</td>
                                  <td className="px-8 py-5 font-bold text-slate-900">
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payout.amount)}
                                  </td>
                  <td className="px-8 py-5 capitalize font-medium">{payout.method.replace('_', ' ')}</td>
                                  <td className="px-8 py-5 text-slate-400 font-medium">
                                      {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="px-8 py-5">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 capitalize">
                                          {payout.status}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">
                                  No payouts received yet.
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
