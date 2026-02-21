'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Loader2, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
    id: string;
    type: 'partner' | 'deal' | 'payout';
    title: string;
    subtitle: string;
    url: string;
}

interface Notification {
    id: string;
    type: 'partner' | 'deal' | 'risk';
    title: string;
    message: string;
    url: string;
    count: number;
}

export default function AdminHeader({ user }: { user: { name?: string | null, email?: string | null, image?: string | null } }) {
    const router = useRouter();
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notifications State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Fetch Notifications on Mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/admin/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setNotificationsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data.results || []);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error("Search failed", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Handle Outside Clicks
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotificationsDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalNotificationsCount = notifications.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <header className="bg-slate-50/80 backdrop-blur-md h-20 flex items-center px-8 justify-between sticky top-0 z-20">
      {/* Global Search */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative group">
            {isSearching ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
            ) : (
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            )}
           
            <input 
                type="text" 
                placeholder="Search partners, deals, or payouts..." 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                }}
                onFocus={() => {
                    if (searchQuery.length >= 2) setShowSearchDropdown(true);
                }}
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xs text-slate-900 placeholder:text-slate-400"
            />

            {searchQuery && (
                <button 
                    onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowSearchDropdown(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>

        {/* Search Dropdown */}
        {showSearchDropdown && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                <div className="p-2">
                    {isSearching && searchResults.length === 0 ? (
                         <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                            {searchResults.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => {
                                        setShowSearchDropdown(false);
                                        setSearchQuery('');
                                        router.push(result.url);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start space-x-3 group"
                                >
                                    <div className={`p-2 rounded-lg mt-0.5 ${
                                        result.type === 'partner' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' :
                                        result.type === 'deal' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                                        'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                    }`}>
                                        <Search className="h-4 w-4" /> {/* Or specific icons based on type */}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{result.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{result.subtitle}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${
                                            result.type === 'partner' ? 'text-purple-500' :
                                            result.type === 'deal' ? 'text-blue-500' :
                                            'text-emerald-500'
                                        }`}>{result.type}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">No results found for "{searchQuery}"</div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
            <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`p-3 text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-full transition-all relative shadow-xs hover:shadow-sm ${showNotificationsDropdown ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'hover:bg-white'}`}
            >
                <Bell className="h-5 w-5" />
                {!notificationsLoading && totalNotificationsCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
                <div className="absolute top-full -right-4 md:right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                        {totalNotificationsCount > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {totalNotificationsCount} new
                            </span>
                        )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto p-2">
                        {notificationsLoading ? (
                            <div className="p-6 flex justify-center">
                                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="space-y-1">
                                {notifications.map((notif) => (
                                    <Link 
                                        href={notif.url} 
                                        key={notif.id}
                                        onClick={() => setShowNotificationsDropdown(false)}
                                        className="block p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg mt-0.5 ${
                                                notif.type === 'risk' ? 'bg-red-50 text-red-600' :
                                                notif.type === 'deal' ? 'bg-blue-50 text-blue-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                                <AlertCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{notif.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="h-5 w-5 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                                <p className="text-xs text-slate-400 mt-1">No pending actions required.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Administrator</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200 shadow-xs group-hover:shadow-md transition-all">
                {user?.name?.charAt(0) || 'A'}
            </div>
        </div>
      </div>
    </header>
  );
}
