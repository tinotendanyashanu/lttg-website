import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';
import Lead from '@/models/Lead';

export const metadata = {
  title: 'My Commissions | LeoTech Portal',
};

export default async function InternCommissionsPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('intern')) redirect('/portal');

  await dbConnect();
  Lead.schema.path('_id');

  const commissions = await Commission.find({ accountId: account._id })
    .sort({ createdAt: -1 })
    .populate('leadId', 'businessName')
    .lean();

  const totalEarned = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = commissions.filter(c => c.status !== 'paid').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <span className="material-icons-outlined text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Commissions</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track your commission history and payout status.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Commissions</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{commissions.length}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Pending Payout</p>
          <p className="text-3xl font-bold text-yellow-500">${totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-green-500">${totalEarned.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">account_balance_wallet</span>
                    <p className="text-gray-400 dark:text-gray-500">No commissions yet.</p>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Commissions are generated when your submitted leads are closed.</p>
                  </td>
                </tr>
              ) : (
                commissions.map((commission: any) => (
                  <tr key={commission._id.toString()} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {commission.leadId?.businessName || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${(commission.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        commission.status === 'paid'
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${commission.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {commission.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
                      {new Date(commission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
