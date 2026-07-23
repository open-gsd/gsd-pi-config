---
phase: 03-modals-palette-overlays
plan: 01
subsystem: ui
tags: [shadcn, dialog, command, cmdk, base-ui, mist-sky, fnd-03, overlays]

# Dependency graph
requires:
  - phase: 01-foundation-shadcn-setup
    provides: components.json base-nova lock, FND-03 isolation harness, Button
  - phase: 02-web-chrome-standalone-pages
    provides: Input/Textarea primitives, Mist Sky tokens, WEB-06 Button language
provides:
  - Official base-nova Dialog + Command + input-group peers under src/components/ui
  - Mist Sky overlay defaults (bg-black/60, rounded-none, no product blur)
  - Expanded FND-03 allowlist requiring dialog/command/input-group
  - Import-only tests for Dialog/Command/input-group
  - cmdk dependency locked via package-lock
affects:
  - 03-02 Share/Import/Load modal restyles
  - 03-03 Submit modal restyle
  - 03-04 Palette Command restyle
  - 03-05 Host exclusivity + dual-build gates

# Tech tracking
tech-stack:
  added: [cmdk@1.1.1]
  patterns:
    - "Primitives-first cutover: expand FND-03 allowlist (RED) then CLI install (GREEN)"
    - "Mist Sky post-install overrides on registry Dialog/Command defaults"
    - "Import-only vitest node tests for ui primitives (no jsdom)"

key-files:
  created:
    - src/components/ui/dialog.tsx
    - src/components/ui/command.tsx
    - src/components/ui/input-group.tsx
    - src/components/ui/dialog.import.test.ts
    - src/components/ui/command.import.test.ts
    - src/components/ui/input-group.import.test.ts
  modified:
    - src/lib/foundation.isolation.test.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Install only dialog + command (+ required input-group peer) via shadcn@4.13.1; no alert-dialog/sheet dump (D-24)"
  - "Immediate Mist Sky overrides: bg-black/60 scrim, no product blur, rounded-none content/footer/command"
  - "Keep Base UI Dialog only — never product @radix-ui/react-dialog imports"
  - "cmdk accepted as official command peer (Package Legitimacy OK)"

patterns-established:
  - "FND-03 Phase 3 expansion: require dialog/command/input-group; forbid card/select/sheet/drawer/popover/alert-dialog"
  - "Source-level class contracts in import tests for scrim/radius/no-blur"

requirements-completed: [OVL-01, OVL-02]

coverage:
  - id: D1
    description: "Official base-nova Dialog primitive with Mist Sky scrim/radius defaults"
    requirement: OVL-01
    verification:
      - kind: unit
        ref: src/components/ui/dialog.import.test.ts#locks Mist Sky scrim and linear radius
        status: pass
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#requires dialog/command/input-group
        status: pass
    human_judgment: false
  - id: D2
    description: "Official base-nova Command + input-group peer with cmdk locked"
    requirement: OVL-02
    verification:
      - kind: unit
        ref: src/components/ui/command.import.test.ts#exports callable Command primitives
        status: pass
      - kind: unit
        ref: src/components/ui/input-group.import.test.ts#exports callable input-group primitives
        status: pass
      - kind: other
        ref: npm ls cmdk
        status: pass
    human_judgment: false
  - id: D3
    description: "FND-03 allowlist expanded; registry dump still forbidden"
    requirement: OVL-01
    verification:
      - kind: unit
        ref: src/lib/foundation.isolation.test.ts#ui primitive allowlist
        status: pass
    human_judgment: false

# Metrics
duration: 4min
completed: 2026-07-22
status: complete
---

# Phase 3 Plan 01: Dialog + Command Primitives Summary

**Installed official base-nova Dialog/Command (+ input-group peer) with Mist Sky scrim/radius overrides and expanded FND-03 allowlist so later overlay restyles can mount safely.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-22T03:42:37Z
- **Completed:** 2026-07-22T03:46:04Z
- **Tasks:** 2/2
- **Files modified:** 9

## Accomplishments

- Expanded FND-03 isolation allowlist to require `dialog` / `command` / `input-group` and forbid registry dump (card/select/sheet/drawer/popover/alert-dialog)
- Installed official `shadcn@4.13.1` base-nova Dialog + Command + input-group peer with `cmdk@1.1.1`
- Applied Mist Sky defaults: `bg-black/60` scrim, no product blur, `rounded-none` content/footer/command, title `text-sm font-semibold`
- Import-only tests green; full `npm test` green (86 tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand FND-03 allowlist for Dialog/Command (D-24) — expect RED until install** - `7a3f547` (test)
2. **Task 2: Install Dialog+Command via pinned CLI + Mist Sky overrides + import tests** - `ce5db1e` (feat)

**Plan metadata:** `f597d7a` (docs: complete plan)

_Note: TDD tasks used RED (Task 1 allowlist) → GREEN (Task 2 install)._

## Files Created/Modified

- `src/components/ui/dialog.tsx` - Base UI Dialog primitive with Mist Sky overlay/content/footer/title overrides
- `src/components/ui/command.tsx` - cmdk Command + CommandDialog shell (linear radius; top-ish placement via consumer className)
- `src/components/ui/input-group.tsx` - Official command peer only (D-24)
- `src/components/ui/dialog.import.test.ts` - Import + Base UI + Mist Sky class contracts
- `src/components/ui/command.import.test.ts` - Import + cmdk + linear defaults
- `src/components/ui/input-group.import.test.ts` - Import-only peer proof
- `src/lib/foundation.isolation.test.ts` - UI_ALLOWLIST + required presence + dump forbid
- `package.json` / `package-lock.json` - `cmdk` dependency

## Decisions Made

- Only Dialog/Command (+ required input-group) installed — AlertDialog not needed this phase (D-02)
- Registry defaults overridden immediately to Mist Sky contracts rather than leaving soft scrim/blur/radius
- Product Dialog remains Base UI only; cmdk transitive Radix peer unused in product Dialog shell

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn CLI selected pnpm due to stray workspace files**
- **Found during:** Task 2 (CLI install)
- **Issue:** Untracked `pnpm-lock.yaml` / `pnpm-workspace.yaml` caused `npx shadcn@4.13.1 add dialog command -y` to run `pnpm add cmdk` and fail; no ui files written on first attempt
- **Fix:** Removed stray pnpm artifacts (do not commit), installed `cmdk@1.1.1` via npm, re-ran CLI answering **no** to overwrite of existing button/input/textarea
- **Files modified:** package.json, package-lock.json (npm path)
- **Verification:** `npm ls cmdk @base-ui/react`; three ui files present; no pnpm lockfiles committed
- **Committed in:** `ce5db1e`

**2. [Rule 1 - Bug] Import test matched comment text for forbidden class tokens**
- **Found during:** Task 2 verification
- **Issue:** Comments mentioning `backdrop-blur` / `rounded-xl` failed source contracts
- **Fix:** Reworded comments so only class strings are asserted
- **Files modified:** `src/components/ui/dialog.tsx`
- **Verification:** dialog.import.test.ts green
- **Committed in:** `ce5db1e`

---

**Total deviations:** 2 auto-fixed (1 Rule 3, 1 Rule 1)
**Impact on plan:** Install path recovered without scope creep; no product modal restyle in this plan (Plans 02–05)

## Issues Encountered

- First CLI run failed on pnpm path; recovered with npm + re-run (see deviations)
- CLI still prompted overwrite for button/input/textarea registry deps despite `-y` — answered no via `yes n |`

## User Setup Required

None

## Known Stubs

None — primitives are complete install surfaces; product mounts deferred to Plans 02–05 by design

## Threat Flags

None new beyond plan threat model (cmdk/Base UI install mitigated by pin + FND-03 + Base UI assert)

## Verification Results

| Check | Result |
|-------|--------|
| `npx vitest run src/lib/foundation.isolation.test.ts src/components/ui/` | PASS (37) |
| `npm test` | PASS (86) |
| `test -f dialog.tsx command.tsx input-group.tsx` | PASS |
| `npm ls cmdk` | PASS (`cmdk@1.1.1`) |
| No alert-dialog/card/sheet/drawer/popover/select under ui/ | PASS |
| Desktop CSS still no shadcn/tailwind import | PASS (isolation) |

## Success Criteria

- [x] OVL-01/02 primitives ready (Dialog + Command)
- [x] D-24 FND-03 allowlist expanded without registry dump
- [x] D-03 Mist Sky scrim/radius overrides on Dialog defaults
- [x] Desktop CSS isolation untouched

## Next Plan Ready

Plans 02–05 can restyle Share/Import/Load/Submit/Palette onto these primitives without further registry installs.

## Self-Check: PASSED

- All created/modified files present on disk
- Commits `7a3f547` (test) and `ce5db1e` (feat) present in git log
- Isolation + ui import + full `npm test` green at plan end
