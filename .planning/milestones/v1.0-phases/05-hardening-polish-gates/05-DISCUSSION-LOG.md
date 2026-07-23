# Phase 5 Discussion Log

**Date:** 2026-07-22  
**Phase:** Hardening & Polish Gates  
**Areas:** Residual purge, smoke checklist, a11y bar  
**Skipped:** Bundle size (deferred)

## Residual web purge

| Question | Selected |
|----------|----------|
| Scope | All web-visible surfaces |
| Web .gsd-btn CSS | Delete after zero callers |
| Desktop ConfigApp btn* | Leave desktop branches |
| gsd-* colors | Migrate to semantic tokens on web |

## Behavior smoke

| Question | Selected |
|----------|----------|
| Paths | Full product matrix |
| Automation | Source/contracts + human UAT; no Playwright |
| Domain bar | preferencesCore + full suite green |
| Done def | ISO-02–05 + human smoke approved |

## A11y

| Question | Selected |
|----------|----------|
| Depth | Checklist audit + fix gaps; no axe CI |
| Hit targets | ≥40px |
| Focus | Visible focus-visible Mist Sky |
| Conflict | Prefer a11y |
