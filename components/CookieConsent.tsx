"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setIsVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "false");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600 hidden md:block">
            <Cookie className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">
              We value your privacy
            </h3>
            <p className="text-sm text-slate-500 max-w-2xl">
              Optional analytics help us understand which pages are useful. They
              only run if you accept. You can browse and send an inquiry with
              analytics declined.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={decline}
            className="flex-1 md:flex-none py-2.5 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 md:flex-none py-2.5 px-6 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
