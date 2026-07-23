# Phase 3: Modals, Palette & Overlays - Context

**Gathered:** 2026-07-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle **existing product overlays** onto shadcn **Dialog / AlertDialog / Command** patterns with **Mist Sky + clean/linear** grammar, while **preserving all domain handlers** (share redaction, import, load preset, submit/OAuth, palette field-jump) and **focus management** (trap, ESC, restore).

**In scope (OVL-01, OVL-02, OVL-03):**
- Share, Import preferences, Load preset, Submit preset modals
- Gallery preview when presented as a modal
- ⌘K Command palette (`Palette.tsx`)
- Official shadcn Dialog/Command (and required peers only); FND-03 allowlist expand
- Button language on overlay CTAs (Phase 2 WEB-06)

**Out of scope:**
- FormControls / section forms (Phase 4)
- Loaded editor shell sidebar/toolbar (WEB-04 / Phase 4)
- Desktop visual redesign / forcing Mist Sky on desktop chrome
- Tauri native file pickers (`importPresetDialog` etc.)
- Nested Dialog stacks; multi-filter product features
- Full registry dump (sheet/drawer/popover unless a peer of Dialog/Command)

</domain>

<decisions>
## Implementation Decisions

### Carried forward (do not re-open)
- **D-00a:** Mist Sky palette + linear grammar + `--radius: 0` (`.planning/design/PALETTE.md`, Phase 2)
- **D-00b:** Button language: primary filled / outline secondary / soft danger outline
- **D-00c:** Theme dual-write Auto/Dark/Light unchanged
- **D-00d:** No logo cyan/purple as primary
- **D-00e:** Behavior stability — redaction, OAuth, import/load handlers must not regress

### Dialog chrome
- **D-01:** Default shell = **shadcn Dialog** (centered) for most overlays
- **D-02:** **AlertDialog only** for true confirm/destructive cases — not for Share/Import forms
- **D-03:** Backdrop = **soft dark scrim ~60%**, no heavy blur requirement
- **D-04:** Close = **X + ESC + backdrop click** (preserve current dismiss paths)

### Modal inventory + depth
- **D-05:** Ship **all product modals**: Share, Import, Load preset, Submit preset, Gallery preview (if modal)
- **D-06:** Depth = **full Dialog mount + Phase 2 Button language**; copy/handlers unchanged
- **D-07:** Gallery Preview = **Dialog with scrollable body** (Share-like review pane)
- **D-08:** Submit preset = **restyle modal UI only**; OAuth/API handlers unchanged (no flow redesign)

### ⌘K Command palette
- **D-09:** Shell = **shadcn Command inside Dialog** (top-ish placement like current `pt-24` feel)
- **D-10:** **Keep existing scoring/ranking** (section + field search) — restyle list only
- **D-11:** Results = **linear list rows + left accent on active** (Mist Sky choice-row grammar)
- **D-12:** Empty/no-match = **quiet inline** muted message

### Focus / ESC / nest
- **D-13:** Focus trap from **shadcn/Base UI Dialog** — drop redundant hand-rolled Escape where Dialog covers it
- **D-14:** **Restore previous focus** on close
- **D-15:** **No nested Dialogs**; Select/dropdown **inside** Dialog is OK
- **D-16:** **Single open overlay** — palette vs modal exclusive (opening one closes the other if both can open)

### Share + secret-scan UX
- **D-17:** Keep **explicit redaction warning** (key/token/secret/password language)
- **D-18:** Primary CTA = **Copy to clipboard** (Mist Sky filled) + quiet “Copied” feedback
- **D-19:** Review content = **read-only scrollable mono pre/block** (exact bytes)
- **D-20:** Any secret-scan / leak warning UI stays **visible** as Mist Sky quiet Alert (soft danger/info) — never tooltip-only

### Platform scope
- **D-21:** **Web presentation goal** this milestone — do not force desktop look rewrite
- **D-22:** Prefer **shared React overlay components** with **web-only Mist Sky tokens** (desktop CSS isolation) over forking unless isolation breaks
- **D-23:** **Leave Tauri native dialogs alone** (file pickers stay system)
- **D-24:** Install **only Dialog/Command and required peers** via official `shadcn@4.13.1`; expand FND-03 allowlist accordingly

### Claude's Discretion
- Exact Dialog composition (`DialogHeader`/`DialogFooter` vs custom linear header)
- Whether backdrop dismiss is disabled on multi-step Submit mid-flow if data loss risk appears
- Command list max height / virtualization if result count high
- Alert vs muted text for non-secret warnings inside modals

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product & palette
- `.planning/design/PALETTE.md` — Mist Sky tokens
- `.planning/ROADMAP.md` — Phase 3 goal, OVL-01/02/03
- `.planning/REQUIREMENTS.md` — OVL-* definitions
- `.planning/PROJECT.md` — web-only restyle, behavior stability
- `.planning/phases/02-web-chrome-standalone-pages/02-CONTEXT.md` — Button language, linear grammar
- `.planning/phases/02-web-chrome-standalone-pages/02-UI-SPEC.md` — spacing/type/copy contracts to extend

### Surfaces
- `src/components/ShareModal.tsx` — redaction share
- `src/components/ImportPreferencesModal.tsx`
- `src/components/LoadPresetModal.tsx`
- `src/components/SubmitPresetModal.tsx` — OAuth submit path
- `src/components/Palette.tsx` — ⌘K scoring + keyboard
- Gallery preview path in `src/pages/GalleryPage.tsx` (if modal host)
- `src/lib/preferencesCore.ts` — redact/share helpers (do not weaken)

### Foundation
- `components.json` — base-nova, Base UI only
- `src/components/ui/button.tsx` — CTA language
- `src/lib/foundation.isolation.test.ts` — allowlist + isolation
- `src/index.web.css` / `src/index.desktop.css` — platform tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 2 Button/Input/Textarea + Mist Sky tokens
- Modal open props: `{ open, onClose }` pattern across Share/Load/Submit
- Palette scoring functions — pure logic extractable
- `modalPanel` / `btn` still used — replace on restyled overlays

### Established Patterns
- Hand-rolled `fixed inset-0` + Escape listeners + backdrop click
- Share redaction copy-before-clipboard is security-critical UX
- Palette field-jump via `onNavigate(section, fieldPath?)`

### Integration Points
- ConfigApp / Gallery mount modals and Palette
- Desktop still mounts same components under desktop CSS

</code_context>

<specifics>
## Specific Ideas

- Dialog + Command from official registry only; pin `shadcn@4.13.1`
- Linear panels, no glass/blur requirement
- Exclusive overlay open (palette vs modals)
- Never hide redaction/secret-scan messaging

</specifics>

<deferred>
## Deferred Ideas

- Form kit adapters (Phase 4)
- Editor shell restyle (Phase 4 / WEB-04)
- Nested Dialog workflows
- Drawer/Sheet mobile patterns unless required as Dialog peer
- Desktop-native look upgrade
- Replacing Tauri file pickers with custom UI

</deferred>

<vision>
## Captured Vision

Overlays feel like the same Mist Sky instrument as Phase 2 chrome: linear Dialog panels, soft scrim, clear CTAs. Sharing stays explicitly safe (redaction visible, review then copy). ⌘K stays fast keyboard navigation with the same search ranking, just cleaner list chrome. Focus is solid and exclusive—one overlay at a time, no focus black holes.

</vision>
