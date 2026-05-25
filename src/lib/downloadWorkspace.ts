// GSD Pi Config - Download config files to the user's machine (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { cleanPrefs } from "./cleanPrefs";
import { serializePreferences } from "./preferencesCore";
import type { GSDModelsConfig, GSDPreferences } from "../types";

export interface WorkspaceDownload {
  preferences: GSDPreferences;
  models: GSDModelsConfig;
  settings: Record<string, unknown>;
}

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Trigger browser downloads for the three GSD config files. */
export function downloadWorkspaceFiles(workspace: WorkspaceDownload): void {
  const cleaned = cleanPrefs(
    workspace.preferences as unknown as Record<string, unknown>,
  );
  const preferencesMd = serializePreferences(cleaned as GSDPreferences);
  downloadBlob("preferences.md", preferencesMd, "text/markdown;charset=utf-8");

  const modelsJson = JSON.stringify(workspace.models, null, 2);
  downloadBlob("models.json", modelsJson, "application/json;charset=utf-8");

  const settingsJson = JSON.stringify(workspace.settings, null, 2);
  downloadBlob("settings.json", settingsJson, "application/json;charset=utf-8");
}
