// GSD Pi Config - Platform detection
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { PreferencesPlatform } from "./types";
import { tauriPresetPlatform } from "./tauri";
import { tauriBackend } from "./tauriBackend";
import { webBackend } from "./webBackend";
import { webPlatform } from "./web";

export function isWebPlatform(): boolean {
  return import.meta.env.VITE_PLATFORM === "web";
}

export function getPlatform(): PreferencesPlatform {
  return isWebPlatform() ? webPlatform : tauriPresetPlatform;
}

export function getConfigBackend() {
  return isWebPlatform() ? webBackend : tauriBackend;
}

export type { PreferencesPlatform, LoadPreferencesResult } from "./types";
export { webPlatform, setWebDraft, readWebDraftMeta, writeWebDraftMeta } from "./web";
export {
  tauriLoadAll,
  tauriSavePreferences,
  tauriSaveModels,
  tauriSaveSettings,
  tauriImportPresetDialog,
  tauriExportPresetDialog,
} from "./tauri";
