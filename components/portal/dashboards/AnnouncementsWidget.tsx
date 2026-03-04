import React from 'react';
import { getActiveAnnouncements } from '@/lib/actions/announcements';
import Link from 'next/link';

export default async function AnnouncementsWidget({ roles }: { roles: string[] }) {
  const { success, announcements } = await getActiveAnnouncements(roles);

  if (!success || !announcements || announcements.length === 0) {
    return null;
  }

  const getPriorityStyles = (priority: string, isPinned: boolean) => {
    if (isPinned) {
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        border: 'border-indigo-200 dark:border-indigo-500/20',
        stripe: 'bg-indigo-500',
        iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        icon: 'push_pin'
      };
    }
    
    switch(priority) {
      case 'Critical':
        return {
          bg: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/20',
          stripe: 'bg-red-500',
          iconBg: 'bg-red-100 dark:bg-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          icon: 'warning'
        };
      case 'Important':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/20',
          stripe: 'bg-amber-500',
          iconBg: 'bg-amber-100 dark:bg-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          icon: 'notification_important'
        };
      default:
        return {
          bg: 'bg-brand-primary/10',
          border: 'border-brand-primary/20',
          stripe: 'bg-brand-primary',
          iconBg: 'bg-brand-primary/20',
          text: 'text-brand-primary',
          icon: 'campaign'
        };
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">campaign</span>
          Announcements
        </h2>
        <Link href="/portal/announcements" className="text-sm text-brand-primary font-medium hover:underline">
          View All
        </Link>
      </div>
      
      {announcements.map((announcement: any) => {
        const styles = getPriorityStyles(announcement.priorityLevel, announcement.isPinned);
        
        return (
          <div key={announcement._id.toString()} className={`${styles.bg} border ${styles.border} rounded-2xl p-4 flex gap-4 items-start shadow-sm relative overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${styles.stripe}`}></div>
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} ${styles.text} flex items-center justify-center shrink-0`}>
              <span className="material-icons-outlined text-xl">{styles.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {announcement.isPinned && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-0.5 rounded-full">Pinned</span>
                )}
                {announcement.priorityLevel === 'Critical' && !announcement.isPinned && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-full">Critical</span>
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-white pr-6 line-clamp-1">{announcement.title}</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {announcement.message}
              </p>
              
              {(announcement.attachments?.length > 0 || announcement.link) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {announcement.link && (
                    <a href={announcement.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-xs font-medium ${styles.text} hover:underline`}>
                      <span className="material-icons-outlined text-[14px]">link</span>
                      Related Link
                    </a>
                  )}
                  {announcement.attachments?.map((url: string, index: number) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-xs font-medium ${styles.text} hover:underline`}>
                      <span className="material-icons-outlined text-[14px]">attachment</span>
                      Attachment
                    </a>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-icons-outlined text-[14px]">event</span>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  {announcement.createdBy?.fullName && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span className="font-medium">By {announcement.createdBy.fullName}</span>
                    </>
                  )}
                </div>
                {announcement.category && (
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
                    {announcement.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
