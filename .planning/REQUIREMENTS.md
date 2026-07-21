# Requirements: GSD Pi Config — Web UI Redesign

**Milestone:** v1.0 — Web-only shadcn/ui visual restyle  
**Defined:** 2026-07-21  
**Core value:** Every web page uses a single shadcn-based design system; flows and behavior stay stable; desktop styling is not forced this milestone.

## v1 Requirements

### Foundation

- [ ] **FND-01**: Web build has shadcn/ui initialized (CLI config, `@/*` aliases, `cn` util, baseline primitives under `src/components/ui/`)
- [ ] **FND-02**: shadcn is configured for this Vite + React + Tailwind 4 stack (`components.json` locked: CSS variables, neutral base, `rsc: false`, single primitive base)
- [ ] **FND-03**: Only primitives needed by web routes/chrome/forms are added (no full-registry dump)
- [ ] **FND-04**: Platform CSS is split so web loads shadcn tokens/base styles and desktop keeps legacy visual styling this milestone

### Theme

- [ ] **THM-01**: Semantic design tokens power web UI (background, foreground, primary, muted, destructive, border, ring) with a clean default neutral look
- [ ] **THM-02**: Existing Auto / Dark / Light theme behavior is preserved (storage + system preference + no-flash boot)
- [ ] **THM-03**: Theme bridge keeps GSD theme attributes and shadcn dark-mode class in sync (e.g. `data-theme` + `.dark`)
- [ ] **THM-04**: Theme toggle on web uses shadcn-styled controls without changing theme semantics

### Web chrome & pages

- [ ] **WEB-01**: Shared web chrome (header/nav/workspace strip) is restyled with shadcn components
- [ ] **WEB-02**: Gallery route (`/gallery`) is fully restyled on shadcn (loading, empty, error, list/cards)
- [ ] **WEB-03**: Wizard route (`/new`) is fully restyled on shadcn
- [ ] **WEB-04**: Cloud editor route (`/`) shell is fully restyled on shadcn (sidebar, toolbar, status, banners)
- [ ] **WEB-05**: OAuth callback route (`/oauth/callback`) is fully restyled on shadcn
- [ ] **WEB-06**: Consistent Button language site-wide (primary / secondary / destructive; no mixed old/new button systems on web)
- [ ] **WEB-07**: Loading, empty, and error states on restyled pages use consistent shadcn patterns

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

- [ ] **ISO-01**: Desktop build continues to run with current (non-shadcn) visual styling for this milestone
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
| FND-01 | — | Pending |
| FND-02 | — | Pending |
| FND-03 | — | Pending |
| FND-04 | — | Pending |
| THM-01 | — | Pending |
| THM-02 | — | Pending |
| THM-03 | — | Pending |
| THM-04 | — | Pending |
| WEB-01 | — | Pending |
| WEB-02 | — | Pending |
| WEB-03 | — | Pending |
| WEB-04 | — | Pending |
| WEB-05 | — | Pending |
| WEB-06 | — | Pending |
| WEB-07 | — | Pending |
| FRM-01 | — | Pending |
| FRM-02 | — | Pending |
| FRM-03 | — | Pending |
| FRM-04 | — | Pending |
| OVL-01 | — | Pending |
| OVL-02 | — | Pending |
| OVL-03 | — | Pending |
| ISO-01 | — | Pending |
| ISO-02 | — | Pending |
| ISO-03 | — | Pending |
| ISO-04 | — | Pending |
| ISO-05 | — | Pending |

---
*Requirements defined 2026-07-21 during `/gsd-new-project`. Traceability filled by roadmap.*
