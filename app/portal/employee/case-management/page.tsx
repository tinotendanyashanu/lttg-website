import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
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
  const isAdmin = account.roles.includes('admin');
  const isIntern = account.roles.includes('intern');

  if (!isAdmin && !isAdminOrEmployee && !isIntern) {
    redirect('/portal');
  }

  await dbConnect();

  const query: any = {};
  if (!isAdmin) {
    query.$or = [{ ownerId: account._id }, { participants: account._id }];
  }
  
  const cases = await Case.find(query)
    .populate('ownerId', 'fullName email')
    .populate('participants', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <CaseManagementClient 
      cases={JSON.parse(JSON.stringify(cases))} 
      isAdminOrEmployee={isAdminOrEmployee} 
      currentUserId={account._id.toString()}
      isAdmin={isAdmin}
    />
  );
}
