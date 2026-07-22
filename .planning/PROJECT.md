# GSD Pi Config — Web UI Redesign

## What This Is

GSD Pi Config is the configuration manager for [GSD Pi](https://github.com/open-gsd/gsd-pi): a dual-platform app (Tauri desktop + browser web) that edits preferences, models, settings, skills, agents, and API keys. This milestone is a **visual restyle of the web surface** onto **shadcn/ui** — same product jobs and flows, a consistent modern component system.

## Core Value

Every web page uses a single shadcn-based design system so the site looks cohesive and UI work stays maintainable — without changing what users can do.

## Requirements

### Validated

- ✓ Edit GSD preferences visually (sectioned editor over preferences domain) — existing
- ✓ Web cloud editor: import/create config, edit in session, download workspace files — existing
- ✓ Preset gallery and setup wizard (web) — existing
- ✓ OAuth / preset submit path (web API + callback) — existing
- ✓ Desktop: on-disk global/project scope, keychain keys, skills/agents libraries — existing
- ✓ Dual-platform React app with shared `ConfigApp` + platform backends — existing
- ✓ Tailwind CSS utility styling on current UI — existing

### Active

- [ ] Adopt shadcn/ui as the web design system (setup, tokens, primitives)
- [ ] Restyle all web routes/pages onto shadcn components: gallery, wizard, editor shell, OAuth callback, shared chrome
- [ ] Mist Sky visual direction (clean/linear hierarchy; soft sky primary; not logo cyan) — see `.planning/design/PALETTE.md`
- [ ] Isolate restyle to a **web-only presentation layer** so desktop can keep current styling this milestone
- [ ] Preserve existing web flows and feature behavior (no product rethink)
- [ ] Keep preference domain logic, backends, and APIs behavior-stable through the UI swap

### Out of Scope

- Desktop visual redesign — deferred; web-only layer this milestone
- Product/UX rethink of information architecture or new major capabilities — visual restyle only
- Backend/API rewrites (Tauri commands, Vercel handlers) except unavoidable wiring for UI
- Migrating desktop to shadcn in this milestone (may share primitives later if safe, not a success criterion)
- Greenfield rewrite of the app outside the React web presentation layer

## Context

**Codebase (mapped 2026-07-21):**
- Stack: React 19, TypeScript, Vite 8, Tailwind 4, Tauri 2 (desktop), Vercel serverless (web APIs)
- Web entry/routes: `src/App.web.tsx` — gallery, wizard, OAuth callback, config app
- Shared shell: `src/ConfigApp.tsx` + section editors under `src/components/`
- Platform split: `VITE_PLATFORM` → web vs desktop backends (`src/platform/`)
- Design debt relevant to this work: large shell/section files, dense form UI, mixed styling patterns

**User intent for this project init:**
- Redesign the **entire web site** with **shadcn/ui**
- **Visual restyle**, not a product rethink — keep flows/features
- Primary win: **consistency and maintainability** (one component system)
- Look: **clean shadcn defaults**
- Done: **all web pages** on shadcn
- Shared-code strategy: **web-only presentation layer** so desktop styling is not forced this milestone

## Constraints

- **Tech stack**: Stay on React + Vite + TypeScript; introduce shadcn/ui in a way that works with the existing Tailwind 4 setup
- **Behavior stability**: Preference serialization, dirty/save, download/import, gallery/wizard data paths must keep working
- **Platform boundary**: Web restyle must not regress desktop build/runtime; prefer web-scoped styles/components over forking business logic
- **Scope discipline**: No drive-by backend refactors or feature expansion beyond what the restyle requires
- **Security**: Share/redact/export paths must not regress secret handling while UI is rewired

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-only scope for this milestone | User prioritizes “the site”; desktop can follow later | — Pending |
| Visual restyle, not UX/product rethink | Maintainability + look; keep proven flows | — Pending |
| shadcn/ui as design system | Consistency and standard primitives for future UI work | — Pending |
| Mist Sky custom palette (clean/linear + soft sky) | User rejected neutral + logo colors; locked soft light accent system | Locked 2026-07-21 |
| Web-only presentation layer vs shared restyle | Avoid forcing desktop restyle; reduce risk to Tauri app | — Pending |
| Done = all web pages on shadcn | Clear acceptance: gallery, wizard, editor, OAuth, chrome | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-21 after initialization*
