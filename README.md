<!--
GSD Pi Config — README
Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
-->

# GSD Pi Config

Desktop configuration manager for [GSD Pi](https://github.com/open-gsd/gsd-pi) preferences. A native Tauri app that gives you a structured GUI over the YAML preferences file you'd otherwise hand-edit, plus a library view for skills, agents, and API keys.

**Web app:** Browser editor — upload or create a configuration, edit in the browser, then download `preferences.md`, `models.json`, and `settings.json` for your machine. Preset gallery and wizard included (see [Web vs desktop](#web-vs-desktop)).

## Screenshots

| General | Models | API Keys & Auth |
|---|---|---|
| ![General settings](docs/screenshots/general.png) | ![Per-phase model chains with fallbacks](docs/screenshots/models.png) | ![Keychain-backed API keys and CLI auth](docs/screenshots/api-keys.png) |
| Workflow mode, profiles, and global behavior toggles. | Per-phase model selection with ordered fallback chains. | Keychain-backed provider keys and CLI auth status. |

## What it does

- **Edit preferences visually.** Every field in `.gsd/preferences.md` (or `~/.gsd/preferences.md`) is exposed across organized sections — models, git, hooks, parallel execution, safety, verification, routing, and more.
- **Global or project scope.** Toggle between editing your global preferences or a per-project file. Recent projects are remembered.
- **Skills library.** Browse, edit, create, and delete `SKILL.md` files in `~/.claude/skills/` and `<project>/.claude/skills/`. Legacy `gsd-*` bundled skills are filtered out.
- **Agents library.** Same workflow for `.claude/agents/*.md` subagent definitions.
- **API keys via OS keychain.** Store provider keys (Anthropic, OpenAI, etc.) in the system keyring and export them to a sourceable `~/.gsd/env.sh` shell file (mode `0600`).
- **Presets.** Import/export `.preset.md` files for sharing configurations, or copy a redacted YAML block to the clipboard with the Share dialog (secrets are scrubbed before it leaves the app).
- **Atomic, snowflake-safe writes.** Saves go through an atomic write path and stringy IDs (Discord channel IDs, etc.) survive round-trips without numeric truncation.

## Tech stack

- **Tauri 2** (Rust backend, system-native window)
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4**
- **`keyring`** crate for OS keychain access

## Getting started

### Prerequisites

- Node.js 20+
- Rust toolchain (stable)
- Tauri 2 prerequisites for your platform — see [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/)

### Install & run (desktop)

```bash
npm install
npm run tauri dev
```

The dev server runs on port `1420`. The app window opens automatically once the Rust backend compiles.

### Web (local)

```bash
npm install
npm run dev:web
```

Opens the gallery + editor on port `5173`. Copy `.env.web.example` to `.env.web.local` to override preset repo URLs.

```bash
npm run build:web
npm run preview:web
npm test
```

Preset gallery data is loaded from [open-gsd/gsd-pi-presets](https://github.com/open-gsd/gsd-pi-presets) (override URLs in `.env.web.local`).

### Web vs desktop

The web app is a **cloud editor**: it cannot read or write files on your computer. Import existing configs (or start from a preset/wizard), edit in the session, then **Download files** to install under `~/.gsd/` locally. A browser draft is kept so you can refresh without losing work in that session.

| Feature | Web | Desktop |
|---------|-----|---------|
| Preference sections (editor) | Yes | Yes |
| Edit `~/.gsd/` or project files in place | No — upload + download | Yes |
| Global / project scope | Global only | Global + real project folders |
| `models.json` / `settings.json` | Import + download | On disk |
| Skills / agents libraries | No | Yes (`~/.claude`, project) |
| API keys | Browser session; export `env.sh` | OS keychain |
| CLI auth detection (`gcloud`, `gh`) | No | Yes |
| Preset gallery / wizard | Yes | Import/export files |
| Auto-update installer | No | Yes |

### Build a release bundle

```bash
npm run tauri build
```

Bundles land in `src-tauri/target/release/bundle/`.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette (jump to any field) |
| `⌘S` | Save changes |
| `⌘⇧Z` | Discard changes |
| `[` / `]` | Previous / next section |

## Project layout

```
src/                 React frontend
  components/        Sidebar, Palette, ShareModal, FormControls
  components/sections/  One file per preferences section
  hooks/             useDirty (change tracking)
  lib/               keyboard, presets, theme, validators, tauri listeners
  types.ts           TypeScript mirror of the GSD Pi preferences schema
src-tauri/           Rust backend
  src/lib.rs         Tauri command handlers (preferences, skills, agents, keys)
  src/core.rs        YAML serialization, frontmatter parsing, atomic writes
  tauri.conf.json    Window config & bundle settings
```

## Where preferences live

- **Global:** `~/.gsd/preferences.md`
- **Project:** `<project>/.gsd/preferences.md`

Both are markdown files with a YAML frontmatter block — fully compatible with hand editing if you ever need to drop into a text editor.

## License

MIT © Jeremy McSpadden
