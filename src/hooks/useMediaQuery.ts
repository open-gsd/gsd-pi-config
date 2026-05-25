// GSD Pi Config - matchMedia hook for responsive layout
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";

/** True when the viewport matches `query` (updates on resize). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Sidebar drawer layout (matches Tailwind `md` and `.gsd-sidebar-drawer`). */
export function useSidebarDrawerLayout(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
