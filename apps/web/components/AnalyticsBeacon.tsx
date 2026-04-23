'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    // Avoid duplicate fires for the same path
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Small delay to batch rapid navigations
    const timeout = setTimeout(() => {
      try {
        const referrer = document.referrer || undefined;
        // Use sendBeacon for reliability (fires even on page unload)
        const payload = JSON.stringify({ path: pathname, referrer });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE}/api/analytics/pageview`, blob);
        } else {
          fetch(`${API_BASE}/api/analytics/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Analytics should never break the app
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
