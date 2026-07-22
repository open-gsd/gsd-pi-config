# Phase 5: Hardening & Polish Gates - Pattern Map

**Mapped:** 2026-07-22  
**Files analyzed:** 14 (create/modify/verify)  
**Analogs found:** 12 / 14  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/sections/CustomProvidersSection.tsx` | component | CRUD (presentation) | `src/components/WebStartPanel.tsx` + `src/ConfigApp.tsx` (web Button) | role-match |
| `src/components/sections/ApiKeysSection.tsx` | component | request-response (keys I/O UI) | `src/components/WebStartPanel.tsx` + `src/ConfigApp.tsx` (web Button/banner) | role-match |
| `src/components/sections/agentSettingsEditors.tsx` | component | transform (form chrome) | `src/components/FormControls.tsx` (web ModelChain Buttons + semantic labels) | role-match |
| `src/components/sections/HooksSection.tsx` | component | request-response | Phase 2 token surfaces (`WebStartPanel.tsx`) | partial |
| `src/components/sections/WorkspaceSection.tsx` | component | request-response | Phase 2 token surfaces | partial |
| `src/components/sections/SkillsSection.tsx` | component | request-response | Phase 2 token surfaces | partial |
| `src/components/sections/McpSection.tsx` | component | request-response | Phase 2 token surfaces | partial |
| `src/components/sections/RoutingSection.tsx` | component | request-response | Phase 2 token surfaces | partial |
| Other web-visible `*Section.tsx` (P2 color sweep) | component | request-response | Phase 2 token surfaces | partial |
| `src/ConfigApp.tsx` | component | request-response | Self — web already on Button | exact (verify-only) |
| `src/index.web.css` | config | file-I/O (CSS purge) | `src/lib/foundation.isolation.test.ts` keep/delete rules | exact |
| `src/lib/phase05.residual.test.ts` | test | batch (source contracts) | `src/lib/phase02.surfaces.test.ts` / `phase03.overlays.test.ts` | exact |
| `src/lib/foundation.isolation.test.ts` | test | batch | Self — update Phase 4 residual tolerance | exact |
| `src/lib/sectionConfig.ts` | config | — | Self — **do not change** `WEB_HIDDEN` | exact (freeze) |

**Out of web purge gate (do not restyle for ISO-05 success):**

| File | Role | Reason |
|------|------|--------|
| `src/components/sections/SkillsLibrarySection.tsx` | component | Desktop-only via `WEB_HIDDEN_SECTIONS` (D-03) |
| `src/components/sections/AgentsLibrarySection.tsx` | component | Desktop-only via `WEB_HIDDEN_SECTIONS` (D-03) |
| `src/index.desktop.css` | config | ISO-01 — untouched |
| `src/lib/uiClasses.ts` | utility | Keep exports for desktop callers |
| `src/lib/preferencesCore.ts` | service | ISO-02 freeze — no behavior edits |

---

## Pattern Assignments

### `src/components/sections/CustomProvidersSection.tsx` (component, CRUD presentation)

**Analog:** `src/components/WebStartPanel.tsx` (Button + semantic tokens) and `src/ConfigApp.tsx` (web `Button` CTAs)

**Current residual (must remove)** — lines 12, 80–82, 163–165, 197–199, 208–210, 230–232:

```tsx
import { btn, btnPrimary, btnDanger } from "../../lib/uiClasses";
// …
<button type="button" onClick={addProvider} className={btnPrimary}>+ Add provider</button>
<button type="button" onClick={onDelete} title="Delete provider" className={`${btnDanger} shrink-0`}>Delete</button>
<button type="button" onClick={() => setShowKey((s) => !s)} className={btn}>…</button>
```

**Imports pattern** (copy from `WebStartPanel.tsx` lines 5–6):

```tsx
import { Button } from "@/components/ui/button";
// Keep FormControls imports; drop uiClasses btn* entirely
import { SectionHeader, Field, TextField, NumberField, Toggle } from "../FormControls";
```

**Core Button language** (UI-SPEC residual roles + `button.tsx` sizes):

```tsx
// Primary
<Button type="button" variant="default" size="sm" onClick={addProvider}>
  + Add provider
</Button>

// Secondary
<Button type="button" variant="outline" size="sm" onClick={() => setShowKey((s) => !s)}>
  {showKey ? "Hide" : "Show"}
</Button>
<Button type="button" variant="outline" size="sm" onClick={addModel}>
  + Add model
</Button>

// Soft destructive — NOT solid red fill; prefer outline + destructive tint
// button.tsx also exports variant="destructive" as soft wash (bg-destructive/10)
<Button
  type="button"
  variant="outline"
  size="sm"
  className="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
  title="Delete provider"
  onClick={onDelete}
>
  Delete
</Button>
```

**Token / radius migration** (from current card chrome lines 134–139, 86–88 → UI-SPEC map):

```tsx
// Count meta
<div className="text-xs text-muted-foreground">…</div>

// Empty state — radius 0, semantic surfaces
<div className="rounded-none border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
  No custom providers yet. Click <span className="font-medium">Add provider</span> to register one.
</div>

// Provider card
className={`mb-4 rounded-none border p-4 ${
  collision
    ? "border-destructive/40 bg-destructive/5"
    : "border-border bg-card"
}`}

// Labels
className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
// Collision copy
className="mt-1 text-xs text-destructive"
// Model row
className="mb-2 rounded-none border border-border bg-background p-3"
```

**Preserve (do not rewrite):** `updateProvider` / `renameProvider` / `deleteProvider` / `addProvider` / model CRUD bodies; FormControls field wiring; collision `BUILTIN_IDS` logic.

**Optional Input upgrade:** Prefer `@/components/ui/input` for provider id / password / model-id free text (analog: Gallery/Wizard `Input` import). If bare `<input>` remains, ensure desktop isolation is not broken — FormControls web path already styles native inputs via web CSS; Input is preferred for search/password consistency with ApiKeys.

---

### `src/components/sections/ApiKeysSection.tsx` (component, request-response)

**Analog:** `src/ConfigApp.tsx` web toolbar Buttons; `WebStartPanel.tsx` semantic type; soft-danger banner from RESEARCH/UI-SPEC (replaces `bannerDanger`)

**Current residual** — import line 7; Export CTA ~468; banner ~475–480; dense chips ~608–625:

```tsx
import { btn, btnPrimary, bannerDanger } from "../../lib/uiClasses";
// …
<button type="button" onClick={exportEnv} className={btnPrimary}>Export env.sh</button>
<div className={`${bannerDanger} mb-3 flex items-center justify-between text-xs`}>…</div>
<button className="text-[10px] px-3 py-1 rounded bg-gsd-accent text-gsd-on-accent …">Save</button>
```

**Imports pattern:**

```tsx
import { SectionHeader } from "../FormControls";
import { useConfigBackend } from "../../platform/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Remove uiClasses import entirely
```

**Primary / secondary CTAs** (ConfigApp web pattern ~876–885):

```tsx
// Analog: ConfigApp isWeb branch
<Button type="button" variant="default" size="sm" onClick={exportEnv}>
  Export env.sh
</Button>

// Row actions — upgrade text-[10px] px-2 py-1 chips to ≥40px (D-10 / D-12)
<Button type="button" variant="outline" size="sm" onClick={() => toggleReveal(k.name)}>
  {isRevealed ? "Hide" : "Show"}
</Button>
<Button type="button" variant="outline" size="sm" onClick={() => cancelEdit(k.name)}>
  Cancel
</Button>
<Button type="button" variant="default" size="sm" onClick={() => saveKey(k.name)}>
  Save
</Button>
// Clear key — soft destructive, keep window.confirm behavior
<Button
  type="button"
  variant="outline"
  size="sm"
  className="text-destructive border-destructive/40 hover:bg-destructive/10"
  onClick={() => clearKey(k.name)}
>
  Clear
</Button>
```

**Error banner** (replace `bannerDanger` uiClass — RESEARCH soft danger):

```tsx
{error && (
  <div
    role="alert"
    className="mb-3 flex items-center justify-between rounded-none border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
  >
    <span>{error}</span>
    <Button type="button" variant="outline" size="sm" className="ml-2" onClick={() => setError("")}>
      Dismiss
    </Button>
  </div>
)}
```

**Export success quiet banner** (map accent wash → primary soft, not logo cyan):

```tsx
<div className="mb-3 rounded-none border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
  {exportMsg}
</div>
```

**Search + type cleanup:**

```tsx
// Input analog: src/pages/GalleryPage.tsx / FormControls
<Input
  type="text"
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  placeholder="Search keys..."
  aria-label="Search keys"
  className="mb-4 w-full"
/>

// Group labels: text-[10px] → text-xs font-semibold uppercase tracking-wider text-muted-foreground
// Meta/help: text-[11px]/text-[9px] → text-xs text-muted-foreground
// Status badges Set/Installed: text-xs font-semibold uppercase tracking-wider + soft success wash (NOT primary sky, NOT #22d3ee)
// Cards: rounded-lg → rounded-none; bg-gsd-surface → bg-card; border-gsd-border → border-border
// Links: text-gsd-accent → text-primary hover:underline ("Open docs →", "Get key ↗")
// Mono env names: font-mono text-xs text-muted-foreground
```

**Button size contract** (`src/components/ui/button.tsx` lines 24–28):

```tsx
// default & sm both enforce h-10 min-h-10 — use size="sm" for residual density with 40px floor
size: {
  default: "h-10 min-h-10 …",
  sm: "h-10 min-h-10 …",
}
```

**Preserve (ISO-02 / security):** `exportEnv`, `setKey`, `clearKey`, `window.confirm(\`Delete key ${name}?\`)`, `useConfigBackend()` key APIs, masked `••••` reveal toggle, CLI status checks — presentation only.

---

### `src/components/sections/agentSettingsEditors.tsx` + other web-visible `*Section.tsx` (component, form chrome)

**Analog:** `src/components/FormControls.tsx` web ModelChain (ghost Buttons + Mist Sky label scale) and Phase 2 semantic tokens

**Core pattern from FormControls ModelChain** (`phase04.forms.test.ts` contracts ~172–186):

```tsx
// Labels: 12px uppercase muted — not legacy text-[10px] gsd
text-xs font-semibold uppercase … text-muted-foreground
// Reorder/remove as ghost Button on web
variant="ghost"
// Primary text links use text-primary (not filled default for "+ Add …" secondary links)
```

**Token migration map (apply surgically — classNames only):**

| Legacy | Semantic (web residual) |
|--------|-------------------------|
| `text-gsd-text` | `text-foreground` |
| `text-gsd-text-dim` / `-secondary` / `-muted` | `text-muted-foreground` |
| `text-gsd-accent` / hover | `text-primary` / `hover:text-primary` |
| `bg-gsd-bg` | `bg-background` |
| `bg-gsd-surface` / `-solid` | `bg-card` |
| `bg-gsd-surface-hover` | `hover:bg-muted` or `hover:bg-accent` |
| `bg-gsd-accent` / hover | Prefer `Button` default; else `bg-primary` |
| `bg-gsd-accent-dim` / `bg-gsd-accent/20` | `bg-primary/10` or `bg-primary/12` |
| `text-gsd-on-accent` | `text-primary-foreground` |
| `border-gsd-border` / `-strong` | `border-border` |
| `text-gsd-danger` / `*-gsd-danger/*` | `text-destructive` / `border-destructive/*` / `bg-destructive/*` soft |
| `rounded-lg` / `rounded-md` residual cards | `rounded-none` when restyling |
| `text-[9px]`–`text-[11px]` | `text-xs` |
| `active:scale-[0.96]` on residual web | **Remove** |

**Priority density (RESEARCH inventory):** ApiKeys ~33, agentSettingsEditors ~33, Hooks ~27, Workspace ~10, CustomProviders ~10, Skills prefs ~9, Mcp/Routing ~7, others 0–4.

**Shared-file pitfall:** Sections are shared web+desktop. Prefer semantic Tailwind color classes that remain acceptable on desktop (bridge still maps `--color-gsd-*` on web; desktop CSS has legacy surfaces). If a change forces full Mist Sky desktop look, branch with `isWebPlatform()` — **web must purge**; desktop may keep `gsd-*`.

**Do not touch:** validators, field registry, enablement predicates, `WEB_HIDDEN_SECTIONS`.

---

### `src/ConfigApp.tsx` (component, request-response — verify only)

**Analog:** Self — already correct web/desktop split

**Core pattern** (do **not** “simplify” away desktop branch):

```tsx
{isWeb ? (
  <Button type="button" variant="outline" size="sm" onClick={openImport} /* … */>
    Import
  </Button>
) : (
  <button type="button" onClick={openImport} className={btn} /* … */>
    Import
  </button>
)}
```

**Rules:**

- Desktop may keep `import { btn, btnPrimary, … } from "./lib/uiClasses"`.
- Grep: no web-rendered path with `className={btn…}` / `gsd-btn`.
- Keep `[data-field-path].gsd-field-focus` usage for palette jump (S9).
- Do not forbid ConfigApp btn imports in phase05 tests.

---

### `src/index.web.css` (config, CSS purge)

**Analog:** `src/lib/foundation.isolation.test.ts` dual-entry rules + RESEARCH Pattern 3

**Ordered gate (do not reverse):**

1. Zero web-visible TSX uiClasses btn symbols on residual sections.
2. Zero web `className` applying `gsd-btn*`.
3. Contract tests green.
4. **Then** delete from **web CSS only** (~lines 290–375 + reduced-motion `.gsd-btn:active`):

   - `.gsd-btn`, hover/active/disabled  
   - `.gsd-btn-primary` (+ hover)  
   - `.gsd-btn-segment`, `.gsd-btn-segment-active` (+ hover)  
   - Orphaned `.gsd-btn:active` under `prefers-reduced-motion`

**Keep on web:**

| Artifact | Why |
|----------|-----|
| `--color-gsd-*` theme bridge | Mid-migration residual utilities; foundation expects bridge |
| Mist Sky `--primary` / `--radius: 0` / semantic tokens | THM-01 |
| `[data-field-path].gsd-field-focus` | Palette field-jump flash |
| shadcn / tw-animate imports | Design system |

**Never delete from** `src/index.desktop.css` (must still contain `.gsd-btn`).

**Update header comment** that still says residual `.gsd-btn*` stays until Phase 4/5 — post-purge: web free of btn chrome.

---

### `src/lib/phase05.residual.test.ts` (test, source contracts) — **NEW**

**Analog:** `src/lib/phase02.surfaces.test.ts` (lines 1–103) and `src/lib/phase03.overlays.test.ts` (lines 1–88)

**Scaffold pattern** (copy structure, change file list + assertions):

```ts
// Source: phase02.surfaces.test.ts + phase03.overlays.test.ts
/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

const WEB_RESIDUAL_SECTIONS = [
  "src/components/sections/CustomProvidersSection.tsx",
  "src/components/sections/ApiKeysSection.tsx",
] as const;

const FORBIDDEN_IMPORT_SYMBOLS = [
  "btn",
  "btnPrimary",
  "btnDanger",
  "btnSegment",
  "btnSegmentActive",
  "bannerDanger", // residual should use semantic banner classes
] as const;

// Reuse importsForbiddenUiClasses helper from phase02 (import-line aware)
```

**Required cases** (RESEARCH recommended):

```ts
describe("phase05 residual web purge (ISO-05 / WEB-06 completion)", () => {
  for (const file of WEB_RESIDUAL_SECTIONS) {
    it(`${file} does not import uiClasses btn/bannerDanger symbols`, () => {
      const src = readSrc(file);
      const hits = importsForbiddenUiClasses(src);
      expect(hits, `${file} still imports: ${hits.join(", ")}`).toEqual([]);
      expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    });

    it(`${file} imports Button from ui/button`, () => {
      const src = readSrc(file);
      expect(src).toMatch(
        /from\s+["'](?:@\/components\/ui\/button|\.\.\/ui\/button|\.\.\/components\/ui\/button)["']/,
      );
    });
  }

  it("web CSS drops .gsd-btn chrome; desktop keeps it", () => {
    expect(readSrc("src/index.web.css")).not.toMatch(/\.gsd-btn\b/);
    expect(readSrc("src/index.desktop.css")).toContain(".gsd-btn");
  });

  it("WEB_HIDDEN_SECTIONS still only skills/agents libraries (ISO-05)", () => {
    const src = readSrc("src/lib/sectionConfig.ts");
    expect(src).toMatch(/skills-library/);
    expect(src).toMatch(/agents-library/);
    // Still exactly those two — do not expand/shrink without product decision
  });

  it("button primitive stays linear rounded-none + min-h-10 sm/default", () => {
    const src = readSrc("src/components/ui/button.tsx");
    expect(src).toMatch(/rounded-none/);
    expect(src).toMatch(/min-h-10/);
  });
});
```

**Do not** ban ConfigApp or Skills/Agents library uiClasses imports.

**Copyright header:** Match phase0x files:

```ts
// GSD Pi Config - Phase 5 residual purge contracts (ISO-05 / WEB-06 completion)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
```

---

### `src/lib/foundation.isolation.test.ts` (test — update)

**Analog:** Self (lines 119–132 Phase 4 residual comment)

**Current tolerance to replace:**

```ts
// Phase 4 shell migrated ConfigApp web toolbar + FormControls to Button language
// (locked RESEARCH Q2). Residual .gsd-btn* CSS may remain for library sections
// (ApiKeys / Skills / Agents) until Phase 5 full purge — do NOT require them for
// Phase 4 success, and do NOT fail if they are still present.
```

**Post-Phase-5 assertion** (align with phase05 test; avoid duplicate flakiness — either strengthen foundation or keep negative assert only in phase05):

```ts
it("web CSS no longer ships .gsd-btn chrome after Phase 5 purge", () => {
  expect(webCss).not.toMatch(/\.gsd-btn\b/);
});

// Keep existing desktop isolation:
// expect(desktopCss).toContain(".gsd-btn");
// Keep --color-gsd-* bridge + Mist Sky primary assertions
```

**Keep unchanged:** FND-03 UI allowlist (no new primitives), THM-01 token list, desktop form tag chrome, components.json locks.

---

### `src/lib/sectionConfig.ts` (config — freeze)

**Analog:** Self

```ts
export const WEB_HIDDEN_SECTIONS: readonly SectionId[] = [
  "skills-library",
  "agents-library",
] as const;
```

**Rule:** ISO-05 — do not change visibility set for “cleanup.”

---

## Shared Patterns

### 1. Residual CTA → shadcn Button (WEB-06 completion)

**Source:** `src/components/ui/button.tsx` (variants + `h-10 min-h-10`), `src/ConfigApp.tsx` web branches, `src/components/WebStartPanel.tsx`  
**Apply to:** CustomProviders, ApiKeys, any web residual native button CTAs

| Role | Variant | size |
|------|---------|------|
| Primary (Export, Add provider, Save) | `default` | `sm` |
| Secondary (Dismiss, Cancel, Show/Hide, Edit/Set, Add model) | `outline` | `sm` |
| Destructive (Delete, Remove, Clear) | soft outline/ghost + `text-destructive` **or** `variant="destructive"` soft wash | `sm` |
| Text links (Open docs, Get key) | `link` / plain `text-primary text-xs` | — |

Always `type="button"` unless submit. Never reintroduce `gsd-btn` / `btnPrimary` on web-rendered output.

### 2. Semantic token migration

**Source:** `05-UI-SPEC.md` before/after table; Phase 2 surfaces (`WebStartPanel.tsx` lines 35–44)  
**Apply to:** All web residual section chrome touched in Wave B

```tsx
// Phase 2 analog
<p className="… text-xs font-semibold uppercase tracking-[0.2em] text-primary">…</p>
<h1 className="… text-foreground">…</h1>
<p className="… text-sm text-muted-foreground">…</p>
```

Forbidden on restyled residual web: logo cyan/purple as primary, solid red fills, glass blur, ad-hoc `text-[9–11px]`.

### 3. Source contract tests (no DOM)

**Source:** `phase02.surfaces.test.ts`, `phase03.overlays.test.ts`, `phase04.forms.test.ts`  
**Apply to:** `phase05.residual.test.ts` + foundation isolation update

- `readFileSync` + path from `import.meta.url`
- Forbidden-import helper that scans `import { … } from "…uiClasses"`
- Positive: Button import; negative: uiClasses btn; CSS dual-entry assert
- Vitest only — no Playwright / axe

### 4. Platform branching (desktop isolation)

**Source:** `ConfigApp.tsx` `isWeb ? Button : button+btn`; FormControls `isWebPlatform()`  
**Apply to:** Shared files only when semantic migration would break desktop look

```tsx
// Desktop-only libraries + ConfigApp desktop branches KEEP uiClasses (D-03)
// Web residual sections SHOULD drop uiClasses entirely (shared file → Button on both is OK
// if desktop glance S10 still acceptable)
```

### 5. Soft danger banners

**Source:** UI-SPEC / RESEARCH (replace `bannerDanger` from `uiClasses.ts` lines 38–39)  
**Apply to:** ApiKeys error banner (and any residual section error bar on web)

```tsx
role="alert"
className="… rounded-none border border-destructive/30 bg-destructive/10 … text-xs text-destructive"
```

### 6. Domain / security freeze (ISO-02)

**Source:** `preferencesCore.test.ts`, ShareModal/Submit contracts in phase03  
**Apply to:** All plans

- No edits to `redactSensitive` / `scanForLeakedSecrets` implementations  
- No backend key storage rewrites  
- Preserve enablement predicates and confirm handlers  
- Full suite + dual builds as gates  

### 7. A11y floor (ISO-04)

**Source:** Button focus-visible (`focus-visible:ring-3 focus-visible:ring-ring/50`); D-10/D-11/D-12  
**Apply to:** Residual CTAs during purge

- Hit targets ≥40px (`size="sm"` already min-h-10)  
- Prefer a11y over compact `py-1` chips  
- Labels / `aria-label` on search and ambiguous controls  
- `role="alert"` on error banners  

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Human smoke / UAT artifact (`05-UAT.md` if created) | docs | manual | Process artifact — follow UI-SPEC S1–S10 / A1–A10 matrices, not code analog |
| Bundle size advisory notes | docs | — | Non-blocking; no code pattern |

All implementation files have role-match or exact analogs in Phases 1–4.

---

## Wave → Pattern Crosswalk (planner)

| Wave | Files | Patterns to copy |
|------|-------|------------------|
| A — Residual btn | CustomProviders, ApiKeys | Shared #1 Button language; #5 banner; WebStartPanel imports |
| B — Token sweep | agentSettingsEditors, Hooks, Workspace, Skills prefs, Mcp, Routing, P2 sections | Shared #2 token map; FormControls type scale |
| C — CSS + contracts | index.web.css, phase05.residual.test.ts, foundation.isolation | Shared #3 contracts; CSS purge order; dual-entry |
| D — Gates | verify ConfigApp, sectionConfig freeze, preferencesCore suite | Shared #4–#7; dual `build:web` + `build` |

---

## Metadata

**Analog search scope:** `src/components/`, `src/components/ui/`, `src/components/sections/`, `src/lib/phase0*.test.ts`, `src/lib/foundation.isolation.test.ts`, `src/ConfigApp.tsx`, `src/index.web.css`, `src/index.desktop.css`, `src/lib/uiClasses.ts`, `src/lib/sectionConfig.ts`  
**Files scanned:** ~25 primary + residual greps  
**Pattern extraction date:** 2026-07-22  
**Primary analogs (top 5):**

1. `src/lib/phase02.surfaces.test.ts` — residual import ban contracts  
2. `src/lib/phase03.overlays.test.ts` — overlay uiClasses ban + security keywords  
3. `src/components/ui/button.tsx` — variants, min-h-10, focus-visible, rounded-none  
4. `src/ConfigApp.tsx` / `WebStartPanel.tsx` — web Button + semantic tokens  
5. `src/lib/foundation.isolation.test.ts` — dual CSS isolation gates  
