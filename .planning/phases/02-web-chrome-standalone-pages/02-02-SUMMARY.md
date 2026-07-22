---
phase: 02-web-chrome-standalone-pages
plan: 02
subsystem: ui
tags: [shadcn, input, textarea, button, base-ui, fnd-03, linear, web-06]

requires:
  - phase: 02-web-chrome-standalone-pages
    provides: "Mist Sky tokens, --radius: 0, non-cyan bridge (Plan 01)"
  - phase: 01-foundation-isolation-theme-bridge
    provides: "components.json base-nova, Button skeleton, cn, @base-ui/react peer"
provides:
  - "Official shadcn Input + Textarea under src/components/ui (Base UI only)"
  - "FND-03 allowlist expanded for input/textarea; card/dialog/select/command still forbidden"
  - "Linear Button language: rounded-none, ≥40px default, soft destructive, primary-hover"
  - "Import-only proofs for Button, Input, Textarea"
affects:
  - 02-web-chrome-standalone-pages (plans 03–04 shell/pages mount primitives)
  - Phase 3 overlays
  - Phase 4 FormControls kit

tech-stack:
  added: []
  patterns:
    - "Pinned npx shadcn@4.13.1 add for official Base UI primitives only"
    - "Linear overrides post-CLI: rounded-none + min-h-10 on Input/Button"
    - "Import-only vitest proofs (no jsdom) for ui primitives"
    - "FND-03 allowlist grows with each approved primitive wave"

key-files:
  created:
    - src/components/ui/input.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/input.import.test.ts
    - src/components/ui/textarea.import.test.ts
  modified:
    - src/components/ui/button.tsx
    - src/components/ui/button.import.test.ts
    - src/lib/foundation.isolation.test.ts

key-decisions:
  - "Install only Input + Textarea via pinned CLI 4.13.1; skip Label (plain HTML later)"
  - "Input h-10/min-h-10 + rounded-none; Textarea rounded-none (min-h-16 content)"
  - "Button default/sm ≥40px; hover via --primary-hover; soft destructive retained"
  - "No product route mounts this plan — Plans 03–04 consume primitives"

patterns-established:
  - "Expand FND-03 allowlist in same wave as shadcn add (Pitfall 3)"
  - "Override registry rounded-lg/h-8 immediately after CLI for linear grammar"
  - "buttonVariants remains the single Link/a styling path for WEB-06"

requirements-completed: [WEB-06, WEB-03]

coverage:
  - id: D1
    description: "Official shadcn Input and Textarea exist under src/components/ui (Base UI, no Radix)"
    requirement: WEB-03
    verification:
      - kind: unit
        ref: "src/components/ui/input.import.test.ts"
        status: pass
      - kind: unit
        ref: "src/components/ui/textarea.import.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "FND-03 allowlist accepts button/input/textarea; forbids card/dialog/select/command dump"
    requirement: WEB-06
    verification:
      - kind: unit
        ref: "src/lib/foundation.isolation.test.ts#ui primitive allowlist (FND-03)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Button linear language: rounded-none, ≥40px default, soft destructive"
    requirement: WEB-06
    verification:
      - kind: unit
        ref: "src/components/ui/button.import.test.ts#locks linear default language"
        status: pass
      - kind: unit
        ref: "src/components/ui/button.import.test.ts#keeps destructive soft"
        status: pass
    human_judgment: false
  - id: D4
    description: "No product page mounts Input/Textarea/Button yet (deferred to Plans 03–04)"
    requirement: WEB-06
    verification:
      - kind: other
        ref: "rg product imports of @/components/ui/button — none"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-22
status: complete
---

# Phase 02 Plan 02: Input/Textarea + Linear Button Language Summary

**Pinned shadcn Input/Textarea installed under FND-03 with import proofs, and Button locked to linear radius-0 ≥40px soft-danger language for shell/page waves.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-22T01:07:28Z
- **Completed:** 2026-07-22T01:09:56Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Expanded FND-03 `UI_ALLOWLIST` for `input`/`textarea` (+ import tests); dump forbid list still blocks `card`/`dialog`/`select`/`command`
- Installed official Base UI Input + native Textarea via `npx shadcn@4.13.1 add input textarea -y` (no Radix, no registry dump)
- Applied linear overrides: Input `h-10 min-h-10 rounded-none`; Textarea `rounded-none`
- Locked Button language: `rounded-none`, default/sm ≥40px, primary hover via `--primary-hover`, soft destructive wash retained
- Import-only tests green for Button, Input, Textarea; full `npm test` 44/44

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Expand FND-03 allowlist + Input/Textarea import tests** - `c2daea7` (test)
2. **Task 1 GREEN: Add shadcn Input/Textarea with linear overrides** - `9376723` (feat)
3. **Task 2 RED: Assert Button linear radius and 40px hit target** - `5ba41aa` (test)
4. **Task 2 GREEN: Lock linear Button language for Phase 2** - `a3d49c3` (feat)

**Plan metadata:** `ba37607` (docs: complete plan)

_Note: TDD tasks used RED (test) → GREEN (feat) commits_

## Files Created/Modified

- `src/components/ui/input.tsx` — Base UI Input primitive (linear height/radius)
- `src/components/ui/textarea.tsx` — native Textarea primitive (linear radius)
- `src/components/ui/input.import.test.ts` — import-only + no-Radix source proof
- `src/components/ui/textarea.import.test.ts` — import-only + no-Radix source proof
- `src/components/ui/button.tsx` — linear CVA overrides (radius, hit target, primary-hover)
- `src/components/ui/button.import.test.ts` — linear language + soft destructive asserts
- `src/lib/foundation.isolation.test.ts` — FND-03 allowlist expansion

## Decisions Made

- Skipped Label primitive — plain HTML labels preferred per RESEARCH for wizard later
- No new npm package names; CLI wrote owned source only; `@base-ui/react` peer already present
- Left product routes on `uiClasses` until Plans 03–04 (D-08 prep only)
- Did not commit `pnpm-lock.yaml` / `pnpm-workspace.yaml` (unrelated untracked noise)

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

1. RED: `test(02-02): expand FND-03 allowlist + Input/Textarea import tests` (`c2daea7`)
2. GREEN: `feat(02-02): add shadcn Input/Textarea with linear overrides` (`9376723`)
3. RED: `test(02-02): assert Button linear radius and 40px hit target` (`5ba41aa`)
4. GREEN: `feat(02-02): lock linear Button language for Phase 2` (`a3d49c3`)

## Known Stubs

None — primitives ready; product mount intentionally deferred to later plans.

## Threat Flags

None — presentation primitives only; no new network, auth, or secret surfaces. CLI pin 4.13.1 + no `@radix-ui` + FND-03 dump forbid mitigate T-02-04/05/SC.

## Verification Results

- `npx vitest run` isolation + button/input/textarea import tests — pass
- `npm test` — 44/44 pass
- Grep: no `@radix-ui/` in component sources; `rounded-none` + `h-10`/`min-h-10` on Button; product pages do not import Button yet
- `components.json` unchanged (base-nova / web CSS path locked)

## Self-Check: PASSED

- FOUND: `src/components/ui/input.tsx`
- FOUND: `src/components/ui/textarea.tsx`
- FOUND: `src/components/ui/button.tsx`
- FOUND: `src/components/ui/input.import.test.ts`
- FOUND: `src/components/ui/textarea.import.test.ts`
- FOUND: `src/components/ui/button.import.test.ts`
- FOUND: `src/lib/foundation.isolation.test.ts`
- FOUND: commit `c2daea7`
- FOUND: commit `9376723`
- FOUND: commit `5ba41aa`
- FOUND: commit `a3d49c3`
