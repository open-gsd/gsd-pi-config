// GSD Pi Config - Web platform (localStorage + File API)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { cleanPrefs } from "../lib/cleanPrefs";
import {
  buildShareablePreset,
  loadPreferencesFromText,
  serializePreferences,
} from "../lib/preferencesCore";
import { visibleSectionIds } from "../lib/sectionConfig";
import type { GSDPreferences } from "../types";
import type { LoadPreferencesResult, PreferencesPlatform } from "./types";

const META_KEY = "gsd-pi-config.web.meta";
const WORKSPACE_LABEL_KEY = "gsd-pi-config.web.workspace-label";

export interface WebDraftMeta {
  title?: string;
  description?: string;
  sourcePresetSlug?: string;
}

export function readWebDraftMeta(): WebDraftMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as WebDraftMeta) : {};
  } catch {
    return {};
  }
}

export function writeWebDraftMeta(meta: WebDraftMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/** Human-readable source label shown in the editor (import name, preset, new, etc.). */
export function readWebWorkspaceLabel(): string {
  try {
    return localStorage.getItem(WORKSPACE_LABEL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeWebWorkspaceLabel(label: string): void {
  if (label) {
    localStorage.setItem(WORKSPACE_LABEL_KEY, label);
  } else {
    localStorage.removeItem(WORKSPACE_LABEL_KEY);
  }
}

/** Write global preferences (same store as ConfigApp web backend). */
export async function setWebDraft(prefs: GSDPreferences, meta?: WebDraftMeta): Promise<void> {
  const { webBackend } = await import("./webBackend");
  await webBackend.savePreferences(prefs);
  if (meta) writeWebDraftMeta(meta);
}

export const webPlatform: PreferencesPlatform = {
  isWeb: () => true,
  visibleSections: () => visibleSectionIds("web"),

  async loadPreferences(): Promise<LoadPreferencesResult> {
    const { webBackend } = await import("./webBackend");
    const data = await webBackend.loadAll();
    return { preferences: data.preferences, sourceLabel: data.filePath };
  },

  async savePreferences(prefs: GSDPreferences): Promise<void> {
    const { webBackend } = await import("./webBackend");
    await webBackend.savePreferences(prefs);
  },

  async importPreset(file: File): Promise<GSDPreferences> {
    const text = await file.text();
    return loadPreferencesFromText(text);
  },

  async importPresetFromText(text: string): Promise<GSDPreferences> {
    return loadPreferencesFromText(text);
  },

  async exportPreset(prefs: GSDPreferences, filename = "gsd.preset.md"): Promise<void> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    const markdown = serializePreferences(cleaned as GSDPreferences);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".preset.md") ? filename : `${filename}.preset.md`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async buildShareablePreset(prefs: GSDPreferences): Promise<string> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    return buildShareablePreset(cleaned as GSDPreferences);
  },
};
