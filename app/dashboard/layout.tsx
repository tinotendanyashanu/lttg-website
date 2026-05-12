import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?loginSource=portal');
  }
  if (session.user.role !== 'admin' && session.user.role !== 'employee') {
    redirect('/portal');
  }
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#18181b] text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}
