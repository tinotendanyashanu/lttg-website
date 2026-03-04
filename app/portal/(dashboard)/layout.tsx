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
    console.log('[PortalLayout] Redirecting because of missing session/email', session);
    redirect('/portal/login');
  }

  const account = await getAccountByEmail(session.user.email);

  if (!account) {
    console.log('[PortalLayout] Redirecting because of missing account for email:', session.user.email);
    redirect('/portal/login?error=account_missing');
  }

  if (!account.roles || account.roles.length === 0) {
    console.log('[PortalLayout] Redirecting because of missing roles for account:', session.user.email);
    redirect('/portal/login?error=roles_missing');
  }

  if (account.isActive === false) {
    console.log('[PortalLayout] Redirecting because account is inactive:', session.user.email);
    redirect('/portal/login?error=account_inactive');
  }

  return (
    <PortalShell roles={account.roles} user={session.user}>
      {children}
    </PortalShell>
  );
}
