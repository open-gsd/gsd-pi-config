# Requirements: GSD Pi Config — Web UI Redesign

**Milestone:** v1.0 — Web-only shadcn/ui visual restyle  
**Defined:** 2026-07-21  
**Core value:** Every web page uses a single shadcn-based design system; flows and behavior stay stable; desktop styling is not forced this milestone.

## v1 Requirements

### Foundation

- [x] **FND-01**: Web build has shadcn/ui initialized (CLI config, `@/*` aliases, `cn` util, baseline primitives under `src/components/ui/`)
- [x] **FND-02**: shadcn is configured for this Vite + React + Tailwind 4 stack (`components.json` locked: CSS variables, neutral base, `rsc: false`, single primitive base)
- [x] **FND-03**: Only primitives needed by web routes/chrome/forms are added (no full-registry dump)
- [x] **FND-04**: Platform CSS is split so web loads shadcn tokens/base styles and desktop keeps legacy visual styling this milestone

### Theme

- [x] **THM-01**: Semantic design tokens power web UI (background, foreground, primary, muted, destructive, border, ring) with a clean default neutral look
- [x] **THM-02**: Existing Auto / Dark / Light theme behavior is preserved (storage + system preference + no-flash boot)
- [x] **THM-03**: Theme bridge keeps GSD theme attributes and shadcn dark-mode class in sync (e.g. `data-theme` + `.dark`)
- [x] **THM-04**: Theme toggle on web uses shadcn-styled controls without changing theme semantics

### Web chrome & pages

- [x] **WEB-01**: Shared web chrome (header/nav/workspace strip) is restyled with shadcn components
- [x] **WEB-02**: Gallery route (`/gallery`) is fully restyled on shadcn (loading, empty, error, list/cards)
- [x] **WEB-03**: Wizard route (`/new`) is fully restyled on shadcn
- [ ] **WEB-04**: Cloud editor route (`/`) shell is fully restyled on shadcn (sidebar, toolbar, status, banners)
- [x] **WEB-05**: OAuth callback route (`/oauth/callback`) is fully restyled on shadcn
- [x] **WEB-06**: Consistent Button language site-wide (primary / secondary / destructive; no mixed old/new button systems on web)
- [x] **WEB-07**: Loading, empty, and error states on restyled pages use consistent shadcn patterns

### Forms & editor

- [ ] **FRM-01**: Form control presentation is restyled via a stable FormControls API (Field, Toggle/Switch, Select, MultiSelect, Combo, text/number, tags, section headers)
- [ ] **FRM-02**: Preference section editors keep domain behavior (controlled prefs, validators, `data-field-path`) with presentation-only changes
- [ ] **FRM-03**: Domain-specific controls (e.g. model chain / multi model pickers) compose shadcn primitives without losing product UX
- [ ] **FRM-04**: Editor chrome restyle does not change dirty tracking, save, import, download, or scope semantics

### Overlays

- [ ] **OVL-01**: Existing modals (import, share, load preset, submit preset, and related) use shadcn Dialog/AlertDialog patterns with preserved handlers
- [ ] **OVL-02**: Command palette (⌘K) is restyled with shadcn Command/Dialog and keeps field-jump / keyboard behavior
- [ ] **OVL-03**: Overlay focus management (trap, ESC, restore) remains usable; no broken nested Select/Dialog focus

### Isolation & quality

- [x] **ISO-01**: Desktop build continues to run with current (non-shadcn) visual styling for this milestone
- [ ] **ISO-02**: Shared domain logic (preferences core, backends, Tauri/web APIs) stays behavior-stable — UI wiring only unless unavoidable
- [ ] **ISO-03**: Behavior smoke gates pass on web: import/draft, edit, download workspace, share/redact path, dirty/save affordances, OAuth submit path as applicable
- [ ] **ISO-04**: Focus/a11y parity is maintained (labels, invalid states, keyboard nav, focus rings, hit targets)
- [ ] **ISO-05**: No product/IA rethink: same routes, section groups, and user capabilities as before the restyle

## v2 Requirements (deferred)

- Sonner (or equivalent) toast feedback system
- Skeleton loaders for gallery cards
- Tooltip migration for field hints
- Badge/chip system polish and Kbd shortcut affordances
- Sheet-based mobile section navigation
- Density tokens (comfortable/compact)
- Visual regression harness / screenshot set
- Desktop migration onto the same shadcn system
- Optional ScrollArea / Card layout refinements beyond v1 consistency

## Out of Scope

| Item | Reason |
|------|--------|
| Product or information-architecture rethink | Visual restyle only |
| Desktop shadcn restyle as success criterion | Explicitly deferred |
| React Hook Form + Zod rewrite of preference forms | Behavior rewrite; conflicts with stability |
| Full shadcn registry install | Maintainability noise |
| Backend/API redesign (OAuth/submit handlers) | Security/behavior risk; not required for restyle |
| Forking ConfigApp into separate web/desktop apps | Duplicates state machines |
| New product features (cloud sync, multi-user, skills on web, etc.) | Outside restyle charter |
| Custom heavy brand/illustration system | Prefer clean shadcn defaults |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 1 | Complete |
| THM-01 | Phase 1 | Complete |
| THM-02 | Phase 1 | Complete |
| THM-03 | Phase 1 | Complete |
| THM-04 | Phase 2 | Complete |
| WEB-01 | Phase 2 | Complete |
| WEB-02 | Phase 2 | Complete |
| WEB-03 | Phase 2 | Complete |
| WEB-04 | Phase 4 | Pending |
| WEB-05 | Phase 2 | Complete |
| WEB-06 | Phase 2 | Complete |
| WEB-07 | Phase 2 | Complete |
| FRM-01 | Phase 4 | Pending |
| FRM-02 | Phase 4 | Pending |
| FRM-03 | Phase 4 | Pending |
| FRM-04 | Phase 4 | Pending |
| OVL-01 | Phase 3 | Pending |
| OVL-02 | Phase 3 | Pending |
| OVL-03 | Phase 3 | Pending |
| ISO-01 | Phase 1 | Complete |
| ISO-02 | Phase 5 | Pending |
| ISO-03 | Phase 5 | Pending |
| ISO-04 | Phase 5 | Pending |
| ISO-05 | Phase 5 | Pending |

---
*Requirements defined 2026-07-21 during `/gsd-new-project`. Traceability filled by roadmap.*
