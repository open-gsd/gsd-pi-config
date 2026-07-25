---
phase: 5
slug: hardening-polish-gates
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-23
verified: 2026-07-23
block_on: high
register_authored_at_plan_time: true
---

# Phase 5 — Security

> Per-phase security contract for milestone ship gate. Covers Phase 5 plan threat models and residual high-severity secret paths from the v1.0 restyle (share/redact, OAuth, API keys).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Web UI → preferencesCore | Share/submit build shareable markdown | Prefs document; redacted secrets |
| Web UI → ConfigBackend keys | ApiKeys set/clear/export | API key material (web store / keychain desktop) |
| Browser → `/api/*` | OAuth config + submit preset | OAuth code (query); client secret stays server-side |
| Web CSS vs desktop CSS | Platform presentation isolation | No secrets; isolation only |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-05-01 | Information Disclosure | ApiKeysSection exportEnv / reveal | high | mitigate | Handlers `setKey`/`clearKey`/`exportEnv` unchanged; masked display; `window.confirm` on clear; no key `console.log` | closed |
| T-05-02 | Information Disclosure | CustomProviders password show/hide | medium | mitigate | Presentation-only Button swap; show/hide toggle preserved | closed |
| T-05-03 | Tampering | Residual className edits | low | mitigate | Static class strings only | closed |
| T-05-04 | Elevation of Privilege | N/A single-user tool | low | accept | No multi-tenant auth in residual sections | closed |
| T-05-06 | Information Disclosure | ConfigApp share/download paths | high | mitigate | `sharePreset` still calls `backend.buildShareablePreset`; download path presentation-only verify | closed |
| T-05-08 | Tampering | index.web.css purge | medium | mitigate | Grep gate before delete; isolation dual-CSS asserts | closed |
| T-05-11 | Information Disclosure | UAT S4 share/redact | high | mitigate | UAT requires secret-scan warning; no redact/scan code edits; no OAuth code logging | closed |
| T-05-12 | Information Disclosure | ApiKeys UAT residual | high | mitigate | Clear-key confirm preserved; operators avoid production secrets in UAT | closed |
| T-05-SC | Tampering | npm installs | high | mitigate | No package installs in Phase 5 plans; reuse Button/Input | closed |
| T-03-04 | Information Disclosure | ShareModal redaction UX | high | mitigate | Always-visible key/token/secret/password warning + mono review before copy | closed |
| T-03-06 | Information Disclosure | preferencesCore | high | mitigate | `redactSensitive` / `scanForLeakedSecrets` intact; preferencesCore.test green (6/6) | closed |
| T-03-08 | Information Disclosure | Submit secret-scan UX | high | mitigate | `scanForLeakedSecrets` gate + soft-danger alert in SubmitPresetModal | closed |
| T-03-09 | Spoofing | completeOAuthSubmit state | high | mitigate | `gsd-oauth-state` equality / session keys unchanged | closed |
| T-03-10 | Information Disclosure | OAuth code in logs | high | mitigate | No console logging of code/tokens in Submit/OAuth pages | closed |
| T-03-15 | Information Disclosure | phase03 Share/Submit asserts | high | mitigate | phase03.overlays source contracts require redaction keywords + scan | closed |
| T-04-11 | Information Disclosure | Share/Export/Submit openers | high | mitigate | Redaction/scan/OAuth handlers not rewritten in form shell restyle | closed |
| T-04-14 | Information Disclosure | preferencesCore regression | high | mitigate | preferencesCore.test in gate; redaction code not edited | closed |
| T-02-OAuth | Information Disclosure | OAuthCallbackPage | high | mitigate | Only `completeOAuthSubmit`; no console.log of code/query | closed |
| T-01-04 | Tampering | Desktop CSS entry | high | mitigate | foundation.isolation forbids shadcn on desktop; dual builds | closed |
| T-01-12 | Elevation / Isolation | Desktop bundle | high | mitigate | FND-03 allowlist + isolation tests | closed |

*Status: open · closed · open — below high threshold (non-blocking)*  
*Severity: critical > high > medium > low — only open threats at or above `high` count toward `threats_open`*  
*Disposition: mitigate · accept · transfer*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-05-01 | T-05-04 | Single-user config tool; no multi-tenant auth surface in residual sections | plan accept | 2026-07-23 |

No open high/critical threats.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-23 | 20 | 20 | 0 | ship-pre L1 secure (ASVS 1) before `/gsd-ship` |

### Evidence (L1)

- `src/lib/preferencesCore.ts` — `redactSensitive`, `scanForLeakedSecrets` present
- `npm test -- src/lib/preferencesCore.test.ts` — 6/6 passed
- `src/ConfigApp.tsx` — `sharePreset` → `backend.buildShareablePreset`
- `src/components/SubmitPresetModal.tsx` — `scanForLeakedSecrets` before submit; no code/token console logs
- `src/components/sections/ApiKeysSection.tsx` — `exportEnv`/`setKey`/`clearKey` handlers retained
- `api/submit-preset.ts` — `GITHUB_CLIENT_SECRET` server-side only
- Milestone audit integration: share/redact + OAuth consumers WIRED; human UAT S4 approved

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-23 (ASVS L1; block_on high)
