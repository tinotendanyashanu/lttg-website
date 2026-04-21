import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentActivityFeedProps {
  activities: Array<{
    id: string;
    actorName: string;
    actorImage?: string;
    actionType: string;
    caseName: string;
    createdAt: Date;
  }>;
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">history</span>
          Recent Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
            <span className="material-icons-outlined text-gray-400 text-3xl">notifications_paused</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent activity to show yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent pr-2 overflow-y-auto">
          {activities.map((activity, idx) => (
            <div key={activity.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#27272a] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 overflow-hidden">
                {activity.actorImage ? (
                  <Image src={activity.actorImage} alt={activity.actorName} fill className="object-cover" />
                ) : (
                  <span className="text-sm font-bold">{activity.actorName.charAt(0)}</span>
                )}
              </div>
              
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col gap-1">
                  <time className="text-xs font-medium text-brand-primary">
                    {new Date(activity.createdAt).toLocaleString()}
                  </time>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white mr-1">{activity.actorName}</span> 
                    {activity.actionType.toLowerCase().replace('_', ' ')} 
                    <span className="font-medium text-slate-900 dark:text-white ml-1">{activity.caseName}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
