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

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6">
          <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-4">
            <span className="material-icons-outlined">psychology</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">What is a Quest?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Quests are time-bound challenges designed to reward high performance. Each quest has a specific metric and a target goal to reach before the deadline.
          </p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <span className="material-icons-outlined">track_changes</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">How Progress Works</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your activity is automatically tracked. Whether it's creating new leads, qualifying opportunities, or closing deals, every action within the quest window counts.
          </p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <span className="material-icons-outlined">emoji_events</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Claim Rewards</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Once you hit the target, your quest is marked as complete. Any associated rewards will be distributed by the administration after the quest window closes.
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
