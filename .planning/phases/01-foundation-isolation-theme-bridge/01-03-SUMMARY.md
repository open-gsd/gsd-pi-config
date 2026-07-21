---
phase: 01-foundation-isolation-theme-bridge
plan: 03
subsystem: ui
tags: [shadcn, button, components-json, base-ui, cva, lucide, walking-skeleton, fnd-01, fnd-02, fnd-03]

requires:
  - phase: 01-foundation-isolation-theme-bridge
    provides: "Plan 01 @/* + cn + dual-write theme; Plan 02 platform CSS split + web OKLCH tokens"
provides:
  - "Locked components.json (base-nova / neutral / cssVariables / rsc false / css → index.web.css)"
  - "shadcn Button walking skeleton under src/components/ui (Base UI only)"
  - "Import-only Button proof + FND-03 ui allowlist isolation tests"
  - "Web @import shadcn/tailwind.css after legitimacy gate"
affects:
  - phase-02 web chrome restyle (can shadcn add safely against locked base)
  - later form-kit adapters that consume Button / cn / tokens

tech-stack:
  added:
    - shadcn@4.13.1
    - class-variance-authority@^0.7.1
    - lucide-react@^1.25.0
    - "@base-ui/react@^1.6.0"
  patterns:
    - "Hand-write components.json (brownfield) — never shadcn init -t vite"
    - "Blocking human package-legitimacy gate before install"
    - "npx shadcn@4.13.1 add button only — no --all, no third-party registries"
    - "Import-only primitive proof (no product mount of Button)"

key-files:
  created:
    - components.json
    - src/components/ui/button.tsx
    - src/components/ui/button.import.test.ts
  modified:
    - package.json
    - package-lock.json
    - src/index.web.css
    - src/lib/foundation.isolation.test.ts

key-decisions:
  - "Pin shadcn CLI 4.13.1; style base-nova / Base UI only — never mix Radix"
  - "Install only Button (+ CLI-required support); FND-03 allowlist enforces no registry dump"
  - "Add @import shadcn/tailwind.css to web CSS only after legitimacy approval"
  - "Hand-install @base-ui/react when CLI add wrote Button but omitted the peer dep"

patterns-established:
  - "components.json irreversible fields locked and regression-tested"
  - "ui/ allowlist in foundation.isolation.test.ts for FND-03"
  - "Button is import-only this phase — product gsd-btn replacement deferred"

requirements-completed: [FND-01, FND-02, FND-03, ISO-01]

coverage:
  - id: D1
    description: "components.json locked for Vite+React+TW4 (base-nova, neutral, cssVariables, rsc false, css → src/index.web.css)"
    requirement: FND-02
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#locks irreversible style/baseColor/cssVariables/rsc fields
        status: pass
      - kind: other
        ref: "node -e components.json field asserts"
        status: pass
    human_judgment: false
  - id: D2
    description: "shadcn Button walking skeleton installed under src/components/ui with CVA variants default/secondary/destructive/outline/ghost/link"
    requirement: FND-01
    verification:
      - kind: unit
        ref: src/components/ui/button.import.test.ts#exports a callable Button component
        status: pass
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#button source declares required CVA variants
        status: pass
    human_judgment: false
  - id: D3
    description: "Only Button primitive set under ui/ — no card/dialog/input/select/command dump (FND-03)"
    requirement: FND-03
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#only contains Button walking-skeleton files
        status: pass
    human_judgment: false
  - id: D4
    description: "Desktop CSS isolation holds after Button + shadcn/tailwind web import (ISO-01)"
    requirement: ISO-01
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#does not import shadcn/tailwind or tw-animate-css
        status: pass
      - kind: other
        ref: npm run build
        status: pass
      - kind: other
        ref: npm run build:web
        status: pass
    human_judgment: false
  - id: D5
    description: "Theme matrix + desktop visual smoke after walking skeleton"
    verification: []
    human_judgment: true
    rationale: "No-flash web boot, dual-write ThemeToggle matrix, and desktop legacy look require human visual confirmation (plan human-check)"

duration: 8min
completed: 2026-07-21
status: complete
---

# Phase 01 Plan 03: shadcn Button Walking Skeleton Summary

**Locked components.json (base-nova/neutral) + official shadcn@4.13.1 Button-only skeleton on Base UI with dual-build isolation**

## Performance

- **Duration:** ~8 min (Task 1 earlier + Task 3 after legitimacy approval)
- **Started:** 2026-07-21T23:39:37Z
- **Completed:** 2026-07-21T23:46:54Z
- **Tasks:** 3 (Task 2 = human package legitimacy checkpoint)
- **Files modified:** 8

## Accomplishments

- Hand-wrote irreversible `components.json` for brownfield Vite + React + Tailwind 4 (FND-02)
- Human-approved package legitimacy for `shadcn` / `lucide-react` / CLI deps (T-01-08 / T-01-SC)
- Installed only Button via `npx shadcn@4.13.1 add button -y` (Base UI; no `--all`)
- Web CSS now imports `shadcn/tailwind.css`; desktop remains free of shadcn stack (ISO-01)
- Import-only Button proof + FND-03 ui allowlist; dual builds green; no product Button mount

## Task Commits

Each task was committed atomically:

1. **Task 1: Lock components.json for Vite + React + Tailwind 4 (FND-02)** - `7e22d1e` (feat)
2. **Task 2: Package legitimacy gate before shadcn/lucide install** - human-approved (no code commit)
3. **Task 3: Install deps, add Button only, dual-build proof** - `bdf6a19` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `components.json` - Locked CLI config (base-nova, neutral, cssVariables, web CSS path)
- `src/components/ui/button.tsx` - Official shadcn Base UI Button + CVA variants
- `src/components/ui/button.import.test.ts` - Import-only typeof/variant proof (node env)
- `src/lib/foundation.isolation.test.ts` - FND-02 lock asserts + FND-03 ui allowlist + shadcn CSS import
- `src/index.web.css` - `@import "shadcn/tailwind.css"` after legitimacy gate
- `package.json` / `package-lock.json` - cva, lucide-react, shadcn@4.13.1, @base-ui/react

## Decisions Made

- Pin CLI `shadcn@4.13.1` and style `base-nova` (Base UI) — never mix Radix adds
- Brownfield path: hand-write `components.json` rather than `shadcn init -t vite`
- FND-03 allowlist is file-basename based under `src/components/ui/`
- No temporary product smoke mount of Button; import-only proof only
- When CLI `add button` wrote source but omitted `@base-ui/react`, install the peer explicitly (research-prescribed version 1.6.0)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CLI did not install @base-ui/react**
- **Found during:** Task 3 (after `npx shadcn@4.13.1 add button -y`)
- **Issue:** Generated `button.tsx` imports `@base-ui/react/button` but package was not added to package.json/node_modules
- **Fix:** `npm install @base-ui/react@^1.6.0` (version from RESEARCH; approved package identity)
- **Files modified:** package.json, package-lock.json
- **Verification:** `npm ls @base-ui/react`, button import tests + dual builds pass
- **Committed in:** `bdf6a19` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for Button to typecheck/import; no scope creep; still Base UI only.

## Issues Encountered

- shadcn CLI `add button` created source only and did not pull `@base-ui/react` automatically in this environment — resolved by explicit install of the research-pinned peer.

## Auth Gates

- Task 2 package legitimacy: user replied **approved** for `shadcn`, `lucide-react`, and CLI-driven Base UI deps before install.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 walking skeleton complete for FND-01/02/03 + ISO-01 automated gates
- Phase 2 can `shadcn add` against locked `components.json` for chrome restyle
- Remaining human smoke (theme matrix + desktop visual) is phase-level verification, not a code blocker
- Do not replace gsd-btn site-wide until Phase 2 button language work

## Self-Check: PASSED

- FOUND: components.json
- FOUND: src/components/ui/button.tsx
- FOUND: src/components/ui/button.import.test.ts
- FOUND: 7e22d1e
- FOUND: bdf6a19
- npm test: 35 passed
- npm run build:web: exit 0
- npm run build: exit 0

---
*Phase: 01-foundation-isolation-theme-bridge*
*Completed: 2026-07-21*
