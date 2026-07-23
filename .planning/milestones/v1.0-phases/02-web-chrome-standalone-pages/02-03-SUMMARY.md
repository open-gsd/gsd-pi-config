---
phase: 02-web-chrome-standalone-pages
plan: 03
subsystem: ui
tags: [webshell, themetoggle, underline-nav, mist-sky, buttonVariants, thm-04, web-01]

requires:
  - phase: 02-web-chrome-standalone-pages
    provides: "Mist Sky tokens + linear Button/Input/Textarea primitives (Plans 01–02)"
  - phase: 01-foundation-isolation-theme-bridge
    provides: "theme dual-write (data-theme + .dark), cn, useTheme API"
provides:
  - "WebShell underline nav (Editor / Gallery / New preset) with 56px opaque header"
  - "ThemeToggle linear Auto · Dark · Light text trio (THM-04 presentation only)"
  - "External opengsd.net control via buttonVariants outline (WEB-06)"
  - "Source-level chrome contracts for shell + theme toggle"
affects:
  - 02-web-chrome-standalone-pages plan 04 (Gallery/Wizard/OAuth/Start mount under WebShell)
  - Phase 3 overlays (shared chrome already Mist Sky)
  - Phase 4 loaded editor shell (WEB-04)

tech-stack:
  added: []
  patterns:
    - "Underline tabs via NavLink + border-b primary (not filled segment pills)"
    - "Theme trio pure buttons + CSS underline; radiogroup semantics preserved"
    - "buttonVariants on <a> for external CTAs (never nest Button wrapping anchor)"
    - "Source-level *.source.test.ts contracts for presentation restyles (no jsdom)"

key-files:
  created:
    - src/components/ThemeToggle.source.test.ts
    - src/components/WebShell.source.test.ts
  modified:
    - src/components/ThemeToggle.tsx
    - src/components/WebShell.tsx

key-decisions:
  - "Pure CSS underline (border-b 1px primary) for nav and theme trio — not ToggleGroup pills"
  - "ThemeToggle presentation-only; theme.ts dual-write and storage key untouched"
  - "BrandMark PNG retained without BrandMark.tsx changes (D-03)"
  - "External opengsd.net uses buttonVariants outline size sm; hidden below sm"

patterns-established:
  - "Shell chrome uses semantic tokens (bg-background, border-border, text-muted-foreground)"
  - "Hit targets min-h-10 inside 56px header with vertical centering"
  - "Workspace strip remains 2.25rem; label mono + text-primary Mist Sky"

requirements-completed: [WEB-01, THM-04, WEB-06]

coverage:
  - id: D1
    description: "ThemeToggle is linear Auto/Dark/Light text trio with radiogroup semantics and unchanged setTheme"
    requirement: THM-04
    verification:
      - kind: unit
        ref: "src/components/ThemeToggle.source.test.ts"
        status: pass
      - kind: unit
        ref: "src/lib/theme.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "WebShell header 56px opaque with underline nav Editor/Gallery/New preset"
    requirement: WEB-01
    verification:
      - kind: unit
        ref: "src/components/WebShell.source.test.ts"
        status: pass
      - kind: other
        ref: "npm run build:web"
        status: pass
    human_judgment: true
    rationale: "Visual density and underline alignment need human UAT at 320px/desktop widths"
  - id: D3
    description: "External opengsd.net uses buttonVariants; shell free of uiClasses btn/segment"
    requirement: WEB-06
    verification:
      - kind: unit
        ref: "src/components/WebShell.source.test.ts#styles external opengsd.net via buttonVariants"
        status: pass
      - kind: unit
        ref: "src/components/WebShell.source.test.ts#does not import btn / btnSegment"
        status: pass
    human_judgment: false
  - id: D4
    description: "BrandMark PNG retained; theme.ts dual-write untouched"
    requirement: WEB-01
    verification:
      - kind: unit
        ref: "src/components/WebShell.source.test.ts#BrandMark"
        status: pass
      - kind: unit
        ref: "src/lib/theme.test.ts"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-07-22
status: complete
---

# Phase 02 Plan 03: WebShell + ThemeToggle Summary

**Shared web chrome restyled to Mist Sky linear grammar: underline nav tabs, Auto/Dark/Light text trio, and shadcn buttonVariants for the external link — theme dual-write unchanged.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-22T01:11:39Z
- **Completed:** 2026-07-22T01:15:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- ThemeToggle dropped segment pills for a linear text trio (Auto · Dark · Light) with 1px primary bottom rule and radiogroup a11y
- WebShell nav uses NavLink underline tabs; header is opaque 56px with no glass blur
- External opengsd.net control styled via `buttonVariants({ variant: "outline" })` (WEB-06)
- BrandMark PNG kept; workspace strip still 36px with Mist Sky primary mono label
- Source-level contracts lock chrome presentation without requiring jsdom

## Task Commits

Each task was committed atomically:

1. **Task 1: ThemeToggle linear text trio** — `0729ce6` (test) → `e1a942a` (feat)
2. **Task 2: WebShell underline nav + Button chrome** — `2d66151` (test) → `b1dd439` (feat)

**Plan metadata:** `ef428f0` (docs: complete plan)

_Note: TDD tasks use test → feat commit pairs (RED/GREEN)._

## Files Created/Modified

- `src/components/ThemeToggle.tsx` — linear text trio; no uiClasses segments
- `src/components/ThemeToggle.source.test.ts` — THM-04 presentation contract
- `src/components/WebShell.tsx` — underline nav, opaque header, buttonVariants external link
- `src/components/WebShell.source.test.ts` — WEB-01 / WEB-06 chrome contract

## Decisions Made

- Pure CSS `border-b` + `border-primary` (1px) for active nav/theme options — matches D-01/D-02 and UI-SPEC over filled ToggleGroup
- No BrandMark.tsx edits — PNG already `h-8`; desktop Sidebar still uses gsd text tokens via bridge
- `theme.ts` not touched — dual-write and storage key remain authority (T-02-07 mitigate)

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- RED commits present: `0729ce6`, `2d66151`
- GREEN commits present: `e1a942a`, `b1dd439`
- No REFACTOR commits needed

## Known Stubs

None.

## Threat Flags

None — no new trust boundaries; external link keeps `rel="noopener noreferrer"`; theme storage path unchanged.

## Self-Check: PASSED

- Files: ThemeToggle.tsx, ThemeToggle.source.test.ts, WebShell.tsx, WebShell.source.test.ts, 02-03-SUMMARY.md
- Commits: 0729ce6, e1a942a, 2d66151, b1dd439
