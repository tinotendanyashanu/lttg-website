"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

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
      <div className="w-full h-screen bg-surface-light dark:bg-surface-dark overflow-hidden flex flex-col md:flex-row relative transition-colors duration-300">
        
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex flex-col py-8 px-4 shrink-0 transition-all duration-300 relative z-20">
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center">
              <span className="material-icons-outlined text-xl">grid_view</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden lg:block text-gray-900 dark:text-white">
              LeoTech
            </span>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 pb-4">
            <Link
              href="/portal"
              className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                pathname === "/portal"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="material-icons-outlined group-hover:scale-110 transition-transform">dashboard</span>
              <span className="hidden lg:block">Dashboard</span>
            </Link>

            <Link
              href="/portal/case-management"
              className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                pathname === "/portal/case-management"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="material-icons-outlined group-hover:scale-110 transition-transform">folder_shared</span>
              <span className="hidden lg:block">Case Management</span>
            </Link>

            <Link
              href="/portal/knowledge-base"
              className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/knowledge-base")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="material-icons-outlined group-hover:scale-110 transition-transform">menu_book</span>
              <span className="hidden lg:block">Knowledge Base</span>
            </Link>

            <Link
              href="/portal/team"
              className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                pathname.startsWith("/portal/team")
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="material-icons-outlined group-hover:scale-110 transition-transform">group</span>
              <span className="hidden lg:block">Team</span>
            </Link>

            {(isAdmin || isIntern) && (
              <Link
                href={isAdmin ? "/portal/admin/manage-commissions" : "/portal/intern/commissions"}
                className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                  pathname === "/portal/admin/manage-commissions" || pathname === "/portal/intern/commissions"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="material-icons-outlined group-hover:scale-110 transition-transform">monetization_on</span>
                <span className="hidden lg:block">Commission Tracking</span>
              </Link>
            )}



            <Link
              href="/"
              className="flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <span className="material-icons-outlined group-hover:scale-110 transition-transform">home</span>
              <span className="hidden lg:block">Exit Portal</span>
            </Link>
          </nav>

          <div className="space-y-4 mt-auto">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mx-auto lg:mx-0"
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
          <header className="h-20 px-8 flex flex-wrap items-center justify-between shrink-0 bg-[#FAFAFA] dark:bg-[#18181b]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize truncate pr-4">
              {pathname === "/portal" ? "Dashboard" : pathname.split('/').pop()?.replace("-", " ")}
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-white dark:bg-[#27272a] rounded-full px-4 py-2.5 w-64 shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="material-icons-outlined text-gray-400 text-xl">search</span>
                <input
                  className="bg-transparent border-none text-sm w-full focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none ml-2"
                  placeholder="Search anything..."
                  type="text"
                />
              </div>
              
              <div className="flex items-center gap-3 ml-2">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-brand-primary dark:text-gray-400 font-medium leading-tight">
                    {roles.join(', ')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer bg-brand-primary flex items-center justify-center text-white font-bold shrink-0">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
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
