import { auth } from '@/auth';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/portal/dashboards/AdminDashboard';
import EmployeeDashboard from '@/components/portal/dashboards/EmployeeDashboard';
import InternDashboard from '@/components/portal/dashboards/InternDashboard';

import { getSessionWithDevBypass } from '@/lib/auth-util';

export default async function PortalPage() {
  const session = await getSessionWithDevBypass();
  
  let roles: string[] = [];
  if (session?.user?.email) {
    const account = await getAccountByEmail(session.user.email);
    if (account) {
      roles = account.roles;
    }
  }

  if (roles.includes("admin")) {
    return <AdminDashboard />;
  } else if (roles.includes("employee")) {
    return <EmployeeDashboard />;
  } else if (roles.includes("intern")) {
    return <InternDashboard />;
  } else {
    redirect("/");
  }
}
