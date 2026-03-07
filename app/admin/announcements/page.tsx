import AdminPageBanner from '@/components/admin/AdminPageBanner';
import AdminAnnouncementsClient from '@/app/portal/(dashboard)/admin/announcements/AdminAnnouncementsClient';
import { getAnnouncementsHistory } from '@/lib/actions/announcements';

export const metadata = { title: 'Announcements | Admin' };

export default async function AdminAnnouncementsPage() {
  let announcements: any[] = [];

  try {
    const response = await getAnnouncementsHistory();
    if (response?.success) announcements = response.announcements ?? [];
  } catch {
    announcements = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="campaign"
        title="Announcements"
        description="Manage system-wide announcements, priorities, and role targeting."
      />
      <AdminAnnouncementsClient initialAnnouncements={announcements} />
    </div>
  );
}
