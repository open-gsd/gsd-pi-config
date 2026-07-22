# Phase 4: Form Kit Adapters + Editor Chrome - Context

**Gathered:** 2026-07-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle **preference form kit** (`FormControls` API) and **loaded cloud editor shell** (sidebar, toolbar, status, banners) onto **Mist Sky + shadcn** on **web**, without changing domain behavior, dirty tracking, save/import/download, validators, or `data-field-path` contracts.

**In scope (FRM-01–04, WEB-04):**
- FormControls: Field, Toggle/Switch, Select, MultiSelect, Combo, text/number, tags, SectionHeader
- Domain controls: ModelPicker, ModelChain (and multi-model UX) — presentation compose only
- Section editors inherit looks via FormControls (minimal section file churn)
- ConfigApp loaded editor chrome: Sidebar, toolbar actions, status, banners; mobile drawer panel restyle
- Expand FND-03 for Switch/Select/Checkbox/Popover peers as needed (official CLI only)

**Out of scope:**
- Product/IA redesign; new fields/features
- Desktop visual redesign as a success criterion (desktop form chrome stays legacy)
- Changing dirty/save/import/download/scope semantics
- Weakening redaction, keyring, or validators
- Phase 5 hardening-only work (full residual purge may finish here but ISO gates also in Phase 5)

</domain>

<decisions>
## Implementation Decisions

### Carried forward (do not re-open)
- **D-00a:** Mist Sky palette + linear grammar + `--radius: 0`
- **D-00b:** Button language: primary filled / outline secondary / soft danger outline
- **D-00c:** Dual-write theme Auto/Dark/Light
- **D-00d:** Dialog/Command from Phase 3 for overlay patterns if forms open nested UI
- **D-00e:** No logo cyan/purple primary; web-first presentation this milestone

### FormControls adapter strategy
- **D-01:** Keep **same `FormControls.tsx` exports/API**; implement web presentation **inside** (not a full `.web.tsx` fork unless isolation fails)
- **D-02:** **Desktop keeps legacy gsd form chrome** (ISO) — platform CSS and/or platform branch so desktop does not adopt Mist Sky form look as a requirement
- **D-03:** **Section editors** change **presentation-only via FormControls** — avoid domain rewrites in `*Section.tsx`
- **D-04:** Implementation order: **Form kit first → editor shell** (FRM-01–03 then WEB-04)

### Control mapping
- **D-05:** **Toggle** → shadcn **Switch** presentation; keep `checked`/`onChange` API + switch a11y
- **D-06:** **Select / LabeledSelect** → shadcn **Select** (preserve option values)
- **D-07:** **MultiSelect / Combo / TagInput** → compose **Command/Popover + Checkbox/Input**; keep chip remove UX; no native multi listbox
- **D-08:** **Text/Number + Field** → shadcn **Input** + linear labeled Field layout; keep `path` / `data-field-path` / `data-invalid` / description

### Domain pickers
- **D-09:** **ModelPicker** — keep product UX; restyle with Combobox/Command-style search list
- **D-10:** **ModelChain** — keep reorder/add/remove semantics; linear rows visual only
- **D-11:** Domain pickers **stay in FormControls.tsx** (same exports)
- **D-12:** Empty/loading for model lists = **quiet inline** messages

### Editor shell chrome (WEB-04)
- **D-13:** **Sidebar** = linear list + **left-edge active**; group labels uppercase muted
- **D-14:** **Toolbar** = Phase 2 **Button language** + quiet status text (Save when dirty primary; secondary outline; muted saving/saved/error)
- **D-15:** **Banners** = quiet Mist Sky **Alert-style** (soft danger/info); keep copy
- **D-16:** **Mobile drawer** — keep `useSidebarDrawerLayout` behavior; restyle panel only

### Claude's Discretion (areas not deeply discussed)
- Exact invalid-field ring (soft danger border) styling beyond `data-invalid` contract
- When to fully drop remaining web `.gsd-btn` / bridge CSS after FormControls + shell no longer need it
- Whether Switch/Select land via `shadcn add` vs hand-compose from existing Dialog/Command patterns
- Density of SectionHeader typography within Phase 2 type scale

</decisions>

<canonical_refs>
## Canonical References

### Product
- `.planning/design/PALETTE.md`
- `.planning/ROADMAP.md` — Phase 4 goal, FRM-01–04, WEB-04
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/phases/02-web-chrome-standalone-pages/02-CONTEXT.md` / `02-UI-SPEC.md`
- `.planning/phases/03-modals-palette-overlays/03-CONTEXT.md` / `03-UI-SPEC.md`

### Code
- `src/components/FormControls.tsx` — stable API surface
- `src/components/sections/*Section.tsx` — consumers
- `src/ConfigApp.tsx` — shell, dirty/save, banners, drawer
- `src/components/Sidebar.tsx` — section nav data + chrome
- `src/hooks/useDirty.ts` — FRM-04 (do not break)
- `src/lib/fields.ts` — field registry / data-field-path
- `src/lib/validators.ts`
- `src/components/ui/*` — Button, Input, Textarea, Dialog, Command
- `src/index.web.css` / `src/index.desktop.css`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 2/3 primitives + Mist Sky tokens
- Field wrapper already carries path, invalid, label, description
- MultiSelect/Combo already custom dropdown patterns (restyle/compose)
- Sidebar `SECTION_GROUPS` is data; chrome is separate

### Established Patterns
- Controlled section props `{ prefs, onChange }`
- Dirty via useDirty + fields registry
- Web filters sections via `isSectionVisibleOnWeb`

### Integration Points
- Palette field-jump depends on `data-field-path` still present after Field restyle
- Desktop FormControls shared — isolation must not force Mist Sky on desktop

</code_context>

<specifics>
## Specific Ideas

- Form kit before shell so editor content looks consistent when chrome lands
- Linear left-edge active for sidebar and multi-select rows
- Quiet banners and model empty states (Phase 2/3 quiet language)

</specifics>

<deferred>
## Deferred Ideas

- Validation/invalid deep polish beyond Field contract (partially discretion)
- Full desktop form restyle
- Product redesign of ModelChain interaction
- Mobile nav IA redesign
- Phase 5 residual purge / a11y audit as separate hardening phase

</deferred>

<vision>
## Captured Vision

The cloud editor finally matches the Mist Sky instrument language end-to-end: forms feel linear and calm (Switch, Select, composed multi-pickers), domain pickers keep their power without looking like a different app, and the sidebar/toolbar/banners frame work without shouting. Saving and dirty state behave exactly as before—only the paint changed.

</vision>
