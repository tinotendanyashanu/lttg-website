import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import CompanySettingsClient from '@/components/portal/client/CompanySettingsClient';
import { SettingsNav } from '@/components/portal/client/SettingsNav';

async function getCompanyProfile(userId: string) {
  try {
    await dbConnect();
    const { Account } = await import('@/models/Account');
    const user = await Account.findById(userId, { clientProfile: 1 }).lean();
    return user ? JSON.parse(JSON.stringify((user as any).clientProfile || {})) : {};
  } catch (_) {
    return {};
  }
}

export default async function CompanySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const cp = await getCompanyProfile(session.user.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <SettingsNav current="/portal/client/settings/company" />
      <CompanySettingsClient initialData={cp} />
    </div>
  );
}
