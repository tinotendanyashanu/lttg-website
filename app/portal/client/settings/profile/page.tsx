import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import ProfileSettingsClient from '@/components/portal/client/ProfileSettingsClient';
import { SettingsNav } from '@/components/portal/client/SettingsNav';

async function getProfile(userId: string) {
  try {
    await dbConnect();
    const { Account } = await import('@/models/Account');
    const user = await Account.findById(userId, {
      fullName: 1, email: 1, 'clientProfile.phone': 1,
    }).lean();
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (_) {
    return null;
  }
}

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const profile = await getProfile(session.user.accountId || session.user.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <SettingsNav current="/portal/client/settings/profile" />

      <ProfileSettingsClient
        initialName={profile?.fullName || ''}
        initialEmail={profile?.email || ''}
        initialPhone={profile?.clientProfile?.phone || ''}
      />
    </div>
  );
}
