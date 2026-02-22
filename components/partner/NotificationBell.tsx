'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, DollarSign, ArrowUpCircle, ShieldAlert, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Notification = {
  _id: string;
  type: 'deal_registered' | 'payment_received' | 'commission_approved' | 'commission_paid' | 'tier_upgraded' | 'risk_flag_review';
  message: string;
  read: boolean;
  createdAt: string;
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'deal_registered': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'payment_received': return <DollarSign className="h-4 w-4 text-emerald-500" />;
    case 'commission_approved': return <Check className="h-4 w-4 text-emerald-500" />;
    case 'commission_paid': return <DollarSign className="h-4 w-4 text-indigo-500" />;
    case 'tier_upgraded': return <ArrowUpCircle className="h-4 w-4 text-amber-500" />;
    case 'risk_flag_review': return <ShieldAlert className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-slate-500" />;
  }
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/partner/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const markAsRead = async (id?: string) => {
    try {
      const url = id ? `/api/partner/notifications?id=${id}` : '/api/partner/notifications';
      await fetch(url, { method: 'PATCH' });
      
      if (id) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all shrink-0 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-112 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <li 
                    key={notif._id} 
                    className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${!notif.read ? 'bg-blue-50/20' : ''}`}
                    onClick={() => {
                        if (!notif.read) markAsRead(notif._id);
                    }}
                  >
                    <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${!notif.read ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      {getIconForType(notif.type)}
                    </div>
                    <div>
                      <p className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 self-center shrink-0"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
