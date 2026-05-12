import type { QuestWithProgress } from '@/lib/actions/quests';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';

function QuestCard({ q }: { q: QuestWithProgress }) {
  const now = new Date();
  const start = new Date(q.startsAt);
  const end = new Date(q.endsAt);
  const isUpcoming = start > now;
  const isCurrency = q.metric === 'revenue';
  const formatVal = (n: number) => (isCurrency ? `$${n.toLocaleString()}` : n.toLocaleString());
  
  const daysRemaining = Math.max(0, differenceInDays(end, now));
  const isUrgent = daysRemaining <= 3 && !q.completed && !isUpcoming;

  // Determine border and background styles based on state
  let cardStyle = 'border-gray-200 bg-white dark:border-gray-800 dark:bg-[#27272a]/80';
  let badgeStyle = '';
  let badgeText = '';

  if (q.completed) {
    cardStyle = 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/30';
    badgeStyle = 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40';
    badgeText = 'Target hit';
  } else if (isUpcoming) {
    cardStyle = 'border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/10';
    badgeStyle = 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40';
    badgeText = 'Upcoming';
  } else if (isUrgent) {
    cardStyle = 'border-orange-200 bg-orange-50/50 dark:border-orange-800/60 dark:bg-orange-950/20 shadow-sm';
    badgeStyle = 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40';
    badgeText = 'Ending Soon';
  }

  return (
    <div className={`rounded-3xl border p-6 transition-all hover:shadow-md backdrop-blur-md flex flex-col justify-between ${cardStyle}`}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              {q.title}
              {badgeText && (
                <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                  {badgeText}
                </span>
              )}
            </h3>
            {q.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">{q.description}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium flex items-center gap-1.5">
              <span className="material-icons-outlined text-[14px]">
                {isUpcoming ? 'event' : 'timer'}
              </span>
              {isUpcoming 
                ? `Starts ${format(start, 'MMM d')}` 
                : `${daysRemaining} days left (Ends ${format(end, 'MMM d')})`
              }
            </p>
          </div>
          {q.rewardLabel && (
            <div className="shrink-0 text-right bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <span className="text-[10px] uppercase text-amber-700 dark:text-amber-500 font-bold block mb-0.5">Reward</span>
              <span className="text-sm font-bold text-amber-800 dark:text-amber-200 block">{q.rewardLabel}</span>
            </div>
          )}
        </div>

        {!isUpcoming && (
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider">Progress</span>
              <span className="font-bold text-gray-900 dark:text-white tabular-nums text-sm">
                {formatVal(q.currentValue)} / {formatVal(q.targetValue)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  q.completed ? 'bg-emerald-500' : isUrgent ? 'bg-orange-500' : 'bg-brand-primary'
                }`}
                style={{ width: `${q.percent}%` }}
              />
            </div>
          </div>
        )}

        {isUpcoming && (
          <div className="mt-5 py-2.5 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <span className="material-icons-outlined text-lg">schedule</span>
              Quest begins in {Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex justify-end">
        <Link 
          href="/portal/employee/quests"
          className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80 dark:text-brand-primary dark:hover:text-brand-primary/80 transition-colors flex items-center gap-1"
        >
          {q.completed ? 'View Quest' : 'Take Action'}
          <span className="material-icons-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
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
        <div className="flex items-center justify-between gap-4 mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons-outlined text-brand-primary text-2xl">military_tech</span>
              Active Quests
            </h2>
          </div>
          <Link
            href="/portal/employee/quests"
            className="text-sm font-semibold text-brand-primary hover:underline shrink-0 hidden sm:flex items-center gap-1"
          >
            View all
            <span className="material-icons-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quests.map((q) => (
          <QuestCard key={q._id} q={q} />
        ))}
      </div>
    </section>
  );
}
