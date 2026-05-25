// GSD Pi Config - Workflow mode & token profile cascade presets
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// When a user picks "solo" / "team" as a workflow mode, or switches the
// token profile, the section description promises "sensible defaults" will
// follow. This module is that promise: each choice maps to a flat table of
// dotted json-paths → target values, and `applyModePreset` /
// `applyProfilePreset` overlay those onto the current preferences.
//
// The tables are intentionally narrow. We cascade settings that are clearly
// implied by the choice (git isolation for solo vs team, phase skipping
// for budget vs quality) and leave model IDs alone — those are too volatile
// to hardcode and users nearly always customize them.

import type { GSDPreferences, WorkflowMode, TokenProfile } from "../types";

/** Flat patch: dotted path → target value. */
export type PresetPatch = Record<string, unknown>;

// ─── Mode presets ───────────────────────────────────────────────────────────

const MODE_PRESETS: Record<WorkflowMode, PresetPatch> = {
  solo: {
    "unique_milestone_ids": false,
    "git.isolation": "none",
    "git.auto_push": false,
    "git.push_branches": false,
    "git.auto_pr": false,
    "git.merge_strategy": "squash",
    "parallel.auto_merge": "auto",
    "phases.require_slice_discussion": false,
    "notifications.enabled": false,
  },
  team: {
    "unique_milestone_ids": true,
    "git.isolation": "worktree",
    "git.auto_push": true,
    "git.push_branches": true,
    "git.auto_pr": true,
    "git.merge_strategy": "squash",
    "parallel.auto_merge": "confirm",
    "phases.require_slice_discussion": true,
    "notifications.enabled": true,
    "notifications.on_milestone": true,
    "notifications.on_attention": true,
  },
};

// ─── Token profile presets ──────────────────────────────────────────────────

// These phase-skip values mirror `resolveProfileDefaults` in GSD Pi's
// `preferences-models.ts`. Keep them in sync — a profile flip here that
// disagrees with the runtime ends up applying a config the runtime would
// have overridden, confusing the user. Balanced and Quality both skip
// research/reassess at the runtime level; Quality adds strict verification
// on top, Budget adds slice research skip and observation masking.
const PROFILE_PRESETS: Record<TokenProfile, PresetPatch> = {
  budget: {
    "phases.skip_research": true,
    "phases.skip_reassess": true,
    "phases.skip_slice_research": true,
    "context_management.observation_masking": true,
    "context_management.compaction_threshold_percent": 70,
    "context_selection": "smart",
    "enhanced_verification": false,
    "enhanced_verification_pre": false,
    "enhanced_verification_post": false,
  },
  balanced: {
    "phases.skip_research": true,
    "phases.skip_reassess": true,
    "phases.skip_slice_research": false,
    "context_management.observation_masking": true,
    "context_management.compaction_threshold_percent": 80,
    "context_selection": "smart",
    "enhanced_verification": true,
    "enhanced_verification_pre": false,
    "enhanced_verification_post": false,
  },
  quality: {
    "phases.skip_research": true,
    "phases.skip_reassess": true,
    "phases.skip_slice_research": false,
    "context_management.observation_masking": false,
    "context_management.compaction_threshold_percent": 90,
    "context_selection": "full",
    "enhanced_verification": true,
    "enhanced_verification_pre": true,
    "enhanced_verification_post": true,
    "enhanced_verification_strict": true,
  },
  "burn-max": {
    "dynamic_routing.enabled": false,
    "context_selection": "full",
    "phases.skip_research": false,
    "phases.skip_reassess": false,
    "phases.skip_slice_research": false,
    "phases.skip_milestone_validation": false,
    "phases.reassess_after_slice": true,
    "context_management.observation_masking": false,
    "enhanced_verification": true,
    "enhanced_verification_pre": true,
    "enhanced_verification_post": true,
    "enhanced_verification_strict": true,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export interface PresetDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

/** Read a dotted path out of a nested object. Undefined at any missing seg. */
function getAtPath(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined) return undefined;
  const segs = path.split(".");
  let cur: unknown = obj;
  for (const seg of segs) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/** Deep-clone + write a dotted path on a plain JSON-shaped object. */
function setAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segs = path.split(".");
  if (segs.length === 1) {
    return { ...obj, [segs[0]]: value };
  }
  const [head, ...tail] = segs;
  const child = obj[head];
  const childObj: Record<string, unknown> =
    child && typeof child === "object" && !Array.isArray(child)
      ? (child as Record<string, unknown>)
      : {};
  return {
    ...obj,
    [head]: setAtPath(childObj, tail.join("."), value),
  };
}

/** Compute the list of keys that would change when applying a patch. */
function diffPatch(prefs: GSDPreferences, patch: PresetPatch): PresetDiffEntry[] {
  const changes: PresetDiffEntry[] = [];
  for (const [path, after] of Object.entries(patch)) {
    const before = getAtPath(prefs, path);
    if (before !== after) {
      changes.push({ path, before, after });
    }
  }
  return changes;
}

/** Overlay a patch onto `prefs`, returning a new object. */
function applyPatch(prefs: GSDPreferences, patch: PresetPatch): GSDPreferences {
  let next = prefs as Record<string, unknown>;
  for (const [path, value] of Object.entries(patch)) {
    next = setAtPath(next, path, value);
  }
  return next as GSDPreferences;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Diff the mode preset against current prefs (excludes the `mode` key itself). */
export function diffModePreset(
  prefs: GSDPreferences,
  mode: WorkflowMode,
): PresetDiffEntry[] {
  return diffPatch(prefs, MODE_PRESETS[mode]);
}

/** Diff the profile preset against current prefs (excludes `token_profile`). */
export function diffProfilePreset(
  prefs: GSDPreferences,
  profile: TokenProfile,
): PresetDiffEntry[] {
  return diffPatch(prefs, PROFILE_PRESETS[profile]);
}

/** Return prefs with `mode` set AND the mode cascade applied. */
export function applyModePreset(
  prefs: GSDPreferences,
  mode: WorkflowMode,
): GSDPreferences {
  return applyPatch({ ...prefs, mode }, MODE_PRESETS[mode]);
}

/** Return prefs with `token_profile` set AND the profile cascade applied. */
export function applyProfilePreset(
  prefs: GSDPreferences,
  profile: TokenProfile,
): GSDPreferences {
  return applyPatch({ ...prefs, token_profile: profile }, PROFILE_PRESETS[profile]);
}

/** Format a value for a confirm-dialog summary line. */
export function formatValue(v: unknown): string {
  if (v === undefined) return "(unset)";
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}
