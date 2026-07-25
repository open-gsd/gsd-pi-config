---
phase: 1
slug: foundation-isolation-theme-bridge
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-21
updated: 2026-07-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Map aligned to plans `01-01`, `01-02`, `01-03` (2026-07-21 plan-check revision).

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

- **After every task commit:** Run the plan task's `<automated>` command (or quick theme/`cn` suite once those files exist)
- **After every plan wave:** `npm test && npm run build:web && npm run build`
- **Before `/gsd-verify-work`:** Full suite green + manual theme matrix + desktop visual isolation
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | THM-02, THM-03, FND-01 | — | N/A | unit (RED first) | `npx vitest run src/lib/theme.test.ts src/lib/utils.test.ts` (expect fail until T2/T3) | ❌ W0 | ⬜ pending |
| 01-01-T2 | 01 | 1 | FND-01 | — | N/A | unit | `npx vitest run src/lib/utils.test.ts` + `npm test` | ❌ W0 | ⬜ pending |
| 01-01-T3 | 01 | 1 | THM-02, THM-03 | — | theme storage allowlist only | unit | `npx vitest run src/lib/theme.test.ts src/lib/utils.test.ts` + `npm test` | ❌ W0 | ⬜ pending |
| 01-02-T1 | 02 | 2 | FND-04, ISO-01 | T-isolation | desktop CSS no shadcn import | tsc + build | `npx tsc --noEmit` + `npm run build:web` + `npm run build` | ❌ | ⬜ pending |
| 01-02-T2 | 02 | 2 | THM-01, FND-04, ISO-01 | T-isolation | web tokens; desktop lacks | unit + build | `npx vitest run src/lib/foundation.isolation.test.ts` + full suite + both builds | ❌ | ⬜ pending |
| 01-03-T1 | 03 | 3 | FND-02 | supply-chain | official registry only | static | node assert `components.json` fields + isolation vitest | ❌ | ⬜ pending |
| 01-03-T2 | 03 | 3 | FND-02, FND-03 | high supply-chain | pin CLI + human legitimacy | human | package legitimacy checkpoint (no automated substitute) | N/A | ⬜ pending |
| 01-03-T3 | 03 | 3 | FND-01, FND-03, ISO-01 | supply-chain | Button-only allowlist | unit + build | button import vitest + full suite + both builds | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/theme.test.ts` — covers THM-02, THM-03 (`applyTheme` dual-write, `resolveTheme`) — plan **01** T1/T3
- [ ] `src/lib/utils.test.ts` — covers `cn` merge behavior (FND-01) — plan **01** T1/T2
- [ ] `src/lib/foundation.isolation.test.ts` — CSS/token isolation — plan **02** T2
- [ ] Optional `src/components/ui/button.import.test.ts` — import Button without render — plan **03** T3
- [ ] Framework: keep Vitest node; mock `document` for theme tests
- [ ] Do not expand `include` to `*.test.tsx` unless rendering tests are added later

*Existing `preferencesCore.test.ts` remains green; Phase 1 must not break it.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No-flash boot | THM-02 | Flash is visual | Web: set light theme, hard reload — no dark flash |
| Auto theme OS flip | THM-02/THM-03 | OS preference | Flip OS theme; tokens (and Button if smoke-mounted) update |
| Desktop visual isolation | ISO-01 | Visual regression | Desktop dev or screenshot compare — legacy gsd look intact |
| Bundle isolation | FND-04 / ISO-01 | Dist inspection | Web dist CSS includes semantic tokens; desktop dist does not pull shadcn base |
| Package legitimacy | FND-02 / FND-03 | Supply-chain judgment | Human checkpoint before/with `shadcn add button` (plan 03 T2) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies (except intentional human legitimacy gate)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter (post-execution)

**Approval:** pending (plan-check revision applied 2026-07-21)
