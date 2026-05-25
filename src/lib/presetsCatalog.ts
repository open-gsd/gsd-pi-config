// GSD Pi Config - Remote preset gallery (git-backed)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

export interface PresetIndexEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  path: string;
}

export interface PresetIndex {
  presets: PresetIndexEntry[];
}

const DEFAULT_INDEX_URL =
  "https://raw.githubusercontent.com/open-gsd/gsd-pi-presets/main/index.json";

const DEFAULT_RAW_BASE =
  "https://raw.githubusercontent.com/open-gsd/gsd-pi-presets/main/";

export function presetsIndexUrl(): string {
  return import.meta.env.VITE_PRESETS_INDEX_URL ?? DEFAULT_INDEX_URL;
}

export function presetsRawBaseUrl(): string {
  return import.meta.env.VITE_PRESETS_RAW_BASE_URL ?? DEFAULT_RAW_BASE;
}

export function presetRawUrl(path: string): string {
  const base = presetsRawBaseUrl().replace(/\/?$/, "/");
  const rel = path.replace(/^\//, "");
  return `${base}${rel}`;
}

export async function fetchPresetIndex(): Promise<PresetIndex> {
  const res = await fetch(presetsIndexUrl(), { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load preset index (${res.status})`);
  return (await res.json()) as PresetIndex;
}

export async function fetchPresetMarkdown(path: string): Promise<string> {
  const res = await fetch(presetRawUrl(path), { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load preset (${res.status})`);
  return res.text();
}

export const PRESETS_CONTRIBUTING_URL =
  import.meta.env.VITE_PRESETS_CONTRIBUTING_URL ??
  "https://github.com/open-gsd/gsd-pi-presets/blob/main/CONTRIBUTING.md";
