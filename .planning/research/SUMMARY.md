# Project Research Summary

**Project:** GSD Pi Config — Web UI Redesign  
**Domain:** Visual design-system restyle (shadcn/ui) of an existing dual-platform (Vite web + Tauri) config/admin React app  
**Researched:** 2026-07-21  
**Confidence:** HIGH (stack + architecture + local surface); MEDIUM-HIGH (features/pitfalls synthesis)

## Executive Summary

This milestone is **not a new product** — it is a **web-only presentation restyle** of GSD Pi Config onto **shadcn/ui**, keeping gallery, wizard, cloud editor, OAuth, import/download/share, and preference editing behavior intact. Experts ship this class of work by treating shadcn as **owned source components** on Tailwind 4, isolating look at the edges (CSS tokens, chrome, form primitives), and refusing form-library or backend rewrites “while redesigning.”

**Recommended approach:** Keep React 19 + Vite 8 + Tailwind 4 as-is. Init shadcn with **`base-nova`**, CSS variables, **neutral** base, `rsc: false`, and pin a **single** primitive base (default Base UI / `@base-ui/react` — or Radix via explicit `-b radix`, not both). Split **platform CSS entries** so web gets shadcn tokens + `tw-animate-css` while desktop keeps current `gsd-*` chrome. Dual-write theme in existing `theme.ts` (`data-theme` + `.dark` class). Restyle leaf-first: tooling → isolation → primitives → web chrome/pages → modals/palette → **FormControls.web adapters** (same API) → editor chrome → polish. Sections stay domain-only consumers of FormControls; `ConfigApp` state machine and backends stay shared and behavior-stable.

**Key risks:** (1) CLI/init clobbering brownfield CSS and desktop look, (2) dual theme systems desync, (3) in-place shared FormControls/ConfigApp edits forcing desktop restyle, (4) global `input/select/textarea` rules fighting shadcn, (5) FormControls domain contracts (`data-field-path`, validators, MultiSelect/ModelChain) lost in a big-bang swap, (6) Dialog/Command portal focus traps. Mitigate with platform CSS split, presentation adapters, leaf-by-leaf control migration, early `components.json` lock, and dual-platform smoke gates every phase.

## Key Findings

### Recommended Stack

Full detail: [STACK.md](./STACK.md)

The repo is already on the correct foundation (React 19, Vite 8, Tailwind 4 + `@tailwindcss/vite`). Do **not** upgrade core packages for the restyle. Add shadcn CLI wiring (`@/*` alias, `components.json`, `cn` via clsx + tailwind-merge, CVA, lucide-react, tw-animate-css) and pull primitives via `npx shadcn@latest add` as pages need them — never `--all` day one.

**Core technologies:**
- **shadcn CLI `4.13.x` + `base-nova`:** Canonical Vite/TW4 install; clean default aesthetic; owns components under `src/components/ui/`
- **`@base-ui/react` (default) or unified `radix-ui`:** Headless primitives under shadcn wrappers — **pick one base and lock** `components.json`
- **class-variance-authority + clsx + tailwind-merge:** Variant API and safe `cn()` (use tailwind-merge 3.x for TW4)
- **lucide-react + tw-animate-css:** Default icons; TW4 animation import (not deprecated `tailwindcss-animate`)
- **Platform-split CSS (`index.web.css` / desktop legacy):** Prevents shadcn `@layer base` and tokens from restyling Tauri
- **Existing `theme.ts` bridge (not next-themes):** Dual-write `data-theme` + `.dark` for GSD + shadcn dark mode
- **Optional later:** sonner, cmdk, vaul — only when restyling toasts / Command / mobile Sheet

**Critical setup requirements:**
- `@/*` → `./src/*` in **both** tsconfig and Vite `resolve.alias` **before** `shadcn add`
- `components.json`: `tailwind.config: ""`, `cssVariables: true`, `baseColor: neutral`, `rsc: false`
- Point CLI CSS at **web-only** entry so init does not rewrite desktop tokens

### Expected Features

Full detail: [FEATURES.md](./FEATURES.md)

Features here are **restyle capabilities**, not product jobs. Product routes and flows already exist and stay fixed.

**Must have (table stakes):**
- shadcn foundation on web (CLI, tokens, `cn`, Button/Input baseline)
- Token / theme bridge + theme toggle parity (auto/dark/light, no-flash boot)
- Full web route coverage: `/`, `/gallery`, `/new`, `/oauth/callback` + shared chrome
- WebShell / editor shell restyle (sidebar, toolbar, dirty/save, banners)
- Form control system restyle behind stable FormControls API
- Modal + command palette restyle; loading/empty/error states
- Focus/a11y parity and **behavior stability gates** (import/edit/download/share/OAuth)
- **Web-only presentation isolation** (desktop visual not forced)
- Consistent primary/secondary/destructive Button language site-wide

**Should have (polish / P2):**
- Sonner toasts, Skeleton gallery, Tooltip for field hints
- Sheet mobile section nav, Badge/Kbd polish, Card layouts
- Unified `components/ui` + thin domain wrappers; visual regression checklist

**Defer (v2+ / anti this milestone):**
- Desktop shadcn migration, RHF + Zod preference rewrite, full registry dump
- Product/IA rethink, backend rewrites, custom brand overhaul, forking ConfigApp into two apps
- Density modes / advanced Sidebar collapsible as MVP requirements

**Opinionated primitive set:** button, input, label, textarea, select, checkbox, switch, card, dialog, sheet, dropdown-menu, tabs, separator, badge, scroll-area, tooltip, sidebar/command as needed — skip Chart/Calendar/Carousel/Data Table/etc.

### Architecture Approach

Full detail: [ARCHITECTURE.md](./ARCHITECTURE.md)

Keep **one React app and one shared shell/state machine**. Isolate **look** at presentation edges — not by monorepo split or forking `ConfigApp`/sections. Dual Vite modes (`VITE_PLATFORM`) already separate bundles; dual CSS + form adapters complete the presentation boundary.

**Major components:**
1. **`main.tsx` + platform CSS entries** — bootstrap app import and web vs desktop styles
2. **`App.web.tsx` / pages / `WebShell`** — web-only surfaces; first restyle targets (zero desktop consumers)
3. **`ConfigApp`** — shared load/save/dirty/scope/modals state; branch only visual frame for web
4. **`components/ui/*`** — shadcn primitives; desktop must not import this milestone
5. **FormControls dual adapters** — stable Field/Toggle/Select/… API; web = shadcn, desktop = legacy
6. **`sections/*` + domain `lib/*` + `ConfigBackend`** — shared, ui-agnostic, **untouched** for behavior

**Key patterns:** platform presentation isolation (build-time alias preferred over ternaries everywhere); leaf-first migration; stable control contract over visual fork; shell state shared / chrome extracted; token coexistence without clobbering desktop.

### Critical Pitfalls

Full detail: [PITFALLS.md](./PITFALLS.md)

1. **CLI init as greenfield** — overwrites brownfield `index.css` / GSD tokens → surgical init, diff CSS, never casual `apply`
2. **Dual theme systems** — `data-theme` vs `.dark` desync → single authority in `theme.ts`, dual-write, one storage key
3. **Shared presentation leak** — editing FormControls/ConfigApp in place restyles desktop → adapters + import graph discipline + dual smoke
4. **Global element selectors fight shadcn** — double borders/focus wars → scope legacy form CSS to desktop/legacy wrapper
5. **Big-bang FormControls rewrite** — loses validators, `data-field-path`, MultiSelect/ModelChain → same API, leaf-by-leaf, control matrix
6. **Overlay/portal stacking** — Select/Command inside Dialog focus traps → z-index scale + modal popover patterns + test matrix
7. **Base UI vs Radix mix** — 2026 default shift → pin one base in `components.json` early
8. **Scope creep to RHF/product rewrite** — violates behavior stability → presentation-only gate every PR

## Implications for Roadmap

Based on combined research, suggested **4–5 phase** structure (dependency-safe, desktop risk ascending):

### Phase 1: Foundation, Isolation & Theme Bridge
**Rationale:** Unblocks all UI work; prevents the highest-cost failures (CSS clobber, desktop token leak, broken aliases, irreversible `components.json`).  
**Delivers:** `@/*` alias; `components.json` locked (`base-nova`, neutral, cssVariables, blank TW config); `cn` util; platform CSS split; shadcn tokens on web only; theme dual-write; first primitives (Button proof); desktop visual smoke unchanged.  
**Addresses:** shadcn foundation, token/theme bridge, web-only isolation, consistent Button baseline.  
**Avoids:** CLI overwrite, dual-theme mess, missing aliases, Base/Radix mix, irreversible wrong init choices.  
**Research flag:** Short spike — class `.dark` vs `@custom-variant` on `[data-theme=dark]`; confirm Base UI vs Radix team pin.

### Phase 2: Web Chrome & Standalone Pages
**Rationale:** Web-only graph (`WebShell`, gallery, wizard, OAuth, start panel) — highest visibility, lowest desktop risk; proves token system on real routes before shared forms.  
**Delivers:** Restyled WebShell + theme toggle; Gallery, Wizard, OAuth callback, WebStartPanel fully on shadcn; loading/empty/error parity on those routes.  
**Addresses:** Full route coverage for non-editor pages; chrome consistency; action button language.  
**Avoids:** Premature FormControls rewrite; product/IA rethink.  
**Research flag:** Low — standard shadcn composition.

### Phase 3: Modals, Palette & Shared Overlay Shell
**Rationale:** Overlays are shared files and high regression surface (z-index, focus, portals); fix patterns before dense forms put Select/Combobox inside dialogs.  
**Delivers:** Share/Import/Load/Submit dialog skins; Command palette restyle; z-index scale; nested overlay manual matrix; preserve secret-scan warnings on share/submit.  
**Addresses:** Modal/dialog restyle, command palette restyle, security UX non-regression.  
**Avoids:** Portal/focus traps, accidental desktop modal layout break (smoke desktop modals).  
**Research flag:** Medium — re-check Dialog+Combobox patterns for chosen primitive base at implementation time.

### Phase 4: Form Kit Adapters + Editor Chrome
**Rationale:** Highest behavioral risk; depends on proven primitives/tokens and overlay patterns. Unlocks “all sections look shadcn” without forking 20+ section files.  
**Delivers:** `FormControls.web` (or alias) with same exports; compact density recipe; preserve `path`/validators/`data-field-path`; web editor sidebar/toolbar/banners; section UIs inherit via adapters.  
**Addresses:** Form control system, editor shell, a11y/hit targets, behavior stability for edit/dirty/save.  
**Avoids:** In-place shared FormControls edit, RHF rewrite, density collapse, palette focus break, global CSS fights.  
**Research flag:** High for MultiSelect/ModelPicker/ModelChain/TagInput parity — may keep custom heads with shadcn skins; plan focused QA matrix.

### Phase 5: Hardening, Polish & Dual-Platform Gate
**Rationale:** Acceptance = all web pages cohesive + desktop unchanged + flows smoke-tested.  
**Delivers:** Residual `gsd-*` purge on web-only paths; optional P2 (Sonner, Skeleton, Tooltip, Sheet); `build` + `build:web`; checklist from PITFALLS “Looks Done But Isn't.”  
**Addresses:** Polish differentiators; visual regression confidence; isolation verification.  
**Avoids:** Dead dual skins forever; drive-by deps; secret UI regressions.  
**Research flag:** Low for polish; medium only if mobile Sheet becomes required by responsive QA.

### Phase Ordering Rationale

- **Tooling + tokens + boundary before any page** — inverted order causes double restyles and desktop regressions.
- **Web-only leaves before shared forms** — architecture says cheapest wins first; FormControls is the blast-radius multiplier.
- **Overlays before dense Selects-in-dialogs** — portal pitfalls are documented and cheap to fix early.
- **Adapters before section churn** — prevents forking domain sections and keeps dirty/focus contracts centralized.
- **Polish last** — table stakes define “done”; P2 is optional after validation.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Theme bridge strategy + Base UI vs Radix pin + exact CSS entry split wiring in `main.tsx` / Vite
- **Phase 4:** Dense control parity (MultiSelect, ModelChain, Combo, TagInput); compact Field density tokens
- **Phase 3:** Nested Dialog/Command/Select matrix for chosen base

Phases with standard patterns (skip research-phase):
- **Phase 2:** WebShell / Card / Button / Input composition on web-only pages
- **Phase 5:** Smoke gates, optional Sonner/Skeleton, CSS cleanup after migration complete

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Official shadcn Vite/TW4/theming docs + npm versions 2026-07-21; dual-platform CSS strategy MEDIUM (repo-derived) |
| Features | **MEDIUM-HIGH** | Product surface HIGH from codebase; restyle feature set synthesized from shadcn practice + PROJECT.md constraints |
| Architecture | **HIGH** | Mapped dual-entry topology from codebase; isolation patterns follow directly from shared FormControls + dual tokens |
| Pitfalls | **MEDIUM-HIGH** | Official docs + known GitHub issues + local CONCERNS; exact recovery costs judgmental |

**Overall confidence:** **HIGH** for roadmap shape and stack choices; **MEDIUM** on exact FormControls adapter file shape and nested-overlay API details until Phase 1–3 spikes.

### Gaps to Address

- **Theme dual-write vs custom dark variant:** Decide in Phase 1 spike; do not leave ambiguous across PRs.
- **Presentation boundary mechanism:** Vite alias for FormControls vs context ControlKit vs thin re-export — pick one before Phase 4.
- **Base UI vs Radix:** Research recommends official default (`base-nova` / Base UI); pin explicitly if team prefers Radix maturity.
- **Modal shared-file strategy:** Conditional classes vs web wrappers — verify with desktop modal smoke.
- **No component test harness today:** Rely on control/route checklists; consider minimal interaction tests for MultiSelect/TagInput before FormControls swap.
- **Brand accent:** MVP = neutral shadcn defaults; cyan primary override is post-MVP token tweak only.
- **Tailwind 4 + shadcn token mapping for dual theme:** Validate computed styles on Button/Input in both themes after Phase 1.

## Sources

### Primary (HIGH confidence)
- shadcn Vite install, manual install, components.json, theming, Tailwind v4, dark mode Vite (apps/v4 docs tree / ui.shadcn.com)
- shadcn changelog 2026-07 Base UI default; radix-ui unified package notes
- npm versions verified 2026-07-21 (`shadcn`, cva, clsx, tailwind-merge, lucide, tw-animate-css, @base-ui/react, cmdk, sonner, vaul)
- Local codebase: `package.json`, `vite.config.ts`, `src/main.tsx`, `App.web.tsx`, `ConfigApp.tsx`, `FormControls.tsx`, `theme.ts`, `index.css`, platform backends
- `.planning/PROJECT.md`, `.planning/codebase/*` (ARCHITECTURE, CONCERNS, TESTING)

### Secondary (MEDIUM confidence)
- shadcn GitHub issues: #7952 (CLI TW4), #10701 (twMerge), #1748/#4516/#10460 (Dialog+Combobox), #6440 (Sheet/TW4 animations)
- Ecosystem admin-restyle practice (presentation-only vs RHF rewrite) synthesized with FEATURES anti-list

### Tertiary (LOW confidence)
- Exact file names for CSS split / form adapters (pattern solid; naming flexible)
- Whether mobile Sheet is required (depends on responsive QA)

### Research artifacts
- [STACK.md](./STACK.md)
- [FEATURES.md](./FEATURES.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PITFALLS.md](./PITFALLS.md)

---
*Research completed: 2026-07-21*  
*Ready for roadmap: yes*
