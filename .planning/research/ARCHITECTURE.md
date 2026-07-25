# Architecture Research

**Domain:** Dual-entry React config app (Vite web + Tauri desktop) — web-only shadcn/ui restyle  
**Researched:** 2026-07-21  
**Confidence:** HIGH (codebase structure + official shadcn docs); MEDIUM (migration sequencing judgment)

## Standard Architecture

### System Overview (current + target isolation)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Bootstrap: src/main.tsx                                                 │
│  VITE_PLATFORM → App.web | App.desktop                                   │
│  CSS entry: platform-scoped styles (target)                              │
├─────────────────────────────┬────────────────────────────────────────────┤
│  WEB presentation           │  DESKTOP presentation (unchanged)          │
│  App.web.tsx routes         │  App.desktop → DesktopApp                  │
│  WebShell / pages/*         │  existing gsd-* chrome                     │
│  components/ui/* (shadcn)   │  FormControls (legacy)                     │
│  FormControls.web adapters  │  ConfigApp variant=desktop                 │
└──────────────┬──────────────┴──────────────────┬─────────────────────────┘
               │                                 │
               └──────────────┬──────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SHARED application shell (logic, not look)                              │
│  ConfigApp state: load/save/dirty/scope/modals/section nav               │
│  PreferencesSections + sections/* (domain editors)                       │
│  props: prefs / models / settings + onChange                             │
└───────────────────────────────┬──────────────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SHARED platform I/O (do not restyle; do not fork for UI)                │
│  ConfigBackend → webBackend | tauriBackend                               │
│  lib/* domain (preferencesCore, fields, cleanPrefs, presets, …)          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Opinionated target:** Keep one React app and one shared shell/state machine. Isolate **look** at the presentation edges (CSS tokens, chrome, form primitives), not by forking `ConfigApp` business logic or section domain code. Do **not** convert the repo into a shadcn monorepo (`apps/web` + `packages/ui`) for this milestone — monorepo support is for multi-package workspaces; this project is already a single package with dual Vite modes.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `main.tsx` | Platform bootstrap; theme boot; **CSS entry split** | Dynamic `App.*` import; conditional style import |
| `App.web.tsx` | Web routes only | react-router: `/`, `/gallery`, `/new`, `/oauth/callback` |
| `App.desktop.tsx` / `DesktopApp` | Desktop shell + backend provider | `ConfigBackendProvider(tauriBackend)` |
| `WebApp` | Web backend provider + editor | `ConfigBackendProvider(webBackend)` → `ConfigApp variant="web"` |
| `ConfigApp` | Shared **state machine** (load/save/dirty/scope) | Keep logic shared; chrome/layout can branch or extract |
| `WebShell` / pages | Web-only chrome & marketing flows | First restyle targets (no desktop consumers) |
| `FormControls` API | Stable presentational contract for sections | Dual impl: legacy desktop + shadcn web |
| `components/ui/*` | shadcn primitives | CLI-generated; web presentation only (safe if desktop never imports) |
| `PreferencesSections` + `sections/*` | Domain field editors | Keep props/backend; consume FormControls API only |
| `ConfigBackend` | Platform I/O | Untouched by restyle |
| `lib/*` | Pure domain / serialization | Untouched by restyle |

## Recommended Project Structure

```
src/
├── main.tsx                      # platform app + CSS entry
├── App.web.tsx                   # web routes
├── App.desktop.tsx
├── ConfigApp.tsx                 # shared state machine (+ thin layout branch)
├── WebApp.tsx / DesktopApp.tsx
├── index.css                     # optional shared Tailwind import only
├── styles/
│   ├── desktop.css               # current gsd-* tokens + components (keep)
│   └── web.css                   # shadcn tokens + web chrome styles
├── components/
│   ├── ui/                       # shadcn primitives (button, input, dialog, …)
│   ├── form/                     # platform form adapters (stable public API)
│   │   ├── index.ts              # re-export resolved by Vite alias OR
│   │   ├── FormControls.desktop.tsx
│   │   └── FormControls.web.tsx  # shadcn-backed Field/Toggle/Select/…
│   ├── web/                      # optional home for WebShell, WebStartPanel
│   ├── sections/                 # SHARED domain sections (no direct shadcn imports)
│   ├── Sidebar.tsx               # consider Sidebar.web later if needed
│   └── …modals (shared logic; web skins via ui/*)
├── pages/                        # web-only (gallery, wizard, oauth)
├── platform/                     # backends (no visual restyle)
└── lib/                          # domain helpers (no visual restyle)
```

### Structure Rationale

- **`components/ui/`:** Official shadcn single-app layout; CLI-friendly with `@/components/ui` alias. Desktop must not import these if isolation is required.
- **`styles/web.css` vs `styles/desktop.css`:** Prevents shadcn `:root` / `.dark` tokens from overwriting `gsd-*` desktop theme on the Tauri build.
- **`form/*` dual adapters:** Sections keep one import surface; visuals swap at build time — avoids forking 20+ section files.
- **`pages/` + `WebShell`:** Already web-only; cheapest leaf-first wins.
- **No monorepo package split this milestone:** High move cost, zero product requirement; dual Vite mode already separates bundles via `VITE_PLATFORM`.

## Architectural Patterns

### Pattern 1: Platform presentation isolation (build-time)

**What:** Resolve presentation modules with the same platform flag already used for apps (`mode === "web"` → `VITE_PLATFORM=web`).  
**When to use:** Shared domain components that must look different on web vs desktop.  
**Trade-offs:** Extra files and alias config; tree-shaking stays clean. Prefer over scattering `isWeb ? shadcn : gsd` className ternaries.

**Example:**

```typescript
// vite.config.ts (conceptual)
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    // optional explicit form adapter:
    "@form-controls": path.resolve(
      __dirname,
      isWeb
        ? "./src/components/form/FormControls.web.tsx"
        : "./src/components/form/FormControls.desktop.tsx",
    ),
  },
}
```

```typescript
// sections keep domain-stable imports
import { Field, Toggle, TextField } from "../FormControls";
// FormControls.tsx becomes a thin re-export of the platform file,
// or is replaced by the alias above.
```

### Pattern 2: Leaf-first design-system migration

**What:** Restyle outward-in: primitives → web chrome → web pages → form adapters → residual editor chrome. Shared section *logic* stays put.  
**When to use:** Existing dual-platform UI with one platform frozen.  
**Trade-offs:** Temporary dual systems; faster delivery and lower desktop regression risk than big-bang rewrite.

### Pattern 3: Stable control contract over visual fork

**What:** Preserve `Field` / `Toggle` / `SelectField` / `NumberField` / `TextField` / `TagInput` / `SectionHeader` / model pickers as the **only** styling entry for sections. Implement those contracts twice (legacy CSS vs shadcn).  
**When to use:** Dense preference forms shared by both platforms.  
**Trade-offs:** Adapter work upfront; prevents N section rewrites and keeps dirty/focus/`data-field-path` behavior centralized.

**Example:**

```tsx
// FormControls.web.tsx — same props, shadcn primitives inside
export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      // keep a11y role parity with existing switch button
    />
  );
}
```

### Pattern 4: Shell state shared; chrome extracted

**What:** Leave load/save/dirty/scope/modals in `ConfigApp`. Extract or branch only the **visual frame** (sidebar, toolbar, banners) for web.  
**When to use:** 1k-line shell that already has `variant: "web" | "desktop"`.  
**Trade-offs:** Extracting chrome is cleaner long-term; short-term `isWeb` layout branches are acceptable if they stay presentational.

### Pattern 5: Token coexistence (do not clobber desktop)

**What:** Desktop continues `data-theme` + `--gsd-*` + `@theme` bindings for `bg-gsd-*`. Web uses shadcn semantic tokens (`background`, `foreground`, `primary`, …) and `.dark` (or dual-write theme bootstrap).  
**When to use:** Always for web-only restyle on a shared codebase.  
**Trade-offs:** Theme bootstrap must set both mechanisms on web if any shared code still references `gsd-*` during migration.

**Example:**

```typescript
// theme bootstrap on web (conceptual)
function applyTheme(effective: "dark" | "light") {
  document.documentElement.dataset.theme = effective; // legacy gsd
  document.documentElement.classList.toggle("dark", effective === "dark"); // shadcn
}
```

## Data Flow

### Request / edit flow (unchanged by restyle)

```
User edit in section Field
    ↓
onChange → ConfigApp setPrefs / setModelsDoc / setSettingsDoc
    ↓
useDirty / JSON compare → anyDirty
    ↓
Save → ConfigBackend.save* (web: localStorage + download; desktop: Tauri IPC)
```

### Presentation data flow (target)

```
ConfigApp (state)
  → WebEditorChrome / DesktopEditorChrome (layout only)
    → Sidebar (nav model from SECTION_GROUPS / filterSectionGroups)
    → PreferencesSections(section, ctx)
      → FormControls (platform visual)
        → components/ui/* on web only
```

### State Management

```
ConfigApp useState documents
  + useDirty(prefs)
  + backend via useConfigBackend()
No Redux/Zustand — keep it; restyle does not require a store migration.
```

### Key Data Flows

1. **Web gallery → editor:** `GalleryPage` writes web draft via `platform/web` helpers → navigate `/` → `ConfigApp` loads draft. Presentation-only restyle of gallery + shell; draft path untouched.
2. **Web save/download:** shell `save()` → `persistWebDraft` + `downloadWorkspaceFiles`. Buttons/labels can change look; sequence stays.
3. **Desktop load/save:** Tauri commands via `tauriBackend`. Must keep working under desktop CSS/FormControls after web work.
4. **Command palette focus:** sets `pendingFocus` → `[data-field-path=…]` scroll/highlight. **Web Field adapter must preserve `data-field-path`.**

## How to Isolate the Web Presentation Layer

### Hard boundaries (must not cross)

| May change for web restyle | Must stay shared / stable |
|----------------------------|---------------------------|
| `WebShell`, `pages/*`, web-only modals chrome | `ConfigBackend`, `webBackend`, `tauriBackend` |
| `components/ui/*`, web form adapters | `types.ts`, `preferencesCore`, `fields`, cleaners |
| Web CSS tokens / `styles/web.css` | Desktop `styles/desktop.css` / current `gsd-*` look |
| Web editor chrome (toolbar, nav) | Save/dirty/scope algorithms |
| Theme class application on web | Preference YAML/JSON contracts |

### Isolation tactics (ranked)

1. **CSS entry split (required)**  
   - Desktop build imports legacy styles only.  
   - Web build imports shadcn + web chrome styles.  
   - Avoid installing shadcn tokens solely on global `:root` of a single shared CSS file consumed by both builds.

2. **Import graph discipline**  
   - Sections → FormControls API only (never `@/components/ui/*` directly this milestone).  
   - Desktop components never import `components/ui/*`.  
   - Web pages/chrome may import `components/ui/*`.

3. **Build-time form adapters**  
   - Dual `FormControls.*` implementations; one public API.  
   - Preserves section files and `data-field-path` / validation wiring.

4. **Web-first surfaces first**  
   - `WebShell`, `GalleryPage`, `WizardPage`, `OAuthCallbackPage`, `WebStartPanel` have zero desktop consumers — restyle freely.

5. **Optional later:** `Sidebar.web.tsx` / editor header extraction if shell chrome is still too mixed after form adapters.

### What not to do

- Do not fork `sections/*` into `sections.web/*` for cosmetics.  
- Do not rewrite backends “while we’re here.”  
- Do not force desktop onto shadcn by editing shared `FormControls.tsx` in place.  
- Do not introduce a monorepo solely to hold shadcn.  
- Do not drop `data-field-path` or palette navigation during control swap.

## Suggested Build Order

Order is dependency-safe and desktop-risk ascending.

| Step | Work | Why this order | Desktop risk |
|------|------|----------------|--------------|
| **1. Tooling** | `@/*` alias in `tsconfig` + `vite.config`; `components.json`; `npx shadcn@latest init` (Vite, Tailwind v4, `rsc: false`, neutral base); add deps (radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css` as needed) | Unblocks all UI work | Low if CSS not yet switched |
| **2. CSS isolation** | Split or gate CSS: desktop keeps current `gsd-*`; web gets shadcn `@import "shadcn/tailwind.css"` + tokens + `@custom-variant dark`; dual-write theme bootstrap on web (`data-theme` + `.dark`) | Prevents token clobber | **Verify desktop build/visual unchanged** |
| **3. Primitives** | `button`, `input`, `label`, `textarea`, `switch`, `select`, `checkbox`, `dialog`, `sheet`, `card`, `badge`, `separator`, `scroll-area`, `dropdown-menu`, `tabs`, `tooltip` | Building blocks for chrome/forms | None if unused by desktop |
| **4. Web chrome** | Restyle `WebShell`, brand/nav, web `ThemeToggle` | Highest visibility, web-only | None |
| **5. Web pages** | `GalleryPage`, `WizardPage`, `OAuthCallbackPage`, `WebStartPanel` | Web-only routes; no FormControls coupling | None |
| **6. Web modals** | Share / Import / LoadPreset / SubmitPreset skins via Dialog + Button | Shared files — prefer prop-driven class swaps **or** thin web wrappers; avoid breaking desktop modal layout | Medium — smoke desktop modals |
| **7. Form adapters** | Implement `FormControls.web` with shadcn; keep desktop implementation as current file | Unlocks all sections on web without section rewrites | Low if build-time resolved |
| **8. Editor shell (web)** | Web sidebar/toolbar/banners inside `ConfigApp` when `variant==="web"` | Completes “editor looks shadcn” | Low if branched |
| **9. Residual polish** | Any remaining `gsd-*` on web-only paths; spacing density; mobile drawer (`Sheet`) | Acceptance: all web pages shadcn-cohesive | Low |
| **10. Regression gate** | `npm run build` (desktop) + `npm run build:web`; manual desktop smoke (load/save/scope); web gallery→edit→download | Proves isolation | N/A |

### Phase grouping for roadmap

1. **Foundation** — steps 1–3 (tooling, CSS isolation, primitives)  
2. **Web surfaces** — steps 4–6 (shell, pages, modals)  
3. **Shared editor via adapters** — steps 7–8 (forms + editor chrome)  
4. **Hardening** — steps 9–10 (polish + dual-platform regression)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| This product (single SPA + Tauri) | Dual CSS + form adapters; no monorepo |
| Later desktop adopts shadcn | Point desktop FormControls alias to web impl; merge CSS tokens carefully |
| Multiple apps share design system | Then consider shadcn monorepo `packages/ui` |

### Scaling Priorities

1. **First bottleneck:** Token collision between `gsd-*` and shadcn on a shared CSS entry — fix with split CSS early.  
2. **Second bottleneck:** Shared `FormControls` forcing desktop restyle — fix with dual adapters before mass class edits.  
3. **Third bottleneck:** 1000-line `ConfigApp` chrome mixed with state — extract chrome only if step 8 becomes unreadable.

## Anti-Patterns

### Anti-Pattern 1: Global shadcn tokens on shared `:root`

**What people do:** Run `shadcn init` into the single `index.css` both platforms import.  
**Why it's wrong:** Overwrites or fights `--gsd-*` / `data-theme` desktop look; accidental desktop restyle.  
**Do this instead:** Platform CSS entries; web owns shadcn tokens.

### Anti-Pattern 2: In-place rewrite of shared FormControls

**What people do:** Replace `Toggle`/`Field` markup with shadcn in the only FormControls file.  
**Why it's wrong:** Desktop UI changes without a desktop milestone; hard to bisect regressions.  
**Do this instead:** Dual implementations behind one API.

### Anti-Pattern 3: Forking every section for web

**What people do:** `GeneralSection.web.tsx` copies for cosmetics.  
**Why it's wrong:** Doubles domain surface; drift in dirty paths, validators, model pickers.  
**Do this instead:** Adapter at FormControls + optional shell chrome.

### Anti-Pattern 4: Restyle via backend or product rethink

**What people do:** Touch Tauri commands, draft keys, or wizard flow “while redesigning.”  
**Why it's wrong:** Expands blast radius beyond visual acceptance.  
**Do this instead:** Presentation-only PRs; behavior parity tests for save/download/import.

### Anti-Pattern 5: Runtime className thrash everywhere

**What people do:** `className={isWeb ? "bg-background" : "bg-gsd-bg"}` on every node.  
**Why it's wrong:** Unmaintainable; misses nested components; poor tree-shaking clarity.  
**Do this instead:** Platform modules + tokenized primitives.

### Anti-Pattern 6: Dropping focus/a11y contracts

**What people do:** New Field layout omits `data-field-path` or switch roles.  
**Why it's wrong:** Breaks ⌘K palette focus and keyboard/screen-reader parity.  
**Do this instead:** Preserve data attributes and ARIA from current FormControls.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| shadcn CLI | `npx shadcn@latest init` / `add` | Official Vite + Tailwind v4 path; `components.json` required for CLI |
| Tailwind v4 | `@tailwindcss/vite` (already present) | Leave `tailwind.config` empty in components.json |
| Radix primitives | Transitive via shadcn components | Web bundle size grows; desktop should not pull if unused |
| lucide-react | Icon library default for shadcn | Optional; can map sparingly |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Presentation ↔ ConfigApp state | props / local state only | No new global UI store |
| Sections ↔ I/O | `useConfigBackend()` only | Existing rule |
| Web routes ↔ editor draft | `platform/web` draft helpers | Keep when restyling gallery |
| Theme bootstrap ↔ CSS | `data-theme` (desktop) + `.dark` (web/shadcn) | Dual-write during migration |
| Form API ↔ shadcn ui | web FormControls only | Sections stay ui-agnostic |

## Major Components Map (restyle inventory)

| Surface | Path | Platform | Restyle vehicle |
|---------|------|----------|-----------------|
| Web nav chrome | `components/WebShell.tsx` | web | shadcn Button/Nav + tokens |
| Gallery | `pages/GalleryPage.tsx` | web | Card, Input, Badge, Button |
| Wizard | `pages/WizardPage.tsx` | web | Card, Radio/Toggle group, Button |
| OAuth callback | `pages/OAuthCallbackPage.tsx` | web | simple Card/Alert |
| Start panel | `components/WebStartPanel.tsx` | web | Card + Button |
| Editor shell | `ConfigApp.tsx` (web branch) | both logic / web look | layout + toolbar |
| Sidebar | `components/Sidebar.tsx` | both | web skin via classes or `.web` variant |
| Form primitives | `components/FormControls.tsx` | both | dual adapters |
| Section editors | `components/sections/*` | both | no direct restyle if adapters work |
| Modals | Share/Import/Load/Submit/Palette | both | Dialog skins carefully |
| Desktop shell | `ConfigApp` desktop path | desktop | **leave** |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Current dual-entry topology | HIGH | Mapped from `main.tsx`, `App.web.tsx`, backends, codebase ARCHITECTURE |
| shadcn Vite + Tailwind v4 install shape | HIGH | Official docs (raw MDX): Vite install, theming, components.json |
| shadcn monorepo not required here | HIGH | Monorepo docs target multi-package Turborepo; single dual-mode app fits single-app install |
| CSS + FormControls isolation strategy | HIGH | Direct consequence of shared FormControls + dual CSS token systems |
| Exact file split names / alias shape | MEDIUM | Implementation detail; pattern is solid, naming flexible |
| Modal shared-file strategy | MEDIUM | May need small desktop smoke + conditional classes |

## Sources

- Codebase: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `src/main.tsx`, `src/App.web.tsx`, `src/ConfigApp.tsx`, `src/platform/backend.tsx`, `src/components/FormControls.tsx`, `src/lib/uiClasses.ts`, `src/index.css`, `vite.config.ts`
- shadcn Vite install: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/vite.mdx  
- shadcn monorepo: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/%28root%29/monorepo.mdx  
- shadcn theming: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/%28root%29/theming.mdx  
- shadcn Tailwind v4: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/%28root%29/tailwind-v4.mdx  
- shadcn components.json: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/%28root%29/components-json.mdx  
- shadcn dark mode (Vite): https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx  
- Tauri + Vite integration (frontend host only): https://tauri.app/start/frontend/vite/

---
*Architecture research for: GSD Pi Config web-only shadcn restyle*  
*Researched: 2026-07-21*
