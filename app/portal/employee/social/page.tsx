import { redirect } from 'next/navigation';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import SocialInboxClient from '@/components/portal/social/SocialInboxClient';

export const metadata = { title: 'Social | Employee Portal' };

export default async function EmployeeSocialPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((role: string) => role === 'employee' || role === 'admin')) {
    redirect('/portal/employee');
  }

  const role = account.roles.includes('admin') ? 'admin' : 'employee';

  return <SocialInboxClient userId={account._id.toString()} role={role} />;
}
