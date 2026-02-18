'use client';

import { Search, Bell, User } from 'lucide-react';

export default function AdminHeader({ user }: { user: any }) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 h-16 flex items-center px-8 justify-between sticky top-0 z-20">
      {/* Global Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search partners, deals, or payouts..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
            />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="h-9 w-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold border border-purple-200">
                {user?.name?.charAt(0) || 'A'}
            </div>
        </div>
      </div>
    </header>
  );
}
