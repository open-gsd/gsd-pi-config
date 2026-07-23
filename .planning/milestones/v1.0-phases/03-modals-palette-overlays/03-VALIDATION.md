---
phase: 3
slug: modals-palette-overlays
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 3 — Validation Strategy

> Seeded from `03-RESEARCH.md` Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- src/lib/foundation.isolation.test.ts src/lib/phase03.overlays.test.ts src/components/ui/ src/lib/preferencesCore.test.ts` |
| **Full suite command** | `npm test` |
| **Dual build gate** | `npm run build:web && npm run build` |
| **Estimated runtime** | ~10–20s tests; ~30–60s dual builds |

---

## Sampling Rate

- **After every task commit:** Quick run
- **After every plan wave:** Full suite + dual builds
- **Before verify-work:** Full suite green + dual builds + human focus/redaction smoke
- **Max feedback latency:** ~60s

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-W0 | 01 | 0 | FND-03 | T-03-SC | Allowlist dialog/command | unit | foundation.isolation | ⬜ update | ⬜ |
| 03-primitives | 01 | 1 | OVL-01/02 | T-03-SC | Official CLI only | unit | ui import tests | ❌ W0 | ⬜ |
| 03-modals | 02 | 2 | OVL-01 | T-03-RED | Redaction strings + handlers | unit | phase03.overlays | ❌ W0 | ⬜ |
| 03-palette | 03 | 3 | OVL-02 | — | shouldFilter false; scoring | unit | phase03.overlays | ❌ W0 | ⬜ |
| 03-focus | 04 | 4 | OVL-03 | — | Exclusivity + no hand Escape | unit | phase03 / ConfigApp | ❌ W0 | ⬜ |
| SEC | * | * | — | T-03-SEC | preferencesCore green | unit | preferencesCore.test | ✅ | ⬜ |

---

## Wave 0 Requirements

- [ ] Update `src/lib/foundation.isolation.test.ts` for dialog/command/input-group allowlist
- [ ] Add `src/lib/phase03.overlays.test.ts` (OVL source contracts)
- [ ] Optional import-only tests for dialog/command peers
- [ ] Extend GalleryPage source test for Preview title
- [ ] Framework install: none

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Focus trap + restore | OVL-03 | Runtime a11y | Open Share, Tab cycle, ESC, focus returns to trigger |
| Exclusive overlay | OVL-03 | Integration | Open palette then modal (or reverse) — only one open |
| Share redaction review | OVL-01 | Security UX | Share with fake secrets; confirm redacted review + copy |
| Palette field-jump | OVL-02 | Keyboard UX | ⌘K, type field, Enter → section focus |
| Desktop visual ISO | ISO-01 | Platform | Desktop still legacy chrome |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 deps
- [ ] Sampling continuity
- [ ] Wave 0 covered
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` after execution

**Approval:** pending
