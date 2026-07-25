<!-- GSD:project-start source:PROJECT.md -->

## Project

**GSD Pi Config — Web UI Redesign**

GSD Pi Config is the configuration manager for [GSD Pi](https://github.com/open-gsd/gsd-pi): a dual-platform app (Tauri desktop + browser web) that edits preferences, models, settings, skills, agents, and API keys. This milestone is a **visual restyle of the web surface** onto **shadcn/ui** — same product jobs and flows, a consistent modern component system.

**Core Value:** Every web page uses a single shadcn-based design system so the site looks cohesive and UI work stays maintainable — without changing what users can do.

### Constraints

- **Tech stack**: Stay on React + Vite + TypeScript; introduce shadcn/ui in a way that works with the existing Tailwind 4 setup
- **Behavior stability**: Preference serialization, dirty/save, download/import, gallery/wizard data paths must keep working
- **Platform boundary**: Web restyle must not regress desktop build/runtime; prefer web-scoped styles/components over forking business logic
- **Scope discipline**: No drive-by backend refactors or feature expansion beyond what the restyle requires
- **Security**: Share/redact/export paths must not regress secret handling while UI is rewired

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript (ES2020 target, strict mode) — React frontend (`src/`), Vite config, Vercel serverless handlers (`api/`)
- Rust (edition 2021, `rust-version = "1.77.2"`) — Tauri desktop backend (`src-tauri/`)
- CSS via Tailwind CSS 4 utility classes — `src/index.css` and component class helpers in `src/lib/uiClasses.ts`
- YAML — preferences frontmatter / serialization (`yaml` npm package; `serde_yaml` in Rust)
- Markdown — skill/agent definitions and preset files (parsed/written by app logic)

## Runtime

- Node.js 20+ (README + CI `actions/setup-node` with `node-version: "20"`)
- Browser (web build) or system WebView via Tauri 2 (desktop)
- Rust stable toolchain for desktop builds
- npm
- Lockfile: `package-lock.json` present (use `npm ci` in CI/Vercel)
- Cargo (`src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`)

## Frameworks

- React 19.2.x + React DOM — UI
- react-router-dom 7.x — web routing (gallery, wizard, OAuth callback, editor)
- Tauri 2.10.x — desktop shell (`@tauri-apps/api`, `src-tauri`)
- Vite 8.x — bundler/dev server (`vite.config.ts`)
- Vitest 4.x — frontend unit tests (`npm test`, config under `vite.config.ts` `test` block)
- Cargo test — Rust backend tests (`src-tauri`, release workflow)
- `@vitejs/plugin-react` 6.x
- `@tailwindcss/vite` + `tailwindcss` 4.2.x
- TypeScript 6.x (`tsc && vite build`)
- `@tauri-apps/cli` 2.x — `npm run tauri`
- `@vercel/node` 5.x — typed serverless handlers for `api/`

## Key Dependencies

- `@tauri-apps/api` + plugins (`dialog`, `opener`, `process`, `shell`, `updater`) — desktop FS dialogs, open external URLs, process relaunch, auto-update
- `yaml` — parse/serialize preference documents on the frontend (`src/lib/preferencesCore.ts`)
- `keyring` (Rust) — OS keychain for API keys (`src-tauri/src/lib.rs`)
- `serde` / `serde_json` / `serde_yaml` — Rust data interchange
- `dirs` — resolve home / config paths on desktop
- Tauri plugins: `tauri-plugin-log`, `dialog`, `opener`, `updater`, `process`
- Vercel serverless (`api/submit-preset.ts`, `api/oauth-config.ts`) for GitHub OAuth + preset PR submission
- GitHub Releases + Tauri updater (`latest.json` endpoint in `src-tauri/tauri.conf.json`)

## Configuration

- Web Vite env: `.env.web` / `.env.web.example` / local overrides (e.g. `.env.web.local`)
- Serverless (Vercel project env, not committed):
- Mode-injected: `import.meta.env.VITE_PLATFORM` = `"web"` | `"desktop"` (`vite.config.ts`)
- `.env` / `.env.web` exist for local config — **do not commit secrets**; never read secret values into docs
- `vite.config.ts` — dual mode (`web` vs default desktop), ports 5173 (web) / 1420 (desktop), API proxy in web dev
- `tsconfig.json` — frontend only (`include: ["src"]`)
- `api/tsconfig.json` — serverless handlers
- `src-tauri/tauri.conf.json` — window, bundle, updater pubkey/endpoints
- `src-tauri/capabilities/default.json` — Tauri capability permissions
- `vercel.json` — install/build/output, SPA rewrite excluding `/api/*`

## Platform Requirements

- Node.js 20+
- npm
- Rust stable + Tauri 2 platform prerequisites (WebKitGTK on Linux, etc.)
- Desktop: `npm run tauri dev` (Vite on `1420`)
- Web: `npm run dev:web` (Vite on `5173`; optional proxy to local API on `3000`)
- Desktop: Tauri release bundles under `src-tauri/target/release/bundle/` via `npm run tauri build` / tag-driven GitHub Actions release
- Web: static `dist/` from `npm run build:web` on Vercel; serverless functions under `api/`
- Optional GitHub Pages workflow present (`.github/workflows/pages.yml`)

## Scripts (npm)

| Script | Purpose |
|--------|---------|
| `dev` | Desktop Vite dev server (port 1420) |
| `dev:web` | Web Vite (`--mode web`, port 5173) |
| `build` | `tsc && vite build` (desktop frontend dist) |
| `build:web` | Web production build |
| `preview:web` | Preview web dist |
| `test` | `vitest run` |
| `tauri` | Tauri CLI |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- React components: `PascalCase.tsx` — e.g. `GeneralSection.tsx`, `FormControls.tsx`, `WebShell.tsx`
- Section editors live under `src/components/sections/` with `*Section.tsx` suffix
- Shared non-UI logic: `camelCase.ts` under `src/lib/` — e.g. `preferencesCore.ts`, `fields.ts`, `validators.ts`
- Hooks: `use` + PascalCase file — `src/hooks/useDirty.ts`, `src/hooks/useMediaQuery.ts`
- Platform adapters: `camelCase.ts` / `camelCase.tsx` under `src/platform/` — `webBackend.ts`, `tauriBackend.ts`, `backend.tsx`
- Platform entry shells: `App.tsx`, `App.web.tsx`, `App.desktop.tsx`, `WebApp.tsx`, `DesktopApp.tsx`, `ConfigApp.tsx`
- Tests: co-located `*.test.ts` next to source — e.g. `src/lib/preferencesCore.test.ts`
- API routes (Vercel): `kebab-case.ts` under `api/` — `submit-preset.ts`, `oauth-config.ts`
- Rust modules: `snake_case.rs` under `src-tauri/src/` — `core.rs`, `lib.rs`, `main.rs`
- Prefer named `export function foo()` over default exports for modules and components
- Hooks: `useDirty`, `useMediaQuery`, `useConfigBackend`
- Updaters in sections often use a local `set` helper:  
- Validators: factory names describe the rule — `isEnum`, `numInRange`, `nonEmpty`, `validPath`, `cronExpr`, `all` in `src/lib/validators.ts`
- Platform helpers: verb-first — `loadPreferencesFromText`, `serializePreferences`, `readJson`, `writeJson`
- `camelCase` for locals and React state (`prefs`, `originalPrefs`, `filePath`)
- Env / storage keys as string constants in `SCREAMING_SNAKE` or dotted product keys — e.g. `STORE_VERSION`, `KEYS_STORE = "gsd-pi-config.web.keys"` in `src/platform/webBackend.ts`
- Preference **JSON paths** and **YAML field names** use **snake_case** to match GSD Pi on-disk schema (`mode`, `token_profile`, `remote_questions.channel_id`) — defined in `src/types.ts` and registered in `src/lib/fields.ts`
- Interfaces / object types: `PascalCase` — `GSDPreferences`, `FieldMeta`, `PreferencesPlatform`, `DirtyState`
- String unions: `PascalCase` type aliases — `WorkflowMode`, `TokenProfile`, `SectionId`
- Prefer `type` for unions and aliases; `interface` for object shapes (`src/types.ts`, `src/platform/types.ts`)
- Validator function type: `export type Validator = (value: unknown) => string | null`
- Prefer `unknown` + narrow over `any`; use `as` casts only at parse boundaries (YAML/JSON)

## Code Style

- No Prettier or Biome config in repo — match surrounding file style
- Double quotes for strings in TypeScript/TSX
- Semicolons present
- 2-space indentation
- Trailing commas in multi-line argument/object lists where already used
- Prefer early returns over deep nesting (`src/lib/preferencesCore.ts`, `src/lib/validators.ts`)
- No ESLint config detected
- TypeScript is the primary static gate: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames` in `tsconfig.json`
- Build runs `tsc && vite build` (`package.json` scripts `build` / `build:web`) — unused locals/params fail the build
- `"type": "module"` in `package.json`
- `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true`
- `include` is only `src` — `api/` has its own `api/tsconfig.json` for Vercel

## File Headers

## Import Organization

- Not detected — use relative paths (`../types`, `../../lib/fields`)
- Named hooks and types from `"react"`: `useEffect`, `useId`, `useMemo`, `type ReactNode`
- No default `import React from "react"` (classic runtime not required)

## Error Handling

- **Validators:** return `string | null` — `null` means valid; never throw for user input (`src/lib/validators.ts`). Wire through `Field` + `path` + `value` so errors render inline (`src/components/FormControls.tsx`)
- **Parse / domain errors:** `throw new Error("...")` with a clear message at boundaries (`loadPreferencesFromText` root-not-object; web library path errors in `src/platform/webBackend.ts`)
- **UI async flows:** `try / catch` in `ConfigApp.tsx`, gallery/OAuth pages — surface via React state (`setError(\`...\${String(e)}\`)`) rather than uncaught rejections
- **Defensive parse:** empty `catch` with safe fallback is intentional for snapshot/localStorage JSON — e.g. `useDirty` falls back to `{}`; `readJson` returns `fallback` (`src/hooks/useDirty.ts`, `src/platform/webBackend.ts`)
- **Context hooks:** fail loud if provider missing — `throw new Error("useConfigBackend requires ConfigBackendProvider")` in `src/platform/backend.tsx`
- **Platform mismatch:** desktop-only methods throw instructing the correct API (`src/platform/tauri.ts`)
- Prefer `string | null` validators for form fields
- Convert caught errors with `String(e)` for banners
- Do not log secrets; use `redactSensitive` / `scanForLeakedSecrets` when sharing or submitting presets (`src/lib/preferencesCore.ts`)

## Logging

- Frontend: no shared logger — user-visible `setError` / banners (`src/lib/uiClasses.ts` `bannerDanger`)
- Rust desktop: `log` crate + `tauri-plugin-log` (see `src-tauri/Cargo.toml`)
- Avoid `console.log` for normal control flow in new code
- Prefer UI error state for operator-facing failures

## Comments

- Module-level purpose and contracts (field registry must stay in sync with sections)
- Non-obvious product rules (cascade presets, snowflake `channel_id` coercion, dirty fallback for unregistered keys)
- Regression notes that explain *why* (Rust tests document Discord snowflake precision)
- Use `/** ... */` on exported functions and non-obvious props (`parseFrontmatter`, `useDirty`, `FieldProps.path`)
- Keep short; do not restate the type signature
- Optional banner comments: `// ─── Registry ─────────────────────────────────` in long files (`src/lib/fields.ts`, `src-tauri/src/core.rs`)

## Function Design

- Keep pure helpers small and single-purpose (`validators.ts`, `preferencesCore.ts`)
- Large UI surfaces exist (`ConfigApp.tsx`, section files) — prefer extracting pure logic to `src/lib/` rather than growing section files further
- Section components: controlled props `{ prefs, onChange }` (and extra docs when needed)
- Prefer explicit options objects only when arity grows; current code favors positional params for small helpers
- Generics for typed key updates: `<K extends keyof GSDPreferences>`
- Validators: `string | null`
- Loaders: concrete types (`GSDPreferences`, `LoadAllResult`)
- Async platform APIs: `Promise<...>`
- Prefer spread updates `{ ...prefs, [key]: val }` for React state
- Mutating helpers document intent (`redactSensitive`, `normalizeStringyIds` mutate in place for efficiency) — do not mutate React state objects without cloning first (`structuredClone` in serialize/share paths)

## Module Design

- Named exports only for shared modules; avoid default exports for lib/components unless the file is an app entry
- Re-export platform surface from `src/platform/index.ts` when adding adapters
- Minimal — `src/platform/index.ts` for platform; sections import FormControls and lib modules directly
- Do not invent deep barrels for `sections/`
- Every editable preference path must be registered in `src/lib/fields.ts` with section, label, type, and optional validator/keywords
- `FieldPath` / registry is the build-time contract for palette search, dirty tracking, and hints
- When adding a UI field: update `src/types.ts` (if schema), section component, **and** `src/lib/fields.ts`
- UI talks to `ConfigBackend` / platform types (`src/platform/backend.tsx`, `src/platform/types.ts`)
- Web: localStorage draft + download (`webBackend.ts`); desktop: Tauri commands (`tauriBackend.ts`, `src-tauri/src/lib.rs`)
- Prefer pure TS in `src/lib/preferencesCore.ts` for YAML/frontmatter so web and tests do not need Tauri; keep Rust `core.rs` as the desktop source of truth for the same rules
- Prefer shared tokens from `src/lib/uiClasses.ts` and design tokens (`gsd-*` Tailwind/CSS classes from `src/index.css`)
- Follow `.agents/context/DESIGN.md`: cyan accent sparingly, no glass cards / gradient text / native multi-select listboxes

## React Patterns

- Function components only
- Controlled form state lifted to `ConfigApp` / shell; sections are presentational + local UI state
- Accessibility: `role="switch"`, `aria-checked`, `aria-label`, `role="tooltip"` on controls (`FormControls.tsx`)
- `data-field-path` / `data-invalid` attributes for field targeting
- Prefer `useState` + `useCallback` + `useMemo` over external state libraries (none present)
- Dirty tracking via JSON snapshot string + `useDirty` (`src/hooks/useDirty.ts`)

## Rust Conventions (desktop)

- `snake_case` functions; module docs at file top
- Pure filesystem/YAML logic in `src-tauri/src/core.rs` (no Tauri types) so CLI can reuse later
- Commands and IPC live in `src-tauri/src/lib.rs`
- Prefer `Result` + `expect` only in tests/lock poison paths; user-facing failures propagate as errors to the frontend
- `serde` / `serde_json::Value` / `serde_yaml` for preferences documents
- Mirror TS behavior for sensitive redaction and stringy IDs when changing either side

## API / Serverless

- Env vars read via `process.env.*` with safe defaults where non-secret (`PRESETS_REPO`)
- Throw `Error` for misconfiguration; map to HTTP status in the handler
- Keep secrets server-side only (`GITHUB_CLIENT_SECRET` — never ship to Vite client)

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Bootstrap | Theme + storage migration; platform-split dynamic import | `src/main.tsx` |
| Web routes | Gallery, wizard, OAuth callback, config app | `src/App.web.tsx` |
| Desktop entry | Re-exports `DesktopApp` | `src/App.desktop.tsx` |
| Config shell | Load/save three docs, section nav, dirty tracking, modals | `src/ConfigApp.tsx` |
| Backend contract | Platform I/O for prefs/models/settings/skills/agents/keys | `src/platform/backend.tsx` |
| Tauri backend | `invoke` wrappers + dialogs | `src/platform/tauriBackend.ts`, `src/platform/tauri.ts` |
| Web backend | localStorage + downloads | `src/platform/webBackend.ts` |
| Section switch | Maps `SectionId` → section component | `src/components/PreferencesSections.tsx` |
| Preferences domain types | `GSDPreferences`, models types | `src/types.ts` |
| Shared YAML core (TS) | Frontmatter parse/serialize, redaction (mirrors Rust) | `src/lib/preferencesCore.ts` |
| Tauri command layer | IPC surface, keyring, skills/agents FS | `src-tauri/src/lib.rs` |
| Core FS/YAML (Rust) | Path resolution, atomic write, locks, normalize IDs | `src-tauri/src/core.rs` |
| Preset submit API | GitHub OAuth + PR to presets repo | `api/submit-preset.ts` |

## Pattern Overview

- Build-time platform flag: `import.meta.env.VITE_PLATFORM` set in `vite.config.ts` (`web` vs desktop default)
- Single shared `ConfigApp` with `variant: "desktop" | "web"` instead of forked UIs
- Section-based preference editors driven by `SECTION_GROUPS` in `src/components/Sidebar.tsx`
- Optimistic local state + dirty detection; explicit Save (desktop writes disk; web persists draft and downloads files)
- Rust `core` kept free of Tauri types for reuse (CLI future noted in comments)

## Layers

- Purpose: Navigation, forms, modals, keyboard palette
- Location: `src/components/`, `src/pages/`, `src/ConfigApp.tsx`
- Contains: Section components under `src/components/sections/`, shared controls in `FormControls.tsx`
- Depends on: `useConfigBackend()`, types, `lib/*` helpers
- Used by: Platform entry shells only
- Purpose: Own prefs/models/settings state, scope, dirty flags, save orchestration
- Location: `src/ConfigApp.tsx`, `src/hooks/useDirty.ts`
- Depends on: `ConfigBackend`, section config, updater (desktop)
- Used by: All section components via props / context
- Purpose: Hide filesystem vs localStorage vs keychain differences
- Location: `src/platform/`
- Contains: `ConfigBackend` implementations, legacy `PreferencesPlatform` (`types.ts`, `web.ts`, `tauri.ts`)
- Depends on: `@tauri-apps/*` (desktop) or `localStorage` + `preferencesCore` (web)
- Used by: `ConfigApp`, library sections, API keys section
- Purpose: Parse/serialize preferences, clean empty fields, field metadata, validators
- Location: `src/lib/preferencesCore.ts`, `cleanPrefs.ts`, `fields.ts`, `validators.ts`, `agentSettings.ts`
- Depends on: `yaml` package, `types.ts`
- Used by: backends and UI
- Purpose: Real FS, OS keychain, dialogs, auto-update; serverless GitHub integration
- Location: `src-tauri/src/`, `api/`
- Depends on: Tauri 2 plugins, `keyring`, GitHub API
- Used by: frontend via `invoke` or `fetch('/api/...')`

## Data Flow

### Primary load path (desktop)

### Primary save path (desktop)

### Primary path (web)

### Preset share / import

- React `useState` in `ConfigApp` for documents; no Redux/Zustand
- Dirty: field-level paths for preferences (`useDirty` + `fields.ts`); full-document JSON compare for models/settings
- Scope/project path and recent projects in `localStorage` keys `gsd-pi-config.*`
- Close guard on desktop via `useCloseRequested` + dirty ref (`src/lib/tauriListeners.ts`)

## Key Abstractions

- Purpose: Single interface for all config I/O used by the shell and library UIs
- Examples: `src/platform/backend.tsx`, `tauriBackend.ts`, `webBackend.ts`
- Pattern: Strategy + React context (`ConfigBackendProvider` / `useConfigBackend`)
- Purpose: Separate concerns — GSD preferences (YAML MD), custom models registry, agent runtime settings
- Paths (desktop global): `~/.gsd/preferences.md`, `~/.gsd/agent/models.json`, `~/.gsd/agent/settings.json`
- Project scope: under `<project>/.gsd/`
- Pattern: Independent dirty domains; mtime optimistic concurrency on JSON docs
- Purpose: Navigation taxonomy and section renderer switch
- Examples: `src/components/Sidebar.tsx`, `PreferencesSections.tsx`
- Pattern: Exhaustive `switch` on section id; web filters via `filterSectionGroups`
- Purpose: Same frontmatter/YAML rules on both platforms; snowflake ID string coercion before JS number precision loss
- Examples: `src/lib/preferencesCore.ts`, `src-tauri/src/core.rs`
- Pattern: Dual implementation kept intentionally mirrored
- Purpose: Filesystem-backed libraries (desktop) or `web://` virtual paths (web storage)
- Examples: `SkillsLibrarySection.tsx`, `AgentsLibrarySection.tsx`, Rust scan in `lib.rs`

## Entry Points

- Location: `src/main.tsx`
- Triggers: Vite/Tauri window load
- Responsibilities: `migrateLegacyStorageKeys`, `bootstrapTheme`, dynamic platform app import
- Location: `src-tauri/src/main.rs` → `app_lib::run()` in `lib.rs`
- Triggers: Tauri app start
- Responsibilities: Plugins (dialog, opener, updater, process, log), keyring migration, command registration
- Location: `src/App.web.tsx`
- Triggers: Browser navigation
- Routes: `/` config, `/gallery`, `/new` wizard, `/oauth/callback`, redirect `/edit` → `/`
- Location: `api/submit-preset.ts`, `api/oauth-config.ts`
- Triggers: Vercel `/api/*` (dev proxy in `vite.config.ts` to port 3000)

## Architectural Constraints

- **Threading:** UI single-threaded (browser event loop). Rust command handlers run on Tauri async/runtime; per-file `Mutex` in `core.rs` serializes concurrent saves to the same path
- **Global state:** Module-level platform singletons (`tauriBackend`, `webBackend`); React context for backend; no shared mutable prefs store outside `ConfigApp`
- **Circular imports:** Prefer sections → backend/hooks/lib; avoid sections importing `ConfigApp`. Types live in `types.ts` / section files for library info types
- **Platform split:** Never call `@tauri-apps/*` from web-only bundles without dynamic/guarded paths; use `ConfigBackend` or `isWebPlatform()`
- **Secrets:** API keys go to OS keychain (desktop) or isolated web key store — not into `preferences.md` share exports (redaction)
- **Dual YAML implementations:** Changing frontmatter rules requires updates in both `preferencesCore.ts` and `core.rs`

## Anti-Patterns

### Calling Tauri invoke from a section without backend

### Saving models/settings through `cleanPrefs`

### Treating channel_id as a number

### Duplicating section visibility rules

## Error Handling

- Backend methods return `Promise` rejections as strings / `Err(String)` from Rust
- Models/settings stale writes: detect `STALE:` prefix and show reload guidance
- Missing project path / missing files: load empty object rather than hard fail for preferences
- Web: ignore localStorage quota/parse failures with fallbacks where appropriate

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
