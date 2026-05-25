// GSD Pi Config - Theme preference (system / dark / light)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Theme is a UI-only preference that persists in localStorage, NOT in the
// preferences.md file. This keeps it out of the YAML round-trip contract and
// avoids syncing per-machine display choices across projects.

import { useEffect, useState } from "react";

export type ThemePreference = "system" | "dark" | "light";
export type EffectiveTheme = "dark" | "light";

const STORAGE_KEY = "gsd-pi-config.theme";

/** Read the saved preference, defaulting to "system". */
export function getStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

/** Resolve a preference to the effective theme (dark or light). */
export function resolveTheme(pref: ThemePreference): EffectiveTheme {
  if (pref === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  }
  return pref;
}

/** Apply the effective theme to `<html data-theme="...">`. */
export function applyTheme(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = effective;
}

/**
 * React hook: subscribe to the theme preference with full system-change
 * awareness. Returns the preference, the resolved effective theme, and a
 * setter that persists and applies the new preference.
 */
export function useTheme(): {
  theme: ThemePreference;
  effective: EffectiveTheme;
  setTheme: (next: ThemePreference) => void;
} {
  const [theme, setThemeState] = useState<ThemePreference>(() => getStoredTheme());
  const [effective, setEffective] = useState<EffectiveTheme>(() =>
    resolveTheme(getStoredTheme()),
  );

  // Apply whenever preference changes or system theme flips under "system".
  useEffect(() => {
    const next = resolveTheme(theme);
    setEffective(next);
    applyTheme(next);

    if (theme !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      const eff: EffectiveTheme = e.matches ? "light" : "dark";
      setEffective(eff);
      applyTheme(eff);
    };
    // Some older Safari versions only support addListener.
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, [theme]);

  const setTheme = (next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setThemeState(next);
  };

  return { theme, effective, setTheme };
}

/**
 * Boot-time theme application. Call this as early as possible (before React
 * mounts) to avoid a dark-then-light flash on light-theme machines.
 */
export function bootstrapTheme() {
  const stored = getStoredTheme();
  applyTheme(resolveTheme(stored));
}
