---
phase: 05-hardening-polish-gates
source: 05-RESEARCH.md Open Questions
status: resolved
resolved_at: 2026-07-23
plan: 05-04
---

# Phase 5 — Research Open Questions (Resolved)

Resolutions locked for milestone close (Plans 01–03 implementation + Plan 04 gates). Source recommendations from `05-RESEARCH.md`; execution confirmed them.

---

## Q1 — Token migration aggressiveness

**Question:** How aggressively to migrate shared-section `gsd-*` colors vs leave bridge aliases?

**Resolution:**

| Surface density | Action taken |
|-----------------|--------------|
| High-density residual (Custom Providers, API Keys) | **Fully migrated** in Plans 01–02 to semantic tokens + Button language |
| Other web-visible preference sections | Migrated when touched (Plan 02 P2 sweep) |
| `--color-gsd-*` CSS bridge | **May remain** as dead-safe aliases for any residual utilities / dual-platform compile |
| Desktop visual isolation | **S10** confirms desktop remains legacy-chrome dominant (not full Mist Sky restyle) |

**Rationale:** D-04 asks for semantic tokens on web residual; bridge keeps desktop-safe aliases without forcing Mist Sky on desktop (ISO-01).

**Status:** **RESOLVED**

---

## Q2 — ConfigApp `btn` import forbid

**Question:** Should `phase05.residual` forbid `btn` import in `ConfigApp`?

**Resolution:** **NO**

- `ConfigApp` keeps `uiClasses` (`btn` / `btnPrimary` / segments) for **desktop** update/project/browse paths (D-03).
- Residual source contracts (`phase05.residual.test.ts`) scope **ApiKeys + CustomProviders** import bans + **web CSS** dual-entry asserts only.
- Web ConfigApp toolbar path already uses shadcn `Button`; desktop branches retain uiClasses.

**Status:** **RESOLVED** — do not forbid ConfigApp imports.

---

## Q3 — MultiSelect chip-remove `min-h-6` (24px)

**Question:** Does ISO-04 ≥40px floor force chip-remove upsizing on web FormControls?

**Resolution:**

| Control class | Hit target policy |
|---------------|-------------------|
| Residual primary CTAs (ApiKeys / CustomProviders) | Hard **≥40px** floor (D-10) |
| MultiSelect chip-remove (`min-h-6`) | **Inherits Phase 4 acceptance** (WCAG AA 24px minimum) |
| Fix trigger | Only if **human a11y audit flags** a practical failure; then prefer a11y (D-12) without IA change |

**Status:** **RESOLVED** — no proactive chip-remove resize in Phase 5 unless UAT A1 flags it.

---

## Cross-links

- UI contract: `05-UI-SPEC.md` residual inventory, a11y A1–A10, smoke S1–S10
- Decisions: `05-CONTEXT.md` D-03, D-04, D-08–D-12
- Human gate artifact: `05-UAT.md`
- Residual contracts: `src/lib/phase05.residual.test.ts`
