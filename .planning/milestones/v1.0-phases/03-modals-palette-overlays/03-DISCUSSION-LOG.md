# Phase 3 Discussion Log

**Date:** 2026-07-22  
**Phase:** Modals, Palette & Overlays  
**Areas:** Dialog chrome, inventory, palette, focus, Share/secrets, platform

## Dialog chrome

| Question | Selected |
|----------|----------|
| Default shell | shadcn Dialog centered |
| AlertDialog | Only true confirm/destructive |
| Backdrop | Soft dark scrim ~60% |
| Close | X + ESC + backdrop click |

## Modal inventory + depth

| Question | Selected |
|----------|----------|
| Which modals | All product modals |
| Depth | Full Dialog + Button language |
| Gallery preview | Dialog scrollable body |
| Submit/OAuth | Restyle Submit modal only |

## ⌘K palette

| Question | Selected |
|----------|----------|
| Shell | Command in Dialog |
| Ranking | Keep existing scoring |
| List chrome | Linear rows + left accent active |
| Empty | Quiet inline message |

## Focus / ESC / nest

| Question | Selected |
|----------|----------|
| Trap | shadcn/Base UI Dialog |
| Restore | Previous focus |
| Nested | No nested Dialogs; Select OK inside |
| Exclusivity | Single open overlay |

## Share + secrets

| Question | Selected |
|----------|----------|
| Redaction copy | Keep explicit warning |
| CTA | Copy primary |
| Review | Scroll mono pre |
| Scan warnings | Visible Mist Sky Alert |

## Platform

| Question | Selected |
|----------|----------|
| Scope | Web presentation goal |
| Isolation | Shared components + web tokens |
| Native pickers | Leave Tauri alone |
| Registry | Dialog/Command + peers only |
