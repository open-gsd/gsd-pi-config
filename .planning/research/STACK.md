# Stack Research

**Domain:** shadcn/ui design-system adoption on existing React + Vite + Tailwind 4 dual-platform (web/desktop) config app  
**Project:** GSD Pi Config — web UI redesign (subsequent milestone)  
**Researched:** 2026-07-21  
**Confidence:** HIGH (official shadcn docs + npm versions verified; dual-platform isolation strategy MEDIUM)

## Recommended Stack

### Already in the repo (keep)

Do **not** upgrade these as part of the restyle unless something is broken. The app is already on the correct foundation for modern shadcn.

| Technology | Current version | Purpose | Why keep |
|------------|-----------------|---------|----------|
| React + React DOM | `^19.2.5` | UI runtime | shadcn v4 components target React 19 (no `forwardRef`); peer deps green |
| Vite | `^8.0.8` | Bundler / dual-mode web+desktop | Official shadcn Vite path; already splits `VITE_PLATFORM` |
| `@vitejs/plugin-react` | `^6.0.1` | React transform | Required; no change |
| TypeScript | `^6.0.2` | Types | shadcn emits TSX; keep strict mode |
| Tailwind CSS | `^4.2.2` | Utility CSS | shadcn v4 is built for Tailwind 4 (`@theme inline`, CSS-first config) |
| `@tailwindcss/vite` | `^4.2.2` | Tailwind Vite plugin | Correct TW4 integration (no PostCSS/tailwind.config.js) |
| react-router-dom | `^7.13.1` | Web routes | Unchanged; gallery/wizard/OAuth stay as routes |
| `@types/node` | `^25.9.1` | Path alias typing | Needed for `path` import in `vite.config.ts` |

### Core Technologies (add for shadcn)

| Technology | Version (npm latest verified 2026-07-21) | Purpose | Why recommended |
|------------|------------------------------------------|---------|-----------------|
| **shadcn CLI** (`shadcn` package) | `4.13.1` (`npx shadcn@latest`) | Init + add primitives from registry | Canonical install path for Vite existing projects; writes `components.json`, CSS tokens, and component source you own |
| **Style preset** | `base-nova` | Visual system / component registry style | Current shadcn default aesthetic for new projects (manual install + schema). Matches “clean shadcn defaults”. Base UI family; not the deprecated `default` style |
| **Primitive library** | `@base-ui/react@1.6.0` | Headless accessible primitives under shadcn wrappers | Official default as of 2026-07 for new shadcn projects; stable, React 19 peers OK. Installed transitively when adding components with `base-*` styles |
| **class-variance-authority** | `0.7.1` | Variant API for Button, Badge, etc. | Required by nearly every shadcn component |
| **clsx** | `2.1.1` | Conditional class strings | Standard `cn()` input |
| **tailwind-merge** | `3.6.0` | Conflict-safe class merge | Required for `cn()`; TW4-aware |
| **lucide-react** | `1.25.0` (or latest at install) | Icons | shadcn default `iconLibrary: "lucide"`; React 19 peer OK |
| **tw-animate-css** | `1.4.0` | Enter/exit / accordion animations | Replaces deprecated `tailwindcss-animate`; import as CSS, not a Tailwind plugin |

### Supporting Libraries (add only when a component needs them)

| Library | Version | Purpose | When to use |
|---------|---------|---------|-------------|
| `sonner` | `2.0.7` | Toast notifications | When restyling save/error feedback; **preferred** over deprecated shadcn `toast` |
| `cmdk` | `1.1.1` | Command palette primitive | When restyling `Palette.tsx` (⌘K) onto shadcn Command |
| `vaul` | `1.1.2` | Drawer / mobile sheet | Mobile section drawer if you replace custom sidebar drawer |
| `@radix-ui/react-slot` | (via components) | `asChild` composition on Button/Link | Only if a generated component still pulls Slot; Base UI path uses `render` prop instead |

Do **not** pre-install the full optional set. Let `npx shadcn@latest add <component>` pull peers per component.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `npx shadcn@latest init` | Project wiring | Existing Vite project path: path aliases first, then init |
| `npx shadcn@latest add` | Pull primitives into `src/components/ui/` | Prefer explicit list (button, input, card, dialog, …) not `--all` on day one |
| `npx shadcn@latest add --diff` / `--dry-run` | Safe updates | Review registry drift before overwrite |
| `npx shadcn@latest info` | Agent/context dump | Framework, CSS vars, installed components |
| Path alias `@/*` → `./src/*` | CLI + imports | Required in **both** `tsconfig.json` and `vite.config.ts` `resolve.alias` |

## Installation

### 1. Path alias (required before CLI)

`tsconfig.json` — add under `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`vite.config.ts` — extend existing config (keep web/desktop mode logic):

```ts
import path from "path";
// ...
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

`@types/node` is already a devDependency — no new install.

### 2. Core packages

```bash
# Core shadcn runtime helpers (CLI may install these during init/add as well)
npm install class-variance-authority clsx tailwind-merge lucide-react

# Animations for TW4 (dev or runtime — package is CSS-only; either is fine)
npm install tw-animate-css

# CLI available via npx; optional local install for scripts
npm install -D shadcn
```

Primitive packages (`@base-ui/react`, etc.) should come from `shadcn add`, not hand-pinned, so versions match the registry.

### 3. Init + first components

```bash
# Prefer non-interactive defaults aligned with this research:
# style base-nova, baseColor neutral, CSS variables, rsc false, lucide
npx shadcn@latest init

# Start with high-traffic primitives for web chrome + forms
npx shadcn@latest add button input label textarea select checkbox \
  switch card dialog sheet dropdown-menu tabs separator badge \
  scroll-area tooltip sidebar
```

**Expected `components.json` shape for this repo:**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Notes:

- `tailwind.config` **must be empty string** — this project uses Tailwind 4 CSS-first config (no `tailwind.config.js`).
- `rsc: false` — Vite SPA, not Next.js.
- `css` may later point at a web-only entry (see isolation below).

### 4. `cn` helper

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5. CSS imports (Tailwind 4 pattern)

Official manual stack (order matters):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

Then shadcn OKLCH tokens under `:root` / `.dark` plus `@theme inline { --color-background: var(--background); … }`.

**Do not** wipe the existing GSD token block on day one without a platform split (see isolation).

## Dual-platform isolation (project-critical)

**Goal:** Restyle **web only**; desktop keeps current GSD chrome this milestone.

### Recommended approach

| Layer | Recommendation | Rationale |
|-------|----------------|-----------|
| **Primitives** | `src/components/ui/*` via shadcn CLI | Standard location; fine if desktop never imports them |
| **Web chrome** | Restyle `WebShell`, pages (`GalleryPage`, `WizardPage`, `OAuthCallbackPage`), web start panel first | Zero desktop risk; pure web entry graph |
| **Shared shell** | Keep `ConfigApp` domain logic; swap presentation only when `variant === "web"` | Existing `variant: "desktop" \| "web"` is the right seam — do not fork business logic |
| **Class helpers** | Leave `src/lib/uiClasses.ts` + `gsd-*` CSS for desktop; web migrates off them gradually | Avoids big-bang shared CSS rewrite |
| **Global CSS** | Prefer **platform-split CSS entries** | Shared `index.css` today means shadcn `@layer base` (`body`, `* { border-border }`) and new tokens hit desktop builds too |

### Platform-split CSS (prescriptive)

```text
src/main.tsx
  └─ if VITE_PLATFORM === "web"  → import "./index.web.css"
  └─ else                        → import "./index.desktop.css"  (current styles)

src/index.web.css
  @import "tailwindcss";
  @import "tw-animate-css";
  @import "shadcn/tailwind.css";
  /* shadcn OKLCH tokens + @theme inline */
  /* optional: keep brand fonts / grid only if desired */

src/index.desktop.css
  /* current index.css content (gsd-* tokens + chrome) */
```

Point `components.json` → `"css": "src/index.web.css"` so CLI patches the web file only.

### Theme bridge (required)

| System | Mechanism today / target |
|--------|--------------------------|
| Current app | `document.documentElement.dataset.theme = "dark" \| "light"` (`src/lib/theme.ts`) |
| shadcn | `.dark` class on `<html>` + `@custom-variant dark (&:is(.dark *))` |

**Do this:** extend `applyTheme()` so web (or both platforms if harmless) sets:

- `data-theme="dark|light"` (keep desktop/GSD utilities working)
- class `dark` toggled on `<html>` for shadcn variants

Do **not** adopt `next-themes` — Vite docs use a small custom provider; this app already has `useTheme` / `bootstrapTheme`. Bridge, don’t replace.

### What not to share yet

- Do not replace desktop `gsd-btn` / form global selectors with shadcn `Button` until a later desktop milestone.
- Do not map all `--gsd-*` tokens into shadcn semantic names in a way that forces desktop visuals to change.
- Optional later: map `--primary` to brand cyan if product wants GSD brand on web; **MVP = clean neutral shadcn defaults** per project decision.

## Alternatives Considered

| Recommended | Alternative | When to use alternative |
|-------------|-------------|-------------------------|
| `base-nova` + `@base-ui/react` | `new-york` + unified `radix-ui@1.6.x` | Prefer Radix maturity / team familiarity; `npx shadcn@latest init -b radix` or style `new-york`. Fully supported; not deprecated |
| `base-nova` | Other `base-*` / `radix-*` style families (vega, maia, lyra, …) | Only if deliberately picking a non-default visual preset from shadcn/create |
| CSS variables theming | Utility-only colors (`cssVariables: false`) | Never for this app — harder dark mode + token restyle |
| Platform-split CSS | Single `index.css` with coexisting `--gsd-*` and shadcn tokens | Acceptable short-term if carefully avoiding `@layer base` body overrides; higher regression risk on desktop |
| Web-only presentation wrappers | Full monorepo `@workspace/ui` package | Overkill for single package; monorepo only if extracting a design system later |
| Custom `theme.ts` bridge | `next-themes` | Next.js-oriented; unnecessary here |
| `sonner` | Legacy shadcn toast / custom banners only | Keep banners if enough; add sonner when toast UX is needed |
| `lucide-react` | `@radix-ui/react-icons`, Tabler, etc. | Only if brand mandates different icon set (`iconLibrary` in components.json) |

## What NOT to Use

| Avoid | Why | Use instead |
|-------|-----|-------------|
| `style: "default"` | Deprecated; new projects use nova/new-york families | `base-nova` (default path) or `new-york` |
| `tailwindcss-animate` + `@plugin` | Deprecated for TW4 shadcn stack | `tw-animate-css` + `@import "tw-animate-css"` |
| Individual `@radix-ui/react-*` packages (new installs) | Registry moved to unified `radix-ui` for Radix styles | `radix-ui` package **or** Base UI via `base-nova` |
| `tailwind.config.js` / PostCSS Tailwind pipeline | Project already on `@tailwindcss/vite` TW4 | Keep Vite plugin; leave `components.json` `tailwind.config` blank |
| Forcing desktop onto shadcn this milestone | Explicit out of scope; high Tauri regression surface | Web presentation layer + platform CSS split |
| MUI / Chakra / Ant Design / Mantine | Parallel design systems; fight Tailwind + shadcn | shadcn primitives only |
| Emotion / styled-components | CSS-in-JS splits the styling model | Tailwind utilities + CVA variants |
| Global bare `input/select/textarea` CSS overrides after shadcn Input | Existing `index.css` form rules will fight shadcn controls | Scope legacy form CSS to desktop entry or `.gsd-legacy-forms` |
| Rewriting `ConfigBackend` / preferences domain for UI | Behavior stability is a constraint | Presentation-only swaps |
| `npx shadcn add --all --overwrite` early | Mass overwrite of unreviewed components | Add components as pages are restyled |
| HSL `hsl(var(--token))` wrappers from old shadcn guides | TW4 + current registry use OKLCH + `@theme inline` | Official OKLCH token block |
| Year-pinned blog tutorials for “shadcn + TW3” | Stale: no `tailwind.config` content paths, old animate plugin | ui.shadcn.com docs under `apps/v4` / current site |

## Stack Patterns by Variant

**If staying on official defaults (recommended):**

- `base-nova` + Base UI + neutral + CSS variables + lucide  
- Because: matches 2026-07 shadcn default, clean aesthetic, greenfield adoption cost is lowest  

**If team prefers Radix primitives:**

- `npx shadcn@latest init` with `--base radix` / style `new-york`  
- Unified `radix-ui` package (not many `@radix-ui/react-*` entries)  
- Same Tailwind 4 / `cn` / lucide / tw-animate stack  

**If desktop restyle is scheduled next milestone:**

- Keep primitives in `src/components/ui` shared  
- Introduce presentation adapters (`Button` web = shadcn, desktop = gsd-btn wrapper) only when needed  
- Merge CSS entries later by retiring `gsd-*`  

**If brand-colored web (post-MVP):**

- Keep semantic token names (`primary`, `background`, …)  
- Override OKLCH values only — do not hardcode cyan into every component  

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `shadcn@4.13.x` CLI | Tailwind `4.2.x`, React `19.2.x`, Vite `8.x` | Verified against official Vite + TW4 docs |
| `@tailwindcss/vite@4.2` | `tailwindcss@4.2` | Already paired in package.json |
| `tailwind-merge@3.x` | Tailwind 4 utilities (`size-*`, etc.) | Prefer 3.x over 2.x |
| `@base-ui/react@1.6` | React 17–19 | Default primitive under `base-*` styles |
| `radix-ui@1.6` | React 16.8–19 | Use only with Radix-based styles |
| `lucide-react` latest | React 16.5–19 | Peer range includes 19 |
| `cmdk@1.1` / `sonner@2` / `vaul@1.1` | React 18–19 | Safe for this app |
| `components.json` `tailwind.config: ""` | Tailwind 4 CSS-first | Non-empty path is for TW3 projects |
| Existing `data-theme` theming | shadcn `.dark` class | Must dual-write; not automatic |

## Project-fit checklist (gsd-pi-config)

| Item | Status | Action |
|------|--------|--------|
| React 19 + Vite + TW4 | Ready | No core upgrade needed |
| Path alias `@/*` | Missing | Add tsconfig + vite alias |
| `components.json` | Missing | `shadcn init` |
| `src/lib/utils.ts` `cn` | Missing | Add |
| shadcn CSS tokens | Missing | Web CSS entry |
| Theme `.dark` class | Missing | Bridge in `theme.ts` |
| Web routes surface | Ready | Restyle via `App.web.tsx` tree |
| `ConfigApp` variant seam | Ready | Use for web-only chrome |
| Desktop isolation | At risk if shared CSS | Split CSS entries |

## Confidence Assessment

| Area | Level | Notes |
|------|-------|-------|
| Core stack (React/Vite/TW4/shadcn CLI) | **HIGH** | Official Vite + TW4 + manual install docs; versions from npm |
| Style choice (`base-nova` vs Radix) | **HIGH** | Base UI default documented 2026-07; Radix still first-class |
| Supporting libs (cva/clsx/twMerge/lucide/tw-animate) | **HIGH** | Manual install docs + npm versions |
| Dual-platform CSS isolation | **MEDIUM** | Project-specific; no single upstream “Tauri+shadcn” standard — derived from this repo’s architecture |
| Exact component list for MVP | **MEDIUM** | Depends on page audit; table above is a sensible starter set |

## Sources

- [shadcn Vite installation (existing project)](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/vite.mdx) — path alias, `@tailwindcss/vite`, `shadcn init` — **HIGH**
- [shadcn manual installation](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/manual.mdx) — deps, CSS imports, `components.json` `base-nova` — **HIGH**
- [components.json reference](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx) — TW4 empty config, aliases, deprecated `default` style — **HIGH**
- [Theming / OKLCH / `.dark`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx) — **HIGH**
- [Tailwind v4 guide](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/tailwind-v4.mdx) — `@theme inline`, tw-animate migration, OKLCH — **HIGH**
- [Dark mode Vite](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx) — class-based provider pattern — **HIGH**
- [2026-07 Base UI default](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-07-base-ui-default.mdx) — new projects default Base UI; Radix via `-b radix` — **HIGH**
- [2026-02 / 2025-06 radix-ui unified package](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-02-radix-ui.mdx) — **HIGH**
- npm registry versions (`shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`, `@base-ui/react`, `radix-ui`, `cmdk`, `sonner`, `vaul`) — verified 2026-07-21 — **HIGH**
- Local codebase: `package.json`, `vite.config.ts`, `src/index.css`, `src/lib/theme.ts`, `src/App.web.tsx`, `.planning/codebase/*` — **HIGH** for fit analysis

---
*Stack research for: shadcn/ui web restyle on GSD Pi Config*  
*Researched: 2026-07-21*
