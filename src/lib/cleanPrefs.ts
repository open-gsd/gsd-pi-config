// GSD Pi Config - Strip empty values before YAML export
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/**
 * Strip undefined/null values and empty objects recursively for clean YAML output.
 *
 * Known limitation: empty arrays are pruned (a user clearing a list to `[]`
 * loses the key on save). Intentional for now — users don't typically
 * distinguish "unset" from "empty" for these fields.
 */
export function cleanPrefs(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      if (val.length > 0) result[key] = val;
    } else if (typeof val === "object") {
      const cleaned = cleanPrefs(val as Record<string, unknown>);
      if (Object.keys(cleaned).length > 0) result[key] = cleaned;
    } else {
      result[key] = val;
    }
  }
  return result;
}
