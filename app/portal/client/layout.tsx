import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import ClientPortalShell from '@/components/portal/client/ClientPortalShell';
import dbConnect from '@/lib/mongodb';

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth checks for the login page to prevent redirect loops
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  if (pathname === '/portal/client/login') {
    return <>{children}</>;
  }

  const session = await auth();

  if (!session?.user?.email) {
    redirect('/portal/client/login');
  }

  if (session.user.role !== 'client') {
    if (
      session.user.role === 'admin' ||
      session.user.role === 'employee' ||
      session.user.role === 'intern'
    ) {
      redirect('/portal');
    }
    redirect('/portal/client/login');
  }

  let unreadNotifications = 0;
  let unreadMessages = 0;

  try {
    await dbConnect();
    const { ClientNotification } = await import('@/models/ClientNotification');
    const { MessageThread } = await import('@/models/MessageThread');

    const [notifCount, msgCount] = await Promise.all([
      ClientNotification.countDocuments({ clientId: session.user.id, read: false }),
      MessageThread.countDocuments({
        clientId: session.user.id,
        unreadByClient: { $gt: 0 },
      }),
    ]);
    unreadNotifications = notifCount;
    unreadMessages = msgCount;
  } catch (_) {}

  return (
    <ClientPortalShell
      user={session.user}
      unreadNotifications={unreadNotifications}
      unreadMessages={unreadMessages}
    >
      {children}
    </ClientPortalShell>
  );
}
