# Roadmap: GSD Pi Config — Web UI Redesign

## Overview

Restyle the existing GSD Pi Config **web surface** onto **shadcn/ui** while keeping product flows and domain behavior stable, and isolating presentation so the desktop (Tauri) build keeps its current look this milestone. Work proceeds foundation-first (tooling, tokens, CSS split, theme bridge), then web-only chrome and standalone routes, then shared overlays, then form-kit adapters + editor shell, and finishes with dual-platform smoke, a11y, and isolation gates.

## Phases

- [ ] **Phase 1: Foundation, Isolation & Theme Bridge** - shadcn init, platform CSS split, tokens, and dual-write theme
- [x] **Phase 2: Web Chrome & Standalone Pages** - restyle WebShell, gallery, wizard, OAuth, and button language (completed 2026-07-21)
- [x] **Phase 3: Modals, Palette & Overlays** - Dialog/AlertDialog modals, ⌘K command palette, focus traps (completed 2026-07-22)
- [ ] **Phase 4: Form Kit Adapters + Editor Chrome** - FormControls.web adapters, section inheritance, editor shell
- [ ] **Phase 5: Hardening & Polish Gates** - isolation, behavior smoke, a11y parity, residual web cleanup

## Phase Details

### Phase 1: Foundation, Isolation & Theme Bridge

**Goal:** As a dual-platform GSD Pi Config maintainer, I want the web build on a locked shadcn foundation with dual-write theme isolation from desktop, so that web restyles can use shadcn tokens without changing desktop visuals or product behavior.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, THM-01, THM-02, THM-03, ISO-01
**Success Criteria** (what must be TRUE):

  1. Web build has shadcn initialized (`components.json` locked for Vite + React + Tailwind 4, `@/*` aliases, `cn` util, baseline primitives under `src/components/ui/` — only primitives needed, not a full registry dump)
  2. Web loads shadcn semantic tokens (background, foreground, primary, muted, destructive, border, ring) with a clean neutral default look; desktop build still runs with current non-shadcn styling
  3. Auto / Dark / Light theme still works (storage + system preference + no-flash boot) and GSD theme attributes stay in sync with shadcn dark mode (e.g. `data-theme` + `.dark`)

**Plans:** 3/3 plans executed
Plans:

- [x] 01-01-PLAN.md — Wave 0 tests, `@/*` + `cn`, theme dual-write (`data-theme` + `.dark`)
- [x] 01-02-PLAN.md — Platform CSS split, web semantic tokens, isolation tests + dual builds
- [x] 01-03-PLAN.md — Lock `components.json`, legitimacy gate, Button-only skeleton, phase smoke

**UI hint**: yes

### Phase 2: Web Chrome & Standalone Pages

**Goal**: Shared web chrome and standalone routes are fully on shadcn with consistent buttons and states
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: WEB-01, WEB-02, WEB-03, WEB-05, WEB-06, WEB-07, THM-04
**Success Criteria** (what must be TRUE):

  1. Shared web chrome (header/nav/workspace strip) is restyled with shadcn, and the theme toggle uses shadcn-styled controls without changing theme semantics
  2. Gallery (`/gallery`), wizard (`/new`), and OAuth callback (`/oauth/callback`) are fully restyled on shadcn
  3. Loading, empty, and error states on restyled pages use consistent shadcn patterns
  4. Primary / secondary / destructive button language is consistent site-wide on restyled web surfaces (no mixed old/new button systems)

**Plans:** 4/4 plans complete
Plans:

- [x] 02-01-PLAN.md — Mist Sky tokens + radius 0 + bridge remap + isolation contracts
- [x] 02-02-PLAN.md — Input/Textarea primitives + linear Button language (FND-03 allowlist)
- [x] 02-03-PLAN.md — WebShell underline nav + ThemeToggle text trio (WEB-01, THM-04)
- [x] 02-04-PLAN.md — Gallery, Wizard, Start, OAuth + WEB-06 surface contracts

**UI hint**: yes

### Phase 3: Modals, Palette & Overlays

**Goal:** As a web user of GSD Pi Config, I want product modals and the ⌘K palette on shadcn Dialog/Command with solid focus and exclusive open, so that overlays match Mist Sky chrome without changing share, import, load, submit, or field-jump behavior.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: OVL-01, OVL-02, OVL-03
**Success Criteria** (what must be TRUE):

  1. Existing modals (import, share, load preset, submit preset, and related) use shadcn Dialog/AlertDialog patterns with preserved handlers (including secret-scan warnings where applicable)
  2. Command palette (⌘K) is restyled with shadcn Command/Dialog and still supports field-jump / keyboard behavior
  3. Overlay focus management remains usable (trap, ESC, restore); nested Select/Dialog focus is not broken

**Plans:** 5/5 plans complete
Plans:

- [x] 03-01-PLAN.md — Dialog/Command CLI install + Mist Sky overrides + FND-03 allowlist
- [x] 03-02-PLAN.md — Share + Gallery preview + Import + Load on Dialog
- [x] 03-03-PLAN.md — Submit preset restyle (OAuth/scan handlers intact)
- [x] 03-04-PLAN.md — Palette Command-in-Dialog + scoring + shouldFilter false
- [x] 03-05-PLAN.md — ConfigApp exclusivity + phase03 contracts + dual builds

**UI hint**: yes

### Phase 4: Form Kit Adapters + Editor Chrome

**Goal**: Preference forms and cloud editor shell look shadcn on web without changing domain behavior
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: FRM-01, FRM-02, FRM-03, FRM-04, WEB-04
**Success Criteria** (what must be TRUE):

  1. Form control presentation is restyled via a stable FormControls API (Field, Toggle/Switch, Select, MultiSelect, Combo, text/number, tags, section headers) backed by shadcn on web
  2. Preference section editors keep domain behavior (controlled prefs, validators, `data-field-path`) with presentation-only changes; domain-specific controls (e.g. model chain / multi model pickers) compose shadcn without losing product UX
  3. Cloud editor route (`/`) shell is fully restyled on shadcn (sidebar, toolbar, status, banners)
  4. Dirty tracking, save, import, download, and scope semantics are unchanged after the editor chrome restyle

**Plans**: TBD
**UI hint**: yes

### Phase 5: Hardening & Polish Gates

**Goal**: All web pages are cohesive on shadcn; desktop and behavior stay stable; smoke and a11y gates pass
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: ISO-02, ISO-03, ISO-04, ISO-05
**Success Criteria** (what must be TRUE):

  1. No product/IA rethink: same routes, section groups, and user capabilities as before the restyle; residual non-shadcn chrome is purged from web-only paths
  2. Shared domain logic (preferences core, backends, Tauri/web APIs) stays behavior-stable — UI wiring only unless unavoidable; desktop visual isolation from earlier phases still holds
  3. Behavior smoke gates pass on web: import/draft, edit, download workspace, share/redact path, dirty/save affordances, OAuth submit path as applicable
  4. Focus/a11y parity is maintained (labels, invalid states, keyboard nav, focus rings, hit targets)

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Isolation & Theme Bridge | 3/3 | In Progress|  |
| 2. Web Chrome & Standalone Pages | 4/4 | Complete    | 2026-07-21 |
| 3. Modals, Palette & Overlays | 5/5 | Complete   | 2026-07-22 |
| 4. Form Kit Adapters + Editor Chrome | 0/TBD | Not started | - |
| 5. Hardening & Polish Gates | 0/TBD | Not started | - |

## Coverage Map

| Requirement | Phase |
|-------------|-------|
| FND-01 | Phase 1 |
| FND-02 | Phase 1 |
| FND-03 | Phase 1 |
| FND-04 | Phase 1 |
| THM-01 | Phase 1 |
| THM-02 | Phase 1 |
| THM-03 | Phase 1 |
| THM-04 | Phase 2 |
| WEB-01 | Phase 2 |
| WEB-02 | Phase 2 |
| WEB-03 | Phase 2 |
| WEB-04 | Phase 4 |
| WEB-05 | Phase 2 |
| WEB-06 | Phase 2 |
| WEB-07 | Phase 2 |
| FRM-01 | Phase 4 |
| FRM-02 | Phase 4 |
| FRM-03 | Phase 4 |
| FRM-04 | Phase 4 |
| OVL-01 | Phase 3 |
| OVL-02 | Phase 3 |
| OVL-03 | Phase 3 |
| ISO-01 | Phase 1 |
| ISO-02 | Phase 5 |
| ISO-03 | Phase 5 |
| ISO-04 | Phase 5 |
| ISO-05 | Phase 5 |

**Coverage:** 27/27 v1 requirements mapped ✓

---
*Roadmap created: 2026-07-21 during `/gsd-new-project`*
