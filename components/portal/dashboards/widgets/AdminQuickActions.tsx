import React from 'react';
import Link from 'next/link';

export default function AdminQuickActions() {
  const actions = [
    {
      title: 'View All Leads',
      description: 'Review and manage all leads across the system',
      icon: 'business',
      href: '/portal/partner/dashboard/leads',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
    },
    {
      title: 'Manage Commissions',
      description: 'Approve and pay out pending commissions',
      icon: 'payments',
      href: '/portal/partner/dashboard/commissions',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30'
    },
    {
      title: 'Knowledge Base',
      description: 'Upload new training materials or company policies',
      icon: 'auto_stories',
      href: '/portal/employee/knowledge-base',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
    },
    {
      title: 'Announcements',
      description: 'Post a new announcement to the team',
      icon: 'campaign',
      href: '/portal/partner/dashboard/team', // Using team as placeholder for announcements if it lacks a dedicated page
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <span className="material-icons-outlined text-brand-primary">flash_on</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-primary/50 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-all group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
              <span className="material-icons-outlined">{action.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
