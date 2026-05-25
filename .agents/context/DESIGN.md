# GSD Pi Config — DESIGN

Aligned with [opengsd.net](https://www.opengsd.net) (product register).

## Scene

Engineers configure GSD Pi at a desk, often beside a terminal, in a dim room. The UI is a focused tool: dark, low glare, cyan accent for primary actions only.

## Color strategy

**Restrained** with **Committed** accent: tinted neutrals + cyan `#22d3ee` for links, primary buttons, active nav, focus rings.

| Token | Dark | Role |
|-------|------|------|
| background | `#050507` | Page |
| background-elevated | `#0d0d14` | Sidebar, panels, inputs |
| foreground | `#e7e8f0` | Body text |
| muted | `#8b8ca6` | Labels, hints |
| border | `#1b1b2a` | Dividers |
| accent | `#22d3ee` | Primary actions |
| accent-strong | `#38e0ff` | Hover on accent |
| purple | `#a855f7` | Grid accent only (5% opacity) |

Never pure `#000` / `#fff`. Light theme uses the same hue family with higher lightness.

## Typography

- **Sans:** Geist Sans (marketing parity)
- **Mono:** Geist Mono for paths, code, presets
- Scale ratio ~1.2; body 14px; section titles 13px semibold uppercase tracking

## Layout

- Top **WebShell** on cloud: brand + Editor / Gallery / New + link to opengsd.net
- Editor: sidebar (sections) + toolbar (workspace label + file actions) + content
- No project scope on web. Flow: upload → edit → download.

## Motion

150–200ms ease-out-quart on color/border. No page-load choreography.

## Anti-patterns

- Side-stripe borders, gradient text, glass cards, hero metric templates
- Native `<select multiple>` listboxes (use checkbox dropdown)
