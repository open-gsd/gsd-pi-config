# Walking Skeleton — GSD Pi Config Web UI Redesign

**Phase:** 1  
**Generated:** 2026-07-21  
**Kind:** Brownfield design-system foundation (not a greenfield app scaffold)

## Capability Proven End-to-End

A web build loads shadcn semantic tokens and dual-write theme (`data-theme` + `.dark`), resolves the owned `Button` module via `@/*` aliases and `cn`, while the desktop build continues to ship the legacy `gsd-*` CSS system with no shadcn base import.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Existing React 19 + Vite 8 + TypeScript (no upgrade) | Already correct stack for shadcn TW4; restyle only |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` + platform-split CSS entries | Web gets shadcn tokens; desktop keeps `gsd-*` |
| Design system | shadcn/ui CLI `4.13.x`, preset `base-nova`, `baseColor: neutral`, `cssVariables: true`, `rsc: false` | Official Vite/TW4 path; clean defaults per PROJECT.md |
| Primitive base | Base UI (`@base-ui/react`) via `-b base` — never mix Radix | 2026-07 shadcn default; pin once in `components.json` |
| Theme | Existing `src/lib/theme.ts` dual-write (`data-theme` + `.dark`); no `next-themes` | Preserve Auto/Dark/Light storage + no-flash boot |
| CSS isolation | `src/index.web.css` + `src/index.desktop.css` selected by Vite `@platform-css` alias on `VITE_PLATFORM` | FOUC-safe static import; ISO-01 |
| Path aliases | `@/*` → `./src/*` in both `tsconfig.json` and Vite `resolve.alias` | Required before any `shadcn add` |
| Utility | `cn` = `twMerge(clsx(...))` at `src/lib/utils.ts` | shadcn registry contract |
| Day-one primitive | Button only under `src/components/ui/button.tsx` | Walking skeleton; FND-03 forbids full registry dump |
| Data layer | Unchanged (localStorage web / Tauri desktop) | Out of restyle scope |
| Auth | Unchanged OAuth serverless path | Untouched this phase |
| Deployment | Existing Vercel web + Tauri desktop; local proof via `npm run build:web` + `npm run build` | No new deploy target |
| Directory layout | Owned primitives in `src/components/ui/*`; presentation isolation at CSS/bootstrap edges; shared `ConfigApp`/sections/backends stay shared | Avoids forking the product shell |

## Stack Touched in Phase 1

- [x] Project scaffold (framework, build, lint, test runner) — **already present; only extended**
- [x] Routing — existing web routes unchanged (no new product route required for skeleton)
- [ ] Database — N/A (config app; no DB in this milestone)
- [x] UI — shadcn `Button` module + theme dual-write proof (import/build gate; not full page restyle)
- [x] Deployment — documented local full dual-platform build: `npm test && npm run build:web && npm run build`

## Out of Scope (Deferred to Later Slices)

> Explicit list so later phases do not re-litigate Phase 1 minimalism.

- Restyle of WebShell, gallery, wizard, OAuth, editor chrome (Phase 2 / 4)
- ThemeToggle visual restyle onto shadcn controls (THM-04 / Phase 2)
- Dialog / Command / form primitives beyond Button (Phases 3–4)
- FormControls.web adapters (Phase 4)
- Full registry dump, Chart/Calendar/Carousel/Data Table
- Desktop visual migration onto shadcn
- RHF + Zod rewrite, monorepo split, forking ConfigApp
- Brand cyan mapped into `--primary` (post-MVP token tweak)
- Sonner, Skeleton, Tooltip, Sheet mobile nav, density modes (v2)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Web chrome + standalone routes (`WebShell`, gallery, wizard, OAuth) on shadcn Button language
- Phase 3: Shared modals + command palette with focus traps
- Phase 4: FormControls.web adapters + editor shell presentation
- Phase 5: Dual-platform hardening, a11y parity, residual web cleanup gates

## Phase 1 Success Truths (Skeleton Contract)

1. `components.json` locked: `base-nova`, neutral, cssVariables true, rsc false, css → `src/index.web.css`
2. Web CSS exposes semantic tokens (`--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--border`, `--ring`, …) and `@custom-variant dark (&:is(.dark *))`
3. `applyTheme` dual-writes `document.documentElement.dataset.theme` and class `dark`
4. Desktop CSS entry is legacy `gsd-*` only — no `shadcn/tailwind` import
5. `src/components/ui/` contains only the Button walking skeleton (plus CLI-required deps for Button), not a full registry
6. `npm test`, `npm run build:web`, and `npm run build` are green
