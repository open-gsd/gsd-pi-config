# Phase 1: Foundation, Isolation & Theme Bridge - Research

**Researched:** 2026-07-21  
**Domain:** shadcn/ui init on existing Vite + React 19 + Tailwind 4 dual-platform (web/desktop) app; platform CSS isolation; theme dual-write  
**Confidence:** HIGH

## Summary

Phase 1 is the **unblocking foundation** for the web-only shadcn restyle. The repo is already on the correct runtime stack (React 19.2, Vite 8, Tailwind 4.2 + `@tailwindcss/vite`). What is missing is tooling and isolation: `@/*` path aliases, a locked `components.json`, a `cn` helper, a **web-only CSS entry** with shadcn semantic OKLCH tokens, and a **theme bridge** so existing Auto/Dark/Light (`data-theme` + `gsd-pi-config.theme`) also toggles shadcn’s `.dark` class. Desktop must keep the current `gsd-*` visual system by **not** importing shadcn tokens or base layers.

Official shadcn docs for existing Vite projects prescribe: aliases → `npx shadcn@latest init` → `add` components. For this brownfield app, init must be **surgical**: never replace the existing 600+ line `src/index.css`; point CLI CSS at a new web entry, pin **one** primitive base (`base-nova` / Base UI default), neutral + CSS variables, `rsc: false`. Day-one primitives are a **minimal proof set** (Button + `cn`), not a full registry dump. Theme authority stays in `src/lib/theme.ts` — dual-write `data-theme` and `.dark`; do **not** add `next-themes` or a second storage key.

**Primary recommendation:** Split CSS first (`index.web.css` / `index.desktop.css`), lock `components.json` to web CSS + `base-nova` + neutral, dual-write theme in `applyTheme`/`bootstrapTheme`, install only Button as the walking-skeleton primitive, then prove with `tsc` + `build:web` + desktop `build` + theme matrix.

## Project Constraints (from CLAUDE.md / PROJECT.md)

| Directive | Implication for Phase 1 |
|-----------|-------------------------|
| Stay on React + Vite + TypeScript; introduce shadcn with existing Tailwind 4 | No core upgrades; TW4 CSS-first (`@tailwindcss/vite`); blank `tailwind.config` in `components.json` |
| Behavior stability (prefs, dirty/save, import/download) | Phase 1 touches **no** domain/backends; presentation/tooling only |
| Web restyle must not regress desktop | Platform CSS split + desktop never imports `components/ui/*` |
| No drive-by backend refactors / feature expansion | No FormControls rewrite, no RHF/Zod, no monorepo split |
| Security: share/redact/export secret handling | Phase 1 must not touch share/redact paths; keep theme key namespaced |
| Prefer shared tokens / design system conventions | Web uses shadcn semantic tokens (neutral defaults); GSD cyan brand override is **out of Phase 1** (clean shadcn defaults per PROJECT.md) |
| Co-located `*.test.ts`; Vitest in vite.config | Extend unit tests for theme dual-write as pure/jsdom-light tests |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Web build has shadcn initialized (CLI config, `@/*` aliases, `cn` util, baseline primitives under `src/components/ui/`) | Standard Stack + CLI steps + path alias section |
| FND-02 | Configured for Vite + React + Tailwind 4 (`components.json` locked: CSS variables, neutral base, `rsc: false`, single primitive base) | Locked `components.json` shape + Base UI pin |
| FND-03 | Only primitives needed by later web work (no full-registry dump) | Minimal day-one set: Button (+ deps CLI pulls); defer form/overlay primitives |
| FND-04 | Platform CSS split: web loads shadcn tokens; desktop keeps legacy | `index.web.css` / `index.desktop.css` + `main.tsx` import strategy |
| THM-01 | Semantic design tokens on web (background, foreground, primary, muted, destructive, border, ring); clean neutral default | Official OKLCH token block + `@theme inline` mapping |
| THM-02 | Auto / Dark / Light preserved (storage + system preference + no-flash boot) | Keep `theme.ts` API + `bootstrapTheme` before React mount |
| THM-03 | Theme bridge: GSD attributes + shadcn dark mode in sync (`data-theme` + `.dark`) | Dual-write in `applyTheme`; `@custom-variant dark (&:is(.dark *))` |
| ISO-01 | Desktop build continues with current non-shadcn styling | CSS entry isolation + no shared FormControls/ui imports on desktop |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Path aliases + Vite resolve | Build tooling | TypeScript | CLI and generated `ui/*` imports require `@/*` in both tsc and Vite |
| `components.json` / shadcn CLI | Build tooling | Browser (owned source under `src/components/ui`) | CLI writes owned source; not a runtime service |
| Platform CSS entry selection | Browser bootstrap (`main.tsx`) | Vite mode (`VITE_PLATFORM`) | Same flag already splits App.web / App.desktop |
| shadcn semantic tokens | Browser / CSS (web only) | — | Tokens power utilities; must not ship on desktop entry |
| Legacy `gsd-*` tokens + chrome CSS | Browser / CSS (desktop) | Web transitional shared chrome | Desktop keeps current look this milestone |
| Theme preference storage | Browser (localStorage) | — | UI-only; key `gsd-pi-config.theme` already exists |
| Theme application (`data-theme` + `.dark`) | Browser (`documentElement`) | — | Must run at boot before paint + on preference change |
| Baseline Button primitive | Browser / Client (web presentation) | — | Owned TSX under `components/ui`; desktop must not import |
| Domain prefs / backends / forms | API / shared app shell | — | **Out of Phase 1** — do not restyle FormControls or ConfigApp logic |

## Standard Stack

### Already in repo (do not upgrade for Phase 1)

| Technology | Version | Purpose | Why keep |
|------------|---------|---------|----------|
| React + React DOM | `^19.2.5` | UI runtime | shadcn TW4 components target React 19 (no `forwardRef`) [VERIFIED: package.json] |
| Vite | `^8.0.8` | Bundler; dual mode web/desktop | Official existing-Vite path [CITED: ui.shadcn.com/docs/installation/vite] |
| `@vitejs/plugin-react` | `^6.0.1` | React transform | Required; unchanged |
| TypeScript | `^6.0.2` | Types / `tsc` gate | `strict` + unused locals fail build |
| Tailwind CSS + `@tailwindcss/vite` | `^4.2.2` | Utility CSS | shadcn v4 is CSS-first TW4 [CITED: ui.shadcn.com/docs/tailwind-v4] |
| `@types/node` | `^25.9.1` | `path` import in vite.config | Already present for alias |
| Vitest | `^4.0.18` | Unit tests | `environment: "node"`, `src/**/*.test.ts` |

### Core (add for Phase 1)

| Library | Version (npm 2026-07-21) | Purpose | Why standard |
|---------|--------------------------|---------|--------------|
| `shadcn` (CLI via `npx shadcn@latest`) | `4.13.1` | Init + add components | Canonical install path [VERIFIED: npm registry] |
| `class-variance-authority` | `0.7.1` | Button variants | Required by shadcn Button [VERIFIED: npm registry] |
| `clsx` | `2.1.1` | Conditional classes for `cn` | Manual install docs [CITED: manual.mdx] |
| `tailwind-merge` | `3.6.0` | Conflict-safe merge (TW4-aware) | Prefer 3.x [VERIFIED: npm registry] |
| `lucide-react` | `1.25.0` | Default icon library | `iconLibrary: "lucide"` [VERIFIED: npm registry] |
| `tw-animate-css` | `1.4.0` | Enter/exit animations | Replaces deprecated `tailwindcss-animate` [CITED: tailwind-v4.mdx] |
| `@base-ui/react` | `1.6.0` (via `shadcn add`, not hand-pinned) | Headless primitives under `base-nova` | Default as of 2026-07 [CITED: 2026-07-base-ui-default.mdx] |

### Supporting (not Phase 1 installs)

| Library | When |
|---------|------|
| `cmdk`, `sonner`, `vaul` | Phase 2–3 when Command / toasts / Sheet land |
| Unified `radix-ui` | Only if team explicitly pins `-b radix` instead of Base UI |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `base-nova` + Base UI | `new-york` / `-b radix` | Fully supported; use only if team wants Radix APIs (`asChild`). **Do not mix.** |
| Dual-write `.dark` class | `@custom-variant dark (&:is([data-theme=dark] *))` only | Works for utilities but portaled shadcn docs/examples assume `.dark` class; dual-write is safer |
| Platform-split CSS files | Single `index.css` with both token systems | Higher desktop regression risk; reject for ISO-01 |
| Manual `components.json` only | Interactive `shadcn init` alone | Init can clobber brownfield CSS — prepare web CSS entry first |
| `next-themes` | Existing `theme.ts` | Next-oriented; second storage key; unnecessary |

**Installation (prescriptive order):**

```bash
# 1) After aliases + web CSS entry exist (see steps below)
npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css

# 2) Init (existing project — do NOT use -t vite which scaffolds a new app)
# Prefer defaults: base-nova, css variables on. Pin Base UI explicitly.
npx shadcn@4.13.1 init -b base -y
# If interactive prompts appear: style base-nova, baseColor neutral, cssVariables yes, rsc no
# Ensure components.json "css" points at src/index.web.css BEFORE trusting any CSS write

# 3) Minimal primitive only
npx shadcn@4.13.1 add button -y

# Primitive package versions for Base UI come from the registry via `add` — do not hand-pin @base-ui/react unless add fails
```

**Safer brownfield alternative (recommended if CLI init rewrites CSS aggressively):**

1. Hand-write `components.json` (shape below).  
2. Hand-write `src/lib/utils.ts` (`cn`).  
3. Hand-write shadcn token block into `src/index.web.css` from manual install docs.  
4. `npm install` core deps + `npx shadcn@4.13.1 add button -y`.  
5. Diff every generated file before commit.

**Locked `components.json` for this repo:**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.web.css",
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

[CITED: ui.shadcn.com components-json + manual installation; css path adapted for platform split]

**Irreversible choices (document for planner):** `style`, `baseColor`, `cssVariables` cannot be flipped without reinstalling components [CITED: components-json.mdx].

## Package Legitimacy Audit

| Package | Registry | Age / signal | Downloads (wk) | Source Repo | Verdict | Disposition |
|---------|----------|--------------|----------------|-------------|---------|-------------|
| `shadcn` | npm | latest publish 2026-07-17 (“too-new” on latest version) | ~6.6M | github.com/shadcn-ui/ui | SUS (false-positive age) | Approved — official CLI; planner optional human-verify of package name only |
| `class-variance-authority` | npm | mature | ~58M | joe-bell/cva | OK | Approved |
| `clsx` | npm | mature | ~112M | lukeed/clsx | OK | Approved |
| `tailwind-merge` | npm | mature | ~75M | dcastil/tailwind-merge | OK | Approved |
| `lucide-react` | npm | latest publish 2026-07-17 (“too-new”) | ~95M | lucide-icons/lucide | SUS (false-positive age) | Approved — official icons; same note as shadcn |
| `tw-animate-css` | npm | 2025+ | ~35M | Wombosvideo/tw-animate-css | OK | Approved |
| `@base-ui/react` | npm | stable 1.6.0 | ~7.7M | mui/base-ui | OK | Approved (install via CLI `add`, not hand-picked slop) |

**Packages removed due to [SLOP]:** none  
**Packages flagged [SUS] by seam:** `shadcn`, `lucide-react` — both have official repos and multi-million weekly downloads; “too-new” reflects **latest version publish date**, not package invention. Still tag install tasks so humans confirm they are not typosquats (`shadcn` not `shadcn-ui-cli`, etc.).

**Postinstall scripts:** none detected on core helper packages [VERIFIED: npm view scripts.postinstall].

## Architecture Patterns

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  Bootstrap: src/main.tsx                                                │
│  1. migrateLegacyStorageKeys()                                          │
│  2. bootstrapTheme()  ──dual-write──►  <html data-theme> + class .dark  │
│  3. CSS entry by VITE_PLATFORM                                          │
│       web  → index.web.css   (tailwind + tw-animate + shadcn tokens)    │
│       desk → index.desktop.css (current gsd-* tokens + chrome)          │
│  4. dynamic import App.web | App.desktop                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌──────────────────────────┐             ┌──────────────────────────┐
│ WEB presentation         │             │ DESKTOP presentation     │
│ App.web routes           │             │ DesktopApp / ConfigApp   │
│ components/ui/* (shadcn) │             │ gsd-* / FormControls     │
│ WebShell (still legacy   │             │ NO import of ui/*        │
│  until Phase 2)          │             │                          │
└────────────┬─────────────┘             └────────────┬─────────────┘
             │                                        │
             └──────────────────┬─────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SHARED (unchanged Phase 1): ConfigApp state, sections, backends, lib/*  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (Phase 1 delta)

```text
/
├── components.json              # NEW — locked CLI config (css → index.web.css)
├── vite.config.ts               # EDIT — resolve.alias @ → src
├── tsconfig.json                # EDIT — baseUrl + paths @/*
└── src/
    ├── main.tsx                 # EDIT — platform CSS import + theme boot
    ├── index.css                # MIGRATE — either delete after split or re-export desktop only
    ├── index.web.css            # NEW — TW + shadcn tokens + @custom-variant dark
    ├── index.desktop.css        # NEW — copy of current index.css (gsd-*)
    ├── lib/
    │   ├── theme.ts             # EDIT — dual-write applyTheme / bootstrapTheme
    │   ├── theme.test.ts        # NEW — dual-write + resolveTheme unit tests
    │   └── utils.ts             # NEW — cn()
    └── components/
        └── ui/
            └── button.tsx       # NEW — only baseline primitive day one
```

### Pattern 1: Path aliases before any `shadcn add`

**What:** `@/*` → `./src/*` in TypeScript **and** Vite.  
**When:** First task of Phase 1 — CLI preflight fails without it.  
**This repo note:** Single `tsconfig.json` (no `tsconfig.app.json` split) — only one TS config to edit [VERIFIED: local tsconfig.json].

```ts
// vite.config.ts — keep existing mode/web logic; add resolve.alias
import path from "path";
// ...
export default defineConfig(({ mode }) => {
  const isWeb = mode === "web";
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // ...existing define/server/test/build
  };
});
```

```json
// tsconfig.json compilerOptions additions
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

[CITED: ui.shadcn.com/docs/installation/vite — existing project]

### Pattern 2: Platform CSS split (isolation seam)

**What:** Two CSS entries selected at bootstrap by the same `VITE_PLATFORM` flag.  
**When:** Always for web-only restyle on a shared codebase (ISO-01 / FND-04).

```tsx
// src/main.tsx (conceptual)
import React from "react";
import ReactDOM from "react-dom/client";
import { migrateLegacyStorageKeys } from "./lib/storageMigration";
import { bootstrapTheme } from "./lib/theme";

if (import.meta.env.VITE_PLATFORM === "web") {
  void import("./index.web.css");
} else {
  void import("./index.desktop.css");
}

migrateLegacyStorageKeys();
bootstrapTheme();
// ... dynamic App import unchanged
```

**Prescriptive CSS content:**

`src/index.web.css` (order matters):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

/* :root + .dark OKLCH semantic tokens from official neutral scaffold */
/* @theme inline { --color-background: var(--background); ... } */
/* @layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } } */

/* Optional Phase 1: keep Geist font stack only; do NOT import gsd form tag selectors */
```

`src/index.desktop.css`: **byte-for-byte move** of current `src/index.css` (gsd tokens, form tag rules, `.gsd-btn`, modal, grid). No shadcn imports.

[CITED: manual installation CSS order; project PITFALLS.md Pitfall 1 & 4]

### Pattern 3: Theme dual-write (single authority)

**What:** Extend existing `applyTheme` so both systems flip together.  
**When:** Phase 1 (blocking for all later shadcn UI).  
**Do not:** Add `ThemeProvider` from dark-mode Vite docs or change storage key.

```ts
// src/lib/theme.ts — target applyTheme
export function applyTheme(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = effective; // GSD / desktop CSS
  document.documentElement.classList.toggle("dark", effective === "dark"); // shadcn
  document.documentElement.classList.toggle("light", effective === "light"); // optional parity with docs provider
}
```

- `bootstrapTheme()` already calls `applyTheme(resolveTheme(getStoredTheme()))` before React — keep that order for no-flash [VERIFIED: main.tsx + theme.ts].  
- `useTheme` effect already re-applies on preference/system change — dual-write rides that path.  
- Storage remains `gsd-pi-config.theme` with values `system|dark|light`.

[CITED: dark-mode/vite.mdx classList pattern; local theme.ts]

### Pattern 4: Minimal primitives as walking skeleton

**What:** Add **Button only** in Phase 1 to prove CLI → `ui/` → `cn` → tokens → build.  
**When:** After aliases + CSS + components.json.  
**Later phases** add card/input/dialog/etc. as pages need them (FND-03).

### Anti-Patterns to Avoid

- **CLI init as greenfield:** Replacing `src/index.css` wholesale — desktop + web half-themed.  
- **Shared CSS with shadcn `@layer base`:** Restyles desktop `body`/borders.  
- **Second theme owner:** `next-themes` or docs `ThemeProvider` + new localStorage key.  
- **`npx shadcn add --all`:** Full registry dump (FND-03 / out of scope).  
- **Mixing Base UI and Radix adds:** Pin `-b base` (default) or `-b radix`, never both.  
- **In-place FormControls / ConfigApp restyle:** Forces desktop visual change (ISO-01).  
- **RHF + Zod “while we’re here”:** Product/behavior rewrite — forbidden.  
- **Brand cyan as primary in Phase 1:** PROJECT.md = clean neutral shadcn defaults; cyan can wait.  
- **`shadcn apply` mid-milestone:** Overwrites theme/components.  
- **HSL `hsl(var(--token))` old guides:** Current stack is OKLCH + `@theme inline`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Class name merging | Custom string concat | `cn` = `twMerge(clsx(...))` | Conflict resolution for Tailwind utilities |
| Button variants | Ad-hoc class maps | CVA via shadcn Button | Matches registry; future `add` stays consistent |
| Dark mode detection | Parallel preference store | Existing `theme.ts` | Already has system + storage + no-flash boot |
| Theme provider for Vite | Copy docs ThemeProvider | Dual-write `applyTheme` | Avoids dual keys and API rename of `useTheme` |
| TW4 animations plugin | `tailwindcss-animate` + `@plugin` | `tw-animate-css` import | Official deprecation path |
| Design tokens inventing | Custom `--web-*` parallel set | shadcn semantic OKLCH tokens | Components expect `background`/`primary`/… |
| Path resolution | Babel plugin / relative-only forever | tsconfig paths + Vite alias | CLI generates `@/` imports |

**Key insight:** Phase 1 is **integration**, not invention — wire official pieces into this dual-platform bootstrap without rewriting the product.

## Common Pitfalls

### Pitfall 1: CLI clobbers brownfield CSS
**What goes wrong:** `init` rewrites globals; GSD tokens and desktop chrome disappear.  
**Why:** Happy path assumes nearly empty CSS.  
**How to avoid:** Point `tailwind.css` at empty/new `index.web.css`; diff every write; prefer manual token paste.  
**Warning signs:** `index.css` history shows wholesale replacement; `bg-gsd-bg` breaks on desktop.

### Pitfall 2: Dual theme systems desync
**What goes wrong:** Page chrome flips via `data-theme` but Button stays light (or reverse).  
**Why:** shadcn uses `.dark` + semantic tokens; app uses `data-theme` + `--gsd-*`.  
**How to avoid:** Dual-write in one function; one storage key; no second provider.  
**Warning signs:** Theme toggle only half-works; FOUC on light machines.

### Pitfall 3: Missing aliases
**What goes wrong:** `Cannot find module '@/lib/utils'`; CLI preflight fails.  
**Why:** Repo historically uses relative imports only.  
**How to avoid:** tsconfig + vite alias before `add button`; verify with `tsc`.  
**Warning signs:** Red squiggles only in `components/ui/*`.

### Pitfall 4: Global form tag selectors on web
**What goes wrong:** Later Input/Select get double borders (Phase 2+).  
**Why:** Desktop `index.css` styles bare `input`/`select`/`textarea`.  
**How to avoid:** Leave those rules **only** in `index.desktop.css`; never copy into web entry.  
**Warning signs:** shadcn Input height/focus fights globals (appears when forms migrate).

### Pitfall 5: Base UI vs Radix mix
**What goes wrong:** Inconsistent `render` vs `asChild`, portal quirks.  
**Why:** 2026-07 default is Base UI; old tutorials assume Radix.  
**How to avoid:** Pin once in `components.json` / `-b base`; never re-init casually.  
**Warning signs:** Both `@base-ui/react` and many `@radix-ui/*` without a written decision.

### Pitfall 6: Irreversible components.json mistakes
**What goes wrong:** Wrong `baseColor` or `cssVariables: false` forces mass re-add.  
**How to avoid:** Lock neutral + cssVariables true + rsc false on day one; commit immediately.

### Pitfall 7: Dynamic CSS import timing
**What goes wrong:** Flash of unstyled content if CSS is async after paint.  
**How to avoid:** Prefer **static** conditional is not possible for both in one graph without separate entries — use two static imports gated by build-time `import.meta.env.VITE_PLATFORM` so Vite tree-shakes the other file:

```ts
// Preferred: build-time dead-code elimination (both are static for analyzer)
if (import.meta.env.VITE_PLATFORM === "web") {
  await import("./index.web.css"); // still async — better:
}
```

**Prescriptive preferred form** (synchronous side-effect import selected by define):

```ts
// main.tsx — Vite replaces import.meta.env.VITE_PLATFORM at build time
import "./platform.css"; // BAD if shared

// GOOD: two entry points is ideal but expensive; use:
import.meta.env.VITE_PLATFORM === "web"
  ? await import("./index.web.css")
  : await import("./index.desktop.css");
// Call bootstrapTheme AFTER CSS module evaluates, or keep CSS as static:
// import "./index.web.css" only in a web-only main — not available today.
```

**Planner note:** Safest pattern for this repo’s single `main.tsx`:

```ts
import "./index.css"; // becomes a 1-line re-export OR

// Best isolation with zero FOUC risk:
// Change main to always:
import platformStyles from /* not */ 
```

**Resolved recommendation [ASSUMED → implement as static dual import with define]:**

```ts
// Because vite.config define hardcodes VITE_PLATFORM per mode, use:
if (import.meta.env.VITE_PLATFORM === "web") {
  import("./index.web.css");
} else {
  import("./index.desktop.css");
}
```

Vite includes only the reachable branch when `import.meta.env.VITE_PLATFORM` is a compile-time string compare — verify in both `build` and `build:web` that the opposite CSS file is **not** in the bundle (or is empty chunk). If tree-shaking fails, fall back to:

```ts
// vite.config.ts alias:
// "@platform-css": isWeb ? "./src/index.web.css" : "./src/index.desktop.css"
import "@platform-css";
```

This alias approach is **preferred** for FOUC-free static import [ASSUMED: Vite define + resolve.alias pattern used successfully in dual-mode apps; verify in plan Wave 0].

### Pitfall 8: Scope creep in Phase 1
**What goes wrong:** “While we’re here” restyles WebShell, FormControls, or adds full primitive set.  
**How to avoid:** Phase 1 success criteria only — foundation, isolation, theme bridge, Button proof.

## Code Examples

### `cn` helper

```ts
// src/lib/utils.ts
// Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/manual.mdx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Theme dual-write + no-flash boot

```ts
// Source: local theme.ts extended with shadcn dark-mode Vite pattern
// https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx

export function applyTheme(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = effective;
  root.classList.toggle("dark", effective === "dark");
  // Optional: keep class list exclusive
  root.classList.toggle("light", effective === "light");
}

export function bootstrapTheme() {
  applyTheme(resolveTheme(getStoredTheme()));
}
```

### Web CSS skeleton (neutral)

```css
/* Source: manual installation + theming docs (neutral OKLCH) */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

/* paste official :root / .dark OKLCH block + @theme inline color bindings */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Button smoke import (web-only proof — optional)

```tsx
// Example only — do not wire into desktop paths
import { Button } from "@/components/ui/button";

// Temporary Phase 1 proof: unused export or web-only dev banner
export function ShadcnSmoke() {
  return <Button type="button">shadcn ok</Button>;
}
```

Prefer **build-time import** of Button from a web-only file (e.g. future WebShell) over polluting shared ConfigApp. Phase 1 may leave Button unmounted if `tsc` + bundle resolve are verified another way (e.g. `src/components/ui/button.smoke.test.ts` that imports the module).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix default for new shadcn projects | Base UI default (`base-nova`) | 2026-07 | Pin base; Radix via `-b radix` |
| `tailwindcss-animate` plugin | `tw-animate-css` CSS import | 2025-03 | Use `@import "tw-animate-css"` |
| HSL CSS variables | OKLCH tokens + `@theme inline` | TW4 / shadcn v4 | Copy current docs, not old blogs |
| `forwardRef` primitives | Ref-as-prop + `data-slot` | React 19 / shadcn TW4 | Only CLI-generated components |
| Style `default` | Deprecated → nova / new-york families | TW4 era | Never set `style: "default"` |
| Individual `@radix-ui/react-*` sprawl | Base UI **or** unified `radix-ui` | 2026 | One base only |

**Deprecated/outdated for this phase:**
- `tailwind.config.js` content paths for new shadcn installs (leave blank)  
- `next-themes` as required for Vite (optional pattern only — we bridge existing theme)  
- Full `npx shadcn add --all --overwrite` as setup step  

## Exact shadcn CLI Steps for THIS Repo

Ordered plan the planner should turn into tasks:

| Step | Action | Verify |
|------|--------|--------|
| 1 | Add `baseUrl` + `paths` `@/*` → `./src/*` in `tsconfig.json` | `tsc` still green |
| 2 | Add `resolve.alias["@"]` in `vite.config.ts` (keep web/desktop mode) | Dev server resolves `@/lib/...` |
| 3 | Prefer `@platform-css` alias **or** compile-time CSS branch in `main.tsx` | `build` and `build:web` each load correct CSS |
| 4 | Copy `src/index.css` → `src/index.desktop.css` | Desktop styles unchanged |
| 5 | Create `src/index.web.css` with TW import only initially | Web still paints |
| 6 | Write/lock `components.json` (css: `src/index.web.css`, base-nova, neutral, rsc false) | File committed |
| 7 | `npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css` | lockfile updated |
| 8 | Manual merge or `npx shadcn@4.13.1 init -b base -y` **with CSS target = web** | Diff CSS; desktop file untouched |
| 9 | Ensure web CSS has tokens + `@custom-variant dark` + `@import "shadcn/tailwind.css"` | Inspect file |
| 10 | Add `src/lib/utils.ts` (`cn`) if init did not | Import works |
| 11 | Dual-write `applyTheme` / keep `bootstrapTheme` first in main | Theme unit tests |
| 12 | `npx shadcn@4.13.1 add button -y` | `src/components/ui/button.tsx` exists |
| 13 | `npm test` + `npm run build:web` + `npm run build` | All green |
| 14 | Manual: web theme Auto/Dark/Light; desktop visual smoke | ISO-01 / THM-02/03 |

**CLI flags reference [VERIFIED: `npx shadcn@4.13.1 init --help`]:**
- `-b, --base <base>`: `base` | `radix` | `aria` → use **`base`**
- `--css-variables` default true  
- `-y` skip confirmation  
- `-d, --defaults` defaults to **Next** template — **do not use `-d` on this existing Vite app**  
- Do **not** pass `-t vite` (scaffolds new project)

## Baseline Primitives — Day One vs Later

| Primitive | Phase 1 | Later phase | Why |
|-----------|---------|-------------|-----|
| `button` | **Yes** | — | Walking skeleton; Phase 2 chrome |
| `utils`/`cn` | **Yes** | — | Required by all ui/* |
| `card`, `input`, `label`, `textarea`, `badge`, `separator` | No | Phase 2 | Web pages/chrome |
| `dialog`, `alert-dialog`, `dropdown-menu`, `command` | No | Phase 3 | Overlays |
| `select`, `checkbox`, `switch`, `tabs`, `scroll-area`, `sheet`, `sidebar` | No | Phase 4 | Forms/editor |
| Chart, Calendar, Carousel, Data Table | Never v1 | — | Out of scope |

## What NOT to Do (Phase 1)

1. Restyle desktop visuals or shared FormControls/ConfigApp chrome  
2. `shadcn add --all` or mass registry install  
3. Rewrite forms with React Hook Form + Zod  
4. Introduce monorepo / `packages/ui`  
5. Replace `theme.ts` with `next-themes`  
6. Map brand cyan into `--primary` (defer; neutral MVP)  
7. Touch OAuth, share/redact, backends, or preference serialization  
8. Delete `gsd-*` tokens from desktop CSS  
9. Mix Base UI and Radix components  
10. Run `shadcn apply` to “refresh theme”

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vite compile-time `import.meta.env.VITE_PLATFORM` branch tree-shakes the unused CSS entry; if not, `@platform-css` alias is the fallback | Pitfall 7 / CSS split | Desktop might ship shadcn CSS (ISO-01 fail) or web might FOUC |
| A2 | `shadcn init -b base` maps to `base-nova` style without interactive style prompt when `components.json` is pre-written | CLI steps | May need fully manual components.json + add only |
| A3 | Leaving Button unmounted is acceptable if `tsc` resolves `@/components/ui/button` (optional smoke component) | Primitives | Planner may prefer a visible web-only smoke control |
| A4 | Neutral OKLCH defaults are acceptable for Phase 1 visual acceptance (not GSD cyan) | THM-01 / PROJECT | Stakeholders may expect cyan immediately — product decision already “clean defaults” |
| A5 | Dual-writing `.dark` is sufficient for portaled components without also mapping `--gsd-*` into shadcn tokens | Theme bridge | Shared pages during Phase 2 may still show mixed chrome until restyle completes |

**If empty:** N/A — table above lists residual assumptions for planner confirmation.

## Open Questions

1. **CSS split mechanism: env branch vs Vite alias?**  
   - What we know: both can work; alias is FOUC-safer.  
   - What's unclear: which pattern this team prefers in `vite.config.ts`.  
   - Recommendation: **`@platform-css` resolve.alias** gated by `isWeb` + static `import "@platform-css"` in `main.tsx`.

2. **Visible Button smoke vs import-only?**  
   - Recommendation: import-only + unit/build gates for Phase 1; Phase 2 mounts Button in WebShell.

3. **Keep `src/index.css` as shim?**  
   - Recommendation: remove direct use; leave a short comment file or delete after split to avoid accidental dual imports.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm scripts / CI | ✓ | v26.0.0 (local); CI uses 20 | Use Node 20+ per project |
| npm | installs | ✓ | 11.12.1 | — |
| npx | shadcn CLI | ✓ | 11.12.1 | — |
| Vite / React / TW4 | app | ✓ | package.json | — |
| Rust / Tauri | desktop build smoke | not probed this session | — | Phase 1 desktop gate can be `npm run build` (frontend) only; full `tauri build` optional |
| `components.json` / shadcn | foundation | ✗ missing | — | Create in Phase 1 |
| `@/*` alias | CLI | ✗ missing | — | Add in Phase 1 |
| jsdom / happy-dom | DOM theme tests | ✗ not installed | — | Test `applyTheme` with minimal `document` mock **or** install `happy-dom` as devDep for theme tests |

**Missing dependencies with no fallback:** none for foundation tooling (Node/npm present).  
**Missing with fallback:** DOM test environment — use mock `document.documentElement` in node tests without jsdom.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^4.0.18` |
| Config file | `vite.config.ts` → `test: { environment: "node", include: ["src/**/*.test.ts"] }` |
| Quick run command | `npm test` |
| Full suite command | `npm test` (single suite today) |
| Typecheck / build | `npx tsc --noEmit` (via `npm run build` / `build:web`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| FND-01 | `@/` resolves; `cn` merges classes; Button module imports | unit | `npx vitest run src/lib/utils.test.ts src/components/ui/button.import.test.ts` | ❌ Wave 0 |
| FND-02 | `components.json` fields locked | unit/static | `node -e "JSON.parse...assert"` or small `components.json` assert test | ❌ Wave 0 |
| FND-03 | Only expected ui files present (no dump) | static | script/assert `src/components/ui` file list ⊆ allowlist | ❌ Wave 0 |
| FND-04 | Web CSS contains shadcn tokens; desktop CSS lacks them | unit/static | file content assertions | ❌ Wave 0 |
| THM-01 | Web CSS defines `--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--border`, `--ring` | static | read `index.web.css` | ❌ Wave 0 |
| THM-02 | `resolveTheme` / storage / system preference | unit | `npx vitest run src/lib/theme.test.ts` | ❌ Wave 0 |
| THM-03 | `applyTheme('dark')` sets `data-theme=dark` and `.dark` class; light clears `.dark` | unit (mock document) | `npx vitest run src/lib/theme.test.ts` | ❌ Wave 0 |
| ISO-01 | Desktop CSS entry has no `shadcn/tailwind` import; desktop build succeeds | static + build | `npm run build` + grep desktop CSS | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/theme.test.ts src/lib/utils.test.ts` (once files exist)  
- **Per wave merge:** `npm test && npm run build:web && npm run build`  
- **Phase gate:** Full above + manual theme matrix + desktop visual smoke  

### Manual checks (phase gate)

| Check | How |
|-------|-----|
| No-flash boot | Web: set light theme, hard reload — no dark flash |
| Auto theme | OS preference flip updates both chrome tokens and Button (if mounted) |
| Desktop isolation | Open desktop dev or compare screenshots pre/post — gsd look intact |
| Bundle isolation | Confirm web dist CSS includes semantic tokens; desktop dist does not pull shadcn base |

### Wave 0 Gaps

- [ ] `src/lib/theme.test.ts` — covers THM-02, THM-03 (`applyTheme` dual-write, `resolveTheme`)  
- [ ] `src/lib/utils.test.ts` — covers `cn` merge behavior (FND-01)  
- [ ] Optional `src/components/ui/button.import.test.ts` — import Button without render  
- [ ] Optional static test for CSS split / components.json allowlist  
- [ ] Framework: keep Vitest node; mock `document` for theme tests (no jsdom required)  
- [ ] Do **not** expand `include` to `*.test.tsx` unless rendering tests are added later  

*(Existing `preferencesCore.test.ts` remains green; Phase 1 must not break it.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | OAuth untouched this phase |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no* | Theme preference already allowlists `system\|dark\|light` |
| V6 Cryptography | no | — |

\*No new user content surfaces. Keep storage key namespaced; never log secrets (unchanged).

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dependency typosquat on CLI package | Tampering | Install `shadcn` only; legitimacy gate; pin version `4.13.1` initially |
| Theme storage key collision with key stores | Info disclosure (low) | Keep `gsd-pi-config.theme`; do not reuse keys store prefixes |
| Accidental secret UI regression | Info disclosure | Do not edit share/ApiKeys in Phase 1 |
| Supply chain postinstall | Tampering | No postinstall on approved helpers; review lockfile diff |

## Sources

### Primary (HIGH confidence)

- [shadcn Vite existing project](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/vite.mdx) — aliases, init, add button  
- [shadcn manual installation](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/manual.mdx) — deps, CSS order, `cn`, `components.json` base-nova  
- [components.json](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx) — blank TW config, irreversible style/baseColor/cssVariables  
- [Theming](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx) — semantic tokens, `.dark`, neutral OKLCH  
- [Tailwind v4](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/tailwind-v4.mdx) — tw-animate, React 19, OKLCH  
- [Dark mode Vite](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx) — classList dark/light (bridge only; do not replace theme.ts)  
- [2026-07 Base UI default](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-07-base-ui-default.mdx) — pin `-b base` or `-b radix`  
- `npx shadcn@4.13.1 init --help` — flags (`-b`, `--css-variables`, avoid `-d` on existing Vite)  
- npm registry versions 2026-07-21 + package-legitimacy seam  
- Local: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/lib/theme.ts`, `src/index.css`, `.planning/research/*`, REQUIREMENTS/ROADMAP  

### Secondary (MEDIUM confidence)

- Project research STACK/ARCHITECTURE/PITFALLS (2026-07-21) — dual-platform isolation strategy  
- DESIGN.md — GSD cyan is product brand; Phase 1 still uses neutral shadcn per PROJECT decision  

### Tertiary (LOW confidence)

- Exact Vite CSS tree-shake behavior for env-branched dynamic imports (A1) — verify in implementation  

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — official MDX + npm versions  
- Architecture / isolation: **HIGH** — maps directly to `main.tsx` + `VITE_PLATFORM` + ISO-01  
- Theme bridge: **HIGH** — official dark mode class + existing theme.ts  
- CSS entry FOUC/tree-shake detail: **MEDIUM** — prefer alias pattern; verify in plan  
- Pitfalls: **HIGH** — prior project research + official CLI brownfield risks  

**Research date:** 2026-07-21  
**Valid until:** 2026-08-21 (shadcn CLI moves quickly; re-check `shadcn` version if delayed)
