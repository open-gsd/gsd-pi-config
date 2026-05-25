// GSD Pi Config - Custom provider merge + collision detection
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// `models.json` lets users register custom providers alongside the built-in
// MODEL_CATALOG. Per the design review, **built-in providers always win** on
// an ID collision so a user-supplied `"anthropic"` can't silently shadow the
// real Anthropic path. Collisions are surfaced as inline warnings in
// CustomProvidersSection, never silently dropped.

import type { ProviderCatalog } from "../constants";
import type { CustomProviderConfig, GSDModelsConfig } from "../types";

/** Build a ProviderCatalog entry from a custom provider definition. */
function toCatalogEntry(id: string, cfg: CustomProviderConfig): ProviderCatalog {
  const models = (cfg.models ?? [])
    .map((m) => m.id)
    .filter((s): s is string => typeof s === "string" && s.length > 0);
  return {
    id,
    label: `${id} (custom)`,
    description: cfg.baseUrl ? `Custom provider → ${cfg.baseUrl}` : "Custom provider",
    models,
  };
}

/**
 * Merge custom providers into the base catalog. Built-in wins on collision —
 * the colliding custom entry is dropped from the merged catalog but returned
 * in `collisions` so the UI can prompt the user to rename.
 */
export function mergeCustomProviders(
  base: readonly ProviderCatalog[],
  models: GSDModelsConfig | undefined,
): { catalog: readonly ProviderCatalog[]; collisions: string[] } {
  const providers = models?.providers ?? {};
  const baseIds = new Set(base.map((p) => p.id));
  const collisions: string[] = [];
  const extras: ProviderCatalog[] = [];
  for (const [id, cfg] of Object.entries(providers)) {
    if (!id) continue;
    if (baseIds.has(id)) {
      collisions.push(id);
      continue;
    }
    extras.push(toCatalogEntry(id, cfg));
  }
  return { catalog: [...base, ...extras], collisions };
}
