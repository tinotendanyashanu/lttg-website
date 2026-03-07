'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/portal/client/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
  { href: '/portal/client/activity', icon: 'timeline', label: 'Activity' },
  { href: '/portal/client/cases', icon: 'folder_shared', label: 'My Cases' },
  { href: '/portal/client/evidence', icon: 'lock', label: 'Evidence Locker' },
  { href: '/portal/client/messages', icon: 'chat', label: 'Messages' },
  { href: '/portal/client/tickets', icon: 'support_agent', label: 'Support Tickets' },
  { href: '/portal/client/invoices', icon: 'receipt_long', label: 'Invoices' },
  { href: '/portal/client/payments', icon: 'payments', label: 'Payments' },
  { href: '/portal/client/contracts', icon: 'description', label: 'Contracts' },
  { href: '/portal/client/reports', icon: 'bar_chart', label: 'Reports' },
  { href: '/portal/client/knowledgebase', icon: 'menu_book', label: 'Knowledge Base' },
  { href: '/portal/client/support', icon: 'help_outline', label: 'Support' },
  { href: '/portal/client/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/portal/client/security', icon: 'security', label: 'Security' },
  { href: '/portal/client/settings', icon: 'settings', label: 'Settings' },
];

export default function ClientPortalShell({
  children,
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
}: {
  children: React.ReactNode;
  user: Session['user'] | undefined;
  unreadNotifications?: number;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const getPageTitle = () => {
    const segment = pathname.split('/').pop() || '';
    const titleMap: Record<string, string> = {
      dashboard: 'Dashboard',
      activity: 'Activity',
      cases: 'My Cases',
      evidence: 'Evidence Locker',
      messages: 'Messages',
      tickets: 'Support Tickets',
      invoices: 'Invoices',
      payments: 'Payments',
      contracts: 'Contracts',
      reports: 'Reports',
      knowledgebase: 'Knowledge Base',
      support: 'Support',
      notifications: 'Notifications',
      security: 'Security',
      settings: 'Settings',
      profile: 'Profile Settings',
      company: 'Company Settings',
      billing: 'Billing Settings',
      onboarding: 'Getting Started',
      help: 'Help Center',
      upload: 'Upload Evidence',
      library: 'Evidence Library',
      create: 'Create Ticket',
      timeline: 'Case Timeline',
    };
    return (
      titleMap[segment] ||
      segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 min-h-screen flex justify-center items-center w-full">
      <div className="w-full h-screen bg-surface-light dark:bg-surface-dark overflow-hidden flex flex-col md:flex-row relative transition-colors duration-300">

        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex flex-col py-8 px-4 shrink-0 transition-all duration-300 relative z-20">
          <div className="flex items-center gap-3 mb-8 pl-2">
            <div className="w-10 h-10 relative flex items-center justify-center">
              <Image
                src="/logo_transparent.png"
                alt="LeoTech Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="hidden lg:block">
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                LeoTech
              </span>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Client Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 pb-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const hasMessagesCount =
                item.href === '/portal/client/messages' && unreadMessages > 0;
              const hasNotifCount =
                item.href === '/portal/client/notifications' && unreadNotifications > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                    active
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform shrink-0">
                    {item.icon}
                  </span>
                  <span className="hidden lg:block text-sm">{item.label}</span>
                  {(hasMessagesCount || hasNotifCount) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {hasMessagesCount ? unreadMessages : unreadNotifications}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">
                exit_to_app
              </span>
              <span className="hidden lg:block text-sm">Logout</span>
            </button>
          </nav>

          <div className="space-y-2 mt-auto">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mx-auto lg:mx-0"
              aria-label="Toggle dark mode"
            >
              <span className="material-icons-outlined text-[18px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#18181b] overflow-hidden relative z-10">
          <header className="h-16 px-6 md:px-8 flex items-center justify-between shrink-0 bg-[#FAFAFA] dark:bg-[#18181b] border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate pr-4">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-3">
              <Link
                href="/portal/client/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm"
              >
                <span className="material-icons-outlined text-[18px]">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">
                    Client
                  </div>
                </div>
                <Link
                  href="/portal/client/settings/profile"
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:opacity-90 transition-opacity"
                >
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'C'}
                </Link>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
