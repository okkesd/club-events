"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SiteVisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // The page response sets the HttpOnly visitor cookie before this runs.
    // Send on navigation too, allowing a failed initial request to recover.
    // Deduplication lives in the database and works across tabs and sessions.
    void fetch("/api/proxy/metrics/site-visit", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
