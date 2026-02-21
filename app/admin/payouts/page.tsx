import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PayoutBatch from '@/models/PayoutBatch';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import { CheckCircle, Clock } from 'lucide-react';
import { Partner as PartnerType } from '@/types';
import AdminPayoutClient from './AdminPayoutClient';
import BatchActionsClient from './BatchActionsClient';

export const dynamic = 'force-dynamic';

async function getAdminPayoutData() {
  await dbConnect();
  
  const eligiblePartners = await Partner.find({ 'stats.approvedBalance': { $gte: 50 }, status: 'active' }).lean();
  const allBalances = await Partner.find({ 'stats.approvedBalance': { $gt: 0 } }).sort({ 'stats.approvedBalance': -1 }).lean();
  
  const batches = await PayoutBatch.find().sort({ createdAt: -1 }).lean();

  const pendingApprovalsCount = await Deal.countDocuments({
     commissionStatus: 'Pending',
     dealStatus: 'closed',
     saleDate: { $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
  });

  return {
    eligibleCount: eligiblePartners.length,
    pendingApprovalsCount,
    allBalances: allBalances as unknown as PartnerType[],
    batches: batches as unknown as { _id: string, payoutMonth: string, payoutDate: string, totalAmount: number, status: string, referenceNumber?: string }[],
  };
}

export default async function AdminPayoutsPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return null;

  const data = await getAdminPayoutData();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Payouts Management</h2>
        <p className="text-slate-500">Manage monthly commission payouts, track balances, and process batches.</p>
      </div>

      <AdminPayoutClient 
         eligibleCount={data.eligibleCount} 
      />

      {/* Payout Batches */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Monthly Payout Batches</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-8 py-4">Month</th>
                        <th className="px-8 py-4">Generated Date</th>
                        <th className="px-8 py-4">Total Amount</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.batches.length > 0 ? (
                        data.batches.map((batch) => (
                            <tr key={batch._id.toString()} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-4 font-bold text-slate-900">{batch.payoutMonth}</td>
                                <td className="px-8 py-4 text-slate-500">{new Date(batch.payoutDate).toLocaleDateString()}</td>
                                <td className="px-8 py-4 font-bold text-emerald-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(batch.totalAmount)}
                                </td>
                                <td className="px-8 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize 
                                        ${batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {batch.status === 'Completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                        {batch.status}
                                    </span>
                                    {batch.referenceNumber && (
                                       <div className="mt-1 font-mono text-xs text-slate-500">Ref: {batch.referenceNumber}</div>
                                    )}
                                </td>
                                <td className="px-8 py-4 text-right">
                                    {batch.status === 'Processing' && (
                                        <div className="flex justify-end">
                                            <BatchActionsClient batchId={batch._id.toString()} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                                No payout batches generated yet. Minimum threshold is $50.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Affiliate Balances */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Affiliate Balances</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-8 py-4">Partner</th>
                        <th className="px-8 py-4">Approved Balance</th>
                        <th className="px-8 py-4">Pending (14-Day Hold)</th>
                        <th className="px-8 py-4">Payout Method</th>
                        <th className="px-8 py-4">Eligibility</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.allBalances.length > 0 ? (
                        data.allBalances.map((partner) => {
                            const approved = partner.stats?.approvedBalance || 0;
                            const pending = partner.stats?.pendingCommission || 0;
                            const isEligible = approved >= 50;

                            return (
                                <tr key={partner._id.toString()} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4">
                                        <p className="font-bold text-slate-900">{partner.name}</p>
                                        <p className="text-xs text-slate-500">{partner.email}</p>
                                    </td>
                                    <td className="px-8 py-4 font-bold text-emerald-600">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(approved)}
                                    </td>
                                    <td className="px-8 py-4 font-medium text-amber-600">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pending)}
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="font-medium text-slate-800">{partner.payoutMethod || 'Not Set'}</p>
                                        <p className="text-xs text-slate-500">{partner.countryOfResidence || 'Unknown Country'}</p>
                                    </td>
                                    <td className="px-8 py-4">
                                        {isEligible ? (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                Eligible ($50+)
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                Rolling Over
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                                No affiliates have an outstanding approved balance yet.
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
