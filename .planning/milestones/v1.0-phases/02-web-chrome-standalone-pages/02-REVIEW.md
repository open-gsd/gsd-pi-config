---
phase: 02-web-chrome-standalone-pages
reviewed: 2026-07-22T01:25:00Z
depth: deep
files_reviewed: 20
files_reviewed_list:
  - src/index.web.css
  - src/lib/foundation.isolation.test.ts
  - src/lib/phase02.surfaces.test.ts
  - src/components/ui/button.tsx
  - src/components/ui/button.import.test.ts
  - src/components/ui/input.tsx
  - src/components/ui/input.import.test.ts
  - src/components/ui/textarea.tsx
  - src/components/ui/textarea.import.test.ts
  - src/components/ThemeToggle.tsx
  - src/components/ThemeToggle.source.test.ts
  - src/components/WebShell.tsx
  - src/components/WebShell.source.test.ts
  - src/components/WebStartPanel.tsx
  - src/components/WebStartPanel.source.test.ts
  - src/pages/GalleryPage.tsx
  - src/pages/GalleryPage.source.test.ts
  - src/pages/WizardPage.tsx
  - src/pages/WizardPage.source.test.ts
  - src/pages/OAuthCallbackPage.tsx
findings:
  critical: 1
  warning: 7
  info: 4
  total: 12
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-07-22T01:25:00Z
**Depth:** deep
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Adversarial review of Phase 02 Mist Sky chrome + standalone page restyle (tokens, Button/Input/Textarea linear language, WebShell/ThemeToggle, Gallery/Wizard/WebStartPanel/OAuth, surface contracts).

Presentation isolation is largely intact: Phase 2 surfaces drop `uiClasses` button language, OAuth does not log the authorization code, React text nodes avoid XSS sinks, and Mist Sky / `--radius: 0` contracts hold. However, the restyle **re-shipped a broken gallery deep-link** on the start panel (always `/gallery/gallery` → SPA catch-all → `/`), and several edge paths (wizard skip meta, unvalidated gallery index fields, OAuth error-param handling, storage failures) remain correctness risks.

Security spot-check (requested): **no OAuth code logging**, **no `dangerouslySetInnerHTML` / `eval` on restyled surfaces**, WEB-06 surfaces free of `gsd-btn` / `uiClasses` btn imports. Remaining security notes are hygiene (code left in URL on failure) rather than injection.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Start-panel gallery link always resolves to `/gallery/gallery` (broken navigation)

**File:** `src/components/WebStartPanel.tsx:32`
**Severity:** BLOCKER
**Issue:** `galleryHref` is built as:

```ts
`${import.meta.env.BASE_URL}gallery`.replace(/\/?$/, "/gallery")
```

In JavaScript, `/\/?$/` always matches at end-of-string (optional `/` may be empty). `.replace` therefore **appends** `"/gallery"` to an already-correct path. With default `BASE_URL` `"/"`, the result is **`/gallery/gallery`**. Verified:

| BASE_URL | computed href |
|----------|----------------|
| `/` | `/gallery/gallery` |
| `/app/` | `/app/gallery/gallery` |

`App.web.tsx` has no `/gallery/gallery` route; `path="*"` redirects to `/`. The “browse the preset gallery” CTA therefore **never opens the gallery** — it full-navigates and lands back on the editor. Phase 2 restyled this panel and left the bug unfixed; source contracts assert copy only, not the href.

**Fix:** Prefer React Router (basename-aware) and delete the broken string math:

```tsx
import { Link } from "react-router-dom";

// ...
<p className="mt-6 text-xs text-muted-foreground">
  Or{" "}
  <Link to="/gallery" className="text-primary hover:underline">
    browse the preset gallery
  </Link>
</p>
```

If a raw `href` is required:

```ts
const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
const galleryHref = `${base}gallery`;
// "/" -> "/gallery"; "/app/" -> "/app/gallery"
```

Add a source or unit assertion that the href/to is exactly `/gallery` (or basename-prefixed once).

## Warnings

### WR-01: Wizard “Skip (blank)” does not clear draft meta

**File:** `src/pages/WizardPage.tsx:137-142`
**Severity:** WARNING
**Issue:** Skip writes an empty draft + workspace label but never calls `writeWebDraftMeta`. `SubmitPresetModal` reads `readWebDraftMeta()` for slug/title/description/source. After **Use preset** or a prior wizard run, Skip leaves stale meta in `localStorage` (`gsd-pi-config.web.meta`), so a later “blank” session can still submit under an old title/slug/sourcePresetSlug.

**Fix:**

```tsx
onClick={() => {
  void (async () => {
    try {
      await setWebDraft({});
      writeWebDraftMeta({});
      writeWebWorkspaceLabel("Blank configuration");
      navigate("/");
    } catch (e) {
      // surface error — see WR-03
    }
  })();
}}
```

### WR-02: Gallery search crashes on malformed catalog entries

**File:** `src/pages/GalleryPage.tsx:49-58`
**Severity:** WARNING
**Issue:** `fetchPresetIndex` casts JSON with no schema validation (`as PresetIndex`). Filter assumes every entry has string `title`/`description`/`slug` and array `tags`:

```ts
e.tags.some((t) => t.toLowerCase().includes(q))
```

Missing `tags` (or non-string fields) throws inside `useMemo` and can blank the gallery UI when a query is typed. Remote index is a trust boundary even for first-party repos (typos, partial publishes).

**Fix:** Normalize at load:

```ts
const index = await fetchPresetIndex();
setEntries(
  (index.presets ?? []).map((e) => ({
    slug: String(e.slug ?? ""),
    title: String(e.title ?? ""),
    description: String(e.description ?? ""),
    tags: Array.isArray(e.tags) ? e.tags.map(String) : [],
    author: String(e.author ?? ""),
    path: String(e.path ?? ""),
  })).filter((e) => e.slug && e.path),
);
```

And/or defensive optional chaining: `(e.tags ?? []).some(...)`.

### WR-03: Wizard create/skip swallow failures as unhandled rejections

**File:** `src/pages/WizardPage.tsx:33-45`, `137-142`
**Severity:** WARNING
**Issue:** `create()` and Skip invoke `await setWebDraft(...)` with no `try/catch`. Storage quota / backend errors become unhandled promise rejections; the user gets no inline error and may think navigation failed silently (create only navigates after await success, but the rejection is still noisy/unsurfaced).

**Fix:** Mirror Gallery’s pattern — local `error` state + `role="alert"`, wrap both async paths in `try/catch`, disable CTAs while busy.

### WR-04: OAuth callback ignores GitHub `error` query param

**File:** `src/pages/OAuthCallbackPage.tsx:15-20`
**Severity:** WARNING
**Issue:** On deny/cancel, GitHub redirects with `?error=access_denied&error_description=...` (no `code`). The page always sets `"Missing authorization code"`, which is wrong and unhelpful. `error_description` is user-facing OAuth UX; still render as text (React-escaped) — do not inject as HTML.

**Fix:**

```ts
const params = new URLSearchParams(window.location.search);
const oauthError = params.get("error");
const code = params.get("code");
if (oauthError) {
  setError(params.get("error_description") || oauthError);
  return;
}
if (!code) {
  setError("Missing authorization code");
  return;
}
```

### WR-05: Authorization code remains in the address bar on failure

**File:** `src/pages/OAuthCallbackPage.tsx:15-29`
**Severity:** WARNING
**Issue:** On exchange failure, the component sets error UI but never strips `?code=&state=` via `history.replaceState` / `navigate(..., { replace: true })`. The one-time code stays in history, screenshots, and shared URLs. (Success path does `navigate("/", { replace: true })` and is fine. No `console.*` of the code — good.)

**Fix:** After reading params (success or failure), replace the URL without the query:

```ts
const url = new URL(window.location.href);
url.search = "";
window.history.replaceState({}, "", url.pathname + url.hash);
```

Prefer doing this immediately after reading `code`/`state`, before the network call.

### WR-06: Active wizard choice rows change left border width (layout shift)

**File:** `src/pages/WizardPage.tsx:15-23`
**Severity:** WARNING
**Issue:** Idle rows use `border` (1px all sides). Active rows add `border-l-[3px] border-l-primary`, growing the left edge from 1px → 3px and shifting content. Prior `choiceBtn` styling only recolored the existing border.

**Fix:** Keep constant border width; use color/background only, e.g.:

```ts
active
  ? "border-l-[3px] border-l-primary border-y border-r border-border bg-primary/10 ..."
  : "border-l-[3px] border-l-transparent border-y border-r border-border ...";
```

(or always `border-l-2` and swap `border-l-primary` / `border-l-transparent`).

### WR-07: `--radius: 0` makes `--radius-sm` / `--radius-md` negative

**File:** `src/index.web.css:25-26`, `121-124`
**Severity:** WARNING
**Issue:** With `--radius: 0`:

```css
--radius-sm: calc(var(--radius) - 4px); /* -4px */
--radius-md: calc(var(--radius) - 2px); /* -2px */
```

Negative `border-radius` is invalid CSS and is ignored (falls back inconsistently). Phase 2 primitives force `rounded-none`, so impact is limited, but any `rounded-sm` / `rounded-md` utility (bridge chrome, future primitives) inherits broken tokens.

**Fix:** Clamp theme radii when product radius is 0:

```css
--radius-sm: var(--radius);
--radius-md: var(--radius);
--radius-lg: var(--radius);
--radius-xl: var(--radius);
```

## Info

### IN-01: ThemeToggle radiogroup is click-only (no arrow-key roving)

**File:** `src/components/ThemeToggle.tsx:17-39`
**Issue:** `role="radiogroup"` / `role="radio"` / `aria-checked` are present (good), but WAI-ARIA radio pattern expects arrow-key movement and typically roving `tabIndex`. Keyboard users must Tab through each option. Presentation restyle did not regress semantics vs a full radio implementation, but a11y is incomplete.
**Fix:** On `onKeyDown`, handle ArrowLeft/ArrowRight to call `setTheme` on the adjacent option; set `tabIndex={active ? 0 : -1}`.

### IN-02: Source-level tests cannot catch runtime href / data bugs

**File:** `src/components/WebStartPanel.source.test.ts`, `src/lib/phase02.surfaces.test.ts`
**Issue:** Contracts grep for labels, imports, and Mist Sky tokens. They green-pass while CR-01 ships. Useful for WEB-06 class language; insufficient for navigation and data integrity.
**Fix:** Add a focused unit test for gallery path construction and/or a shallow render test with MemoryRouter asserting `Link` `to="/gallery"`.

### IN-03: Redundant `rounded-none` / `min-h-10` on product mounts

**File:** `src/pages/GalleryPage.tsx`, `src/pages/WizardPage.tsx`, `src/components/WebStartPanel.tsx` (multiple CTA classNames)
**Issue:** Button/Input already bake `rounded-none` and `h-10`/`min-h-10` into CVA/base classes. Repeated overrides are harmless but noise.
**Fix:** Drop redundant classes unless overriding a non-default size.

### IN-04: OAuth `useEffect` can double-fire under React StrictMode (dev)

**File:** `src/pages/OAuthCallbackPage.tsx:15-30`, `src/main.tsx` StrictMode
**Issue:** Dev double-mount can invoke `completeOAuthSubmit` twice with the same one-time code (second fails). Production single mount is fine. Guard with an abort flag / `useRef` “started” latch if dev noise becomes painful.

---

### Security notes (requested focus)

| Check | Result |
|-------|--------|
| OAuth code logged | **Clean** — no `console.*` in `OAuthCallbackPage`; `completeOAuthSubmit` does not log code |
| OAuth state CSRF | **Clean** (pre-existing) — `state` compared to `sessionStorage` before exchange |
| XSS on gallery/wizard fields | **Clean** — React text children only; ShareModal preview is `{content}` in `<pre>` |
| WEB-06 `gsd-btn` / uiClasses btn on Phase 2 surfaces | **Clean** on reviewed surfaces; `phase02.surfaces.test.ts` enforces no `uiClasses` imports |
| Secret handling | Gallery preview still uses `buildShareablePreset` redaction path; not regressed by restyle |

### Positive observations

- WebShell external link keeps `rel="noopener noreferrer"` and uses `buttonVariants` (not nested `<Button><a>`).
- Theme dual-write authority left in `theme.ts` (presentation-only ThemeToggle).
- Linear Button language: `rounded-none`, soft destructive (`bg-destructive/10` + `text-destructive`), ≥40px default/sm.
- Gallery empty-state split on `query.trim()` matches WEB-07 intent.
- Desktop CSS not touched (ISO-01) per isolation tests.

---

_Reviewed: 2026-07-22T01:25:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
