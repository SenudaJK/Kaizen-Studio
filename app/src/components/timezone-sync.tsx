"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "kz_tz";

/**
 * Tells the server which time zone the browser is in, once, via a cookie.
 * The first visit refreshes the page so "today" is correct from the start.
 */
export function TimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`))?.split("=")[1];
    if (!zone || decodeURIComponent(current ?? "") === zone) return;
    document.cookie = `${COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
