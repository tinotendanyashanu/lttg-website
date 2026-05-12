import { auth } from '@/auth';
import MailInboxClient from '@/components/dashboard/mail/MailInboxClient';

export const metadata = { title: 'Mail | Dashboard' };

export default async function MailDashboardPage() {
  const session = await auth();
  const u = session?.user;
  if (!u?.id || !u.role) {
    return null;
  }
  if (u.role !== 'admin' && u.role !== 'employee') {
    return null;
  }
  return (
    <MailInboxClient
      userId={u.id}
      role={u.role}
      displayName={u.name ?? u.email ?? 'User'}
    />
  );
}
