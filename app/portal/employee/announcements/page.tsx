import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { getAnnouncementsHistory } from '@/lib/actions/announcements';

export const metadata = {
  title: 'Announcements History | LeoTech Portal',
};

export default async function AnnouncementsHistoryPage({
  searchParams,
}: {
  searchParams: { category?: string; priority?: string };
}) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/login');
  
  const filters: any = {};
  if (searchParams.category) filters.category = searchParams.category;
  if (searchParams.priority) filters.priorityLevel = searchParams.priority;

  const { success, announcements } = await getAnnouncementsHistory(filters);

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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="material-icons-outlined text-4xl text-brand-primary">campaign</span>
            Announcement History
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View past announcements, updates, and important notices.
          </p>
        </div>
        
        {account.roles.includes('admin') && (
          <div className="mt-4 sm:mt-0">
            <a href="/portal/admin/announcements" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors">
              <span className="material-icons-outlined mr-2 text-lg">add</span>
              Manage Announcements
            </a>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-primary outline-none">
              <option value="">All Categories</option>
              <option value="Company Updates">Company Updates</option>
              <option value="Campaign Focus">Campaign Focus</option>
              <option value="System Updates">System Updates</option>
              <option value="Urgent Alerts">Urgent Alerts</option>
            </select>
            <select className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-primary outline-none">
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Important">Important</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {announcements?.length || 0} announcements
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!success || !announcements || announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-outlined text-gray-400 text-2xl">inbox</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No announcements found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            announcements.map((announcement: any) => {
              const styles = getPriorityStyles(announcement.priorityLevel, announcement.isPinned);
              
              return (
                <div key={announcement._id.toString()} className={`bg-white dark:bg-gray-800 border ${styles.border} rounded-2xl p-5 shadow-sm relative overflow-hidden flex gap-5 items-start`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.stripe}`}></div>
                  <div className={`w-12 h-12 rounded-full ${styles.iconBg} ${styles.text} flex items-center justify-center shrink-0`}>
                    <span className="material-icons-outlined text-2xl">{styles.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {announcement.title}
                      </h2>
                      {announcement.isPinned && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-0.5 rounded-full">Pinned</span>
                      )}
                      {announcement.priorityLevel === 'Critical' && !announcement.isPinned && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-full">Critical</span>
                      )}
                      {!announcement.isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">Archived</span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                      {announcement.message}
                    </div>
                    
                    {(announcement.attachments?.length > 0 || announcement.link) && (
                      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        {announcement.link && (
                          <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <span className="material-icons-outlined text-[16px]">link</span>
                            External Link
                          </a>
                        )}
                        {announcement.attachments?.map((url: string, index: number) => (
                          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <span className="material-icons-outlined text-[16px]">attachment</span>
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {announcement.createdBy?.profileImageUrl ? (
                          <img src={announcement.createdBy.profileImageUrl} alt="Author" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                            {announcement.createdBy?.fullName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="text-xs">
                          <div className="font-semibold text-gray-900 dark:text-white">{announcement.createdBy?.fullName || 'Unknown User'}</div>
                          <div className="text-gray-500">{new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      
                      {announcement.category && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {announcement.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
