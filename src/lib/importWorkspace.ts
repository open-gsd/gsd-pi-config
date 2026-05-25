import { loadPreferencesFromText } from "./preferencesCore";
import type { GSDModelsConfig, GSDPreferences } from "../types";

export interface ImportedWorkspace {
  preferences?: GSDPreferences;
  models?: GSDModelsConfig;
  settings?: Record<string, unknown>;
  preferencesFileName?: string;
  modelsFileName?: string;
  settingsFileName?: string;
}

export async function readPreferencesFromFile(
  file: File,
): Promise<GSDPreferences> {
  const text = await file.text();
  return loadPreferencesFromText(text);
}

export async function readJsonConfigFromFile(
  file: File,
): Promise<Record<string, unknown>> {
  const text = await file.text();
  if (!text.trim()) return {};
  const parsed: unknown = JSON.parse(text);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${file.name}: expected a JSON object`);
  }
  return parsed as Record<string, unknown>;
}
