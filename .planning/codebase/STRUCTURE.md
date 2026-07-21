# Codebase Structure

**Analysis Date:** 2026-07-21

## Directory Layout

```
gsd-pi-config/
├── api/                    # Vercel serverless (OAuth + preset submit)
├── dist/                   # Vite build output (generated)
├── docs/                   # Screenshots / product docs assets
├── public/                 # Static assets (e.g. og.png)
├── src/                    # React + TypeScript frontend
│   ├── assets/             # Logos/images
│   ├── components/         # Shared UI + section editors
│   │   └── sections/       # One file per preferences section
│   ├── hooks/              # React hooks (dirty, media query)
│   ├── lib/                # Pure/domain helpers (YAML, fields, presets)
│   ├── pages/              # Web-only routes (gallery, wizard, OAuth)
│   ├── platform/           # ConfigBackend + web/tauri adapters
│   ├── App.desktop.tsx     # Desktop default export
│   ├── App.web.tsx         # Web router
│   ├── App.tsx             # Re-export desktop App
│   ├── ConfigApp.tsx       # Shared config shell
│   ├── DesktopApp.tsx      # Tauri provider shell
│   ├── WebApp.tsx          # Web provider shell
│   ├── constants.ts        # Model catalog etc.
│   ├── main.tsx            # Bootstrap entry
│   ├── types.ts            # GSDPreferences and related types
│   └── index.css           # Global + Tailwind
├── src-tauri/              # Tauri 2 / Rust native host
│   ├── capabilities/       # Tauri capability JSON
│   ├── icons/              # App icons
│   ├── src/
│   │   ├── main.rs         # Binary entry
│   │   ├── lib.rs          # Commands + app builder
│   │   └── core.rs         # FS/YAML primitives
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html              # Vite HTML shell
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
```

## Directory Purposes

**`src/`:**
- Purpose: All frontend application code
- Contains: React components, platform adapters, domain libs, web pages
- Key files: `main.tsx`, `ConfigApp.tsx`, `types.ts`

**`src/components/`:**
- Purpose: Reusable chrome (sidebar, modals, form controls) and section UIs
- Contains: `sections/*Section.tsx`, modals, `PreferencesSections.tsx` switch
- Key files: `Sidebar.tsx` (section registry), `FormControls.tsx`, `PreferencesSections.tsx`

**`src/components/sections/`:**
- Purpose: One editor module per settings area
- Contains: Preference forms, library editors, API keys, agent settings
- Key files: `GeneralSection.tsx`, `ApiKeysSection.tsx`, `AgentSettingsSection.tsx`, `SkillsLibrarySection.tsx`

**`src/platform/`:**
- Purpose: Desktop vs web I/O boundary
- Contains: Backend interface, tauri/web implementations, draft helpers
- Key files: `backend.tsx`, `tauriBackend.ts`, `webBackend.ts`, `tauri.ts`, `web.ts`

**`src/lib/`:**
- Purpose: Non-UI domain and utilities
- Contains: YAML core, cleaners, field definitions, presets catalog, theme, keyboard, updater
- Key files: `preferencesCore.ts`, `fields.ts`, `sectionConfig.ts`, `cleanPrefs.ts`

**`src/pages/`:**
- Purpose: Web-only multi-page flows outside the main config shell
- Contains: Gallery, new-preset wizard, OAuth callback
- Key files: `GalleryPage.tsx`, `WizardPage.tsx`, `OAuthCallbackPage.tsx`

**`src/hooks/`:**
- Purpose: Small React hooks shared by shell/UI
- Key files: `useDirty.ts`, `useMediaQuery.ts`

**`src-tauri/`:**
- Purpose: Native desktop host, IPC commands, secure storage
- Contains: Rust sources, Tauri config, icons, capabilities
- Key files: `src/lib.rs`, `src/core.rs`, `tauri.conf.json`

**`api/`:**
- Purpose: Deployed serverless endpoints for web community presets
- Contains: TypeScript Vercel handlers
- Key files: `submit-preset.ts`, `oauth-config.ts`, `tsconfig.json`

**`dist/`:**
- Purpose: Production web/desktop frontend bundle
- Generated: Yes
- Committed: Typically build artifact (present in tree; treat as generated)

**`.planning/`:**
- Purpose: GSD planning artifacts including this codebase map
- Generated: Partially by map/plan commands
- Committed: Yes when used for workflow

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Frontend bootstrap
- `src/App.web.tsx`: Web routing
- `src/App.desktop.tsx` / `src/DesktopApp.tsx`: Desktop shell
- `src-tauri/src/main.rs`: Native binary
- `src-tauri/src/lib.rs`: Tauri `run()` + command table
- `api/submit-preset.ts`: Preset PR API

**Configuration:**
- `package.json`: npm scripts (`dev`, `dev:web`, `build`, `build:web`, `test`, `tauri`)
- `vite.config.ts`: modes, `VITE_PLATFORM`, ports (1420 desktop / 5173 web), vitest include
- `tsconfig.json`: TypeScript project
- `src-tauri/tauri.conf.json`: App identity, updater, windows
- `src-tauri/Cargo.toml`: Rust deps (tauri 2, keyring, serde_yaml)
- `vercel.json`: Web deploy routing
- `.env.web` / `.env.web.example`: Web env (existence only; do not commit secrets)

**Core Logic:**
- `src/ConfigApp.tsx`: Shell state machine (load/save/dirty/scope)
- `src/platform/backend.tsx`: `ConfigBackend` contract
- `src/lib/preferencesCore.ts`: TS preferences serialization
- `src-tauri/src/core.rs`: Rust preferences/JSON FS core
- `src/types.ts`: Preference type surface
- `src/constants.ts`: Built-in model catalog

**Testing:**
- `src/lib/preferencesCore.test.ts`: Vitest unit tests (pattern `src/**/*.test.ts`)
- Rust unit tests: `#[cfg(test)]` modules in `src-tauri/src/lib.rs` (and core as applicable)
- Config: `vite.config.ts` `test` block; run via `npm test`

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `GeneralSection.tsx`, `ConfigApp.tsx`)
- Platform/entry variants: `App.desktop.tsx`, `App.web.tsx`
- Libraries/utilities: `camelCase.ts` (e.g. `preferencesCore.ts`, `cleanPrefs.ts`)
- Tests: co-located `*.test.ts` under `src/`
- Rust modules: `snake_case.rs` (`core.rs`, `lib.rs`, `main.rs`)
- API routes: `kebab-case.ts` matching Vercel path (`submit-preset.ts`)

**Directories:**
- Plural feature folders: `components/`, `hooks/`, `pages/`, `sections/`
- Adapter layer: `platform/` (not `backends/`)

**Identifiers:**
- Section ids: kebab-case string unions (`"api-keys"`, `"skills-library"`) from `Sidebar.tsx`
- localStorage keys: `gsd-pi-config.*` prefix
- Tauri commands: `snake_case` (`load_preferences`, `list_skills`)
- React props/handlers: `onChange`, `prefs`, camelCase

## Where to Add New Code

**New preferences section (desktop + web):**
1. Add id/label to `SECTION_GROUPS` in `src/components/Sidebar.tsx`
2. Extend `GSDPreferences` (or related types) in `src/types.ts` if needed
3. Add field metadata in `src/lib/fields.ts` for dirty/palette if applicable
4. Create `src/components/sections/YourSection.tsx`
5. Wire case in `renderPreferencesSection` in `src/components/PreferencesSections.tsx`
6. If web-hidden: add id to `WEB_HIDDEN_SECTIONS` in `src/lib/sectionConfig.ts`

**New filesystem capability (desktop):**
1. Implement pure path/IO in `src-tauri/src/core.rs` when reusable
2. Expose `#[tauri::command]` in `src-tauri/src/lib.rs` and register in `generate_handler!`
3. Add method to `ConfigBackend` in `src/platform/backend.tsx`
4. Implement in `tauriBackend.ts` (and stub/web-equivalent in `webBackend.ts`)
5. Call only via `useConfigBackend()` from UI

**New pure helper:**
- Implementation: `src/lib/<name>.ts`
- Tests: `src/lib/<name>.test.ts`

**New web-only page:**
- Page component: `src/pages/YourPage.tsx`
- Route: `src/App.web.tsx`

**New serverless endpoint:**
- Handler: `api/<name>.ts`
- Ensure env vars documented in README / `.env.web.example` without values

**Shared form UI:**
- Prefer controls in `src/components/FormControls.tsx` and classes in `src/lib/uiClasses.ts`

## Special Directories

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`src-tauri/icons/`:**
- Purpose: Platform packaging icons
- Generated: No (source assets)
- Committed: Yes

**`src-tauri/capabilities/`:**
- Purpose: Tauri 2 permission capability manifests
- Generated: No
- Committed: Yes

**`dist/`:**
- Purpose: Frontend build output
- Generated: Yes (`vite build` / `build:web`)
- Committed: Present in workspace; do not hand-edit

**`.agents/` / `.planning/`:**
- Purpose: Agent context and GSD planning docs
- Generated: Mixed
- Committed: Planning docs yes when used

## Import / Placement Rules (prescriptive)

- UI sections must not import `ConfigApp` or platform-specific invoke helpers for I/O — use `useConfigBackend()`
- Prefer `src/lib/*` for logic reusable by web and desktop
- Keep Tauri-only UI (project folder picker, auto-update banner) gated on `variant === "desktop"` or `backend.isWeb()`
- Mirror serialization changes in both `preferencesCore.ts` and `core.rs`
- Co-locate section-specific editor subcomponents next to the section (e.g. `agentSettingsEditors.tsx` beside `AgentSettingsSection.tsx`)

---

*Structure analysis: 2026-07-21*
