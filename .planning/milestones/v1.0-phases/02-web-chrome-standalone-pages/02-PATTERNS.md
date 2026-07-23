# Phase 2: Web Chrome & Standalone Pages - Pattern Map

**Mapped:** 2026-07-21  
**Files analyzed:** 14  
**Analogs found:** 12 / 14  

Phase 2 is **presentation-only** on web surfaces (D-21: Tokens → Shell → Pages). Domain handlers (`fetchPresetIndex`, `applyModePreset`, `completeOAuthSubmit`, draft helpers) stay intact. Prefer **existing product page structure** (Gallery/Wizard/Shell) for layout/state, and **Phase 1 Button / isolation / CSS** for primitives and tokens. New Input/Textarea come from the shadcn CLI (same walk as Button).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/index.web.css` | config / styles | transform | `src/index.web.css` (self) + `02-RESEARCH` Mist Sky map | exact (extend) |
| `src/components/ui/button.tsx` | component | request-response | `src/components/ui/button.tsx` (self) | exact (override) |
| `src/components/ui/input.tsx` | component | request-response | `src/components/ui/button.tsx` (CLI primitive shape) | role-match |
| `src/components/ui/textarea.tsx` | component | request-response | `src/components/ui/button.tsx` (CLI primitive shape) | role-match |
| `src/components/ui/label.tsx` (optional) | component | request-response | plain `<label>` in Wizard; CLI optional | partial / no-analog |
| `src/components/WebShell.tsx` | component / layout | request-response | `src/components/WebShell.tsx` (self structure) | exact (restyle) |
| `src/components/ThemeToggle.tsx` | component | event-driven | `src/components/ThemeToggle.tsx` (self semantics) | exact (restyle) |
| `src/components/WebStartPanel.tsx` | component | request-response | `src/components/WebStartPanel.tsx` (self) | exact (restyle) |
| `src/pages/GalleryPage.tsx` | component / page | request-response + CRUD (catalog) | `src/pages/GalleryPage.tsx` (self) | exact (restyle) |
| `src/pages/WizardPage.tsx` | component / page | request-response + transform | `src/pages/WizardPage.tsx` (self) | exact (restyle) |
| `src/pages/OAuthCallbackPage.tsx` | component / page | request-response | `src/pages/GalleryPage.tsx` (WebShell wrap) + self OAuth effect | role-match |
| `src/components/ui/input.import.test.ts` | test | transform | `src/components/ui/button.import.test.ts` | exact |
| `src/components/ui/textarea.import.test.ts` | test | transform | `src/components/ui/button.import.test.ts` | exact |
| `src/lib/foundation.isolation.test.ts` | test | transform | self (allowlist + token contracts) | exact (extend) |
| `src/lib/phase02.surfaces.test.ts` (proposed) | test | transform | `foundation.isolation.test.ts` source-read pattern | role-match |

**Out of Phase 2 (do not restyle):** `ConfigApp.tsx` loaded sidebar/toolbar, `FormControls.tsx`, section editors, modal Dialog system (`ShareModal` handlers only), desktop CSS, `uiClasses.ts` file (keep for Phase 3/4 consumers).

## Pattern Assignments

### `src/index.web.css` (styles, transform)

**Analog:** existing `src/index.web.css` structure + RESEARCH Mist Sky cutover

**Keep structure** (imports, dual-write dark variant, `@theme inline`, bridge utilities, `.gsd-btn*` rules):

```1:23:src/index.web.css
/* GSD Pi Config - Web platform styles (shadcn semantic tokens) */
/* Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net> */
...
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

**Replace** neutral OKLCH `:root` / `.dark` block (lines 27–119) with Mist Sky hex per UI-SPEC / RESEARCH:

```css
:root {
  --radius: 0;
  --background: #f5f7fa;
  --foreground: #14171c;
  --card: #ffffff;
  --card-foreground: #14171c;
  --popover: #ffffff;
  --popover-foreground: #14171c;
  --primary: #5a7fa8;
  --primary-foreground: #f5f7fa;
  --secondary: #eef1f5;
  --secondary-foreground: #14171c;
  --muted: #eef1f5;
  --muted-foreground: #5c6570;
  --accent: #eef1f5;
  --accent-foreground: #14171c;
  --destructive: #b85c56;
  --border: #d8dee8;
  --input: #d8dee8;
  --ring: color-mix(in oklab, #5a7fa8 25%, transparent);
  --primary-hover: #4a6d94;
  --accent-soft: rgba(90, 127, 168, 0.1);
  /* charts/sidebar: keep scaffold or map to card/muted */
}

.dark {
  --background: #0b0c0e;
  --foreground: #f2f4f7;
  --card: #111316;
  --card-foreground: #f2f4f7;
  /* ... full Mist Sky dark map from 02-RESEARCH Pattern 1 ... */
  --primary: #a8c5e8;
  --primary-foreground: #0b0c0e;
  --destructive: #e8b4b0;
  --border: #2a2e36;
  --primary-hover: #c4daf2;
  --accent-soft: rgba(168, 197, 232, 0.12);
  --radius: 0;
}
```

**Bridge remap** (current wrong cyan binding at lines 174–177 — fix in same wave):

```164:180:src/index.web.css
  --color-gsd-bg: var(--background);
  --color-gsd-surface: var(--card);
  ...
  --color-gsd-accent: var(--bridge-accent);
  --color-gsd-accent-hover: var(--bridge-accent-hover);
  --color-gsd-accent-dim: var(--bridge-accent-dim);
  --color-gsd-on-accent: var(--bridge-on-accent);
  ...
  --color-gsd-danger: var(--destructive);
```

**Target after cutover:**

```css
--color-gsd-accent: var(--primary);
--color-gsd-accent-hover: var(--primary-hover);
--color-gsd-accent-dim: var(--accent-soft);
--color-gsd-on-accent: var(--primary-foreground);
--color-gsd-danger: var(--destructive);
/* Retire cyan --bridge-accent* values or stop mapping product accent through them */
```

**Do not:** delete `.gsd-btn*` CSS (D-22 — ConfigApp still needs bridge until Phase 4).  
**Do not:** touch `src/index.desktop.css`.

---

### `src/components/ui/button.tsx` (component, request-response)

**Analog:** self (Phase 1 walking skeleton)

**Imports + CVA export pattern** (copy shape; override radius/height):

```1:58:src/components/ui/button.tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted ...",
        ...
        destructive: "bg-destructive/10 text-destructive ...", // soft — aligns D-07
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 ...",
        ...
      },
    },
    ...
  }
)

function Button({ className, variant = "default", size = "default", ...props }: ...) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

**Phase 2 overrides (edit in place):**

| Registry default | Phase 2 need |
|------------------|--------------|
| `rounded-lg` in base | `rounded-none` (or `rounded-[var(--radius)]` with `--radius: 0`) |
| size `default` = `h-8` | `h-10` / `min-h-10` (≥40px CTAs) |
| `hover:bg-primary/80` | OK **or** `hover:bg-[var(--primary-hover)]` |
| soft `destructive` fill | Keep soft (not solid red) |

**Link-as-button pattern** (prefer over nested `<Button><Link>`):

```tsx
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

<Link to="/new" className={cn(buttonVariants({ variant: "default" }), "min-h-10 rounded-none")}>
  Create new preset
</Link>

<a
  href="https://www.opengsd.net"
  target="_blank"
  rel="noopener noreferrer"
  className={cn(buttonVariants({ variant: "outline" }), "min-h-10 rounded-none hidden sm:inline-flex")}
>
  opengsd.net
</a>
```

---

### `src/components/ui/input.tsx` + `textarea.tsx` (component, request-response)

**Analog:** Button CLI install path (Phase 1) — not hand-rolled fields

**Install pattern:**

```bash
npx shadcn@4.13.1 add input textarea -y
# optional: npx shadcn@4.13.1 add label -y
```

**Post-add checklist (from Phase 1 Button discipline):**

1. Imports use `@/lib/utils` / `@/components/ui/*`  
2. No `@radix-ui/*`  
3. Override `rounded-lg` → `rounded-none`; search/title controls `min-h-10`  
4. Expand FND-03 allowlist **same PR**  
5. Add import-only tests copying `button.import.test.ts`

**Controlled usage (after verify onChange vs onValueChange):**

```tsx
// Gallery search / wizard title — verify Base UI Input controlled API after install
<Input
  type="search"
  placeholder="Search presets…"
  aria-label="Search presets"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="flex-1 min-h-10 rounded-none"
/>

// Textarea is native — safe onChange
<Textarea
  id="preset-desc"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={3}
  className="rounded-none"
/>
```

**Prefer plain `<label className="text-sm text-foreground">`** over adding Label primitive unless shared styles require it (UI-SPEC discretion).

---

### `src/components/WebShell.tsx` (layout, request-response)

**Analog:** self — preserve NAV table, shell CSS vars, BrandMark, workspace strip; replace segment pills + uiClasses

**Structure to keep** (heights, NAV, workspace strip condition):

```19:33:src/components/WebShell.tsx
const NAV: { id: WebShellNav; to: string; label: string }[] = [
  { id: "editor", to: "/", label: "Editor" },
  { id: "gallery", to: "/gallery", label: "Gallery" },
  { id: "new", to: "/new", label: "New preset" },
];

export function WebShell({ active, children, workspaceLabel }: WebShellProps) {
  const shellStyle = {
    "--gsd-shell-nav-height": "3.5rem",
    "--gsd-shell-editor-strip": "2.25rem",
    "--gsd-shell-offset":
      active === "editor"
        ? "calc(var(--gsd-shell-nav-height) + var(--gsd-shell-editor-strip))"
        : "var(--gsd-shell-nav-height)",
  } as CSSProperties;
```

**Drop imports from uiClasses:**

```8:8:src/components/WebShell.tsx
import { btn, btnSegment, btnSegmentActive, segmentGroup } from "../lib/uiClasses";
```

**Underline nav target** (D-01 / UI-SPEC — pure NavLink + CSS, not filled segments):

```tsx
<nav className="ml-1 flex items-stretch gap-1" aria-label="Main">
  {NAV.map((item) => (
    <NavLink
      key={item.id}
      to={item.to}
      end={item.id === "editor"}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center px-2 text-xs min-h-10 border-b-2 border-transparent",
          isActive
            ? "border-primary text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground font-normal",
        )
      }
    >
      {item.label}
    </NavLink>
  ))}
</nav>
```

**Header chrome target:**

- `h-[var(--gsd-shell-nav-height)]` stays **56px** (D-04)  
- Drop heavy `backdrop-blur-md` / glass — opaque `bg-background border-b border-border`  
- Prefer semantic tokens: `bg-background text-foreground` over `bg-gsd-bg`  
- External link: `buttonVariants({ variant: "outline" })` not `btn`  
- Workspace label: `text-primary font-mono text-xs` (Mist Sky, not cyan)  
- Keep PNG `BrandMark size="sm"` (D-03)

---

### `src/components/ThemeToggle.tsx` (component, event-driven)

**Analog:** self — **semantics only** (THM-04 presentation restyle)

**Keep API / a11y** (do not change `useTheme` / dual-write):

```7:37:src/components/ThemeToggle.tsx
const OPTIONS: { value: ThemePreference; label: string; title: string }[] = [
  { value: "system", label: "Auto", title: "Follow system theme" },
  { value: "dark", label: "Dark", title: "Force dark theme" },
  { value: "light", label: "Light", title: "Force light theme" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={segmentGroup} role="radiogroup" aria-label="Theme">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            title={opt.title}
            className={`text-xs font-medium ${active ? btnSegmentActive : btnSegment}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

**Target presentation:** drop `segmentGroup` / `btnSegment*`; text trio with bottom rule on active:

```tsx
<div className="flex items-center gap-0" role="radiogroup" aria-label="Theme">
  {OPTIONS.map((opt) => {
    const active = theme === opt.value;
    return (
      <button
        key={opt.value}
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => setTheme(opt.value)}
        title={opt.title}
        className={cn(
          "min-h-10 px-2 text-xs border-b-2 border-transparent",
          active
            ? "border-primary text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {opt.label}
      </button>
    );
  })}
</div>
```

**Do not:** change storage key, `setTheme` behavior, or `theme.ts` dual-write.

---

### `src/pages/GalleryPage.tsx` (page, request-response)

**Analog:** self — **handlers and list structure are the pattern**; swap chrome only

**Preserve domain** (load/use/preview — do not rewrite):

```29:91:src/pages/GalleryPage.tsx
  const loadIndex = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const index = await fetchPresetIndex();
      setEntries(index.presets ?? []);
    } catch (e) {
      setError(String(e));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);
  // ... usePreset / previewPreset with setWebDraft + ShareModal
```

**Layout constants to keep:**

- `WebShell active="gallery"`  
- `main` `max-w-3xl` + `px-4 py-8 sm:px-6`  
- Linear `ul` + `divide-y` list (already correct for D-09)  
- ShareModal handlers unchanged  

**Replace uiClasses imports:**

```17:17:src/pages/GalleryPage.tsx
import { btn, btnPrimary, heading, prose } from "../lib/uiClasses";
```

**with** `Button`, `buttonVariants`, `Input`, `cn`, semantic text classes.

**State UI (WEB-07) — structure exists; refine copy branches:**

| State | Current | Target |
|-------|---------|--------|
| Loading | `Loading presets…` | keep quiet text |
| Error | `role="alert"` + `text-gsd-danger` | `text-destructive` soft danger + Refresh |
| Empty catalog | single empty message | keep + path to Create new preset |
| Filtered empty | currently same branch as catalog empty | **split**: when `query` non-empty → “No presets match your search.” |

**CTAs:**

```tsx
<Link to="/new" className={cn(buttonVariants({ variant: "default" }), "min-h-10 rounded-none")}>
  Create new preset
</Link>
<a href={PRESETS_CONTRIBUTING_URL} ... className={cn(buttonVariants({ variant: "outline" }), ...)}>
  Submit via PR
</a>
// Row: Button default "Use preset" / outline "Preview"
// Refresh: outline "Refresh list" (copy per UI-SPEC)
```

**List surface:** drop large radius shell — `rounded-none border border-border divide-y`; tags `text-xs py-1` (not 10px).

---

### `src/pages/WizardPage.tsx` (page, transform)

**Analog:** self single-page form + WebShell

**Preserve create path:**

```19:31:src/pages/WizardPage.tsx
  const create = async () => {
    let prefs = applyModePreset({}, mode);
    prefs = applyProfilePreset(prefs, profile);
    await setWebDraft(prefs);
    writeWebDraftMeta({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
    writeWebWorkspaceLabel(
      title.trim() ? `New preset: ${title.trim()}` : "New preset (wizard)",
    );
    navigate("/");
  };
```

**Layout keep:** `WebShell active="new"`, `max-w-lg`, section labels uppercase `text-xs`.

**Drop:** `btn`, `btnPrimary`, `choiceBtn`, `choiceBtnActive`, raw inputs.

**Choice rows (D-13)** — replace tile classes:

```tsx
// Idle: border border-border bg-transparent text-muted-foreground min-h-12 p-4 rounded-none
// Active: border-l-[3px] border-l-primary bg-primary/10 text-foreground
<button
  type="button"
  onClick={() => setMode(m)}
  className={cn(
    "w-full text-sm text-left capitalize min-h-12 p-4 rounded-none border border-border",
    mode === m
      ? "border-l-[3px] border-l-primary bg-primary/10 text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  )}
>
  {m}
</button>
```

Mode row may stay flex equal-width; profile stays full-width stack (current layout intent).

**Meta + CTAs:**

```tsx
<label htmlFor="preset-title" className="text-sm text-foreground">Preset title</label>
<Input id="preset-title" value={title} onChange={...} className="rounded-none min-h-10" />
<label htmlFor="preset-desc" className="text-sm text-foreground">Short description for the gallery</label>
<Textarea id="preset-desc" ... className="rounded-none" />
<div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2 pt-2">
  <Button type="button" onClick={() => void create()} className="min-h-10 rounded-none w-full sm:w-auto">
    Open editor
  </Button>
  <Button type="button" variant="outline" onClick={skipBlank} className="min-h-10 rounded-none">
    Skip (blank)
  </Button>
</div>
```

---

### `src/components/WebStartPanel.tsx` (component, request-response)

**Analog:** self empty-state structure

**Keep:** STEPS array, 3 CTAs, gallery footer link, props `onUpload` / `onLoadPreset`.

**Drop:** `btn` / `btnPrimary` / cyan kicker reliance on bridge-only.

**Target:**

```tsx
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
  Git · Ship · Done
</p>
<h1 className="text-2xl font-semibold text-foreground mb-2">Configure GSD Pi in the cloud</h1>
// steps: border-l border-border; step markers square rounded-none (not neon dots)
<Button type="button" onClick={onUpload}>Import files</Button>
<Button type="button" variant="outline" onClick={onLoadPreset}>Load preset</Button>
<Link to="/new" className={cn(buttonVariants({ variant: "outline" }), "min-h-10 rounded-none")}>
  New preset
</Link>
// footer link: text-primary hover:underline
```

**Scope guard:** only this component — do not restyle ConfigApp toolbar/sidebar around it (D-24).

---

### `src/pages/OAuthCallbackPage.tsx` (page, request-response)

**Analog:** self for OAuth effect; **Gallery/Wizard for WebShell wrap**

**Preserve exchange** (security-sensitive):

```12:27:src/pages/OAuthCallbackPage.tsx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) {
      setError("Missing authorization code");
      return;
    }
    void (async () => {
      try {
        const prUrl = await completeOAuthSubmit(code);
        navigate("/", { replace: true, state: { prUrl } });
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [navigate]);
```

**Target chrome (D-19):**

```tsx
import { WebShell } from "../components/WebShell";
import { Button, buttonVariants } from "@/components/ui/button";
// ...
return (
  <WebShell active="editor">
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <p className="text-destructive text-sm" role="alert">{error}</p>
            <Link to="/" className={cn(buttonVariants({ variant: "link" }), "mt-4")}>
              Back to editor
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Completing sign-in…</p>
        )}
      </div>
    </main>
  </WebShell>
);
```

**Do not:** log `code`; rewrite `completeOAuthSubmit`; add confetti (D-20).

---

### Import-only tests (`input.import.test.ts`, `textarea.import.test.ts`)

**Analog:** `src/components/ui/button.import.test.ts`

```1:33:src/components/ui/button.import.test.ts
import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "./button";

describe("shadcn Button import (FND-01 / FND-03)", () => {
  it("exports a callable Button component", () => {
    expect(typeof Button === "function" || typeof Button === "object").toBe(true);
  });
  it("exposes CVA variants used by the walking skeleton", () => {
    expect(typeof buttonVariants).toBe("function");
    ...
  });
});
```

**Copy for Input/Textarea:** import-only, node env, assert export is callable; optionally assert class string contains `rounded-none` if encoded in source after override.

---

### `src/lib/foundation.isolation.test.ts` (test, transform)

**Analog:** self — update contracts with token/primitive growth

**Current allowlist (must expand):**

```16:19:src/lib/foundation.isolation.test.ts
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
]);
```

**Target allowlist:**

```ts
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
  "input.tsx",
  "input.import.test.ts",
  "textarea.tsx",
  "textarea.import.test.ts",
  // "label.tsx" only if added
]);
```

**Forbidden dump list (lines 181–190):** keep blocking `card` / `dialog` / `select` / `command`; **remove** blanket forbid of `input` (and `textarea` / `label` if added).

**Bridge test (lines 87–95):** still require `.gsd-btn` CSS presence (Phase 4); retarget accent:

- Assert Mist Sky primary present (e.g. `#a8c5e8` / `#5a7fa8`) **or** non-cyan primary  
- Assert `--primary` never `#22d3ee`  
- Prefer assert `--color-gsd-accent` maps to primary path, not require cyan `--bridge-accent` forever  

---

### `src/lib/phase02.surfaces.test.ts` (proposed test)

**Analog:** foundation isolation source-read pattern (`readFileSync` + string asserts)

**Assert Phase 2 surface files do not import:**

- `btn`, `btnPrimary`, `btnSegment`, `choiceBtn` from `uiClasses`  
- Files: `WebShell.tsx`, `ThemeToggle.tsx`, `WebStartPanel.tsx`, `GalleryPage.tsx`, `WizardPage.tsx`, `OAuthCallbackPage.tsx`  

**Assert:** `OAuthCallbackPage` source contains `WebShell`.  
**Optional:** `index.web.css` contains Mist Sky primary hex; `button.tsx` contains `rounded-none`.

---

## Shared Patterns

### Button language (WEB-06)

**Source:** `src/components/ui/button.tsx` + RESEARCH Pattern 3  
**Apply to:** WebShell external, Gallery, Wizard, WebStartPanel, OAuth back link  

- Primary → `variant="default"`  
- Secondary → `variant="outline"`  
- Soft danger → registry `destructive` (soft fill) or outline + destructive text  
- Links → `buttonVariants` on `Link`/`a`, never nested interactive  

### Underline selection chrome

**Source:** UI-SPEC WebShell / ThemeToggle (no filled segment analog — **anti-pattern** is `segmentGroup` + `btnSegmentActive` in `uiClasses.ts` lines 10–14, 46–47)  
**Apply to:** main nav + theme trio  

### Quiet load / empty / error (WEB-07)

**Source:** GalleryPage lines 150–171  
**Apply to:** Gallery + OAuth  

- Loading: muted text only  
- Error: soft danger + `role="alert"`  
- Empty: short copy + recovery link  

### Platform isolation (ISO)

**Source:** `foundation.isolation.test.ts` desktop suite + Phase 1 PATTERNS  
**Apply to:** all Phase 2 work  

- Edit `index.web.css` only for tokens  
- Never import `@/components/ui/*` into desktop-only paths  
- Dual build: `npm run build:web` + `npm run build`  

### Theme dual-write (THM)

**Source:** `src/lib/theme.ts` (unchanged) + ThemeToggle restyle-only  
**Apply to:** ThemeToggle only for presentation  

### Stop importing uiClasses on Phase 2 files (D-22)

**Source:** `src/lib/uiClasses.ts` — **keep file**, drop usage  

| Legacy export | Replacement |
|---------------|-------------|
| `btn` | `Button` outline / `buttonVariants({ variant: "outline" })` |
| `btnPrimary` | `Button` default / `buttonVariants({ variant: "default" })` |
| `btnSegment*` / `segmentGroup` | underline CSS on NavLink / radio |
| `choiceBtn*` | linear choice row classes |
| `heading` / `prose` | semantic `text-foreground` / `text-muted-foreground` + type scale |

### Error handling for async UI

**Source:** GalleryPage try/catch → `setError(String(e))`  
**Apply to:** keep on Gallery/OAuth; do not introduce console logging of secrets/codes  

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/ui/input.tsx` | component | request-response | Not in repo yet — use CLI registry + Button install discipline |
| `src/components/ui/textarea.tsx` | component | request-response | Same as Input |
| Underline nav / theme trio pure CSS | component | request-response | No existing underline control; **anti-analog** is filled `segmentGroup` — do not copy visual |

Planner should use **02-RESEARCH.md** + **02-UI-SPEC.md** for Mist Sky values and underline/choice-row visuals where no positive visual analog exists.

---

## Implementation wave order (from D-21)

1. **Tokens** — `index.web.css` Mist Sky + radius 0 + accent bridge remap; update isolation token tests  
2. **Primitives** — Button radius/height; `shadcn add input textarea`; FND-03 allowlist; import tests  
3. **Shell** — WebShell underline + ThemeToggle trio + external Button  
4. **Pages** — Gallery, Wizard, WebStartPanel, OAuth wrap  
5. **WEB-06 gate** — phase02.surfaces test + dual builds  

---

## Metadata

**Analog search scope:** `src/components/`, `src/pages/`, `src/lib/`, `src/index.web.css`, Phase 1 `01-PATTERNS.md`, `02-CONTEXT.md` / `02-RESEARCH.md` / `02-UI-SPEC.md`  
**Files scanned:** ~18 product + foundation files  
**Pattern extraction date:** 2026-07-21  
**Commit docs:** true (planning artifact only)  
