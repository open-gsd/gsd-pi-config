# Phase 4: Form Kit Adapters + Editor Chrome - Research

**Researched:** 2026-07-22  
**Domain:** shadcn/ui base-nova form primitives + FormControls adapters + ConfigApp editor chrome (React 19 + Vite 8 + Tailwind 4, dual web/desktop)  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Carried forward (do not re-open)
- **D-00a:** Mist Sky palette + linear grammar + `--radius: 0`
- **D-00b:** Button language: primary filled / outline secondary / soft danger outline
- **D-00c:** Dual-write theme Auto/Dark/Light
- **D-00d:** Dialog/Command from Phase 3 for overlay patterns if forms open nested UI
- **D-00e:** No logo cyan/purple primary; web-first presentation this milestone

#### FormControls adapter strategy
- **D-01:** Keep **same `FormControls.tsx` exports/API**; implement web presentation **inside** (not a full `.web.tsx` fork unless isolation fails)
- **D-02:** **Desktop keeps legacy gsd form chrome** (ISO) — platform CSS and/or platform branch so desktop does not adopt Mist Sky form look as a requirement
- **D-03:** **Section editors** change **presentation-only via FormControls** — avoid domain rewrites in `*Section.tsx`
- **D-04:** Implementation order: **Form kit first → editor shell** (FRM-01–03 then WEB-04)

#### Control mapping
- **D-05:** **Toggle** → shadcn **Switch** presentation; keep `checked`/`onChange` API + switch a11y
- **D-06:** **Select / LabeledSelect** → shadcn **Select** (preserve option values)
- **D-07:** **MultiSelect / Combo / TagInput** → compose **Command/Popover + Checkbox/Input**; keep chip remove UX; no native multi listbox
- **D-08:** **Text/Number + Field** → shadcn **Input** + linear labeled Field layout; keep `path` / `data-field-path` / `data-invalid` / description

#### Domain pickers
- **D-09:** **ModelPicker** — keep product UX; restyle with Combobox/Command-style search list
- **D-10:** **ModelChain** — keep reorder/add/remove semantics; linear rows visual only
- **D-11:** Domain pickers **stay in FormControls.tsx** (same exports)
- **D-12:** Empty/loading for model lists = **quiet inline** messages

#### Editor shell chrome (WEB-04)
- **D-13:** **Sidebar** = linear list + **left-edge active**; group labels uppercase muted
- **D-14:** **Toolbar** = Phase 2 **Button language** + quiet status text (Save when dirty primary; secondary outline; muted saving/saved/error)
- **D-15:** **Banners** = quiet Mist Sky **Alert-style** (soft danger/info); keep copy
- **D-16:** **Mobile drawer** — keep `useSidebarDrawerLayout` behavior; restyle panel only

### Claude's Discretion
- Exact invalid-field ring (soft danger border) styling beyond `data-invalid` contract
- When to fully drop remaining web `.gsd-btn` / bridge CSS after FormControls + shell no longer need it
- Whether Switch/Select land via `shadcn add` vs hand-compose from existing Dialog/Command patterns
- Density of SectionHeader typography within Phase 2 type scale

### Deferred Ideas (OUT OF SCOPE)
- Validation/invalid deep polish beyond Field contract (partially discretion)
- Full desktop form restyle
- Product redesign of ModelChain interaction
- Mobile nav IA redesign
- Phase 5 residual purge / a11y audit as separate hardening phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FRM-01 | Form control presentation restyled via stable FormControls API (Field, Toggle/Switch, Select, MultiSelect, Combo, text/number, tags, section headers) | Install base-nova `switch` `select` `checkbox` `popover`; branch web presentation inside `FormControls.tsx`; keep export props unchanged |
| FRM-02 | Preference section editors keep domain behavior (controlled prefs, validators, `data-field-path`) with presentation-only changes | Sections already consume FormControls; do not rewrite `*Section.tsx` domain; Field keeps path/invalid/validator wiring |
| FRM-03 | Domain-specific controls (ModelChain / ModelPicker) compose shadcn without losing product UX | Keep ModelPicker/ModelChain in FormControls; Select groups + custom sentinel; chain local-row state semantics unchanged |
| FRM-04 | Editor chrome restyle does not change dirty tracking, save, import, download, or scope semantics | Touch presentation only in ConfigApp toolbar/banners/Sidebar; leave `useDirty`, `save()`, openers, scope handlers intact |
| WEB-04 | Cloud editor route (`/`) shell fully restyled (sidebar, toolbar, status, banners) | Sidebar left-edge active; toolbar → Button language; quiet error banner + Dismiss; mobile drawer panel restyle |
</phase_requirements>

## Summary

Phase 4 is the **form kit + loaded editor shell** restyle that makes the cloud editor match Mist Sky end-to-end. Preferable strategy is already locked: keep one `FormControls.tsx` export surface, restyle **web presentation inside it** via `isWebPlatform()` (and web CSS), leave desktop on legacy gsd form tag chrome, then restyle ConfigApp shell (Sidebar / toolbar / banners / drawer) with Phase 2 Button language. Domain behavior must stay stable: controlled section props, field registry validators, `data-field-path` palette jump, dirty/save/download/import/share/scope.

Official **shadcn@4.13.1 base-nova** registry items for `switch`, `select`, `checkbox`, and `popover` map cleanly onto `@base-ui/react` (already installed at `1.6.0`) with **no new npm dependencies**. Registry defaults use rounded capsules/triggers and smaller hit targets (`SelectTrigger` `h-8`, Switch `~18×32`) — **override immediately** to Mist Sky linear grammar (radius 0, min-h 40, Switch capsule exception only). FND-03 must expand the allowlist and **flip** Phase 3’s forbid of `select` / `popover`.

**Primary recommendation:** Wave 0 expand isolation tests → `npx shadcn@4.13.1 add switch select checkbox popover -y` + Mist Sky overrides + import proofs → FormControls web branches (Field/Text/Number/Toggle/Selects first, then Multi/Combo/Tag, then ModelPicker/ModelChain) → editor shell (Sidebar + ConfigApp toolbar/banners) → phase04 source contracts + dual builds. Never touch `useDirty`, `fields.ts` registry paths, `preferencesCore` redaction, or save/download packaging.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form presentation (Switch/Select/Input/chips) | Browser / Client (`FormControls.tsx`) | shadcn ui primitives | Presentation-only; same exports for sections |
| Field validation display | Browser / Client (`Field` + `fields.ts`) | — | Registry validators already drive `data-invalid` + error text |
| Dirty tracking | Browser / Client (`useDirty`) | Field registry | FRM-04 — do not change comparison/paths |
| Save / Download / Import / Share / Scope | Browser / Client (`ConfigApp`) | Platform backend | Handlers presentation-only; web download vs desktop disk |
| Palette field-jump | Browser / Client (`ConfigApp` + `Palette`) | `data-field-path` on Field | QuerySelector contract must survive Field restyle |
| Editor shell chrome (sidebar/toolbar/banners) | Browser / Client (`Sidebar`, `ConfigApp`) | WebShell host | WEB-04 visual only |
| Desktop form isolation | CSS (`index.desktop.css`) + platform branch | Shared FormControls TS | Desktop legacy tag chrome; web must not force Mist Sky as desktop success criterion |
| FND-03 allowlist | Test / CI | — | Expand for switch/select/checkbox/popover |
| Secret handling (share/submit/keys) | Domain lib + backends | UI display only | No regression while rewiring form/shell chrome |

## Project Constraints (from CLAUDE.md)

Actionable directives that constrain this phase:

- Stay on **React + Vite + TypeScript**; shadcn must work with existing **Tailwind 4** setup
- **Behavior stability**: preference serialization, dirty/save, download/import, gallery/wizard data paths must keep working
- **Platform boundary**: web restyle must not regress desktop build/runtime; prefer web-scoped styles/components over forking business logic
- **Scope discipline**: no drive-by backend refactors or feature expansion beyond restyle
- **Security**: share/redact/export paths must not regress secret handling while UI is rewired
- Conventions: named exports, double quotes, 2-space indent, co-located `*.test.ts`, prefer pure helpers in `src/lib/`
- Form fields: keep registry contract in `fields.ts`; validators return `string | null`
- Prefer shared tokens / Mist Sky; no glass cards / gradient text / native multi-select listboxes
- Dual builds must stay green (`npm run build:web` + `npm run build`)

## Code Map (current surfaces)

### FormControls API — `src/components/FormControls.tsx` (666 lines)

| Export | Props (stable) | Current presentation | Web target |
|--------|----------------|----------------------|------------|
| `Field` | `label`, `description?`, `children`, `path?`, `value?` | gsd text colors; `data-field-path`; `data-invalid`; hint `?` | Linear Field; keep attributes; soft danger error |
| `Toggle` | `checked`, `onChange(boolean)` | hand-rolled `role="switch"` track | shadcn **Switch** on web; map `checked`/`onCheckedChange` |
| `SelectField` | `value`, `onChange`, `options`, `placeholder`, `allowEmpty`, `className` | native `<select>` | shadcn **Select**; empty → `undefined` |
| `LabeledSelectField` | `value`, `onChange`, `options[{value,label}]`, `placeholder` | native `<select>` | shadcn **Select** with labels |
| `MultiSelectField` | `values`, `onChange`, `options`, `placeholder` | hand-rolled panel + native checkboxes + chips | **Popover + Checkbox**; quiet chips |
| `ComboField` | `value`, `onChange`, `options`, `placeholder` | `<input list>` + datalist | Prefer Input + Popover suggestions on web (unused by sections today but FRM-01) |
| `TextField` | `value`, `onChange`, `placeholder`, `className` | native text input + **snowflake string coercion** | shadcn **Input**; keep coercion |
| `NumberField` | `value`, `onChange`, `min?`, `max?`, `placeholder?` | native number input | shadcn **Input** `type="number"` |
| `TagInput` | `values`, `onChange`, `placeholder?` | Enter-add chips; remove `x` (weak a11y) | quiet chips + Input; named remove buttons |
| `SectionHeader` | `title`, `description?` | `text-lg` title | **20px / 600** title + 14px muted desc |
| `ModelPicker` | `value`, `onChange`, `catalog`, `placeholder?` | native select + **optgroups** + `__custom__` sentinel + free-text | Select groups or searchable compose; custom path kept |
| `ModelChain` | `chain`, `onChange`, `catalog` | local `rows` state; Primary/Fallback; ↑↓ ×; `+ Add fallback` | visual only; semantics unchanged |

**Critical contracts on Field:**

```tsx
// MUST remain after restyle — palette jump + invalid styling
data-field-path={path}
data-invalid={error ? "" : undefined}
// Validator skip for empty: value !== undefined && value !== null && value !== ""
```

**ModelChain semantics (do not “simplify”):**

1. Local `rows` may hold trailing empty `""` while user picks; parent only receives `filter(Boolean)`
2. Resync `useEffect` when external `chain` diverges from filtered local rows
3. Always ≥1 UI row; remove last disabled; primary = index 0

**Consumers:** 28 section modules import FormControls. Heavy domain pickers: `ModelsSection` (ModelChain), `RoutingSection` / `ExperimentalSection` / `HooksSection` / `ParallelSection` (ModelPicker, MultiSelect). **Do not open `*Section.tsx` for presentation** (D-03).

**Library exceptions (not pure FormControls):** `ApiKeysSection` uses `btn`/`btnPrimary` + password inputs; Skills/Agents libraries use custom tables. Prefer shell + FormControls inheritance this phase; full library micro-chrome can residual to Phase 5 unless WEB-04 toolbar already covers host actions.

### Editor shell — `ConfigApp.tsx` + `Sidebar.tsx`

| Surface | Location | Current | Web target |
|---------|----------|---------|------------|
| Sidebar | `Sidebar.tsx` | `gsd-nav-item` + blur surface + dirty `h-1.5` | left-edge 2–3px primary + soft wash; 4px dirty dot; no blur; 12px group labels |
| Mobile drawer | ConfigApp + `useSidebarDrawerLayout` | fixed slide + `bg-black/50` scrim | keep behavior; restyle panel only (D-16) |
| Toolbar | ConfigApp header | `btn` / `btnPrimary` from `uiClasses` | Phase 2 **Button** only on web; enablement logic unchanged |
| Error banner | ConfigApp | soft danger bar; lowercase “dismiss” | quiet Alert-style; **Dismiss** |
| Update banner | ConfigApp desktop-only | accent wash | out of web success path |
| Start panel | WebStartPanel | Phase 2 done | do not regress |
| Field focus flash | ConfigApp `pendingFocus` | `[data-field-path="…"]` + `gsd-field-focus` | keep query + class; CSS flash may stay |

**FRM-04 enablement (do not change):**

| Platform | Primary CTA enabled when |
|----------|--------------------------|
| Desktop Save | `anyDirty && !needsProjectSelection && status !== "saving"` |
| Web Download | `webWorkspaceReady && !needsProjectSelection && status !== "saving"` |

`anyDirty = useDirty(prefs) || models JSON dirty || settings JSON dirty`.

### FND-03 today — `src/lib/foundation.isolation.test.ts`

- **Allowlist:** button, input, textarea, dialog, command, input-group (+ import tests)
- **FORBIDDEN_DUMP still includes `select` and `popover`** — Phase 4 must move them to allowlist/required and remove from forbidden
- Bridge test still expects `.gsd-btn*` on web until Phase 4 shell drops them (D-22 completion)
- Desktop must keep form tag selectors; web must **not** reintroduce bare `input[type=text]` / `select` tag chrome

### Existing primitives (do not reinstall)

`button`, `input`, `textarea`, `dialog`, `command`, `input-group` under `src/components/ui/`. Linear Mist Sky overrides already applied on Button/Input (min-h-10, rounded-none).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `shadcn` CLI | `4.13.1` [VERIFIED: npm registry / package.json pin] | `add switch select checkbox popover` into locked `components.json` | Project pin; base-nova only [CITED: components.json] |
| `@base-ui/react` | `1.6.0` [VERIFIED: package.json / npm] | Switch, Select, Checkbox, Popover headless | Already installed; base-nova default [CITED: ui.shadcn.com base-nova registry] |
| Phase 2 `Button` / `Input` / `Textarea` | local | Text/Number/Tag/Toolbar | WEB-06 language locked |
| Phase 3 `Dialog` / `Command` | local | Optional long-list Multi/Model search compose | D-00d; no new nested Dialog product shells |
| `class-variance-authority` / `clsx` / `tailwind-merge` / `cn` | existing | Class composition | Foundation |
| `lucide-react` | existing | Select chevron / Checkbox check (CLI rewrites IconPlaceholder) | components.json `iconLibrary: lucide` |
| React / react-dom | `^19.2.x` | UI | Existing |
| Vitest | `^4.x` | Source-contract + isolation tests | Existing `npm test` |

### Supporting (install via CLI only)

| File | Source | Purpose | When to Use |
|------|--------|---------|-------------|
| `src/components/ui/switch.tsx` | base-nova registry | Toggle web presentation | FRM-01 D-05 |
| `src/components/ui/select.tsx` | base-nova registry | SelectField / LabeledSelect / ModelPicker groups | FRM-01/03 D-06 |
| `src/components/ui/checkbox.tsx` | base-nova registry | MultiSelect option rows | FRM-01 D-07 |
| `src/components/ui/popover.tsx` | base-nova registry | MultiSelect / Combo shells | FRM-01 D-07 |

**Registry verification (2026-07-22):** [VERIFIED: ui.shadcn.com/r/styles/base-nova/{switch,select,checkbox,popover}.json]

- All four: `type: registry:ui`, **no `dependencies`**, **no `registryDependencies`** (no new npm packages expected)
- Switch: `@base-ui/react/switch` Root + Thumb; capsule track; `checked` / `onCheckedChange`
- Select: full compound (Root, Trigger, Value, Content, Item, Group, Label, scroll arrows); supports groups for ModelPicker
- Checkbox: Root + Indicator; `checked` / `onCheckedChange`
- Popover: Root, Trigger, Content (Portal+Positioner+Popup); controlled `open` / `onOpenChange`

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Official `shadcn add` Switch/Select | Hand-compose from Dialog/Command only | More custom a11y surface; **reject** — UI-SPEC discretion locks CLI add |
| Full `FormControls.web.tsx` fork | Branch inside shared file (D-01) | Fork only if isolation fails |
| CSS-only restyle of native `<select>` | shadcn Select | Fails D-06 / Mist Sky consistency |
| React Hook Form + Zod | Keep registry validators | Out of scope; behavior rewrite |
| Native `<select multiple>` | Popover + Checkbox | Forbidden anti-pattern (D-07) |
| Install Alert / Card / Sheet | Composed banners + existing layout | FND-03 tight; UI-SPEC forbids dump |
| Radix style (`-b radix`) | base-nova Base UI | **Never mix** [VERIFIED: components.json style base-nova] |

**Installation (executor):**

```bash
# components.json already locked base-nova → src/index.web.css
npx shadcn@4.13.1 add switch select checkbox popover -y
# Expect: switch.tsx, select.tsx, checkbox.tsx, popover.tsx only
# Do NOT: add alert | card | sheet | sonner | tooltip | --all
# Do NOT: change components.json style away from base-nova
```

**Post-install Mist Sky overrides (required):**

| Primitive default | Override to |
|-------------------|-------------|
| SelectTrigger `h-8`, `rounded-lg` | `h-10 min-h-10`, `rounded-none`, full width when used in Field (`w-full`) |
| SelectContent / Item `rounded-lg` / `rounded-md` | `rounded-none`; panel `bg-popover` + 1px border |
| Switch track ~18×32 | Prefer product **`h-5 w-9`** (20×36); keep capsule (sole non-square exception); outer hit via existing `after:-inset-*` or wrap `min-h-10 min-w-10` |
| Checkbox `rounded-[4px]` | Prefer square / near-square; keep check indicator |
| PopoverContent `rounded-lg` `w-72` | `rounded-none`; width match trigger (`w-(--anchor-width)` or `w-full min-w-52`) |
| Any `bg-black/10` blur | N/A for these four; keep Popover flat (no glass) |

**Version verification:** `shadcn@4.13.1`, `@base-ui/react@1.6.0` checked this session (2026-07-22). Latest registry `shadcn` on npm may be newer — **stay pinned to 4.13.1** for CLI add.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `shadcn` | npm | CLI pin already in repo | ~6.6M/wk | github.com/shadcn-ui/ui | SUS (too-new heuristic) | **Approved** — locked Phase 1; only `npx shadcn@4.13.1` |
| `@base-ui/react` | npm | installed 1.6.0 | ~7.8M/wk | github.com/mui/base-ui | OK | Approved (existing) — Switch/Select/Checkbox/Popover modules present |
| `cmdk` | npm | existing Phase 3 | ~42M/wk | github.com/pacocoursey/cmdk | OK | Existing — optional Multi long-list filter only |
| `class-variance-authority` | npm | mature | ~58M/wk | joe-bell/cva | OK | Existing |
| `clsx` | npm | mature | ~112M/wk | lukeed/clsx | OK | Existing |
| `tailwind-merge` | npm | mature | ~75M/wk | dcastil/tailwind-merge | OK | Existing |
| `lucide-react` | npm | existing pin | ~95M/wk | lucide-icons/lucide | SUS (too-new heuristic) | Approved existing icon lib |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** `shadcn`, `lucide-react` — already project-approved; **no new runtime npm deps** expected from this phase’s four registry items.

**Postinstall scripts:** `shadcn` package has no malicious install-time network postinstall for consumers using `npx shadcn@4.13.1 add` (CLI tool). [VERIFIED: npm view scripts / legitimacy seam]

*No packages recommended solely from training data without registry-item confirmation.*

## Architecture Patterns

### System Architecture Diagram

```text
┌─ User ──────────────────────────────────────────────────────────────────┐
│  Section fields · Model pickers · Sidebar · Toolbar · ⌘K field jump     │
└───────────────┬───────────────────────────┬─────────────────────────────┘
                ▼                           ▼
┌─ FormControls.tsx (stable API) ─┐   ┌─ ConfigApp shell (WEB-04) ────────┐
│ Field / Toggle / Select* / Multi │   │ Sidebar · toolbar · banners        │
│ Text / Number / Tag / SectionHdr │   │ dirty dots · Save/Download CTA     │
│ ModelPicker / ModelChain         │   │ open Import/Load/Share/Submit      │
│  isWebPlatform()?                │   │ pendingFocus → [data-field-path]   │
│   web: Switch/Select/Popover/…   │   └──────────────┬────────────────────┘
│   desktop: legacy markup         │                  │
└───────────────┬──────────────────┘                  │
                │                                     │
                ▼                                     ▼
┌─ shadcn ui (web CSS tokens) ────┐   ┌─ Domain (DO NOT REWRITE) ─────────┐
│ switch select checkbox popover  │   │ useDirty + fields registry         │
│ button input (+ command optional)│  │ save/download handlers             │
└─────────────────────────────────┘   │ preferencesCore redaction          │
                                      │ ConfigBackend I/O                  │
                                      └────────────────────────────────────┘
```

### Recommended Project Structure

```text
src/components/
├── ui/
│   ├── button.tsx / input.tsx / textarea.tsx     # existing
│   ├── dialog.tsx / command.tsx / input-group.tsx # existing Phase 3
│   ├── switch.tsx                                # NEW
│   ├── select.tsx                                # NEW
│   ├── checkbox.tsx                              # NEW
│   ├── popover.tsx                               # NEW
│   └── *.import.test.ts                          # NEW for four primitives
├── FormControls.tsx                              # web branches + domain pickers
├── Sidebar.tsx                                   # left-edge active (web)
└── sections/*Section.tsx                         # NO domain rewrite

src/ConfigApp.tsx                                 # toolbar Button language + banners (web)
src/hooks/useDirty.ts                             # DO NOT change
src/lib/fields.ts                                 # DO NOT change registry paths
src/lib/foundation.isolation.test.ts              # expand FND-03; flip select/popover forbid
src/lib/phase04.forms.test.ts                     # NEW source contracts FRM/WEB
src/index.web.css                                 # optional form bridge retirement after adapters
src/index.desktop.css                             # leave legacy form tag chrome
```

### Pattern 1: Platform-branched presentation inside shared exports

**What:** Keep export names/props; branch markup with `isWebPlatform()`.  
**When:** Every FormControls control that maps to a shadcn primitive.

```tsx
// Source: src/platform/index.ts isWebPlatform + Base UI Switch Root props
// [CITED: node_modules/@base-ui/react/switch + ui.shadcn.com base-nova switch]
import { isWebPlatform } from "@/platform";
import { Switch } from "@/components/ui/switch";

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  if (isWebPlatform()) {
    return (
      <div className="inline-flex min-h-10 min-w-10 items-center justify-center self-start sm:self-center">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          // override size to h-5 w-9 after install if needed
          className="h-5 w-9"
        />
      </div>
    );
  }
  // existing legacy button role=switch track — unchanged for desktop
  return (/* current markup */);
}
```

**Why branch (not shared-always like Phase 3 Dialog):** Desktop CSS styles bare `select` / `input[type=…]` tags. Unconditional shadcn Select would **bypass** desktop tag chrome and apply semantic classes (`bg-primary`, `border-input`) that desktop does not define as shadcn tokens — visual ISO risk. Runtime branch keeps desktop markup legacy.

### Pattern 2: Controlled Select with empty → undefined

**What:** Preserve SelectField contract (`""` option → `undefined`).  
**When:** SelectField, LabeledSelectField, ModelPicker empty/default.

```tsx
// Source: Base UI Select Root value/onValueChange (null allowed)
// [CITED: @base-ui/react/select SelectRoot.d.ts]
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// value prop may be undefined; Base UI accepts null for empty
const selectValue = value ?? null;

<Select
  value={selectValue}
  onValueChange={(next) => {
    // next may be null when cleared
    onChange((next == null || next === "") ? undefined : (next as T));
  }}
>
  <SelectTrigger className={cn("w-full sm:w-52 rounded-none min-h-10 h-10")}>
    <SelectValue placeholder={placeholder} />
  </SelectTrigger>
  <SelectContent className="rounded-none">
    {allowEmpty && (
      <SelectItem value=""> {/* if empty string unsupported, use sentinel + map */}
        {placeholder}
      </SelectItem>
    )}
    {options.map((opt) => (
      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Pitfall:** Some headless Select implementations disallow `value=""`. If Base UI rejects empty string items, use an explicit sentinel (e.g. `__empty__`) mapped to `undefined` — **same pattern as ModelPicker `CUSTOM_SENTINEL`**. Verify during implementation; do not change emitted preference values.

### Pattern 3: MultiSelect = Popover + Checkbox (no native multi)

```tsx
// Source: base-nova popover + checkbox registry; product MultiSelectField API
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Keep: summary text, chip row, Escape/outside close via Popover, values[] toggle
// Drop: hand-rolled mousedown/Escape listeners when Popover owns dismiss
// a11y: aria-expanded on trigger; Remove {label} on chips
```

### Pattern 4: ModelPicker groups + custom sentinel

```tsx
// Keep product rules from FormControls.tsx
const CUSTOM_SENTINEL = "__custom__";
// knownQualified Set from catalog
// isCustom → show Input for provider/model-id
// Prefer SelectGroup + SelectLabel per provider (Base UI Group exists)
// Empty catalog → quiet "No models available" (D-12)
// Do not change emitted `provider/model` strings
```

**Catalog length:** Prefer Select first (UI-SPEC). Add Command filter only if real catalogs prove unusable — discretion.

### Pattern 5: Field path + palette jump (do not break)

```tsx
// ConfigApp — already correct; Field must keep attribute
const el = document.querySelector<HTMLElement>(
  `[data-field-path="${CSS.escape(path)}"]`,
);
el?.scrollIntoView({ block: "center", behavior: "smooth" });
el?.classList.add("gsd-field-focus");
```

Restyling Field classes is fine; **moving `data-field-path` onto an inner control** breaks jump if the attribute is missing or nested without the wrapper.

### Pattern 6: Editor toolbar Button language (web)

```tsx
// ConfigApp web path only — keep desktop btn classes OR also migrate desktop
// UI-SPEC: web success uses Button; desktop visual not required
import { Button } from "@/components/ui/button";

// Secondary actions
<Button type="button" variant="outline" size="default" onClick={openImport} disabled={needsProjectSelection}>
  Import
</Button>

// Primary Save/Download — same disabled predicate as today
<Button
  type="button"
  variant={(isWeb ? webWorkspaceReady : anyDirty) && !needsProjectSelection ? "default" : "outline"}
  disabled={status === "saving" || needsProjectSelection || (isWeb ? !webWorkspaceReady : !anyDirty)}
  onClick={save}
>
  {/* existing label matrix: Saving…/Saved/Download/Downloaded */}
</Button>
```

Prefer `isWeb` branches so desktop keeps `btn`/`btnPrimary` until a future desktop restyle (D-02).

### Pattern 7: FND-03 allowlist expansion

```ts
// foundation.isolation.test.ts — conceptual
const UI_ALLOWLIST = new Set([
  // …existing Phase 1–3…
  "switch.tsx", "switch.import.test.ts",
  "select.tsx", "select.import.test.ts",
  "checkbox.tsx", "checkbox.import.test.ts",
  "popover.tsx", "popover.import.test.ts",
]);

// REQUIRED_PHASE4 = switch, select, checkbox, popover
// FORBIDDEN_DUMP: remove select + popover; keep card, sheet, drawer, alert-dialog, sonner, tooltip
// Assert no @radix-ui/ in new primitive sources (Base UI only)
```

### Pattern 8: Sidebar left-edge active (web)

```tsx
// Replace gsd-nav-item-active fill-only with linear edge
// active: border-l-[3px] border-l-primary bg-primary/10 font-semibold
// idle: text-muted-foreground hover:bg-muted
// dirty: h-1 w-1 rounded-full bg-primary (4px, not h-1.5)
// web: drop backdrop-blur-sm
// SECTION_GROUPS data unchanged
```

### Anti-Patterns to Avoid

- **Forking every `*Section.tsx` for class names** — defeats D-03; restyle FormControls only
- **Native `<select multiple>`** — DESIGN anti-pattern
- **Removing `data-field-path` or renaming paths** — breaks palette + dirty section mapping
- **Changing ModelChain filter/commit** — silent preference data loss
- **Installing full registry** — FND-03
- **Mixing Radix** — base-nova only
- **Touching `preferencesCore` / keyring / OAuth** — security/behavior risk
- **Solid red destructive Save** — soft danger only
- **Glass sidebar blur** — drop on web
- **React Hook Form rewrite** — out of scope
- **Assuming desktop can share shadcn form markup without token bridge** — branch presentation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Switch a11y + thumb motion | Custom checkbox CSS only | shadcn Switch / Base UI | Keyboard + data-checked states |
| Select popup positioning | Absolute div + manual focus | shadcn Select | Focus, typeahead, portal, scroll |
| MultiSelect dismiss | window mousedown/Escape | Popover open state | Matches Phase 3 drop of hand Escape |
| Class merging | String concat | `cn()` | Tailwind conflict resolution |
| Button language | New gsd-btn variants | `Button` / `buttonVariants` | WEB-06 completion |
| Dirty diff | Reimplement JSON walk | `useDirty` + `fields.ts` | FRM-04 |
| Secret redaction UI | Ad-hoc string replace | existing share/submit paths | Security |

**Key insight:** FormControls is the **single adapter seam** — invest there so 28 sections inherit Mist Sky without domain churn.

## Common Pitfalls

### Pitfall 1: Unconditional shadcn form markup breaks desktop chrome
**What goes wrong:** Desktop selects/inputs lose `index.desktop.css` tag styles and look broken or accidentally Mist Sky.  
**Why:** Shared FormControls + no platform branch.  
**How to avoid:** `isWebPlatform()` presentation branches; dual-build visual smoke on desktop.  
**Warning signs:** Desktop form fields unstyled; isolation test still passes (CSS isolation ≠ component isolation).

### Pitfall 2: Losing `data-field-path` on Field restyle
**What goes wrong:** ⌘K field jump scrolls nowhere.  
**Why:** Attribute moved/removed during class rewrite.  
**How to avoid:** Source contract asserting `data-field-path` + ConfigApp querySelector; manual smoke.  
**Warning signs:** `pendingFocus` effect runs but no flash.

### Pitfall 3: Select empty-value / option value mismatch
**What goes wrong:** Preferences write `""` instead of `undefined`, or options become unselectable.  
**Why:** Headless Select empty-string rules differ from native `<select>`.  
**How to avoid:** Explicit map empty ↔ `undefined`; preserve option **values** exactly (D-06).  
**Warning signs:** Dirty flags on open without user edit; validators fire unexpectedly.

### Pitfall 4: ModelChain local state “cleanup”
**What goes wrong:** Empty fallback rows disappear mid-edit; reorder desyncs parent chain.  
**Why:** “Simplifying” rows/effect.  
**How to avoid:** Keep commit/filter/resync algorithm; visual-only changes.  
**Warning signs:** Fallbacks vanish on re-render; ModelsSection writes wrong shape.

### Pitfall 5: FND-03 forbid still blocks select/popover
**What goes wrong:** CI red after `shadcn add`.  
**Why:** Phase 3 `FORBIDDEN_DUMP` includes select/popover.  
**How to avoid:** Wave 0 flip allowlist **before or with** install.  
**Warning signs:** `foundation.isolation.test.ts` fails on unexpected ui file.

### Pitfall 6: Toolbar restyle changes enablement
**What goes wrong:** Download enabled with no workspace; Save enabled when clean.  
**Why:** Refactoring className ternary also “cleans up” disabled logic.  
**How to avoid:** Copy predicates verbatim; FRM-04 source contracts on `anyDirty` / `webWorkspaceReady`.  
**Warning signs:** Accidental always-primary Save button.

### Pitfall 7: Nested Select inside Dialog focus regression
**What goes wrong:** Select inside Import/Submit or future nested UI traps focus badly.  
**Why:** Multiple modal layers (Phase 3 open risk).  
**How to avoid:** No new nested Dialog shells; Select/Popover inside Dialog is OK per Phase 3 D-15; smoke MultiSelect in page body first.  
**Warning signs:** ESC closes Dialog instead of Select; tab loop escapes.

### Pitfall 8: Secret UX regression while restyling chrome
**What goes wrong:** Share/Submit still work but warnings disappear; ApiKeys reveal logs values.  
**Why:** Banner/button rewires drop `role="alert"` or console debug.  
**How to avoid:** Do not touch redaction/scan handlers; keep phase03 security contracts green; never `console.log` key material.  
**Warning signs:** preferencesCore tests fail; missing redaction copy in Share.

### Pitfall 9: Registry dump via CLI peers
**What goes wrong:** Extra components land in `ui/`.  
**Why:** Wrong `shadcn add` invocation or unpinned CLI.  
**How to avoid:** Pin `4.13.1`; only four names; allowlist fails closed.  
**Warning signs:** New `card.tsx` / `sheet.tsx`.

### Pitfall 10: Type scale violations (`text-[9px]` etc.)
**What goes wrong:** UI-SPEC fails type contract on web restyle.  
**Why:** Copying legacy Sidebar/ModelChain classes.  
**How to avoid:** Map to 12/14/20 only on web restyled surfaces.  
**Warning signs:** `text-[10px]` remains on web Sidebar kicker.

## Code Examples

### Toggle → Switch adapter

```tsx
// Source: https://ui.shadcn.com/r/styles/base-nova/switch.json + Base UI SwitchRoot
// checked?: boolean; onCheckedChange?: (checked: boolean, details) => void
<Switch checked={checked} onCheckedChange={onChange} />
```

### TextField with snowflake coercion (keep)

```tsx
// Source: existing FormControls.tsx TextField — DO NOT drop
const display = value == null ? "" : typeof value === "string" ? value : String(value);
return (
  <Input
    type="text"
    value={display}
    onChange={(e) => onChange(e.target.value || undefined)}
    placeholder={placeholder}
    className={className}
  />
);
```

### ModelChain labels (visual only)

```tsx
// Keep semantics; restyle labels to text-xs font-semibold uppercase text-muted-foreground
// Add control: text-xs text-primary (link style), not filled Button
// Reorder/remove: ghost quiet controls with existing aria-labels
```

### Quiet error banner

```tsx
// ConfigApp — presentation only
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-rolled switch track | Base UI Switch via shadcn base-nova | shadcn v4 Base UI style | A11y + design tokens |
| Native `<select>` everywhere | Compound Select popup | base-nova select | Portal + groups; empty-value care |
| Hand MultiSelect listeners | Popover dismiss ownership | Phase 4 | Less Escape conflict with Dialog |
| `gsd-btn` editor toolbar | `Button` variants | Phase 2 language → Phase 4 shell | WEB-06 completion on editor |
| Phase 3 forbid select/popover | Phase 4 allow + require | This phase | FND-03 expansion |

**Deprecated/outdated for this phase:**

- Using `uiClasses.btn*` on **web** editor toolbar/actions
- Accent-filled TagInput chips (`bg-gsd-accent/20`) on web — quiet bordered chips
- `active:scale-[0.96]` on web form controls
- Sidebar `backdrop-blur-sm` on web

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Base UI Select may need sentinel for empty option if `value=""` items are rejected | Pattern 2 / Pitfall 3 | Empty “Default” option broken until mapped |
| A2 | Desktop bundle may include unused Switch/Select code when branching at runtime (acceptable visual ISO) | Pattern 1 | Bundle size only; if tree-shake required, need alias fork |
| A3 | ComboField unused by sections today; still restyle for FRM-01 completeness | Code Map | Low — export may stay lightly tested |
| A4 | ApiKeys / library custom chrome can residual to Phase 5 if FormControls + shell meet WEB-04 | Code Map | Partial visual inconsistency on API Keys section |
| A5 | MultiSelect option lists are short enough without Command filter | Pattern 3 | Long lists need Command compose later |

**If empty table:** N/A — five assumptions listed for planner/user confirmation.

## Open Questions (RESOLVED)

> **Planner-locked 2026-07-22** — answers below are binding for Phase 4 plans. Residual UAT may refine implementation details within these locks.

1. **Empty Select item value strategy** — **LOCKED**  
   - Prefer Base UI `null`/empty root value mapping to product `undefined` (same as native `""` → `undefined`).  
   - If SelectItem rejects empty string at runtime, use an internal sentinel **only inside the adapter**; never emit the sentinel into prefs/models/settings.  
   - Preserve option **values** exactly for non-empty options (D-06).

2. **Drop `.gsd-btn` bridge on web** — **LOCKED**  
   - **Must drop** `btn` / `btnPrimary` (and related uiClasses button language) on **ConfigApp web toolbar actions** + **FormControls web path** when Button lands (WEB-04 / D-14 / D-00b).  
   - **ApiKeys / Skills / Agents library micro-chrome may residual to Phase 5** (A4) — not a Phase 4 blocker.  
   - Update `foundation.isolation` bridge assertion so web no longer *requires* `.gsd-btn*` for success after shell migration; desktop may keep bridge classes; residual web bridge CSS is OK until Phase 5 full purge if still referenced by library surfaces.

3. **ModelPicker Select vs Command search** — **LOCKED**  
   - **Select with provider groups first** (UI-SPEC / D-09).  
   - Command/Combobox search only if Select UX fails with catalog length during implementation/UAT — not the default path.

4. **Desktop FormControls code path testing** — **LOCKED**  
   - Keep `isWebPlatform()` dual markup paths (D-01/D-02).  
   - `phase04.forms.test.ts` must assert legacy desktop markers still present (e.g. `role="switch"` track path and/or native select markup in non-web branch).  
   - Dual builds (`build:web` + `build`) are the compile gate; visual desktop ISO is manual.
## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | builds/tests | ✓ | v26.0.0 (CI targets 20+) | — |
| npm / npx | shadcn CLI add | ✓ | 11.12.1 | — |
| `shadcn@4.13.1` | primitive install | ✓ | pinned in package.json | pin exact CLI |
| `@base-ui/react` | switch/select/checkbox/popover | ✓ | 1.6.0 (modules present) | hand-install peer if CLI omits (Phase 1 lesson) |
| Vitest | contracts | ✓ | 4.x via npm test | — |
| Rust/Tauri | desktop runtime smoke | optional for this phase | — | `npm run build` frontend gate sufficient for ISO compile |
| Context7 MCP | docs | ✗ in agent | — | Official registry JSON + local d.ts used |

**Missing dependencies with no fallback:** none for planning/execution of this phase.

**Missing dependencies with fallback:** Context7 — used registry HTTP + local `@base-ui/react` types.

## Validation Architecture

> `workflow.nyquist_validation` enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (`vitest run`) |
| Config file | `vite.config.ts` (`test` block) |
| Quick run command | `npm test -- src/lib/foundation.isolation.test.ts src/lib/phase04.forms.test.ts src/components/ui/ src/lib/preferencesCore.test.ts` |
| Full suite command | `npm test` |
| Dual build gate | `npm run build:web && npm run build` |
| Baseline at research | **110 tests green** (18 files) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-03 | allowlist switch/select/checkbox/popover; no card/sheet dump; Base UI only | unit | `npm test -- src/lib/foundation.isolation.test.ts` | ✅ update |
| FRM-01 | FormControls keeps exports; web path uses ui primitives; no native multi | unit (source) | `npm test -- src/lib/phase04.forms.test.ts` | ❌ Wave 0 |
| FRM-01 | Field keeps `data-field-path` + `data-invalid` | unit (source) | phase04.forms | ❌ Wave 0 |
| FRM-02 | Sections still import FormControls symbols (smoke count) optional | unit | phase04 or skip | optional |
| FRM-03 | ModelPicker CUSTOM_SENTINEL + ModelChain commit/filter keywords present | unit (source) | phase04.forms | ❌ Wave 0 |
| FRM-04 | ConfigApp save disabled predicates / useDirty import unchanged keywords | unit (source) | phase04.forms | ❌ Wave 0 |
| WEB-04 | Sidebar left-edge / ConfigApp Button imports on web toolbar | unit (source) | phase04.forms | ❌ Wave 0 |
| Security | preferencesCore redaction/scan unchanged | unit | `npm test -- src/lib/preferencesCore.test.ts` | ✅ |
| ISO | dual builds; desktop CSS still has form tag chrome | other + unit | build + foundation.isolation | ✅ |
| Primitives | import-only Switch/Select/Checkbox/Popover | unit | `src/components/ui/*.import.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Quick run (foundation + phase04 + ui imports + preferencesCore)
- **Per wave merge:** Full suite + dual builds
- **Phase gate:** Full suite green + dual builds + human form/chrome smoke before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Update `src/lib/foundation.isolation.test.ts` — allowlist + required Phase 4 primitives; remove select/popover from FORBIDDEN_DUMP; adjust `.gsd-btn` bridge expectation when toolbar migrates
- [ ] Add `src/lib/phase04.forms.test.ts` — FRM-01/03/04 + WEB-04 source contracts (readFileSync pattern from phase02/03)
- [ ] Add `switch.import.test.ts`, `select.import.test.ts`, `checkbox.import.test.ts`, `popover.import.test.ts`
- [ ] Framework install: none (Vitest present)
- [ ] Optional: assert desktop branch still contains legacy Toggle markup string after web Switch path lands

### Suggested phase04 source contracts (planner)

| Contract | Assert |
|----------|--------|
| FormControls exports | `export function` for Field, Toggle, SelectField, LabeledSelectField, MultiSelectField, ComboField, TextField, NumberField, TagInput, SectionHeader, ModelPicker, ModelChain |
| Field attributes | `data-field-path` and `data-invalid` present |
| Web primitives | imports from `@/components/ui/switch|select|checkbox|popover|input|button` |
| No native multi | no `<select multiple` |
| ModelPicker | `CUSTOM_SENTINEL` / `__custom__` and custom placeholder `provider/model-id` |
| ModelChain | `filter(Boolean)`, `+ Add fallback`, move/remove aria-labels |
| TextField | snowflake coercion `String(value)` path |
| ConfigApp web toolbar | `Button` from ui/button; no `btnPrimary` import usage on web path (or exclusive desktop) |
| FRM-04 | `useDirty(` still used; save disabled includes `webWorkspaceReady` / `anyDirty` |
| Security | phase03 overlays + preferencesCore still pass |

## Security Domain

> `security_enforcement` enabled; ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | partial (OAuth submit exists) | Do not rewire OAuth; Phase 3 Submit intact |
| V3 Session Management | partial | sessionStorage submit pending — do not touch |
| V4 Access Control | no (local config tool) | — |
| V5 Input Validation | yes | Existing `validators.ts` + Field registry; keep inline errors |
| V6 Cryptography | no new crypto | Never hand-roll; keyring stays desktop backend |
| V5/V8 Secrets in UI | yes | Share redaction; Submit `scanForLeakedSecrets`; ApiKeys password fields; no console secret logs |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret leakage via Share/Export UI | Information Disclosure | Keep `buildShareablePreset` / `redactSensitive`; phase03 contracts |
| Secret scan bypass on Submit | Information Disclosure | Keep `scanForLeakedSecrets` before OAuth; visible soft-danger errors |
| API key reveal in DOM/logs | Information Disclosure | ApiKeys `type=password` default; no logging values during restyle |
| XSS via preference field render | Tampering | React text binding; do not `dangerouslySetInnerHTML` in Field |
| Prototype pollution via path focus | Tampering | `CSS.escape(path)` already used for querySelector |
| Supply-chain registry dump | Tampering | FND-03 allowlist; pin shadcn@4.13.1; official registry only |
| Desktop secret store regression | Elevation/Info | Do not change Tauri keyring commands this phase |

**Phase 4 security rule:** Form/shell restyle is presentation-only. Prefer **not** editing `preferencesCore.ts`, `webBackend` key store, Submit OAuth helpers, or Share redaction copy. Keep `npm test -- src/lib/preferencesCore.test.ts` and phase03 overlay security assertions green.

## Sources

### Primary (HIGH confidence)

- Workspace codebase: `FormControls.tsx`, `ConfigApp.tsx`, `Sidebar.tsx`, `useDirty.ts`, `fields.ts`, `foundation.isolation.test.ts`, `components.json`, `package.json`, `index.web.css`, `index.desktop.css`
- Official shadcn base-nova registry JSON (fetched 2026-07-22):  
  `https://ui.shadcn.com/r/styles/base-nova/switch.json`  
  `https://ui.shadcn.com/r/styles/base-nova/select.json`  
  `https://ui.shadcn.com/r/styles/base-nova/checkbox.json`  
  `https://ui.shadcn.com/r/styles/base-nova/popover.json`
- Local types: `@base-ui/react` Switch/Select/Checkbox/Popover Root `.d.ts` (installed 1.6.0)
- Phase artifacts: `04-CONTEXT.md`, `04-UI-SPEC.md`, `03-RESEARCH.md`, `03-05-SUMMARY.md`, `PALETTE.md`, `REQUIREMENTS.md`
- `gsd-tools query package-legitimacy check` (2026-07-22)
- `npm view` for `shadcn@4.13.1`, `@base-ui/react@1.6.0`
- Live suite: 110 tests passing

### Secondary (MEDIUM confidence)

- Phase 3 research patterns (shared Dialog strategy vs form branch necessity)
- UI-SPEC discretion resolutions for Switch capsule + invalid ring

### Tertiary (LOW confidence)

- A1 empty SelectItem value behavior under Base UI runtime (verify in implementation)
- A2 bundle impact of dual code paths

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack | HIGH | Registry JSON + installed Base UI modules + pinned CLI |
| Architecture | HIGH | Locked CONTEXT/UI-SPEC + full FormControls/ConfigApp map |
| Pitfalls | HIGH | Derived from dual-platform isolation history + concrete contracts |
| Empty-select edge | MEDIUM | Needs runtime verify (A1) |
| Library section residual scope | MEDIUM | ApiKeys custom chrome vs WEB-04 shell boundary |

**Research date:** 2026-07-22  
**Valid until:** ~2026-08-21 (30 days; re-check shadcn registry if CLI pin changes)

## Implementation Order (planner hint)

1. **Wave 0:** FND-03 allowlist + phase04 contract stubs + import test placeholders  
2. **Primitives:** `npx shadcn@4.13.1 add switch select checkbox popover -y` → Mist Sky overrides → import tests green  
3. **Form kit FRM-01:** Field, Text, Number, Toggle, Select*, SectionHeader  
4. **Form kit FRM-01 cont.:** MultiSelect, TagInput, Combo  
5. **Domain FRM-03:** ModelPicker, ModelChain  
6. **Shell WEB-04 + FRM-04:** Sidebar, ConfigApp toolbar/banners/drawer classes; no handler changes  
7. **Gates:** full suite + dual builds + foundation isolation; preferencesCore green  

**Do not start shell before form kit** (D-04) so section content matches chrome when toolbar lands.
