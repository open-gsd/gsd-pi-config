---
phase: 1
slug: foundation-isolation-theme-bridge
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^4.0.18` |
| **Config file** | `vite.config.ts` → `test: { environment: "node", include: ["src/**/*.test.ts"] }` |
| **Quick run command** | `npx vitest run src/lib/theme.test.ts src/lib/utils.test.ts` |
| **Full suite command** | `npm test && npm run build:web && npm run build` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick unit tests for theme/`cn` once files exist
- **After every plan wave:** `npm test && npm run build:web && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green + manual theme matrix
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | FND-01 | — | N/A | unit | `npx vitest run src/lib/utils.test.ts` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | FND-02 | — | N/A | static | assert `components.json` fields | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | FND-03 | — | N/A | static | ui file allowlist | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | FND-04 | — | N/A | static | web CSS has tokens; desktop lacks | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | THM-01 | — | N/A | static | semantic tokens in `index.web.css` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | THM-02 | — | N/A | unit | `npx vitest run src/lib/theme.test.ts` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | THM-03 | — | N/A | unit | dual-write `data-theme` + `.dark` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ISO-01 | — | N/A | build + static | `npm run build` + desktop CSS isolation | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/theme.test.ts` — covers THM-02, THM-03 (`applyTheme` dual-write, `resolveTheme`)
- [ ] `src/lib/utils.test.ts` — covers `cn` merge behavior (FND-01)
- [ ] Optional `src/components/ui/button.import.test.ts` — import Button without render
- [ ] Optional static assertions for CSS split / `components.json` allowlist
- [ ] Framework: keep Vitest node; mock `document` for theme tests
- [ ] Do not expand `include` to `*.test.tsx` unless rendering tests are added later

*Existing `preferencesCore.test.ts` remains green; Phase 1 must not break it.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No-flash boot | THM-02 | Flash is visual | Web: set light theme, hard reload — no dark flash |
| Auto theme OS flip | THM-02/THM-03 | OS preference | Flip OS theme; both GSD chrome tokens and shadcn Button (if mounted) update |
| Desktop visual isolation | ISO-01 | Visual regression | Desktop dev or screenshot compare — legacy gsd look intact |
| Bundle isolation | FND-04 / ISO-01 | Dist inspection | Web dist CSS includes semantic tokens; desktop dist does not pull shadcn base |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
