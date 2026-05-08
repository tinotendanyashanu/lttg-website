import AdminPageBanner from '@/components/admin/AdminPageBanner';
import ClientManagerClient from '@/app/portal/employee/admin/clients/ClientManagerClient';
import { getAdminClients } from '@/lib/actions/portal-admin-clients';

export const metadata = { title: 'Clients | Admin' };

export default async function AdminClientsPage() {
  const response = await getAdminClients();
  const clients = response?.clients ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="business"
        title="Client Management"
        description="Search, edit, and archive system clients."
      />
      <ClientManagerClient initialClients={clients} />
    </div>
  );
}
