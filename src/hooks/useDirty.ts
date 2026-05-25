// GSD Pi Config - Per-section dirty tracking hook
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Compares current prefs against the last-saved snapshot and reports which
// sections have unsaved changes. Used by the sidebar to render dirty dots
// and by ⌘S / section-reset flows.

import { useMemo } from "react";
import type { GSDPreferences } from "../types";
import type { SectionId } from "../components/Sidebar";
import { ALL_FIELD_PATHS, getAtPath, getField } from "../lib/fields";

export interface DirtyState {
  /** True if any field differs from the saved snapshot. */
  isDirty: boolean;
  /** Sections that contain at least one changed field. */
  dirtySections: Set<SectionId>;
  /** Individual field paths whose value has changed. */
  dirtyPaths: string[];
}

/**
 * Diff `prefs` against `originalPrefs` using the field registry.
 *
 * The snapshot is passed as a serialized JSON string (how App.tsx stores it)
 * to keep identity-stable references cheap. We parse it once per render.
 */
export function useDirty(prefs: GSDPreferences, originalPrefsJson: string): DirtyState {
  return useMemo(() => {
    const dirtySections = new Set<SectionId>();
    const dirtyPaths: string[] = [];

    let original: unknown;
    try {
      original = JSON.parse(originalPrefsJson);
    } catch {
      original = {};
    }

    for (const path of ALL_FIELD_PATHS) {
      const a = getAtPath(prefs, path);
      const b = getAtPath(original, path);
      if (!valuesEqual(a, b)) {
        dirtyPaths.push(path);
        const meta = getField(path);
        if (meta) dirtySections.add(meta.section);
      }
    }

    // Fallback: catch any top-level keys in `prefs` that aren't registered.
    // This prevents silently losing dirty state for fields we forgot to
    // register. The catch-all maps to the "general" section as a safety net.
    const registered = new Set<string>(
      ALL_FIELD_PATHS.map((p) => p.split(".")[0])
    );
    const union = new Set<string>([
      ...Object.keys((prefs ?? {}) as Record<string, unknown>),
      ...Object.keys((original ?? {}) as Record<string, unknown>),
    ]);
    for (const topKey of union) {
      if (registered.has(topKey)) continue;
      const a = (prefs as Record<string, unknown> | undefined)?.[topKey];
      const b = (original as Record<string, unknown> | undefined)?.[topKey];
      if (!valuesEqual(a, b)) {
        dirtyPaths.push(topKey);
        dirtySections.add("general");
      }
    }

    return {
      isDirty: dirtyPaths.length > 0,
      dirtySections,
      dirtyPaths,
    };
  }, [prefs, originalPrefsJson]);
}

/**
 * Deep equality by JSON serialization. The preference shapes are plain data
 * (no functions, no Dates, no cycles), so this is sufficient and cheap.
 */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  // Treat undefined and missing keys as equal
  if (a === undefined && b === undefined) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
