import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getActiveQuestsWithProgress } from '@/lib/actions/quests';
import SalesQuests from '@/components/portal/dashboards/widgets/SalesQuests';
import Link from 'next/link';

export const metadata = {
  title: 'Sales Quests | LeoTech Portal',
};

export default async function QuestsPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/portal/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/portal/login');

  const roles = account.roles || [];
  if (!roles.includes('employee') && !roles.includes('intern') && !roles.includes('admin')) {
    redirect('/portal');
  }

  const accountId = account._id.toString();
  const quests = await getActiveQuestsWithProgress(accountId, roles);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/portal"
            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-2"
          >
            <span className="material-icons-outlined text-base">arrow_back</span>
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales quests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Active challenges. Progress is tracked from your leads during each quest window.
          </p>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-10 text-center">
          <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">military_tech</span>
          <p className="text-gray-600 dark:text-gray-400 mt-4">No active quests right now. Check back soon.</p>
        </div>
      ) : (
        <SalesQuests quests={quests} layout="page" />
      )}
    </div>
  );
}
