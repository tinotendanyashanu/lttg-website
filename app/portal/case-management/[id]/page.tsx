import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import CaseDetailClient from '@/components/portal/case-management/CaseDetailClient';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
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

  const query: any = { _id: params.id };
  // Interns can only view their own leads
  if (!isAdminOrEmployee) {
    query.accountId = account._id;
  }

  const lead = await Lead.findOne(query).lean();

  if (!lead) {
    // If not found or unauthorized
    redirect('/portal/case-management');
  }

  return (
    <CaseDetailClient 
      lead={JSON.parse(JSON.stringify(lead))} 
      isAdminOrEmployee={isAdminOrEmployee} 
    />
  );
}
