---
phase: 05-hardening-polish-gates
plan: 03
subsystem: ui
tags: [shadcn, button-bridge, residual-purge, isolation, source-contracts]

requires:
  - phase: 05-hardening-polish-gates
    provides: Residual web sections on Button + semantic tokens (05-01, 05-02)
provides:
  - phase05.residual.test.ts locking residual section btn import bans + CSS dual-entry
  - Web index.web.css free of .gsd-btn family rules (D-02)
  - foundation.isolation post-purge asserts (web absent / desktop present)
affects:
  - 05-04 (smoke/UAT + dual builds on clean residual contracts)
  - ISO-05 residual cohesion / ISO-01 desktop isolation hold

tech-stack:
  added: []
  patterns:
    - residual web contracts via readFileSync source asserts (phase02 pattern)
    - ordered CSS purge: grep zero callers → delete web only → isolation flip
    - comments must not reintroduce \.gsd-btn selector form after purge

key-files:
  created:
    - src/lib/phase05.residual.test.ts
  modified:
    - src/index.web.css
    - src/lib/foundation.isolation.test.ts

key-decisions:
  - "ConfigApp uiClasses imports remain allowed (desktop); residual tests scope CustomProviders/ApiKeys + CSS only"
  - "nav-item/choice-btn CSS kept on web (Sidebar still emits them); only button-bridge family deleted"
  - "Reword header comments to avoid literal .gsd-btn so source contracts stay green"

patterns-established:
  - "phase05.residual: forbid btn/btnPrimary/btnDanger/btnSegment/btnSegmentActive on residual web sections"
  - "D-02 dual assert: webCss not toMatch /\\.gsd-btn\\b/ ; desktopCss contains .gsd-btn"
  - "WEB_HIDDEN freeze: exactly skills-library + agents-library"

requirements-completed: [ISO-05, ISO-02]

coverage:
  - id: D1
    description: phase05.residual source contracts ban residual btn imports, freeze WEB_HIDDEN, dual CSS assert
    requirement: ISO-05
    verification:
      - kind: unit
        ref: "npx vitest run src/lib/phase05.residual.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: Web button-bridge CSS deleted after zero callers; desktop CSS untouched; field-focus retained
    requirement: ISO-05
    verification:
      - kind: other
        ref: "rg no \\.gsd-btn\\b on index.web.css; present on index.desktop.css; gsd-field-focus retained"
        status: pass
      - kind: unit
        ref: "npx vitest run src/lib/foundation.isolation.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: preferencesCore + full unit suite green (ISO-02 regression bar)
    requirement: ISO-02
    verification:
      - kind: unit
        ref: "npm test (173 tests)"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-23
status: complete
---

# Phase 5 Plan 03: Residual Contracts + Web Button-Bridge CSS Purge Summary

**Locked residual web purge with source contracts and deleted dead `.gsd-btn*` bridge rules from web CSS only while desktop isolation and field-focus remain.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-23T00:25:22Z
- **Completed:** 2026-07-23T00:28:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `phase05.residual.test.ts` forbidding uiClasses btn symbols on CustomProviders/ApiKeys, dual CSS entry asserts, and WEB_HIDDEN freeze
- TDD RED on web CSS absence until purge; GREEN after deleting button-bridge rules from `index.web.css`
- Updated `foundation.isolation` to require web free of button-bridge selectors (no Phase 4 residual tolerance)
- Full unit suite green (173) including preferencesCore (ISO-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add phase05.residual.test.ts source contracts** - `7151ebd` (test)
2. **Task 2: Grep gate → delete web button-bridge CSS → update foundation.isolation** - `a8afea0` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/lib/phase05.residual.test.ts` — residual section import bans, CSS dual-entry, WEB_HIDDEN freeze, ConfigApp desktop allow
- `src/index.web.css` — removed `.gsd-btn` / primary / segment family + reduced-motion orphan; kept field-focus + `--color-gsd-*` + nav/choice chrome
- `src/lib/foundation.isolation.test.ts` — post-purge web absence assert + field-focus keep

## Decisions Made

- Scoped residual import bans to CustomProviders + ApiKeys only; ConfigApp and Skills/Agents libraries intentionally exempt
- Left `.gsd-nav-item` / `.gsd-choice-btn` on web CSS because Sidebar still emits those class strings
- Avoided literal `.gsd-btn` in web CSS comments so `/\.gsd-btn\b/` contracts do not false-fail

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — CSS presentation purge only; no new network/auth/file surfaces. Grep gate satisfied before delete (T-05-08).

## Self-Check: PASSED

- FOUND: `src/lib/phase05.residual.test.ts`
- FOUND: `src/index.web.css` free of `\.gsd-btn` selectors
- FOUND: `src/index.desktop.css` still contains `.gsd-btn`
- FOUND: `gsd-field-focus` retained on web
- FOUND: commits `7151ebd`, `a8afea0`
- FOUND: npm test 173 passed
