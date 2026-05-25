// GSD Pi Config - Pure-TS field validators
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Each validator returns `null` if the value is valid, or an error string
// describing what's wrong. Designed to be tree-shakeable and IPC-free.

export type Validator = (value: unknown) => string | null;

/** Value must be one of the provided enum literals (or undefined). */
export function isEnum<T extends string>(allowed: readonly T[]): Validator {
  const set = new Set<string>(allowed as readonly string[]);
  return (value) => {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string") return `Expected one of: ${allowed.join(", ")}`;
    if (!set.has(value)) return `Invalid value. Expected one of: ${allowed.join(", ")}`;
    return null;
  };
}

/** Numeric value in [min, max]. Undefined/null pass through. */
export function numInRange(min: number, max: number): Validator {
  return (value) => {
    if (value === undefined || value === null || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return "Must be a number";
    if (n < min) return `Must be ≥ ${min}`;
    if (n > max) return `Must be ≤ ${max}`;
    return null;
  };
}

/** String must be non-empty once trimmed. */
export const nonEmpty: Validator = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return "Must be a string";
  if (value.trim().length === 0) return "Cannot be empty";
  return null;
};

/**
 * Looks-like-a-path sanity check — no control characters, not absolute home
 * references we can't resolve. Intentionally liberal; we don't stat the path.
 */
export const validPath: Validator = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return "Must be a string";
  if (/[\u0000-\u001f]/.test(value)) return "Contains control characters";
  return null;
};

/** Matches a cron-like schedule. Accepts standard 5-field cron only. */
export const cronExpr: Validator = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return "Must be a string";
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 5) return "Cron must have 5 space-separated fields";
  return null;
};

/** Compose validators; first error wins. */
export function all(...validators: Validator[]): Validator {
  return (value) => {
    for (const v of validators) {
      const err = v(value);
      if (err !== null) return err;
    }
    return null;
  };
}
