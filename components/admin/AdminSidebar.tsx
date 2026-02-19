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
    <div className="flex flex-col w-64 h-[calc(100vh-2rem)] fixed left-4 top-4 bg-slate-900 rounded-2xl shadow-xl overflow-hidden z-30">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 bg-linear-to-tr from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Leo Admin</span>
        </div>
        <p className="text-xs text-slate-400 ml-1">Control Center 2.0</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`} aria-hidden="true" />
              {item.name}
              {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <form action={handleSignOut}>
            <button 
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:text-red-400 hover:bg-white/5 transition-colors"
                type="submit"
            >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
            </button>
        </form>
      </div>
    </div>
  );
}
