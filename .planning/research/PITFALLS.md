# Pitfalls Research

**Domain:** shadcn/ui restyle of an existing Tailwind 4 dual-platform (web + Tauri) React config UI  
**Researched:** 2026-07-21  
**Confidence:** MEDIUM–HIGH (official shadcn Tailwind v4 / theming / Vite docs + known GitHub issues + this repo’s mapped surface)  
**Project:** GSD Pi Config — web-only presentation restyle; shared `ConfigApp` / section editors / `FormControls`

## Critical Pitfalls

### Pitfall 1: CLI init treated as greenfield (overwrites brownfield CSS)

**What goes wrong:**  
`npx shadcn@latest init` / existing-project docs assume a nearly empty `src/index.css` (`@import "tailwindcss"` only). Running init or `apply` against this repo can clobber or restructure the extensive GSD token system (`--gsd-*`, `@theme inline`, global form rules, `.gsd-btn` / modal / field chrome) and leave desktop + web unstyled or half-themed.

**Why it happens:**  
shadcn’s happy path is “scaffold or replace globals.” Brownfield apps already own CSS architecture. `shadcn apply` deliberately rewrites theme, CSS variables, fonts, and reinstalls components.

**How to avoid:**  
- Treat init as **surgical**: set `components.json` `tailwind.css` to the existing entry; leave `tailwind.config` **blank** for Tailwind v4.  
- Diff every CSS write from the CLI before commit.  
- Prefer manual token merge: add `@import "shadcn/tailwind.css"`, shadcn semantic tokens, and `@custom-variant dark` **alongside** GSD tokens — do not delete GSD vars until web consumers are gone.  
- Never run `apply` mid-milestone as a “quick theme refresh.”

**Warning signs:**  
- `index.css` history shows wholesale replacement.  
- Desktop build looks “default shadcn” or loses grid/chrome.  
- `--gsd-*` references unresolved; utilities like `bg-gsd-bg` stop working.

**Phase to address:**  
**Phase 1 — Foundation / design tokens + CLI setup** (before any page restyle).

---

### Pitfall 2: Dual theme systems (`data-theme` + `gsd-*` vs `.dark` + shadcn tokens)

**What goes wrong:**  
This app toggles theme via `document.documentElement.dataset.theme` (`src/lib/theme.ts`) and CSS variables under `:root` / `[data-theme="light"]`. shadcn’s Vite dark-mode path expects a `.dark` class on `<html>` and semantic tokens (`--background`, `--foreground`, `--primary`, …) with:

```css
@custom-variant dark (&:is(.dark *));
```

If only one system is wired, shadcn components stay stuck in light/dark, GSD chrome and shadcn primitives disagree, or `dark:` utilities never apply.

**Why it happens:**  
Two independent conventions; both use `@theme inline` correctly for *their* vars but not for each other. Copy-pasting `ThemeProvider` from docs creates a **second** theme owner next to `useTheme` / `bootstrapTheme`.

**How to avoid:**  
- **Single theme authority** (keep `src/lib/theme.ts`).  
- When applying effective theme, set **both** `data-theme` and class `dark`/`light` (or redefine `@custom-variant dark` to match `[data-theme=dark]`).  
- Map shadcn tokens to GSD (or the reverse) in one place, e.g. `--background: var(--gsd-bg); --primary: var(--gsd-accent);` so runtime flips stay one write.  
- Do not introduce a second localStorage theme key (`vite-ui-theme` vs `gsd-pi-config.theme`).

**Warning signs:**  
- Theme toggle flips page chrome but not Buttons/Inputs (or opposite).  
- Flash of wrong theme on load.  
- Portaled popovers (Select/Dropdown) use the wrong surface colors.

**Phase to address:**  
**Phase 1 — Tokens / theme bridge** (blocking for all later UI work).

---

### Pitfall 3: Shared presentation leak — restyling `ConfigApp` / `FormControls` breaks desktop

**What goes wrong:**  
`ConfigApp`, `FormControls`, and almost all `sections/*` are **shared** by `WebApp` and `DesktopApp` (only backends differ). A “web restyle” that edits those files in place changes the Tauri app’s look, spacing, focus rings, and control behavior — violating the milestone constraint and risking desktop regressions without intentional desktop QA.

**Why it happens:**  
Fastest path is edit shared JSX classNames. The web-only decision is product scope, not an existing code boundary.

**How to avoid:**  
- Introduce an explicit **presentation boundary**: e.g. `components/ui/*` (shadcn) + web-only shells (`WebShell`, gallery/wizard) first; then either:
  - **Adapter map**: web builds resolve `FormControls` → shadcn-backed implementations, desktop keeps legacy; or  
  - **Thin presentational props**: keep section domain props; swap only leaf controls via a `ControlKit` context provided only from web.  
- Do **not** fork preference logic, dirty tracking, or backends.  
- Gate visual acceptance on `build:web` **and** desktop `build` / smoke.

**Warning signs:**  
- Desktop PR screenshots change “for free.”  
- `uiClasses.ts` / `gsd-btn` deleted while still imported from desktop paths.  
- Conditional `import.meta.env.VITE_PLATFORM` scattered through every section file (unmaintainable fork).

**Phase to address:**  
**Phase 1 — Architecture boundary**; enforced again in every page/section phase.

---

### Pitfall 4: Global element selectors fight shadcn primitives

**What goes wrong:**  
`src/index.css` styles bare `input[type="text|number"]`, `select`, `textarea` (height 40px, borders, focus rings, invalid borders via `[data-invalid] input…`). shadcn `Input` / `Textarea` / `Select` also set borders, radius, height, and focus rings. Result: double borders, wrong height, focus ring wars, invalid states that ignore `aria-invalid`, and Select triggers that look like native selects still.

**Why it happens:**  
Pre-component design system used tag selectors for density consistency. Component libraries assume unstyled or reset natives inside their roots.

**How to avoid:**  
- Scope legacy form CSS under a desktop/legacy wrapper (e.g. `.gsd-legacy-forms input…`) **or** delete tag rules once web leaves no bare inputs.  
- Prefer shadcn `data-slot` / `aria-invalid` styling over `[data-invalid] input` descendants.  
- Preserve **behavior** of `data-field-path` and palette focus flash separately from tag styling.  
- Never rely on `!` utility spam to beat global CSS long-term.

**Warning signs:**  
- Inputs show two nested borders or 40px + shadcn padding overflow.  
- Native caret/chevron CSS still applies to Radix Select button.  
- Invalid state only works on old Field wrappers.

**Phase to address:**  
**Phase 1 (CSS scoping)** + **Phase 2 (FormControls / Field migration)**.

---

### Pitfall 5: Big-bang `FormControls` rewrite loses domain behavior

**What goes wrong:**  
`FormControls.tsx` (~666 lines) is not “just buttons”: registry-backed `Field` (`path` → `fields.ts` validators/hints), `data-field-path` for palette jump-focus, `Toggle` switch semantics, custom `MultiSelectField` / `ComboField` / `ModelPicker` / `ModelChain` / `TagInput`. Swapping wholesale to shadcn `Field` + `Select` + `Combobox` without parity checks silently breaks validation display, dirty tracking, keyboard flows, and section layouts across 20+ editors.

**Why it happens:**  
shadcn Field composition looks like a drop-in; teams replace the file and “fix the gallery.” Section files only import the shared controls — one regression multiplies.

**How to avoid:**  
- Migrate **leaf-by-leaf** behind the same exported API (`Field`, `Toggle`, `SelectField`, …).  
- Keep `path` / `value` / validator wiring unchanged; only change markup/classes.  
- Add pure tests for validators already; add minimal interaction tests for MultiSelect/TagInput before swap (repo currently has **no** `*.test.tsx` / jsdom).  
- Snapshot a checklist of control types and one section per type.

**Warning signs:**  
- Palette search focuses nothing (`data-field-path` missing).  
- Inline errors never show (validator not called).  
- Model pickers lose multi-value / chain order.

**Phase to address:**  
**Phase 2 — Shared form kit restyle** (before bulk section pass).

---

### Pitfall 6: Overlay / portal stacking and focus traps in modals

**What goes wrong:**  
App already uses fixed overlays at `z-50` (Palette, Share/Import modals), drawer `z-40`, backdrop `z-30`, header `z-50`. Radix/Base UI Select, Combobox, Dropdown, and Dialog portal to `document.body` with their own z-index. Known failure modes (shadcn issues #1748, #4516, #10460): Combobox/Command **inside Dialog** cannot type; list renders under overlay; focus trap steals keys; nested modal closes parent.

**Why it happens:**  
Portals escape stacking contexts; Dialog `modal` focus scope blocks pointer/keyboard to portaled popovers unless `modal={true}` on Popover or container is nested correctly.

**How to avoid:**  
- Inventory every nested pattern: SubmitPreset, LoadPreset, Share, Import, Palette, mobile sidebar.  
- For Select/Combobox inside Dialog/Sheet: use documented modal popover pattern / `modal` prop; verify keyboard typeahead.  
- Align z-index scale once (shell &lt; dialog &lt; popover &lt; toast).  
- Manual test matrix per modal before calling a page “done.”

**Warning signs:**  
- Dropdown options invisible or unclickable.  
- Escape closes wrong layer.  
- Focus lands on background under dimmed overlay.

**Phase to address:**  
**Phase 3 — Shell/modals/palette**; re-verify when sections add Selects inside dialogs.

---

### Pitfall 7: Accidental Base UI vs Radix mix (2026 default shift)

**What goes wrong:**  
As of July 2026, `npx shadcn init` defaults to **Base UI**, not Radix. Non-interactive scripts without `-b radix` pull Base UI primitives. Mixing Base UI Combobox with Radix Dialog (or vice versa) across adds produces inconsistent APIs (`asChild` vs `render`), portal behavior, and harder later migrations.

**Why it happens:**  
Docs/changelog changed the default; brownfield tutorials still assume Radix. Multiple `npx shadcn add` sessions over weeks pick different bases if `components.json` is incomplete.

**How to avoid:**  
- Pin base explicitly in init (`-b radix` or Base UI — **pick one for the milestone**).  
- Commit `components.json` early; never re-init casually.  
- Do not “try Base UI for one component” mid-restyle.  
- Opinion for this repo: **pin one base** (Radix is fine if team knowledge matches; Base UI is fine if greenfield-on-web — but not both).

**Warning signs:**  
- `package.json` contains both `@radix-ui/*` sprawl and `@base-ui/react` without a written decision.  
- Component files disagree on `asChild` vs `render`.

**Phase to address:**  
**Phase 1 — Init / components.json lock.**

---

### Pitfall 8: Missing path aliases + Vite resolve (CLI generates broken imports)

**What goes wrong:**  
shadcn components import `@/components/ui/...` and `@/lib/utils`. This repo’s `tsconfig.json` has **no** `paths` / `baseUrl`, and `vite.config.ts` has **no** `resolve.alias`. CLI init may fail preflight or generate code that TypeScript/Vite cannot resolve.

**Why it happens:**  
Project historically uses relative imports only.

**How to avoid:**  
- Add `@/* → ./src/*` to tsconfig **and** matching Vite alias before `shadcn add`.  
- Keep relative imports in existing files if desired; new `ui/*` can use `@/`.  
- Verify with one `button` add + `tsc` before mass adds.

**Warning signs:**  
- `Cannot find module '@/lib/utils'`.  
- CLI “Validating import alias” failures.

**Phase to address:**  
**Phase 1 — Tooling.**

---

## Moderate Pitfalls

### Pitfall 9: Density collapse / spacing blowout in form-heavy sections

**What goes wrong:**  
shadcn default Field/Input spacing (comfortable marketing-dashboard density) applied to AgentSettings, ApiKeys, Experimental, etc. turns a scannable settings list into endless scroll; horizontal label|control rows (`sm:flex-row`) get replaced by stacked fields and waste vertical space.

**Why it happens:**  
Clean shadcn defaults ≠ dense admin/config UI. Copy-paste demos without a density token.

**How to avoid:**  
- Define a **compact** field recipe early (smaller text, tighter `py`, fixed control column width mirroring `.gsd-field-control`).  
- Prefer composition (`Field orientation="horizontal"`) over demo vertical stacks for settings rows.  
- Visual-compare one dense section (e.g. General + AgentSettings) before rolling all sections.

**Warning signs:**  
- Section files grow pure vertical whitespace; users need scroll for previously above-the-fold toggles.

**Phase to address:**  
**Phase 2 — Form kit density tokens**; validate in section phases.

---

### Pitfall 10: `cn()` / `tailwind-merge` silently drops classes

**What goes wrong:**  
Default `cn = twMerge(clsx(...))` removes conflicting utilities (e.g. border-color vs `border-b-input` — issue #10701). Mixing `gsd-*` component classes with utility strings, or stacking `bg-gsd-surface` with `bg-background`, yields order-dependent styles that look “random.”

**Why it happens:**  
twMerge is semantic conflict resolution, not string concat. Custom class names are opaque; theme-specific utilities may still conflict with each other.

**How to avoid:**  
- Don’t pipe pure legacy tokens through aggressive merges unnecessarily.  
- Prefer token-level theming over per-call class fighting.  
- When debugging, log `cn()` output vs source classes.  
- Avoid `!important` utilities as the primary fix.

**Warning signs:**  
- Class present in JSX absent in DOM.  
- Variant props appear no-ops.

**Phase to address:**  
**Phase 1 — utils/cn policy**; watch during all component adds.

---

### Pitfall 11: Irreversible `components.json` choices

**What goes wrong:**  
`style`, `tailwind.baseColor`, and `tailwind.cssVariables` are documented as **not changeable after init** without delete/reinstall of components. Wrong base color or non-CSS-variable mode forces mass re-add.

**Why it happens:**  
Init prompts are clicked through quickly; “we’ll change theme later” is false for structural options.

**How to avoid:**  
- Choose **cssVariables: true**, **neutral** (matches “clean shadcn default”), style family consistent with docs (`new-york` / current nova naming — follow CLI of the installed shadcn version).  
- Commit `components.json` in the foundation PR and treat edits as RFC-level.

**Warning signs:**  
- Team debates re-running init to “switch to zinc.”

**Phase to address:**  
**Phase 1 only.**

---

### Pitfall 12: Restyle becomes product rewrite (RHF / new Form architecture)

**What goes wrong:**  
Adopting shadcn Form + react-hook-form + zod “because the docs do” rewrites controlled `prefs` / `onChange` flows, dirty snapshots, and multi-document save orchestration in `ConfigApp` — far beyond visual restyle, with near-zero existing UI tests.

**Why it happens:**  
Official form guides push RHF/TanStack Form. Engineers conflate design system with form state library.

**How to avoid:**  
- **Anti-feature for this milestone:** no RHF/zod form rewrite.  
- Use shadcn inputs/labels/buttons as controlled leaves under existing state.  
- Optional later milestone: form library after shell extraction.

**Warning signs:**  
- New deps `react-hook-form`, `zod`, `@hookform/resolvers` in a “CSS restyle” PR.  
- `ConfigApp` save paths rewritten “to fit Form.”

**Phase to address:**  
All phases — **scope gate**; especially Phase 2.

---

### Pitfall 13: Palette / field-focus contract broken

**What goes wrong:**  
`ConfigApp` focuses fields via `data-field-path` and temporary `gsd-field-focus` class. New Field wrappers drop the attribute or change DOM depth so `querySelector` fails; users “jump to setting” lands nowhere.

**Why it happens:**  
Attribute is non-visual; easy to omit when copying shadcn Field demos.

**How to avoid:**  
- Preserve `data-field-path={path}` on a stable wrapper.  
- Keep or reimplement focus flash animation under the design system.  
- Manual test: open palette → jump to a nested path (e.g. remote channel id).

**Warning signs:**  
- Palette selection only scrolls the section, not the field.

**Phase to address:**  
**Phase 2 (Field)** + **Phase 3 (Palette)**.

---

## Minor Pitfalls

### Pitfall 14: Icon and font package churn

**What goes wrong:**  
shadcn pulls `lucide-react` and may alter font imports; project uses Geist. Duplicate icon systems or font FOIT/FOUT.

**Prevention:**  
Allow lucide for shadcn primitives; don’t re-icon the whole app. Keep Geist unless preset apply forces a font change — reject font rewrites in `apply`.

**Phase:** Phase 1 / chrome.

### Pitfall 15: Animation / reduced-motion regressions

**What goes wrong:**  
Sheet/Dialog animations stutter (issue #6440 on Tailwind v4 upgrades) or ignore `prefers-reduced-motion` rules already in `index.css`.

**Prevention:**  
Respect existing reduced-motion block; don’t strip it when merging CSS.

**Phase:** Phase 3 modals.

### Pitfall 16: `forwardRef` / React 19 primitive mismatch

**What goes wrong:**  
Copying old v3 component snippets that use `forwardRef` while React 19 + current shadcn primitives use `data-slot` and ref-as-prop leads to type errors and inconsistent refs on inputs.

**Prevention:**  
Only add components via current CLI against React 19; don’t paste v3.shadcn.com sources.

**Phase:** Phase 1–2.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Edit shared `FormControls` classNames for web only | Fast visual win | Desktop visual/behavior drift | Never for this milestone |
| Keep global `input {}` rules forever | No CSS migration | Permanent fight with every shadcn control | Only until Phase 2 complete, scoped |
| Platform ternaries in every section | No adapter layer | Unreadable dual UI | Never — use control kit / context |
| Introduce RHF “while we’re here” | Familiar form docs | Rewrite risk, test gap | Never this milestone |
| Dual token names without mapping | Ship components quicker | Theme bugs on every toggle | Only hours, not days — map in Phase 1 |
| Skip component tests | Faster PRs | Silent FormControls regressions | Only if manual matrix is enforced; prefer minimal tests for MultiSelect/TagInput |
| `!bg-*` override spam | Fixes one screen | Unmaintainable specificity war | Never as pattern |
| Run `shadcn apply` to “fix colors” | Instant retheme | Mass CSS/component overwrite | Never mid-feature branch |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn CLI + Tailwind 4 Vite | Expect `tailwind.config.js`; invent fake config for preflight | Leave config blank; CSS-first `@import "tailwindcss"`; point `tailwind.css` at real file |
| shadcn dark mode | Drop-in docs `ThemeProvider` | Bridge to existing `theme.ts` / single storage key |
| Radix Dialog + Select/Combobox | Nest defaults, assume portals just work | Modal popover pattern; z-index scale; test typeahead |
| Tauri webview + same CSS entry | Assume web-only CSS cannot affect desktop | Same `index.css` ships both — scope or dual entry if needed |
| `fields.ts` registry | Rebuild field metadata into shadcn Form schema | Keep registry; only change rendering |
| Vercel web routes | Restyle OAuth/gallery without flow test | Visual change only; keep router paths and sessionStorage OAuth keys |
| Icon package | Replace all icons ad hoc | Lucide for new primitives; leave BrandMark alone |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Heavy Radix trees on every field in large sections | Typing lag in AgentSettings / Hooks | Don’t mount Select portals until open; avoid animating every row | Already large sections (~500+ lines); worse on low-end web |
| Re-stringify dirty checks unchanged | Unrelated, but UI thrash can re-render all fields | Keep pure controlled leaves; memo section props if needed | Large prefs trees (existing concern) |
| Importing entire `lucide-react` barrel | Bundle bloat on web | Named icon imports only | Web gallery LCP |
| CSS duplication (full GSD + full shadcn unused) | Large CSS | Delete dead `.gsd-*` after migration; don’t keep both control skins forever | Post-milestone cleanup |

Not a scale-out product problem — traps are **editor density and bundle**, not 1M users.

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Restyle ApiKeys “reveal” without re-checking clear-on-blur / copy | Secrets linger on screen or in DOM | Preserve reveal UX contracts; no logging of values in story/debug |
| Share/Submit modal redesign skips `scanForLeakedSecrets` UI warnings | Users submit secrets to gallery PRs | Keep warning banners and scan gates in modal flow |
| OAuth callback page restyle breaks state/error rendering | Failed auth loops or token mishandling | Visual-only; keep query parsing |
| Pasting example forms that store keys in component state dumps | Accidental demo code in production paths | Don’t add sample credentials in fixtures |
| `localStorage` theme key collision with key stores | Low — namespace confusion | Keep `gsd-pi-config.*` prefixes |

Security is mostly **don’t regress existing controls** while swapping chrome.

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Airy shadcn spacing on settings | Exhausting scroll, loses “power user” scanability | Compact field density tokens |
| Native multi-select replaced by pretty but slow Combobox | Harder bulk edit of tags/models | Keep TagInput/MultiSelect interaction model; skin only |
| Modal focus trap bugs | Can’t complete share/import/submit | Overlay test matrix |
| Inconsistent web vs remembered desktop muscle memory | Desktop users confused later | Accept web-only now; document; don’t half-restyle desktop |
| Losing 40px hit targets / focus rings | A11y regression | Preserve min hit area and visible focus-visible |
| Tooltip-on-hover only for field hints | Keyboard users lose hints | Keep focus-within hint behavior from current Field |

---

## "Looks Done But Isn't" Checklist

- [ ] **Theme bridge:** Toggle system/dark/light — GSD chrome **and** shadcn primitives both flip; no second ThemeProvider.
- [ ] **Desktop untouched:** Desktop build visual smoke matches pre-milestone (or intentional shared kit only).
- [ ] **CLI config:** `components.json` committed; base pinned; `@/` resolves in Vite + tsc.
- [ ] **Global CSS:** Bare `input/select/textarea` rules no longer override shadcn on web (scoped or removed).
- [ ] **Form API parity:** `Field` still supports `path` / validators / `data-field-path`; palette jump works.
- [ ] **Control matrix:** Toggle, Select, MultiSelect, Combo, ModelPicker, ModelChain, TagInput, Number, Text each verified in one section.
- [ ] **Modals:** Share, Import, Load preset, Submit preset, Palette — open nested select/combobox if any; focus + Escape correct.
- [ ] **Routes:** Gallery, Wizard, OAuth callback, Web shell editor — all on shadcn chrome, flows unchanged.
- [ ] **Dirty/save/download:** Web save/export/import still works after shell restyle (no `ConfigApp` logic rewrite).
- [ ] **Secrets UI:** ApiKeys reveal/copy/redact warnings intact.
- [ ] **a11y:** Switches expose `role="switch"` / checked; labels clickable via `htmlFor`.
- [ ] **No drive-by deps:** No RHF/zod unless explicitly approved later.
- [ ] **Z-index:** Popovers above dialogs above shell; nothing click-blocked.
- [ ] **Reduced motion:** Still honored after CSS merge.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|--------|---------------|----------------|
| CSS clobbered by init/apply | HIGH | `git checkout` CSS; re-merge tokens manually; never re-apply blind |
| Desktop visually regressed | MEDIUM–HIGH | Revert shared FormControls; introduce adapter layer; re-apply web-only |
| Theme dual-system mess | MEDIUM | Delete extra ThemeProvider; dual-write class + data-theme; map tokens once |
| FormControls behavior break | HIGH | Restore exports from git; re-skin behind same API leaf-by-leaf |
| Portal/focus bugs in modal | LOW–MEDIUM | Add modal prop / container; adjust z-index scale; add manual test case |
| Wrong Base UI/Radix mix | HIGH | Stop adds; standardize on one base; re-add components cleanly |
| Alias/tooling break | LOW | Add paths + Vite alias; re-run tsc |
| RHF partial adoption | HIGH | Revert form PRs; return to controlled prefs |

---

## Pitfall-to-Phase Mapping

Suggested phase framing for roadmap (names indicative):

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CLI overwrite / components.json / aliases / base pin | **P1 Foundation** | Init diff review; `tsc` + `build:web`; button Story/page |
| Theme bridge + token mapping | **P1 Foundation** | Theme toggle matrix; portaled menu colors |
| CSS global selector scoping | **P1–P2** | Input/Select computed styles vs design |
| Presentation boundary (web-only) | **P1 Architecture** | Desktop smoke screenshots unchanged |
| FormControls API-preserving restyle + density | **P2 Form kit** | Control matrix + palette focus |
| Section editors on new kit | **P4 Sections** (batched) | Per-section visual + validator spot checks |
| Shell, gallery, wizard, OAuth chrome | **P3 Web chrome pages** | Route crawl |
| Modals / palette / z-index / focus | **P3** (+ recheck in P4) | Nested overlay matrix |
| ApiKeys / share security UX | **P4** (keys) + **P3** (share modal) | Reveal + redact checklist |
| No RHF / no product rewrite | **All (gate)** | PR checklist / plan-check |
| Dead CSS cleanup | **P5 Polish** | Purge unused `.gsd-*` only after web fully migrated |

**Phase ordering rationale:**  
Tooling + tokens + boundary **before** components; form kit **before** 20 sections; overlays tested with shell; polish last. Inverting this is how teams repaint sections twice.

**Research flags:**  
- **P1 theme bridge:** needs a short decision spike (class vs `data-theme` custom variant) — do not leave ambiguous.  
- **P1 presentation boundary:** architecture choice (alias/adapter vs context kit) needs explicit decision before section work.  
- **P2 MultiSelect/ModelPicker:** deeper UX research if shadcn primitives cannot match density — may keep custom heads with shadcn skins.  
- **P3 portal matrix:** re-check against chosen base (Radix vs Base UI) docs at implementation time.

---

## Sources

**Official / primary (MEDIUM–HIGH):**  
- shadcn Tailwind v4 docs — `@theme inline`, upgrade steps, React 19 notes: [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) (source: `apps/v4/content/docs/(root)/tailwind-v4.mdx`)  
- shadcn Theming — semantic tokens, `.dark`, `@custom-variant dark`, irreversible cssVariables: [ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)  
- shadcn Vite install — existing project steps, alias requirements: [ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite)  
- shadcn `components.json` — blank Tailwind config for v4, locked style/baseColor/cssVariables: [ui.shadcn.com/docs/components-json](https://ui.shadcn.com/docs/components-json)  
- shadcn dark mode Vite — classList `dark`/`light` provider pattern  
- shadcn Field composition docs — label/description/error anatomy  
- shadcn changelog 2026-07 — Base UI default; pin `-b radix` if needed  
- shadcn changelog 2026-04 — `apply` overwrites theme/components  
- Tailwind CSS dark mode — `@custom-variant dark` selector override: [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode)  
- tailwind-merge configuration docs — conflict groups / custom class behavior  

**Community issue evidence (MEDIUM):**  
- [shadcn-ui/ui#7952](https://github.com/shadcn-ui/ui/issues/7952) — CLI Tailwind v4 detection / config path failures on existing apps  
- [shadcn-ui/ui#10701](https://github.com/shadcn-ui/ui/issues/10701) — `cn`/`twMerge` silent class removal  
- [shadcn-ui/ui#4516](https://github.com/shadcn-ui/ui/issues/4516), [#1748](https://github.com/shadcn-ui/ui/issues/1748), [#10460](https://github.com/shadcn-ui/ui/issues/10460) — Combobox/Command inside Dialog/Sheet focus & stacking  
- [shadcn-ui/ui#6440](https://github.com/shadcn-ui/ui/issues/6440) — Sheet animation issues after Tailwind v4  

**Repo-specific (HIGH for local facts):**  
- `.planning/PROJECT.md` — web-only restyle, shared desktop code, behavior stability  
- `.planning/codebase/CONCERNS.md` — monolithic ConfigApp, large sections, weak UI tests  
- `.planning/codebase/TESTING.md` — Vitest node-only; no component tests  
- `src/index.css`, `src/lib/theme.ts`, `src/lib/uiClasses.ts`, `src/components/FormControls.tsx`, `src/ConfigApp.tsx`, `src/WebApp.tsx` / `DesktopApp.tsx`

**Confidence notes:**  
- Official docs content verified via raw GitHub MDX (2026 docs tree).  
- Web search APIs unavailable in this environment; issue samples from GitHub Search API.  
- No claim that Base UI is “better” for this app — only that **default mix is a pitfall**.

---
*Pitfalls research for: shadcn/ui restyle of GSD Pi Config (Tailwind 4, dual-platform React, dense config forms)*  
*Researched: 2026-07-21*
