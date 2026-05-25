// GSD Pi Config - localStorage key migration from prior app IDs
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

const MIGRATIONS: [from: string, to: string][] = [
  ["gsd2-config.theme", "gsd-pi-config.theme"],
  ["gsd2-config.recent-projects", "gsd-pi-config.recent-projects"],
  ["gsd2-config.last-scope", "gsd-pi-config.last-scope"],
  ["gsd2-config.last-project", "gsd-pi-config.last-project"],
];

/** Copy values from legacy localStorage keys once, then remove the old keys. */
export function migrateLegacyStorageKeys(): void {
  try {
    for (const [from, to] of MIGRATIONS) {
      const value = localStorage.getItem(from);
      if (value !== null && localStorage.getItem(to) === null) {
        localStorage.setItem(to, value);
      }
      if (value !== null) {
        localStorage.removeItem(from);
      }
    }
  } catch {
    // ignore (private browsing, quota, etc.)
  }
}
