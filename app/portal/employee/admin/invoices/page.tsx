import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import { getAllEmployeeInvoices } from '@/lib/actions/portal-admin-invoices';
import AdminInvoiceApprovalClient from './AdminInvoiceApprovalClient';

export const metadata = { title: 'Invoice Approvals | Admin' };

export default async function AdminInvoicesPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) redirect('/portal/employee');

  const { invoices, accountMap } = await getAllEmployeeInvoices();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="material-icons-outlined text-2xl">approval</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Approvals</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Review and approve employee-submitted invoices before they reach clients.</p>
          </div>
        </div>
      </div>

      <AdminInvoiceApprovalClient initialInvoices={invoices} accountMap={accountMap} />
    </div>
  );
}
