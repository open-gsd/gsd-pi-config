# Phase 3: Modals, Palette & Overlays - Pattern Map

**Mapped:** 2026-07-21  
**Files analyzed:** 13  
**Analogs found:** 13 / 13  

Phase 3 is **presentation-only** on product overlays (OVL-01/02/03). Domain handlers (share copy/redaction, import file pipeline, load gallery/file, `startOAuth` / `completeOAuthSubmit`, palette `scoreField` / `scoreSection`) stay intact. Prefer **existing modal structure** (`{ open, onClose }`, header/body/footer) for product APIs, **Phase 2 Button/Input/Textarea + WEB-06** for CTAs/fields, **Phase 2 source-contract tests** for isolation/allowlist, and **official base-nova Dialog/Command** for chrome (install via CLI — not present yet).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/dialog.tsx` | component | request-response | `src/components/ui/button.tsx` (CLI Base UI + `cn`) | role-match (install) |
| `src/components/ui/command.tsx` | component | request-response | `src/components/ui/button.tsx` + registry command | role-match (install) |
| `src/components/ui/input-group.tsx` | component | request-response | command peer (registry only) | role-match (install peer) |
| `src/components/ShareModal.tsx` | component | request-response | self (structure) + Phase 2 Button language | exact (restyle) |
| `src/components/ImportPreferencesModal.tsx` | component | file-I/O + request-response | self + ShareModal chrome | exact (restyle) |
| `src/components/LoadPresetModal.tsx` | component | request-response + CRUD (catalog) | self + Phase 2 Input/list rows | exact (restyle) |
| `src/components/SubmitPresetModal.tsx` | component | request-response | self + Phase 2 Input/Textarea/Button | exact (restyle) |
| `src/components/Palette.tsx` | component | event-driven + request-response | self scoring + Command-in-Dialog (RESEARCH) | exact (restyle shell) |
| `src/ConfigApp.tsx` | component / host | event-driven | self open flags (exclusivity only) | exact (wire) |
| `src/pages/GalleryPage.tsx` | component / page | request-response | self ShareModal mount + title prop | exact (extend) |
| `src/lib/foundation.isolation.test.ts` | test | transform | self FND-03 allowlist | exact (extend) |
| `src/lib/phase03.overlays.test.ts` | test | transform | `src/lib/phase02.surfaces.test.ts` | role-match (new) |
| `src/components/ui/dialog.import.test.ts` (+ command/input-group) | test | transform | `src/components/ui/button.import.test.ts` | exact |

**Do not modify (behavior):** `src/lib/preferencesCore.ts` redaction/scan, `completeOAuthSubmit` / OAuth session keys, Tauri `importPresetDialog` / native pick signatures, `scoreField` / `scoreSection` / `MAX_RESULTS`, desktop CSS full restyle, `uiClasses.ts` (keep for Phase 4 editor consumers).

## Pattern Assignments

### `src/components/ui/dialog.tsx` / `command.tsx` / `input-group.tsx` (primitives, install)

**Analog:** `src/components/ui/button.tsx` + Phase 2 CLI walk + RESEARCH install

**Install only (D-24):**

```bash
npx shadcn@4.13.1 add dialog command -y
# Expected: dialog.tsx, command.tsx, input-group.tsx + npm cmdk
# Do NOT: alert-dialog | --all | sheet/drawer/popover/card/select
```

**CLI primitive shape** (copy conventions from Button):

```1:20:src/components/ui/button.tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
// ... data-slot, named export, no default export
```

**Post-install Mist Sky overrides (required — registry defaults fight D-00a/D-03):**

| Registry default | Override to |
|------------------|-------------|
| Overlay `bg-black/10` + blur | `bg-black/60`, **no** `backdrop-blur` |
| Content `rounded-xl` | `rounded-none` |
| Footer `rounded-b-xl bg-muted/50` | `rounded-none`, `border-t border-border` |
| Title size | `text-sm font-semibold` (14/600) |
| CommandDialog placement | top-ish `pt-24` feel (D-09) |

**Import-only test analog** (`button.import.test.ts` lines 1–39): export callable + class-string contracts; no DOM/jsdom.

---

### `src/components/ShareModal.tsx` (component, request-response)

**Analog:** self (handlers + layout) + Phase 2 Button + RESEARCH controlled Dialog

**Keep product API + handlers** (lines 7–55):

```7:55:src/components/ShareModal.tsx
interface ShareModalProps {
  open: boolean;
  content: string;
  onClose: () => void;
}
// + optional title?: string for Gallery preview (D-07)
// Keep: clipboard writeText + textarea execCommand fallback
// Keep: copied state ~2s "Copied!"
// Keep: redaction description with key/token/secret/password
```

**Replace chrome** (hand-rolled scrim + Escape + `btn`/`btnPrimary`/`modalPanel`):

```57:101:src/components/ShareModal.tsx
// FROM: fixed inset-0 + onClick backdrop + modalPanel + window Escape
// TO: controlled Dialog — drop early `if (!open) return null` once Dialog owns mount (D-14)
// TO: Button outline Cancel + Button default primary Copy
// TO: rounded-none mono pre; max-w-2xl max-h-[80vh]
```

**Target shell pattern** (from 03-RESEARCH Pattern 1 — planner/executor compose):

```tsx
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
  // ... copied + copy() unchanged ...
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

**Error / a11y:** Close control `aria-label="Close"` (40×40 ghost/icon). No toast system.

**Do not:** change redaction copy semantics; hide warning; use AlertDialog for Share.

---

### `src/components/ImportPreferencesModal.tsx` (component, file-I/O)

**Analog:** self (browse/import pipeline) + ShareModal Dialog anatomy

**Keep** props and domain (lines 11–174):

```11:21:src/components/ImportPreferencesModal.tsx
interface ImportPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: ImportedWorkspace) => void;
  variant?: "web" | "desktop";
  pickPreferencesFile?: () => Promise<ImportedWorkspace | null>;
  pickModelsFile?: () => Promise<... | null>;
  pickSettingsFile?: () => Promise<... | null>;
}
```

**Keep:** `handleClose` → `reset()` then `onClose`; `readPreferencesFromFile` / `readJsonConfigFromFile` / `pickFile`; native pick hooks; busy “Importing…”; `role="alert"` errors; primary disabled until prefs present.

**Chrome today** (replace):

```176:207:src/components/ImportPreferencesModal.tsx
// Manual Escape + if (!open) return null + fixed scrim + modalPanel + btn/btnPrimary
// Already has role="dialog" aria-modal — Dialog primitive supersedes
```

**Restyle mapping:**

| Piece | Pattern |
|-------|---------|
| Shell | Dialog `max-w-md`, header/body/footer per UI-SPEC |
| Browse | `Button variant="outline"` |
| Primary | `Button` default — web “Import into editor” / desktop “Import into workspace” |
| Errors | `text-xs text-destructive` + `role="alert"` |
| Tokens | `border-border`, `text-muted-foreground` (not `gsd-*` on restyled surface) |

**Do not:** change native pick signatures; nest Dialog for dirty confirm (host `window.confirm` stays).

---

### `src/components/LoadPresetModal.tsx` (component, catalog CRUD)

**Analog:** self + `Input` + Button + Mist Sky choice-row grammar (Phase 2 gallery rows)

**Keep** (lines 28–108): `fetchPresetIndex` / `fetchPresetMarkdown` / `loadPreferencesFromText` / `backend.importPresetDialog` / `onLoaded` + close.

**Chrome + list today** (restyle):

```109:221:src/components/LoadPresetModal.tsx
// max-w-lg max-h-[85vh]; search input; From file…; linear rows; gallery Link; Cancel
```

**Restyle mapping:**

| Piece | Pattern |
|-------|---------|
| Shell | Dialog `max-w-lg`, `max-h-[85vh]`, scroll body |
| Search | `@/components/ui/input` — placeholder **Search presets…**; `autoFocus` |
| From file | `Button variant="outline"` |
| Rows | Full-width linear; `rounded-none`; min-h-10; active/focus **left primary edge + soft wash** (drop `active:scale-[0.96]`) |
| Tags | Quiet 12px chips, 1px border, no primary fill |
| Errors | soft danger `role="alert"` |
| Footer link | primary text link **Browse full gallery** (web) |
| Cancel | outline Button |

**Do not:** change `importPresetDialog` or load ranking/filter logic beyond presentation.

---

### `src/components/SubmitPresetModal.tsx` (component, request-response)

**Analog:** self OAuth path + Phase 2 Input/Textarea/Button

**Keep security + OAuth** (lines 71–103, export ~227):

```71:103:src/components/SubmitPresetModal.tsx
const startOAuth = async () => {
  // resolveGitHubClientId; cleanPrefs → serializePreferences → scanForLeakedSecrets
  // block with setError listing leaks; sessionStorage gsd-oauth-state + pending submit
  // window.location.href GitHub authorize
};
// export async function completeOAuthSubmit(code: string) — UNCHANGED
```

**Restyle form chrome only:**

| Piece | Pattern |
|-------|---------|
| Shell | Dialog `max-w-lg` |
| Slug/Title | `Input` + visible 12px muted labels |
| Description | `Textarea` rows≈2 + label |
| Primary | Button default **Sign in with GitHub** / **Done** |
| Secondary | outline **Cancel** |
| Secret block | visible soft-danger `role="alert"` — never tooltip-only |
| Manual PR | primary text links + `buildShareablePreset` copy path preserved |

**Do not:** restyle into changing `SUBMIT_API_URL`, sessionStorage keys, leak scan gate, or `completeOAuthSubmit`.

---

### `src/components/Palette.tsx` (component, event-driven)

**Analog:** self scoring (D-10) + RESEARCH CommandDialog with `shouldFilter={false}`

**Keep pure scoring + navigate** (lines 32–140):

```32:72:src/components/Palette.tsx
const MAX_RESULTS = 50;
function scoreField(...) { ... }
function scoreSection(...) { ... }
// results useMemo: sections + fields, sort by score, slice MAX_RESULTS
// pick → onNavigate(section | section+path) then onClose
// open effect: reset query + cursor; focus input
```

**Replace shell** (lines 166–241):

```166:174:src/components/Palette.tsx
// FROM: fixed inset-0 pt-24 backdrop-blur-sm + modalPanel + custom ↑↓/Enter on input
// TO: CommandDialog / Command + CommandInput + CommandList + CommandItem
// shouldFilter={false} — pre-sorted results only (D-10)
// active row: left border primary 2–3px + bg-primary/10 — not full accent fill only
// drop backdrop-blur; scrim black/60; rounded-none; max-w-xl; list max-h-96
// empty: "No matches" text-xs muted centered
// footer kbd strip: 12px muted (not text-[10px])
```

**Target Command pattern** (03-RESEARCH Pattern 2):

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// results = existing useMemo scorers — unchanged
<CommandDialog
  open={open}
  onOpenChange={(next) => {
    if (!next) onClose();
  }}
  title="Command palette"
  description="Jump to section or field"
  className="max-w-xl rounded-none p-0 /* top-ish / pt-24 feel */"
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
          key={r.kind === "section" ? `s:${r.id}` : `f:${r.path}`}
          value={r.kind === "section" ? r.id : r.path}
          onSelect={() => pick(r)}
          className="min-h-10 rounded-none data-[selected=true]:border-l-[3px] data-[selected=true]:border-l-primary data-[selected=true]:bg-primary/10"
        >
          {/* section vs field layout per UI-SPEC */}
        </CommandItem>
      ))}
    </CommandList>
    {/* footer kbd + result count */}
  </Command>
</CommandDialog>
```

**Keyboard:** Prefer cmdk selection over hand-rolled arrow handlers when CommandItem covers it; preserve Escape via Dialog. Drop redundant window Escape if Dialog owns dismiss (D-13).

**Do not:** let cmdk re-filter/re-rank; change `MAX_RESULTS` or scorer thresholds.

---

### `src/ConfigApp.tsx` (host exclusivity only)

**Analog:** self open flags (lines 117–119, 269, 382, 654–689)

**Current gap (D-16):** independent booleans — palette and modals can stack.

**Pattern** (03-RESEARCH Pattern 3):

```tsx
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
// Mirror for share / import / load / submit openers (toolbar, WebStartPanel, shortcuts)
```

**Keep mount wiring** (component APIs unchanged):

```654:689:src/ConfigApp.tsx
<Palette open={paletteOpen} onClose={...} onNavigate={...} />
<ShareModal open={shareOpen} content={shareContent} onClose={...} />
<ImportPreferencesModal ... />
<LoadPresetModal ... />
{isWeb && <SubmitPresetModal ... />}
```

**Do not:** full ConfigApp chrome restyle (WEB-04 / Phase 4). Dirty confirms stay `window.confirm`.

**Shortcut path:** `useShortcuts` / `setPaletteOpen(true)` (~line 500) must call exclusivity opener, not raw true while modals open.

---

### `src/pages/GalleryPage.tsx` (preview title)

**Analog:** self ShareModal mount

```99:103:src/pages/GalleryPage.tsx
<ShareModal
  open={previewOpen}
  content={previewContent}
  onClose={() => setPreviewOpen(false)}
/>
```

**Change:** pass `title="Preview preset"` once ShareModal accepts optional `title` (D-07 / UI-SPEC). Keep `buildShareablePreset` content path.

Gallery-only route — exclusivity vs ConfigApp not required.

---

### `src/lib/foundation.isolation.test.ts` (FND-03 expand)

**Analog:** self allowlist (lines 15–23, 190–213)

**Current:**

```15:23:src/lib/foundation.isolation.test.ts
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
  "input.tsx",
  "input.import.test.ts",
  "textarea.tsx",
  "textarea.import.test.ts",
]);
```

**Phase 3 target:**

```ts
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
```

**Flip forbid test** (lines 202–212): **require** presence of `dialog.tsx` / `command.tsx` / `input-group.tsx`; still forbid `card`, `select`, `sheet`, `drawer`, `popover`, `alert-dialog` (unless product confirm added — not required).

**Keep:** desktop isolation (no `shadcn/tailwind` in `index.desktop.css`); `components.json` base-nova lock; Button no `@radix-ui/`.

---

### `src/lib/phase03.overlays.test.ts` (new source contracts)

**Analog:** `src/lib/phase02.surfaces.test.ts` (full file pattern)

```13:80:src/lib/phase02.surfaces.test.ts
const SURFACE_FILES = [ /* web chrome paths */ ] as const;
const FORBIDDEN_IMPORT_SYMBOLS = ["btn", "btnPrimary", ...] as const;
// readFileSync + import line parse for uiClasses button language
// expect no uiClasses import on restyled surfaces
```

**Phase 3 sketch:**

```ts
const OVERLAYS = [
  "src/components/ShareModal.tsx",
  "src/components/ImportPreferencesModal.tsx",
  "src/components/LoadPresetModal.tsx",
  "src/components/SubmitPresetModal.tsx",
  "src/components/Palette.tsx",
] as const;

// Assert: imports @/components/ui/dialog and/or command
// Assert: no btn / btnPrimary / modalPanel from uiClasses
// Assert: Share still mentions key|token|secret|password
// Assert: Submit still calls scanForLeakedSecrets; completeOAuthSubmit export exists
// Assert: Palette still defines scoreField/scoreSection and MAX_RESULTS = 50
// Assert: shouldFilter={false} present in Palette
// Assert: no backdrop-blur on product overlay class strings (optional)
// Assert: no hand-rolled window Escape on Dialog-owned modals (or only non-Dialog leftovers)
// ConfigApp: exclusivity helper / close-all pattern present
```

**Vitest:** `environment: "node"`, `*.test.ts` only — source contracts, no RTL.

---

### Import-only tests for new primitives

**Analog:** `src/components/ui/button.import.test.ts`

```7:18:src/components/ui/button.import.test.ts
describe("shadcn Button import (FND-01 / FND-03)", () => {
  it("exports a callable Button component", () => {
    expect(typeof Button === "function" || typeof Button === "object").toBe(true);
  });
  // ...
});
```

Mirror for `dialog` / `command` / `input-group`: import exports without mounting DOM; optional class-string checks for `rounded-none` / scrim if exposed via exported class helpers.

---

## Shared Patterns

### Controlled Dialog from `{ open, onClose }`

**Source:** 03-RESEARCH Pattern 1 + Base UI DialogRoot  
**Apply to:** Share, Import, Load, Submit (+ Gallery preview via Share)

```tsx
<Dialog
  open={open}
  onOpenChange={(next) => {
    if (!next) onClose();
  }}
>
  <DialogContent className="... rounded-none ..." showCloseButton>
    ...
  </DialogContent>
</Dialog>
```

- Prefer **mounted** Dialog with `open={false}` over early `return null` for focus restore (D-14 / A1).
- Drop component-level `window.addEventListener("keydown", Escape)` when Dialog dismisses on Escape (D-13).
- Backdrop dismiss default on (D-04); `modal` default true.

### Phase 2 Button language (WEB-06)

**Source:** `src/components/ui/button.tsx`, `WebStartPanel.tsx` import style  
**Apply to:** All overlay CTAs

```tsx
import { Button } from "@/components/ui/button";
// primary: <Button type="button">…</Button>  (variant default)
// secondary: <Button type="button" variant="outline">Cancel</Button>
// close: <Button type="button" variant="ghost" size="icon" aria-label="Close">
```

**Forbidden on restyled overlays:** `btn`, `btnPrimary`, `modalPanel` from `uiClasses`.

### Input / Textarea fields

**Source:** `src/components/ui/input.tsx`, `textarea.tsx`  
**Apply to:** Load search, Submit form, CommandInput peer

```1:20:src/components/ui/input.tsx
// h-10 min-h-10 rounded-none border-input — already Mist Sky Phase 2
```

### Mist Sky / linear chrome

**Source:** 03-UI-SPEC + Phase 2 tokens in `index.web.css`  
**Apply to:** All product overlays

| Rule | Value |
|------|-------|
| Radius | `rounded-none` / `--radius: 0` |
| Scrim | `bg-black/60` |
| Blur | none on product overlays |
| Active list | left 2–3px primary + soft wash |
| Type | title 14/600; meta 12 muted; no `text-[10px]` on restyled surfaces |
| Accent | no logo cyan/purple |

### Host exclusivity (D-16)

**Source:** ConfigApp open flags  
**Apply to:** ConfigApp openers + ⌘K shortcut  

Close all product overlays before opening one. Gallery preview is route-local.

### FND-03 + dual-build isolation

**Source:** `foundation.isolation.test.ts`  
**Apply to:** Wave 0 install PR  

Expand allowlist; require dialog/command/input-group; forbid registry dump; never import `shadcn/tailwind` into desktop CSS. If shared Dialog classnames lack tokens on desktop, **minimal semantic CSS var bridge only** (D-22) — not full desktop Mist Sky restyle.

### Security UX (Share / Submit)

**Source:** ShareModal + SubmitPresetModal + `preferencesCore`  
**Apply to:** Share/preview + Submit restyle  

- Always-visible key/token/secret/password language  
- Mono review exact bytes before copy  
- Submit: `scanForLeakedSecrets` visible block; do not reimplement redaction in UI  

### Error presentation

**Source:** Import/Load/Submit existing patterns + Phase 2 OAuth page  

```tsx
// Prefer: role="alert" + text-xs text-destructive / muted-foreground
// setError(String(e)) — no console.log of secrets or OAuth codes
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All targets have self or Phase 2 / RESEARCH analogs. **Dialog/Command source files do not exist yet** — install from official registry; treat Button as structural analog. |

## Anti-patterns (do not copy)

| Legacy pattern | Location | Replace with |
|----------------|----------|--------------|
| `fixed inset-0` + manual Escape | all modals + Palette | Dialog / CommandDialog |
| `if (!open) return null` without controlled Dialog | all modals | `open` prop on Dialog root |
| `btn` / `btnPrimary` / `modalPanel` | overlays | Button + Dialog tokens |
| `backdrop-blur-sm` palette scrim | Palette.tsx:168 | flat `black/60` |
| Full accent fill active rows | Palette active classes | left edge + soft wash |
| `active:scale-[0.96]` list rows | Load / Palette | none (linear grammar) |
| Independent overlay flags | ConfigApp | closeAll then open one |
| cmdk default filter | (after install) | `shouldFilter={false}` |
| AlertDialog for forms | — | Dialog only (D-02) |
| `@radix-ui/react-dialog` product import | — | Base UI only |

## Metadata

**Analog search scope:**  
`src/components/*Modal*.tsx`, `Palette.tsx`, `ui/*`, `ConfigApp.tsx`, `pages/GalleryPage.tsx`, `lib/foundation.isolation.test.ts`, `lib/phase02.surfaces.test.ts`, `.planning/phases/02-*/02-PATTERNS.md`, `03-RESEARCH.md`, `03-UI-SPEC.md`, `components.json`

**Files scanned:** ~20 source/test files + Phase 2 pattern map  
**Pattern extraction date:** 2026-07-21  
**CLI pin:** `shadcn@4.13.1`, style `base-nova`, CSS `src/index.web.css`
