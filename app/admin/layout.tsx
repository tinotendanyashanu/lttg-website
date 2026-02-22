import { auth } from '@/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[AdminLayout] Checking session...');
  const session = await auth();
  console.log('[AdminLayout] Session:', !!session, 'Role:', session?.user?.role);

  if (!session?.user || session.user.role !== 'admin') {
    console.log('[AdminLayout] Unauthorized, redirecting to login');
    redirect('/partner/login');
  }
  console.log('[AdminLayout] Authorized');

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex overflow-hidden font-sans">
      {/* Sidebar Area - Fixed width */}
      <div className="w-72 shrink-0 hidden lg:block">
         <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
         <AdminHeader user={session.user} />
         <main className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
            {children}
         </main>
      </div>
    </div>
  );
}
