'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { Partner } from '@/types';

export default function DashboardShell({
  user,
  partnerType,
  children,
}: {
  user: Partner;
  partnerType: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg+, drawer on mobile */}
      <Sidebar
        user={user}
        partnerType={partnerType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Sticky header */}
        <header className="bg-white/50 backdrop-blur-sm sticky top-0 z-20 h-16 lg:h-20 flex items-center px-4 sm:px-8 lg:px-10 justify-between gap-4">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:shadow-md transition-all shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 lg:flex-none">
            <h1 className="text-lg lg:text-2xl font-bold text-slate-900 tracking-tight truncate">
              Dashboard
            </h1>
            <p className="text-slate-500 text-xs font-medium hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <button className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all shrink-0">
            <span className="sr-only">Notifications</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
