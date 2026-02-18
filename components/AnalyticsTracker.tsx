'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Session ID
    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('analytics_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Send tracking request
    const trackPage = async () => {
      // Check consent
      const consent = localStorage.getItem('cookie_consent');
      if (consent === 'declined') return; 

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: url,
            sessionId,
          }),
        });
      } catch (error) {
        console.error('Failed to track page view', error);
      }
    };

    trackPage();
  }, [pathname, searchParams, sessionId]);

  return null; // Render nothing
}
