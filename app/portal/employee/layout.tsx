import { auth } from '@/auth';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import PortalShell from '@/components/portal/layout/PortalShell';

import { getSessionWithDevBypass } from '@/lib/auth-util';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithDevBypass();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const account = await getAccountByEmail(session.user.email);

  if (!account) {
    redirect('/login?error=account_missing');
  }

  if (!account.roles || account.roles.length === 0) {
    redirect('/login?error=roles_missing');
  }

  if (account.isActive === false) {
    redirect('/login?error=account_inactive');
  }

  return (
    <PortalShell roles={account.roles} user={session.user}>
      {children}
    </PortalShell>
  );
}
