import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminPanelShell from '@/components/admin/AdminPanelShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Login pages don't need the admin shell — middleware already handles redirects.
  // If no admin session, render children bare (covers /admin/login and /admin/login/verify).
  if (!session?.user || session.user.role !== 'admin') {
    return <>{children}</>;
  }

  return (
    <AdminPanelShell user={session.user}>
      {children}
    </AdminPanelShell>
  );
}
