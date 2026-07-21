<!-- refreshed: 2026-07-21 -->
# Architecture

**Analysis Date:** 2026-07-21

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Entry: `src/main.tsx`                                                       │
│  VITE_PLATFORM → App.web | App.desktop                                       │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  Web: `App.web.tsx`           │  Desktop: `App.desktop.tsx` → DesktopApp     │
│  react-router routes          │  ConfigBackendProvider(tauriBackend)         │
│  WebApp → webBackend          │                                              │
└───────────────┬───────────────┴──────────────────┬──────────────────────────┘
                │                                  │
                ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Shared UI shell: `src/ConfigApp.tsx`                                        │
│  Sidebar · sections · dirty state · save · presets · scope (global/project)  │
│  Section router: `components/PreferencesSections.tsx`                        │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                ConfigBackend (`platform/backend.tsx`)
                ┌───────────────┴────────────────┐
                ▼                                ▼
┌───────────────────────────┐    ┌───────────────────────────────────────────┐
│  `platform/webBackend.ts` │    │  `platform/tauriBackend.ts`               │
│  localStorage drafts      │    │  invoke() → Tauri commands                │
│  download workspace ZIP   │    │  `src-tauri/src/lib.rs`                   │
└───────────────────────────┘    │         │                                 │
                                 │         ▼                                 │
                                 │  `src-tauri/src/core.rs`                  │
                                 │  paths, YAML/JSON, atomic write, locks    │
                                 └───────────┬───────────────────────────────┘
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  On-disk config (desktop)                                                    │
│  ~/.gsd/preferences.md · agent/settings.json · agent/models.json             │
│  project: <project>/.gsd/... · OS keychain · skills/agents under .claude     │
└─────────────────────────────────────────────────────────────────────────────┘

Web-only APIs (Vercel): `api/submit-preset.ts`, `api/oauth-config.ts`
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

**Overall:** Dual-platform React SPA with a **backend strategy interface** (`ConfigBackend`), backed by Tauri IPC on desktop and browser storage on web. Domain config is three independent documents (preferences markdown, models JSON, settings JSON) edited in one shell.

**Key Characteristics:**
- Build-time platform flag: `import.meta.env.VITE_PLATFORM` set in `vite.config.ts` (`web` vs desktop default)
- Single shared `ConfigApp` with `variant: "desktop" | "web"` instead of forked UIs
- Section-based preference editors driven by `SECTION_GROUPS` in `src/components/Sidebar.tsx`
- Optimistic local state + dirty detection; explicit Save (desktop writes disk; web persists draft and downloads files)
- Rust `core` kept free of Tauri types for reuse (CLI future noted in comments)

## Layers

**Presentation (React UI):**
- Purpose: Navigation, forms, modals, keyboard palette
- Location: `src/components/`, `src/pages/`, `src/ConfigApp.tsx`
- Contains: Section components under `src/components/sections/`, shared controls in `FormControls.tsx`
- Depends on: `useConfigBackend()`, types, `lib/*` helpers
- Used by: Platform entry shells only

**Application state (shell):**
- Purpose: Own prefs/models/settings state, scope, dirty flags, save orchestration
- Location: `src/ConfigApp.tsx`, `src/hooks/useDirty.ts`
- Depends on: `ConfigBackend`, section config, updater (desktop)
- Used by: All section components via props / context

**Platform adapter:**
- Purpose: Hide filesystem vs localStorage vs keychain differences
- Location: `src/platform/`
- Contains: `ConfigBackend` implementations, legacy `PreferencesPlatform` (`types.ts`, `web.ts`, `tauri.ts`)
- Depends on: `@tauri-apps/*` (desktop) or `localStorage` + `preferencesCore` (web)
- Used by: `ConfigApp`, library sections, API keys section

**Domain / pure logic:**
- Purpose: Parse/serialize preferences, clean empty fields, field metadata, validators
- Location: `src/lib/preferencesCore.ts`, `cleanPrefs.ts`, `fields.ts`, `validators.ts`, `agentSettings.ts`
- Depends on: `yaml` package, `types.ts`
- Used by: backends and UI

**Native / server:**
- Purpose: Real FS, OS keychain, dialogs, auto-update; serverless GitHub integration
- Location: `src-tauri/src/`, `api/`
- Depends on: Tauri 2 plugins, `keyring`, GitHub API
- Used by: frontend via `invoke` or `fetch('/api/...')`

## Data Flow

### Primary load path (desktop)

1. `main.tsx` loads `App.desktop` → `DesktopApp` provides `tauriBackend` (`src/DesktopApp.tsx`)
2. `ConfigApp` mounts; `load()` calls `backend.loadAll(activeProjectPath)` (`src/ConfigApp.tsx`)
3. `tauriLoadAll` invokes `load_preferences`, `load_models`, `load_settings` (`src/platform/tauri.ts`)
4. Rust resolves paths via `preferences_path` / `config_path` and returns JSON (+ mtimes for models/settings) (`src-tauri/src/core.rs`, `lib.rs`)
5. Shell sets `prefs`, `modelsDoc`, `settingsDoc` and stringified “original” baselines for dirty checks

### Primary save path (desktop)

1. User edits section → `onChange` updates shell state
2. `useDirty` / JSON compare marks dirty; Save enabled when `anyDirty`
3. `save()` independently saves dirty domains: preferences, models (with `expected_mtime_ms`), settings
4. Rust `save_*` uses per-path mutex + atomic write; models/settings reject stale mtimes (`STALE:`)

### Primary path (web)

1. `main.tsx` loads `App.web` with routes; `/` → `WebApp` + `webBackend`
2. Drafts live in `localStorage` keys under `gsd-pi-config.web.v1.*` (`src/platform/webBackend.ts`)
3. Save persists draft and triggers `downloadWorkspaceFiles` for installable files (`src/lib/downloadWorkspace.ts`)
4. Skills/agents libraries are web-hidden (`src/lib/sectionConfig.ts`); keys stored in browser key store not OS keychain

### Preset share / import

1. Export/import: Tauri file dialogs or web file/text (`tauri.ts` / `webBackend`)
2. Shareable clipboard: redacted YAML fenced block (`build_shareable_preset` / `preferencesCore.buildShareablePreset`)
3. Community submit (web): OAuth → `api/submit-preset.ts` opens PR against presets repo

**State Management:**
- React `useState` in `ConfigApp` for documents; no Redux/Zustand
- Dirty: field-level paths for preferences (`useDirty` + `fields.ts`); full-document JSON compare for models/settings
- Scope/project path and recent projects in `localStorage` keys `gsd-pi-config.*`
- Close guard on desktop via `useCloseRequested` + dirty ref (`src/lib/tauriListeners.ts`)

## Key Abstractions

**ConfigBackend:**
- Purpose: Single interface for all config I/O used by the shell and library UIs
- Examples: `src/platform/backend.tsx`, `tauriBackend.ts`, `webBackend.ts`
- Pattern: Strategy + React context (`ConfigBackendProvider` / `useConfigBackend`)

**Three config documents:**
- Purpose: Separate concerns — GSD preferences (YAML MD), custom models registry, agent runtime settings
- Paths (desktop global): `~/.gsd/preferences.md`, `~/.gsd/agent/models.json`, `~/.gsd/agent/settings.json`
- Project scope: under `<project>/.gsd/`
- Pattern: Independent dirty domains; mtime optimistic concurrency on JSON docs

**SectionId + SECTION_GROUPS:**
- Purpose: Navigation taxonomy and section renderer switch
- Examples: `src/components/Sidebar.tsx`, `PreferencesSections.tsx`
- Pattern: Exhaustive `switch` on section id; web filters via `filterSectionGroups`

**preferencesCore (TS) ↔ core.rs (Rust):**
- Purpose: Same frontmatter/YAML rules on both platforms; snowflake ID string coercion before JS number precision loss
- Examples: `src/lib/preferencesCore.ts`, `src-tauri/src/core.rs`
- Pattern: Dual implementation kept intentionally mirrored

**SkillInfo / AgentInfo:**
- Purpose: Filesystem-backed libraries (desktop) or `web://` virtual paths (web storage)
- Examples: `SkillsLibrarySection.tsx`, `AgentsLibrarySection.tsx`, Rust scan in `lib.rs`

## Entry Points

**Frontend bootstrap:**
- Location: `src/main.tsx`
- Triggers: Vite/Tauri window load
- Responsibilities: `migrateLegacyStorageKeys`, `bootstrapTheme`, dynamic platform app import

**Desktop native:**
- Location: `src-tauri/src/main.rs` → `app_lib::run()` in `lib.rs`
- Triggers: Tauri app start
- Responsibilities: Plugins (dialog, opener, updater, process, log), keyring migration, command registration

**Web SPA routes:**
- Location: `src/App.web.tsx`
- Triggers: Browser navigation
- Routes: `/` config, `/gallery`, `/new` wizard, `/oauth/callback`, redirect `/edit` → `/`

**Serverless API:**
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

**What happens:** Section imports `@tauri-apps/api` or `invoke` directly  
**Why it's wrong:** Breaks web build/runtime and skips the adapter contract  
**Do this instead:** Use `useConfigBackend()` from `src/platform/backend.tsx` (see `ApiKeysSection`, library sections)

### Saving models/settings through `cleanPrefs`

**What happens:** Running settings/models through preference cleaners  
**Why it's wrong:** Prunes empty permission arrays / free-form keys that must round-trip (`ConfigApp` comments)  
**Do this instead:** `cleanPrefs` only for preferences document; raw JSON for settings/models

### Treating channel_id as a number

**What happens:** Leaving Discord/Slack snowflakes as JSON numbers across the bridge  
**Why it's wrong:** Exceeds `Number.MAX_SAFE_INTEGER`; silent precision loss  
**Do this instead:** Rely on `normalize_stringy_ids` / `normalizeStringyIds` before IPC/JS parse

### Duplicating section visibility rules

**What happens:** Hard-coding “hide skills library on web” in multiple places  
**Why it's wrong:** Drift between nav and deep links  
**Do this instead:** `WEB_HIDDEN_SECTIONS` / `filterSectionGroups` in `src/lib/sectionConfig.ts`

## Error Handling

**Strategy:** Surface errors as shell-level string `error` state; domain-scoped save errors aggregated (preferences vs models vs settings)

**Patterns:**
- Backend methods return `Promise` rejections as strings / `Err(String)` from Rust
- Models/settings stale writes: detect `STALE:` prefix and show reload guidance
- Missing project path / missing files: load empty object rather than hard fail for preferences
- Web: ignore localStorage quota/parse failures with fallbacks where appropriate

## Cross-Cutting Concerns

**Logging:** Desktop debug: `tauri-plugin-log` at Info; web: no centralized logger (UI error banner)
**Validation:** `src/lib/validators.ts` + field metadata in `fields.ts`; section-level checks before display
**Authentication:** OS keychain for provider keys; GitHub OAuth only for web preset submission (`pages/OAuthCallbackPage.tsx`, `api/*`)
**Theming:** `src/lib/theme.ts` + `ThemeToggle`; CSS/Tailwind in `src/index.css`
**Updates:** Desktop-only `src/lib/updater.ts` via Tauri updater plugin
**Keyboard:** `src/lib/keyboard.ts` + command palette `components/Palette.tsx`

---

*Architecture analysis: 2026-07-21*
