# Phase 5 Plan Check — Hardening & Polish Gates

**Checked:** 2026-07-22  
**Plans:** 05-01, 05-02, 05-03, 05-04  
**Status:** PLAN CHECK PASSED (0 blockers, 3 warnings)

## VERIFICATION PASSED

**Phase:** 05-hardening-polish-gates  
**Plans verified:** 4  
**Status:** All blocking checks passed — plans will achieve ISO-02–05 if executed as written

### Coverage Summary

| Requirement | Plans | Tasks / mechanism | Status |
|-------------|-------|-------------------|--------|
| ISO-02 Domain stability | 03, 04 (+ prefs in 01–02 verifies) | preferencesCore green; full suite; dual builds; no domain rewrites | Covered |
| ISO-03 Behavior smoke | 04 | 05-UAT.md S1–S10 + human end-of-phase; no Playwright | Covered |
| ISO-04 A11y parity | 01, 02, 04 | ≥40px residual CTAs; focus-visible via Button; UAT A1–A10 | Covered |
| ISO-05 No IA rethink + residual cohesion | 01–04 | CustomProviders/ApiKeys purge; section tokens; residual contracts; WEB_HIDDEN freeze | Covered |

### Plan Summary

| Plan | Wave | depends_on | Tasks | Files (fm) | Threat model | Status |
|------|------|------------|-------|------------|--------------|--------|
| 01 Residual CustomProviders + ApiKeys | 1 | [] | 2 | 2 | T-05-01–04, SC | Valid |
| 02 Section token sweep + ConfigApp verify | 2 | 01 | 2 | 14 | T-05-05–07, SC | Valid (scope warn) |
| 03 residual contracts + web CSS purge + isolation | 3 | 02 | 2 | 3 | T-05-08–10, SC | Valid |
| 04 Dual builds + suite + UAT + open Q | 4 | 03 | 2 | 3 docs | T-05-11–13, SC | Valid |

### Dependency graph

```
01 → 02 → 03 → 04
```

Acyclic; waves match deps; no forward refs.

### Residual purge order (D-01 → D-02)

| Step | Plan | Gate |
|------|------|------|
| 1. Purge web residual btn language (CustomProviders, ApiKeys) | 01 | rg no uiClasses btn; Button present; preferencesCore |
| 2. Token/a11y residual sweep + ConfigApp web verify | 02 | no residual gsd-* on listed sections; ConfigApp dual path |
| 3. Source contracts (expect CSS RED) | 03-T1 | phase05.residual.test.ts |
| 4. Grep zero web callers → delete web `.gsd-btn*` → isolation update | 03-T2 | ordered; desktop CSS untouched; field-focus kept |
| 5. Dual builds + full suite + UAT artifact | 04 | ISO-02 auto + ISO-03/04 human matrix |

CSS delete is **after** caller purge — matches CONTEXT D-02 / UI-SPEC / RESEARCH.

### Special checks (orchestrator)

| Check | Result |
|-------|--------|
| ISO-02–05 coverage | PASS — each req in ≥1 plan `requirements` + tasks |
| Residual purge order | PASS — 01/02 callers → 03 CSS |
| CSS delete after zero callers | PASS — Plan 03 Task 2 grep gate before delete |
| No Playwright | PASS — deferred; Plan 04 forbids; Vitest + human UAT only |
| Skills/Agents desktop-only | PASS — WEB_HIDDEN freeze; libraries not restyled; residual tests allow library uiClasses |
| Threat models | PASS — all 4 plans have STRIDE registers (secrets, CSS purge, share/redact UAT) |
| Automated verifies | PASS — every auto task has `<automated>`; no Playwright; no `MISSING` without Wave 0 link |

### Dimension results

| # | Dimension | Result |
|---|-----------|--------|
| 1 | Requirement coverage | PASS |
| 2 | Task completeness | PASS (structure valid; Files/Action/Verify/Done) |
| 3 | Dependency correctness | PASS |
| 4 | Key links planned | PASS (Button wiring, residual→CSS contracts, UAT→UI-SPEC) |
| 5 | Scope sanity | WARNING — Plan 02 14 files (see below) |
| 6 | Verification derivation | PASS — user-observable truths (cohesion, isolation, green suite, UAT) |
| 7 | Context compliance | PASS — D-00–D-12 honored; deferred Playwright/axe/desktop restyle excluded |
| 7b | Scope reduction | PASS — no silent “v1 static” reduction of locked decisions; Skills/Agents correctly out of **web** gate per D-01 web-visible + D-03 |
| 7c | Architectural tier | PASS — presentation in Browser/CSS; domain freeze; smoke human |
| 8 | Nyquist compliance | PASS — VALIDATION.md exists; all tasks automated; residual contracts + isolation in Plan 03; sampling OK |
| 9 | Cross-plan data contracts | PASS — no conflicting transforms on shared domain data |
| 10 | CLAUDE.md compliance | PASS — Vitest, presentation-only, no stack change, secrets/redaction frozen |
| 11 | Research resolution | WARNING — Open Questions not marked `(RESOLVED)` in RESEARCH.md (content resolved in plans + Plan 04 artifact) |
| 12 | Pattern compliance | PASS — plans cite PATTERNS.md analogs (WebStartPanel, phase02 contracts, FormControls ModelChain) |
| Verify format | PASS — no `2>/dev/null \|\| echo 0` false-pass pattern; rg negative asserts use `test $? -ne 0` |

### Dimension 8: Nyquist table (abbrev)

| Task | Plan | Wave | Automated | Status |
|------|------|------|-----------|--------|
| CustomProviders purge | 01 | 1 | vitest preferencesCore + rg bans | ✅ |
| ApiKeys purge | 01 | 1 | vitest + rg + role=alert + handlers | ✅ |
| P1 section tokens | 02 | 2 | phase04.forms + preferencesCore + gsd-* absence | ✅ |
| P2 + ConfigApp | 02 | 2 | forms + prefs + dual-path markers | ✅ |
| residual.test scaffold | 03 | 3 | vitest residual (CSS RED until T2) + file/rg | ✅ |
| CSS purge + isolation | 03 | 3 | residual + isolation + phase02–04 + npm test | ✅ |
| Dual build + suite | 04 | 4 | npm test + build:web + build + core vitest | ✅ |
| UAT + open Q | 04 | 4 | file + content rg; human-check end-of-phase | ✅ |

Wave 0 residual file is created in Plan 03 (post-caller-purge) rather than a separate pre-01 plan — acceptable: Plan 01–02 use rg/preferencesCore gates; CSS absence contract is TDD-red until purge task.

### Warnings (non-blocking)

**1. [scope_sanity] Plan 02 touches 14 files**  
- Plan: 02  
- Metrics: 2 tasks, 14 files_modified (agentSettingsEditors + 12 sections + ConfigApp)  
- Live residual density is real (~90+ gsd/type matches on P1 alone)  
- Fix (optional): Split P1 vs P2 into two plans if executor context degrades; not required for goal achievement

**2. [research_resolution] RESEARCH.md `## Open Questions` lacks `(RESOLVED)` markers**  
- Q1–Q3 already have recommendations; Plans 01–03 implement them; Plan 04 writes `05-OPEN-QUESTIONS.md`  
- Fix (optional): Rename section to `## Open Questions (RESOLVED)` and tag each Q RESOLVED before execute for hygiene

**3. [nyquist / VALIDATION drift] VALIDATION maps residual scaffold to Wave 0 / Plan 01**  
- Actual scaffold is Plan 03 Task 1 (correct relative to CSS-delete order)  
- Fix (optional): Align VALIDATION.md Wave 0 table with Plan 03 during Plan 04 Task 2 (already in scope)

### Structured issues

```yaml
issues:
  - plan: "05-02"
    dimension: scope_sanity
    severity: warning
    description: "Plan 02 has 14 files_modified (warning threshold 10; blocker at 15+). Two tasks still within 2–3 target."
    fix_hint: "Optional split P1/P2 plans if execution quality degrades; else proceed."
  - plan: null
    dimension: research_resolution
    severity: warning
    description: "05-RESEARCH.md Open Questions not marked RESOLVED; recommendations + Plan 04 artifact resolve Q1–Q3."
    fix_hint: "Mark ## Open Questions (RESOLVED) with inline RESOLVED on Q1–Q3."
  - plan: "05-04"
    dimension: verification_derivation
    severity: warning
    description: "VALIDATION.md Wave 0 placement drifts from Plan 03 residual scaffold; Plan 04 already updates VALIDATION sign-off."
    fix_hint: "When updating 05-VALIDATION.md, retarget Wave 0 residual row to Plan 03."
```

### Goal-backward truths

| Must be true for phase goal | Planned? |
|-----------------------------|----------|
| Web residual btn language gone (CustomProviders, ApiKeys) | 01 |
| Web preference chrome on semantic tokens | 02 |
| ConfigApp web Button-only; desktop uiClasses kept | 02 |
| Web `.gsd-btn*` CSS deleted after zero callers; desktop kept | 03 |
| phase05.residual + foundation.isolation lock purge | 03 |
| preferencesCore + full suite + dual builds green | 01–04 |
| Human smoke S1–S10 + a11y A1–A10 artifact | 04 |
| No Playwright/axe/product IA/desktop restyle | All plans |
| Skills/Agents not web success criteria | 01–04 freeze |

### Recommendation

**Proceed to `/gsd-execute-phase 05`.** No blockers. Optional hygiene: mark RESEARCH open questions resolved; watch Plan 02 context load.

