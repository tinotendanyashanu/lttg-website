'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    // Trigger a reload or event to start tracking if needed, 
    // but AnalyticsTracker will likely pick it up on next nav or if it watches storage (it doesn't yet).
    // For now, simple acceptance is recorded.
    window.location.reload(); 
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600 hidden md:block">
                <Cookie className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">We value your privacy</h3>
                <p className="text-sm text-slate-500 max-w-2xl">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
                onClick={handleDecline}
                className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
                Necessary Only
            </button>
            <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap"
            >
                Accept All
            </button>
        </div>
      </div>
    </div>
  );
}
