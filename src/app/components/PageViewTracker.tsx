"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // The existing analytics script owns the initial page_view.
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    window.PapipuAnalytics?.trackPageView();
  }, [pathname]);

  return null;
}
