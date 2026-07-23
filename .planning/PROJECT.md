# GSD Pi Config — Web UI Redesign

## What This Is

GSD Pi Config is the configuration manager for [GSD Pi](https://github.com/open-gsd/gsd-pi): a dual-platform app (Tauri desktop + browser web) that edits preferences, models, settings, skills, agents, and API keys. **v1.0** shipped a **visual restyle of the web surface** onto **shadcn/ui** with the **Mist Sky** palette — same product jobs and flows, a single modern component system on web.

## Core Value

Every web page uses a single shadcn-based design system so the site looks cohesive and UI work stays maintainable — without changing what users can do.

## Current State

**Shipped:** v1.0 Web UI Redesign (2026-07-23)

- Web build on shadcn (base-nova) + Mist Sky tokens; platform CSS split keeps desktop legacy look
- Shared chrome, gallery, wizard, OAuth, editor shell, overlays, form kit, residual sections restyled
- Domain logic, backends, share/redact, dual builds, and 173 unit tests stable
- Human UAT approved end-to-end (smoke + a11y); milestone audit passed 27/27

## Next Milestone Goals

Define via `/gsd-new-milestone`. Candidates from v1 deferred backlog:

- Desktop visual migration onto the same shadcn system
- Sonner (or equivalent) toast feedback; skeleton loaders; tooltip / Badge / Kbd polish
- Sheet-based mobile section navigation; density tokens
- Visual regression harness / screenshot set; optional Playwright or axe CI

## Requirements

### Validated

- ✓ Edit GSD preferences visually (sectioned editor over preferences domain) — existing
- ✓ Web cloud editor: import/create config, edit in session, download workspace files — existing
- ✓ Preset gallery and setup wizard (web) — existing
- ✓ OAuth / preset submit path (web API + callback) — existing
- ✓ Desktop: on-disk global/project scope, keychain keys, skills/agents libraries — existing
- ✓ Dual-platform React app with shared `ConfigApp` + platform backends — existing
- ✓ Tailwind CSS utility styling on current UI — existing
- ✓ Adopt shadcn/ui as the web design system (setup, tokens, primitives) — v1.0
- ✓ Restyle all web routes/pages onto shadcn (gallery, wizard, editor shell, OAuth, chrome) — v1.0
- ✓ Mist Sky visual direction (clean/linear; soft sky primary; not logo cyan) — v1.0
- ✓ Isolate restyle to web-only presentation layer (desktop keeps current styling) — v1.0
- ✓ Preserve existing web flows and feature behavior (no product rethink) — v1.0
- ✓ Keep preference domain logic, backends, and APIs behavior-stable through the UI swap — v1.0

### Active

_(Empty — next milestone requirements created by `/gsd-new-milestone`)_

### Out of Scope

- Product/UX rethink of information architecture or new major capabilities — visual restyle only (v1.0)
- Backend/API redesign (OAuth/submit handlers) except unavoidable UI wiring — security/behavior risk
- Full shadcn registry dump — maintainability noise (FND-03)
- Forking ConfigApp into separate web/desktop apps — duplicates state machines
- Greenfield rewrite outside the React web presentation layer
- Custom heavy brand/illustration system — prefer clean design-system tokens
- Desktop shadcn restyle as **v1.0** success criterion — deferred to a future milestone (may still share primitives)

## Context

**Codebase (post–v1.0):**
- Stack: React 19, TypeScript, Vite 8, Tailwind 4, Tauri 2 (desktop), Vercel serverless (web APIs)
- Web: Mist Sky + shadcn primitives under `src/components/ui/`; entry CSS `src/index.web.css`
- Desktop: legacy `src/index.desktop.css` + `uiClasses` button paths in `ConfigApp`
- Form kit: `FormControls.tsx` with `isWebPlatform()` presentation adapters
- Isolation: `foundation.isolation.test.ts` + phase residual contracts; dual `build` / `build:web`
- Tests: 173 Vitest unit/source contracts at milestone close

## Constraints

- **Tech stack**: Stay on React + Vite + TypeScript; shadcn/ui with Tailwind 4
- **Behavior stability**: Preference serialization, dirty/save, download/import, gallery/wizard paths must keep working
- **Platform boundary**: Prefer web-scoped presentation over forking business logic
- **Scope discipline**: No drive-by backend refactors beyond what UI work requires
- **Security**: Share/redact/export paths must not regress secret handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-only scope for v1.0 | User prioritizes “the site”; desktop can follow later | ✓ Good — ISO-01 held |
| Visual restyle, not UX/product rethink | Maintainability + look; keep proven flows | ✓ Good — ISO-05 |
| shadcn/ui as design system | Consistency and standard primitives | ✓ Good — FND-01–03 |
| Mist Sky custom palette (clean/linear + soft sky) | User rejected neutral + logo cyan | ✓ Good — locked |
| Web-only presentation layer vs shared restyle | Avoid forcing desktop restyle; reduce Tauri risk | ✓ Good — dual CSS |
| Done = all web pages on shadcn | Clear acceptance: gallery, wizard, editor, OAuth, chrome | ✓ Good — v1.0 shipped |
| base-nova / Base UI primitives | Align with current shadcn CLI stack | ✓ Good |
| FND-03 allowlist + isolation tests | Prevent registry dump; gate dual-platform CSS | ✓ Good |
| Human smoke/a11y; no Playwright/axe in v1.0 | D-06 / D-09 — unit + source contracts + UAT | ✓ Good for v1; revisit for v2 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-23 after v1.0 milestone*
