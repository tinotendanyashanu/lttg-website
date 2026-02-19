import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Payout, { IPayout } from '@/models/Payout';
import { IPartner } from '@/models/Partner';
import { Search, DollarSign } from 'lucide-react';

// Define a simpler type for the populated partner that doesn't strictly extend Document
interface SimplePartner {
  _id: string;
  name: string;
  email: string;
}

// Override partnerId to be SimplePartner or null (in case of populated failure)
type PopulatedPayout = Omit<IPayout, 'partnerId'> & { 
  partnerId: SimplePartner | null; 
  _id: string | object; // handle ObjectId or string
};

async function getPayouts(): Promise<PopulatedPayout[]> {
  await dbConnect();
  // Cast the result to unknown first to avoid Mongoose type complexity
  return Payout.find().populate('partnerId', 'name email').sort({ createdAt: -1 }).lean() as unknown as PopulatedPayout[];
}

export default async function AdminPayoutsPage() {
  const payouts = await getPayouts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payout History</h2>
          <p className="text-slate-500">Record of all commission payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Partner</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {payouts.length > 0 ? (
                        payouts.map((payout: PopulatedPayout) => (
                            <tr key={payout._id as string} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{payout.reference || payout._id.toString().slice(-8)}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{payout.partnerId?.name}</td>
                                <td className="px-6 py-4 text-emerald-600 font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payout.amount)}</td>
                                <td className="px-6 py-4 capitalize">{payout.method.replace('_', ' ')}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                        ${payout.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                                          payout.status === 'failed' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'}`}>
                                        {payout.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{new Date(payout.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                No payouts recorded yet. Payments are recorded via Deal Details.
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
