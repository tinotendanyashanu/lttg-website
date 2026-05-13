import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import { getMyInvoices, getClientsForEmployee } from '@/lib/actions/employee-invoices';
import EmployeeInvoicesClient from './EmployeeInvoicesClient';

export const metadata = { title: 'My Invoices | Employee Portal' };

export default async function EmployeeInvoicesPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/login');

  const isStaff = account.roles.includes('admin') || account.roles.includes('employee') || account.roles.includes('intern');
  if (!isStaff) redirect('/portal/employee');

  const [{ invoices, clientMap }, { clients }] = await Promise.all([
    getMyInvoices(),
    getClientsForEmployee(),
  ]);

  return (
    <EmployeeInvoicesClient
      initialInvoices={invoices}
      clientMap={clientMap}
      clients={clients}
      accountId={account._id.toString()}
      accountName={account.fullName}
    />
  );
}
