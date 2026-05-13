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
  Link2,
  PlusCircle,
  X,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { handleSignOut } from '@/lib/actions/auth';
import Image from 'next/image';
import { Partner } from '@/types';

// All sidebar items are visible to every partner regardless of tier or partnerType.
// Tier only affects commission rate, badge display, and revenue thresholds — never feature access.
const navigation = [
  { name: 'Overview', href: '/portal/partner/dashboard', icon: LayoutDashboard },
  { name: 'Register Deal', href: '/portal/partner/dashboard/deals/register', icon: PlusCircle },
  { name: 'Deals', href: '/portal/partner/dashboard/deals', icon: Briefcase },
  { name: 'Leads', href: '/portal/partner/dashboard/leads', icon: MousePointer2 },
  { name: 'Referral Links', href: '/portal/partner/dashboard/referral-links', icon: Link2 },
  { name: 'Earnings', href: '/portal/partner/dashboard/earnings', icon: DollarSign },
  { name: 'Academy', href: '/portal/partner/dashboard/academy', icon: GraduationCap },
  { name: 'Commercial Playbook', href: '/portal/partner/dashboard/commercial-playbook', icon: BookOpen },
  { name: 'Tier Progress', href: '/portal/partner/dashboard/tier', icon: Award },
];

const secondaryNavigation = [
  { name: 'Program Rules', href: '/portal/partner/dashboard/rules', icon: Shield },
  { name: 'Settings', href: '/portal/partner/dashboard/settings', icon: Settings },
];

export default function Sidebar({
  user,
  partnerType = 'partner',
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: {
  user: Partner;
  partnerType?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  // Close sidebar on nav click (mobile)
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-50 transition-transform"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}

      <div className={`p-4 ${isCollapsed ? 'pt-6' : 'p-6'}`}>
        {/* Header row: Logo + Close btn on mobile */}
        <div className={`flex items-center justify-between mb-8 ${isCollapsed ? '' : 'px-2'}`}>
          {!isCollapsed ? (
            <div className="relative w-full h-12">
              <Image
                src="/logo_transparent.png"
                alt="Leo The Tech Guy"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <div className="w-full flex justify-center text-indigo-700 font-bold text-2xl">
              L
            </div>
          )}
          {/* Close button — mobile only */}
          <button
            className="lg:hidden ml-2 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isCollapsed ? (
          <div className="flex justify-center mb-6">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {user?.name?.[0] || 'P'}
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navigation
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {!isCollapsed && isActive && (
                  <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center py-3 text-sm font-medium rounded-full transition-all duration-200 group ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              } ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {!isCollapsed && isActive && (
                <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-slate-100 ${isCollapsed ? 'space-y-4' : 'space-y-3'}`}>
        {!isCollapsed && (
          <div className="flex items-center justify-center gap-3 py-1">
            <a href="https://x.com/LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black transition-colors" aria-label="X">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://instagram.com/Leothetechguy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com/Leothetechguy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.youtube.com/@LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="https://discord.gg/6rW46Cdf" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#5865F2] transition-colors" aria-label="Discord">
              <FaDiscord className="h-4 w-4" />
            </a>
          </div>
        )}
        <form action={handleSignOut} className={isCollapsed ? 'flex justify-center' : ''}>
          <button
            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'w-full px-4 py-3'} text-sm font-medium text-slate-500 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors`}
            type="submit"
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 shrink-0`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
