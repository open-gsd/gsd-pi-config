---
status: passed
phase: 05-hardening-polish-gates
source: [05-UI-SPEC.md, 05-04-PLAN.md]
started: 2026-07-23T00:28:42Z
updated: 2026-07-23T00:29:30Z
---

# Phase 5 — Hardening & Polish Gates UAT

**Purpose:** Formal human smoke matrix (S1–S10) and a11y checklist (A1–A10) for milestone close per **D-05, D-06, D-08, D-09** and requirements **ISO-03 / ISO-04**. Automated bar (ISO-02) is dual builds + full unit suite; this document is the **end-of-phase human gate** (D-08: ISO-02–05 + human smoke approved).

**Status:** passed — approved 2026-07-23T03:32:29Z  
**How to run:** `npm run dev:web` → walk S1–S10 and A1–A10; mark Result; sign Approval when satisfied.

---

## Non-goals (explicit)

| Non-goal | Why |
|----------|-----|
| Playwright / E2E automation | D-06 deferred |
| axe-core CI | D-09 deferred |
| Full desktop UAT | S10 is **glance only** (isolation + not broken) |
| Product/IA changes | ISO-05 |
| Skills/Agents library web restyle | Desktop-only; not web success criteria |

---

## Automated bar (ISO-02) — pre-human evidence

| Gate | Command | Result (Plan 04) |
|------|---------|------------------|
| Full unit suite | `npm test` | **173 passed** (24 files) |
| preferencesCore + residual + isolation | `npx vitest run src/lib/preferencesCore.test.ts src/lib/phase05.residual.test.ts src/lib/foundation.isolation.test.ts` | **35 passed** |
| Web build | `npm run build:web` | **green** |
| Desktop frontend build | `npm run build` | **green** |

---

## Behavior smoke matrix (ISO-03) — S1–S10

Mark **Result** `pass` / `fail` and optional **Notes** after browser check.

| ID | Path | Pass looks like | Result | Notes |
|----|------|-----------------|--------|-------|
| S1 | Import / draft | Import modal opens; draft loads; shell coherent Mist Sky | ☑ pass / ☐ fail | |
| S2 | Edit preferences | Section switch; fields dirty; validators still fire | ☑ pass / ☐ fail | |
| S3 | Download workspace (web) | Download primary enabled when ready; files download; label states Saving…/Downloaded as Phase 4 | ☑ pass / ☐ fail | |
| S4 | Share / redact | Share modal; **secret scan warning path**; no secret leak in UI copy; no OAuth code logging | ☑ pass / ☐ fail | Security smoke: exercise scan warning without pasting production secrets |
| S5 | Dirty / save affordances | Dirty dots; Discard; desktop Save if glanced | ☑ pass / ☐ fail | |
| S6 | OAuth / submit (as applicable) | Submit + callback quiet status; back to editor | ☑ pass / ☐ fail | Skip only if env not configured; note in Notes |
| S7 | Residual sections | Custom Providers + API Keys: CTAs **Button** language; empty/error readable; **no** `gsd-btn` / legacy button-bridge chrome | ☑ pass / ☐ fail | |
| S8 | Gallery / wizard / start | Phase 2 surfaces still cohesive after residual CSS delete | ☑ pass / ☐ fail | Routes `/gallery`, `/new`, start panel |
| S9 | Palette ⌘K | Field jump + focus ring intact | ☑ pass / ☐ fail | |
| S10 | Desktop glance (discretion) | Desktop still **legacy chrome**; not broken; not full Mist Sky restyle | ☑ pass / ☐ fail | Isolation only — not full desktop UAT |

---

## Accessibility checklist (ISO-04) — A1–A10

Audit residual + prior restyled web surfaces. Prefer a11y over pure cosmetics if conflict (**D-12**).

| ID | Check | Acceptance | Result | Notes |
|----|-------|------------|--------|-------|
| A1 | Hit targets ≥40px | Buttons, nav items, theme radios, toolbar, residual key/provider actions | ☑ pass / ☐ fail | |
| A2 | Visible focus-visible | Mist Sky `--ring` (primary-tinted); never bare `outline-none` without ring replacement | ☑ pass / ☐ fail | |
| A3 | Labels | Visible field labels; search has accessible name; password fields labeled | ☑ pass / ☐ fail | |
| A4 | Invalid states | Field `data-invalid` + visible error text; residual collision text visible | ☑ pass / ☐ fail | |
| A5 | Keyboard | Tab shell → sidebar → main; residual buttons; modals/palette; ESC closes overlays | ☑ pass / ☐ fail | |
| A6 | Named controls | Icon-only/ambiguous controls have `aria-label` / visible text (e.g. Delete) | ☑ pass / ☐ fail | |
| A7 | Status messages | Error banners `role="alert"` preferred; export success quiet, not focus-trapping | ☑ pass / ☐ fail | |
| A8 | Contrast | Mist Sky pairs; soft destructive readable on dark/light | ☑ pass / ☐ fail | |
| A9 | Switch/toggle | `role="switch"` + `aria-checked` where used (FormControls) | ☑ pass / ☐ fail | |
| A10 | No keyboard trap | Residual panels do not trap without ESC/Tab exit | ☑ pass / ☐ fail | |

---

## Security smoke note (S4 / residual keys)

- Exercise share/redact **secret-scan warning** path; confirm warning appears without echoing secret values in banners or logs.
- Do **not** paste production API keys during UAT; use throwaway values if needed.
- Confirm clear-key confirm still presents before clear (ApiKeys residual).
- No OAuth authorization codes in UI copy or client logs.

---

## ISO-05 product stability (spot-check during smoke)

| Rule | Expectation | Result |
|------|-------------|--------|
| Routes | Same `/`, `/gallery`, `/new`, `/oauth/callback` | ☑ pass / ☐ fail |
| Section IA | Unchanged groups; Skills/Agents remain desktop-only | ☑ pass / ☐ fail |
| Capabilities | No feature add/remove this phase | ☑ pass / ☐ fail |

---

## Sign-off (D-08 milestone)

Human approver closes the redesign milestone when automated ISO-02 is green **and** this matrix is approved.

| Field | Value |
|-------|-------|
| Human approver | ________________ |
| Date | ________________ |
| ISO-02 (suite + dual builds + preferencesCore) satisfied | ☐ yes / ☐ no |
| ISO-03 (S1–S10 smoke) satisfied | ☐ yes / ☐ no |
| ISO-04 (A1–A10 a11y) satisfied | ☐ yes / ☐ no |
| ISO-05 (residual cohesion / no IA drift) satisfied | ☐ yes / ☐ no |
| Milestone ready to close (D-08) | ☐ yes / ☐ no |

**Approval notes:**

```
(pending)
```


## Approval

User reply: **approved** (2026-07-23T03:32:29Z)

D-08: ISO-02–05 + human smoke/a11y signed.
