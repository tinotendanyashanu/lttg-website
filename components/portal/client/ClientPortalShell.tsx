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
  { href: '/portal/client/quotations', icon: 'request_quote', label: 'Quotations' },
  { href: '/portal/client/invoices', icon: 'receipt_long', label: 'Invoices' },
  { href: '/portal/client/payments', icon: 'payments', label: 'Payments' },
  { href: '/portal/client/contracts', icon: 'description', label: 'Contracts' },
  { href: '/portal/client/resources', icon: 'folder_zip', label: 'Resources' },
  { href: '/portal/client/reports', icon: 'bar_chart', label: 'Reports' },
  { href: '/portal/client/knowledgebase', icon: 'menu_book', label: 'Knowledge Base' },
  { href: '/portal/client/support', icon: 'help_outline', label: 'Support' },
  { href: '/portal/client/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/portal/client/feedback', icon: 'reviews', label: 'Leave Feedback' },
  { href: '/portal/client/security', icon: 'security', label: 'Security' },
  { href: '/portal/client/settings', icon: 'settings', label: 'Settings' },
];

// Bottom nav shows 4 primary items + "More" to open drawer
const BOTTOM_NAV: NavItem[] = [
  { href: '/portal/client/dashboard', icon: 'dashboard', label: 'Home', exact: true },
  { href: '/portal/client/cases', icon: 'folder_shared', label: 'Cases' },
  { href: '/portal/client/feedback', icon: 'reviews', label: 'Feedback' },
  { href: '/portal/client/messages', icon: 'chat', label: 'Messages' },
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

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
      quotations: 'Quotations',
      invoices: 'Invoices',
      payments: 'Payments',
      contracts: 'Contracts',
      resources: 'Resource Center',
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

        {/* ── Desktop Sidebar (md and up) ─────────────────────────────── */}
        <aside className="hidden md:flex md:flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 py-8 px-4 shrink-0 transition-all duration-300 relative z-20">
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
            <div>
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
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                    active
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                  {(hasMessagesCount || hasNotifCount) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {hasMessagesCount ? unreadMessages : unreadNotifications}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">
                exit_to_app
              </span>
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          <div className="space-y-2 mt-auto">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-icons-outlined text-[18px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </aside>

        {/* ── Mobile Drawer Overlay ────────────────────────────────────── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Drawer panel */}
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#18181b] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo_transparent.png"
                    alt="LeoTech Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <div>
                    <span className="text-base font-bold text-gray-900 dark:text-white">LeoTech</span>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Client Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  aria-label="Close menu"
                >
                  <span className="material-icons-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* User identity */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Client</p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
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
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        active
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="material-icons-outlined text-[20px] shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.label}</span>
                      {(hasMessagesCount || hasNotifCount) && (
                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          {hasMessagesCount ? unreadMessages : unreadNotifications}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-icons-outlined text-[20px]">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <span className="material-icons-outlined text-[20px]">exit_to_app</span>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Area ────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#18181b] overflow-hidden relative z-10">

          {/* Header */}
          <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between shrink-0 bg-[#FAFAFA] dark:bg-[#18181b] border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 shadow-sm"
                aria-label="Open menu"
              >
                <span className="material-icons-outlined text-[20px]">menu</span>
              </button>
              <h1 className="text-base md:text-xl font-bold text-gray-900 dark:text-white capitalize truncate pr-2">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
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
              <div className="flex items-center gap-2">
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

          {/* Page content — adds bottom padding on mobile so content clears the bottom nav */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 md:pt-6 pb-20 md:pb-8">
            {children}
          </div>
        </main>

        {/* ── Mobile Bottom Navigation Bar ────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#18181b] border-t border-gray-100 dark:border-gray-800 flex items-stretch safe-area-inset-bottom">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item);
            const isMessages = item.href === '/portal/client/messages';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors relative ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <span className="relative">
                  <span className={`material-icons-outlined text-[22px] ${active ? 'font-black' : ''}`}>
                    {item.icon}
                  </span>
                  {isMessages && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-medium leading-none ${active ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
          {/* "More" button opens the full drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <span className="material-icons-outlined text-[22px]">menu</span>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
