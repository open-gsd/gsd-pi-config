---
phase: 04-form-kit-adapters-editor-chrome
plan: 01
subsystem: ui
tags: [shadcn, base-ui, switch, select, checkbox, popover, fnd-03, mist-sky, form-kit]

requires:
  - phase: 03-modals-palette-overlays
    provides: "Dialog/Command/input-group primitives + FND-03 Phase 3 allowlist pattern"
  - phase: 01-foundation-design-system
    provides: "base-nova components.json, @base-ui/react, Button/Input Mist Sky overrides"
provides:
  - "Official base-nova Switch, Select, Checkbox, Popover under src/components/ui"
  - "FND-03 Phase 4 allowlist requiring form kit + forbidding card/sheet dump"
  - "Import-only proofs for all four form primitives"
affects:
  - 04-form-kit-adapters-editor-chrome
  - FormControls web adapters (Plans 02–03)
  - editor chrome shell (Plans 04–05)

tech-stack:
  added: []
  patterns:
    - "shadcn@4.13.1 base-nova CLI install then immediate Mist Sky class overrides"
    - "FND-03 RED allowlist expand before GREEN install (select/popover forbid → require)"
    - "Import-only *.import.test.ts for Base UI + rounded-none locks"

key-files:
  created:
    - src/components/ui/switch.tsx
    - src/components/ui/select.tsx
    - src/components/ui/checkbox.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/switch.import.test.ts
    - src/components/ui/select.import.test.ts
    - src/components/ui/checkbox.import.test.ts
    - src/components/ui/popover.import.test.ts
  modified:
    - src/lib/foundation.isolation.test.ts

key-decisions:
  - "Install only switch/select/checkbox/popover via pinned shadcn@4.13.1; no Alert/Card/Sheet dump"
  - "Select trigger min-h-10 + rounded-none; Popover/Checkbox linear; Switch capsule h-5 w-9 sole non-square exception"
  - "No new runtime deps — reuse existing @base-ui/react@1.6.0"
  - "Leave .gsd-btn bridge expectation intact until Plan 04/05 shell migration"

patterns-established:
  - "Phase 4 FND-03: REQUIRED_PHASE4 + FORBIDDEN_DUMP without select/popover"
  - "Form primitive import tests assert @base-ui/react/* and Mist Sky class locks"

requirements-completed: [FRM-01]

coverage:
  - id: D1
    description: "FND-03 allowlist requires switch/select/checkbox/popover and forbids card/sheet/drawer/alert-dialog dump"
    requirement: FRM-01
    verification:
      - kind: unit
        ref: "src/lib/foundation.isolation.test.ts#requires Phase 3/4 primitives and does not dump card/sheet peers"
        status: pass
    human_judgment: false
  - id: D2
    description: "Official base-nova Switch/Select/Checkbox/Popover primitives installed with Base UI only"
    requirement: FRM-01
    verification:
      - kind: unit
        ref: "src/components/ui/switch.import.test.ts#uses Base UI Switch only"
        status: pass
      - kind: unit
        ref: "src/components/ui/select.import.test.ts#uses Base UI Select only"
        status: pass
      - kind: unit
        ref: "src/components/ui/checkbox.import.test.ts#uses Base UI Checkbox only"
        status: pass
      - kind: unit
        ref: "src/components/ui/popover.import.test.ts#uses Base UI Popover only"
        status: pass
    human_judgment: false
  - id: D3
    description: "Mist Sky linear overrides on Select/Popover/Checkbox; Switch capsule h-5 w-9 exception"
    requirement: FRM-01
    verification:
      - kind: unit
        ref: "src/components/ui/select.import.test.ts#locks Mist Sky linear Select defaults"
        status: pass
      - kind: unit
        ref: "src/components/ui/popover.import.test.ts#locks Mist Sky flat linear Popover"
        status: pass
      - kind: unit
        ref: "src/components/ui/checkbox.import.test.ts#locks Mist Sky square checkbox chrome"
        status: pass
      - kind: unit
        ref: "src/components/ui/switch.import.test.ts#locks Mist Sky capsule size"
        status: pass
    human_judgment: false

duration: 2min
completed: 2026-07-22
status: complete
---

# Phase 4 Plan 01: Form Kit Primitives Summary

**Official base-nova Switch/Select/Checkbox/Popover via shadcn@4.13.1 with Mist Sky linear overrides and expanded FND-03 allowlist**

## Performance

- **Duration:** 2 min
- **Started:** 2026-07-22T18:20:39Z
- **Completed:** 2026-07-22T18:22:50Z
- **Tasks:** 2/2
- **Files modified:** 9

## Accomplishments

- Expanded FND-03 allowlist and required-presence for Phase 4 form primitives (RED until install)
- Flipped Phase 3 forbid of `select`/`popover` → required; dump peers (card/sheet/drawer/alert-dialog/sonner/tooltip) still forbidden
- Installed four official base-nova primitives with Base UI only — no new npm runtime deps
- Applied Mist Sky overrides: Select/Popover/Checkbox `rounded-none`, Select trigger `min-h-10`, Switch capsule `h-5 w-9`
- Import-only tests green for all four; full `npm test` 122/122 pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand FND-03 allowlist for Switch/Select/Checkbox/Popover** - `f4bded1` (test)
2. **Task 2: Install four form primitives via pinned CLI + Mist Sky overrides + import tests** - `9bf9a3c` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/lib/foundation.isolation.test.ts` - Phase 4 UI_ALLOWLIST, REQUIRED_PHASE4, FORBIDDEN_DUMP flip
- `src/components/ui/switch.tsx` - Base UI Switch with h-5 w-9 capsule
- `src/components/ui/select.tsx` - Base UI Select compound; linear trigger/content/item
- `src/components/ui/checkbox.tsx` - Base UI Checkbox; square rounded-none
- `src/components/ui/popover.tsx` - Base UI Popover; flat rounded-none panel
- `src/components/ui/switch.import.test.ts` - Import + Base UI + size locks
- `src/components/ui/select.import.test.ts` - Import + Base UI + min-h-10/rounded-none locks
- `src/components/ui/checkbox.import.test.ts` - Import + Base UI + square chrome locks
- `src/components/ui/popover.import.test.ts` - Import + Base UI + flat linear locks

## Decisions Made

- Official `npx shadcn@4.13.1 add switch select checkbox popover -y` only — no Alert/Card/Sheet dump
- Mist Sky post-install overrides mirror Button/Input language (min-h-10, rounded-none); Switch keeps capsule as sole non-square exception at h-5 w-9
- Zero new runtime packages; `@base-ui/react@1.6.0` already present
- Web `.gsd-btn` bridge expectation left intact for Plans 04/05

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FRM-01 primitives ready for FormControls web adapters (Plans 02–03)
- Editor chrome (Plans 04–05) can consume Button + form kit without further registry installs
- Do not restyle FormControls/ConfigApp in this plan — deferred to later Phase 4 plans

## TDD Gate Compliance

- RED: `f4bded1` test(04-01) expand FND-03 allowlist (failed on missing switch.tsx)
- GREEN: `9bf9a3c` feat(04-01) install primitives + import tests (isolation + full suite green)

## Self-Check: PASSED

- All created primitive + import test files present
- Commits `f4bded1` and `9bf9a3c` present in git log
- No card/sheet/drawer/alert-dialog under `src/components/ui`

---
*Phase: 04-form-kit-adapters-editor-chrome*
*Completed: 2026-07-22*
