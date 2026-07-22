---
phase: 5
slug: hardening-polish-gates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 5 — Validation Strategy

> Seeded from `05-RESEARCH.md` Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- src/lib/phase05.residual.test.ts src/lib/preferencesCore.test.ts src/lib/foundation.isolation.test.ts` |
| **Full suite command** | `npm test` |
| **Dual build gate** | `npm run build:web && npm run build` |

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
| 05-W0 | 01 | 0 | ISO-05 | — | Residual contracts scaffold | unit | phase05.residual | ❌ W0 | ⬜ |
| 05-purge | 01–02 | 1–2 | ISO-05 | — | No web btn uiClasses | unit | phase05.residual | ❌ W0 | ⬜ |
| 05-css | 03 | 3 | ISO-05 | — | Web no .gsd-btn; desktop has | unit | residual + isolation | ❌ W0 | ⬜ |
| 05-iso02 | * | * | ISO-02 | T-05-SEC | preferencesCore green | unit | preferencesCore | ✅ | ⬜ |
| 05-iso03 | final | * | ISO-03 | — | Human smoke S1–S10 | manual | UAT | ❌ | ⬜ |
| 05-iso04 | final | * | ISO-04 | — | A11y checklist A1–A10 | manual | UAT | ❌ | ⬜ |

---

## Wave 0 Requirements

- [ ] Add `src/lib/phase05.residual.test.ts`
- [ ] Update foundation.isolation for post-purge web CSS asserts
- [ ] Framework install: none

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full smoke matrix S1–S10 | ISO-03 | E2E UX | See 05-UI-SPEC smoke table |
| A11y checklist A1–A10 | ISO-04 | Interaction | Labels, focus, 40px hits, keyboard |
| Residual sections cohesive | ISO-05 | Visual | Custom Providers + API Keys Mist Sky |

---

## Validation Sign-Off

- [ ] Automated residual gates green
- [ ] Dual builds green
- [ ] Human smoke + a11y approved
- [ ] `nyquist_compliant: true` after execution

**Approval:** pending
