import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Password */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Keep your account secure with a strong password.
            </p>
          </div>
          <Link
            href="/portal/client/settings/profile"
            className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            Change Password
          </Link>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Changed</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">—</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Strength</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">—</p>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Active Session</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <span className="material-icons-outlined text-green-600 dark:text-green-400 text-[18px]">
              devices
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Current Browser</p>
            <p className="text-xs text-gray-400 mt-0.5">Signed in as {session.user?.email}</p>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          {[
            {
              label: 'Case Data',
              desc: 'Your case information is encrypted and only visible to you and assigned team members.',
              icon: 'lock',
            },
            {
              label: 'Evidence Locker',
              desc: 'All uploaded evidence is stored securely with access controlled to authorized personnel.',
              icon: 'security',
            },
            {
              label: 'Communication',
              desc: 'Messages between you and our team are private and not shared with third parties.',
              icon: 'verified_user',
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-gray-500 dark:text-gray-400 text-[18px]">
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-center gap-3">
        <span className="material-icons-outlined text-blue-600 dark:text-blue-400">help_outline</span>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          If you suspect unauthorized access, contact our team immediately via{' '}
          <Link href="/portal/client/messages" className="underline font-medium">
            Messages
          </Link>{' '}
          or{' '}
          <Link href="/portal/client/tickets/create" className="underline font-medium">
            open a urgent ticket
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
