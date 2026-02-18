import { auth } from '@/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/partner/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Area - Fixed width */}
      <div className="w-72 flex-shrink-0 hidden lg:block">
         <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         <AdminHeader user={session.user} />
         <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
         </main>
      </div>
    </div>
  );
}
