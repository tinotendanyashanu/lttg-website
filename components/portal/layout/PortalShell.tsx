"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import AdminNotificationBell from './AdminNotificationBell';

export default function PortalShell({
  children,
  roles,
  user,
}: {
  children: React.ReactNode;
  roles: string[];
  user: Session["user"] | undefined;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Restore sidebar preference
  useEffect(() => {
    const saved = localStorage.getItem('portal-sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('portal-sidebar-collapsed', String(next));
      return next;
    });
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.results || []);
          }
        } catch (error) {
          console.error("Portal search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const isAdmin = roles.includes("admin");
  const isIntern = roles.includes("intern");

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 min-h-screen flex justify-center items-center w-full">
      <div className="w-full h-screen bg-surface-light dark:bg-surface-dark overflow-hidden flex relative transition-colors duration-300">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${isCollapsed ? 'w-64 md:w-20' : 'w-64'} ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex flex-col py-8 px-4 shrink-0 transition-all duration-300 z-50`}>
          <div className={`flex items-center justify-between mb-8 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image 
                  src="/logo_transparent.png" 
                  alt="LeoTech Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              {(!isCollapsed || isMobileSidebarOpen) && (
                <div className={`${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                  <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                    LeoTech
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    Employee Portal
                  </p>
                </div>
              )}
            </div>
            <button 
              className="md:hidden text-gray-400 hover:text-gray-800 dark:hover:text-white"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 pb-4">
            <Link
              href="/portal"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                pathname === "/portal"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Dashboard" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Dashboard</span>}
            </Link>

            {isAdmin && (
              <Link
                href="/portal/admin"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Admin Panel" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">admin_panel_settings</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Admin Panel</span>}
              </Link>
            )}

            <Link
              href="/portal/case-management"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname === "/portal/case-management"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Case Management" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">folder_shared</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Case Management</span>}
            </Link>

            <Link
              href="/portal/knowledge-base"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/knowledge-base")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Knowledge Base" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">menu_book</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Knowledge Base</span>}
            </Link>

            <Link
              href="/portal/team"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/team")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Team" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">group</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Team</span>}
            </Link>

            <Link
              href="/portal/resources"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/resources")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Resources" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">folder_zip</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Resources</span>}
            </Link>

            <Link
              href="/portal/profile"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/profile")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Profile" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">person</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Profile</span>}
            </Link>

            {(isAdmin || isIntern || roles.includes("employee")) && (
              <Link
                href={isAdmin ? "/portal/admin/manage-commissions" : "/portal/earnings"}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin/manage-commissions" || pathname === "/portal/earnings"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Commission Tracking" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">monetization_on</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Commission Tracking</span>}
              </Link>
            )}

            <Link
              href="/portal/announcements"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/announcements") && pathname !== "/portal/admin/announcements"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Announcements" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">campaign</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Announcements</span>}
            </Link>

            {isAdmin && (
              <Link
                href="/portal/admin/announcements"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin/announcements"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Manage Announcements" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">edit_notifications</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Manage Announcements</span>}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/portal/admin/tasks"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname.startsWith("/portal/admin/tasks")
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Tasks" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">task_alt</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Tasks</span>}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/portal/admin/teams"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin/teams"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white"
                }`}
                title={isCollapsed ? "Team Management" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">groups</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Team Management</span>}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/portal/admin/quests"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin/quests"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Sales Quests" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">military_tech</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Sales Quests</span>}
              </Link>
            )}

            {!isAdmin && (roles.includes("employee") || isIntern) && (
              <Link
                href="/portal/quests"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/quests"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? "Sales Quests" : undefined}
              >
                <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">military_tech</span>
                {!isCollapsed && <span className="hidden lg:block text-sm">Sales Quests</span>}
              </Link>
            )}

            <Link
              href="/portal/academy"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/academy")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={isCollapsed ? "Academy" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">school</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Academy</span>}
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 px-4 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors group`}
              title={isCollapsed ? "Exit Portal" : undefined}
            >
              <span className="material-icons-outlined text-[20px] group-hover:scale-110 transition-transform">exit_to_app</span>
              {!isCollapsed && <span className="hidden lg:block text-sm">Exit Portal</span>}
            </button>
          </nav>

          <div className={`space-y-4 mt-auto flex flex-col ${isCollapsed ? 'items-center' : 'items-center lg:items-start'} hidden md:flex`}>
            <button
              onClick={toggleSidebar}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons-outlined">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <span className="material-icons-outlined block">light_mode</span>
              ) : (
                <span className="material-icons-outlined block">dark_mode</span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#18181b] overflow-hidden relative z-10">
          <header className="h-14 md:h-16 px-4 md:px-8 flex flex-wrap items-center justify-between shrink-0 bg-[#FAFAFA] dark:bg-[#18181b] border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMobileSidebar} 
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <span className="material-icons-outlined">menu</span>
              </button>
              <h1 className="text-base md:text-xl font-bold text-gray-900 dark:text-white capitalize truncate pr-4">
                {pathname === "/portal" ? "Dashboard" : pathname.split('/').pop()?.replace("-", " ")}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-white dark:bg-[#27272a] rounded-full px-4 py-2.5 w-64 shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                <span className="material-icons-outlined text-gray-400 text-xl">
                  {isSearching ? "sync" : "search"}
                </span>
                <input
                  className="bg-transparent border-none text-sm w-full focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none ml-2"
                  placeholder="Search anything..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setShowResults(true);
                  }}
                />
                
                {showResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#1e1e21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 py-2 max-h-[400px] overflow-y-auto">
                    {isSearching && searchResults.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                         <span className="material-icons-outlined animate-spin text-sm">sync</span>
                         Searching...
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {searchResults.map((result) => (
                          <Link
                            key={`${result.type}-${result.id}`}
                            href={result.url}
                            onClick={() => setShowResults(false)}
                            className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 group/item"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              result.type === 'case' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                              result.type === 'account' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                              'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            }`}>
                              <span className="material-icons-outlined text-lg!">
                                {result.type === 'case' ? 'work' : 
                                 result.type === 'account' ? 'person' : 
                                 'menu_book'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                {result.title}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {result.subtitle}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                {isAdmin && <AdminNotificationBell />}
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-brand-primary dark:text-gray-400 font-medium leading-tight">
                    {roles.join(', ')}
                  </div>
                </div>
                <Link href="/portal/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer bg-brand-primary flex items-center justify-center text-white font-bold shrink-0 hover:opacity-90 transition-opacity">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </Link>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
