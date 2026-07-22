# Web redesign palette — Mist Sky (locked)

**Status:** locked 2026-07-21  
**Choice:** Option A — Mist Sky  
**Direction:** Clean / linear chrome + soft light accent (not logo cyan/purple)

Source preview: `.planning/design/palette-options.html` (generation `linear-light-v4`)

## Design grammar

- Linear layout: 1px rules, underline nav, left-edge active, flat surfaces
- Hierarchy from type + space + borders first
- **One light accent** for primary actions, focus rings, active nav edge, kicker text
- No logo colors: not `#22d3ee`, not `#a855f7`, not neon mint
- Desktop (Tauri) keeps current legacy `gsd-*` look this milestone (ISO isolation)

## Dark (default product)

| Role | Token (shadcn target) | Value |
|------|----------------------|--------|
| Page background | `--background` | `#0b0c0e` |
| Elevated / sidebar | `--card` / `--popover` | `#111316` |
| Subtle fill | `--secondary` / `--muted` / `--accent` (hover wash) | `#181b20` |
| Border | `--border` / `--input` | `#2a2e36` |
| Body text | `--foreground` | `#f2f4f7` |
| Muted text | `--muted-foreground` | `#8b929e` |
| **Primary** | `--primary` | `#a8c5e8` |
| On primary | `--primary-foreground` | `#0b0c0e` |
| Soft primary wash | (custom `--accent-soft` or primary/12%) | `rgba(168, 197, 232, 0.12)` |
| Destructive (soft) | `--destructive` | `#e8b4b0` |
| Ring | `--ring` | `#a8c5e8` @ ~35% |
| Radius | `--radius` | `0` (strict linear) or `0.25rem` if a11y needs slight soften — default **0** |

Primary hover (component-level): `#c4daf2`

## Light

| Role | Value |
|------|--------|
| Background | `#f5f7fa` |
| Card / elevated | `#ffffff` |
| Subtle fill | `#eef1f5` |
| Border | `#d8dee8` |
| Foreground | `#14171c` |
| Muted foreground | `#5c6570` |
| **Primary** | `#5a7fa8` (deeper sky so buttons stay readable on light) |
| On primary | `#f5f7fa` |
| Soft primary wash | `rgba(90, 127, 168, 0.1)` |
| Destructive | `#b85c56` |
| Ring | primary @ ~25% |

Primary hover: `#4a6d94`

## Mapping notes for Phase 2+

1. Replace Phase 1 neutral OKLCH scaffold in `src/index.web.css` with these hex (or equivalent OKLCH) values under `:root` / `.dark`.
2. Map transitional `--color-gsd-*` bridge to the same system so unmigrated chrome matches until restyled.
3. `--bridge-accent` / cyan brand bridge retired on web once Mist Sky is applied.
4. shadcn `Button` default variant uses `--primary` / `--primary-foreground`.
5. Active nav / sidebar: left border or underline in primary; background `primary/12%`.
6. Keep dual-write theme: `data-theme` + `.dark` (THM-02/03 unchanged).

## Explicit non-goals

- Mapping GSD logo cyan into `--primary`
- Glass, gradients, glow-heavy chrome
- Colorful multi-accent dashboard kits
- Desktop visual restyle this milestone

## Next workflow

- Phase 1 automated foundation: done (UAT parked)
- **Next:** `/gsd-discuss-phase 2` or `/gsd-plan-phase 2` with this palette as locked UI-SPEC color source
- Scope: full web surface Phases 2–4 (chrome → overlays → forms/editor)
