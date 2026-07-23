# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Web UI Redesign

**Shipped:** 2026-07-23  
**Phases:** 5 | **Plans:** 21 | **Tasks:** ~45

### What Was Built

- shadcn foundation + platform CSS split + theme dual-write (`data-theme` + `.dark`)
- Mist Sky web design system (soft sky primary, radius 0, linear chrome)
- WebShell, gallery, wizard, OAuth, start panel on shadcn
- Dialog modals + ⌘K Command palette with exclusivity and preserved handlers
- FormControls web adapters, ModelPicker/ModelChain, editor shell
- Residual purge (ApiKeys, CustomProviders), isolation gates, dual builds, human UAT

### What Worked

- Foundation-first phasing (tokens/isolation → chrome → overlays → forms → hardening)
- FND-03 allowlist + source contracts as regression gates without Playwright
- Mist Sky user lock early avoided rework on logo-cyan vs neutral
- `isWebPlatform()` adapters kept domain and desktop paths stable
- End-of-phase human UAT with formal matrices (esp. Phase 5 S1–S10 / A1–A10)

### What Was Inefficient

- Phase 1 human visual gate parked while later phases continued — tracking lag (ROADMAP Phase 1 unchecked until close)
- `init.manager` / `audit-open` false negatives (PLAN-CHECK counted as plans; UAT “gaps” when already passed)
- Transitional web bridge after CSS split needed an emergency restyle before chrome phase settled
- One-liner SUMMARY extraction sometimes picked debug notes (e.g. TS baseUrl) over product outcomes

### Patterns Established

- Dual CSS entry (`index.web.css` / `index.desktop.css`) + `@platform-css` alias
- Phase-N source contract test files (`phase0N.*.test.ts`) + foundation isolation allowlist
- Mist Sky semantic tokens as web truth; desktop keeps `gsd-*` / uiClasses
- FormControls presentation adapters rather than section rewrites
- Milestone audit before complete; phase dirs archived under `milestones/vX.Y-phases/`

### Key Lessons

1. Parked UAT should still update ROADMAP/STATE so tools don’t invent “next phase = 1”
2. Treat `audit-open` UAT gaps as suspect when status=passed and 0 pending — verify files before blocking close
3. Lock palette with the user early (Mist Sky) before mass restyle
4. Isolation tests + dual builds catch desktop regressions cheaper than full E2E for a visual milestone
5. Residual “last .gsd-btn” surfaces (ApiKeys/CustomProviders) need an explicit hardening phase

### Cost Observations

- Model mix: adaptive / multi-agent execute waves
- Sessions: multi-day burst (2026-07-21 → 2026-07-23)
- Notable: parallel plan execute + integration checker at audit kept final close short

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multi-day | 5 | First GSD web redesign milestone; Mist Sky + shadcn isolation pattern |

### Cumulative Quality

| Milestone | Tests | Coverage notes | Zero-Dep Additions |
|-----------|-------|----------------|-------------------|
| v1.0 | 173 Vitest | Source/isolation contracts + unit; no Playwright | shadcn/Base UI primitives only as needed (FND-03) |

### Top Lessons (Verified Across Milestones)

1. Platform CSS split + allowlist tests protect dual-platform products during web-only restyles
2. Human UAT remains required for focus/smoke when E2E is deferred

---
*Created 2026-07-23 after v1.0 complete*
