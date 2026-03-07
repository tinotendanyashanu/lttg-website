import React from 'react';

interface AdminPageBannerProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function AdminPageBanner({ icon, title, description, action }: AdminPageBannerProps) {
  return (
    <div className="bg-white dark:bg-[#27272a] rounded-3xl p-7 border border-gray-100 dark:border-gray-800 shadow-soft relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0">
            <span className="material-icons-outlined text-2xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
