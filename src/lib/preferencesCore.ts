// GSD Pi Config - Preferences YAML/frontmatter (mirrors src-tauri core.rs)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { GSDPreferences } from "../types";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Extract the YAML frontmatter body from a markdown string. */
export function parseFrontmatter(content: string): string | null {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) return null;
  const afterFirst = trimmed.slice(3);
  const endPos = afterFirst.indexOf("\n---");
  if (endPos !== -1) return afterFirst.slice(0, endPos);
  const endWithEof = afterFirst.trimEnd();
  if (endWithEof.endsWith("---")) return endWithEof.slice(0, -3);
  return afterFirst;
}

/** Parse preferences markdown/text into a JSON-shaped object. */
export function loadPreferencesFromText(content: string): GSDPreferences {
  const yamlStr = parseFrontmatter(content) ?? "";
  if (yamlStr.trim() === "") return {};
  const parsed = parseYaml(yamlStr);
  if (parsed === null || parsed === undefined) return {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("YAML parse error: root must be an object");
  }
  const value = parsed as Record<string, JsonValue>;
  normalizeStringyIds(value);
  return value as GSDPreferences;
}

/** Coerce channel_id (and similar) to strings before crossing JS number limits. */
export function normalizeStringyIds(value: Record<string, JsonValue>): void {
  const remote = value.remote_questions;
  if (!remote || typeof remote !== "object" || Array.isArray(remote)) return;
  const remoteObj = remote as Record<string, JsonValue>;
  const cid = remoteObj.channel_id;
  if (cid === undefined || cid === null) return;
  if (typeof cid === "string") {
    remoteObj.channel_id = cid;
    return;
  }
  if (typeof cid === "number" || typeof cid === "boolean") {
    remoteObj.channel_id = String(cid);
    return;
  }
  delete remoteObj.channel_id;
}

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.includes("key") ||
    k.includes("token") ||
    k.includes("secret") ||
    k.includes("password")
  );
}

/** Redact string values under sensitive-looking keys (mirrors Rust redact_sensitive). */
export function redactSensitive(value: JsonValue): void {
  if (Array.isArray(value)) {
    for (const item of value) redactSensitive(item);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const obj = value as Record<string, JsonValue>;
  for (const [k, v] of Object.entries(obj)) {
    if (isSensitiveKey(k) && typeof v === "string") {
      obj[k] = "<redacted>";
      continue;
    }
    redactSensitive(v);
  }
}

/** Serialize preferences to canonical `---\n{yaml}---\n` format. */
export function serializePreferences(prefs: GSDPreferences): string {
  const clone = structuredClone(prefs) as Record<string, JsonValue>;
  normalizeStringyIds(clone);
  const yamlStr = stringifyYaml(clone);
  return `---\n${yamlStr}---\n`;
}

/** Build a shareable, redacted fenced YAML block for clipboard. */
export function buildShareablePreset(prefs: GSDPreferences): string {
  const redacted = structuredClone(prefs) as Record<string, JsonValue>;
  redactSensitive(redacted);
  normalizeStringyIds(redacted);
  const serialized = serializePreferences(redacted as GSDPreferences);
  const body = serialized
    .replace(/^---\n/, "")
    .replace(/\n---\n$/, "")
    .trimEnd();
  return `\`\`\`yaml\n${body}\n\`\`\`\n`;
}

/** Regex patterns that block public preset submission. */
const SECRET_PATTERNS = [
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bBearer\s+[a-zA-Z0-9._-]+\b/i,
  /\bghp_[a-zA-Z0-9]{20,}\b/,
  /\bgho_[a-zA-Z0-9]{20,}\b/,
  /\bxox[baprs]-[a-zA-Z0-9-]+\b/,
];

/** Return human-readable reasons if content looks like it contains secrets. */
export function scanForLeakedSecrets(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      hits.push(`Matched pattern: ${pattern.source}`);
    }
  }
  return hits;
}
