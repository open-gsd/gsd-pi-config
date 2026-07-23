---
phase: 05-hardening-polish-gates
plan: 01
subsystem: ui
tags: [shadcn, button, input, semantic-tokens, residual-purge, a11y, mist-sky]

requires:
  - phase: 04-form-kit-adapters-editor-chrome
    provides: Button size sm min-h-10, Input, soft destructive variant, Mist Sky web tokens
provides:
  - CustomProvidersSection on Button + semantic tokens (no uiClasses btn language)
  - ApiKeysSection on Button + Input + soft-danger banner (no bannerDanger)
  - Residual web CTAs ≥40px hit targets on provider/key actions
affects:
  - 05-02 (Skills/Agents libraries / broader residual sweep)
  - 05-03 (web .gsd-btn CSS purge after zero callers)
  - ISO-05 residual cohesion / WEB-06 completion

tech-stack:
  added: []
  patterns:
    - residual CTAs use Button size sm (min-h-10) not uiClasses btn*
    - soft destructive = outline + border-destructive/40 text-destructive hover:bg-destructive/10
    - quiet soft-danger role=alert banners replace bannerDanger
    - residual cards/panels radius 0 (rounded-none)

key-files:
  created: []
  modified:
    - src/components/sections/CustomProvidersSection.tsx
    - src/components/sections/ApiKeysSection.tsx

key-decisions:
  - "Soft destructive via outline + destructive tint (not Button destructive solid wash) for Delete/Remove/Clear to match UI-SPEC soft outline language"
  - "ApiKeys search and edit fields use shadcn Input; provider free-text stays native inputs under FormControls styling"
  - "Success/Installed badges use quiet muted border wash — not neon success greens or logo cyan"

patterns-established:
  - "Residual Button language: default=primary CTA, outline=secondary, outline+destructive tint=destructive"
  - "Error banner: role=alert + border-destructive/30 bg-destructive/10 text-destructive text-xs rounded-none + Dismiss outline Button"
  - "Export success: border-primary/30 bg-primary/10 text-primary (Mist Sky primary, not gsd-accent cyan)"

requirements-completed: [ISO-05, ISO-04]

coverage:
  - id: D1
    description: CustomProvidersSection residual CTAs use shadcn Button with min-h ≥40px; no uiClasses btn imports; semantic tokens only
    requirement: ISO-05
    verification:
      - kind: unit
        ref: "npx vitest run src/lib/preferencesCore.test.ts"
        status: pass
      - kind: other
        ref: "rg no uiClasses/btn*/gsd-* color utilities; Button present"
        status: pass
    human_judgment: false
  - id: D2
    description: ApiKeysSection residual CTAs use Button + Input + soft-danger role=alert; ≥40px actions; domain key handlers intact
    requirement: ISO-04
    verification:
      - kind: unit
        ref: "npx vitest run src/lib/preferencesCore.test.ts"
        status: pass
      - kind: other
        ref: "rg no bannerDanger/btn*/text-[9-11px]; role=alert; exportEnv/clearKey/setKey/confirm present"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-23
status: complete
---

# Phase 5 Plan 01: Residual CustomProviders + ApiKeys Button Purge Summary

**CustomProviders and ApiKeys residual web chrome migrated to shadcn Button/Input + Mist Sky semantic tokens with ≥40px hit targets; domain CRUD/key handlers frozen.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-23T00:16:12Z
- **Completed:** 2026-07-23T00:19:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Purged `uiClasses` btn/btnPrimary/btnDanger from CustomProvidersSection; all residual CTAs are Button size sm
- Purged `uiClasses` btn/btnPrimary/bannerDanger from ApiKeysSection; dense 9–11px chips upgraded to ≥40px Buttons
- Migrated residual `gsd-*` color utilities and rounded cards to semantic tokens + radius 0
- Preserved provider CRUD, exportEnv/setKey/clearKey, window.confirm clear path, and masked reveal (ISO-02 / D-00d)

## Task Commits

Each task was committed atomically:

1. **Task 1: CustomProvidersSection — Button language + semantic tokens** - `565042b` (feat)
2. **Task 2: ApiKeysSection — Button language + Input search + banner tokens + ≥40px actions** - `0416b6a` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/components/sections/CustomProvidersSection.tsx` — Button CTAs; semantic tokens; soft destructive Delete/Remove; radius 0 cards
- `src/components/sections/ApiKeysSection.tsx` — Button CTAs; Input search/edit; soft-danger alert; primary export success wash; ≥40px row actions

## Decisions Made

- Soft destructive uses outline + destructive tint classes rather than solid red fill (palette lock)
- Optional Input upgrade applied on ApiKeys search + password edit only; CustomProviders free-text left on native inputs (FormControls already styles them)
- Status badges (Set/Installed/Not found) use quiet muted bordered chips at text-xs — no neon success greens

## Deviations from Plan

None - plan executed exactly as written.

## Threat Surface

No new endpoints, auth paths, or schema changes. Presentation-only className/JSX restyle. Key storage still via existing ConfigBackend setKey/clearKey/exportEnv; confirm-on-clear and masked bullets retained (T-05-01/T-05-02 mitigated).

## Known Stubs

None — HTML `placeholder` attributes on inputs are intentional form UX, not incomplete features.

## Self-Check: PASSED

- FOUND: `src/components/sections/CustomProvidersSection.tsx`
- FOUND: `src/components/sections/ApiKeysSection.tsx`
- FOUND: `.planning/phases/05-hardening-polish-gates/05-01-SUMMARY.md`
- FOUND: commit `565042b`
- FOUND: commit `0416b6a`
