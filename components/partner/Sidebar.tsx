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
  BookOpen,
  X
} from 'lucide-react';
import { handleSignOut } from '@/lib/actions/auth';
import Image from 'next/image';
import { Partner } from '@/types';

const navigation = [
  { name: 'Overview', href: '/partner/dashboard', icon: LayoutDashboard, roles: ['partner', 'influencer'] },
  { name: 'Leads', href: '/partner/dashboard/leads', icon: MousePointer2, roles: ['influencer'] },
  { name: 'Deals', href: '/partner/dashboard/deals', icon: Briefcase, roles: ['partner', 'influencer'] },
  { name: 'Earnings', href: '/partner/dashboard/earnings', icon: DollarSign, roles: ['partner', 'influencer'] },
  { name: 'Academy', href: '/partner/dashboard/academy', icon: GraduationCap, roles: ['partner', 'influencer'] },
  { name: 'Commercial Playbook', href: '/partner/dashboard/commercial-playbook', icon: BookOpen, roles: ['partner', 'influencer'] },
  { name: 'Tier Progress', href: '/partner/dashboard/tier', icon: Award, roles: ['partner'] },
];

const secondaryNavigation = [
  { name: 'Program Rules', href: '/partner/dashboard/rules', icon: Shield },
  { name: 'Settings', href: '/partner/dashboard/settings', icon: Settings },
];

export default function Sidebar({
  user,
  partnerType = 'partner',
  isOpen = false,
  onClose,
}: {
  user: Partner;
  partnerType?: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  // Close sidebar on nav click (mobile)
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 h-screen fixed left-0 top-0 z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <div className="p-6">
        {/* Header row: Logo + Close btn on mobile */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="relative w-full h-12">
            <Image
              src="/logo_transparent.png"
              alt="Leo The Tech Guy"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden ml-2 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
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
        {navigation
          .filter((item) => !item.roles || item.roles.includes(partnerType))
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
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
              onClick={handleNavClick}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
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
    </aside>
  );
}
