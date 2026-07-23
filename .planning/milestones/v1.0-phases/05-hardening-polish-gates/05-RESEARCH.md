# Phase 5: Hardening & Polish Gates - Research

**Researched:** 2026-07-22  
**Domain:** Web residual purge (shadcn/Mist Sky), dual-platform isolation gates, behavior smoke, a11y checklist  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Carried forward
- **D-00a:** Mist Sky + linear + radius 0 + Button/Dialog/Command/Form kit from Phases 1–4
- **D-00b:** No product/IA rethink (ISO-05)
- **D-00c:** Desktop visual isolation remains (ISO-01 complete; keep proving)
- **D-00d:** Domain logic stable (preferencesCore, backends, redaction)

#### Residual web purge
- **D-01:** Purge **all web-visible surfaces** still on uiClasses btn language (libraries, ApiKeys, CustomProviders, update/install banners, project picker if web-shown)
- **D-02:** Delete **web `.gsd-btn*` CSS** after zero web callers; **desktop CSS untouched**
- **D-03:** **Desktop-only** ConfigApp branches may **keep uiClasses** via platform branching
- **D-04:** Migrate remaining web **`gsd-*` color utilities** to semantic tokens (`foreground`/`muted`/`primary`/`border`/etc.)

#### Behavior smoke (ISO-03) + domain (ISO-02)
- **D-05:** Smoke matrix = **full product paths**: import/draft, edit, download, share/redact, dirty/save, OAuth submit as applicable
- **D-06:** Automation = **source/contract tests + full unit suite**; **no Playwright** this phase; **human UAT** for flow smoke
- **D-07:** **preferencesCore + full suite must stay green** (ISO-02 regression bar)
- **D-08:** Milestone done when **ISO-02–05 satisfied + human smoke approved**

#### A11y parity (ISO-04)
- **D-09:** Audit = **fix known gaps + surface checklist** (not axe CI)
- **D-10:** Hit targets **≥40px** floor; fix violations found during purge/audit
- **D-11:** **Visible focus-visible** rings (Mist Sky primary ring)
- **D-12:** If a11y fix conflicts with pure cosmetics, **prefer a11y** (aria-label/structure) without IA change

### Claude's Discretion
- Exact order of residual files to convert
- Whether to add a thin `phase05.residual.test.ts` forbidding uiClasses imports on web sections
- Desktop smoke depth (glance vs full)
- Bundle size notes as non-blocking advisory only

### Deferred Ideas (OUT OF SCOPE)
- Playwright E2E suite
- axe-core CI
- Desktop restyle
- Bundle code-splitting (App.web ~500kB+) unless free win
- New product features
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ISO-02 | Shared domain logic (preferences core, backends, Tauri/web APIs) stays behavior-stable — UI wiring only unless unavoidable | Full unit suite + `preferencesCore.test.ts` green; no edits to redaction/serialize/backends except presentation wiring; dual builds prove isolation still holds |
| ISO-03 | Behavior smoke gates pass on web: import/draft, edit, download workspace, share/redact, dirty/save, OAuth submit as applicable | Human smoke matrix S1–S10 (UI-SPEC); automation = existing source contracts + full Vitest suite — **no Playwright** |
| ISO-04 | Focus/a11y parity (labels, invalid states, keyboard nav, focus rings, hit targets) | Checklist A1–A10; residual CTAs → Button `size="sm"` (≥40px); focus-visible via `--ring`; prefer a11y over compact cosmetics |
| ISO-05 | No product/IA rethink: same routes, section groups, and user capabilities | Do not change `WEB_HIDDEN_SECTIONS`, routes, or section IA; purge presentation only |
</phase_requirements>

## Summary

Phase 5 closes the web redesign milestone. The work is **presentation hardening**, not new product UI: purge residual non-shadcn button chrome on **web-visible** surfaces, migrate leftover `gsd-*` color utilities to semantic Mist Sky tokens, delete dead `.gsd-btn*` rules from **web CSS only**, re-prove domain stability and desktop isolation with existing automated gates, then run a formal **human** smoke matrix and a11y checklist.

Codebase inventory (2026-07-22) shows the residual **web btn language** is concentrated in two web-visible sections — `CustomProvidersSection.tsx` and `ApiKeysSection.tsx` — plus dense `gsd-*` color/`text-[9–11px]` chrome on those files and several preference sections. `ConfigApp.tsx` already branches web → shadcn `Button` vs desktop → `btn`/`btnPrimary`. Skills/Agents libraries import `uiClasses` heavily but are **desktop-only** via `WEB_HIDDEN_SECTIONS` and are **not** web purge success criteria (UI-SPEC clarification of CONTEXT inventory). `src/index.web.css` still ships full `.gsd-btn*` bridge rules (~17 matches) intentionally left from Phase 4; desktop CSS keeps `.gsd-btn` for ISO-01.

**Primary recommendation:** Execute residual purge in UI-SPEC order (CustomProviders → ApiKeys → section color sweep → ConfigApp web verify → grep gate → delete web `.gsd-btn*` → dual builds + full suite → human smoke + a11y checklist). Add recommended `phase05.residual.test.ts` source contracts. **Do not** install new packages, Playwright, or axe CI.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Residual CTA restyle (ApiKeys, CustomProviders) | Browser / Client | — | Presentation-only React TSX; no API/backend change |
| Semantic token migration (`gsd-*` → shadcn tokens) | Browser / Client | CDN / Static (CSS) | Tailwind utilities + `index.web.css` theme bridge |
| Delete web `.gsd-btn*` CSS | CDN / Static | — | Web CSS entry only (`@platform-css` → `index.web.css`) |
| Desktop isolation proof | Browser / Client | Desktop WebView | Dual CSS entries + dual Vite builds; desktop branches keep uiClasses |
| Domain stability (ISO-02) | API / Backend (platform adapters) + pure lib | Browser / Client | `preferencesCore`, backends, redaction — **do not rewrite** |
| Behavior smoke (ISO-03) | Browser / Client (human) | — | Human UAT; automation is source contracts only |
| A11y parity (ISO-04) | Browser / Client | — | Labels, focus-visible, hit targets on residual surfaces |
| Product IA stability (ISO-05) | Browser / Client | — | Routes + `sectionConfig` + Sidebar groups unchanged |

## Project Constraints (from CLAUDE.md)

| Directive | Implication for Phase 5 |
|-----------|-------------------------|
| Stay on React + Vite + TypeScript; shadcn with Tailwind 4 | No stack change; reuse existing primitives |
| Behavior stability: dirty/save, download/import, gallery/wizard, redaction | Touch presentation only; keep enablement predicates and handlers |
| Web restyle must not regress desktop | Branch with `isWeb` / `isWebPlatform()`; desktop CSS untouched |
| No drive-by backend refactors or feature expansion | No new features; no domain rewrite |
| Share/redact/export secret handling must not regress | Do not modify `redactSensitive` / `scanForLeakedSecrets` logic |
| Co-located `*.test.ts`; Vitest | Extend source-contract pattern; no new test framework |
| Prefer shared tokens / design system; no glass/gradient/logo cyan | Mist Sky semantic tokens only |
| GSD workflow: plan before execute | This research feeds planner; no ad-hoc implementation |

## Residual Call-Site Inventory (verified)

### Platform visibility [VERIFIED: codebase]

| Surface | Web visible? | Evidence | Phase 5 action |
|---------|--------------|----------|----------------|
| `CustomProvidersSection.tsx` | **Yes** | Sidebar `custom-providers`; not in `WEB_HIDDEN` | **Purge** btn + tokens |
| `ApiKeysSection.tsx` | **Yes** | Sidebar `api-keys` | **Purge** btn + tokens + dense `text-[9–11px]` actions |
| Preference `*Section.tsx` (most) | **Yes** | `PreferencesSections` switch | **Migrate** residual `gsd-*` colors / ad-hoc type sizes |
| `agentSettingsEditors.tsx` | **Yes** (via agent-settings) | Imported by `AgentSettingsSection` | **Migrate** colors; raw small buttons → Button or semantic hits ≥40px |
| `FormControls.tsx` web branches | Yes | `isWebPlatform()` | **Do not regress** semantic path |
| `Sidebar.tsx` web branch | Yes | `variant="web"` | **Do not regress** |
| `ConfigApp.tsx` toolbar/banners | Yes (web branch) | `isWeb ? Button : button+btn` | Web already Button; **leave desktop** uiClasses |
| `SkillsLibrarySection.tsx` | **No** | `WEB_HIDDEN_SECTIONS` | Desktop-only — keep uiClasses (D-03) |
| `AgentsLibrarySection.tsx` | **No** | same | Desktop-only — keep uiClasses |
| `src/index.web.css` `.gsd-btn*` | Web CSS | ~17 selectors | **Delete after zero web callers** |
| `src/index.desktop.css` | Desktop | contains `.gsd-btn` | **Untouched** |
| `src/lib/uiClasses.ts` | Shared | exports `btn*` | Keep for desktop callers |

`WEB_HIDDEN_SECTIONS` [VERIFIED: codebase `src/lib/sectionConfig.ts`]:

```ts
export const WEB_HIDDEN_SECTIONS: readonly SectionId[] = [
  "skills-library",
  "agents-library",
] as const;
```

### Web residual btn call sites (must reach zero on web-rendered output)

| File | Symbols / pattern | Notes |
|------|-------------------|-------|
| `CustomProvidersSection.tsx` | `btn`, `btnPrimary`, `btnDanger` on native `<button>` | Highest priority with ApiKeys |
| `ApiKeysSection.tsx` | `btnPrimary`, `bannerDanger`; many raw `text-[10px] px-2 py-1` action chips including `bg-gsd-accent` Save | Dense a11y violations (hit targets) |
| `ConfigApp.tsx` | Imports `btn`/`btnPrimary`/`btnSegment*`; uses only under `!isWeb` | **Allowed** (D-03); verify no web path applies `className={btn…}` |
| Skills/Agents libraries | Full uiClasses set | **Out of web gate** |

### Approximate residual `gsd-*` color utility density (web-visible sections) [VERIFIED: codebase grep]

| File | Match count (approx) | Priority |
|------|----------------------|----------|
| `ApiKeysSection.tsx` | ~33 | P0 with btn purge |
| `agentSettingsEditors.tsx` | ~33 | P1 color + small controls |
| `HooksSection.tsx` | ~27 | P1 color sweep |
| `WorkspaceSection.tsx` | ~10 | P1 |
| `CustomProvidersSection.tsx` | ~10 | P0 with btn purge |
| `SkillsSection.tsx` | ~9 | P1 |
| `McpSection.tsx` / `RoutingSection.tsx` | ~7 each | P1 |
| Others (Models, Parallel, etc.) | 0–4 | P2 sweep |

Desktop-only libraries also have high density but **do not block** ISO-05 web cohesion gate.

## Standard Stack

No new libraries. Reuse Phase 1–4 stack.

### Core

| Library / artifact | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| React + React DOM | 19.2.x (repo) | UI | Project lock [VERIFIED: package.json / CLAUDE stack] |
| Vite | 8.x | Dual web/desktop builds | Existing |
| TypeScript | 6.x | `tsc && vite build` | Existing |
| Tailwind CSS + `@tailwindcss/vite` | 4.2.x | Utility + `@theme` tokens | Existing web CSS |
| shadcn/ui (CLI pin) | **4.13.1** | Component generator only if emergency | Locked D-00a; **no `shadcn add` expected** [VERIFIED: CONTEXT / UI-SPEC] |
| `@base-ui/react` | 1.6.0 (repo) | Button/Dialog/Select primitives | Never mix Radix |
| Vitest | ^4.0.18 (lock ~4.x) | Unit + source contracts | `npm test` → 164 tests green [VERIFIED: this session] |
| `yaml` | existing | preferencesCore | Domain stability surface |

### Existing UI primitives (reuse only)

`button`, `input`, `textarea`, `dialog`, `command`, `input-group`, `switch`, `select`, `checkbox`, `popover` under `src/components/ui/` — FND-03 allowlist in `foundation.isolation.test.ts`.

### Supporting (no install)

| Artifact | Purpose | When to Use |
|----------|---------|-------------|
| `@/components/ui/button` | Residual CTAs | All web residual buttons |
| `@/lib/utils` `cn` | class merge | Token class composition |
| `src/lib/uiClasses.ts` | Desktop chrome class names | Desktop-only branches only |
| `isWebPlatform()` / `variant === "web"` | Platform branch | Shared files needing dual presentation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Human smoke matrix | Playwright E2E | Deferred (D-06); higher setup cost |
| Checklist a11y | axe-core CI | Deferred (D-09); optional later |
| Shared Button for both platforms | Force Mist Sky on desktop | Breaks ISO-01 isolation |
| Delete entire `uiClasses.ts` | Keep exports | Desktop still needs it |
| Branch every section with `isWebPlatform` | Semantic tokens on both platforms | Prefer tokens that bridge via `--color-gsd-*` **or** migrate to semantic on shared files only when desktop isolation is not harmed; UI-SPEC: web must purge; desktop may keep `gsd-*` |

**Installation:** none expected.

```bash
# Verify only — do not add packages
npm test
npm run build:web && npm run build
```

**Version verification:** Vitest registry latest observed `4.1.10`; project uses `^4.0.18` — stay on lockfile; no upgrade required this phase. [VERIFIED: npm view + package.json]

## Package Legitimacy Audit

> Phase 5 installs **no new external packages** by default (UI-SPEC Registry Safety: none new).

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | n/a | No installs planned |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none  

If an emergency primitive is required (blocked residual surface): pin `shadcn@4.13.1` only, official registry, re-run FND-03 allowlist update + legitimacy gate. Prefer composing with existing Button/Input.

## Architecture Patterns

### System Architecture Diagram

```text
                    ┌─────────────────────────────────────┐
                    │  Human smoke (ISO-03) + a11y (ISO-04)│
                    │  S1–S10 matrix / checklist A1–A10    │
                    └──────────────────▲──────────────────┘
                                       │ UAT
┌──────────────┐   import/draft/edit   │
│ Browser web  │───────────────────────┤
│ Vite :5173   │   download/share      │
│ index.web.css│   OAuth as applicable │
└──────┬───────┘                       │
       │ presentation only             │
       ▼                               │
┌──────────────────────────────────────┴──────────┐
│ ConfigApp (shared) + PreferencesSections         │
│  web: Button / semantic tokens / residual purge  │
│  desktop: uiClasses / gsd-nav / gsd-btn (ISO-01) │
└──────────────┬───────────────────┬───────────────┘
               │                   │
               ▼                   ▼
     ┌─────────────────┐  ┌────────────────────┐
     │ preferencesCore │  │ ConfigBackend      │
     │ redact/serialize│  │ webBackend / tauri │
     │ (ISO-02 freeze) │  │ keys / FS / download│
     └─────────────────┘  └────────────────────┘
               │
               ▼
     ┌─────────────────┐
     │ Vitest contracts│  phase02–05 + foundation.isolation
     │ + dual builds   │  build:web && build
     └─────────────────┘
```

### Recommended purge structure (no new folders)

```text
src/
├── components/sections/
│   ├── CustomProvidersSection.tsx   # P0 Button + tokens
│   ├── ApiKeysSection.tsx           # P0 Button + tokens + hit targets
│   ├── agentSettingsEditors.tsx     # P1 tokens / small controls
│   └── *Section.tsx                 # P1–P2 gsd-* color sweep
├── ConfigApp.tsx                    # Verify web path; desktop uiClasses OK
├── lib/
│   ├── uiClasses.ts                 # Keep for desktop
│   ├── sectionConfig.ts             # DO NOT change WEB_HIDDEN (ISO-05)
│   ├── phase05.residual.test.ts     # NEW recommended contracts
│   ├── foundation.isolation.test.ts # Assert web CSS no longer requires .gsd-btn*
│   └── preferencesCore*.ts          # DO NOT change behavior
├── index.web.css                    # Delete .gsd-btn* after gate; keep field-focus + token bridge
└── index.desktop.css                # Untouched
```

### Pattern 1: Residual CTA → shadcn Button (web)

**What:** Replace `className={btnPrimary}` native buttons with `Button variant="default|outline" size="sm"`.  
**When to use:** Every web-visible residual action.  
**Example:**

```tsx
// Source: project Button + 05-UI-SPEC button language
import { Button } from "@/components/ui/button";

// Primary residual CTA
<Button type="button" variant="default" size="sm" onClick={exportEnv}>
  Export env.sh
</Button>

// Secondary
<Button type="button" variant="outline" size="sm" onClick={() => setShowKey((s) => !s)}>
  {showKey ? "Hide" : "Show"}
</Button>

// Soft destructive — not solid red fill
<Button
  type="button"
  variant="outline"
  size="sm"
  className="text-destructive border-destructive/40 hover:bg-destructive/10"
  onClick={onDelete}
>
  Delete
</Button>
```

`Button` sizes already enforce `h-10 min-h-10` for `default`/`sm` [VERIFIED: `src/components/ui/button.tsx`].

### Pattern 2: Token migration map (web residual)

| Legacy utility / class | Semantic replacement (web) |
|------------------------|----------------------------|
| `text-gsd-text` | `text-foreground` |
| `text-gsd-text-dim` / `text-gsd-text-secondary` / `text-gsd-text-muted` | `text-muted-foreground` |
| `text-gsd-accent` / `text-gsd-accent-hover` | `text-primary` / `hover:text-primary` |
| `bg-gsd-bg` | `bg-background` |
| `bg-gsd-surface` / `bg-gsd-surface-solid` | `bg-card` |
| `bg-gsd-surface-hover` | `hover:bg-muted` or `hover:bg-accent` |
| `bg-gsd-accent` / `bg-gsd-accent-hover` | Prefer `Button` default; else `bg-primary` / `hover:bg-primary-hover` |
| `bg-gsd-accent-dim` / `bg-gsd-accent/20` | `bg-primary/10` or `bg-primary/12` |
| `text-gsd-on-accent` | `text-primary-foreground` |
| `border-gsd-border` / `border-gsd-border-strong` | `border-border` |
| `text-gsd-danger` / `*-gsd-danger/*` | `text-destructive` / `border-destructive/*` / `bg-destructive/*` soft |
| Success badge | Soft success wash — **not** primary sky, **not** logo cyan |
| `bannerDanger` | `border-destructive/30 bg-destructive/10 text-destructive` + 12px; radius 0 |
| `btn` / `btnPrimary` / `btnDanger` | Button outline / default / soft destructive |
| `rounded-lg` / `rounded-md` residual cards | `rounded-none` on web restyle |
| `text-[9px]` / `text-[10px]` / `text-[11px]` | `text-xs` (12px) |

[VERIFIED: 05-UI-SPEC token table]

### Pattern 3: CSS purge gate (ordered)

1. Zero web-rendered TSX uses of `btn` / `btnPrimary` / `btnDanger` / `btnSegment*` / `choiceBtn*` **on web-visible surfaces**.  
2. Zero web-rendered `className` containing `gsd-btn` on web path.  
3. Optional contract test forbids uiClasses btn imports in residual web section files.  
4. **Then** delete from `index.web.css` only:

   - `.gsd-btn`, hover/active/disabled  
   - `.gsd-btn-primary` (+ hover)  
   - `.gsd-btn-segment`, `.gsd-btn-segment-active` (+ hover)  
   - Orphaned reduced-motion rules for `.gsd-btn:active`

5. **Keep** on web (still used):

   | Class / bridge | Why keep |
   |----------------|----------|
   | `--color-gsd-*` theme bridge | Mid-migration residual utilities; foundation test expects bridge |
   | `[data-field-path].gsd-field-focus` | Palette jump highlight in `ConfigApp` [VERIFIED: ConfigApp.tsx ~598] |
   | `.gsd-heading` / `.gsd-prose` / `.gsd-hint-trigger` / dropdown/chip | Desktop FormControls branches only load via desktop CSS — **may delete from web CSS if zero web callers**; FormControls web path already semantic |

6. **Never** delete from `index.desktop.css`.

### Pattern 4: Source contract tests (established)

**What:** `readFileSync` + regex/string assertions, no DOM.  
**When to use:** Lock residual purge and isolation.  
**Example shape** (recommended `phase05.residual.test.ts`):

```ts
// Source: project phase02/phase04 contract pattern [VERIFIED: codebase]
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

const WEB_RESIDUAL_SECTIONS = [
  "src/components/sections/CustomProvidersSection.tsx",
  "src/components/sections/ApiKeysSection.tsx",
] as const;

const FORBIDDEN = ["btn", "btnPrimary", "btnDanger", "btnSegment", "btnSegmentActive"] as const;

describe("phase05 residual web purge (ISO-05 / WEB-06 completion)", () => {
  for (const file of WEB_RESIDUAL_SECTIONS) {
    it(`${file} does not import uiClasses btn symbols`, () => {
      const src = read(file);
      for (const sym of FORBIDDEN) {
        expect(src).not.toMatch(
          new RegExp(`import\\s*\\{[^}]*\\b${sym}\\b[^}]*\\}\\s*from\\s*["'][^"']*uiClasses`),
        );
      }
    });
  }

  it("web CSS drops .gsd-btn chrome; desktop keeps it", () => {
    expect(read("src/index.web.css")).not.toMatch(/\.gsd-btn\b/);
    expect(read("src/index.desktop.css")).toContain(".gsd-btn");
  });

  it("WEB_HIDDEN_SECTIONS still only skills/agents libraries (ISO-05)", () => {
    const src = read("src/lib/sectionConfig.ts");
    expect(src).toMatch(/skills-library/);
    expect(src).toMatch(/agents-library/);
  });
});
```

### Anti-Patterns to Avoid

- **Restyling Skills/Agents for web success:** They are not web-visible; wastes scope and risks desktop regressions.  
- **Deleting desktop `.gsd-btn`:** Breaks ISO-01.  
- **Editing `preferencesCore` / backends “while here”:** Violates ISO-02.  
- **Solid red destructive fills:** Soft outline/ghost only (palette lock).  
- **Reintroducing logo cyan/purple as primary:** Palette lock.  
- **Adding Playwright/axe “to be thorough”:** Explicitly deferred.  
- **Changing `WEB_HIDDEN_SECTIONS` or routes:** ISO-05.  
- **Assuming ConfigApp `import { btn }` means web still uses gsd-btn:** Web branches already use `Button`; desktop still needs the import.  
- **Deleting `.gsd-field-focus` with btn CSS:** Breaks palette field-jump flash on web.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button chrome | New `.gsd-btn` variants | Existing `Button` / `buttonVariants` | WEB-06 + focus rings already solved |
| Focus rings | Custom outline hacks | Button/Input `focus-visible:ring-*` + Mist Sky `--ring` | Consistent with Phases 2–4 |
| E2E smoke automation | Playwright harness | Human matrix + Vitest contracts | D-06 |
| A11y CI | axe-core pipeline | Checklist A1–A10 | D-09 |
| Secret redaction | New share pipeline | Existing `redactSensitive` / `scanForLeakedSecrets` / ShareModal | Security non-regression |
| Platform I/O | Direct localStorage in sections | `useConfigBackend()` | Existing adapter |
| Modal confirm for Clear key | New AlertDialog | Keep `window.confirm` | UI-SPEC discretion |

**Key insight:** Phase 5 is a **completion gate**, not a greenfield design system. The cost is residual surface area and regression discipline, not technology selection.

## Common Pitfalls

### Pitfall 1: Deleting web `.gsd-btn*` before residual sections migrate
**What goes wrong:** ApiKeys/CustomProviders CTAs become unstyled native buttons.  
**Why it happens:** CSS purge is tempting once ConfigApp toolbar is on Button.  
**How to avoid:** Grep gate → contract test → then delete.  
**Warning signs:** Visual QA shows borderless or browser-default buttons on API Keys.

### Pitfall 2: Treating Skills/Agents as web residual success criteria
**What goes wrong:** Scope balloon; desktop library UX churn.  
**Why it happens:** CONTEXT listed them in residual inventory; UI-SPEC clarified desktop-only.  
**How to avoid:** Follow UI-SPEC platform table; leave libraries on uiClasses.  
**Warning signs:** Plans include library Button migration for web gate.

### Pitfall 3: Shared-file semantic migration breaking desktop look
**What goes wrong:** Desktop sections pick up Mist Sky semantic classes without legacy gsd tokens.  
**Why it happens:** Sections are shared; no `isWebPlatform` branch.  
**How to avoid:** Prefer replacements that still look acceptable via desktop CSS **or** branch presentation; if using semantic Tailwind classes, ensure desktop CSS/theme still maps or use platform branch for high-risk chrome. Practical approach: migrate utilities that are **color aliases** already bridged on web; for structural chrome that depends on `.gsd-*` class rules, branch or leave desktop.  
**Warning signs:** Desktop screenshot drift after shared section edit.

### Pitfall 4: Shrinking hit targets when cleaning dense ApiKeys chips
**What goes wrong:** Keep `text-[10px] px-2 py-1` for density; fail ISO-04 / D-10.  
**Why it happens:** Aesthetic preference for compact key rows.  
**How to avoid:** D-12 — prefer a11y; use `Button size="sm"` (40px).  
**Warning signs:** Residual actions still `py-1` without min-height.

### Pitfall 5: Domain regression while “just changing classNames”
**What goes wrong:** Accidental change to enablement predicates, confirm handlers, exportEnv path, dirty flags.  
**Why it happens:** Large TSX files invite drive-by edits.  
**How to avoid:** Surgical class/JSX only; never rewrite `exportEnv`/`clearKey`/`setKey` bodies; keep `preferencesCore` untouched; run full suite.  
**Warning signs:** Diffs in `preferencesCore.ts`, `webBackend.ts`, save predicates.

### Pitfall 6: foundation.isolation still “tolerating” residual btn after purge
**What goes wrong:** Tests don’t lock the purge; regression reintroduces bridge.  
**Why it happens:** Phase 4 comments explicitly allow residual `.gsd-btn*` until Phase 5.  
**How to avoid:** Update isolation/phase05 tests to **require** web CSS free of `.gsd-btn` and desktop still contains it.  
**Warning signs:** Comment-only tests; no negative assertion on web CSS.

### Pitfall 7: Secret leak during Share/Submit smoke
**What goes wrong:** UI still redacts but a presentation change bypasses scan warning path.  
**Why it happens:** Restyling Submit/Share banners without re-checking handlers.  
**How to avoid:** Do not touch ShareModal/Submit handlers; smoke S4 includes secret-scan warning path; suite keeps redaction unit tests.  
**Warning signs:** Diffs in `scanForLeakedSecrets` or OAuth code logging.

### Pitfall 8: Removing `gsd-field-focus` with button CSS cleanup
**What goes wrong:** ⌘K field jump loses highlight flash (S9).  
**Why it happens:** Bulk delete of “gsd-” selectors.  
**How to avoid:** Keep `[data-field-path].gsd-field-focus` on web.  
**Warning signs:** Palette jump scrolls but no ring flash.

## Code Examples

### Migration order (planner waves)

```text
Wave A — Residual btn language (ISO-05 / WEB-06 completion)
  1. CustomProvidersSection → Button + semantic tokens + radius 0
  2. ApiKeysSection → Button + Input for search/edit + banner tokens + ≥40px actions
  3. Confirm ConfigApp web path: no live className={btn…}

Wave B — Token / type cohesion on web-visible sections
  4. Sweep gsd-* colors + text-[9–11px] on web-rendered sections
     (Hooks, Workspace, Skills prefs, Mcp, Routing, agentSettingsEditors, …)
  5. Prefer a11y when upgrading dense controls

Wave C — CSS + contracts
  6. Grep gate; add phase05.residual.test.ts
  7. Delete web .gsd-btn*; keep field-focus + color bridge as needed
  8. Update foundation.isolation comments/assertions for post-purge state

Wave D — Gates
  9. npm test (full suite green)
 10. npm run build:web && npm run build
 11. Human smoke S1–S10 + a11y A1–A10 (end-of-phase human_verify)
```

### Soft danger banner (replace `bannerDanger`)

```tsx
// Source: 05-UI-SPEC banner mapping
<div
  role="alert"
  className="mb-3 flex items-center justify-between rounded-none border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
>
  <span>{error}</span>
  <Button type="button" variant="outline" size="sm" onClick={() => setError(null)}>
    Dismiss
  </Button>
</div>
```

### Platform branching reminder (ConfigApp — already correct)

```tsx
// Source: src/ConfigApp.tsx [VERIFIED: codebase]
{isWeb ? (
  <Button type="button" variant="outline" size="sm" onClick={openImport} /* ... */>
    Import
  </Button>
) : (
  <button type="button" onClick={openImport} className={btn} /* ... */>
    Import
  </button>
)}
```

Do **not** “simplify” by removing the desktop branch.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shared `index.css` + gsd chrome | Split `index.web.css` / `index.desktop.css` | Phase 1 | Isolation |
| Neutral OKLCH scaffold | Mist Sky hex tokens | Phase 2 | Palette lock |
| `.gsd-btn*` site-wide | Button language on shell + Phase 2 surfaces | Phases 2–4 | Residual libraries deferred to Phase 5 |
| Form native select/switch on web | FormControls `isWebPlatform` adapters | Phase 4 | Desktop keeps gsd form chrome |
| Residual web `.gsd-btn*` tolerated | **Delete after purge** | **Phase 5** | WEB-06 completion |
| Phase 4 isolation “may remain” comment | Require absence on web CSS | **Phase 5** | Hard gate |

**Deprecated/outdated for web residual:**
- `uiClasses` btn language on web-visible sections  
- Ad-hoc `text-[9px]`–`text-[11px]` on restyled residual web  
- `active:scale-[0.96]` press theater on residual web controls  
- Solid danger filled buttons  

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Shared section files can adopt semantic Tailwind color classes without breaking desktop visuals because desktop CSS still defines usable surfaces / or desktop is “glance” only for visual success | Pitfalls / token migration | Desktop may look partially Mist Sky; still OK if isolation bar is “not forced full restyle” — confirm in S10 glance |
| A2 | Optional deletion of unused `.gsd-nav-item*` / `.gsd-choice-btn*` / `.gsd-dropdown*` from **web** CSS is safe because web Sidebar/FormControls already branched | CSS purge keep-list | If any web path still emits those class strings, unstyled chrome appears — grep before delete |
| A3 | Human smoke is sufficient for ISO-03 without automated browser tests | Validation | Missed interaction regressions; mitigate with thorough checklist + unit contracts |

**If empty table were ideal:** A1–A3 are low-risk process assumptions; no package or compliance assumption requires user unlock beyond CONTEXT.

## Open Questions (RESOLVED)

1. **How aggressively to migrate shared-section `gsd-*` colors vs leave bridge aliases?**  
   - What we know: Bridge maps `gsd-*` to Mist Sky already (cohesion partial). D-04 asks for semantic tokens.  
   - What's unclear: Desktop visual drift tolerance if shared files switch to `text-foreground` etc.  
   - Recommendation: Migrate web-visible residual **high-density** sections fully; for low-density sections, migrate when touching the file; keep `--color-gsd-*` bridge for any remaining utilities. S10 desktop glance confirms isolation still “legacy chrome dominant.”

2. **Should phase05 forbid `btn` import in ConfigApp?**  
   - What we know: ConfigApp still needs btn for desktop.  
   - What's unclear: N/A — do **not** forbid ConfigApp imports; only residual **web section** files + web CSS.  
   - Recommendation: Scope contract tests to ApiKeys/CustomProviders (+ optional list of web-only residual files), not ConfigApp.

3. **MultiSelect chip remove `min-h-6` on web FormControls**  
   - What we know: Phase 4 left chip remove at 24px; WCAG AA minimum is 24px; project floor is 40px for residual CTAs.  
   - What's unclear: Whether ISO-04 checklist applies to chip-remove as “residual control” or inherits Phase 4 acceptance.  
   - Recommendation: Treat **primary residual CTAs** (ApiKeys/CustomProviders) as hard ≥40px; chip-remove may stay if Phase 4 already accepted — only fix if a11y audit flags it (D-12 when conflict).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | builds/tests | ✓ | v26.0.0 (local) / project 20+ | — |
| npm | scripts | ✓ | 11.12.1 | — |
| Vitest (via npm test) | ISO-02 automation | ✓ | ^4.0.18 | — |
| TypeScript/Vite build | dual builds | ✓ | repo | — |
| Rust/Cargo | desktop build | ✓ | 1.96.0 | Desktop build may be slower; still required gate |
| Playwright | — | n/a | — | **Not used** (deferred) |
| axe-core | — | n/a | — | **Not used** (deferred) |
| Browser for human smoke | ISO-03/04 UAT | operator | — | Manual |

**Missing dependencies with no fallback:** none for planned work.  
**Missing dependencies with fallback:** Playwright/axe deferred with human checklist fallback.

## Validation Architecture

> `workflow.nyquist_validation` is **true** in `.planning/config.json` — section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (`vitest run`) |
| Config file | `vite.config.ts` `test` block |
| Quick run command | `npm test` |
| Full suite command | `npm test` (164 tests / 23 files green at research time) |
| Dual build gate | `npm run build:web && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ISO-02 | preferencesCore redaction/serialize stable | unit | `npx vitest run src/lib/preferencesCore.test.ts` | ✅ |
| ISO-02 | Full suite green | unit | `npm test` | ✅ |
| ISO-02 / ISO-01 | Dual builds; desktop CSS keeps `.gsd-btn`; web tokens | source + build | `npm run build:web && npm run build` + foundation.isolation | ✅ (update assertions) |
| ISO-05 | Residual sections no uiClasses btn imports | source contract | `npx vitest run src/lib/phase05.residual.test.ts` | ❌ Wave 0 |
| ISO-05 | Web CSS no `.gsd-btn*`; desktop has `.gsd-btn` | source contract | phase05 or foundation.isolation | ❌ Wave 0 (extend) |
| ISO-05 | Routes/IA unchanged | source / manual | sectionConfig + App.web routes smoke | partial (manual S8) |
| ISO-03 | Import/draft/edit/download/share/dirty/OAuth | **manual** | Human matrix S1–S10 | ❌ manual UAT |
| ISO-04 | Labels, focus, hit targets ≥40px | **manual** + residual Button contracts | Checklist A1–A10; optional source assert Button import | ❌ manual + optional |
| WEB-06 carry | Phase 2–4 surfaces stay off uiClasses btn | source | phase02–04 tests | ✅ |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/phase05.residual.test.ts src/lib/preferencesCore.test.ts` (after Wave 0) or full `npm test` if quick  
- **Per wave merge:** `npm test`  
- **Phase gate:** `npm test && npm run build:web && npm run build` + human smoke approved  

### Wave 0 Gaps

- [ ] `src/lib/phase05.residual.test.ts` — residual web section btn import ban + web CSS `.gsd-btn` absence + desktop presence + `WEB_HIDDEN` stability  
- [ ] Update `src/lib/foundation.isolation.test.ts` — replace Phase 4 “residual may remain” tolerance with post-purge assertions where appropriate  
- [ ] Human UAT artifact (e.g. `05-UAT.md` or verify-work checklist) for S1–S10 + A1–A10  

**No new test framework install.**

### Smoke matrix (human — ISO-03) [VERIFIED: 05-UI-SPEC]

| # | Path | Pass looks like |
|---|------|-----------------|
| S1 | Import / draft | Import modal; draft loads; Mist Sky shell |
| S2 | Edit preferences | Section switch; dirty; validators fire |
| S3 | Download workspace (web) | Download enabled; files download; Saving…/Downloaded labels |
| S4 | Share / redact | Share modal; secret scan path; no secret leak in copy |
| S5 | Dirty / save | Dirty dots; Discard; desktop Save if glanced |
| S6 | OAuth / submit | Submit + callback quiet status |
| S7 | Residual sections | Custom Providers + API Keys: Button language; no gsd-btn chrome |
| S8 | Gallery / wizard / start | Still cohesive after CSS delete |
| S9 | Palette ⌘K | Field jump + focus ring intact |
| S10 | Desktop glance | Legacy chrome; not broken |

### A11y checklist (ISO-04) [VERIFIED: 05-UI-SPEC + WCAG]

| # | Check | Notes |
|---|-------|-------|
| A1 | Hit targets ≥40px | Project floor **stricter** than WCAG 2.2 SC 2.5.8 (24px AA) [CITED: w3.org/WAI/WCAG22/Understanding/target-size-minimum] |
| A2 | Visible focus-visible | Mist Sky `--ring`; Button already `focus-visible:ring-3 focus-visible:ring-ring/50` |
| A3 | Labels | Search/password labeled |
| A4 | Invalid states | `data-invalid` + visible errors |
| A5 | Keyboard | Shell → sidebar → main; ESC overlays |
| A6 | Named controls | Delete/Clear labeled |
| A7 | Status messages | `role="alert"` on error banners preferred |
| A8 | Contrast | Mist Sky pairs; soft destructive readable |
| A9 | Switch/toggle | `role="switch"` + `aria-checked` (FormControls) |
| A10 | No keyboard trap | Residual panels |

## Security Domain

> `security_enforcement` enabled; ASVS level 1 in config.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | partial | OAuth callback already restyled; **do not** log auth codes; handlers unchanged |
| V3 Session Management | no | No new sessions this phase |
| V4 Access Control | no | Single-user config tool |
| V5 Input Validation | yes | Existing validators + Field `data-invalid`; no new free-form sinks |
| V6 Cryptography | no | No new crypto; OS keychain / localStorage keys unchanged |
| V5/V8 Secrets handling | **yes** | `redactSensitive`, `scanForLeakedSecrets`, ShareModal review-before-copy, Submit scan gate |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret leak via Share/Export UI change | Information Disclosure | Do not modify redaction algorithms; smoke S4; unit tests on redact/scan |
| Secret in preferences download | Information Disclosure | Existing clean/redact paths; presentation-only |
| API keys exposed in DOM class restyle | Information Disclosure | Keep masked `••••` reveal toggle behavior; no logging of key values |
| OAuth code logging regression | Information Disclosure | No `console.log` of authorization code (Phase 2 lock) |
| XSS via className injection | Tampering | Static class strings only; no user HTML |
| Desktop isolation break → accidental web secret UX on desktop paths | Elevation / Confusion | Dual builds; no backend changes |

### Security non-regression checklist for planner

- [ ] No edits to `src/lib/preferencesCore.ts` redaction/scan implementations  
- [ ] No edits to key storage logic in `webBackend` / Tauri keyring beyond unrelated  
- [ ] ShareModal / SubmitPresetModal handlers remain; only pre-existing presentation  
- [ ] ApiKeys `exportEnv` / `setKey` / `clearKey` / `confirm` behavior preserved  
- [ ] No new third-party packages (supply-chain)  

## Sources

### Primary (HIGH confidence)

- Codebase inventory 2026-07-22: residual imports, `sectionConfig`, ConfigApp branches, CSS selectors, test suite green (164)  
- `.planning/phases/05-hardening-polish-gates/05-CONTEXT.md` — locked decisions  
- `.planning/phases/05-hardening-polish-gates/05-UI-SPEC.md` — token map, smoke, a11y, purge order  
- `.planning/REQUIREMENTS.md` / `ROADMAP.md` — ISO-02–05  
- `src/lib/phase02–04*.test.ts`, `foundation.isolation.test.ts`, `preferencesCore.test.ts` — gate patterns  
- `src/components/ui/button.tsx` — min-h-10 / focus-visible  
- [W3C WCAG 2.2 Understanding SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24px AA floor  
- [W3C WCAG 2.2 Understanding Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) — focus indicator guidance  

### Secondary (MEDIUM confidence)

- Phase 4 VERIFICATION/RESEARCH residual notes (`.gsd-btn*` deferred to Phase 5)

### Tertiary (LOW confidence)

- Bundle size advisory (~500kB App.web) — not a gate  

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — no new stack; verified package.json + green suite  
- Architecture / residual inventory: **HIGH** — direct grep + file reads  
- Pitfalls: **HIGH** — grounded in Phase 4 carry-forward + CSS dual-entry design  
- A11y standards: **HIGH** for WCAG cites; project 40px floor is product lock  
- Desktop visual impact of shared semantic classes: **MEDIUM** — A1 assumption  

**Research date:** 2026-07-22  
**Valid until:** 2026-08-21 (30 days; stack stable; residual inventory may drift if Phase 5 starts late)
