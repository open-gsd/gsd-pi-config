# Testing Patterns

**Analysis Date:** 2026-07-21

## Test Framework

**Runner (TypeScript):**
- Vitest `^4.0.18` (devDependency)
- Config embedded in `vite.config.ts` under `test:`
  - `environment: "node"`
  - `include: ["src/**/*.test.ts"]`
- Assertion library: Vitest built-ins (`expect` from `"vitest"`)

**Runner (Rust):**
- Cargo built-in `#[test]` / `#[cfg(test)]` modules
- Dev dependency: `tempfile = "3"` (`src-tauri/Cargo.toml`) for temp dirs

**Run Commands:**
```bash
npm test                 # vitest run (all src/**/*.test.ts)
npx vitest               # interactive / watch (Vitest default when not using run)
npx vitest run path/to/file.test.ts   # single file

cd src-tauri && cargo test            # Rust unit tests (core + lib)
cd src-tauri && cargo test round_trip # filter by test name
```

**CI:**
- `.github/workflows/test-frontend.yml` — on PR/push to `main` when `src/**`, lockfile, or Vite config change
- Steps: `npm ci` → `npm test` on Node 20
- No coverage step in CI
- Rust tests are not run in `test-frontend.yml` (desktop/release workflows handle native builds separately)

## Test File Organization

**Location:**
- TypeScript: co-located next to pure modules — `src/lib/preferencesCore.test.ts` beside `preferencesCore.ts`
- Glob only picks up `src/**/*.test.ts` (not `*.test.tsx`, not `api/**`)
- Rust: inline `mod tests { ... }` at bottom of `src-tauri/src/core.rs` and `src-tauri/src/lib.rs`

**Naming:**
- TypeScript: `*.test.ts` (not `*.spec.ts`)
- Rust: snake_case function names describing behavior — `round_trip_preserves_full_preferences`, `load_coerces_unquoted_channel_id_to_string`

**Structure:**
```
src/lib/
  preferencesCore.ts
  preferencesCore.test.ts    # only TS unit suite today
src-tauri/src/
  core.rs                    # #[cfg(test)] mod tests { ... }
  lib.rs                     # additional #[cfg(test)] tests
```

## Test Structure

**Suite Organization (Vitest):**
```typescript
// GSD Pi Config - preferencesCore tests (mirrors Rust unit tests)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { describe, expect, it } from "vitest";
import type { GSDPreferences, WorkflowMode } from "../types";
import {
  buildShareablePreset,
  loadPreferencesFromText,
  normalizeStringyIds,
  redactSensitive,
  serializePreferences,
  type JsonValue,
} from "./preferencesCore";

describe("loadPreferencesFromText", () => {
  it("round-trips snowflake channel_id as string", () => {
    const original: GSDPreferences = {
      mode: "solo" as WorkflowMode,
      remote_questions: {
        channel_id: "1234567890123456789",
        channel: "discord",
      },
      verification_commands: ["npm run build", "cargo test"],
    };
    const markdown = serializePreferences(original);
    const loaded = loadPreferencesFromText(markdown);
    expect(loaded).toEqual(original);
    expect(loaded.remote_questions?.channel_id).toBe("1234567890123456789");
  });
});
```

**Patterns:**
- One `describe` per exported function or behavior cluster
- `it("...")` with behavior-focused English sentences
- No shared `beforeEach` / `afterEach` in current suite — each test builds its own data
- Prefer pure functions: serialize → load → assert equality

**Rust pattern:**
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use serde_json::json;

    #[test]
    fn round_trip_preserves_full_preferences() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("preferences.md");
        // arrange / act / assert with expect messages
    }
}
```

- Use `TempDir` for filesystem tests; never write into the repo tree
- Prefer `assert_eq!` / `assert!` with failure messages for regression clarity
- Document product regressions in comments above the test (snowflake `channel_id` precision)

## Mocking

**Framework:** Not used in current TypeScript tests

**Patterns:**
- Prefer testing pure modules (`preferencesCore`, future `validators`, `cleanPrefs`) without mocks
- Platform/Tauri/React components are currently untested at unit level — do not introduce heavy mocks unless necessary

**What to Mock:**
- If testing UI later: mock `useConfigBackend` / `ConfigBackend` interface rather than real localStorage or Tauri IPC
- If testing API handlers later: mock `fetch` and env vars; never commit real tokens

**What NOT to Mock:**
- YAML parse/stringify (`yaml` package) — exercise real serialization
- Preference round-trip paths that must match Rust

## Fixtures and Factories

**Test Data:**
```typescript
// Inline fixtures preferred for small cases
const yaml = `---
mode: solo
remote_questions:
  channel_id: "1234567890123456789"
  channel: discord
---
`;

// Cast only when testing redaction of keys outside strict types
buildShareablePreset({ mode: "solo", api_key: "shouldnotleak" } as never);
```

**Rust:**
- Large `FULL_FIXTURE` string constants inside the test module for full preference documents
- `json!({ "mode": "solo" })` for small shapes

**Location:**
- Keep fixtures inline next to the test unless they become multi-KB shared assets
- No `src/__fixtures__` or `tests/` directory for TypeScript today

## Coverage

**Requirements:** None enforced (no coverage threshold, no Istanbul/v8 coverage script)

**View Coverage (optional local):**
```bash
npx vitest run --coverage   # only after adding @vitest/coverage-v8 if desired
```

**Current coverage reality:**
- Strong unit coverage intent for **preferences YAML/frontmatter, redaction, channel_id normalization** (TS + Rust mirrored)
- Large untested surface: React sections, `ConfigApp`, FormControls, fields registry completeness, validators, webBackend/tauriBackend, Vercel API routes

## Test Types

**Unit Tests:**
- **TypeScript:** pure lib functions in Node environment via Vitest
- **Rust:** filesystem atomic write, frontmatter parse, backup siblings, channel_id coercion, round-trip preferences

**Integration Tests:**
- Not detected as a separate suite
- Closest equivalent: Rust tests that write real files under `TempDir` and reload

**E2E Tests:**
- Not used (no Playwright/Cypress/Webdriver)

**Component Tests:**
- Not used (no `@testing-library/react` dependency; Vitest environment is `node`, not `jsdom`/`happy-dom`)

## Common Patterns

**Async Testing:**
- Current Vitest suite is synchronous
- For new async pure helpers:
```typescript
it("loads async", async () => {
  await expect(someAsync()).resolves.toMatchObject({ ... });
});
```

**Error Testing:**
```typescript
// Prefer explicit invalid shapes + property assertions (current style)
it("removes invalid channel_id shapes", () => {
  const v = { remote_questions: { channel_id: { bad: true } } };
  normalizeStringyIds(v as Record<string, JsonValue>);
  expect(
    (v.remote_questions as Record<string, unknown>).channel_id,
  ).toBeUndefined();
});

// For throw paths:
it("rejects non-object YAML root", () => {
  expect(() => loadPreferencesFromText("---\n- just\n- a list\n---\n")).toThrow(
    /root must be an object/,
  );
});
```

**Security / share path:**
- Assert redacted output contains `<redacted>` and does not contain the raw secret (`buildShareablePreset` test)
- Keep secret-like strings only in tests, never production fixtures committed as real keys

**Parity with Rust:**
- File header on `preferencesCore.test.ts` states tests mirror Rust unit tests
- When fixing a desktop load/save bug in `core.rs`, add the same scenario to `preferencesCore.test.ts` (and vice versa) so web and desktop stay aligned

## Where to Add New Tests

| Change | Put tests in |
|--------|----------------|
| YAML/frontmatter, redaction, serialize | `src/lib/preferencesCore.test.ts` or new `src/lib/<module>.test.ts` |
| Validators / field rules | Prefer new `src/lib/validators.test.ts` (pure, node) |
| Desktop FS / backup / locks | `#[cfg(test)]` in `src-tauri/src/core.rs` |
| Tauri command wiring | `src-tauri/src/lib.rs` tests or extract pure logic to `core.rs` first |
| React UI | Would require adding jsdom + Testing Library — not established; prefer extracting pure helpers and unit-testing those |
| `api/*.ts` | No harness yet; add a separate node test file only if you extend Vitest `include` |

**Vitest include rule:** new TS tests must match `src/**/*.test.ts` or update `vite.config.ts` `test.include`.

## Anti-Patterns for This Repo

- Do not add browser-environment tests without updating `vite.config.ts` `test.environment` (or using per-file directives) — default is `node`
- Do not rely on Tauri runtime inside Vitest
- Do not test implementation details of Tailwind class strings; assert preference data transforms and validation messages instead
- Do not skip dual-stack parity for load/save rules that exist in both `preferencesCore.ts` and `core.rs`

---

*Testing analysis: 2026-07-21*
