'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleSignOut } from '@/lib/actions/auth';
import { NAV_SECTIONS, NavSection } from './adminNavConfig';

interface AdminPanelSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  collapsedSections: Set<string>;
  onToggleCollapse: () => void;
  onToggleSection: (id: string) => void;
  onCloseMobile: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function AdminPanelSidebar({
  isCollapsed,
  isMobileOpen,
  collapsedSections,
  onToggleCollapse,
  onToggleSection,
  onCloseMobile,
  isDarkMode,
  onToggleDarkMode,
}: AdminPanelSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 shrink-0 ${isCollapsed ? 'px-[18px] py-5 justify-center' : 'px-5 py-5'}`}>
        <Image
          src="/logo_transparent.png"
          alt="LeoTech"
          width={32}
          height={32}
          className="shrink-0 rounded-lg"
        />
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight truncate">
              LeoTech
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded shrink-0">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_SECTIONS.map((section: NavSection) => (
          <div key={section.id}>
            {/* Section header */}
            {section.label && !isCollapsed && (
              <button
                onClick={() => onToggleSection(section.id)}
                className="flex items-center justify-between w-full px-2 pb-1 pt-4 group select-none"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  {section.label}
                </span>
                <span
                  className={`material-icons-outlined text-[14px] text-gray-300 dark:text-gray-700 transition-transform duration-200 ${
                    collapsedSections.has(section.id) ? '-rotate-90' : 'rotate-0'
                  }`}
                >
                  expand_more
                </span>
              </button>
            )}

            {/* Section spacer when collapsed */}
            {section.label && isCollapsed && (
              <div className="h-3" />
            )}

            {/* Nav items */}
            {!collapsedSections.has(section.id) && section.items.map(item => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 rounded-xl font-medium text-sm transition-all duration-150 select-none ${
                    isCollapsed ? 'px-0 py-2.5 justify-center w-full' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-gray-900 text-white dark:bg-white/10 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`material-icons-outlined shrink-0 ${isCollapsed ? 'text-[22px]' : 'text-[20px]'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-100 dark:border-gray-800 p-3 space-y-1 shrink-0 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>

        {/* Dark mode */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex items-center gap-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white transition-all duration-150 ${
            isCollapsed ? 'px-0 py-2.5 justify-center w-full' : 'px-3 py-2.5 w-full'
          }`}
        >
          <span className="material-icons-outlined text-[20px] shrink-0">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
          {!isCollapsed && (
            <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white transition-all duration-150 ${
            isCollapsed ? 'px-0 py-2.5 justify-center w-full' : 'px-3 py-2.5 w-full'
          }`}
        >
          <span className="material-icons-outlined text-[20px] shrink-0">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>

        {/* Sign out */}
        <form action={handleSignOut} className="w-full">
          <button
            type="submit"
            title="Sign Out"
            className={`flex items-center gap-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 ${
              isCollapsed ? 'px-0 py-2.5 justify-center w-full' : 'px-3 py-2.5 w-full'
            }`}
          >
            <span className="material-icons-outlined text-[20px] shrink-0">exit_to_app</span>
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden shadow-xl">
          {sidebarContent}
        </div>
      )}
    </>
  );
}
