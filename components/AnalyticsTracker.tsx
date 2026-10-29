"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const syncConsent = () => {
      try {
        setAccepted(localStorage.getItem("cookie_consent") === "true");
      } catch {
        setAccepted(false);
      }
    };
    syncConsent();
    window.addEventListener("cookie-consent-change", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("cookie-consent-change", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);
  useEffect(() => {
    if (!accepted) return;
    let sessionId: string;
    try {
      sessionId =
        sessionStorage.getItem("analytics_session_id") || crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", sessionId);
      if (!sessionStorage.getItem("inquiry_attribution")) {
        let referrer = "";
        try {
          referrer = document.referrer ? new URL(document.referrer).origin : "";
        } catch {
          /* Invalid referrer. */
        }
        sessionStorage.setItem(
          "inquiry_attribution",
          JSON.stringify({
            landingPath: pathname,
            utmSource: (searchParams.get("utm_source") || "").slice(0, 100),
            utmMedium: (searchParams.get("utm_medium") || "").slice(0, 100),
            utmCampaign: (searchParams.get("utm_campaign") || "").slice(0, 100),
            referrer,
          }),
        );
      }
    } catch {
      return;
    }
    // Query strings can contain private data; page views retain the path only.
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId }),
    }).catch(() => {});
  }, [accepted, pathname, searchParams]);
  return accepted ? <Analytics /> : null;
}
