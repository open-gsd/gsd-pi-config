// GSD Pi Config - Tauri desktop platform
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { invoke } from "@tauri-apps/api/core";
import { open, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { cleanPrefs } from "../lib/cleanPrefs";
import type { ImportedWorkspace } from "../lib/importWorkspace";
import { visibleSectionIds } from "../lib/sectionConfig";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import type { LoadPreferencesResult, PreferencesPlatform } from "./types";

export interface TauriLoadExtras {
  filePath: string;
  models: GSDModelsConfig;
  modelsMtime: number;
  settings: Record<string, unknown>;
  settingsMtime: number;
}

export async function tauriLoadAll(
  projectPath?: string,
): Promise<TauriLoadExtras & { preferences: GSDPreferences }> {
  const args = projectPath ? { projectPath } : {};
  const preferences = await invoke<GSDPreferences>("load_preferences", args);
  const filePath = await invoke<string>("get_preferences_path", args);

  let models: GSDModelsConfig = {};
  let modelsMtime = 0;
  try {
    const snap = await invoke<{ value: GSDModelsConfig | null; mtime_ms: number }>(
      "load_models",
      args,
    );
    models = snap.value ?? {};
    modelsMtime = snap.mtime_ms ?? 0;
  } catch {
    models = {};
    modelsMtime = 0;
  }

  let settings: Record<string, unknown> = {};
  let settingsMtime = 0;
  try {
    const snap = await invoke<{
      value: Record<string, unknown> | null;
      mtime_ms: number;
    }>("load_settings", args);
    settings = snap.value ?? {};
    settingsMtime = snap.mtime_ms ?? 0;
  } catch {
    settings = {};
    settingsMtime = 0;
  }

  return {
    preferences,
    filePath,
    models,
    modelsMtime,
    settings,
    settingsMtime,
  };
}

export async function tauriSavePreferences(
  prefs: GSDPreferences,
  projectPath?: string,
): Promise<void> {
  const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
  const args: { preferences: unknown; projectPath?: string } = { preferences: cleaned };
  if (projectPath) args.projectPath = projectPath;
  await invoke("save_preferences", args);
}

export async function tauriSaveModels(
  models: GSDModelsConfig,
  modelsMtime: number,
  projectPath?: string,
): Promise<number> {
  const args: {
    models: unknown;
    expectedMtimeMs: number | null;
    projectPath?: string;
  } = {
    models,
    expectedMtimeMs: modelsMtime > 0 ? modelsMtime : null,
  };
  if (projectPath) args.projectPath = projectPath;
  return invoke<number>("save_models", args);
}

export async function tauriSaveSettings(
  settings: Record<string, unknown>,
  settingsMtime: number,
  projectPath?: string,
): Promise<number> {
  const args: {
    settings: unknown;
    expectedMtimeMs: number | null;
    projectPath?: string;
  } = {
    settings,
    expectedMtimeMs: settingsMtime > 0 ? settingsMtime : null,
  };
  if (projectPath) args.projectPath = projectPath;
  return invoke<number>("save_settings", args);
}

export const tauriPresetPlatform: PreferencesPlatform = {
  isWeb: () => false,
  visibleSections: () => visibleSectionIds(),

  async loadPreferences(): Promise<LoadPreferencesResult> {
    const data = await tauriLoadAll();
    return {
      preferences: data.preferences,
      sourceLabel: data.filePath,
    };
  },

  async savePreferences(prefs: GSDPreferences): Promise<void> {
    await tauriSavePreferences(prefs);
  },

  async importPreset(_file: File): Promise<GSDPreferences> {
    throw new Error("Use importPresetFromPath on desktop");
  },

  async importPresetFromText(_text: string): Promise<GSDPreferences> {
    throw new Error("Use importPresetFromPath on desktop");
  },

  async exportPreset(_prefs: GSDPreferences, _filename?: string): Promise<void> {
    throw new Error("Use exportPresetDialog on desktop");
  },

  async buildShareablePreset(prefs: GSDPreferences): Promise<string> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    return invoke<string>("build_shareable_preset", { preferences: cleaned });
  },
};

export async function tauriImportPresetDialog(): Promise<GSDPreferences | null> {
  const picked = await open({
    title: "Import preset",
    multiple: false,
    directory: false,
    filters: [{ name: "GSD Preset", extensions: ["preset.md", "md"] }],
  });
  if (typeof picked !== "string" || !picked) return null;
  return invoke<GSDPreferences>("import_preset", { sourcePath: picked });
}

export async function tauriExportPresetDialog(prefs: GSDPreferences): Promise<void> {
  const target = await saveDialog({
    title: "Export preset",
    defaultPath: "gsd.preset.md",
    filters: [{ name: "GSD Preset", extensions: ["preset.md", "md"] }],
  });
  if (!target) return;
  const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
  await invoke<string>("export_preset", {
    targetPath: target,
    preferences: cleaned,
  });
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export async function tauriPickPreferencesForImport(): Promise<ImportedWorkspace | null> {
  const picked = await open({
    title: "Select preferences.md",
    multiple: false,
    directory: false,
    filters: [{ name: "GSD Preferences", extensions: ["md"] }],
  });
  if (typeof picked !== "string" || !picked) return null;
  const preferences = await invoke<GSDPreferences>("import_preset", { sourcePath: picked });
  return { preferences, preferencesFileName: basename(picked) };
}

export async function tauriPickModelsForImport(): Promise<
  Pick<ImportedWorkspace, "models" | "modelsFileName"> | null
> {
  const picked = await open({
    title: "Select models.json",
    multiple: false,
    directory: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (typeof picked !== "string" || !picked) return null;
  const value = await invoke<Record<string, unknown>>("import_json_file", {
    sourcePath: picked,
  });
  return { models: value as GSDModelsConfig, modelsFileName: basename(picked) };
}

export async function tauriPickSettingsForImport(): Promise<
  Pick<ImportedWorkspace, "settings" | "settingsFileName"> | null
> {
  const picked = await open({
    title: "Select settings.json",
    multiple: false,
    directory: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (typeof picked !== "string" || !picked) return null;
  const settings = await invoke<Record<string, unknown>>("import_json_file", {
    sourcePath: picked,
  });
  return { settings, settingsFileName: basename(picked) };
}
