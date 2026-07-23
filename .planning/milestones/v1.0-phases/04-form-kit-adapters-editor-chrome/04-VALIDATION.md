---
phase: 4
slug: form-kit-adapters-editor-chrome
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 4 — Validation Strategy

> Seeded from `04-RESEARCH.md` Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- src/lib/foundation.isolation.test.ts src/lib/phase04.forms.test.ts src/components/ui/ src/lib/preferencesCore.test.ts` |
| **Full suite command** | `npm test` |
| **Dual build gate** | `npm run build:web && npm run build` |
| **Estimated runtime** | ~10–25s tests; ~30–60s dual builds |

---

## Sampling Rate

- **After every task commit:** Quick run
- **After every plan wave:** Full suite + dual builds
- **Before verify-work:** Full suite + dual builds + human form/chrome smoke
- **Max feedback latency:** ~60s

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-W0 | 01 | 0 | FND-03 | T-04-SC | Allowlist switch/select/checkbox/popover | unit | foundation.isolation | ⬜ update | ⬜ |
| 04-primitives | 01 | 1 | FRM-01 | T-04-SC | Official CLI only | unit | ui import tests | ❌ W0 | ⬜ |
| 04-forms | 02 | 2 | FRM-01–03 | — | data-field-path; Model* semantics | unit | phase04.forms | ❌ W0 | ⬜ |
| 04-shell | 03 | 3 | WEB-04, FRM-04 | — | Button toolbar; useDirty intact | unit | phase04.forms | ❌ W0 | ⬜ |
| SEC | * | * | — | T-04-SEC | preferencesCore green | unit | preferencesCore | ✅ | ⬜ |

---

## Wave 0 Requirements

- [ ] Update `src/lib/foundation.isolation.test.ts` allowlist for Phase 4 primitives
- [ ] Add `src/lib/phase04.forms.test.ts` source contracts
- [ ] Add import-only tests for switch/select/checkbox/popover
- [ ] Framework install: none

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web form Switch/Select feel | FRM-01 | Visual | Open a section; toggle switch; use selects |
| ModelPicker/Chain UX | FRM-03 | Product UX | Change models; reorder chain |
| Dirty Save/Download enablement | FRM-04 | Runtime | Edit field → Save/Download enables correctly |
| Sidebar active + dirty dots | WEB-04 | Visual | Navigate sections; dirty indicator |
| Desktop forms still legacy | ISO-01 | Platform | Desktop build/dev form chrome |

---

## Validation Sign-Off

- [ ] Automated verifies per task
- [ ] Sampling continuity
- [ ] Wave 0 complete
- [ ] `nyquist_compliant: true` after execution

**Approval:** pending
