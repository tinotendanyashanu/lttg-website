import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import CaseDetailClient from '@/components/portal/case-management/CaseDetailClient';
import { getComments, getActivityLogs } from '@/lib/actions/case-actions';
import { Account } from '@/models/Account';

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const query: any = { _id: id };
  if (!isAdmin) {
    query.$or = [{ ownerId: account._id }, { participants: account._id }];
  }

  const caseDoc = await Case.findOne(query)
    .populate('ownerId', 'fullName email profileImageUrl')
    .populate('participants', 'fullName email profileImageUrl')
    .lean();

  if (!caseDoc) {
    redirect('/portal/case-management');
  }

  const [commentsRes, logsRes] = await Promise.all([
    getComments(id),
    getActivityLogs(id),
  ]);

  // Fetch all accounts for admin to be able to add participants
  let allAccounts: any[] = [];
  if (isAdmin) {
    allAccounts = await Account.find({ isActive: true }).select('fullName email roles').lean();
  }

  return (
    <CaseDetailClient 
      caseDoc={JSON.parse(JSON.stringify(caseDoc))} 
      isAdmin={isAdmin}
      isAdminOrEmployee={isAdminOrEmployee}
      currentUserId={account._id.toString()}
      initialComments={commentsRes.success ? commentsRes.comments : []}
      initialLogs={logsRes.success ? logsRes.logs : []}
      allAccounts={JSON.parse(JSON.stringify(allAccounts))}
    />
  );
}
