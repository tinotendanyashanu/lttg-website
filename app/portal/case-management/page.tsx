import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Link from 'next/link';
import CaseManagementClient from '@/components/portal/case-management/CaseManagementClient';

export default async function CaseManagementPage() {
  const session = await getSessionWithDevBypass();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account) {
    redirect('/portal');
  }

  const isAdminOrEmployee = account.roles.includes('admin') || account.roles.includes('employee');
  const isIntern = account.roles.includes('intern');

  if (!isAdminOrEmployee && !isIntern) {
    redirect('/portal');
  }

  await dbConnect();

  // Query: Admins/Employees see all leads, Interns see only their own
  const query = isAdminOrEmployee ? {} : { accountId: account._id };
  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();

  return (
    <CaseManagementClient 
      leads={JSON.parse(JSON.stringify(leads))} 
      isAdminOrEmployee={isAdminOrEmployee} 
    />
  );
}
