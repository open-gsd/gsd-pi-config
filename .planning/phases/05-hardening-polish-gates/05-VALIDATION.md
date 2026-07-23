---
phase: 5
slug: hardening-polish-gates
status: automated-gates-green
nyquist_compliant: false
wave_0_complete: true
created: 2026-07-22
updated: 2026-07-23
---

# Phase 5 — Validation Strategy

> Seeded from `05-RESEARCH.md` Validation Architecture.  
> Automated gates advanced by Plan 04; **human smoke/a11y remain pending** — do **not** set `nyquist_compliant: true` until human UAT approved after execute-phase verification.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- src/lib/phase05.residual.test.ts src/lib/preferencesCore.test.ts src/lib/foundation.isolation.test.ts` |
| **Full suite command** | `npm test` |
| **Dual build gate** | `npm run build:web && npm run build` |
| **Human UAT artifact** | `05-UAT.md` (S1–S10 + A1–A10) |

---

## Sampling Rate

- **After every task commit:** Quick run (or full `npm test`)
- **After every plan wave:** Full suite
- **Phase gate:** Full suite + dual builds + human smoke approved
- **Max feedback latency:** ~60s

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-W0 | 01 | 0 | ISO-05 | — | Residual contracts scaffold | unit | phase05.residual | ✅ | ✅ done |
| 05-purge | 01–02 | 1–2 | ISO-05 | — | No web btn uiClasses | unit | phase05.residual | ✅ | ✅ done |
| 05-css | 03 | 3 | ISO-05 | — | Web no .gsd-btn; desktop has | unit | residual + isolation | ✅ | ✅ done |
| 05-iso02 | 04 | 4 | ISO-02 | T-05-SEC | preferencesCore + suite + dual builds green | unit + build | `npm test && npm run build:web && npm run build` | ✅ | ✅ done |
| 05-iso03 | 04 | 4 | ISO-03 | T-05-11 | Human smoke S1–S10 | manual | 05-UAT.md | ✅ | ⬜ pending human |
| 05-iso04 | 04 | 4 | ISO-04 | — | A11y checklist A1–A10 | manual | 05-UAT.md | ✅ | ⬜ pending human |

---

## Wave 0 Requirements

- [x] Add `src/lib/phase05.residual.test.ts`
- [x] Update foundation.isolation for post-purge web CSS asserts
- [x] Framework install: none

---

## Automated gate evidence (Plan 04 / 2026-07-23)

| Gate | Command | Result |
|------|---------|--------|
| Full unit suite | `npm test` | **173 passed** / 24 files |
| Focused ISO-02 | `npx vitest run src/lib/preferencesCore.test.ts src/lib/phase05.residual.test.ts src/lib/foundation.isolation.test.ts` | **35 passed** |
| Dual builds | `npm run build:web && npm run build` | **both green** |
| New packages / Playwright / axe | — | **none** (ISO-05 / deferred) |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Status |
|----------|-------------|------------|-------------------|--------|
| Full smoke matrix S1–S10 | ISO-03 | E2E UX | See `05-UAT.md` + UI-SPEC smoke table | ⬜ pending human |
| A11y checklist A1–A10 | ISO-04 | Interaction | Labels, focus, 40px hits, keyboard | ⬜ pending human |
| Residual sections cohesive | ISO-05 | Visual | Custom Providers + API Keys Mist Sky Button language | ⬜ pending human (S7) |

---

## Validation Sign-Off

- [x] Automated residual gates green (`phase05.residual` + isolation)
- [x] Dual builds green (`build:web` + `build`)
- [x] Full unit suite + preferencesCore green (ISO-02)
- [ ] Human smoke + a11y approved (`05-UAT.md` sign-off)
- [ ] `nyquist_compliant: true` **only after** human UAT approved post execute-phase verification

**Approval:** automated gates green; **human pending**
