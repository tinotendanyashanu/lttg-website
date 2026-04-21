import AdminPageBanner from '@/components/admin/AdminPageBanner';
import UserManagerClient from '@/app/portal/(dashboard)/admin/users/UserManagerClient';
import { getAdminUsers, getAdminTeams } from '@/lib/actions/portal-admin-users';

export const metadata = { title: 'Employees | Admin' };

export default async function AdminUsersPage() {
  let users: any[] = [];
  let teams: any[] = [];

  try {
    const [usersRes, teamsRes] = await Promise.all([
      getAdminUsers(),
      getAdminTeams()
    ]);
    users = usersRes?.users ?? [];
    teams = teamsRes?.teams ?? [];
  } catch {
    users = [];
    teams = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="manage_accounts"
        title="Employee Management"
        description="Manage system access, roles, teams, and commission rates."
      />
      <UserManagerClient initialUsers={users} initialTeams={teams} />
    </div>
  );
}
