---
phase: 01-foundation-isolation-theme-bridge
plan: 02
subsystem: ui
tags: [css, platform-isolation, shadcn, tailwind, theme-tokens, oklch, vite-alias]

requires:
  - phase: 01-foundation-isolation-theme-bridge
    provides: "Plan 01 @ path alias, cn(), dual-write theme (.dark + data-theme)"
provides:
  - "Platform CSS split via FOUC-safe @platform-css Vite alias"
  - "Web neutral OKLCH semantic tokens + @custom-variant dark"
  - "Desktop legacy gsd-* CSS isolation (no shadcn/tw-animate)"
  - "Static isolation unit tests (foundation.isolation.test.ts)"
affects:
  - 01-03 (components.json + Button; may add shadcn/tailwind.css import)
  - phase-02 web chrome restyle

tech-stack:
  added:
    - tw-animate-css@^1.4.0
  patterns:
    - "@platform-css Vite alias gated by isWeb (static import, no dual CSS)"
    - "Official shadcn neutral OKLCH :root/.dark + @theme inline bindings"
    - "Static fs-based isolation tests for platform CSS contracts"

key-files:
  created:
    - src/index.web.css
    - src/index.desktop.css
    - src/lib/foundation.isolation.test.ts
  modified:
    - src/main.tsx
    - vite.config.ts
    - src/vite-env.d.ts
    - tsconfig.json
    - src/lib/theme.test.ts
    - package.json
    - package-lock.json
  deleted:
    - src/index.css

key-decisions:
  - "Prefer @platform-css static alias over async CSS import (FOUC-safe)"
  - "Delete shared index.css after split — no dual-loading shim"
  - "Defer @import shadcn/tailwind.css to Plan 03 until shadcn package legitimacy gate"
  - "Clean neutral OKLCH primary — no GSD cyan mapped into --primary"
  - "Silence TS 6 baseUrl deprecation via ignoreDeprecations so dual builds pass"

patterns-established:
  - "Platform CSS: main imports @platform-css; Vite resolve.alias points web or desktop file"
  - "Isolation gate: foundation.isolation.test.ts reads CSS files and asserts token/import contracts"
  - "Web tokens: @custom-variant dark (&:is(.dark *)) + dual-write .dark from Plan 01 theme"

requirements-completed: [FND-04, THM-01, ISO-01]

coverage:
  - id: D1
    description: "Web CSS entry exposes shadcn semantic tokens (background, foreground, primary, muted, destructive, border, ring, …) via official neutral OKLCH scaffold"
    requirement: THM-01
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#defines required semantic token names as CSS custom properties
        status: pass
      - kind: other
        ref: npm run build:web
        status: pass
    human_judgment: false
  - id: D2
    description: "Desktop CSS remains legacy gsd-* with no shadcn/tailwind or tw-animate imports"
    requirement: ISO-01
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#does not import shadcn/tailwind or tw-animate-css
        status: pass
      - kind: other
        ref: npm run build
        status: pass
    human_judgment: false
  - id: D3
    description: "Platform CSS selected by build mode via FOUC-safe @platform-css static import"
    requirement: FND-04
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts
        status: pass
      - kind: other
        ref: "npm run build:web && npm run build (web CSS ~34kB has --background; desktop ~45kB has --gsd-bg)"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-21
status: complete
---

# Phase 1 Plan 2: Platform CSS Split + Semantic Tokens Summary

**FOUC-safe `@platform-css` alias loads web-only neutral OKLCH shadcn tokens while desktop keeps byte-stable legacy gsd-* CSS, enforced by static isolation tests and dual production builds.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-07-21T23:14:25Z
- **Completed:** 2026-07-21T23:18:00Z
- **Tasks:** 2/2
- **Files modified:** 10 (+1 deleted)

## Accomplishments

- Split CSS into `src/index.web.css` (shadcn tokens) and `src/index.desktop.css` (legacy gsd-*)
- Wired Vite `@platform-css` alias + static `main.tsx` import (FOUC-safe, no dual CSS)
- Installed `tw-animate-css@^1.4.0`; official neutral OKLCH `:root`/`.dark` + `@theme inline` + `@custom-variant dark`
- Isolation unit tests gate THM-01 tokens and ISO-01 desktop cleanliness
- Both `npm run build:web` and `npm run build` green; full suite 25 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Platform CSS split + @platform-css bootstrap wiring** - `a3cf254` (feat)
2. **Task 2 RED: Isolation static tests** - `f534d3c` (test)
3. **Task 2 GREEN: Web semantic tokens + tw-animate** - `a109d72` (feat)

**Plan metadata:** _(pending final docs commit)_

_Note: TDD Task 2 used RED → GREEN commit pair._

## Files Created/Modified

- `src/index.web.css` — Web Tailwind + tw-animate + neutral OKLCH tokens + dark variant + base layer
- `src/index.desktop.css` — Byte-stable legacy gsd-* styles (renamed from index.css)
- `src/index.css` — **Deleted** (retired shared entry to prevent dual CSS)
- `src/main.tsx` — `import "@platform-css"` before migrate + bootstrapTheme
- `vite.config.ts` — `@platform-css` alias branches on `isWeb`
- `src/vite-env.d.ts` — ambient `declare module "@platform-css"`
- `src/lib/foundation.isolation.test.ts` — static THM-01 / ISO-01 gates
- `tsconfig.json` — `ignoreDeprecations: "6.0"` for TS6 baseUrl
- `src/lib/theme.test.ts` — cast fix for globalThis window stub under tsc
- `package.json` / `package-lock.json` — `tw-animate-css` dependency

## Decisions Made

1. **Static `@platform-css` alias** over dynamic/async CSS import — RESEARCH preferred pattern; FOUC-safe with bootstrapTheme order preserved.
2. **Delete `index.css`** rather than shim — no consumer dual-loads platforms.
3. **Defer `shadcn/tailwind.css` import to Plan 03** — package not installed yet; tokens compile with tailwind + tw-animate alone.
4. **Official neutral OKLCH scaffold** — no cyan primary override; `--radius: 0.625rem` per UI-SPEC.
5. **No legacy form tag selectors on web** — Pitfall 4 isolation (desktop retains `input[type=…]` / `select` / `textarea` chrome).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TS 6 baseUrl deprecation failed both builds**
- **Found during:** Task 1 verification (`npx tsc --noEmit`)
- **Issue:** Plan 01 added `baseUrl` for path aliases; TypeScript 6 emits TS5101 and exits non-zero, so `npm run build` / `build:web` could not pass.
- **Fix:** Set `"ignoreDeprecations": "6.0"` in `tsconfig.json`.
- **Files modified:** `tsconfig.json`
- **Verification:** `tsc --noEmit` then dual builds exit 0
- **Committed in:** `a3cf254`

**2. [Rule 1 - Bug] theme.test.ts globalThis cast failed under tsc**
- **Found during:** Task 1 verification after baseUrl silence unblocked further tsc checks
- **Issue:** Direct cast of `globalThis` to window stub type is invalid under stricter overlap checks.
- **Fix:** Cast via `unknown` first.
- **Files modified:** `src/lib/theme.test.ts`
- **Verification:** `tsc --noEmit` green
- **Committed in:** `a3cf254`

**3. [Rule 2 - Missing critical] Node types for isolation test fs imports**
- **Found during:** Task 2 GREEN (`tsc` during `build:web`)
- **Issue:** `node:fs` / `node:path` / `node:url` imports failed tsc without node type visibility in `src/` compilation.
- **Fix:** `/// <reference types="node" />` at top of isolation test file.
- **Files modified:** `src/lib/foundation.isolation.test.ts`
- **Verification:** `tsc` + vitest green
- **Committed in:** `a109d72`

## Auth Gates

None.

## Known Stubs

None that block plan goals. Intentional deferral:

- `@import "shadcn/tailwind.css"` not present — Plan 03 installs `shadcn` package and may add the import (documented in web CSS header).

## TDD Gate Compliance

- RED: `f534d3c` — `test(01-02): add failing isolation tests for web tokens`
- GREEN: `a109d72` — `feat(01-02): web neutral OKLCH tokens + isolation tests green`
- REFACTOR: not needed

## Threat Flags

None new beyond plan register. Mitigations applied:

| Threat | Mitigation delivered |
|--------|----------------------|
| T-01-04 Desktop CSS pollution | Byte-move + isolation tests forbid shadcn/tw-animate on desktop |
| T-01-05 Web CSS imports | Only tailwindcss + tw-animate-css; no third-party registry URLs |
| T-01-07 FOUC / broken load | Static `@platform-css` import; bootstrapTheme order preserved |
| T-01-SC tw-animate legitimacy | Installed official `tw-animate-css@^1.4.0` from npm |

## UI Considerations

- Isolation boundary covered: desktop does not load shadcn tokens; web has dark/light token surfaces
- Empty/loading/error product surfaces remain N/A this phase (WEB-07 deferred)
- Existing web chrome still uses legacy `gsd-*` class names — visual restyle is Phase 2; foundation tokens ready for Button (Plan 03)

## Self-Check: PASSED

- FOUND: `src/index.web.css` (`--background`, `@custom-variant dark`, `tw-animate-css`)
- FOUND: `src/index.desktop.css` (`--gsd-bg`, `.gsd-btn`, no shadcn/tw-animate)
- FOUND: `src/main.tsx` imports `@platform-css`
- FOUND: `vite.config.ts` `@platform-css` alias
- FOUND: `src/lib/foundation.isolation.test.ts` (10/10 pass)
- FOUND commits: `a3cf254`, `f534d3c`, `a109d72`
- Dual builds exit 0; full unit suite 25/25 pass
