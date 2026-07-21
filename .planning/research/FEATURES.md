# Feature Research

**Domain:** Visual design-system restyle (shadcn/ui) for a config/admin web app  
**Project:** GSD Pi Config — web surface only  
**Researched:** 2026-07-21  
**Confidence:** MEDIUM-HIGH (product surface HIGH from codebase; ecosystem patterns MEDIUM from official shadcn docs + migration practice)

## Scope of this landscape

This is **not** a product-feature catalog for GSD Pi Config. Product jobs already exist and stay fixed:

- Gallery (`/gallery`), wizard (`/new`), cloud editor (`/`), OAuth callback (`/oauth/callback`)
- Import / draft / edit / download / share / submit-preset flows
- Sectioned preference forms, command palette, theme toggle, dirty/save affordances

The “features” below are **restyle capabilities**: presentation-layer work that makes a shadcn migration feel complete **without** changing what users can do.

**Success criterion (from PROJECT.md):** every web page on shadcn; web-only presentation layer; clean default aesthetic; behavior-stable.

---

## Feature Landscape

### Table Stakes (Must have or restyle fails)

Users and maintainers treat these as non-negotiable. Missing any = “half restyled” or “looks broken next to the new chrome.”

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **shadcn foundation on web** | Design system entry: CLI init, `components.json`, `@/` alias, `cn` util, CSS variables | LOW–MED | Official path for existing Vite+React+Tailwind projects; keep Tailwind 4 compatible. Do not force desktop entry through the same CSS root if isolation is required. |
| **Token / theme bridge** | One visual language; light + dark + system already exist | MEDIUM | Map current `--gsd-*` (or replace) to shadcn semantic tokens (`background`, `foreground`, `primary`, `muted`, `destructive`, `border`, `ring`). Preserve no-flash boot (`applyTheme` before paint). |
| **Theme toggle on shadcn** | Site already has Auto/Dark/Light; restyle must keep it | LOW | Restyle `ThemeToggle` with Button/ToggleGroup or ModeToggle pattern; keep storage key + system listener behavior. |
| **Full web route coverage** | “Entire site” acceptance | MEDIUM | Restyle **all** routes in `App.web.tsx`: `/`, `/gallery`, `/new`, `/oauth/callback` (+ shared chrome). One leftover `gsd-btn` page fails the milestone. |
| **Web shell / nav chrome** | Primary brand surface; first paint consistency | MEDIUM | `WebShell` header, nav segments, workspace strip → Button, Navigation/Tabs or ToggleGroup, Badge, Separator. |
| **Editor shell restyle** | Majority of time-on-site | HIGH | Sidebar section nav, toolbar (import/download/share/discard), dirty/save status, banners — without changing `ConfigApp` orchestration. Prefer presentational wrappers. |
| **Form control system restyle** | Settings UIs live or die on controls | HIGH | Replace/restyle `FormControls` + `uiClasses` consumers: Field, Toggle/Switch, Select, MultiSelect, Combo, ModelPicker/Chain, Number/Text, TagInput, SectionHeader. Keep prop APIs so section files need minimal logic changes. |
| **Modal / dialog restyle** | Existing flows: import, share, load preset, submit preset, palette | MEDIUM | Map custom modals → Dialog/AlertDialog; preserve focus trap, ESC, and submit handlers. |
| **Command palette restyle** | Power-user density expectation; already ⌘K | MEDIUM | Restyle `Palette` with Command + Dialog; keep field-jump behavior and keyboard bindings. |
| **Loading / empty / error states** | Gallery fetch, OAuth pending, empty editor start | LOW–MED | Gallery loading/error/empty; OAuth “Completing sign-in…” / error; `WebStartPanel` empty CTAs. Prefer Skeleton + Empty + Alert patterns. |
| **Focus, hit targets, a11y parity** | Restyle must not regress usability | MEDIUM | Preserve `role`, `aria-*`, `data-invalid`, 40px-ish hit areas, keyboard section nav (`[`/`]`), focus rings via `ring` tokens. |
| **Behavior stability gates** | Visual restyle ≠ product change | MEDIUM | Import, draft persistence, download workspace, dirty tracking, share redaction, OAuth submit path, validators — same outcomes. Visual QA alone is insufficient. |
| **Web-only presentation isolation** | Explicit milestone constraint | MEDIUM–HIGH | Desktop keeps current styling. Web-scoped components/CSS (or variant props) so Tauri build does not inherit unfinished shadcn chrome. Shared domain (`preferencesCore`, backends) untouched. |
| **Consistent primary/secondary/destructive actions** | Admin UI grammar | LOW | Map `btn` / `btnPrimary` / `btnDanger` to Button variants site-wide; no mixed old/new button languages. |

### Differentiators (Nice polish — valued, not required for “done”)

These raise perceived quality and maintainability beyond “it uses shadcn.” Ship after table stakes if time allows.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Sonner (or toast) feedback** | Cleaner save/download/error feedback than inline status alone | LOW | Optional upgrade of save status strip; do not remove durable error banners for failures. |
| **Sheet for mobile section nav** | Better small-viewport editor than cramped sidebar | MEDIUM | shadcn Sidebar/Sheet patterns; only if current mobile layout is weak — not a product rethink. |
| **Skeleton gallery cards** | Premium loading vs “Loading presets…” text | LOW | Skeleton + list Item/Card. |
| **Kbd component for shortcuts** | Communicates power-user surface | LOW | Document ⌘K / ⌘S in chrome or palette footer. |
| **Badge/chip system for tags & dirty counts** | Visual hierarchy for gallery tags, dirty section counts | LOW | Badge variants replace ad-hoc tag classes. |
| **Tooltip for field hints** | Replace custom CSS hover tooltips with accessible Tooltip | LOW–MED | Map FormControls hint `?` to Tooltip; keep content from field meta. |
| **Density tokens (comfortable/compact)** | Dense config forms need compact without looking broken | MEDIUM | Optional CSS vars for control height/spacing; default one density for MVP. |
| **ScrollArea on long sections** | Polished overflow vs raw scrollbar | LOW | Optional; ensure nested scroll doesn’t trap focus. |
| **Card layout for wizard steps / gallery rows** | Cleaner default shadcn look | LOW | Card/Item composition without changing step logic. |
| **Unified `components/ui` + thin domain wrappers** | Long-term maintainability (core value) | MEDIUM | Domain widgets (`ModelChain`, etc.) compose shadcn primitives; sections import domain wrappers only. |
| **Visual regression smoke set** | Confidence restyle didn’t break layouts | MEDIUM | Screenshots of gallery, wizard, one dense section, modal, OAuth — even manual checklist is a differentiator for this milestone. |

### Anti-Features (Deliberately do NOT build)

Seem related to “redesign with shadcn,” but fight the milestone or create rewrites.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Product / IA rethink** | “While we’re restyling…” | Out of scope; risks behavior regressions and scope explosion | Keep routes, section groups, and CTAs; only change presentation |
| **Desktop visual migration this milestone** | Shared React tree makes it tempting | Explicitly deferred; high blast radius on Tauri | Web-only presentation layer / `variant === "web"` styling |
| **Rewrite preference forms to React Hook Form + Zod** | shadcn form docs push RHF | Large behavior rewrite; dual validation with existing validators; not needed for visual restyle | Keep controlled `prefs` + existing validators; use Field/Input presentation patterns only |
| **Install entire shadcn registry** | “Have everything ready” | Noise, dead code, review burden, unused deps (charts, calendar, carousel…) | Add only primitives used by gallery/wizard/editor/oauth/chrome |
| **New product capabilities** (auth walls, multi-user, cloud sync, analytics dashboards) | Design-system work often pairs with product expansion | Violates visual-only charter | Defer to future milestones |
| **Custom brand system / illustration overhaul** | “Make it ours” | Conflicts with “clean shadcn defaults”; slow | Default neutral tokens; subtle brand accent only if trivial |
| **Fork ConfigApp into web-only and desktop-only apps** | Isolation anxiety | Duplicates dirty/save/import logic; multiplies bugs | Shared shell + presentation adapters |
| **Backend/API rewrites “for the UI”** | Touching OAuth/submit while restyling | Security/behavior risk (CONCERNS already flags submit/OAuth fragility) | UI wiring only; no handler redesign |
| **Replace domain multi-select/model-chain with generic Select only** | Fit everything into stock primitives | Loses product-specific UX (fallback chains, multi model pickers) | Compose domain controls from Combobox/Command/Badge |
| **Big-bang CSS delete of all `gsd-*` in one PR without parity** | Clean slate | Half-migrated screens, desktop breakage | Incremental: foundation → chrome → pages → forms; keep dual tokens briefly if needed |
| **Dark-mode-only redesign** | shadcn demos often dark | Light + system already first-class | Both themes from day one of restyle |
| **Adding skills/agents libraries to web** | Feature parity with desktop | Not a restyle; platform limitation is intentional | Leave web section filter as-is |

---

## Feature Dependencies

```
shadcn foundation (init, alias, cn, CSS vars)
    └──requires──> Token / theme bridge
                       ├──requires──> Theme toggle restyle
                       ├──requires──> Consistent Button variants
                       └──requires──> Web shell chrome
                                          ├──requires──> Gallery page restyle
                                          ├──requires──> Wizard page restyle
                                          ├──requires──> OAuth callback restyle
                                          └──requires──> Editor shell restyle
                                                             ├──requires──> Form control system
                                                             │                  └──enhances──> Section files (visual only)
                                                             ├──requires──> Modal / dialog restyle
                                                             └──requires──> Command palette restyle

Web-only presentation isolation ──constrains──> All of the above
Behavior stability gates ──validates──> All of the above

Sonner / Sheet / Skeleton ──enhances──> chrome & pages (optional, after table stakes)
RHF rewrite ──conflicts──> Behavior stability + scope
Full registry install ──conflicts──> Maintainability goal
Desktop restyle ──conflicts──> Web-only milestone
```

### Dependency Notes

- **Foundation before pages:** Without tokens and Button/Input primitives, page restyles recreate one-off classes (current `uiClasses` problem).
- **Form control system before “all sections look done”:** Section files are dense; restyling sections without shared FormControls causes inconsistency.
- **Isolation is a constraint, not a late cleanup:** Decide web-scoped CSS/component paths before bulk class swaps so desktop does not regress.
- **Behavior gates parallel visual work:** Download/import/OAuth must be smoke-tested per phase, not only at the end.
- **RHF conflicts with stability:** Prefer presentation-only Field wrappers over form-library migration.

---

## MVP Definition

### Launch With (milestone done)

Minimum for “all web pages on shadcn, visual restyle only”:

- [ ] **shadcn foundation + token bridge** on web build — one semantic system
- [ ] **WebShell + theme toggle** restyled
- [ ] **Gallery, Wizard, OAuth callback** fully on shadcn primitives (no orphan custom button language)
- [ ] **Editor shell** (sidebar, toolbar, banners, start panel) restyled
- [ ] **FormControls** (or successor wrappers) on shadcn; section UIs inherit consistency
- [ ] **Dialogs + command palette** restyled
- [ ] **Loading/empty/error** states present on gallery, OAuth, empty editor
- [ ] **Web-only isolation** verified (desktop visual/behavior not forced)
- [ ] **Behavior smoke:** import → edit → dirty → download; gallery use preset; wizard create; share; OAuth path still works

### Add After Validation (polish / v1.x of restyle)

- [ ] **Sonner toasts** for save/download success — when status strip feels weak
- [ ] **Skeleton gallery** + refined Empty components
- [ ] **Tooltip** migration for field hints
- [ ] **Sheet mobile nav** if responsive QA fails
- [ ] **Visual regression checklist/automation**

### Future Consideration (later milestones)

- [ ] Desktop shadcn migration sharing `components/ui`
- [ ] Optional RHF only for *new* forms (not preference graph rewrite)
- [ ] Density modes, advanced Sidebar collapsible patterns
- [ ] Broader design tokens / brand kit beyond clean defaults

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| shadcn foundation + tokens | HIGH | MEDIUM | P1 |
| Web-only isolation strategy | HIGH | MEDIUM | P1 |
| WebShell + theme | HIGH | LOW | P1 |
| Gallery / Wizard / OAuth pages | HIGH | MEDIUM | P1 |
| Editor shell chrome | HIGH | MEDIUM | P1 |
| FormControls → shadcn | HIGH | HIGH | P1 |
| Dialogs + palette | HIGH | MEDIUM | P1 |
| Loading/empty/error parity | HIGH | LOW | P1 |
| Behavior stability smoke | HIGH | MEDIUM | P1 |
| Sonner toasts | MEDIUM | LOW | P2 |
| Skeleton / Empty polish | MEDIUM | LOW | P2 |
| Tooltip migration | MEDIUM | LOW | P2 |
| Sheet mobile nav | MEDIUM | MEDIUM | P2 |
| Density tokens | LOW–MED | MEDIUM | P3 |
| Desktop shadcn | MEDIUM | HIGH | P3 (deferred) |
| RHF preference rewrite | LOW (for this milestone) | HIGH | Anti / defer |
| Full registry dump | LOW | LOW–MED (noise) | Anti |

**Priority key:**  
- **P1:** Must have for milestone launch  
- **P2:** Should have when P1 solid  
- **P3:** Future / optional  

---

## Surface → Primitive Map (opinionated)

What this app actually needs from the shadcn registry for a complete restyle — not the whole catalog.

| Surface | Existing code | shadcn primitives to adopt |
|---------|---------------|----------------------------|
| Foundation | `index.css`, `uiClasses.ts`, `theme.ts` | CSS vars, `cn`, Button, Separator |
| Web chrome | `WebShell.tsx`, `BrandMark`, `ThemeToggle` | Button, ToggleGroup or DropdownMenu, Badge |
| Start / empty | `WebStartPanel.tsx` | Card, Empty, Button |
| Gallery | `GalleryPage.tsx` | Input, Button, Card/Item, Badge, Skeleton, Alert |
| Wizard | `WizardPage.tsx` | Card, RadioGroup or ToggleGroup, Button |
| OAuth | `OAuthCallbackPage.tsx` | Spinner, Alert, Button/Link |
| Editor shell | `ConfigApp.tsx` (web branch), `Sidebar.tsx` | Sidebar or nav list, Button, Badge, Alert, ScrollArea |
| Forms | `FormControls.tsx`, sections/* | Field, Label, Input, Textarea, Select, Switch, Checkbox, Combobox/Command, Popover, Tooltip |
| Modals | Share/Import/Load/Submit | Dialog, AlertDialog, Textarea, Button |
| Palette | `Palette.tsx` | Command + Dialog, Kbd |
| Feedback (P2) | save status text | Sonner |

**Explicitly skip for this milestone:** Chart, Calendar, Carousel, Data Table, Menubar, Input OTP, Resizable (unless proven needed), Attachment/Message AI kits.

---

## Competitor / Ecosystem Feature Analysis

How similar “admin restyle onto shadcn” efforts behave vs this project.

| Capability | Typical shadcn admin templates | Naive full rewrite | Our approach (visual-only) |
|------------|--------------------------------|--------------------|----------------------------|
| Design tokens | CSS variables + dark class | Custom theme engine | Bridge to shadcn defaults; keep system/dark/light |
| Forms | RHF + Zod demos | Rewrite all state | Keep controlled prefs; Field presentation only |
| Sidebar | shadcn Sidebar block | New IA | Restyle existing section groups |
| Command palette | Command component | New feature | Restyle existing ⌘K |
| Scope | Single web app | Greenfield | Web-only layer; desktop deferred |
| Success metric | Looks like demo dashboard | New product | All routes cohesive + behavior unchanged |

---

## Implications for Roadmap Phasing

Suggested order derived from dependencies (for roadmap author):

1. **Foundation & isolation** — init shadcn, tokens, web-scoped entry CSS, `cn`, Button proof  
2. **Chrome** — WebShell, theme, banners, start panel  
3. **Standalone pages** — Gallery, Wizard, OAuth (smaller blast radius)  
4. **Editor chrome** — Sidebar, toolbar, status  
5. **Form system** — FormControls + modal/palette (highest risk, after patterns proven)  
6. **Polish** — Skeleton, Sonner, Tooltip, responsive Sheet (P2)

**Research flags:**  
- Phase 1 (tokens + Tailwind 4 + dual theme): may need deeper stack research (class vs `data-theme` strategy).  
- Phase 5 (dense FormControls): highest regression risk; plan focused QA.  
- Phases 2–4: standard shadcn composition; unlikely to need extra research.

---

## Sources

| Source | Confidence | Use |
|--------|------------|-----|
| [shadcn/ui Vite install (existing project)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/installation/vite.mdx) | MEDIUM (official docs via GitHub raw) | Foundation steps, CLI init, aliases |
| [shadcn/ui dark mode Vite ThemeProvider](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/dark-mode/vite.mdx) | MEDIUM | light/dark/system pattern |
| [shadcn/ui React Hook Form guide](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/forms/react-hook-form.mdx) | MEDIUM | Field/data-invalid patterns; also evidence RHF is optional for presentation |
| [shadcn registry component index](https://ui.shadcn.com/r/index.json) + radix component docs tree | MEDIUM | Primitive inventory (sidebar, dialog, command, field, sonner, empty, skeleton…) |
| Local codebase: `App.web.tsx`, `WebShell`, pages, `FormControls`, `ConfigApp`, `PROJECT.md` | HIGH | Actual surface and constraints |
| `.planning/codebase/CONCERNS.md` | HIGH | Why not to touch backends / OAuth while restyling |

**Gaps (honest):**  
- No dedicated “migration playbook” primary source with HIGH confidence beyond official install docs; recommendations synthesize install docs + admin UI practice + this repo’s constraints.  
- Exact Tailwind 4 + shadcn token mapping for dual `data-theme` vs `.dark` should be validated in stack research / first implementation spike.

---

*Feature research for: shadcn visual restyle of GSD Pi Config web*  
*Researched: 2026-07-21*
