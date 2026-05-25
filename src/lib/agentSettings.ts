// GSD Pi Config - settings.json helpers
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { AgentSettingsDoc, HooksSettings, HookEntry, PiAgentSettings } from "./agentSettingsTypes";

export const HOOK_EVENTS = [
  "PreToolUse",
  "PostToolUse",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "Notification",
  "PreCompact",
  "PostCompact",
  "PreCommit",
  "PostCommit",
  "PrePush",
  "PostPush",
  "PrePr",
  "PostPr",
  "PreMilestone",
  "PostMilestone",
  "PreUnit",
  "PostUnit",
  "PreVerify",
  "PostVerify",
  "BudgetThreshold",
  "Blocked",
] as const;

export type HookEventName = (typeof HOOK_EVENTS)[number];

export function asAgentSettings(doc: Record<string, unknown>): AgentSettingsDoc {
  return doc as AgentSettingsDoc;
}

/** Set or remove a top-level key. */
export function setKey(
  doc: Record<string, unknown>,
  key: string,
  next: unknown,
): Record<string, unknown> {
  if (next === undefined) {
    const { [key]: _drop, ...rest } = doc;
    void _drop;
    return rest;
  }
  return { ...doc, [key]: next };
}

/** Shallow-merge a nested object key on the document. */
export function patchNested<T extends object>(
  doc: Record<string, unknown>,
  key: keyof PiAgentSettings,
  patch: Partial<T>,
): Record<string, unknown> {
  const prev = doc[key as string];
  const base =
    prev && typeof prev === "object" && !Array.isArray(prev)
      ? (prev as T)
      : ({} as T);
  const merged = { ...base, ...patch };
  const cleaned = Object.fromEntries(
    Object.entries(merged).filter(([, v]) => v !== undefined),
  ) as T;
  return setKey(
    doc,
    key as string,
    Object.keys(cleaned).length > 0 ? cleaned : undefined,
  );
}

/** Model picker value ↔ defaultProvider + defaultModel (clears legacy `model`). */
export function defaultModelPickerValue(doc: Record<string, unknown>): string | undefined {
  const s = asAgentSettings(doc);
  if (s.defaultModel) {
    return s.defaultProvider ? `${s.defaultProvider}/${s.defaultModel}` : s.defaultModel;
  }
  return s.model;
}

export function applyDefaultModelPicker(
  doc: Record<string, unknown>,
  value: string | undefined,
): Record<string, unknown> {
  if (!value?.trim()) {
    let next = setKey(doc, "defaultModel", undefined);
    next = setKey(next, "defaultProvider", undefined);
    return next;
  }
  const slash = value.indexOf("/");
  let next = setKey(doc, "model", undefined);
  if (slash > 0) {
    next = setKey(next, "defaultProvider", value.slice(0, slash));
    next = setKey(next, "defaultModel", value.slice(slash + 1));
  } else {
    next = setKey(next, "defaultProvider", undefined);
    next = setKey(next, "defaultModel", value);
  }
  return next;
}

export function readHooks(doc: Record<string, unknown>): HooksSettings {
  const hooks = doc.hooks;
  if (hooks && typeof hooks === "object" && !Array.isArray(hooks)) {
    return hooks as HooksSettings;
  }
  return {};
}

export function setHookEvent(
  doc: Record<string, unknown>,
  event: HookEventName,
  entries: HookEntry[] | undefined,
): Record<string, unknown> {
  const hooks = readHooks(doc);
  const nextHooks = { ...hooks, [event]: entries };
  if (!entries?.length) {
    delete nextHooks[event];
  }
  return setKey(
    doc,
    "hooks",
    Object.keys(nextHooks).length > 0 ? nextHooks : undefined,
  );
}

export function packageSourceLabels(packages: PiAgentSettings["packages"]): string[] {
  if (!packages) return [];
  return packages.map((p) =>
    typeof p === "string" ? p : p.source,
  );
}

export function setPackageSourcesFromLabels(
  doc: Record<string, unknown>,
  labels: string[],
): Record<string, unknown> {
  const prev = asAgentSettings(doc).packages ?? [];
  const objectEntries = prev.filter((p) => typeof p !== "string");
  const next = [...labels, ...objectEntries];
  return setKey(doc, "packages", next.length > 0 ? next : undefined);
}
