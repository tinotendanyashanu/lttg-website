'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CreditCard, 
  ShieldAlert,
  LogOut,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { handleSignOut } from '@/lib/actions/auth';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Partners', href: '/admin/partners', icon: Users },
  { name: 'Deals', href: '/admin/deals', icon: Briefcase },
  { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
  { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
  { name: 'Commercial Playbook', href: '/admin/commercial-playbook', icon: BookOpen },
  { name: 'Messages', href: '/admin/contacts', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-[calc(100vh-2rem)] fixed left-4 top-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center space-x-3 mb-1">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">Leo Admin</span>
        </div>
        <p className="text-[11px] font-medium text-slate-400 ml-1 uppercase tracking-wider">Control Center 2.0</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
              {item.name}
              {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <form action={handleSignOut}>
            <button 
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
                type="submit"
            >
                <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
                Sign Out
            </button>
        </form>
      </div>
    </div>
  );
}
