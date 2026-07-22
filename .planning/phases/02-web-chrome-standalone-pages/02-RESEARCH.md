# Phase 2: Web Chrome & Standalone Pages - Research

**Researched:** 2026-07-21  
**Domain:** Web-only shadcn/ui restyle of shared chrome + standalone routes (Mist Sky tokens, Button language, Gallery/Wizard/OAuth/Start)  
**Confidence:** HIGH

## Summary

Phase 2 turns Phase 1’s walking skeleton into product UI on the **web surface only**. Locked cutover is **Tokens → Shell → Pages** (D-21): first replace neutral OKLCH in `src/index.web.css` with **Mist Sky** hex (+ `--radius: 0` + bridge remap off cyan), then restyle `WebShell` / `ThemeToggle` / `Button`, then Gallery, Wizard, OAuth callback, and `WebStartPanel`. Domain paths (catalog fetch, wizard presets, OAuth submit, draft storage) stay behavior-stable; this phase is presentation wiring.

Foundation already provides: locked `components.json` (`base-nova`, neutral, CSS vars, `css → src/index.web.css`), `@/*` + `cn`, dual-write theme (`data-theme` + `.dark`), FOUC-safe `@platform-css`, and Base UI `Button` under `src/components/ui/`. Phase 2 **adds** only `Input` + `Textarea` (optional `Label`) via pinned CLI, expands the FND-03 allowlist, and mounts Button language on restyled routes — **not** a registry dump, **not** FormControls, **not** loaded editor chrome (WEB-04 → Phase 4).

**Primary recommendation:** Implement D-21 waves with Mist Sky token cutover first (so bridge/`text-gsd-accent` stops flashing cyan), pin `npx shadcn@4.13.1 add input textarea`, force Button to `rounded-none` + ≥40px hit targets, restyle shell/pages with **only** shadcn Button (use `buttonVariants` on `Link`/`a`), wrap OAuth in `WebShell`, and update isolation tests in the same waves so FND-03 / token contracts stay green.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Carried forward (do not re-open)
- **D-00a:** Palette **Mist Sky** locked — soft sky primary `#a8c5e8` (dark) / `#5a7fa8` (light); surfaces `#0b0c0e`/`#111316`; see `.planning/design/PALETTE.md`
- **D-00b:** Clean / linear grammar — 1px rules, hierarchy from type/space/borders; no logo cyan/purple
- **D-00c:** Web-only presentation; desktop keeps legacy `gsd-*` (ISO)
- **D-00d:** Theme semantics unchanged — Auto/Dark/Light, dual-write `data-theme` + `.dark` (Phase 1)

#### Shell nav + theme toggle
- **D-01:** Main nav (Editor / Gallery / New) uses **underline tabs** — text links + 1px bottom rule on active; not filled segment pills
- **D-02:** Theme control is an **underline / text trio** (Auto · Dark · Light) — minimal linear; active = text emphasis + bottom rule or small primary chip; not icon-only cycle
- **D-03:** Keep existing **PNG BrandMark** (size/spacing may adjust); no flat-square replacement
- **D-04:** Header density stays **~56px** (current nav height); do not compress to 44px

#### Button language
- **D-05:** Primary = **Mist Sky filled** shadcn `Button` default (`--primary` / `--primary-foreground`)
- **D-06:** Secondary = **outline** (1px border, transparent fill) for Load preset, Cancel, Preview, etc.
- **D-07:** Destructive = **soft danger outline** (Mist Sky soft rose border/text) — not solid red fills, not mere underline
- **D-08:** On any surface Phase 2 restyles, **only shadcn Button** — no mixed `gsd-btn` + Button (WEB-06)

#### Gallery layout + states
- **D-09:** Presets display as **linear list rows** (title, description, tags, actions) with 1px dividers — not card grid
- **D-10:** Keep **single full-width search** only; no multi-filter/tag-chip chrome this phase
- **D-11:** Loading / empty / error = **inline quiet states** (text + optional spinner; soft danger for error; empty short copy + link to New/wizard)
- **D-12:** Keep **Use preset** (primary) + **Preview** (outline secondary) as row actions

#### Wizard choices + steps
- **D-13:** Mode / profile selection = **linear choice rows** with left-edge active — replace `gsd-choice-btn` tiles
- **D-14:** **Single-page form** (mode + profile + title/description + create) — no multi-step wizard chrome
- **D-15:** Meta fields = **shadcn Input + Textarea** with labels; optional stays optional
- **D-16:** Create CTA at **bottom**; primary full-width on mobile

#### Start panel + OAuth
- **D-17:** WebStartPanel keeps **3-step list + 3 CTAs** (Import / Load preset / New) — restyle only
- **D-18:** Keep kicker (e.g. “Git · Ship · Done”) as **Mist Sky accent uppercase kicker**
- **D-19:** OAuth callback = **minimal status inside WebShell** (loading / success+PR link / error+retry)
- **D-20:** OAuth success = **quiet** success text + link — not confetti or loud banners

#### Migration cutover
- **D-21:** Implementation order: **Tokens → Shell → Pages** (Mist Sky CSS first, then WebShell/ThemeToggle/Button, then Gallery/Wizard/OAuth/Start)
- **D-22:** Drop `gsd-btn` / legacy chrome **on Phase 2 restyled routes**; keep file-level web bridge CSS for **unrestyled editor/forms until Phase 4**
- **D-23:** **`--radius: 0`** strict linear for shadcn on web
- **D-24:** Loaded editor shell (sidebar/toolbar) **out of scope** — Phase 4 only (WEB-04). Empty start panel is in scope.

### Claude's Discretion
- Exact ToggleGroup vs pure button+CSS for underline tabs/theme trio (as long as D-01/D-02 visual intent holds)
- Skeleton vs plain “Loading…” text for gallery load
- Preview modal chrome restyle depth (if preview stays modal, keep handlers; visual linear Mist Sky)
- Spacing scale within ~56px header and list row hit targets (≥40px controls)

### Deferred Ideas (OUT OF SCOPE)
- Loaded editor shell restyle (sidebar, toolbar, banners) — **Phase 4 / WEB-04**
- FormControls / section form kit — **Phase 4**
- Full modal/palette/command system — **Phase 3**
- Gallery tag-chip multi-filter — deferred; not Phase 2
- Multi-step wizard chrome — deferred; single page locked
- Desktop visual redesign — out of milestone
- BrandMark replacement with flat square — rejected for now
</user_constraints>

---

## Project Constraints (from CLAUDE.md)

| Directive | Implication for Phase 2 |
|-----------|-------------------------|
| Stay on React + Vite + TypeScript; shadcn with existing Tailwind 4 | No core upgrades; continue `@tailwindcss/vite`; CLI CSS stays `src/index.web.css` |
| Behavior stability (prefs, dirty/save, import/download, gallery/wizard paths) | Restyle only; keep `fetchPresetIndex`, `applyModePreset`, `completeOAuthSubmit`, draft helpers |
| Web restyle must not regress desktop | Touch `index.web.css` + web components only; never import `components/ui/*` into desktop-only paths; dual `build` + `build:web` |
| No drive-by backend refactors / feature expansion | No API, OAuth handler, or ConfigApp state machine changes beyond presentation |
| Security: share/redact/export secret handling | Gallery Preview still uses existing ShareModal + `buildShareablePreset`; do not weaken redaction |
| Prefer named exports, co-located `*.test.ts`, Vitest | Extend isolation + import-only tests; avoid jsdom suite unless needed |
| Follow DESIGN.md but **palette supersedes logo cyan** for web | Mist Sky primary only; no `#22d3ee` / `#a855f7` as accent |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WEB-01 | Shared web chrome (header/nav/workspace strip) restyled with shadcn | Current code map → WebShell; Architecture Pattern: underline nav; Button language |
| WEB-02 | Gallery route fully restyled on shadcn | GalleryPage map + linear list pattern + Input search |
| WEB-03 | Wizard route fully restyled on shadcn | WizardPage map + choice rows + Input/Textarea add steps |
| WEB-05 | OAuth callback restyled on shadcn | OAuth bare page → WebShell wrap (D-19); quiet states |
| WEB-06 | Consistent Button language; no mixed old/new on restyled web surfaces | Button variants + `buttonVariants` on links; drop `uiClasses` btn* on Phase 2 files |
| WEB-07 | Loading / empty / error states use consistent patterns | UI-SPEC copy + Gallery/OAuth state table; quiet text + soft danger |
| THM-04 | Theme toggle uses shadcn-styled controls without changing semantics | ThemeToggle restyle only; keep `useTheme` / dual-write |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mist Sky semantic tokens + radius | Browser / CSS (`index.web.css`) | Isolation tests | Tokens own color/radius; desktop CSS must stay untouched |
| Transitional `gsd-*` / bridge remap | Browser / CSS (web) | Unrestyled ConfigApp chrome | Bridge keeps editor/forms usable until Phase 4; accent must map to Mist Sky not cyan |
| WebShell header / nav / workspace strip | Browser / Client | react-router `NavLink` | Shared chrome for web routes; presentation only |
| ThemeToggle presentation | Browser / Client | `theme.ts` dual-write | THM-04 is visual; storage + applyTheme stay Phase 1 |
| Button / Input / Textarea primitives | Browser / Client (`components/ui`) | shadcn CLI | Owned source; Base UI only; FND-03 allowlist |
| Gallery catalog UI | Browser / Client (`GalleryPage`) | `presetsCatalog` + web draft store | UI only; fetch/use/preview handlers unchanged |
| Wizard form UI | Browser / Client (`WizardPage`) | `presets` + web draft | Single-page form; domain create path unchanged |
| WebStartPanel empty state | Browser / Client | ConfigApp empty web branch | In scope; loaded sidebar/toolbar out |
| OAuth callback status UI | Browser / Client | `completeOAuthSubmit` | Wrap chrome; do not change OAuth exchange |
| Share/Preview modal | Browser / Client | Phase 3 ownership | Handlers stay; light token inheritance only |
| Desktop presentation | Browser / CSS (`index.desktop.css`) | — | ISO-01: no shadcn stack, no Phase 2 restyle |
| Domain prefs / backends / redaction | Shared app / platform | — | Out of scope — presentation wiring only |

---

## Current Code Map (surfaces to restyle)

### Routes (`src/App.web.tsx`)

| Path | Component | Shell today |
|------|-----------|-------------|
| `/` | `WebApp` → `ConfigApp` `variant="web"` | `WebShell active="editor"` when web |
| `/gallery` | `GalleryPage` | `WebShell active="gallery"` |
| `/new` | `WizardPage` | `WebShell active="new"` |
| `/oauth/callback` | `OAuthCallbackPage` | **Bare** full-viewport (no WebShell) — D-19 requires wrap |
| `/edit` | redirect → `/` | — |

### Surface inventory

| Surface | File | Legacy chrome today | Phase 2 target |
|---------|------|---------------------|----------------|
| Shell header/nav | `src/components/WebShell.tsx` | `segmentGroup` + `btnSegment*` filled pills; `btn` external; glass `backdrop-blur-md`; `bg-gsd-*` | Underline nav; opaque bar 56px; `Button`/`buttonVariants` for external; keep PNG `BrandMark` |
| Theme toggle | `src/components/ThemeToggle.tsx` | Segment pills via `btnSegment*` | Text trio Auto/Dark/Light underline; same `useTheme` API |
| Brand | `src/components/BrandMark.tsx` | PNG + text; subtitle 10px | Keep PNG; light token/type align only (D-03) |
| Gallery | `src/pages/GalleryPage.tsx` | `btn`/`btnPrimary`; raw `<input type="search">`; linear list already (good); tags 10px | shadcn Button + Input; quiet states; copy per UI-SPEC; list stays linear |
| Wizard | `src/pages/WizardPage.tsx` | `choiceBtn*`; raw input/textarea; `btn`/`btnPrimary` | Choice rows left-edge active; Input/Textarea + labels; bottom CTAs |
| Start empty | `src/components/WebStartPanel.tsx` | `btn`/`btnPrimary`; kicker `text-gsd-accent` (cyan via bridge) | Mist Sky kicker + Button language; 3 steps + 3 CTAs |
| OAuth | `src/pages/OAuthCallbackPage.tsx` | Bare `min-h-screen`; `text-gsd-*` | `WebShell active="editor"` + quiet status |
| Button primitive | `src/components/ui/button.tsx` | Exists; `rounded-lg`, `h-8` default | Override radius/height for linear 40px language |
| Tokens | `src/index.web.css` | Neutral OKLCH; `--radius: 0.625rem`; `--bridge-accent` cyan; `.gsd-btn*` bridge | Mist Sky hex; radius 0; accent bridge → primary |
| Legacy class map | `src/lib/uiClasses.ts` | Source of `btn`/`btnPrimary`/segments | **Stop importing on Phase 2 surfaces**; file stays for ConfigApp/modals/sections |
| Theme authority | `src/lib/theme.ts` | Dual-write works | Do not change semantics |

### Intentionally NOT restyled this phase (still use `gsd-btn` / uiClasses)

- `src/ConfigApp.tsx` loaded chrome (sidebar, toolbar, scope segments, save) — WEB-04 / Phase 4  
- Section editors, FormControls, library sections  
- Modals: `ShareModal`, `ImportPreferencesModal`, `SubmitPresetModal`, etc. — Phase 3 (gallery Preview may inherit tokens only)

### Domain handlers to preserve (do not rewrite)

| Flow | Entry | Must keep |
|------|-------|-----------|
| Gallery index | `fetchPresetIndex` | loading/error/empty states only change presentation |
| Use preset | `fetchPresetMarkdown` → `loadPreferencesFromText` → `setWebDraft` → navigate `/` | same |
| Preview | `buildShareablePreset` + `ShareModal` open | handlers unchanged |
| Wizard create | `applyModePreset` / `applyProfilePreset` + draft meta | same |
| Start CTAs | `onUpload` / `onLoadPreset` props from ConfigApp | same |
| OAuth | `completeOAuthSubmit(code)` → navigate with `prUrl` | same; quiet UI only |

---

## Standard Stack

### Already installed (do not re-install / upgrade for Phase 2)

| Library | Version | Purpose | Why standard |
|---------|---------|---------|--------------|
| React / React DOM | `^19.2.5` | UI | Existing [VERIFIED: package.json] |
| react-router-dom | `^7.13.1` | Routes, `NavLink`, `Link` | Existing web router [VERIFIED: package.json] |
| Vite + `@tailwindcss/vite` + tailwindcss | `^8` / `^4.2.2` | Web/desktop dual build | FOUC-safe `@platform-css` [VERIFIED: vite.config.ts] |
| shadcn CLI package | `^4.13.1` | `add` primitives | Pinned Phase 1 [VERIFIED: package.json] |
| `@base-ui/react` | `^1.6.0` | Base UI Button/Input primitives | base-nova only — never mix Radix [VERIFIED: package.json + button.tsx] |
| class-variance-authority | `^0.7.1` | Button variants | Existing [VERIFIED: package.json] |
| clsx + tailwind-merge | `^2.1.1` / `^3.6.0` | `cn` | Existing [VERIFIED: package.json] |
| lucide-react | `^1.25.0` | Icons (optional; Phase 2 text-first) | Declared; not required for chrome [VERIFIED: package.json] |
| tw-animate-css | `^1.4.0` | Animation utilities | Web CSS import only [VERIFIED: index.web.css] |
| Vitest | `^4.0.18` | Unit tests (`environment: "node"`) | Existing [VERIFIED: package.json] |

### Core (Phase 2 — CLI-generated source, not new npm deps expected)

| Artifact | How obtained | Purpose | Why standard |
|----------|--------------|---------|--------------|
| `src/components/ui/input.tsx` | `npx shadcn@4.13.1 add input -y` | Gallery search; wizard title | Official base-nova Input wraps `@base-ui/react/input` [VERIFIED: `npx shadcn@4.13.1 view input`] |
| `src/components/ui/textarea.tsx` | `npx shadcn@4.13.1 add textarea -y` | Wizard description | Official base-nova Textarea = native `<textarea>` [VERIFIED: `npx shadcn@4.13.1 view textarea`] |
| `src/components/ui/label.tsx` (optional) | `npx shadcn@4.13.1 add label -y` **or** plain `<label>` | Wizard field labels | Official is plain label wrapper; plain HTML is enough [VERIFIED: view label] |

**No new third-party packages are required** if `@base-ui/react@^1.6.0` already resolves Input subpath (it does in this install). If CLI writes Input but typecheck fails on `@base-ui/react/input`, reinstall peer only — same Phase 1 pattern as Button.

### Supporting (optional component-level tokens)

| Token / helper | Purpose | When |
|----------------|---------|------|
| `--primary-hover` custom CSS var | Exact Mist Sky hover hex (`#c4daf2` dark / `#4a6d94` light) | Prefer over default `hover:bg-primary/80` if visual match required |
| `--accent-soft` / `bg-primary/12` | Choice row + active wash | Wizard active rows; optional nav wash |
| `buttonVariants` export | Style `Link` / `<a>` as buttons without nested `<button>` | Gallery CTAs, Start “New preset”, shell external |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS underline nav | shadcn ToggleGroup | Allowed only if styled as underline (D-01); UI-SPEC resolves to pure NavLink/CSS — **prefer CSS** |
| Plain “Loading presets…” | Skeleton | Deferred v2; UI-SPEC chooses plain text |
| `Button render={<Link/>}` | `buttonVariants` on `Link` | Both work with Base UI `render` + `nativeButton={false}`; **prefer `buttonVariants` on Link/a** for simpler SSR-less React Router usage [ASSUMED pattern preference] |
| Delete all `.gsd-btn` CSS now | Keep bridge CSS | ConfigApp still needs bridge until Phase 4 (D-22) — **keep CSS, drop usage on Phase 2 files only** |
| Radix Input/Button | Base UI | Forbidden — base-nova lock; never mix |

**Installation:**

```bash
# Pin CLI consistent with Phase 1. No --all. Official registry only.
npx shadcn@4.13.1 add input textarea -y
# Optional:
# npx shadcn@4.13.1 add label -y

# Only if Input import fails to resolve (Phase 1 peer gap pattern):
# npm install @base-ui/react@^1.6.0
```

**After add — always:**
1. Diff generated files; ensure imports use `@/lib/utils` (CLI rewrites from registry paths).  
2. Expand FND-03 allowlist **before** commit if tests run in CI.  
3. Assert no `@radix-ui/*` imports.  
4. Override default `rounded-lg` → `rounded-none` (or `rounded-[var(--radius)]` with `--radius: 0`) on Button/Input/Textarea as needed.

---

## Package Legitimacy Audit

Phase 2 primarily **adds owned source files** via the already-approved shadcn CLI. No new package names are recommended beyond the Phase 1 set.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@base-ui/react` | npm | published 2026-06-18 | ~7.7M/wk | github.com/mui/base-ui | OK | Approved (already installed) |
| `class-variance-authority` | npm | mature | ~58M/wk | joe-bell/cva | OK | Approved (already installed) |
| `lucide-react` | npm | latest version “too-new” signal | ~95M/wk | lucide-icons/lucide | SUS (false-positive age) | Already installed Phase 1; no reinstall needed |
| `shadcn` | npm | latest version “too-new” signal | ~6.6M/wk | shadcn-ui/ui | SUS (false-positive age) | Already installed; use pinned `npx shadcn@4.13.1` only |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** `shadcn`, `lucide-react` — false-positive “too-new” on latest publish; already human-approved in Phase 1. **Do not introduce new package names** without a legitimacy gate.

**Postinstall scripts:** none on `@base-ui/react` / cva [VERIFIED: package-legitimacy seam].

---

## Architecture Patterns

### System Architecture Diagram

```text
                    ┌──────────────────────────────────────┐
                    │ Bootstrap (main.tsx)                 │
                    │ migrate → bootstrapTheme → @platform-css │
                    │ dual-write: data-theme + .dark       │
                    └──────────────────┬───────────────────┘
                                       │ web only
                                       ▼
                    ┌──────────────────────────────────────┐
                    │ index.web.css                        │
                    │ Mist Sky tokens + radius 0           │
                    │ bridge: --color-gsd-* → semantic     │
                    │ (accent → primary; no cyan)          │
                    │ keep .gsd-btn* for unrestyled editor │
                    └──────────────────┬───────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          ▼                            ▼                            ▼
   WebShell (chrome)            Standalone pages              ConfigApp web
   - underline nav              Gallery / Wizard / OAuth      - WebStartPanel (IN)
   - ThemeToggle trio           shadcn Button/Input           - loaded sidebar (OUT P4)
   - BrandMark PNG              quiet load/empty/error        - still gsd-btn toolbar
   - workspace strip 36px       domain handlers unchanged
          │                            │
          └────────────┬───────────────┘
                       ▼
              components/ui/* (Base UI)
              Button, Input, Textarea
                       │
                       ▼
              Shared domain (unchanged)
              presetsCatalog, preferencesCore,
              web draft, OAuth completeOAuthSubmit
```

### Recommended project structure (delta only)

```text
src/
├── index.web.css                 # Mist Sky tokens + radius 0 + bridge remap
├── components/
│   ├── ui/
│   │   ├── button.tsx            # radius/height overrides for Phase 2 language
│   │   ├── input.tsx             # NEW via shadcn add
│   │   ├── textarea.tsx          # NEW via shadcn add
│   │   ├── label.tsx             # optional NEW
│   │   └── *.import.test.ts      # import-only proofs
│   ├── WebShell.tsx              # underline nav restyle
│   ├── ThemeToggle.tsx           # text trio restyle
│   ├── WebStartPanel.tsx         # Mist Sky start
│   └── BrandMark.tsx             # keep PNG
├── pages/
│   ├── GalleryPage.tsx
│   ├── WizardPage.tsx
│   └── OAuthCallbackPage.tsx     # wrap WebShell
└── lib/
    ├── foundation.isolation.test.ts  # allowlist + token contract updates
    ├── uiClasses.ts                  # KEEP for Phase 3/4 consumers
    └── theme.ts                      # DO NOT break dual-write
```

### Pattern 1: Mist Sky token cutover (D-21 step 1)

**What:** Replace Phase 1 neutral OKLCH `:root` / `.dark` block with Mist Sky hex (or equivalent), set `--radius: 0`, remap bridge accent off cyan.  
**When to use:** First implementation wave before mounting product Button colors.

**Prescriptive mapping** [CITED: `.planning/design/PALETTE.md` + `02-UI-SPEC.md`]:

| Token | Light (`:root`) | Dark (`.dark`) |
|-------|-----------------|----------------|
| `--background` | `#f5f7fa` | `#0b0c0e` |
| `--card` / `--popover` | `#ffffff` | `#111316` |
| `--muted` / `--secondary` / `--accent` (wash) | `#eef1f5` | `#181b20` |
| `--border` / `--input` | `#d8dee8` | `#2a2e36` |
| `--foreground` | `#14171c` | `#f2f4f7` |
| `--muted-foreground` | `#5c6570` | `#8b929e` |
| `--primary` | `#5a7fa8` | `#a8c5e8` |
| `--primary-foreground` | `#f5f7fa` | `#0b0c0e` |
| `--destructive` | `#b85c56` | `#e8b4b0` |
| `--ring` | primary @ ~25% | primary @ ~35% |
| `--radius` | `0` | `0` |

Bridge remap (keep utilities working for unrestyled editor):

```css
/* After Mist Sky semantic tokens exist */
--color-gsd-accent: var(--primary);
--color-gsd-accent-hover: var(--primary-hover); /* if defined */
--color-gsd-accent-dim: var(--accent-soft);     /* or color-mix / primary/12% */
--color-gsd-on-accent: var(--primary-foreground);
--color-gsd-danger: var(--destructive);
/* Retire cyan values on --bridge-accent* or delete bridge vars once unused */
```

**Do not** map `--primary` to `#22d3ee` (isolation test already forbids).

### Pattern 2: shadcn add Input/Textarea (this stack)

**What:** Official CLI against locked `components.json`.  
**When:** After or with token wave; before Wizard/Gallery search restyle.

```bash
npx shadcn@4.13.1 add input textarea -y
```

Registry shapes (verified via CLI `view`) [VERIFIED: shadcn registry]:

- **Input:** `@base-ui/react/input` + `cn(...)`; default `h-8 rounded-lg` — override height/radius for 40px linear.  
- **Textarea:** native `<textarea>`; `min-h-16 rounded-lg` — override radius.  
- Controlled usage: Textarea uses normal `value`/`onChange`. Input supports Base UI `value` + `onValueChange`; also typed as `ComponentProps<"input">` in registry wrapper — **verify controlled `onChange` after install** (see Pitfalls).

### Pattern 3: Button language on restyled surfaces (WEB-06)

**What:** Only `@/components/ui/button` Button or `buttonVariants`.  
**When:** Shell external link, Gallery CTAs/rows, Wizard CTAs, Start CTAs, OAuth back link.

```tsx
// Source: base-nova button registry + Base UI render prop docs
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Action button
<Button type="button" variant="default" className="min-h-10 rounded-none">
  Use preset
</Button>

// Secondary
<Button type="button" variant="outline" className="min-h-10 rounded-none">
  Preview
</Button>

// Router link styled as button (prefer this over nested button)
<Link to="/new" className={cn(buttonVariants({ variant: "default" }), "min-h-10 rounded-none")}>
  Create new preset
</Link>

// External
<a
  href="https://www.opengsd.net"
  target="_blank"
  rel="noopener noreferrer"
  className={cn(buttonVariants({ variant: "outline" }), "min-h-10 rounded-none hidden sm:inline-flex")}
>
  opengsd.net
</a>
```

**Button CVA overrides required for Phase 2** (edit `button.tsx` after skeleton):

| Default registry | Phase 2 need |
|------------------|--------------|
| `rounded-lg` in base + sizes | `rounded-none` (or `rounded-[var(--radius)]` with radius 0) |
| size `default` = `h-8` | `min-h-10` / `h-10` (≥40px) for page CTAs |
| `default` hover `bg-primary/80` | OK approximation **or** `hover:bg-[var(--primary-hover)]` |
| `destructive` soft fill | Aligns with soft danger; for outline-only soft danger use `variant="outline"` + destructive border/text classes if a destructive CTA appears (none primary this phase) |

### Pattern 4: Underline nav + theme trio (WEB-01, THM-04)

**What:** Replace `segmentGroup` / filled `btnSegmentActive` with text + 1px primary bottom border.  
**When:** WebShell + ThemeToggle only.

```tsx
// NavLink active: text-foreground + border-b border-primary
// Idle: text-muted-foreground hover:text-foreground
// Theme radio: keep role="radiogroup" / role="radio" / aria-checked
// Do NOT call setTheme differently; do NOT touch applyTheme dual-write
```

Header constants [CITED: 02-UI-SPEC]: height **56px** (`h-14` / `3.5rem`); strip **36px** when `active === "editor"`; no heavy glass (drop `backdrop-blur-md` or keep near-opaque).

### Pattern 5: Wizard linear choice rows (D-13)

**What:** Replace `choiceBtn` / `choiceBtnActive` with bordered rows; active = left edge 2–3px primary + soft wash.  
**When:** Mode + profile selectors on WizardPage.

```tsx
// Idle: border border-border bg-transparent text-muted-foreground min-h-12 p-4 rounded-none
// Hover: text-foreground bg-muted/…
// Active: border-l-[3px] border-l-primary bg-primary/10 (or --accent-soft)
// Keyboard: focus-visible:ring-ring; Space/Enter selects (native button)
```

### Pattern 6: OAuth inside WebShell (D-19)

**What:** Wrap status in `<WebShell active="editor">`.  
**When:** OAuthCallbackPage only.

```tsx
// Preserve useEffect OAuth exchange exactly
// Loading: "Completing sign-in…"
// Error: soft danger + Button/link "Back to editor"
// Success: still may navigate away immediately — quiet if any inline UI remains
```

### Anti-Patterns to Avoid

- **Mixing `gsd-btn` + shadcn Button on the same restyled route** — violates WEB-06 / D-08.  
- **`shadcn add --all` or third-party registries** — violates FND-03.  
- **Radix components alongside Base UI** — irreversible style mix.  
- **Deleting `.gsd-btn` CSS in Phase 2** — breaks ConfigApp/modals still on bridge (D-22).  
- **Restyling ConfigApp sidebar/toolbar** — WEB-04 Phase 4 (D-24).  
- **Changing theme storage key or dropping dual-write** — breaks THM-02/03.  
- **Card grid gallery** — D-09 linear list only.  
- **Logo cyan/purple as primary** — palette lock.  
- **Solid red destructive fills** — D-07 soft outline/soft fill only.  
- **Async CSS import reintroduction** — FOUC; keep `@platform-css` static alias.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text field chrome | Custom bordered inputs from scratch | shadcn `Input` / `Textarea` | Focus rings, invalid, disabled, dark variants already composed [VERIFIED: registry] |
| Button variants | New `.gsd-btn` CSS for web routes | `Button` + `buttonVariants` | WEB-06 single system |
| Theme storage / system media | next-themes or second provider | Existing `useTheme` / `applyTheme` | Dual-write already correct |
| Nav active state machine | Custom router state | `NavLink` `isActive` / `end` | Already correct in WebShell |
| Preset catalog fetching | New API client | `presetsCatalog` helpers | Behavior stability |
| OAuth exchange | Reimplement callback | `completeOAuthSubmit` | Security-sensitive; UI wrap only |
| Class merging | String concat | `cn` from `@/lib/utils` | TW conflict-safe |
| Dark mode CSS selector | Hand-rolled media-only theme | `@custom-variant dark (&:is(.dark *))` + dual-write | Phase 1 lock |

**Key insight:** Phase 2 fails when teams re-skin by copying more `gsd-*` CSS. Success is **token cutover + primitive mount + stop importing uiClasses on the files this phase owns**.

---

## Common Pitfalls

### Pitfall 1: FOUC / wrong CSS entry
**What goes wrong:** Flash of unstyled or desktop CSS on web; or dual CSS load.  
**Why:** Async CSS or importing both platform files.  
**How to avoid:** Keep `main.tsx` static `import "@platform-css"`; `bootstrapTheme()` before React; never reintroduce deleted shared `index.css`.  
**Warning signs:** Web bundle contains `--gsd-bg` as primary system; desktop bundle contains `shadcn/tailwind`.

### Pitfall 2: Breaking dual-write theme (THM-02/03)
**What goes wrong:** Toggle looks new but light mode utilities fail or flash.  
**Why:** Restyle ThemeToggle accidentally changes `setTheme` or removes `.dark` write.  
**How to avoid:** Presentation-only edits to ThemeToggle; run existing `theme.test.ts`; manual matrix Auto/Dark/Light.  
**Warning signs:** `data-theme` and `.dark` diverge on `<html>`.

### Pitfall 3: FND-03 allowlist fails after `shadcn add`
**What goes wrong:** `foundation.isolation.test.ts` fails — currently allowlist is **only** `button.tsx` + `button.import.test.ts`, and a separate test **forbids** any `input.tsx`.  
**Why:** Phase 1 walking-skeleton contract.  
**How to avoid:** Same PR/wave as `add input textarea`: expand `UI_ALLOWLIST`; change forbidden list to still block `card`/`dialog`/`select`/`command` but **allow** `input`/`textarea`/`label`. Add import-only tests.  
**Warning signs:** CI red on “unexpected ui file: input.tsx”.

### Pitfall 4: Leaving cyan bridge while mounting Mist Sky Button
**What goes wrong:** Primary buttons look Mist Sky but kicker/links/workspace label stay neon cyan mid-restyle.  
**Why:** `--color-gsd-accent: var(--bridge-accent)` still cyan.  
**How to avoid:** D-21 tokens first: remap `--color-gsd-accent` → `--primary` and retire cyan bridge values in the same token wave.  
**Warning signs:** `text-gsd-accent` still resolves to `#22d3ee` in dark.

### Pitfall 5: Removing bridge CSS too early (D-22 misread)
**What goes wrong:** ConfigApp toolbar/sections unstyled or broken on web.  
**Why:** Deleting `.gsd-btn` globally while editor still uses `uiClasses`.  
**How to avoid:** Drop **imports/usages** on Phase 2 files only; keep CSS rules until Phase 4. Update isolation test that currently requires `.gsd-btn` presence — it should **still pass** (CSS remains).  
**Warning signs:** Editor Save/Import buttons lose chrome after Phase 2.

### Pitfall 6: Base UI only — accidental Radix add
**What goes wrong:** Mixed primitive event models / dependency bloat.  
**Why:** Wrong style flag or unpinned `shadcn add`.  
**How to avoid:** Pin `npx shadcn@4.13.1`; assert `components.json` style `base-nova`; grep no `@radix-ui/`.  
**Warning signs:** New packages `@radix-ui/react-*` in lockfile.

### Pitfall 7: Button default density (h-8, rounded-lg)
**What goes wrong:** Controls look “almost” linear but fail 40px / radius 0 contract.  
**Why:** Registry defaults.  
**How to avoid:** Edit `buttonVariants` base + sizes; set `--radius: 0`; override Input/Textarea `rounded-none` + `min-h-10` where needed.  
**Warning signs:** Computed height 32px; 8px corner radius on CTAs.

### Pitfall 8: Nested interactive content (`Button` wrapping `Link`)
**What goes wrong:** Invalid HTML / a11y issues.  
**Why:** Replacing `<Link className={btnPrimary}>` with `<Button><Link>` naively.  
**How to avoid:** `buttonVariants` on `Link`/`a`, or Base UI `render` + `nativeButton={false}`.  
**Warning signs:** `<button><a>` in DOM.

### Pitfall 9: Controlled Input `onChange` vs `onValueChange`
**What goes wrong:** Wizard title / gallery search don’t update.  
**Why:** Base UI Input documents `onValueChange(value, details)`; registry types also expose input props.  
**How to avoid:** After install, verify controlled pattern in a quick manual or unit check; Textarea is native so wizard description is safe. Prefer:

```tsx
// Prefer verifying; if onChange unreliable:
onValueChange={(value) => setTitle(value)}
// Textarea:
onChange={(e) => setDescription(e.target.value)}
```

**Warning signs:** Typed characters don’t stick.

### Pitfall 10: Restyling loaded editor by accident
**What goes wrong:** Scope creep into WEB-04; large ConfigApp diffs.  
**Why:** WebStartPanel lives inside ConfigApp next to toolbar.  
**How to avoid:** Touch `WebStartPanel.tsx` only for empty state; leave ConfigApp gsd segments/toolbars alone except if import path for Start needs no change (already isolated component).  
**Warning signs:** Large `ConfigApp.tsx` className churn beyond Start.

### Pitfall 11: Isolation test “bridge still required” becomes stale
**What goes wrong:** Token wave green for product but tests still assert cyan `--bridge-accent` or forbid Mist Sky hex.  
**Why:** Phase 1 tests encoded transitional cyan bridge.  
**How to avoid:** Update tests to: (1) require Mist Sky primary values or at least non-cyan primary; (2) allow bridge remap to primary; (3) still require `.gsd-btn` CSS presence until Phase 4; (4) still forbid `--primary: #22d3ee`.  
**Warning signs:** Tests force reintroduction of cyan.

### Pitfall 12: OAuth still bare after shell restyle
**What goes wrong:** WEB-05 incomplete; orphan page without nav/theme.  
**Why:** OAuth never imported WebShell historically.  
**How to avoid:** Explicit task to wrap `OAuthCallbackPage`.  
**Warning signs:** `/oauth/callback` missing header.

---

## Code Examples

### Mist Sky `:root` / `.dark` skeleton (prescriptive)

```css
/* Source: .planning/design/PALETTE.md + 02-UI-SPEC token cutover */
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
  /* charts/sidebar may keep scaffold or map to card/muted — low priority this phase */
}

.dark {
  --background: #0b0c0e;
  --foreground: #f2f4f7;
  --card: #111316;
  --card-foreground: #f2f4f7;
  --popover: #111316;
  --popover-foreground: #f2f4f7;
  --primary: #a8c5e8;
  --primary-foreground: #0b0c0e;
  --secondary: #181b20;
  --secondary-foreground: #f2f4f7;
  --muted: #181b20;
  --muted-foreground: #8b929e;
  --accent: #181b20;
  --accent-foreground: #f2f4f7;
  --destructive: #e8b4b0;
  --border: #2a2e36;
  --input: #2a2e36;
  --ring: color-mix(in oklab, #a8c5e8 35%, transparent);
  --primary-hover: #c4daf2;
  --accent-soft: rgba(168, 197, 232, 0.12);
}
```

Keep existing `@theme inline` bindings; add optional:

```css
@theme inline {
  /* existing --color-primary etc. stay */
  --color-primary-hover: var(--primary-hover);
}
```

### Gallery search + row actions

```tsx
// Source: GalleryPage handlers preserved; chrome from UI-SPEC
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<div className="flex gap-3 mb-6">
  <Input
    type="search"
    placeholder="Search presets…"
    aria-label="Search presets"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="flex-1 min-h-10 rounded-none"
  />
  <Button type="button" variant="outline" disabled={loading} onClick={() => void loadIndex()} className="min-h-10 rounded-none">
    Refresh list
  </Button>
</div>

{/* empty catalog vs filtered — distinct copy per UI-SPEC */}
{/* list: border divide-y rounded-none — no card grid */}
```

### Wizard meta fields

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

<label className="text-sm text-foreground" htmlFor="preset-title">Preset title</label>
<Input id="preset-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Preset title" className="rounded-none min-h-10" />

<label className="text-sm text-foreground" htmlFor="preset-desc">Short description for the gallery</label>
<Textarea id="preset-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-none" />
```

### FND-03 allowlist update (test)

```ts
// Source: foundation.isolation.test.ts — update when adding primitives
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
  "input.tsx",
  "input.import.test.ts", // if added
  "textarea.tsx",
  "textarea.import.test.ts",
  // "label.tsx", // if added
]);

// Forbidden dump list: keep card/dialog/select/command;
// REMOVE blanket forbid of "input" / "textarea" / "label"
```

---

## State of the Art

| Old Approach (pre–Phase 2) | Current Approach (Phase 2 target) | When Changed | Impact |
|----------------------------|-----------------------------------|--------------|--------|
| Neutral OKLCH shadcn scaffold | Mist Sky hex semantic tokens | Phase 2 token wave | Product brand language |
| `--radius: 0.625rem` | `--radius: 0` | D-23 | Linear grammar |
| `--color-gsd-accent` → cyan bridge | → `--primary` Mist Sky | D-21 | Unrestyled chrome stops neon flash |
| `gsd-btn` / segment pills on web leaves | shadcn Button + underline nav | Phase 2 | WEB-01/06 |
| OAuth bare page | WebShell-wrapped status | D-19 | WEB-05 |
| Button import-only | Button mounted on product routes | Phase 2 | First real consumer |
| ui/ allowlist = button only | button + input + textarea (+ optional label) | FND-03 evolution | Controlled primitive growth |

**Deprecated/outdated on Phase 2 surfaces:**
- `btn`, `btnPrimary`, `btnSegment*`, `choiceBtn*` from `uiClasses` — stop importing on restyled files  
- Filled segment nav / theme pills  
- Glass heavy header blur as primary chrome  
- Logo cyan as accent  

**Still valid until Phase 4:**
- `.gsd-btn*` CSS rules in `index.web.css` for ConfigApp/sections  
- `uiClasses.ts` exports for modals/editor  

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prefer `buttonVariants` on `Link`/`a` over Base UI `render` for router links | Architecture Patterns | Either works; wrong pick is style-only |
| A2 | Exact `--primary-hover` hex required vs `primary/80` approximation | Standard Stack / Tokens | Visual drift from UI-SPEC hover |
| A3 | No new npm packages needed beyond existing `@base-ui/react` for Input | Standard Stack | May need peer reinstall if CLI gap recurs |
| A4 | Soft destructive registry variant satisfies D-07 without custom outline variant this phase | Button language | If a true soft-outline-only destructive is required later, add CVA variant in Phase 3/4 |
| A5 | Gallery filtered-empty vs catalog-empty copy split is presentation-only (no API change) | WEB-07 | None if implemented in render conditions |

**If empty:** N/A — table has assumed preferences for planner discretion.

---

## Open Questions

1. **Primary hover token**
   - What we know: UI-SPEC lists exact hover hex; registry uses `primary/80`.
   - What's unclear: Whether visual review will reject opacity approximation.
   - Recommendation: Add `--primary-hover` in token wave; wire Button default hover to it (small CVA edit).

2. **Label primitive**
   - What we know: Optional in UI-SPEC; plain `<label>` is valid.
   - What's unclear: Whether planner wants registry Label for consistency.
   - Recommendation: Prefer plain labels to minimize FND-03 surface; add Label only if shared styling needed.

3. **ShareModal visual depth**
   - What we know: Handlers stay; Phase 3 owns full Dialog.
   - What's unclear: How much class polish if Preview looks broken under Mist Sky.
   - Recommendation: Token inheritance only; no Dialog migration in Phase 2.

4. **Isolation test rewrite detail for bridge**
   - What we know: Phase 1 asserts `--bridge-accent` and cyan-not-primary.
   - What's unclear: Exact assertions after cyan retirement.
   - Recommendation: Assert Mist Sky primary present; assert no `#22d3ee` on `--primary` or `--color-gsd-accent`; keep `.gsd-btn` presence assert.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | builds/tests | ✓ | v26.0.0 (repo targets 20+) | — |
| npm | installs | ✓ | 11.12.1 | — |
| `npx shadcn@4.13.1` | add input/textarea | ✓ | 4.13.1 | — |
| `@base-ui/react` | Input/Button | ✓ | 1.6.0 | reinstall `^1.6.0` if missing subpath |
| Vitest | validation | ✓ | 4.1.7 (36 tests pass baseline) | — |
| Desktop Rust/Tauri toolchain | dual build smoke | not probed this session | — | `npm run build` still runs frontend `tsc && vite build` without full Tauri bundle |

**Missing dependencies with no fallback:** none for Phase 2 web restyle.

**Missing dependencies with fallback:** full Tauri native build not required for web token/chrome work; still run `npm run build` (desktop frontend) + `npm run build:web` for ISO.

---

## Validation Architecture

> `workflow.nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^4.0.18` (run shows v4.1.7) |
| Config file | `vite.config.ts` → `test.environment: "node"`, `include: ["src/**/*.test.ts"]` |
| Quick run command | `npm test -- src/lib/foundation.isolation.test.ts src/components/ui/` |
| Full suite command | `npm test` |
| Dual build smoke | `npm run build:web && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEB-01 | WebShell source no longer imports `btnSegment`/`segmentGroup` pills; uses underline pattern | unit (source contract) | `npm test -- src/lib/phase02.surfaces.test.ts` (proposed) | ❌ Wave 0 |
| WEB-02 | GalleryPage uses `@/components/ui/button` + Input; no `btnPrimary` import | unit (source contract) | same | ❌ Wave 0 |
| WEB-03 | WizardPage uses Input/Textarea; no `choiceBtn` import | unit (source contract) | same | ❌ Wave 0 |
| WEB-05 | OAuthCallbackPage imports/wraps WebShell | unit (source contract) | same | ❌ Wave 0 |
| WEB-06 | Phase 2 surface files do not import `btn`/`btnPrimary` from uiClasses | unit (source contract) | same | ❌ Wave 0 |
| WEB-07 | Gallery distinguishes empty vs filtered empty (render branches) | unit or manual | manual matrix + optional source asserts for copy strings | ❌ Wave 0 / human |
| THM-04 | ThemeToggle still radiogroup; theme.test dual-write green | unit | `npm test -- src/lib/theme.test.ts` | ✅ |
| FND-03 | ui/ allowlist includes input/textarea only as approved | unit | `npm test -- src/lib/foundation.isolation.test.ts` | ✅ (must update) |
| THM-01 | Mist Sky tokens still declare required names; primary not cyan | unit | foundation.isolation.test.ts | ✅ (must update values) |
| ISO-01 | Desktop CSS still free of shadcn/tw-animate | unit + build | foundation + `npm run build` | ✅ |
| Button | import-only + radius/variant contract | unit | `button.import.test.ts` (+ assert rounded-none if encoded) | ✅ (extend) |
| Input/Textarea | import-only callable exports | unit | `input.import.test.ts` / `textarea.import.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/lib/foundation.isolation.test.ts src/components/ui/ src/lib/theme.test.ts`  
- **Per wave merge:** `npm test` + `npm run build:web` + `npm run build`  
- **Phase gate:** Full suite green + dual builds + human theme matrix + visual pass on Gallery/Wizard/Start/OAuth/Shell  

### Wave 0 Gaps

- [ ] Update `src/lib/foundation.isolation.test.ts` — FND-03 allowlist for `input`/`textarea`/(optional `label`); stop forbidding `input.tsx`; retarget bridge asserts for Mist Sky (no cyan accent); keep `.gsd-btn` CSS presence until Phase 4  
- [ ] Add `src/components/ui/input.import.test.ts` + `textarea.import.test.ts` (import-only, node env) after CLI add  
- [ ] Add `src/lib/phase02.surfaces.test.ts` (or equivalent) — static source contracts: Phase 2 files must not import `btn`/`btnPrimary`/`choiceBtn`/`btnSegment`; OAuth must reference `WebShell`; optional assert `rounded-none` / Mist Sky primary in CSS  
- [ ] Extend `button.import.test.ts` if encoding radius/height contract in CVA string  
- [ ] Framework install: none (Vitest present)  
- [ ] Human visual: Auto/Dark/Light matrix; Gallery load/empty/error; Wizard create; OAuth loading/error; Start CTAs; desktop visual smoke unchanged  

*(Domain logic tests `preferencesCore.test.ts` remain regression baseline — do not weaken.)*

---

## Security Domain

> `security_enforcement` enabled (ASVS L1). Phase 2 is **UI presentation** on existing flows — residual risk **low**.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | partial (OAuth callback UI only) | Do not alter `completeOAuthSubmit`; never log `code` query param; no new token storage |
| V3 Session Management | no | Theme localStorage only (`gsd-pi-config.theme`) — unchanged |
| V4 Access Control | no | No authz UI changes |
| V5 Input Validation | yes (search/title/description presentation) | Inputs are local UI state; not new server sinks; keep existing length/content behavior |
| V6 Cryptography | no | No crypto in Phase 2 |
| V5/output encoding | yes (render catalog strings) | React text binding already escapes; do not `dangerouslySetInnerHTML` for descriptions |
| Secrets / export | yes (adjacent) | Preview continues `buildShareablePreset` / redaction path; do not bypass ShareModal handlers |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| OAuth code leakage via UI/logging | Information Disclosure | No `console.log` of URL/code; error strings only from thrown messages |
| XSS via preset title/description in gallery | Tampering | React default escaping; no HTML render of catalog fields |
| Secret leak via Preview during restyle | Information Disclosure | Keep `buildShareablePreset` / ShareModal; no new export path |
| Dependency confusion via unpinned CLI | Tampering | Pin `shadcn@4.13.1`; official registry only; FND-03 allowlist |
| Desktop CSS pollution enabling inconsistent security UX | Elevation (weak) | ISO-01 isolation tests + dual builds |

**Threat model note:** Phase 2 does not introduce new network endpoints, storage keys for secrets, or auth flows. Highest care is **OAuth callback UI wrap** and **not regressing redaction on Preview**.

---

## Sources

### Primary (HIGH confidence)

- Repo foundation: `components.json`, `src/index.web.css`, `src/components/ui/button.tsx`, Phase 1 summaries `01-02-SUMMARY.md`, `01-03-SUMMARY.md`  
- Locked product: `02-CONTEXT.md`, `02-UI-SPEC.md`, `.planning/design/PALETTE.md`, `.planning/REQUIREMENTS.md`  
- `npx shadcn@4.13.1 view input|textarea|label|button` — registry file contents [VERIFIED: shadcn CLI registry]  
- `@base-ui/react` Input/Button type defs in `node_modules` [VERIFIED: local install 1.6.0]  
- `gsd-tools query package-legitimacy check` for `@base-ui/react`, cva, lucide-react, shadcn  

### Secondary (MEDIUM confidence)

- Phase 1 `01-RESEARCH.md` patterns (platform CSS, dual-write, brownfield CLI)  
- shadcn docs URLs from CLI (`ui.shadcn.com/docs/components/base/*`) — content partially JS-rendered; registry `view` used as authority  

### Tertiary (LOW confidence)

- Preference for `buttonVariants` on Link vs `render` prop composition details beyond Base UI types  
- Exact visual acceptance of `primary/80` vs custom hover hex without design review  

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — packages and CLI registry verified in-repo  
- Architecture / code map: **HIGH** — surfaces read end-to-end  
- Mist Sky token values: **HIGH** — locked PALETTE/UI-SPEC  
- Pitfalls: **HIGH** — isolation allowlist + bridge + FOUC grounded in Phase 1 tests  
- Button link composition ergonomics: **MEDIUM** — Base UI supports `render`; pattern preference assumed  
- Input controlled `onChange` behavior: **MEDIUM** — verify after CLI add  

**Research date:** 2026-07-21  
**Valid until:** 2026-08-20 (30 days; re-check if shadcn CLI major bump)

### Planner cutover checklist (locked)

1. **Tokens** — Mist Sky + `--radius: 0` + accent bridge remap; update isolation token tests  
2. **Primitives** — `shadcn add input textarea`; Button radius/height; FND-03 allowlist; import tests  
3. **Shell** — WebShell underline nav + ThemeToggle trio + external Button language (WEB-01, THM-04)  
4. **Pages** — Gallery (WEB-02/07), Wizard (WEB-03), Start (D-17/18), OAuth wrap (WEB-05)  
5. **WEB-06 gate** — no `gsd-btn` / `btn*` imports on Phase 2 files; dual builds green  
6. **Out of scope guard** — no ConfigApp loaded chrome, no FormControls, no Dialog/Command dump  
