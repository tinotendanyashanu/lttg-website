import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CaseClientView from '@/app/portal/(dashboard)/admin/cases/CaseClientView';
import { getAdminCases } from '@/lib/actions/portal-admin';

export const metadata = { title: 'Cases | Admin' };

export default async function AdminCasesPage() {
  let initialCases: any[] = [];
  let users: any[] = [];

  try {
    const response = await getAdminCases();
    initialCases = response.cases;
    users = response.users;
  } catch {
    initialCases = [];
    users = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="folder_shared"
        title="Case Control"
        description="Filter, update, assign, and manage all system cases."
      />
      <CaseClientView initialCases={initialCases} users={users} />
    </div>
  );
}
