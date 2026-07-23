# Phase 1: Foundation, Isolation & Theme Bridge - Pattern Map

**Mapped:** 2026-07-21  
**Files analyzed:** 12  
**Analogs found:** 10 / 12  

Phase 1 is tooling/isolation only: path aliases, platform CSS split, theme dual-write, `cn`, locked `components.json`, Button walking skeleton. No FormControls/ConfigApp restyle. Prefer real repo analogs for bootstrap/theme/config; use RESEARCH.md for shadcn registry files that do not exist yet.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tsconfig.json` | config | transform | `tsconfig.json` (self) | exact (extend) |
| `vite.config.ts` | config | transform | `vite.config.ts` (self) | exact (extend) |
| `components.json` | config | transform | RESEARCH locked shape | no-analog (new) |
| `src/main.tsx` | utility / bootstrap | request-response (boot) | `src/main.tsx` | exact |
| `src/index.desktop.css` | config / styles | transform | `src/index.css` | exact (byte-move) |
| `src/index.web.css` | config / styles | transform | `src/index.css` token/`@theme` pattern + RESEARCH web skeleton | partial |
| `src/index.css` | config / styles | transform | `src/index.css` | exact (shim/delete) |
| `src/lib/theme.ts` | utility / hook | event-driven + request-response | `src/lib/theme.ts` | exact (extend) |
| `src/lib/theme.test.ts` | test | transform | `src/lib/preferencesCore.test.ts` | role-match |
| `src/lib/utils.ts` | utility | transform | `src/lib/uiClasses.ts` + RESEARCH `cn` | partial |
| `src/lib/utils.test.ts` | test | transform | `src/lib/preferencesCore.test.ts` | role-match |
| `src/components/ui/button.tsx` | component | request-response | CLI registry; visual legacy: `uiClasses` + `.gsd-btn` | no-analog (new) |

**Out of Phase 1 (do not map as work):** `FormControls.tsx`, `ConfigApp.tsx`, `WebShell.tsx` restyle, ThemeToggle visual restyle (behavior preserved via `theme.ts` only).

## Pattern Assignments

### `tsconfig.json` (config, transform)

**Analog:** existing `tsconfig.json`

**Core pattern** (full file today — add only `baseUrl` + `paths`):

```1:21:tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

**Copy / extend with** (RESEARCH Pattern 1):

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

**Do not:** introduce `tsconfig.app.json` split (repo is single-config).

---

### `vite.config.ts` (config, transform)

**Analog:** existing `vite.config.ts` — keep dual-mode web/desktop.

**Imports + mode branch** (lines 4–17):

```4:17:vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isWeb = mode === "web";

  return {
    plugins: [react(), tailwindcss()],
    clearScreen: false,
    base: isWeb ? (process.env.VITE_BASE_PATH ?? "/") : "/",
    define: {
      "import.meta.env.VITE_PLATFORM": JSON.stringify(isWeb ? "web" : "desktop"),
    },
```

**Core pattern to add** — `resolve.alias` for `@` (and preferred `@platform-css`):

```ts
import path from "path";
// inside return:
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    // Preferred FOUC-free CSS isolation (RESEARCH Pitfall 7):
    "@platform-css": path.resolve(
      __dirname,
      isWeb ? "./src/index.web.css" : "./src/index.desktop.css",
    ),
  },
},
```

**Preserve unchanged:** `plugins`, `define.VITE_PLATFORM`, web proxy, `test.environment: "node"`, ports 5173/1420.

`@types/node` already in `package.json` for `path` / `__dirname`.

---

### `components.json` (config, transform)

**Analog:** none in repo — use RESEARCH locked shape only.

**Core pattern** (from `01-RESEARCH.md`):

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

**Irreversible:** `style`, `baseColor`, `cssVariables` — lock day one.  
**CLI:** `npx shadcn@4.13.1 init -b base -y` only if CSS path is already web; prefer hand-write + `add button` if init clobbers CSS. **Never** `-d` or `-t vite` on this brownfield app.

---

### `src/main.tsx` (bootstrap, boot-time)

**Analog:** existing `src/main.tsx` — platform dynamic App import + early theme boot.

**Full current pattern** (lines 1–24):

```1:24:src/main.tsx
// GSD Pi Config - Application Entry Point
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { migrateLegacyStorageKeys } from "./lib/storageMigration";
import { bootstrapTheme } from "./lib/theme";

migrateLegacyStorageKeys();
bootstrapTheme();

const loadApp = () =>
  import.meta.env.VITE_PLATFORM === "web"
    ? import("./App.web")
    : import("./App.desktop");

void loadApp().then(({ default: App }) => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
```

**Edit pattern:**

1. Replace `import "./index.css"` with static `import "@platform-css"` (alias from vite) **or** compile-time branch that tree-shakes the unused CSS entry.  
2. Keep order: migrate storage → **bootstrapTheme()** → dynamic App load.  
3. Keep `VITE_PLATFORM === "web"` App.web / App.desktop split as the isolation model for CSS.

**Related analog — boot-time localStorage safety** (`src/lib/storageMigration.ts` lines 12–26): empty `catch` for private browsing/quota — same defensive style as theme storage.

---

### `src/index.desktop.css` (styles, transform)

**Analog:** `src/index.css` — **byte-for-byte move**.

**Structure to preserve** (do not invent shadcn here):

| Section | Lines (current `index.css`) | Must keep on desktop |
|---------|----------------------------|----------------------|
| `@import "tailwindcss"` | 4 | yes |
| `:root` / `[data-theme="light"]` `--gsd-*` | 20–67 | yes |
| `@theme inline` → `--color-gsd-*` | 69–90 | yes |
| `body` / grid / form tag selectors | 92–252 | yes (form tags desktop-only) |
| `.gsd-btn*` / modal / nav / card | 313–634 | yes |

**Isolation rule:** no `@import "shadcn/tailwind.css"`, no `tw-animate-css`, no OKLCH semantic `--background`/`--primary` block, no `@custom-variant dark`.

---

### `src/index.web.css` (styles, transform)

**Analogs:**

1. **Token + `@theme inline` runtime switch pattern** from `src/index.css` (lines 6–18 comment block + 69–90) — same idea: CSS variables + `@theme inline` so utilities re-resolve without rebuild.  
2. **Content skeleton** from RESEARCH / UI-SPEC (not present in repo).

**Local pattern to mirror (GSD tokens → shadcn semantic names):**

```20:46:src/index.css
:root {
  /* opengsd.net dark tokens */
  --gsd-bg: #050507;
  ...
}
```

```69:90:src/index.css
@theme inline {
  --color-gsd-bg: var(--gsd-bg);
  ...
}
```

**Web target (copy from RESEARCH, not invent):**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

/* official neutral OKLCH :root + .dark + @theme inline semantic bindings */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Do not copy into web entry:** global `input`/`select`/`textarea` tag rules (lines 148–252 of `index.css`) — Pitfall 4 / ISO form isolation.  
**Do not** map `--gsd-accent` → `--primary` in Phase 1 (UI-SPEC / PROJECT clean neutral defaults).

**Required semantic tokens (UI-SPEC):** `--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--border`, `--ring` (+ card/popover/secondary/accent/input/radius for scaffold completeness).

---

### `src/lib/theme.ts` (utility + hook, event-driven)

**Analog:** self — extend `applyTheme` only; keep storage key and API.

**Storage + resolve pattern** (lines 13–37):

```13:37:src/lib/theme.ts
const STORAGE_KEY = "gsd-pi-config.theme";

export function getStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

export function resolveTheme(pref: ThemePreference): EffectiveTheme {
  if (pref === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  }
  return pref;
}
```

**Current apply (replace body — dual-write):**

```39:43:src/lib/theme.ts
/** Apply the effective theme to `<html data-theme="...">`. */
export function applyTheme(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = effective;
}
```

**Target `applyTheme` (RESEARCH Pattern 3):**

```ts
export function applyTheme(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = effective; // GSD / desktop CSS
  root.classList.toggle("dark", effective === "dark"); // shadcn
  // optional: root.classList.toggle("light", effective === "light");
}
```

**Hook re-apply path** (lines 60–83) already calls `applyTheme` on preference + system change — dual-write rides this without ThemeToggle edits.

**No-flash boot** (lines 97–104) — keep `bootstrapTheme` API; still called from `main.tsx` before React.

**Do not:** add `next-themes`, second storage key, or ThemeProvider.  
**Do not:** restyle `ThemeToggle.tsx` (Phase 2 / THM-04). Labels/ARIA stay as in analog below.

**Consumer analog — leave untouched this phase** (`src/components/ThemeToggle.tsx`):

```7:37:src/components/ThemeToggle.tsx
const OPTIONS: { value: ThemePreference; label: string; title: string }[] = [
  { value: "system", label: "Auto", title: "Follow system theme" },
  { value: "dark", label: "Dark", title: "Force dark theme" },
  { value: "light", label: "Light", title: "Force light theme" },
];
// role="radiogroup" aria-label="Theme"; role="radio" aria-checked
```

---

### `src/lib/theme.test.ts` (test, transform)

**Analog:** `src/lib/preferencesCore.test.ts` — Vitest `describe`/`it`/`expect`, co-located `*.test.ts`, node environment.

**Imports pattern** (lines 4–13):

```4:13:src/lib/preferencesCore.test.ts
import { describe, expect, it } from "vitest";
import type { GSDPreferences, WorkflowMode } from "../types";
import {
  buildShareablePreset,
  loadPreferencesFromText,
  ...
} from "./preferencesCore";
```

**Test style:** pure unit tests; no jsdom required today (`vite.config.ts` `test.environment: "node"`). Mock `document.documentElement` for `applyTheme` dual-write assertions (RESEARCH validation architecture).

**Cases to cover:**

| Behavior | Assert |
|----------|--------|
| `resolveTheme("dark"\|"light")` | returns same |
| `resolveTheme("system")` | uses matchMedia mock |
| `applyTheme("dark")` | `dataset.theme === "dark"` and `classList` contains `dark` |
| `applyTheme("light")` | `dataset.theme === "light"` and `dark` class removed |
| `getStoredTheme` allowlist | invalid values → `"system"` |

---

### `src/lib/utils.ts` (utility, transform)

**Analogs:**

1. **Export style:** named `export function` helpers in `src/lib/*` (e.g. `validators.ts`, `theme.ts`).  
2. **Class-name constants role:** `src/lib/uiClasses.ts` is the *legacy* presentation token module — do **not** replace it in Phase 1; `cn` is additive for shadcn `ui/*` only.  
3. **Implementation body:** RESEARCH / shadcn manual (no local `cn` yet).

**uiClasses role (leave as-is for desktop + transitional web):**

```4:14:src/lib/uiClasses.ts
/** Secondary action — 40px hit area, press scale, border. */
export const btn = "gsd-btn";

/** Primary action — accent fill. */
export const btnPrimary = "gsd-btn gsd-btn-primary";
...
```

**New file pattern:**

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**File header convention:** copyright comment block matching `theme.ts` / `uiClasses.ts`.

---

### `src/lib/utils.test.ts` (test, transform)

**Analog:** `preferencesCore.test.ts` structure.

**Cases:** `cn` merges conflicting Tailwind utilities (e.g. `p-2` + `p-4` → `p-4`); conditional classes via falsy inputs.

---

### `src/components/ui/button.tsx` (component, request-response)

**Analog in repo:** none for CVA/Base UI. Closest **product** button language (do not rewrite to match — mapping only for later phases):

| Legacy (`uiClasses` + CSS) | Future shadcn (UI-SPEC) |
|----------------------------|-------------------------|
| `btnPrimary` / `.gsd-btn-primary` | `Button variant="default"` |
| `btn` / `.gsd-btn` | `outline` or `secondary` |
| `btnDanger` | `destructive` |
| min-height 40px (`.gsd-btn` lines 341–349 `index.css`) | default size ≥36px; chrome ≥40px later |

**Install pattern:** `npx shadcn@4.13.1 add button -y` after aliases + web CSS + `components.json`.  
**Deps pulled by CLI/add:** `class-variance-authority`, `@base-ui/react` (via base), uses `@/lib/utils` `cn`.  
**Mounting:** import-only + optional smoke test; **do not** import from desktop-only or shared domain modules that desktop bundle would pull. Prefer unmounted module import test over wiring into `ConfigApp` / `FormControls`.

**Legacy CSS not to delete:** `.gsd-btn` block remains in **desktop** CSS (lines 341–425 of current `index.css`).

---

## Shared Patterns

### Platform split via `VITE_PLATFORM`

**Source:** `vite.config.ts` lines 8–17; `main.tsx` lines 13–16; `App.web.tsx` default export.  
**Apply to:** CSS entry selection, any future web-only smoke mounts.  
**Rule:** same compile-time string compare already used for App import — CSS isolation must use the same flag (prefer alias).

### No-flash theme boot

**Source:** `main.tsx` lines 10–11 + `theme.ts` `bootstrapTheme`  
**Apply to:** any change to theme application — boot order stays migrate → bootstrapTheme → React.

### Defensive localStorage

**Source:** `theme.ts` get/set try/catch; `storageMigration.ts`  
**Apply to:** theme tests and any storage reads — never throw for missing storage.

### Presentation constants vs domain

**Source:** `uiClasses.ts` (presentation strings) vs `preferencesCore.ts` (domain)  
**Apply to:** Phase 1 keeps domain libs untouched; only `theme.ts` dual-write + new `utils.ts` / `ui/*`.

### Vitest node unit tests

**Source:** `vite.config.ts` test block; `preferencesCore.test.ts`  
**Apply to:** `theme.test.ts`, `utils.test.ts`, optional `button.import.test.ts`. Keep `include: ["src/**/*.test.ts"]` — no `*.test.tsx` unless rendering is required later.

### Named exports + relative imports (existing)

**Source:** project conventions  
**Apply to:** new hand-written modules use named exports. Generated `ui/*` may use `@/` aliases after tsconfig/vite support. Existing app code may keep relative imports this phase.

### Error handling (not central to Phase 1)

**Source:** conventions — validators return `string | null`; UI `setError(String(e))`  
**Apply to:** Phase 1 has no new async UI; theme apply is sync and silent on missing `document`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `components.json` | config | transform | First shadcn install; use RESEARCH locked JSON |
| `src/components/ui/button.tsx` | component | request-response | No CVA/Base UI primitives yet; generate via CLI |

**Partial analogs (implementation from RESEARCH + structure from repo):** `src/index.web.css`, `src/lib/utils.ts`.

## Metadata

**Analog search scope:** `src/main.tsx`, `src/lib/*`, `src/components/*`, `src/index.css`, `vite.config.ts`, `tsconfig.json`, `package.json`, phase RESEARCH/UI-SPEC  
**Files scanned:** ~25  
**Pattern extraction date:** 2026-07-21  

**Planner notes:**

1. Prefer `@platform-css` static import over async CSS import for FOUC.  
2. Verify both `npm run build` and `npm run build:web` that opposite CSS is not shipping shadcn tokens on desktop.  
3. Button proof = tsc/import gate; full Button language = Phase 2 WEB-06.  
4. Do not touch share/redact, backends, FormControls, or preference serialization.
