import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/portal/dashboards/AdminDashboard';
import UnifiedDashboard from '@/components/portal/dashboards/UnifiedDashboard';
import AnnouncementsWidget from '@/components/portal/dashboards/AnnouncementsWidget';
import { getActiveAnnouncements } from '@/lib/actions/announcements';

import { getSessionWithDevBypass } from '@/lib/auth-util';

export default async function PortalPage() {
  const session = await getSessionWithDevBypass();
  
  if (!session?.user?.email) {
    redirect("/portal/login");
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account) {
    redirect("/portal/login");
  }

  const roles = account.roles || [];
  const accountId = account._id.toString();
  const email = account.email;
  const teamId = account.teamId ? account.teamId.toString() : undefined;

  // Fetch announcements server-side
  const { announcements } = await getActiveAnnouncements(roles, teamId ? [teamId] : []);

  if (roles.includes("admin")) {
    return (
      <div className="flex flex-col h-full w-full">
        <AnnouncementsWidget initialAnnouncements={announcements || []} />
        <AdminDashboard email={email} />
      </div>
    );
  } else if (roles.includes("employee")) {
    return (
      <div className="flex flex-col h-full w-full">
        <AnnouncementsWidget initialAnnouncements={announcements || []} />
        <UnifiedDashboard title="Employee Dashboard" accountId={accountId} email={email} roles={roles} />
      </div>
    );
  } else if (roles.includes("intern")) {
    return (
      <div className="flex flex-col h-full w-full">
        <AnnouncementsWidget initialAnnouncements={announcements || []} />
        <UnifiedDashboard title="Intern Dashboard" accountId={accountId} email={email} roles={roles} />
      </div>
    );
  } else {
    redirect("/");
  }
}
