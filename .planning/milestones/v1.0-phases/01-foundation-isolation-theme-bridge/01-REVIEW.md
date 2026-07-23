---
phase: 01-foundation-isolation-theme-bridge
reviewed: 2026-07-21T23:55:00Z
depth: deep
files_reviewed: 15
files_reviewed_list:
  - src/index.web.css
  - src/index.desktop.css
  - src/lib/theme.ts
  - src/lib/utils.ts
  - src/lib/theme.test.ts
  - src/lib/utils.test.ts
  - src/lib/foundation.isolation.test.ts
  - src/components/ui/button.tsx
  - src/components/ui/button.import.test.ts
  - components.json
  - vite.config.ts
  - src/main.tsx
  - tsconfig.json
  - src/vite-env.d.ts
  - package.json
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-07-21T23:55:00Z
**Depth:** deep
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 01 foundation work correctly establishes several hard gates: `@/*` aliases, `cn()`, dual-write `applyTheme` (`data-theme` + `.dark`), FOUC-safe `@platform-css` Vite alias, locked `components.json` (base-nova / neutral), Button-only walking skeleton, and static isolation tests for desktop vs web CSS. Desktop legacy entry looks clean of shadcn imports.

The largest defect is on the **web transitional bridge**: product form controls still rely on **global tag selectors** that only exist in `index.desktop.css`. Web deliberately omits those selectors (Pitfall 4) but never replaces them with a class-based bridge, so the primary web surface (preferences forms) regresses to unstyled native controls — including loss of `data-invalid` borders and 40px hit targets. Secondary issues: collapsed border/text hierarchy in the color bridge, Button `className` not tw-merged, theme FOUC polarity flip to light `:root`, CLI package in runtime dependencies, and isolation tests that never assert the Vite alias / `main.tsx` wiring.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Web transitional CSS drops all form-control chrome product still depends on

**File:** `src/index.web.css:204-205` (and absence through end of file); call chain `src/components/FormControls.tsx:117-121`, `557-568`, `591-598`, `642-647`
**Issue:** Desktop styles bare `input[type=text|number]`, `select`, and `textarea` (background, border, 40px height, focus ring, placeholder, caret, invalid borders). Web CSS explicitly forbids copying those tag selectors and provides **no class-based substitute**. FormControls still renders bare controls with only width utilities (`className="w-52"`, `"w-full"`). Net effect on web after this phase:

- Native unstyled inputs/selects/textareas across the entire preferences editor
- No 40px min-height hit targets on text fields
- No focus-visible accent rings on form fields
- `data-invalid` on `Field` no longer paints danger borders (desktop rules not present; no web equivalent)
- Select caret / option background theming gone

Pitfall 4 correctly bans **tag** selectors on web to avoid fighting future shadcn Input — it does **not** justify leaving the live product without any transitional form chrome. Buttons got a `.gsd-btn*` bridge; forms did not.

**Fix:** Add a **class-based** transitional form layer in `index.web.css` (not bare tags), and apply it from FormControls (or a shared `uiClasses` token), e.g.:

```css
/* src/index.web.css — transitional, remove when shadcn Input lands */
.gsd-input,
.gsd-select,
.gsd-textarea {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--foreground);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  min-height: 40px;
  height: 40px;
  box-sizing: border-box;
  outline: none;
}
.gsd-textarea { min-height: 5rem; height: auto; }
.gsd-input:focus-visible,
.gsd-select:focus-visible,
.gsd-textarea:focus-visible {
  border-color: var(--bridge-accent);
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--bridge-accent-dim);
}
[data-invalid] .gsd-input,
[data-invalid] .gsd-select,
[data-invalid] .gsd-textarea {
  border-color: var(--destructive);
}
```

```tsx
// FormControls TextField / SelectField / NumberField — merge shared class
className={cn("gsd-input", className)}
// select → "gsd-select", textarea → "gsd-textarea"
```

Keep the isolation test that forbids bare `input[type="text"]` tag blocks; add asserts that `.gsd-input` / `[data-invalid] .gsd-input` exist on web until Phase 2 Input migration.

## Warnings

### WR-01: Bridge collapses border-strong and text hierarchy into single tokens

**File:** `src/index.web.css:168-173`, `312-316`, `458-461`
**Issue:** Transitional `@theme` maps:

- `--color-gsd-border-strong` → same as `--border`
- `--color-gsd-text-secondary`, `--color-gsd-text-dim`, `--color-gsd-text-muted` → all `var(--muted-foreground)`

Product chrome still uses `border-gsd-border-strong`, hover border upgrades, and three text steps. On web, hover borders often set `border-color: var(--border)` (same as resting state), so hover affordance is weaker or invisible (e.g. `.gsd-btn`, `.gsd-choice-btn`). Text hierarchy between dim/muted/secondary is lost.

**Fix:** Introduce distinct bridge tokens:

```css
:root {
  --bridge-border: oklch(0.922 0 0);
  --bridge-border-strong: oklch(0.8 0 0);
  --bridge-text-secondary: oklch(0.4 0 0);
  --bridge-text-dim: oklch(0.45 0 0);
  --bridge-text-muted: oklch(0.55 0 0);
}
.dark {
  --bridge-border: oklch(1 0 0 / 10%);
  --bridge-border-strong: oklch(1 0 0 / 18%);
  --bridge-text-secondary: oklch(0.75 0 0);
  --bridge-text-dim: oklch(0.7 0 0);
  --bridge-text-muted: oklch(0.6 0 0);
}
@theme inline {
  --color-gsd-border: var(--bridge-border);
  --color-gsd-border-strong: var(--bridge-border-strong);
  --color-gsd-text-secondary: var(--bridge-text-secondary);
  --color-gsd-text-dim: var(--bridge-text-dim);
  --color-gsd-text-muted: var(--bridge-text-muted);
}
```

And restore hover borders to `var(--bridge-border-strong)` in `.gsd-btn:hover`, `.gsd-choice-btn:hover`, etc.

### WR-02: Button `className` is not conflict-resolved by `cn` / `twMerge`

**File:** `src/components/ui/button.tsx:43-54`
**Issue:**

```tsx
className={cn(buttonVariants({ variant, size, className }))}
```

`className` is folded into CVA first (clsx-style concat). Outer `cn()` receives a **single string**, so `tailwind-merge` never resolves conflicts between variant classes (`h-8`, `bg-primary`) and caller overrides (`h-10`, `bg-red-500`). In Tailwind, source-order in the stylesheet wins — not class-string order — so overrides are unreliable. This undermines the purpose of installing `cn` for the walking skeleton.

**Fix:**

```tsx
className={cn(buttonVariants({ variant, size }), className)}
```

Add a unit assertion that `buttonVariants` + consumer height override collapses to a single height utility when composed via the same pattern Button uses.

### WR-03: Web `:root` is light while boot theme still applies only after JS module load

**File:** `src/index.web.css:27-36`; `src/main.tsx:6-11`; `index.html` (no blocking theme script)
**Issue:** Legacy desktop CSS used **dark** tokens on `:root` (product default aesthetic). Web OKLCH scaffold puts **light** tokens on `:root` and dark under `.dark`. `bootstrapTheme()` still runs only after the deferred `main.tsx` module evaluates — there is no blocking inline script in `index.html`. For the common dark/system-dark case, first paint can flash light before dual-write applies `.dark`. THM-02 claims no-flash boot; polarity flip makes the dark path worse than pre-split.

**Fix (pick one):**

1. Prefer true no-flash: tiny inline script in `index.html` head that reads `gsd-pi-config.theme` + `matchMedia` and sets `data-theme` + `class="dark"` before CSS paint; keep `bootstrapTheme` as authority sync.
2. Or set web CSS initial canvas closer to dark product default **only if** product still defaults dark — still keep dual-write for light users.

Also extend theme tests to document the boot contract (storage allowlist + dual-write already covered; FOUC remains manual per VALIDATION).

### WR-04: `shadcn` CLI is a runtime `dependencies` entry

**File:** `package.json:17-34`
**Issue:** `"shadcn": "^4.13.1"` is listed under `dependencies` alongside React. Nothing under `src/` imports `shadcn`. It is a **dev-time CLI** (plus a large transitive tree) and will be installed in production/Vercel dependency installs without being needed at runtime. Increases install surface and supply-chain weight for no product benefit. (`@base-ui/react`, `cva`, `clsx`, `tailwind-merge`, `tw-animate-css` are legitimate runtime/CSS deps.)

**Fix:**

```bash
npm uninstall shadcn
npm install -D shadcn@4.13.1
```

Keep pin `4.13.1` for `npx shadcn@4.13.1 add …`. Optionally document the pin in README / phase notes.

### WR-05: Isolation suite does not lock the platform CSS wiring

**File:** `src/lib/foundation.isolation.test.ts` (entire file); missing asserts against `vite.config.ts` / `src/main.tsx`
**Issue:** Tests read CSS file **contents** and `components.json`, and allowlist `ui/`. They never assert:

- `src/main.tsx` contains `import "@platform-css"`
- `vite.config.ts` maps `@platform-css` → web vs desktop by `mode === "web"`
- Shared `index.css` remains deleted

A regression that reintroduces `import "./index.css"`, drops the alias, or always points at desktop CSS would still pass unit tests until someone notices a dual build by eye.

**Fix:** Add static source gates:

```ts
const main = readFileSync(path.join(root, "src/main.tsx"), "utf8");
expect(main).toMatch(/import\s+["']@platform-css["']/);
expect(existsSync(path.join(root, "src/index.css"))).toBe(false);

const vite = readFileSync(path.join(root, "vite.config.ts"), "utf8");
expect(vite).toMatch(/"@platform-css"/);
expect(vite).toMatch(/index\.web\.css/);
expect(vite).toMatch(/index\.desktop\.css/);
expect(vite).toMatch(/mode\s*===\s*["']web["']/);
```

### WR-06: Installed Button defaults violate Phase UI-SPEC hit-target / destructive contract

**File:** `src/components/ui/button.tsx:10-20`, `22-25`; contract in `01-UI-SPEC.md` (Button sizes / destructive)
**Issue:**

- Default size is `h-8` (32px). UI-SPEC requires ≥36px preferred and ~40px for primary chrome actions when mounted.
- Destructive variant is translucent (`bg-destructive/10 text-destructive`), not solid destructive fill as the phase button contract table describes.

Acceptable only while import-only; becomes a product bug the moment Phase 2 mounts Button as the site button language without adjusting CVA.

**Fix:** Before any product mount, adjust CVA defaults (or wrap a product `GsdButton`) to `h-9`/`h-10` and a solid destructive variant, and extend `button.import.test.ts` / isolation variant checks accordingly. Do not rely on raw CLI defaults if they conflict with the approved UI-SPEC.

## Info

### IN-01: `uiClasses.ts` still documents deleted `index.css`

**File:** `src/lib/uiClasses.ts:1`
**Issue:** Header comment says `see index.css for definitions` but entry was split/deleted.
**Fix:** Point comment at `index.web.css` / `index.desktop.css` (or `@platform-css`).

### IN-02: Isolation test cyan-primary check is hex-only

**File:** `src/lib/foundation.isolation.test.ts:72-76`
**Issue:** Only forbids `--primary: #22d3ee`. An OKLCH/cyan mapping would pass.
**Fix:** Also forbid obvious cyan OKLCH patterns or assert `--primary` matches the official neutral scaffold line.

### IN-03: Theme tests never call `bootstrapTheme`

**File:** `src/lib/theme.test.ts`
**Issue:** Dual-write is covered via `applyTheme` only. `bootstrapTheme` is a thin wrapper but is the boot entry used by `main.tsx`.
**Fix:** One test: stub storage + document, call `bootstrapTheme()`, expect dual-write.

### IN-04: No automated assertion that desktop build graph excludes `@base-ui` / `components/ui`

**File:** isolation tests / package scripts
**Issue:** ISO-01 is enforced at CSS import level and by “don’t import Button from product code,” but nothing fails if a shared module starts importing `@/components/ui/button` into the desktop graph.
**Fix:** Later phase — grep/architecture test that desktop entry imports never reach `components/ui/*`, or inspect desktop client bundle for `@base-ui/react`.

---

_Reviewed: 2026-07-21T23:55:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
