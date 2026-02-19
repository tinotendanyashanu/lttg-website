'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  DollarSign, 
  Briefcase, 
  Award, 
  Shield,
  LogOut,
  Settings,
  GraduationCap,
  MousePointer2,
  BookOpen
} from 'lucide-react';
import { handleSignOut } from '@/lib/actions/auth';
import Image from 'next/image';

const navigation = [
  { name: 'Overview', href: '/partner/dashboard', icon: LayoutDashboard, roles: ['standard', 'creator'] },
  { name: 'Leads', href: '/partner/dashboard/leads', icon: MousePointer2, roles: ['creator'] },
  { name: 'Deals', href: '/partner/dashboard/deals', icon: Briefcase, roles: ['standard', 'creator'] }, // Creators can see deals too? User says yes.
  { name: 'Earnings', href: '/partner/dashboard/earnings', icon: DollarSign, roles: ['standard', 'creator'] },
  { name: 'Academy', href: '/partner/dashboard/academy', icon: GraduationCap, roles: ['standard', 'creator'] },
  { name: 'Commercial Playbook', href: '/partner/dashboard/commercial-playbook', icon: BookOpen, roles: ['standard', 'creator'] },
  { name: 'Tier Progress', href: '/partner/dashboard/tier', icon: Award, roles: ['standard'] },
];

const secondaryNavigation = [
  { name: 'Program Rules', href: '/partner/dashboard/rules', icon: Shield },
  { name: 'Settings', href: '/partner/dashboard/settings', icon: Settings },
];

import { Partner } from '@/types';

export default function Sidebar({ user, partnerType = 'standard' }: { user: Partner, partnerType?: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="relative w-full h-12">
                <Image 
                    src="/logo_transparent.png" 
                    alt="Leo The Tech Guy" 
                    fill
                    className="object-contain object-left"
                    priority
                />
            </div>
        </div>
        
        <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user?.name?.[0] || 'P'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-emerald-600 font-medium capitalize flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {user?.tier} Partner
                    </p>
                </div>
            </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navigation.filter(item => !item.roles || item.roles.includes(partnerType)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
              {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </Link>
          );
        })}

        <div className="my-3 mx-4 border-t border-slate-100"></div>

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
              {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <form action={handleSignOut}>
            <button 
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-500 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
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
