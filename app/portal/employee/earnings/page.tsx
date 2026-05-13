import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';
import { Account } from '@/models/Account';
import { Case } from '@/models/Case';

export default async function EarningsPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || (!account.roles.includes('intern') && !account.roles.includes('employee'))) {
    redirect('/portal');
  }

  await dbConnect();

  // Fetch real-time stats
  const userAccount = await Account.findById(account._id).lean();
  const stats = {
    pendingCommission: userAccount?.commissionStats?.pendingCommission || 0,
    approvedBalance: userAccount?.commissionStats?.approvedBalance || 0,
    paidCommission: userAccount?.commissionStats?.paidCommission || 0,
    totalEarned: userAccount?.commissionStats?.totalEarned || 0,
  };

  // Fetch commission history
  const commissions = await Commission.find({ accountId: account._id })
    .populate('caseId', 'businessName caseId')
    .sort({ createdAt: -1 })
    .lean() as any[];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings & Commissions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your commission balances and payout history. Pending commissions are subject to a 14-day hold before approval.
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 p-6 border border-orange-100 dark:border-orange-900/30 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
          <p className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">Total Pending (14-day hold)</p>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            ${stats.pendingCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 border border-blue-100 dark:border-blue-900/30 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Approved Balance</p>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            ${stats.approvedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 p-6 border border-green-100 dark:border-green-900/30 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
          <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Total Paid Out</p>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            ${stats.paidCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-icons-outlined text-brand-primary">history</span>
            Commission History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-[#27272a]/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Date Earned</th>
                <th scope="col" className="px-6 py-4 font-medium">Source / Case</th>
                <th scope="col" className="px-6 py-4 font-medium">Role (Rate)</th>
                <th scope="col" className="px-6 py-4 font-medium">Amount</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No commissions recorded yet.
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm._id.toString()} className="hover:bg-gray-50 dark:hover:bg-[#27272a]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {comm.caseId ? (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{comm.caseId.businessName || 'Unnamed Business'}</p>
                          <p className="text-xs text-gray-500">Case: {comm.caseId.caseId || 'N/A'}</p>
                        </div>
                      ) : (
                        <span className="italic text-gray-500">Unknown Source</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {comm.role} ({(comm.commissionRate * 100).toFixed(0)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      ${comm.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        comm.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        comm.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                      }`}>
                        {comm.status === 'approved' ? 'Ready for Payout' : comm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                      {comm.paidAt ? new Date(comm.paidAt).toLocaleDateString() : '-'}
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
