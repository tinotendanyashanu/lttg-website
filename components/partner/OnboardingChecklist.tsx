'use client';

import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionText: string;
  actionHref: string;
}

export default function OnboardingChecklist({
  profileComplete,
  payoutMethodSet,
  academyFinished,
  dealRegistered,
  standardsReviewed
}: {
  profileComplete: boolean;
  payoutMethodSet: boolean;
  academyFinished: boolean;
  dealRegistered: boolean;
  standardsReviewed: boolean;
}) {
  const items: ChecklistItem[] = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your company and personal details.',
      isCompleted: profileComplete,
      actionText: 'Go to Settings',
      actionHref: '/partner/dashboard/settings'
    },
    {
      id: 'payout',
      title: 'Set Payout Method',
      description: 'Tell us how you want to receive commissions.',
      isCompleted: payoutMethodSet,
      actionText: 'Setup Payout',
      actionHref: '/partner/dashboard/settings'
    },
    {
      id: 'academy',
      title: 'Finish Partner Academy',
      description: 'Learn how to sell Leo Systems services.',
      isCompleted: academyFinished,
      actionText: 'Open Academy',
      actionHref: '/partner/dashboard/academy'
    },
    {
      id: 'deal',
      title: 'Register First Deal',
      description: 'Submit your first lead or deal.',
      isCompleted: dealRegistered,
      actionText: 'Register Deal',
      actionHref: '/partner/dashboard/deals/register'
    },
    {
      id: 'standards',
      title: 'Review Program Standards',
      description: 'Accept the affiliate terms and conditions.',
      isCompleted: standardsReviewed,
      actionText: 'View Rules',
      actionHref: '/partner/dashboard/rules'
    }
  ];

  const completedCount = items.filter(i => i.isCompleted).length;
  const progressPercentage = Math.round((completedCount / items.length) * 100);
  const allComplete = completedCount === items.length;

  // Auto-collapse if all complete
  const [isExpanded, setIsExpanded] = useState(!allComplete);

  if (allComplete && !isExpanded) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-4 flex items-center justify-between mb-8 cursor-pointer hover:bg-emerald-50/50 transition-colors" onClick={() => setIsExpanded(true)}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-500" />
          <h3 className="font-bold text-slate-900">Onboarding Complete</h3>
        </div>
        <ChevronDown className="h-5 w-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => allComplete && setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Getting Started</h3>
          <p className="text-sm text-slate-500">Complete these steps to maximize your success.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-sm font-bold text-emerald-600">{progressPercentage}% Completed</span>
             <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
             </div>
          </div>
          {allComplete && (
            <button className="text-slate-400 hover:text-slate-600">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 divide-y md:divide-y-0 md:divide-x divide-slate-50">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="mt-0.5 shrink-0">
                {item.isCompleted ? (
                   <CheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                   <Circle className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${item.isCompleted ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</h4>
                <p className="text-sm text-slate-500 mt-1 mb-3">{item.description}</p>
                {!item.isCompleted && (
                  <Link href={item.actionHref} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center">
                    {item.actionText} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
