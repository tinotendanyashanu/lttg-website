import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import { CaseCommission } from '@/models/CaseCommission';
import { CommissionAllocation } from '@/models/CommissionAllocation';
import CommissionManagerClient from './CommissionManagerClient';

import { getAdminCommissionOverview } from '@/lib/actions/portal-admin';

export const metadata = {
  title: 'Commission Tracking | Admin Panel',
};

export default async function ManageCommissionsPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) redirect('/portal');

  await dbConnect();

  const caseCommissions = await CaseCommission.find()
    .populate('caseId', 'businessName closedAt')
    .sort({ createdAt: -1 })
    .lean();

  const allocations = await CommissionAllocation.find()
    .populate('accountId', 'email fullName roles')
    .sort({ createdAt: -1 })
    .lean();
    
  // Fetch internal commissions via new action
  const { commissions: internalComms } = await getAdminCommissionOverview();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="material-icons-outlined text-2xl">monetization_on</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commission Control Module</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">View and manage all system commissions and allocation breakdowns.</p>
            </div>
          </div>
        </div>
      </div>

      <CommissionManagerClient 
         initialCommissions={JSON.parse(JSON.stringify(caseCommissions))} 
         initialAllocations={JSON.parse(JSON.stringify(allocations))}
         internalCommissions={internalComms} 
      />
    </div>
  );
}
