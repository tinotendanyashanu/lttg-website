import { getAdminUsers } from '@/lib/actions/portal-admin-users';
import UserManagerClient from './UserManagerClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Manage Users | Admin Panel',
};

export default async function AdminUsersPage() {
  let initialUsers = [];

  try {
    const response = await getAdminUsers();
    initialUsers = response.users;
  } catch (error) {
    redirect('/portal');
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="material-icons-outlined text-2xl">manage_accounts</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management Module</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage system access, roles, teams, and commission rates.</p>
            </div>
          </div>
        </div>
      </div>

      <UserManagerClient initialUsers={initialUsers} />
    </div>
  );
}
