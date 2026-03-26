'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPanelSidebar from './AdminPanelSidebar';
import AdminPanelHeader from './AdminPanelHeader';
import AdminCommandPalette from './AdminCommandPalette';

interface AdminPanelShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

const LS_COLLAPSED = 'admin-sidebar-collapsed';
const LS_DARK = 'admin-dark-mode';

export default function AdminPanelShell({ children, user }: AdminPanelShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Restore preferences on mount
  useEffect(() => {
    try {
      const collapsed = localStorage.getItem(LS_COLLAPSED) === 'true';
      setIsSidebarCollapsed(collapsed);

      const dark = localStorage.getItem(LS_DARK);
      const isDark = dark !== null
        ? dark === 'true'
        : document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch {
      // localStorage not available (SSR/private mode)
    }
  }, []);

  // Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(p => !p);
      }
      if (e.key === 'Escape') setIsCommandPaletteOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close mobile sidebar on resize to desktop (md breakpoint now for sidebar)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMobileSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-collapse sidebar on smaller screens (between md and lg)
  useEffect(() => {
    const checkCollapse = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    checkCollapse();
    window.addEventListener('resize', checkCollapse);
    return () => window.removeEventListener('resize', checkCollapse);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem(LS_DARK, String(next)); } catch {}
      return next;
    });
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(LS_COLLAPSED, String(next)); } catch {}
      return next;
    });
  }, []);

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark font-sans">
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <AdminPanelSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        collapsedSections={collapsedSections}
        onToggleCollapse={toggleSidebarCollapsed}
        onToggleSection={toggleSection}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminPanelHeader
          user={user}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#FAFAFA] dark:bg-[#18181b]">
          {children}
        </main>
      </div>

      {/* Command palette */}
      {isCommandPaletteOpen && (
        <AdminCommandPalette onClose={() => setIsCommandPaletteOpen(false)} />
      )}
    </div>
  );
}
