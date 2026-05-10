import type { QuestWithProgress } from '@/lib/actions/quests';
import { format } from 'date-fns';
import Link from 'next/link';

function QuestCard({ q }: { q: QuestWithProgress }) {
  const now = new Date();
  const start = new Date(q.startsAt);
  const end = new Date(q.endsAt);
  const isUpcoming = start > now;
  const isCurrency = q.metric === 'revenue';
  const formatVal = (n: number) => (isCurrency ? `$${n.toLocaleString()}` : n.toLocaleString());

  return (
    <div
      className={`rounded-2xl border p-5 transition-shadow ${
        q.completed
          ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/30'
          : isUpcoming
          ? 'border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/10'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {q.title}
            {q.completed ? (
              <span className="text-[10px] uppercase tracking-wide font-bold text-emerald-700 dark:text-emerald-400">
                Target hit
              </span>
            ) : isUpcoming ? (
              <span className="text-[10px] uppercase tracking-wide font-bold text-blue-700 dark:text-blue-400">
                Upcoming
              </span>
            ) : null}
          </h3>
          {q.description ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{q.description}</p>
          ) : null}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {q.metricLabel} · {isUpcoming ? `Starts ${format(start, 'MMM d')}` : `Ends ${format(end, 'MMM d, yyyy')}`}
          </p>
        </div>
        {q.rewardLabel ? (
          <div className="shrink-0 text-right">
            <span className="text-[10px] uppercase text-amber-700 dark:text-amber-500 font-semibold">Reward</span>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 max-w-[140px]">{q.rewardLabel}</p>
          </div>
        ) : null}
      </div>
      {!isUpcoming && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-400">Your progress</span>
            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
              {formatVal(q.currentValue)} / {formatVal(q.targetValue)}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                q.completed ? 'bg-emerald-500' : 'bg-brand-primary'
              }`}
              style={{ width: `${q.percent}%` }}
            />
          </div>
        </div>
      )}
      {isUpcoming && (
        <div className="mt-4 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <span className="material-icons-outlined text-sm">schedule</span>
            Quest begins in {Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      )}
    </div>
  );
}

export default function SalesQuests({
  quests,
  layout = 'dashboard',
}: {
  quests: QuestWithProgress[];
  /** 'dashboard' shows title + link to full page; 'page' is embedded under a page heading */
  layout?: 'dashboard' | 'page';
}) {
  if (!quests.length) return null;

  return (
    <section className="w-full" aria-label="Sales quests">
      {layout === 'dashboard' && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons-outlined text-brand-primary text-2xl">military_tech</span>
              Sales quests
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Hit the targets before they end. Progress is based on your attributed leads in the quest period.
            </p>
          </div>
          <Link
            href="/portal/employee/quests"
            className="text-sm font-medium text-brand-primary hover:underline shrink-0 hidden sm:inline"
          >
            View all
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((q) => (
          <QuestCard key={q._id} q={q} />
        ))}
      </div>
    </section>
  );
}
