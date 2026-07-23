# Phase 4: Form Kit Adapters + Editor Chrome - Pattern Map

**Mapped:** 2026-07-22  
**Files analyzed:** 12  
**Analogs found:** 12 / 12  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/switch.tsx` | component (ui primitive) | request-response | `src/components/ui/button.tsx` / base-nova CLI | role-match |
| `src/components/ui/select.tsx` | component (ui primitive) | request-response | `src/components/ui/dialog.tsx` (compound Base UI) | role-match |
| `src/components/ui/checkbox.tsx` | component (ui primitive) | request-response | `src/components/ui/input.tsx` | role-match |
| `src/components/ui/popover.tsx` | component (ui primitive) | request-response | `src/components/ui/dialog.tsx` (portal + positioner) | role-match |
| `src/components/ui/*.import.test.ts` (×4) | test | transform | `src/components/ui/dialog.import.test.ts` | exact |
| `src/components/FormControls.tsx` | component (form kit adapters) | request-response / transform | **self** (stable API) + Phase 3 `ShareModal` Button/Dialog compose | exact (API) / partial (web branch) |
| `src/ConfigApp.tsx` | component (editor shell) | request-response / CRUD orchestration | **self** (handlers) + `WebStartPanel` / `ShareModal` Button language | role-match (chrome) |
| `src/components/Sidebar.tsx` | component (nav chrome) | request-response | **self** (`SECTION_GROUPS` data) + Phase 2 linear nav language | exact (data) |
| `src/lib/foundation.isolation.test.ts` | test | transform | **self** (Phase 3 FND-03 flip pattern) | exact |
| `src/lib/phase04.forms.test.ts` | test | transform | `src/lib/phase03.overlays.test.ts` + `phase02.surfaces.test.ts` | exact |
| `src/index.web.css` (bridge/btn retirement optional) | config / styles | transform | Phase 2/3 web CSS + foundation bridge tests | role-match |
| `src/components/sections/*Section.tsx` | component | CRUD (controlled) | **do not rewrite** — inherit via FormControls | N/A (out of edit) |

## Pattern Assignments

### `src/components/ui/switch.tsx` (+ select, checkbox, popover)

**Analog:** Phase 1–3 primitives install + Mist Sky overrides  
**Source of truth for shape:** `src/components/ui/button.tsx`, `input.tsx`, `dialog.tsx`  
**Install:** `npx shadcn@4.13.1 add switch select checkbox popover -y` only (no card/sheet/alert)

**Imports / structure pattern** (`button.tsx` lines 1–4, 44–56):

```typescript
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
// export named function + data-slot; Base UI only — never @radix-ui/
```

**Mist Sky override contract** (copy from existing Input/Button after CLI):

```typescript
// input.tsx lines 11–12 — linear control chrome
"h-10 min-h-10 ... rounded-none border border-input ... focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
// button.tsx — rounded-none, min-h-10 default size
```

**Post-install overrides (RESEARCH / UI-SPEC):**

| File | Override |
|------|----------|
| `select.tsx` | Trigger `h-10 min-h-10 rounded-none w-full`; Content/Item `rounded-none` |
| `switch.tsx` | Prefer `h-5 w-9` track; **capsule allowed** as sole non-square exception; outer hit ≥40 via wrapper |
| `checkbox.tsx` | Prefer square / near-square |
| `popover.tsx` | `rounded-none`; no blur glass; width match trigger when used as multi |

**Import-only test analog** (`dialog.import.test.ts` lines 23–62):

```typescript
// import exports; assert @base-ui/react/<name>; no @radix-ui/; Mist Sky (rounded-none, no backdrop-blur)
import { Dialog, DialogContent, ... } from "./dialog";
expect(src).toContain("@base-ui/react/dialog");
expect(src).not.toMatch(/@radix-ui\//);
expect(src).toMatch(/rounded-none/);
```

Apply same to `switch.import.test.ts`, `select.import.test.ts`, `checkbox.import.test.ts`, `popover.import.test.ts`.

---

### `src/components/FormControls.tsx` (component, request-response)

**Analog:** Current file (stable API) + platform branch via `isWebPlatform`  
**Platform helper:** `src/platform/index.ts` lines 10–12 (`isWebPlatform`)

**Do not change exports/props:**

| Export | Keep |
|--------|------|
| `Field` | `label`, `description?`, `children`, `path?`, `value?` |
| `Toggle` | `checked`, `onChange(boolean)` |
| `SelectField` / `LabeledSelectField` | value/onChange/options/placeholder/allowEmpty |
| `MultiSelectField` / `ComboField` / `TextField` / `NumberField` / `TagInput` | existing props |
| `SectionHeader` | `title`, `description?` |
| `ModelPicker` / `ModelChain` | catalog/chain semantics |

**Field contract — MUST keep** (lines 24–36):

```tsx
export function Field({ label, description, children, path, value }: FieldProps) {
  const meta = path ? getField(path) : undefined;
  const error =
    meta?.validator && value !== undefined && value !== null && value !== ""
      ? meta.validator(value)
      : null;

  return (
    <div
      className="..." // restyle classes only
      data-invalid={error ? "" : undefined}
      data-field-path={path}
    >
```

Palette jump depends on wrapper attribute (`ConfigApp.tsx` lines 588–594):

```tsx
const el = document.querySelector<HTMLElement>(
  `[data-field-path="${CSS.escape(path)}"]`,
);
```

**Platform-branched presentation pattern** (RESEARCH Pattern 1 — implement inside shared exports):

```tsx
import { isWebPlatform } from "@/platform"; // or relative ../platform
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
// select/checkbox/popover as needed

export function Toggle({ checked, onChange }: ToggleProps) {
  if (isWebPlatform()) {
    return (
      <div className="inline-flex min-h-10 min-w-10 items-center justify-center self-start sm:self-center">
        <Switch checked={checked} onCheckedChange={onChange} className="h-5 w-9" />
      </div>
    );
  }
  // DESKTOP: keep existing role="switch" track (lines 75–97) unchanged
  return (/* legacy markup */);
}
```

**Toggle legacy core** (lines 75–97) — desktop path:

```tsx
<button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} ...>
  <span className={`relative inline-flex h-5 w-9 ... ${checked ? "bg-gsd-accent" : "bg-gsd-border"}`}>
```

**SelectField empty → undefined** (lines 108–129) — preserve mapping on web Select:

```tsx
// native today:
value={value ?? ""}
onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
// web: Select value={value ?? null}; onValueChange map ""/null → undefined
// if SelectItem rejects value="", use sentinel mapped to undefined (same idea as CUSTOM_SENTINEL)
```

**MultiSelectField behavior to keep** (lines 178–288) while swapping shell:

- Summary: empty → placeholder; ≤2 → joined labels; else `N selected`
- `toggle(value)` add/remove from `values[]`
- Chips with `aria-label={\`Remove ${labelFor(v)}\`}`
- **Web:** replace hand `mousedown`/`Escape` + native checkbox with **Popover + Checkbox**; drop `active:scale` / loud chip classes
- **Desktop:** keep current panel/listeners markup

**TextField snowflake coercion — DO NOT drop** (lines 579–599):

```tsx
const display = value == null ? "" : typeof value === "string" ? value : String(value);
// web: <Input type="text" value={display} onChange={(e) => onChange(e.target.value || undefined)} />
// desktop: keep <input type="text" ...>
```

**ModelPicker product rules — DO NOT change** (lines 347–405):

```tsx
const CUSTOM_SENTINEL = "__custom__";
// knownQualified Set; isCustom → free-text Input placeholder "provider/model-id"
// option label: — Custom (provider/model) —
// empty catalog: quiet "No models available" (D-12) when restyling web
// Prefer Select groups on web; emitted values remain provider/model strings
```

**ModelChain semantics — visual only** (lines 420–537):

```tsx
const [rows, setRows] = useState(() => (chain.length > 0 ? chain : [""]));
useEffect(() => {
  const filtered = rows.filter(Boolean);
  // resync when external chain diverges
}, [chain]);
const commit = (next: string[]) => {
  setRows(next);
  onChange(next.filter(Boolean));
};
// always ≥1 row; remove last disabled; Primary / Fallback N; + Add fallback
// aria-label Move/Remove; do not invent drag-and-drop
```

**SectionHeader type scale** (lines 657–665 → web):

```tsx
// web: title text-xl font-semibold (20px); description text-sm text-muted-foreground
// desktop: may keep gsd-heading text-lg
```

**Web form class language:**

- Prefer `text-foreground`, `text-muted-foreground`, `border-border`, `border-destructive`, `bg-primary` tokens on web path
- Drop web `active:scale-[0.96]` on form controls
- Quiet chips: 1px border, not `bg-gsd-accent/20`
- TagInput remove: named button `Remove {value}` (improve from bare `x`)

**Button language inside FormControls (web only):** ghost/outline from `@/components/ui/button` for chip remove / ModelChain if buttonized — do not reintroduce `btn` / `gsd-btn`.

---

### `src/ConfigApp.tsx` (editor shell chrome only)

**Analog:** Self for dirty/save/scope; `ShareModal.tsx` / `WebStartPanel.tsx` for Button language

**Do not change (FRM-04):**

- `useDirty(prefs, originalPrefs)` (line 248)
- `anyDirty = isDirty || isModelsDirty || isSettingsDirty` (line 260)
- `webWorkspaceReady = !isWeb || filePath.length > 0` (line 675)
- `needsProjectSelection` (line 674)
- Save disabled predicate (lines 926–929):

```tsx
disabled={
  status === "saving" ||
  needsProjectSelection ||
  (isWeb ? !webWorkspaceReady : !anyDirty)
}
```

- Primary class ternary predicate (lines 936–939): `(isWeb ? webWorkspaceReady : anyDirty) && !needsProjectSelection`
- `pendingFocus` → `[data-field-path=…]` query (lines 588–602)
- Overlay exclusivity (`closeAllOverlays`, open helpers) — Phase 3 contracts
- `confirm(` for dirty — no AlertDialog
- Share/import/load/submit openers — handlers only

**Toolbar Button language (web)** — analog `ShareModal.tsx` lines 5–13:

```tsx
import { Button } from "@/components/ui/button";
// Prefer isWeb branches: web uses Button; desktop may keep btn/btnPrimary from uiClasses
```

Map (presentation only):

| Action | Web Button |
|--------|------------|
| Sections (mobile) | `variant="outline"` |
| Import / Load / Share / Export / Submit / Discard | `variant="outline"` |
| Save/Download when enabled | `variant="default"` |
| Save/Download when gated | `variant="outline"` + disabled |
| Banner Dismiss | `variant="ghost"` `size="sm"` |

Label matrix **unchanged** (Saving…/Downloading…/Saved/Downloaded/Save/Download).

**Error banner** (lines 985–990 → quiet Alert-style):

```tsx
{error && (
  <div
    role="alert"
    className="flex items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive sm:px-6"
  >
    <span className="min-w-0 wrap-break-word">{error}</span>
    <Button type="button" variant="ghost" size="sm" onClick={() => setError("")}>
      Dismiss
    </Button>
  </div>
)}
```

Keep host `error` string; replace lowercase `dismiss` with **Dismiss**.

**Mobile drawer** — keep `useSidebarDrawerLayout` + slide/scrim `bg-black/50`; restyle Sidebar panel classes only (D-16).

**Desktop update banner** — out of web success path; leave or quiet-only if touched.

---

### `src/components/Sidebar.tsx` (nav chrome)

**Analog:** Self for data; Phase 2 type/nav language for web chrome

**Keep:**

- `SECTION_GROUPS` / `SECTIONS` / `sectionLabel` / props API (lines 6–108)
- `dirtySections` set membership
- `footerLink` optional
- `variant` web vs desktop header split (lines 126–139)
- Dirty aria: `aria-label="Unsaved changes"` (lines 160–163)

**Web visual target (D-13)** — replace blur + gsd-nav-item fill:

```tsx
// nav surface: secondary/card, border-r border-border, NO backdrop-blur-sm on web
// kicker: text-xs font-semibold uppercase tracking-wider text-muted-foreground ("Sections")
// group labels: same 12px uppercase muted (replace text-[10px] / text-[9px] on web)
// item: min-h-10 full width
// active: border-l-[3px] border-l-primary bg-primary/10 font-semibold
// idle: text-muted-foreground hover:bg-muted
// dirty: h-1 w-1 rounded-full bg-primary (4px — not h-1.5)
```

**Desktop:** BrandMark block + legacy `gsd-nav-item*` OK (ISO).

---

### `src/lib/foundation.isolation.test.ts` (FND-03 expand)

**Analog:** Self Phase 3 allowlist flip (lines 15–30, 197–238)

**Wave 0 changes:**

```ts
const UI_ALLOWLIST = new Set([
  // existing button/input/textarea/dialog/command/input-group + import tests
  "switch.tsx", "switch.import.test.ts",
  "select.tsx", "select.import.test.ts",
  "checkbox.tsx", "checkbox.import.test.ts",
  "popover.tsx", "popover.import.test.ts",
]);

const REQUIRED_PHASE4 = ["switch.tsx", "select.tsx", "checkbox.tsx", "popover.tsx"] as const;

// FORBIDDEN_DUMP: REMOVE "select" and "popover"; keep card, sheet, drawer, alert-dialog, sonner, tooltip
```

**Bridge test (lines 110–123):** When ConfigApp web toolbar drops `.gsd-btn`, update expectation so web no longer **requires** `.gsd-btn*` for success — or assert bridge may retire after shell migration (align with discretion: drop on toolbar when Button lands). Desktop CSS must still keep form tag chrome (lines 144–148).

**Base UI only:** assert new primitive sources use `@base-ui/react/*`, not `@radix-ui/`.

---

### `src/lib/phase04.forms.test.ts` (NEW source contracts)

**Analog:** `src/lib/phase03.overlays.test.ts` + `src/lib/phase02.surfaces.test.ts`

**Scaffold pattern** (phase03 lines 1–63):

```typescript
/// <reference types="node" />
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}
// importsForbiddenUiClasses helper from phase02/03 for ConfigApp web path if needed
```

**Suggested contracts (from RESEARCH Validation Architecture):**

| Contract | Assert on |
|----------|-----------|
| FormControls exports | `export function` Field, Toggle, SelectField, LabeledSelectField, MultiSelectField, ComboField, TextField, NumberField, TagInput, SectionHeader, ModelPicker, ModelChain |
| Field attributes | `data-field-path` + `data-invalid` |
| Web primitives | imports `@/components/ui/switch|select|checkbox|popover|input|button` (or relative equivalent) |
| No native multi | no `<select multiple` |
| ModelPicker | `CUSTOM_SENTINEL` / `__custom__` + `provider/model-id` |
| ModelChain | `filter(Boolean)`, `+ Add fallback`, move/remove aria-labels |
| TextField | `String(value)` snowflake path |
| Desktop branch | legacy `role="switch"` and/or native `<select` still present in file |
| ConfigApp FRM-04 | `useDirty(`, `webWorkspaceReady`, `anyDirty` in save disabled |
| ConfigApp web toolbar | `Button` from ui/button; web path not using `btnPrimary` for primary CTA (desktop may still import uiClasses) |
| Sidebar web | left-edge / primary active language; no `backdrop-blur` on web restyle path if fully migrated |
| Security | do not regress preferencesCore — run existing test file, not rewrite |

**phase02 forbidden uiClasses symbols** (lines 23–31) — extend discipline to web editor chrome surfaces:

```ts
const FORBIDDEN_IMPORT_SYMBOLS = [
  "btn", "btnPrimary", "btnSegment", "btnSegmentActive",
  "choiceBtn", "choiceBtnActive", "segmentGroup",
] as const;
// Note: ConfigApp may still import these for DESKTOP branches — assert carefully
// (web-only Button usage OR isWeb ternary without btn on web branch)
```

---

### Section editors (`*Section.tsx`) — no analog rewrite

**Pattern:** Controlled `{ prefs, onChange }` consuming FormControls only.  
**Do not open for presentation class rewrites (D-03).** Heavy consumers already: ModelsSection (ModelChain), Routing/Experimental/Hooks/Parallel (ModelPicker, MultiSelect).

---

## Shared Patterns

### Authentication / secrets

**Source:** Phase 3 overlays + `preferencesCore`  
**Apply to:** Do not edit share/submit redaction this phase  
**Keep green:** `npm test -- src/lib/preferencesCore.test.ts`, phase03 Share/Submit contracts

### Platform branching (forms)

**Source:** `src/platform/index.ts` `isWebPlatform()` + dual CSS entries  
**Apply to:** All FormControls web presentation; ConfigApp toolbar Button migration  

```typescript
// src/platform/index.ts
export function isWebPlatform(): boolean {
  return import.meta.env.VITE_PLATFORM === "web";
}
```

Desktop keeps tag-styled native controls via `index.desktop.css`; web must not reintroduce bare `input[type=text]` / `select` tag chrome in `index.web.css`.

### Button language (WEB-06)

**Source:** `src/components/ui/button.tsx` + Phase 2 surfaces + ShareModal  
**Apply to:** ConfigApp web toolbar, FormControls web actions, banners  

| Role | Variant |
|------|---------|
| Primary CTA | `default` |
| Secondary | `outline` |
| Quiet dismiss / icon | `ghost` |
| Soft danger | `destructive` (soft) — not solid red Save |

### Error / validation display

**Source:** `Field` + `validators.ts` (`string | null`)  
**Apply to:** Field restyle only  

- Inline error under description  
- Soft destructive text + `data-invalid`  
- Optional control `aria-invalid` / destructive border  
- Shell errors: `setError(String(e))` + quiet banner  

### Validation (domain)

**Source:** `src/lib/fields.ts` + Field registry wiring  
**Apply to:** Do not change registry paths or validators this phase  

### Testing (source contracts)

**Source:** phase02/03 + foundation.isolation + ui `*.import.test.ts`  
**Apply to:** Wave 0 phase04 + FND-03 + four import tests  

Quick gate (RESEARCH):

```bash
npm test -- src/lib/foundation.isolation.test.ts src/lib/phase04.forms.test.ts src/components/ui/ src/lib/preferencesCore.test.ts
```

Dual build: `npm run build:web && npm run build`

### shadcn CLI discipline

**Source:** Phase 1–3 foundation  
**Apply to:** Wave 1 primitives  

- Pin `shadcn@4.13.1`  
- Style `base-nova` only  
- Allowlist fails closed  
- No full registry dump  

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All Phase 4 files have strong in-repo analogs (self + Phase 2/3 primitives/tests). Empty SelectItem `value=""` runtime behavior is an implementation verify (RESEARCH A1), not a missing analog file. |

**Residual / optional this phase (may defer Phase 5):**

| Surface | Note |
|---------|------|
| `ApiKeysSection` custom password/btn chrome | Not pure FormControls; residual OK if toolbar + FormControls meet WEB-04 |
| Skills/Agents library tables | Custom chrome; not FRM-01 primary path |

---

## Implementation Order (from RESEARCH — planner)

1. **Wave 0:** FND-03 allowlist + `phase04.forms.test.ts` stubs + import test placeholders  
2. **Primitives:** CLI add four + Mist Sky overrides + import tests green  
3. **Form kit FRM-01:** Field, Text, Number, Toggle, Select*, SectionHeader  
4. **Form kit cont.:** MultiSelect, TagInput, Combo  
5. **Domain FRM-03:** ModelPicker, ModelChain  
6. **Shell WEB-04 + FRM-04:** Sidebar + ConfigApp toolbar/banners/drawer classes  
7. **Gates:** full suite + dual builds + preferencesCore  

**Do not start shell before form kit (D-04).**

---

## Metadata

**Analog search scope:** `src/components/FormControls.tsx`, `ConfigApp.tsx`, `Sidebar.tsx`, `src/components/ui/*`, `src/lib/phase0{2,3}*.test.ts`, `foundation.isolation.test.ts`, `ShareModal.tsx`, `platform/index.ts`, phase 04 CONTEXT/UI-SPEC/RESEARCH  
**Files scanned:** ~20 primary sources  
**Pattern extraction date:** 2026-07-22  
**Key locked decisions referenced:** D-01–D-16, FRM-01–04, WEB-04, FND-03 expand  
