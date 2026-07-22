---
phase: 04-form-kit-adapters-editor-chrome
plan: 05
subsystem: testing
tags: [phase04, forms, isolation, dual-build, frm-01, frm-02, frm-03, frm-04, web-04, contracts]

requires:
  - phase: 04-form-kit-adapters-editor-chrome
    provides: "FormControls Mist Sky adapters + ModelPicker/ModelChain (Plans 01–03)"
  - phase: 04-form-kit-adapters-editor-chrome
    provides: "Sidebar + ConfigApp web editor chrome Button shell (Plan 04)"
provides:
  - "phase04.forms.test.ts source contracts locking FRM-01–04 + WEB-04"
  - "foundation.isolation bridge expectation aligned with web Button shell (locked Q2)"
  - "Dual-build gate green (build:web + build)"
  - "preferencesCore redaction suite still green"
affects:
  - Phase 5 residual library btn purge
  - verify-work / CI regression gates

tech-stack:
  added: []
  patterns:
    - "Source-level readFileSync contracts (phase02/03 pattern) for form kit + shell"
    - "Web isolation no longer requires .gsd-btn* after toolbar Button migration"
    - "Residual library .gsd-btn CSS tolerated until Phase 5 full purge"

key-files:
  created: []
  modified:
    - src/lib/phase04.forms.test.ts
    - src/lib/foundation.isolation.test.ts

key-decisions:
  - "Leave residual web .gsd-btn* CSS for ApiKeys/Skills/Agents/CustomProviders library chrome (Phase 5)"
  - "Do not require ConfigApp to drop desktop uiClasses btn imports — assert web Button path + enablement predicates"
  - "Desktop form tag chrome and role=switch/native select markers remain locked (Q4)"

patterns-established:
  - "phase04.forms.test.ts is the FRM/WEB regression lock for FormControls + ConfigApp + Sidebar"
  - "Bridge CSS may remain present without being required for Phase 4 success"

requirements-completed: [FRM-01, FRM-02, FRM-03, FRM-04, WEB-04]

coverage:
  - id: D1
    description: "phase04.forms.test.ts locks FormControls exports, Field attrs, web ui primitives, no multi listbox, ModelPicker sentinel, ModelChain filter(Boolean), TextField String(value), desktop legacy markers"
    requirement: FRM-01
    verification:
      - kind: unit
        ref: "src/lib/phase04.forms.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "ModelPicker CUSTOM_SENTINEL/provider-model-id + ModelChain filter(Boolean)/+ Add fallback locked"
    requirement: FRM-03
    verification:
      - kind: unit
        ref: "src/lib/phase04.forms.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "ConfigApp useDirty/webWorkspaceReady/anyDirty + Button import/Download path locked (FRM-04/WEB-04)"
    requirement: FRM-04
    verification:
      - kind: unit
        ref: "src/lib/phase04.forms.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Sidebar left-edge primary active + Unsaved changes dirty aria locked"
    requirement: WEB-04
    verification:
      - kind: unit
        ref: "src/lib/phase04.forms.test.ts"
        status: pass
    human_judgment: false
  - id: D5
    description: "foundation.isolation no longer requires web .gsd-btn*; FND-03 Phase 4 primitives + dump forbid still enforced; dual builds green"
    requirement: WEB-04
    verification:
      - kind: unit
        ref: "src/lib/foundation.isolation.test.ts"
        status: pass
      - kind: other
        ref: "npm run build:web && npm run build"
        status: pass
    human_judgment: false
  - id: D6
    description: "preferencesCore redaction/scan tests remain green"
    requirement: FRM-02
    verification:
      - kind: unit
        ref: "src/lib/preferencesCore.test.ts"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-22
status: complete
---

# Phase 4 Plan 05: Phase04 Contracts + Dual Builds + Bridge Cleanup Summary

**Automated FRM-01–04/WEB-04 source contracts + isolation bridge realignment after Button shell; dual builds green; residual library `.gsd-btn` CSS deferred to Phase 5**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-22T18:39:18Z
- **Completed:** 2026-07-22T18:42:00Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Expanded `phase04.forms.test.ts` to 42 source contracts covering FormControls kit, ModelPicker/ModelChain, ConfigApp enablement + Button chrome, Sidebar left-edge dirty language
- Updated `foundation.isolation.test.ts` so Phase 4 success no longer depends on web `.gsd-btn*` presence (locked RESEARCH Q2)
- Full suite 164 tests green; `npm run build:web && npm run build` green
- Left residual web `.gsd-btn*` CSS for library sections (ApiKeys/Skills/Agents/CustomProviders) — Phase 5 purge

## Task Commits

Each task was committed atomically:

1. **Task 1: phase04.forms source contracts (FRM-01–04, WEB-04)** - `3af5463` (test)
2. **Task 2: Isolation bridge update + dual builds** - `a8fede1` (test)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/lib/phase04.forms.test.ts` - FRM-01–04 + WEB-04 source contracts (FormControls + ConfigApp + Sidebar)
- `src/lib/foundation.isolation.test.ts` - Drop web `.gsd-btn*` success requirement; keep Mist Sky token asserts + FND-03

## Decisions Made

- **Residual web btn CSS kept:** Library sections still import `btn`/`btnPrimary` from uiClasses; removing CSS would visually break those surfaces. Documented for Phase 5 full purge (locked Q2).
- **Desktop btn imports OK on ConfigApp:** Contracts assert web Button path + enablement predicates, not total removal of uiClasses on dual-platform ConfigApp.
- **No product code changes:** Plans 01–04 already delivered adapters/shell; this plan only locks and gates.

## Deviations from Plan

None - plan executed exactly as written.

Optional `index.web.css` `.gsd-btn*` retirement was evaluated and intentionally skipped because residual library product surfaces still need the bridge classes.

## Known Stubs

None.

## Threat Flags

None - no new network endpoints, auth paths, file access patterns, or schema changes. Source contracts only; preferencesCore redaction path untouched.

## Self-Check: PASSED

- FOUND: `src/lib/phase04.forms.test.ts`
- FOUND: `src/lib/foundation.isolation.test.ts`
- FOUND commit: `3af5463`
- FOUND commit: `a8fede1`
- Dual builds: pass
- Full suite: 164/164 pass
