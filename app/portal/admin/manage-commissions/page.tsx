import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';
import { revalidatePath } from 'next/cache';

// --- Server Action ---
async function markCommissionPaid(commissionId: string) {
  'use server';
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  await dbConnect();
  const result = await Commission.findOneAndUpdate(
    { _id: commissionId, status: 'pending' },
    { status: 'paid', paidAt: new Date() },
    { new: true }
  );

  if (result) revalidatePath('/portal/admin/manage-commissions');
}

export const metadata = {
  title: 'Commission Tracking | LeoTech Portal',
};

export default async function ManageCommissionsPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) redirect('/portal');

  await dbConnect();

  const commissions = await Commission.find()
    .populate('accountId', 'email')
    .populate('leadId', 'businessName')
    .sort({ createdAt: -1 })
    .lean();

  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="material-icons-outlined text-2xl">monetization_on</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commission Tracking</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">View and manage all intern commissions.</p>
            </div>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-green-500">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Intern</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">receipt_long</span>
                    <p className="text-gray-400 dark:text-gray-500">No commissions found.</p>
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm._id.toString()} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {/* @ts-ignore */}
                          {(comm.accountId?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {/* @ts-ignore */}
                          {comm.accountId?.email || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {/* @ts-ignore */}
                      {comm.leadId?.businessName || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${comm.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        comm.status === 'paid'
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${comm.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {comm.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
                      {new Date(comm.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {comm.status === 'pending' ? (
                        <form action={markCommissionPaid.bind(null, comm._id.toString())}>
                          <button
                            type="submit"
                            className="bg-brand-primary text-white hover:opacity-90 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-medium h-9 px-4 transition-opacity"
                          >
                            <span className="material-icons-outlined text-base">check_circle</span>
                            Mark Paid
                          </button>
                        </form>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 font-medium">
                          <span className="material-icons-outlined text-base text-green-500">verified</span>
                          Paid
                        </span>
                      )}
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
