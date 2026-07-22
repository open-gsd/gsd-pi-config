# Phase 5: Hardening & Polish Gates - Context

**Gathered:** 2026-07-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the web UI redesign milestone by **purging residual non-shadcn chrome on web-only paths**, proving **domain/behavior stability**, running **behavior smoke gates**, and ensuring **a11y parity** — without product/IA rethink.

**In scope (ISO-02, ISO-03, ISO-04, ISO-05):**
- Residual web purge: Skills/Agents libraries, ApiKeys, CustomProviders, remaining ConfigApp web paths still on `uiClasses`/`gsd-btn`
- Migrate remaining web `gsd-*` color utilities to semantic tokens where needed for cohesion
- Delete web `.gsd-btn*` bridge CSS after zero web callers
- Desktop-only branches may keep `uiClasses` (desktop isolation)
- Automated regression: full unit suite + preferencesCore + phase0x contracts
- Human smoke matrix: import/draft, edit, download, share/redact, dirty/save, OAuth as applicable
- A11y checklist audit + fixes: labels, invalid states, keyboard, focus-visible rings, ≥40px hits

**Out of scope:**
- New features or IA changes
- Desktop visual redesign
- Playwright/E2E framework introduction
- Bundle size optimization as success criterion (defer unless trivial)
- axe-core CI gate (optional later)

</domain>

<decisions>
## Implementation Decisions

### Carried forward
- **D-00a:** Mist Sky + linear + radius 0 + Button/Dialog/Command/Form kit from Phases 1–4
- **D-00b:** No product/IA rethink (ISO-05)
- **D-00c:** Desktop visual isolation remains (ISO-01 complete; keep proving)
- **D-00d:** Domain logic stable (preferencesCore, backends, redaction)

### Residual web purge
- **D-01:** Purge **all web-visible surfaces** still on uiClasses btn language (libraries, ApiKeys, CustomProviders, update/install banners, project picker if web-shown)
- **D-02:** Delete **web `.gsd-btn*` CSS** after zero web callers; **desktop CSS untouched**
- **D-03:** **Desktop-only** ConfigApp branches may **keep uiClasses** via platform branching
- **D-04:** Migrate remaining web **`gsd-*` color utilities** to semantic tokens (`foreground`/`muted`/`primary`/`border`/etc.)

### Behavior smoke (ISO-03) + domain (ISO-02)
- **D-05:** Smoke matrix = **full product paths**: import/draft, edit, download, share/redact, dirty/save, OAuth submit as applicable
- **D-06:** Automation = **source/contract tests + full unit suite**; **no Playwright** this phase; **human UAT** for flow smoke
- **D-07:** **preferencesCore + full suite must stay green** (ISO-02 regression bar)
- **D-08:** Milestone done when **ISO-02–05 satisfied + human smoke approved**

### A11y parity (ISO-04)
- **D-09:** Audit = **fix known gaps + surface checklist** (not axe CI)
- **D-10:** Hit targets **≥40px** floor; fix violations found during purge/audit
- **D-11:** **Visible focus-visible** rings (Mist Sky primary ring)
- **D-12:** If a11y fix conflicts with pure cosmetics, **prefer a11y** (aria-label/structure) without IA change

### Claude's Discretion
- Exact order of residual files to convert
- Whether to add a thin `phase05.residual.test.ts` forbidding uiClasses imports on web sections
- Desktop smoke depth (glance vs full)
- Bundle size notes as non-blocking advisory only

</decisions>

<canonical_refs>
## Canonical References

### Product
- `.planning/ROADMAP.md` — Phase 5 goal, ISO-02–05
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `.planning/design/PALETTE.md`
- Prior phase CONTEXTs 01–04 and VERIFICATION docs

### Residual call sites (starting inventory)
- `src/ConfigApp.tsx` — still imports `btn`/`btnPrimary` (desktop update/project paths)
- `src/components/sections/AgentsLibrarySection.tsx`
- `src/components/sections/SkillsLibrarySection.tsx`
- `src/components/sections/ApiKeysSection.tsx`
- `src/components/sections/CustomProvidersSection.tsx`
- `src/lib/uiClasses.ts`
- `src/index.web.css` — `.gsd-btn*` bridge to remove after purge
- `src/index.desktop.css` — keep

### Tests / gates
- `src/lib/preferencesCore.test.ts`
- `src/lib/phase02.surfaces.test.ts`, `phase03.overlays.test.ts`, `phase04.forms.test.ts`
- `src/lib/foundation.isolation.test.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Residual pattern
- Web paths still mixed: libraries/ApiKeys use uiClasses + gsd-* colors
- ConfigApp desktop update install + project browse still use btnPrimary
- Web CSS still ships full .gsd-btn bridge (Phase 4 stopped requiring it)

### Established gates
- Source contract tests for phases 2–4
- Dual builds ISO-01
- Human UAT pattern from prior phases

</code_context>

<specifics>
## Specific Ideas

- Full residual purge before deleting web button CSS
- Semantic token migration for cohesion on library sections
- Human smoke matrix as formal UAT for milestone close
- Prefer a11y over pure visual when conflict

</specifics>

<deferred>
## Deferred Ideas

- Playwright E2E suite
- axe-core CI
- Desktop restyle
- Bundle code-splitting (App.web ~500kB+) unless free win
- New product features

</deferred>

<vision>
## Captured Vision

The redesign finishes clean: every web surface speaks Mist Sky/shadcn, dead gsd-btn bridge is gone, desktop still looks like itself, and we can trust the product still imports, edits, downloads, shares safely, and remains keyboard-accessible. No new product story—just a cohesive, stable close.

</vision>
