# Phase 2: Web Chrome & Standalone Pages - Context

**Gathered:** 2026-07-21  
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle **shared web chrome** and **standalone web routes** onto shadcn/ui using the locked **Mist Sky** palette and **clean/linear** grammar — without changing product flows or domain behavior, and without restyling the loaded cloud **editor shell** (sidebar/toolbar/sections) or form kit (Phase 4).

**In scope:** WebShell header/nav/workspace strip, ThemeToggle, Button language on restyled surfaces, Gallery (`/gallery`), Wizard (`/new`), OAuth callback (`/oauth/callback`), cloud **start/empty** panel (WebStartPanel), Mist Sky tokens in web CSS, retire `gsd-btn` **on routes Phase 2 touches**.

**Out of scope:** Desktop visual restyle; preference FormControls adapters; loaded ConfigApp sidebar/toolbar chrome (WEB-04 → Phase 4); modals/palette (Phase 3); new product capabilities.

**Requirements:** WEB-01, WEB-02, WEB-03, WEB-05, WEB-06, WEB-07, THM-04

</domain>

<decisions>
## Implementation Decisions

### Carried forward (do not re-open)
- **D-00a:** Palette **Mist Sky** locked — soft sky primary `#a8c5e8` (dark) / `#5a7fa8` (light); surfaces `#0b0c0e`/`#111316`; see `.planning/design/PALETTE.md`
- **D-00b:** Clean / linear grammar — 1px rules, hierarchy from type/space/borders; no logo cyan/purple
- **D-00c:** Web-only presentation; desktop keeps legacy `gsd-*` (ISO)
- **D-00d:** Theme semantics unchanged — Auto/Dark/Light, dual-write `data-theme` + `.dark` (Phase 1)

### Shell nav + theme toggle
- **D-01:** Main nav (Editor / Gallery / New) uses **underline tabs** — text links + 1px bottom rule on active; not filled segment pills
- **D-02:** Theme control is an **underline / text trio** (Auto · Dark · Light) — minimal linear; active = text emphasis + bottom rule or small primary chip; not icon-only cycle
- **D-03:** Keep existing **PNG BrandMark** (size/spacing may adjust); no flat-square replacement
- **D-04:** Header density stays **~56px** (current nav height); do not compress to 44px

### Button language
- **D-05:** Primary = **Mist Sky filled** shadcn `Button` default (`--primary` / `--primary-foreground`)
- **D-06:** Secondary = **outline** (1px border, transparent fill) for Load preset, Cancel, Preview, etc.
- **D-07:** Destructive = **soft danger outline** (Mist Sky soft rose border/text) — not solid red fills, not mere underline
- **D-08:** On any surface Phase 2 restyles, **only shadcn Button** — no mixed `gsd-btn` + Button (WEB-06)

### Gallery layout + states
- **D-09:** Presets display as **linear list rows** (title, description, tags, actions) with 1px dividers — not card grid
- **D-10:** Keep **single full-width search** only; no multi-filter/tag-chip chrome this phase
- **D-11:** Loading / empty / error = **inline quiet states** (text + optional spinner; soft danger for error; empty short copy + link to New/wizard)
- **D-12:** Keep **Use preset** (primary) + **Preview** (outline secondary) as row actions

### Wizard choices + steps
- **D-13:** Mode / profile selection = **linear choice rows** with left-edge active — replace `gsd-choice-btn` tiles
- **D-14:** **Single-page form** (mode + profile + title/description + create) — no multi-step wizard chrome
- **D-15:** Meta fields = **shadcn Input + Textarea** with labels; optional stays optional
- **D-16:** Create CTA at **bottom**; primary full-width on mobile

### Start panel + OAuth
- **D-17:** WebStartPanel keeps **3-step list + 3 CTAs** (Import / Load preset / New) — restyle only
- **D-18:** Keep kicker (e.g. “Git · Ship · Done”) as **Mist Sky accent uppercase kicker**
- **D-19:** OAuth callback = **minimal status inside WebShell** (loading / success+PR link / error+retry)
- **D-20:** OAuth success = **quiet** success text + link — not confetti or loud banners

### Migration cutover
- **D-21:** Implementation order: **Tokens → Shell → Pages** (Mist Sky CSS first, then WebShell/ThemeToggle/Button, then Gallery/Wizard/OAuth/Start)
- **D-22:** Drop `gsd-btn` / legacy chrome **on Phase 2 restyled routes**; keep file-level web bridge CSS for **unrestyled editor/forms until Phase 4**
- **D-23:** **`--radius: 0`** strict linear for shadcn on web
- **D-24:** Loaded editor shell (sidebar/toolbar) **out of scope** — Phase 4 only (WEB-04). Empty start panel is in scope.

### Claude's Discretion
- Exact ToggleGroup vs pure button+CSS for underline tabs/theme trio (as long as D-01/D-02 visual intent holds)
- Skeleton vs plain “Loading…” text for gallery load
- Preview modal chrome restyle depth (if preview stays modal, keep handlers; visual linear Mist Sky)
- Spacing scale within ~56px header and list row hit targets (≥40px controls)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Palette & design
- `.planning/design/PALETTE.md` — Mist Sky tokens dark/light; grammar; non-goals
- `.planning/design/palette-options.html` — visual reference for Mist Sky (Option A)
- `.agents/context/DESIGN.md` — product register notes; **do not** reintroduce logo cyan as primary (palette supersedes accent cyan for web)

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, requirement map
- `.planning/REQUIREMENTS.md` — WEB-01…03, WEB-05…07, THM-04 definitions
- `.planning/PROJECT.md` — web-only restyle; Mist Sky decision locked

### Phase 1 foundation
- `.planning/phases/01-foundation-isolation-theme-bridge/01-02-SUMMARY.md` — platform CSS split, isolation tests
- `.planning/phases/01-foundation-isolation-theme-bridge/01-03-SUMMARY.md` — components.json, Button walking skeleton
- `.planning/phases/01-foundation-isolation-theme-bridge/01-VERIFICATION.md` — foundation gates
- `components.json` — base-nova, css → `src/index.web.css`
- `src/index.web.css` — web tokens + transitional bridge (Phase 2 updates tokens; bridge shrinks)
- `src/index.desktop.css` — must stay free of shadcn stack (ISO-01)
- `src/lib/theme.ts` — dual-write `applyTheme` (do not break semantics)
- `src/components/ui/button.tsx` — Base UI Button primitive to extend for language

### Surfaces to restyle
- `src/components/WebShell.tsx` — header/nav
- `src/components/ThemeToggle.tsx` — theme control
- `src/components/WebStartPanel.tsx` — empty editor start
- `src/components/BrandMark.tsx` — keep PNG
- `src/pages/GalleryPage.tsx` — gallery
- `src/pages/WizardPage.tsx` — wizard
- `src/pages/OAuthCallbackPage.tsx` — OAuth
- `src/App.web.tsx` — routes
- `src/lib/uiClasses.ts` — legacy class map; stop using on Phase 2 surfaces

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` + `cn` + `@/*` aliases from Phase 1 — foundation for WEB-06
- `WebShell` wraps Gallery/Wizard; OAuth currently may be bare — bring under shell per D-19
- `useTheme` / `ThemeToggle` — restyle presentation only (THM-04)
- `fetchPresetIndex` / catalog helpers — gallery data path unchanged
- `applyModePreset` / `applyProfilePreset` — wizard domain unchanged

### Established Patterns
- Platform CSS via `@platform-css` — all visual token work stays in `index.web.css`
- Isolation tests in `foundation.isolation.test.ts` — extend if token/button contracts change
- Controlled pages with local state; no domain rewrite

### Integration Points
- Start panel lives inside ConfigApp empty web path — restyle component, not editor chrome
- Share/preview modals used from gallery — handlers stay; full modal system is Phase 3 (light restyle OK if required for gallery Preview)

</code_context>

<specifics>
## Specific Ideas

- Underline nav + text theme trio should match Mist Sky HTML mock language (preview file)
- Soft danger outline, not harsh red fills
- Zero radius everywhere on web shadcn this phase
- Primary buttons on dark use **light** sky fill with dark label (`#a8c5e8` on `#0b0c0e`)

</specifics>

<deferred>
## Deferred Ideas

- Loaded editor shell restyle (sidebar, toolbar, banners) — **Phase 4 / WEB-04**
- FormControls / section form kit — **Phase 4**
- Full modal/palette/command system — **Phase 3**
- Gallery tag-chip multi-filter — deferred; not Phase 2
- Multi-step wizard chrome — deferred; single page locked
- Desktop visual redesign — out of milestone
- BrandMark replacement with flat square — rejected for now

</deferred>

<vision>
## Captured Vision

A calm, **linear** web surface: soft sky as the only accent, structure from rules and type. Header feels like a thin instrument bar (underline tabs, quiet theme trio, existing logo). Gallery reads as a clean list. Wizard is one disciplined form. Empty start keeps the three steps and three actions but looks like Mist Sky, not cyan-neon GSD. Tokens land first so nothing flashes old brand colors mid-restyle.

</vision>
