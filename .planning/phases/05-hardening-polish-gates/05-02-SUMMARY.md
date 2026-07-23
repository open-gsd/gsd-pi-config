---
phase: 05-hardening-polish-gates
plan: 02
subsystem: ui
tags: [shadcn, button, semantic-tokens, residual-purge, mist-sky, a11y]

requires:
  - phase: 05-hardening-polish-gates
    provides: CustomProviders + ApiKeys residual Button purge (05-01)
provides:
  - P1 web-visible preference sections free of residual gsd-* color utilities
  - P2 web-visible preference sections free of residual gsd-* color utilities
  - Dense residual CTAs upgraded to Button size sm (≥40px) where touched
  - ConfigApp dual path verified (web Button, desktop uiClasses)
affects:
  - 05-03 (web .gsd-btn CSS purge after zero web callers)
  - ISO-05 residual cohesion / WEB-06 completion

tech-stack:
  added: []
  patterns:
    - residual section chrome uses semantic tokens (foreground/muted/primary/border/card/destructive)
    - residual cards/panels rounded-none; label/meta text-xs (12px)
    - real action CTAs use Button size sm; soft destructive = outline + destructive tint
    - desktop-only libraries keep gsd-* / uiClasses (WEB_HIDDEN)

key-files:
  created: []
  modified:
    - src/components/sections/agentSettingsEditors.tsx
    - src/components/sections/HooksSection.tsx
    - src/components/sections/WorkspaceSection.tsx
    - src/components/sections/SkillsSection.tsx
    - src/components/sections/McpSection.tsx
    - src/components/sections/RoutingSection.tsx
    - src/components/sections/ExperimentalSection.tsx
    - src/components/sections/AgentSettingsSection.tsx
    - src/components/sections/ModelsSection.tsx
    - src/components/sections/ParallelSection.tsx
    - src/components/sections/VerificationSection.tsx
    - src/components/sections/ContextSection.tsx
    - src/components/sections/UokSection.tsx

key-decisions:
  - "Prefer shared semantic tokens on both platforms for residual section chrome (desktop glance OK) — no isWebPlatform branch needed for color migration"
  - "ConfigApp verify-only: no redesign; desktop uiClasses import retained; web toolbar already Button"
  - "SkillsLibrarySection + AgentsLibrarySection intentionally left on gsd-* (desktop-only WEB_HIDDEN)"

patterns-established:
  - "Section residual map: text-gsd-text-dim→text-muted-foreground, bg-gsd-surface→bg-card, border-gsd-border→border-border, accent→primary, danger→destructive"
  - "Dense + Add CTAs: Button variant=default size=sm rounded-none; Remove: outline + border-destructive/40 text-destructive hover:bg-destructive/10"
  - "Ad-hoc text-[9–11px] → text-xs on restyled residual labels"

requirements-completed: [ISO-05, ISO-04]

coverage:
  - id: D1
    description: P1 high-density web sections migrate residual gsd-* colors to semantic tokens; dense CTAs use Button size sm; domain wiring intact
    requirement: ISO-05
    verification:
      - kind: unit
        ref: "npx vitest run src/lib/phase04.forms.test.ts src/lib/preferencesCore.test.ts"
        status: pass
      - kind: other
        ref: "rg no text-gsd-|bg-gsd-|border-gsd-|text-[9-11px] on P1 files"
        status: pass
    human_judgment: false
  - id: D2
    description: P2 sections token-migrated; ConfigApp web uses Button only; desktop uiClasses + gsd-field-focus + WEB_HIDDEN intact
    requirement: ISO-04
    verification:
      - kind: unit
        ref: "npx vitest run src/lib/phase04.forms.test.ts src/lib/preferencesCore.test.ts"
        status: pass
      - kind: other
        ref: "rg residual P2 free; ConfigApp dual markers; sectionConfig WEB_HIDDEN; gsd-field-focus"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-23
status: complete
---

# Phase 5 Plan 02: Section gsd-* Color Sweep + ConfigApp Verify Summary

**Web-visible preference sections migrated residual gsd-* color utilities to Mist Sky semantic tokens with text-xs meta scale and Button CTAs; ConfigApp dual web/desktop presentation verified without redesign.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-23T00:19:31Z
- **Completed:** 2026-07-23T00:23:30Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Purged residual `text-gsd-*` / `bg-gsd-*` / `border-gsd-*` from all web-visible preference sections (libraries excluded)
- Upgraded dense residual action chips (Add/Remove/chain/rule CTAs) to shadcn `Button` size sm with soft destructive outline language
- Replaced ad-hoc `text-[10px]` labels with `text-xs`; residual cards use `rounded-none`
- Verified ConfigApp: web toolbar on Button; desktop keeps uiClasses; `gsd-field-focus` palette jump intact; WEB_HIDDEN frozen

## Task Commits

Each task was committed atomically:

1. **Task 1: High-density web section token + control sweep (P1)** - `860ebdb` (feat)
2. **Task 2: P2 section sweep + ConfigApp web path verify** - `6771042` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/components/sections/agentSettingsEditors.tsx` — StringList/Env/Hooks/Fallback/Bash editors: semantic tokens + Button CTAs
- `src/components/sections/HooksSection.tsx` — hook cards + Add/Remove Buttons
- `src/components/sections/WorkspaceSection.tsx` — repo cards + CTAs
- `src/components/sections/SkillsSection.tsx` — skill rule cards + CTAs
- `src/components/sections/McpSection.tsx` — MCP filter cards + CTAs
- `src/components/sections/RoutingSection.tsx` — capability override cards + CTAs
- `src/components/sections/ExperimentalSection.tsx` — group headings muted-foreground
- `src/components/sections/AgentSettingsSection.tsx` — helper text muted-foreground
- `src/components/sections/ModelsSection.tsx` — phase cards rounded-none + primary headings
- `src/components/sections/ParallelSection.tsx` — group headings
- `src/components/sections/VerificationSection.tsx` — group headings
- `src/components/sections/ContextSection.tsx` — group headings
- `src/components/sections/UokSection.tsx` — group headings
- `src/ConfigApp.tsx` — verify-only (no code change)

## Decisions Made

- Shared semantic tokens applied without platform branching — acceptable on desktop glance; avoids dual class maintenance
- ConfigApp left untouched after verification confirmed zero live `className={btn…}` on isWeb branches
- Libraries intentionally retain gsd-* (desktop-only, not web purge success criteria)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — presentation-only className migration; share/download handlers and sectionConfig untouched.

## Self-Check: PASSED

- FOUND: all 13 modified section files
- FOUND: commits `860ebdb`, `6771042`
- FOUND: no residual gsd-* color utilities on web-visible sections (libraries excluded)
- FOUND: ConfigApp uiClasses + Button imports; gsd-field-focus; WEB_HIDDEN skills/agents only
- FOUND: phase04.forms + preferencesCore tests pass (48)
