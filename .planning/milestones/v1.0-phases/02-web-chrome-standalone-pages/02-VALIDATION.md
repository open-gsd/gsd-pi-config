---
phase: 2
slug: web-chrome-standalone-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `02-RESEARCH.md` Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (`test.environment: "node"`, `include: ["src/**/*.test.ts"]`) |
| **Quick run command** | `npm test -- src/lib/foundation.isolation.test.ts src/lib/theme.test.ts src/components/ui/` |
| **Full suite command** | `npm test` |
| **Dual build smoke** | `npm run build:web && npm run build` |
| **Estimated runtime** | ~5–15s tests; ~30–60s dual builds |

---

## Sampling Rate

- **After every task commit:** Quick run command above
- **After every plan wave:** `npm test && npm run build:web && npm run build`
- **Before `/gsd-verify-work`:** Full suite + dual builds green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0 | 01 | 0 | FND-03/THM-01 | T-02-SC | Allowlist Input/Textarea; Mist Sky not cyan | unit | `npm test -- src/lib/foundation.isolation.test.ts` | ❌ W0 | ⬜ |
| 02-tokens | 01 | 1 | THM-01 | — | Mist Sky tokens + radius 0 | unit | foundation.isolation.test.ts | ⬜ | ⬜ |
| 02-primitives | 02 | 1 | FND-01/03 | T-02-SC | Official shadcn add only | unit | ui import tests | ❌ W0 | ⬜ |
| 02-shell | 03 | 2 | WEB-01, THM-04 | — | Underline nav; dual-write theme | unit | theme.test.ts + surfaces | ❌ W0 | ⬜ |
| 02-pages | 04 | 3 | WEB-02/03/05/06/07 | T-02-OAuth | No uiClasses btn; OAuth WebShell; no code log | unit + dual build | phase02.surfaces + builds | ❌ W0 | ⬜ |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Update `src/lib/foundation.isolation.test.ts` — FND-03 allowlist for input/textarea; Mist Sky primary asserts (no `#22d3ee` as primary); keep desktop isolation
- [ ] Add `src/components/ui/input.import.test.ts` + `textarea.import.test.ts` after CLI add
- [ ] Add `src/lib/phase02.surfaces.test.ts` — Phase 2 files must not import `btn`/`btnPrimary`/`choiceBtn`/`btnSegment`; OAuth references `WebShell`
- [ ] Framework install: none (Vitest present)

*Existing infrastructure covers theme dual-write (`theme.test.ts`) and Button import skeleton.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme matrix Auto/Dark/Light + no-flash | THM-04 | Visual timing | Cycle theme; hard reload Light; check `data-theme` + `.dark` |
| Gallery load/empty/error visuals | WEB-02, WEB-07 | Presentation | Force offline for error; empty catalog / filter empty |
| Wizard create path | WEB-03 | E2E UX | Select mode/profile; create; lands in editor draft |
| OAuth loading/error UI | WEB-05 | Network | Visit callback without code; error path quiet |
| Desktop look unchanged | ISO-01 | Platform | `npm run build` / desktop dev — legacy gsd, not Mist Sky body |
| Start panel 3 CTAs | WEB-01 related | Visual | Empty cloud editor start |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
