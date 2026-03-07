import AdminPageBanner from '@/components/admin/AdminPageBanner';
import TeamManagerClient from '@/app/portal/(dashboard)/admin/teams/TeamManagerClient';
import { getAdminTeams } from '@/lib/actions/portal-admin-teams';

export const metadata = { title: 'Teams | Admin' };

export default async function AdminTeamsPage() {
  let teams: any[] = [];

  try {
    const response = await getAdminTeams();
    teams = response?.teams ?? [];
  } catch {
    teams = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="groups"
        title="Team Management"
        description="Create, edit, and manage internal teams and groupings."
      />
      <TeamManagerClient initialTeams={teams} />
    </div>
  );
}
