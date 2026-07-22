# Phase 3: Modals, Palette & Overlays - Research

**Researched:** 2026-07-21  
**Domain:** shadcn/ui base-nova Dialog + Command overlays on existing product modals/palette (React 19 + Vite 8 + Tailwind 4, dual web/desktop)  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Carried forward (do not re-open)
- **D-00a:** Mist Sky palette + linear grammar + `--radius: 0` (`.planning/design/PALETTE.md`, Phase 2)
- **D-00b:** Button language: primary filled / outline secondary / soft danger outline
- **D-00c:** Theme dual-write Auto/Dark/Light unchanged
- **D-00d:** No logo cyan/purple as primary
- **D-00e:** Behavior stability — redaction, OAuth, import/load handlers must not regress

#### Dialog chrome
- **D-01:** Default shell = **shadcn Dialog** (centered) for most overlays
- **D-02:** **AlertDialog only** for true confirm/destructive cases — not for Share/Import forms
- **D-03:** Backdrop = **soft dark scrim ~60%**, no heavy blur requirement
- **D-04:** Close = **X + ESC + backdrop click** (preserve current dismiss paths)

#### Modal inventory + depth
- **D-05:** Ship **all product modals**: Share, Import, Load preset, Submit preset, Gallery preview (if modal)
- **D-06:** Depth = **full Dialog mount + Phase 2 Button language**; copy/handlers unchanged
- **D-07:** Gallery Preview = **Dialog with scrollable body** (Share-like review pane)
- **D-08:** Submit preset = **restyle modal UI only**; OAuth/API handlers unchanged (no flow redesign)

#### ⌘K Command palette
- **D-09:** Shell = **shadcn Command inside Dialog** (top-ish placement like current `pt-24` feel)
- **D-10:** **Keep existing scoring/ranking** (section + field search) — restyle list only
- **D-11:** Results = **linear list rows + left accent on active** (Mist Sky choice-row grammar)
- **D-12:** Empty/no-match = **quiet inline** muted message

#### Focus / ESC / nest
- **D-13:** Focus trap from **shadcn/Base UI Dialog** — drop redundant hand-rolled Escape where Dialog covers it
- **D-14:** **Restore previous focus** on close
- **D-15:** **No nested Dialogs**; Select/dropdown **inside** Dialog is OK
- **D-16:** **Single open overlay** — palette vs modal exclusive (opening one closes the other if both can open)

#### Share + secret-scan UX
- **D-17:** Keep **explicit redaction warning** (key/token/secret/password language)
- **D-18:** Primary CTA = **Copy to clipboard** (Mist Sky filled) + quiet “Copied” feedback
- **D-19:** Review content = **read-only scrollable mono pre/block** (exact bytes)
- **D-20:** Any secret-scan / leak warning UI stays **visible** as Mist Sky quiet Alert (soft danger/info) — never tooltip-only

#### Platform scope
- **D-21:** **Web presentation goal** this milestone — do not force desktop look rewrite
- **D-22:** Prefer **shared React overlay components** with **web-only Mist Sky tokens** (desktop CSS isolation) over forking unless isolation breaks
- **D-23:** **Leave Tauri native dialogs alone** (file pickers stay system)
- **D-24:** Install **only Dialog/Command and required peers** via official `shadcn@4.13.1`; expand FND-03 allowlist accordingly

### Claude's Discretion
- Exact Dialog composition (`DialogHeader`/`DialogFooter` vs custom linear header)
- Whether backdrop dismiss is disabled on multi-step Submit mid-flow if data loss risk appears
- Command list max height / virtualization if result count high
- Alert vs muted text for non-secret warnings inside modals

### Deferred Ideas (OUT OF SCOPE)
- Form kit adapters (Phase 4)
- Editor shell restyle (Phase 4 / WEB-04)
- Nested Dialog workflows
- Drawer/Sheet mobile patterns unless required as Dialog peer
- Desktop-native look upgrade
- Replacing Tauri file pickers with custom UI
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OVL-01 | Existing modals (import, share, load preset, submit preset, and related) use shadcn Dialog/AlertDialog patterns with preserved handlers | Install base-nova `dialog` (+ peers); restyle Share/Import/Load/Submit + Gallery preview; keep domain handlers; **do not** install AlertDialog unless a true confirm product path is added (none required) |
| OVL-02 | Command palette (⌘K) restyled with shadcn Command/Dialog; field-jump / keyboard preserved | Install `command` (pulls `dialog` + `input-group` + npm `cmdk`); wrap existing scoring with `shouldFilter={false}`; keep `onNavigate(section, fieldPath?)` |
| OVL-03 | Overlay focus management (trap, ESC, restore) usable; no broken nested Select/Dialog focus | Controlled Base UI Dialog (`open`/`onOpenChange`, `modal` default true, `initialFocus`/`finalFocus`); remove hand-rolled window Escape; host exclusivity (D-16); no nested Dialogs |
</phase_requirements>

## Summary

Phase 3 is a **presentation restyle of five product overlays** already mounted from `ConfigApp` / `GalleryPage`: Share, Import preferences, Load preset, Submit preset, and the ⌘K Palette — plus Gallery preview via the same Share shell. Today every modal is a hand-rolled `fixed inset-0 z-50` panel with manual `window` Escape listeners, `modalPanel` / `btn` / `btnPrimary` from `uiClasses`, and independent open booleans (no exclusivity). Domain behavior (redaction copy-before-clipboard, import file pipeline, load gallery/file, OAuth submit + `completeOAuthSubmit`, palette scoring) is mature and **must stay behavior-stable**.

Official **shadcn@4.13.1 base-nova** primitives map cleanly: `dialog` wraps `@base-ui/react/dialog` (focus trap, ESC, pointer dismiss, focus restore); `command` wraps **cmdk** inside Dialog and pulls registry peer **`input-group`**. Default registry styles use light scrim (`bg-black/10`), optional blur, and `rounded-xl` — **override immediately** to Mist Sky contracts (`bg-black/60`, no product blur, `rounded-none`, UI-SPEC widths). FND-03 must expand from Button/Input/Textarea to allow `dialog` / `command` / `input-group` and **flip** the Phase 1 “forbid dialog/command” assertion.

**Primary recommendation:** Wave 0 expand isolation tests + `npx shadcn@4.13.1 add dialog command -y` → restyle modals to controlled Dialog shells with Phase 2 Button language → restyle Palette as Command-in-Dialog with `shouldFilter={false}` + existing scorers → enforce single-open overlay in `ConfigApp` openers → dual-build + source-contract tests; never touch `preferencesCore` redaction or OAuth submit logic.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Overlay chrome (Dialog/Command shell, scrim, focus trap) | Browser / Client | — | Pure presentation; Base UI Dialog owns a11y modal semantics |
| Product modal domain handlers (import, load, share copy, submit OAuth) | Browser / Client (existing modules) | Platform backend | Keep handlers in modal components / ConfigApp; I/O via `ConfigBackend` / browser APIs |
| Share redaction + secret scan | Shared domain lib (`preferencesCore`) | — | Security-critical pure TS; UI only displays/warns — never reimplement |
| Palette search ranking | Browser / Client (`Palette.tsx` scorers) | Field registry (`fields.ts`) | D-10: keep scoring; restyle list only |
| Exclusive open state | Browser / Client (`ConfigApp` / Gallery host) | — | D-16 host enforcement; not inside Dialog primitive |
| Native file pickers | Desktop / Tauri | Web `pickFile` | D-23 leave Tauri dialogs alone; Import/Load keep existing pick hooks |
| OAuth callback completion | Browser route + serverless API | — | `completeOAuthSubmit` + `/api/submit-preset`; restyle only Submit modal UI |
| Desktop visual isolation | Browser / CSS (`index.desktop.css`) | Shared overlay TSX | Shared components OK; desktop must not load `shadcn/tailwind.css`; may need minimal semantic CSS var bridge for shared classnames |
| FND-03 allowlist gate | Test / CI | — | Static allowlist in `foundation.isolation.test.ts` |

## Code Map (current overlays)

### Host state — `ConfigApp.tsx`

| State | Setter openers | Close |
|-------|----------------|-------|
| `paletteOpen` | ⌘K via `useShortcuts` (`setPaletteOpen(true)`) | `onClose` → `setPaletteOpen(false)` |
| `shareOpen` + `shareContent` | `sharePreset` → `backend.buildShareablePreset` then open | `setShareOpen(false)` |
| `importPrefsOpen` | Toolbar / `WebStartPanel.onUpload` | `setImportPrefsOpen(false)` |
| `loadPresetOpen` | Toolbar / `WebStartPanel.onLoadPreset` | `setLoadPresetOpen(false)` |
| `submitOpen` | Web-only toolbar | `setSubmitOpen(false)` |

**Gap (OVL-03 / D-16):** open flags are independent — opening palette does not close modals and vice versa. Planner must add a small host helper that closes all product overlays before opening one.

**Dirty confirms:** `window.confirm` for replace-on-import/load and close/scope switches — **not** product Dialogs; leave as native confirm this phase (D-02 / no AlertDialog required).

### `ShareModal.tsx`

| Item | Detail |
|------|--------|
| Props | `{ open, content, onClose }` — **no `title` prop yet** |
| Security UX | Always-visible redaction copy naming key/token/secret/password; mono `pre` shows exact clipboard bytes; Copy then quiet “Copied!” (~2s) |
| Handlers | `navigator.clipboard.writeText` + textarea/`execCommand` fallback (Tauri webview) |
| Chrome | Hand-rolled scrim; manual Escape; `btn`/`btnPrimary`/`modalPanel` |
| Gallery | `GalleryPage` mounts same component for preview; title still **“Share preset”** — needs optional title **“Preview preset”** (D-07 / UI-SPEC) |

### `ImportPreferencesModal.tsx`

| Item | Detail |
|------|--------|
| Props | `{ open, onClose, onImport, variant?, pickPreferencesFile?, pickModelsFile?, pickSettingsFile? }` |
| Behavior | Web: browser `pickFile`; desktop: optional native pickers; requires prefs; optional models/settings; busy “Importing…”; errors `role="alert"` |
| Close | `handleClose` resets local file state then `onClose` |
| Do not change | `readPreferencesFromFile` / `readJsonConfigFromFile` / native pick signatures |

### `LoadPresetModal.tsx`

| Item | Detail |
|------|--------|
| Props | `{ open, onClose, onLoaded }` |
| Behavior | `fetchPresetIndex` on open; client filter; row load via `fetchPresetMarkdown` + `loadPreferencesFromText`; `backend.importPresetDialog()` for From file; web link to `/gallery` |
| Host | `onLoaded` → `applyLoadedPreset` (may `confirm` if dirty) |

### `SubmitPresetModal.tsx`

| Item | Detail |
|------|--------|
| Props | `{ open, prefs, onClose }` |
| Security | `cleanPrefs` → `serializePreferences` → `scanForLeakedSecrets` **before** OAuth; blocks with visible error listing leak patterns; manual PR + “copy share block” uses `buildShareablePreset` (redacted) |
| OAuth | `sessionStorage` pending submit + state; redirect GitHub authorize; exported `completeOAuthSubmit(code)` used by `OAuthCallbackPage` |
| Restyle only | Form fields → Input/Textarea; CTAs → Button; **do not** alter `startOAuth` / `completeOAuthSubmit` / API URLs |

**Security note (do not “fix” without product decision):** Submit path stores **non-redacted** cleaned markdown in `sessionStorage` and posts it after OAuth; Share path always redacts. Leak scan is the gate. Preserve both behaviors; only keep UI warnings visible (D-17–D-20).

### `Palette.tsx`

| Item | Detail |
|------|--------|
| Props | `{ open, onClose, onNavigate, sectionGroups? }` |
| Scoring | `scoreField` / `scoreSection`, `MAX_RESULTS = 50` — **keep** (D-10) |
| Keyboard | Local ↑/↓/Enter/Escape on input; rAF focus input on open; scroll cursored row |
| Chrome | Scrim + `backdrop-blur-sm` + `pt-24` + `modalPanel`; active row full accent fill (migrate to left-edge + soft wash per D-11) |

### Gallery preview — `GalleryPage.tsx`

- `previewOpen` / `previewContent`; builds content with `buildShareablePreset` after `loadPreferencesFromText`
- Mounts `<ShareModal open content onClose />` — add title prop for **Preview preset**

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `shadcn` CLI | `4.13.1` [VERIFIED: npm registry] | `add dialog command` into locked `components.json` | Project pin; base-nova only [CITED: components.json] |
| `@base-ui/react` | `1.6.0` [VERIFIED: package.json / npm] | Dialog headless primitive under base-nova | Default base; focus trap/restore [CITED: @base-ui/react/dialog Root props] |
| `cmdk` | `1.1.1` [VERIFIED: npm registry] | Command list/input primitive | Official command registry dependency [CITED: ui.shadcn.com/r/styles/base-nova/command.json] |
| React / react-dom | `^19.2.x` | UI | Existing |
| `class-variance-authority` / `clsx` / `tailwind-merge` / `cn` | existing | Class composition | Existing foundation |
| `lucide-react` | existing | Dialog close X (CLI rewrites IconPlaceholder) | components.json `iconLibrary: lucide` |
| Phase 2 `Button` / `Input` / `Textarea` | local `src/components/ui/*` | Overlay CTAs + form fields | WEB-06 language already locked |

### Supporting (install via CLI, not hand-picked extras)

| Library / file | Version / source | Purpose | When to Use |
|----------------|------------------|---------|-------------|
| `src/components/ui/dialog.tsx` | registry base-nova | Product modal shells | All OVL-01 modals |
| `src/components/ui/command.tsx` | registry base-nova | Palette list + CommandDialog | OVL-02 |
| `src/components/ui/input-group.tsx` | registry peer of command | CommandInput chrome | Only as command peer (FND-03) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Official `command` + cmdk | Hand-roll list inside Dialog only | Loses cmdk a11y/keyboard; more custom code — **reject** (D-09/D-24) |
| AlertDialog for Share/Import | Dialog | Wrong semantics for forms (D-02) |
| Nested Dialog for confirm dirty | Keep `window.confirm` | Nested Dialog forbidden (D-15); native confirm already works |
| Fork web-only modal files | Shared components + CSS isolation | Fork only if desktop isolation truly breaks (D-22) |
| Radix dialog style (`-b radix`) | base-nova Base UI | **Never mix** [VERIFIED: components.json style base-nova] |

**Installation (executor):**

```bash
# components.json already locked base-nova → web CSS
npx shadcn@4.13.1 add dialog command -y
# Pulls: dialog.tsx, command.tsx, input-group.tsx + npm install cmdk
# Do NOT: add alert-dialog | add --all | add sheet/drawer/popover
```

**Post-install style overrides (required for Mist Sky / UI-SPEC):**

| Primitive default | Override to |
|-------------------|-------------|
| Overlay `bg-black/10` + `backdrop-blur-xs` | `bg-black/60`, **no** product blur |
| Content `rounded-xl`, `sm:max-w-sm` | `rounded-none`; per-modal `max-w-md` / `max-w-lg` / `max-w-2xl` |
| CommandDialog `top-1/3` | Top-ish: preserve **`pt-24`** feel (D-09 / UI-SPEC) |
| Title `text-base` | Overlay title **14px / 600** (`text-sm font-semibold`) |
| Footer `rounded-b-xl bg-muted/50` | Linear: `rounded-none`, 1px border-t, pad per UI-SPEC |

**Version verification:** `shadcn@4.13.1`, `@base-ui/react@1.6.0`, `cmdk@1.1.1` checked via `npm view` this session (2026-07-21).

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `shadcn` | npm | CLI pin already in repo | ~6.6M/wk | github.com/shadcn-ui/ui | SUS (too-new heuristic) | **Approved** — already locked Phase 1; official CLI only via `npx shadcn@4.13.1` |
| `@base-ui/react` | npm | installed 1.6.0 | ~7.7M/wk | github.com/mui/base-ui | OK | Approved (existing) |
| `cmdk` | npm | since 2020; 1.1.1 | ~42M/wk | github.com/pacocoursey/cmdk | OK | Approved — **required peer of official command** [CITED: registry command.json] |
| `class-variance-authority` | npm | mature | ~59M/wk | joe-bell/cva | OK | Existing |
| `clsx` | npm | mature | ~112M/wk | lukeed/clsx | OK | Existing |
| `tailwind-merge` | npm | mature | ~75M/wk | dcastil/tailwind-merge | OK | Existing |
| `lucide-react` | npm | existing pin | ~95M/wk | lucide-icons/lucide | SUS (too-new heuristic) | Approved existing icon lib |

**Packages removed due to [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** `shadcn`, `lucide-react` — already project-approved; no new install of lucide required beyond existing. `cmdk` is **OK** and is the only new runtime dep expected from `add command`.

**Note:** `cmdk` declares optional peer usage of `@radix-ui/react-dialog` **inside the cmdk package**. Product Dialog shell remains **Base UI only**. Do not `import` Radix dialog in app code; do not switch `components.json` to radix. [ASSUMED: transitive Radix from cmdk is acceptable if tree-shaken/unused when using Base UI CommandDialog — verify bundle does not force Radix Dialog usage; cmdk core list/input does not require mounting Radix Dialog when using shadcn CommandDialog.]

*No packages recommended solely from training data without registry/registry-item confirmation.*

## Architecture Patterns

### System Architecture Diagram

```text
┌─ User input ─────────────────────────────────────────────────────────┐
│  Toolbar / Start CTAs / ⌘K / Gallery Preview / Share button          │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─ Host (ConfigApp | GalleryPage) ─────────────────────────────────────┐
│  openOverlay(id): close all product overlays → set one open flag     │  ← D-16
│  shareContent / previewContent / prefs / import callbacks            │
└───────┬───────────────┬───────────────┬───────────────┬──────────────┘
        ▼               ▼               ▼               ▼
   ShareModal      ImportModal     LoadPreset      SubmitPreset     Palette
   (Dialog)        (Dialog)        (Dialog)        (Dialog)         (CommandDialog)
        │               │               │               │               │
        │ copy          │ onImport      │ onLoaded      │ startOAuth    │ onNavigate
        ▼               ▼               ▼               ▼               ▼
  clipboard API   applyImported   applyLoaded    sessionStorage    setSection +
  (redacted       Workspace       Preset         → GitHub OAuth    pendingFocus
   content from   (may confirm)   (may confirm)  → completeOAuth
   buildShareable)                               Submit (API)
        │
        ▼
  preferencesCore: redactSensitive / buildShareablePreset / scanForLeakedSecrets
  ConfigBackend: importPresetDialog / buildShareablePreset / native picks
```

### Recommended Project Structure

```text
src/components/
├── ui/
│   ├── button.tsx              # existing
│   ├── input.tsx               # existing
│   ├── textarea.tsx            # existing
│   ├── dialog.tsx              # NEW — base-nova Dialog
│   ├── command.tsx             # NEW — base-nova Command
│   ├── input-group.tsx         # NEW — peer of command
│   ├── dialog.import.test.ts   # NEW optional
│   ├── command.import.test.ts  # NEW optional
│   └── input-group.import.test.ts
├── ShareModal.tsx              # restyle → Dialog + Button; optional title
├── ImportPreferencesModal.tsx  # restyle → Dialog + Button
├── LoadPresetModal.tsx         # restyle → Dialog + Input + Button
├── SubmitPresetModal.tsx       # restyle → Dialog + Input/Textarea + Button
├── Palette.tsx                 # restyle → CommandDialog + shouldFilter false
└── WebStartPanel.tsx           # openers only (already Mist Sky)

src/lib/
├── foundation.isolation.test.ts  # expand UI_ALLOWLIST; allow dialog/command/input-group
├── phase03.overlays.test.ts      # NEW source contracts (OVL-01/02/06-style)
└── preferencesCore.ts            # DO NOT change redaction/scan

src/ConfigApp.tsx                 # exclusivity helpers only — not full chrome restyle
src/pages/GalleryPage.tsx         # ShareModal title="Preview preset"
```

### Pattern 1: Controlled Dialog from `{ open, onClose }`

**What:** Keep product APIs; map to Base UI controlled root.  
**When:** Every product modal.

```tsx
// Source: @base-ui/react/dialog DialogRoot props + shadcn base-nova dialog registry
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ShareModal({
  open,
  content,
  onClose,
  title = "Share preset",
}: {
  open: boolean;
  content: string;
  onClose: () => void;
  title?: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-2xl"
      >
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Values under keys containing key, token, secret, or password are redacted…
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <pre className="whitespace-pre-wrap break-words rounded-none border border-border bg-background p-3 font-mono text-xs">
            {content}
          </pre>
        </div>
        <DialogFooter className="gap-2 border-t border-border px-5 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void copy()}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Notes:**

- Prefer **not** early-returning `if (!open) return null` once Dialog owns mount/animation — use `open` prop so focus restore works (D-14). [ASSUMED: Base UI still restores focus if children unmount via `if (!open)`; safer to keep Dialog mounted with `open={false}`.]
- Drop component-level `window.addEventListener("keydown", Escape)` when Dialog dismisses on Escape (D-13).
- Close control: DialogContent `showCloseButton` or explicit ghost icon Button with `aria-label="Close"` (40×40).

### Pattern 2: Command palette with custom scoring

**What:** Use CommandDialog chrome; **disable cmdk filter** so existing ranking stays authoritative.  
**When:** `Palette.tsx` only.

```tsx
// Source: cmdk README shouldFilter={false}; shadcn CommandDialog registry
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// results = pre-sorted via scoreField / scoreSection (unchanged)
<CommandDialog
  open={open}
  onOpenChange={(next) => {
    if (!next) onClose();
  }}
  title="Command palette"
  description="Jump to section or field"
  className="max-w-xl rounded-none p-0 top-[/* preserve pt-24 */]"
  showCloseButton={false}
>
  <Command shouldFilter={false} className="rounded-none">
    <CommandInput
      placeholder="Jump to section or field…"
      value={query}
      onValueChange={setQuery}
    />
    <CommandList className="max-h-96">
      <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
        No matches
      </CommandEmpty>
      {results.map((r) => (
        <CommandItem
          key={...}
          value={r.kind === "section" ? r.id : r.path}
          onSelect={() => pick(r)}
          className="min-h-10 rounded-none data-[selected=true]:border-l-[3px] data-[selected=true]:border-l-primary data-[selected=true]:bg-primary/10"
        >
          {/* section vs field row layout per UI-SPEC */}
        </CommandItem>
      ))}
    </CommandList>
    {/* footer kbd strip */}
  </Command>
</CommandDialog>
```

**Do not** reimplement arrow/enter if cmdk `CommandItem` selection covers it; keep `onNavigate` + close semantics. Reset query on open (existing effect).

### Pattern 3: Host exclusivity

```tsx
// ConfigApp — conceptual
const closeAllOverlays = useCallback(() => {
  setPaletteOpen(false);
  setShareOpen(false);
  setImportPrefsOpen(false);
  setLoadPresetOpen(false);
  setSubmitOpen(false);
}, []);

const openPalette = () => {
  closeAllOverlays();
  setPaletteOpen(true);
};
// same for share / import / load / submit
```

Gallery only has preview ShareModal — exclusivity vs ConfigApp not required on that route.

### Pattern 4: FND-03 allowlist expansion

```ts
// foundation.isolation.test.ts — target shape
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
  "input.tsx",
  "input.import.test.ts",
  "textarea.tsx",
  "textarea.import.test.ts",
  "dialog.tsx",
  "dialog.import.test.ts", // if added
  "command.tsx",
  "command.import.test.ts",
  "input-group.tsx",
  "input-group.import.test.ts",
]);

// Flip former forbid:
// Phase 1 forbade basenames dialog/command — Phase 3 requires them present
// Still forbid: card, select, sheet, drawer, popover, alert-dialog (unless installed)
```

### Anti-Patterns to Avoid

- **`npx shadcn add --all` or free Sheet/Card dump** — FND-03 / D-24  
- **Keeping hand-rolled Escape + Dialog Escape** — double-close / focus fights  
- **`if (!open) return null` without controlled Dialog** — breaks focus restore  
- **Letting cmdk re-filter/re-rank results** — violates D-10; always `shouldFilter={false}` when using custom scorers  
- **Changing `redactSensitive` / `buildShareablePreset` / `scanForLeakedSecrets`** — security regression  
- **Restyling Submit OAuth / sessionStorage keys / `completeOAuthSubmit`** — behavior rewrite  
- **Nested Dialog for dirty confirm** — use existing `confirm()`  
- **Solid red destructive CTAs / logo cyan / glass blur scrims** — Mist Sky locks  
- **Importing `@radix-ui/react-dialog` for product modals** — Base UI only  
- **Large ConfigApp chrome restyle** — WEB-04 Phase 4; only exclusivity + mount wiring  
- **Deleting `uiClasses` / `.gsd-btn` CSS** — still used by editor sections until Phase 4  

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap / scroll lock / ESC / restore | Custom listeners + tab loops | Base UI Dialog via shadcn `dialog` | Nested focus, screen readers, pointer dismiss already solved [CITED: DialogRoot.modal docs] |
| Command list keyboard + a11y | Custom roving tabindex | `cmdk` via shadcn `command` | Edge cases for IME, typeahead, disabled items |
| Modal portal stacking | Ad-hoc z-index wars | Dialog portal + single-open host policy | Prevents dual traps (D-16) |
| Redaction / secret patterns | Copy-paste new regex in UI | `preferencesCore` helpers | Dual TS/Rust mirror; tested |
| Button language | New CSS button classes | `@/components/ui/button` | WEB-06 consistency |
| File pickers on desktop | Custom file UI | Existing Tauri / `importPresetDialog` | D-23 |

**Key insight:** Phase 3 fails when teams re-skin by rewriting handlers or inventing a second focus system. Success is **primitive mount + class migration + host exclusivity + isolation allowlist**, with domain modules untouched.

## Common Pitfalls

### Pitfall 1: Registry defaults fight Mist Sky
**What goes wrong:** Soft `bg-black/10` + blur + `rounded-xl` ships to production overlays.  
**Why:** base-nova dialog/command defaults are not Mist Sky.  
**How to avoid:** Same wave as install: override Overlay/Content/CommandDialog classNames; add source tests forbidding `backdrop-blur` on product overlays.  
**Warning signs:** Visual UAT shows glass/blur; radius ≠ 0.

### Pitfall 2: cmdk reorders palette results
**What goes wrong:** Field-jump ranking changes; users miss expected hits.  
**Why:** cmdk default filter/sort runs on `CommandItem` values.  
**How to avoid:** `shouldFilter={false}`; map **pre-sorted** `results` only; keep `scoreField`/`scoreSection` pure functions.  
**Warning signs:** Empty query order differs from section list; tests on scoring snapshots fail.

### Pitfall 3: Nested / stacked focus traps
**What goes wrong:** ESC closes wrong layer; focus black hole when palette + modal both open.  
**Why:** Independent booleans + each Dialog traps focus.  
**How to avoid:** D-16 host exclusivity; never nest Dialog; leave Select for Phase 4.  
**Warning signs:** Two scrims; Tab cycles unexpectedly.

### Pitfall 4: Redaction / secret-scan UX regression
**What goes wrong:** Warning becomes tooltip-only or Copy skips review; leak errors hidden.  
**Why:** Restyle trims “verbose” copy.  
**How to avoid:** Lock copy strings in UI-SPEC/source tests; keep mono pre + visible soft-danger alerts.  
**Warning signs:** Share description missing key/token/secret/password words.

### Pitfall 5: Desktop isolation break (ISO-01)
**What goes wrong:** Desktop loads shadcn base layers or overlays unstyled (`bg-popover` undefined).  
**Why:** Shared overlay TSX imports `components/ui/*` semantic classes; desktop CSS has `gsd-*` only.  
**How to avoid:**  
1. Never import `shadcn/tailwind.css` into `index.desktop.css`.  
2. Prefer shared components (D-22).  
3. If dual-build visual check shows broken desktop overlays, add a **minimal desktop CSS variable bridge** mapping only overlay-needed semantics (`--background`, `--foreground`, `--popover`, `--primary`, `--border`, `--muted-foreground`, `--destructive`, `--ring`, `--input`, `--accent`, `--card`) onto existing `--gsd-*` — **not** a full Mist Sky desktop restyle.  
4. Dual gate: `npm run build` + `npm run build:web`.  
**Warning signs:** Desktop bundle contains `shadcn/tailwind`; isolation tests fail; unreadable desktop modals.

### Pitfall 6: FND-03 test still forbids dialog/command
**What goes wrong:** CI red after `shadcn add`.  
**Why:** Phase 1/2 isolation test forbids those basenames.  
**How to avoid:** Same PR as install: expand allowlist + require presence of dialog/command/input-group; keep forbidding card/select/sheet/drawer/popover/alert-dialog.  
**Warning signs:** `foundation.isolation.test.ts` fails on “forbidden primitive present: dialog”.

### Pitfall 7: Early unmount breaks focus restore
**What goes wrong:** Trigger not refocused after close (D-14 / OVL-03).  
**Why:** `if (!open) return null` removes Dialog before Base UI runs `finalFocus`.  
**How to avoid:** Controlled `open` with Dialog always composed; rely on `finalFocus` default.  
**Warning signs:** Keyboard users lose place after ESC.

### Pitfall 8: Submit busy flag never set true
**What goes wrong:** UI never shows “Submitting…” (pre-existing).  
**Why:** `startOAuth` navigates away without `setBusy(true)`.  
**How to avoid:** Restyle only; optional tiny fix only if in-scope and behavior-preserving — **default: leave logic**. Do not invent multi-step nested dialogs.

## Code Examples

### Controlled open + dismiss mapping

```tsx
// Source: node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts
// open?: boolean
// onOpenChange?: (open: boolean, eventDetails) => void
// modal?: boolean | 'trap-focus'  // default true = trap + scroll lock + outside pointer block
// disablePointerDismissal?: boolean // default false = backdrop click closes (D-04)

<Dialog
  open={open}
  onOpenChange={(next) => {
    if (!next) onClose();
  }}
  // modal default true — keep
>
  <DialogContent /* ... */ />
</Dialog>
```

### Focus hooks (discretion / edge cases)

```tsx
// Source: DialogPopup.d.ts — initialFocus / finalFocus
// Palette: focus search input on open (CommandInput autofocus or initialFocus ref)
// Load: search input autoFocus
// Default product dialogs: first tabbable / title OK
```

### Install + legitimacy (Wave 0)

```bash
npx shadcn@4.13.1 add dialog command -y
npm ls cmdk @base-ui/react
npm test -- src/lib/foundation.isolation.test.ts src/components/ui/
```

### Source-contract test sketch (Phase 2 style)

```ts
// src/lib/phase03.overlays.test.ts — Vitest node, no jsdom
const OVERLAYS = [
  "src/components/ShareModal.tsx",
  "src/components/ImportPreferencesModal.tsx",
  "src/components/LoadPresetModal.tsx",
  "src/components/SubmitPresetModal.tsx",
  "src/components/Palette.tsx",
] as const;

// Assert: imports from @/components/ui/dialog or command
// Assert: no btn / btnPrimary / modalPanel from uiClasses
// Assert: Share still mentions key|token|secret|password
// Assert: Submit still calls scanForLeakedSecrets and completeOAuthSubmit export exists
// Assert: Palette still defines scoreField/scoreSection and MAX_RESULTS = 50
// Assert: no backdrop-blur on product overlay class strings (optional)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-rolled fixed scrim + Escape | shadcn Dialog (Base UI) | Phase 3 | Focus trap/restore standardized |
| `uiClasses` btn/modalPanel on overlays | Button + Dialog tokens | Phase 3 | WEB-06 extends to overlays |
| Full accent fill palette rows | Left-edge primary + soft wash | Phase 3 (Mist Sky) | Matches Gallery/Wizard choice rows |
| Palette blur scrim | Flat `black/60` | Phase 3 D-03 | Linear grammar |
| Independent overlay flags | Exclusive single open | Phase 3 D-16 | Prevents dual traps |
| Radix-default shadcn (historical) | base-nova Base UI | Phase 1 lock | Do not mix Radix product primitives |

**Deprecated/outdated for this phase:**

- Product use of `modalPanel` / `btn` / `btnPrimary` on restyled overlays  
- Manual Escape listeners duplicating Dialog  
- Installing AlertDialog “just in case”  
- cmdk default filtering for this palette  

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Keeping Dialog mounted with `open={false}` is required for reliable focus restore (vs early `return null`) | Patterns / Pitfalls | May need explicit `finalFocus` refs if early unmount preferred |
| A2 | Minimal desktop CSS semantic-var bridge is acceptable if shared Dialog classes lack tokens on desktop | Pitfall 5 | May need web-only fork of overlays (heavier) |
| A3 | Transitive `@radix-ui/*` from `cmdk` package is OK if app Dialog remains Base UI | Package Audit | Bundle/policy may require documenting or isolating |
| A4 | No product AlertDialog needed — all dirty confirms stay `window.confirm` | OVL-01 / D-02 | If product wants in-app confirm, install alert-dialog + expand allowlist |
| A5 | CommandDialog className can express `pt-24` top-ish placement without forking command.tsx | OVL-02 | May need local wrapper around Dialog+Command instead of CommandDialog defaults |

**If planner needs user confirmation:** A2 (desktop bridge vs fork) is the only architectural fork risk; CONTEXT prefers shared components first.

## Open Questions

1. **Desktop semantic bridge vs fork**  
   - What we know: Shared overlays will import `components/ui/*`; desktop CSS lacks full shadcn tokens.  
   - What's unclear: How broken desktop modals look after class migration without a bridge.  
   - Recommendation: Implement shared restyle → dual visual smoke → add minimal var bridge only if needed (D-22).

2. **ShareModal title API**  
   - What we know: Gallery reuses ShareModal; UI-SPEC wants “Preview preset”.  
   - What's unclear: none material.  
   - Recommendation: Optional `title?: string` defaulting to “Share preset”; Gallery passes preview title. Optional `description` override if needed.

3. **Busy-on-Submit**  
   - What we know: `busy` state exists but OAuth navigates away.  
   - Recommendation: Do not redesign; label swap remains for future/non-nav paths.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | CLI / Vitest / builds | ✓ | v26.0.0 (engines 20+) | — |
| npm / npx | `shadcn add`, scripts | ✓ | 11.12.1 | — |
| `shadcn` package | pinned CLI | ✓ | 4.13.1 | — |
| `@base-ui/react` | Dialog | ✓ | 1.6.0 | — |
| `cmdk` | Command (after add) | ✗ until add | will be 1.1.1 | installed by CLI |
| Vitest | validation | ✓ | 4.x (`npm test`, 78 tests green) | — |
| Rust/Cargo | desktop build gate | ✓ | rustc 1.96 | — |
| Context7 MCP / ctx7 | docs | ✗ | — | Official registry JSON + installed `.d.ts` used |
| Browser DOM test env | component RTL | ✗ (vitest `environment: "node"`, include `*.test.ts` only) | — | Source-level contracts (Phase 2 pattern) |

**Missing dependencies with no fallback:** none for planning/execution of this phase.  
**Missing dependencies with fallback:** DOM/jsdom suite — use source contracts + dual builds instead of RTL unless planner explicitly adds jsdom (out of current test config).

## Validation Architecture

> `workflow.nyquist_validation` is **true** in `.planning/config.json` — section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (`vitest run`) |
| Config file | `vite.config.ts` → `test.environment: "node"`, `include: ["src/**/*.test.ts"]` |
| Quick run command | `npm test -- src/lib/foundation.isolation.test.ts src/lib/phase03.overlays.test.ts src/components/ui/` |
| Full suite command | `npm test` |
| Dual build gate | `npm run build:web && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| OVL-01 | Overlay files use Dialog + Button; no uiClasses btn language | unit/source | `npm test -- src/lib/phase03.overlays.test.ts` | ❌ Wave 0 |
| OVL-01 | Share redaction warning strings + mono review still present | unit/source | same | ❌ Wave 0 |
| OVL-01 | Submit still references `scanForLeakedSecrets` + exports `completeOAuthSubmit` | unit/source | same | ❌ Wave 0 |
| OVL-01 | Gallery preview uses ShareModal with Preview title | unit/source | `npm test -- src/pages/GalleryPage.source.test.ts` | ✅ extend |
| OVL-02 | Palette retains `scoreField`/`scoreSection`/`MAX_RESULTS = 50` | unit/source | phase03.overlays | ❌ Wave 0 |
| OVL-02 | Palette uses Command/Dialog; `shouldFilter={false}` present | unit/source | phase03.overlays | ❌ Wave 0 |
| OVL-03 | No hand-rolled Escape listeners on restyled modals (or only non-Dialog leftovers) | unit/source | phase03.overlays | ❌ Wave 0 |
| OVL-03 | ConfigApp exclusivity helper closes other overlays when opening one | unit/source | phase03 or ConfigApp.source.test | ❌ Wave 0 |
| FND-03 | Allowlist includes dialog/command/input-group; forbids card/sheet/select dump | unit | `npm test -- src/lib/foundation.isolation.test.ts` | ✅ update |
| ISO-01 | Desktop CSS still no `shadcn/tailwind` | unit | foundation.isolation | ✅ keep |
| SEC | `preferencesCore` redact/share tests still green | unit | `npm test -- src/lib/preferencesCore.test.ts` | ✅ |
| WEB-06 | Overlay CTAs use Button variants not btnPrimary | unit/source | phase03.overlays | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** quick run (isolation + phase03 + ui import tests)  
- **Per wave merge:** `npm test` + dual builds  
- **Phase gate:** Full suite green + dual builds + human UAT focus/ESC/redaction (ISO-04 prep)

### Wave 0 Gaps

- [ ] Update `src/lib/foundation.isolation.test.ts` allowlist + dialog/command presence assertions  
- [ ] Add `src/lib/phase03.overlays.test.ts` (OVL-01/02/03 source contracts)  
- [ ] Optional import-only tests: `dialog.import.test.ts`, `command.import.test.ts`, `input-group.import.test.ts`  
- [ ] Extend `GalleryPage.source.test.ts` for Preview title prop  
- [ ] Framework already installed — **no** Vitest install needed  
- [ ] After `shadcn add`, verify `cmdk` in package-lock and no unexpected ui files  

*(Existing 78 tests remain the regression net for preferencesCore / phase02 / foundation.)*

## Security Domain

> `security_enforcement` enabled (ASVS level 1).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | partial | GitHub OAuth for submit only — **do not restyle into client secret exposure**; secret stays server-side (`api/`) |
| V3 Session Management | partial | `sessionStorage` OAuth state + pending submit — preserve state equality check in `completeOAuthSubmit` |
| V4 Access Control | no | No multi-user ACL in overlays |
| V5 Input Validation | yes | Import parse errors surface as alerts; slugify on submit; file type filters on pickers |
| V6 Cryptography | no | No new crypto; clipboard is user-initiated |

### Known Threat Patterns for overlays / share / OAuth

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secrets in share clipboard | Information Disclosure | `buildShareablePreset` + always-visible redaction warning + review-before-copy UI (D-17–D-19) |
| Secrets in gallery PR body | Information Disclosure | `scanForLeakedSecrets` gate before OAuth; visible error (D-20); do not remove |
| OAuth CSRF | Spoofing | `gsd-oauth-state` vs URL `state` check in `completeOAuthSubmit` — preserve |
| OAuth code leakage in UI logs | Information Disclosure | Phase 2 OAuth page already forbids logging code — keep |
| Open redirect / API abuse | Elevation | Submit posts only to configured `SUBMIT_API_URL`; no handler redesign |
| XSS via preset markdown in mono pre | Tampering | React text children in `<pre>` (no `dangerouslySetInnerHTML`) — keep |
| Focus trap clickjack / background action | Tampering | Modal Dialog `modal={true}` default + exclusivity |
| Desktop keyring vs web key store | Information Disclosure | Out of phase; do not route API keys into share content |

### Security test anchors

- `preferencesCore.test.ts` — redact + share fence without raw secrets  
- phase03 source — Share warning keywords; Submit still calls `scanForLeakedSecrets`  
- Manual: copy share block and confirm redactions keys; submit blocked path with fake `sk-` pattern  

## Project Constraints (from CLAUDE.md)

Actionable directives the planner must honor:

- **Tech stack:** React + Vite + TypeScript; shadcn works with existing Tailwind 4; pin Base UI base-nova  
- **Behavior stability:** Preference serialization, dirty/save, download/import, gallery/wizard, redaction paths must keep working  
- **Platform boundary:** Web restyle must not regress desktop build/runtime; prefer web-scoped styles over forking business logic  
- **Scope discipline:** No drive-by backend refactors or feature expansion beyond restyle  
- **Security:** Share/redact/export paths must not regress secret handling  
- **Conventions:** Named exports; double quotes; 2-space; co-located `*.test.ts`; validators `string \| null`; no secrets in logs  
- **Architecture:** Shared `ConfigApp`; section/modals via props; `ConfigBackend` for I/O; dual YAML cores stay mirrored  
- **GSD workflow:** Plan via GSD; dual build verification  

## Sources

### Primary (HIGH confidence)

- Official registry items: `https://ui.shadcn.com/r/styles/base-nova/dialog.json`, `command.json`, `input-group.json` — component source, deps, peers  
- Installed types: `node_modules/@base-ui/react/dialog/root/DialogRoot.d.ts`, `popup/DialogPopup.d.ts` — `open`/`onOpenChange`/`modal`/`disablePointerDismissal`/`initialFocus`/`finalFocus`  
- `cmdk` README (pacocoursey/cmdk) — `shouldFilter={false}`, filter API  
- Repo artifacts: overlay components, `ConfigApp.tsx`, `GalleryPage.tsx`, `foundation.isolation.test.ts`, `preferencesCore.ts`, `components.json`, `package.json`, Phase 2 surfaces tests  
- `npm view` + `gsd-tools query package-legitimacy check` — versions and legitimacy  

### Secondary (MEDIUM confidence)

- Phase 1/2 RESEARCH.md patterns (isolation, allowlist, source contracts)  
- `.planning/phases/03-modals-palette-overlays/03-UI-SPEC.md` — visual/interaction contracts  
- Base UI public dialog docs page (HTML fetch; props confirmed via local `.d.ts`)  

### Tertiary (LOW confidence)

- A1–A5 assumptions above (focus unmount strategy, desktop bridge, transitive Radix policy)  

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack | HIGH | Registry JSON + npm view + installed Base UI types |
| Architecture / code map | HIGH | Full read of all overlay sources + hosts |
| Pitfalls | HIGH | Cross-checked isolation history + focus/redaction risks |
| Desktop bridge detail | MEDIUM | Needs dual-build visual confirmation after class migration |
| AlertDialog necessity | HIGH | No product confirm modal required; native confirm remains |

**Research date:** 2026-07-21  
**Valid until:** ~30 days (stable primitives; re-check if shadcn CLI pin changes)

---

## RESEARCH COMPLETE
