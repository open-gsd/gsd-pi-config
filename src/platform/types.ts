// GSD Pi Config - Platform abstraction types
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { SectionId } from "../components/Sidebar";
import type { GSDPreferences } from "../types";

export interface LoadPreferencesResult {
  preferences: GSDPreferences;
  /** Display path or label (desktop file path, web "Draft"). */
  sourceLabel: string;
}

export interface PreferencesPlatform {
  isWeb(): boolean;
  visibleSections(): SectionId[];
  loadPreferences(): Promise<LoadPreferencesResult>;
  savePreferences(prefs: GSDPreferences): Promise<void>;
  importPreset(file: File): Promise<GSDPreferences>;
  importPresetFromText(text: string): Promise<GSDPreferences>;
  exportPreset(prefs: GSDPreferences, filename?: string): Promise<void>;
  buildShareablePreset(prefs: GSDPreferences): Promise<string>;
}
