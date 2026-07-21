---
phase: 01-foundation-isolation-theme-bridge
plan: 01
subsystem: ui
tags: [theme, cn, tailwind-merge, clsx, path-alias, vitest, shadcn-foundation]

requires: []
provides:
  - "cn() class merger at src/lib/utils.ts"
  - "@/* path alias (tsconfig + Vite)"
  - "applyTheme dual-write data-theme + .dark class"
  - "Wave 0 unit tests for cn and theme contracts"
affects:
  - 01-02 CSS isolation and semantic tokens
  - 01-03 components.json + Button walking skeleton
  - later web shadcn restyles

tech-stack:
  added: [clsx@^2.1.1, tailwind-merge@^3.6.0]
  patterns:
    - "cn = twMerge(clsx(...)) for Tailwind conflict resolution"
    - "Single theme authority dual-writes GSD data-theme and shadcn .dark"
    - "@/* maps to ./src/* in both tsc and Vite"

key-files:
  created:
    - src/lib/utils.ts
    - src/lib/utils.test.ts
    - src/lib/theme.test.ts
  modified:
    - src/lib/theme.ts
    - tsconfig.json
    - vite.config.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Dual-write in applyTheme only — no next-themes or second ThemeProvider"
  - "Vite ESM __dirname via fileURLToPath(import.meta.url)"
  - "clsx 2.1.1 + tailwind-merge 3.x only this plan (no cva/lucide/shadcn yet)"

patterns-established:
  - "Wave 0 node-env DOM stubs for theme tests without jsdom"
  - "FND-01 split: aliases+cn now; Button/components.json in plan 03"

requirements-completed: [FND-01, THM-02, THM-03]

coverage:
  - id: D1
    description: "cn merges conflicting Tailwind utilities and drops falsy inputs"
    requirement: FND-01
    verification:
      - kind: unit
        ref: src/lib/utils.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: "@/* path alias in tsconfig + Vite resolve.alias"
    requirement: FND-01
    verification:
      - kind: other
        ref: "grep baseUrl/paths tsconfig.json; grep resolve.alias vite.config.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "applyTheme dual-writes data-theme and class dark; storage allowlist preserved"
    requirement: THM-03
    verification:
      - kind: unit
        ref: src/lib/theme.test.ts
        status: pass
    human_judgment: false
  - id: D4
    description: "resolveTheme preserves dark/light and resolves system via matchMedia"
    requirement: THM-02
    verification:
      - kind: unit
        ref: src/lib/theme.test.ts
        status: pass
    human_judgment: false

duration: 1min
completed: 2026-07-21
status: complete
---

# Phase 01 Plan 01: Theme Bridge + cn / @/* Foundation Summary

**Wave 0 TDD delivered green `cn` + `@/*` aliases and dual-write `applyTheme` so Auto/Dark/Light stays single-authority while shadcn `.dark` stays in sync.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-07-21T23:11:29Z
- **Completed:** 2026-07-21T23:12:40Z
- **Tasks:** 3/3
- **Files modified:** 8

## Accomplishments

- Wave 0 RED tests for `cn` merge behavior and theme dual-write / allowlist contracts
- Installed `clsx` + `tailwind-merge`; exported `cn` from `src/lib/utils.ts`
- Wired `@/*` → `./src/*` in both `tsconfig.json` and Vite `resolve.alias`
- Extended `applyTheme` to toggle `classList.dark` while keeping `data-theme` and `gsd-pi-config.theme`
- Full `npm test` green (15 tests: utils, theme, preferencesCore)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 failing tests for cn and theme dual-write** - `59ee0dc` (test)
2. **Task 2: Path aliases + cn util (FND-01 partial)** - `2e97574` (feat)
3. **Task 3: Theme dual-write data-theme + .dark (THM-02, THM-03)** - `5319e27` (feat)

**Plan metadata:** (pending docs commit)

_Note: TDD tasks used RED → GREEN commits as specified._

## Files Created/Modified

- `src/lib/utils.ts` — `export function cn(...inputs: ClassValue[])` via clsx + twMerge
- `src/lib/utils.test.ts` — Wave 0 cn merge / falsy tests
- `src/lib/theme.test.ts` — Wave 0 dual-write, resolveTheme, getStoredTheme tests
- `src/lib/theme.ts` — dual-write `dataset.theme` + `classList.toggle("dark", …)`
- `tsconfig.json` — `baseUrl` + `paths.@/*`
- `vite.config.ts` — `resolve.alias["@"]` → `./src`
- `package.json` / `package-lock.json` — clsx@2.1.1, tailwind-merge@3.6.0

## Decisions Made

- Dual-write only inside existing `applyTheme` so `useTheme` / `bootstrapTheme` pick it up with no API change
- No second storage key, ThemeProvider, or next-themes
- Vite config uses `fileURLToPath(import.meta.url)` for ESM-safe `__dirname` (package is `"type": "module"`)
- Did not add `@platform-css` (Plan 02) or Button/`components.json` (Plan 03)

## Deviations from Plan

None - plan executed exactly as written.

Minor implementation detail (not a scope change): ESM `__dirname` derived via `fileURLToPath` rather than bare `__dirname`, required for correct Vite alias resolution under `"type": "module"`.

## Issues Encountered

None — RED dual-write failures and missing `./utils` import were expected until Tasks 2–3.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can split CSS (`index.web.css` / `index.desktop.css`) and add semantic tokens; theme dual-write already ready for `.dark`
- Plan 03 can add `components.json` + Button importing `@/lib/utils` `cn`
- ThemeToggle visuals intentionally untouched (THM-04 / Phase 2)
- No CSS isolation or shadcn primitives in this plan (by design)

## TDD Gate Compliance

1. RED: `59ee0dc` — `test(01-01): add failing Wave 0 tests for cn and theme dual-write`
2. GREEN (cn/aliases): `2e97574` — `feat(01-01): add cn util and @/* path aliases`
3. GREEN (theme): `5319e27` — `feat(01-01): dual-write theme to data-theme and .dark class`

## Self-Check: PASSED

- FOUND: `src/lib/utils.ts`, `src/lib/utils.test.ts`, `src/lib/theme.test.ts`, `src/lib/theme.ts`, `tsconfig.json`, `vite.config.ts`
- FOUND commits: `59ee0dc`, `2e97574`, `5319e27`
- `npx vitest run src/lib/utils.test.ts src/lib/theme.test.ts` — 9 passed
- `npm test` — 15 passed
- STORAGE_KEY remains `gsd-pi-config.theme`; no next-themes; ThemeToggle not modified

---
*Phase: 01-foundation-isolation-theme-bridge*
*Completed: 2026-07-21*
