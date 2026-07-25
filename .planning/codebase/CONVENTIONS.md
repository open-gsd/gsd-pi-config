# Coding Conventions

**Analysis Date:** 2026-07-21

## Naming Patterns

**Files:**
- React components: `PascalCase.tsx` — e.g. `GeneralSection.tsx`, `FormControls.tsx`, `WebShell.tsx`
- Section editors live under `src/components/sections/` with `*Section.tsx` suffix
- Shared non-UI logic: `camelCase.ts` under `src/lib/` — e.g. `preferencesCore.ts`, `fields.ts`, `validators.ts`
- Hooks: `use` + PascalCase file — `src/hooks/useDirty.ts`, `src/hooks/useMediaQuery.ts`
- Platform adapters: `camelCase.ts` / `camelCase.tsx` under `src/platform/` — `webBackend.ts`, `tauriBackend.ts`, `backend.tsx`
- Platform entry shells: `App.tsx`, `App.web.tsx`, `App.desktop.tsx`, `WebApp.tsx`, `DesktopApp.tsx`, `ConfigApp.tsx`
- Tests: co-located `*.test.ts` next to source — e.g. `src/lib/preferencesCore.test.ts`
- API routes (Vercel): `kebab-case.ts` under `api/` — `submit-preset.ts`, `oauth-config.ts`
- Rust modules: `snake_case.rs` under `src-tauri/src/` — `core.rs`, `lib.rs`, `main.rs`

**Functions:**
- Prefer named `export function foo()` over default exports for modules and components
- Hooks: `useDirty`, `useMediaQuery`, `useConfigBackend`
- Updaters in sections often use a local `set` helper:  
  `const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) => onChange({ ...prefs, [key]: val });`  
  (see `src/components/sections/GeneralSection.tsx`)
- Validators: factory names describe the rule — `isEnum`, `numInRange`, `nonEmpty`, `validPath`, `cronExpr`, `all` in `src/lib/validators.ts`
- Platform helpers: verb-first — `loadPreferencesFromText`, `serializePreferences`, `readJson`, `writeJson`

**Variables:**
- `camelCase` for locals and React state (`prefs`, `originalPrefs`, `filePath`)
- Env / storage keys as string constants in `SCREAMING_SNAKE` or dotted product keys — e.g. `STORE_VERSION`, `KEYS_STORE = "gsd-pi-config.web.keys"` in `src/platform/webBackend.ts`
- Preference **JSON paths** and **YAML field names** use **snake_case** to match GSD Pi on-disk schema (`mode`, `token_profile`, `remote_questions.channel_id`) — defined in `src/types.ts` and registered in `src/lib/fields.ts`

**Types:**
- Interfaces / object types: `PascalCase` — `GSDPreferences`, `FieldMeta`, `PreferencesPlatform`, `DirtyState`
- String unions: `PascalCase` type aliases — `WorkflowMode`, `TokenProfile`, `SectionId`
- Prefer `type` for unions and aliases; `interface` for object shapes (`src/types.ts`, `src/platform/types.ts`)
- Validator function type: `export type Validator = (value: unknown) => string | null`
- Prefer `unknown` + narrow over `any`; use `as` casts only at parse boundaries (YAML/JSON)

## Code Style

**Formatting:**
- No Prettier or Biome config in repo — match surrounding file style
- Double quotes for strings in TypeScript/TSX
- Semicolons present
- 2-space indentation
- Trailing commas in multi-line argument/object lists where already used
- Prefer early returns over deep nesting (`src/lib/preferencesCore.ts`, `src/lib/validators.ts`)

**Linting:**
- No ESLint config detected
- TypeScript is the primary static gate: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames` in `tsconfig.json`
- Build runs `tsc && vite build` (`package.json` scripts `build` / `build:web`) — unused locals/params fail the build

**TypeScript module system:**
- `"type": "module"` in `package.json`
- `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true`
- `include` is only `src` — `api/` has its own `api/tsconfig.json` for Vercel

## File Headers

Every source file starts with a short banner:

```typescript
// GSD Pi Config - <short description>
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
```

Optional blank-line-then-`//` paragraph for module purpose (see `src/lib/fields.ts`, `src/hooks/useDirty.ts`, `src/lib/validators.ts`). Mirror this on new files.

## Import Organization

**Order (observed):**
1. External packages (`react`, `react-dom`, `yaml`, `@tauri-apps/*`, `react-router-dom`)
2. Type-only imports: `import type { ... } from "..."`
3. Relative modules: components → lib → hooks → platform → types
4. Keep `import type` separate from value imports when only types are needed

**Path Aliases:**
- Not detected — use relative paths (`../types`, `../../lib/fields`)

**React imports:**
- Named hooks and types from `"react"`: `useEffect`, `useId`, `useMemo`, `type ReactNode`
- No default `import React from "react"` (classic runtime not required)

## Error Handling

**Patterns:**
- **Validators:** return `string | null` — `null` means valid; never throw for user input (`src/lib/validators.ts`). Wire through `Field` + `path` + `value` so errors render inline (`src/components/FormControls.tsx`)
- **Parse / domain errors:** `throw new Error("...")` with a clear message at boundaries (`loadPreferencesFromText` root-not-object; web library path errors in `src/platform/webBackend.ts`)
- **UI async flows:** `try / catch` in `ConfigApp.tsx`, gallery/OAuth pages — surface via React state (`setError(\`...\${String(e)}\`)`) rather than uncaught rejections
- **Defensive parse:** empty `catch` with safe fallback is intentional for snapshot/localStorage JSON — e.g. `useDirty` falls back to `{}`; `readJson` returns `fallback` (`src/hooks/useDirty.ts`, `src/platform/webBackend.ts`)
- **Context hooks:** fail loud if provider missing — `throw new Error("useConfigBackend requires ConfigBackendProvider")` in `src/platform/backend.tsx`
- **Platform mismatch:** desktop-only methods throw instructing the correct API (`src/platform/tauri.ts`)

**Do this:**
- Prefer `string | null` validators for form fields
- Convert caught errors with `String(e)` for banners
- Do not log secrets; use `redactSensitive` / `scanForLeakedSecrets` when sharing or submitting presets (`src/lib/preferencesCore.ts`)

## Logging

**Framework:**
- Frontend: no shared logger — user-visible `setError` / banners (`src/lib/uiClasses.ts` `bannerDanger`)
- Rust desktop: `log` crate + `tauri-plugin-log` (see `src-tauri/Cargo.toml`)

**Patterns:**
- Avoid `console.log` for normal control flow in new code
- Prefer UI error state for operator-facing failures

## Comments

**When to Comment:**
- Module-level purpose and contracts (field registry must stay in sync with sections)
- Non-obvious product rules (cascade presets, snowflake `channel_id` coercion, dirty fallback for unregistered keys)
- Regression notes that explain *why* (Rust tests document Discord snowflake precision)

**JSDoc/TSDoc:**
- Use `/** ... */` on exported functions and non-obvious props (`parseFrontmatter`, `useDirty`, `FieldProps.path`)
- Keep short; do not restate the type signature

**Section dividers:**
- Optional banner comments: `// ─── Registry ─────────────────────────────────` in long files (`src/lib/fields.ts`, `src-tauri/src/core.rs`)

## Function Design

**Size:**
- Keep pure helpers small and single-purpose (`validators.ts`, `preferencesCore.ts`)
- Large UI surfaces exist (`ConfigApp.tsx`, section files) — prefer extracting pure logic to `src/lib/` rather than growing section files further

**Parameters:**
- Section components: controlled props `{ prefs, onChange }` (and extra docs when needed)
- Prefer explicit options objects only when arity grows; current code favors positional params for small helpers
- Generics for typed key updates: `<K extends keyof GSDPreferences>`

**Return Values:**
- Validators: `string | null`
- Loaders: concrete types (`GSDPreferences`, `LoadAllResult`)
- Async platform APIs: `Promise<...>`

**Immutability:**
- Prefer spread updates `{ ...prefs, [key]: val }` for React state
- Mutating helpers document intent (`redactSensitive`, `normalizeStringyIds` mutate in place for efficiency) — do not mutate React state objects without cloning first (`structuredClone` in serialize/share paths)

## Module Design

**Exports:**
- Named exports only for shared modules; avoid default exports for lib/components unless the file is an app entry
- Re-export platform surface from `src/platform/index.ts` when adding adapters

**Barrel Files:**
- Minimal — `src/platform/index.ts` for platform; sections import FormControls and lib modules directly
- Do not invent deep barrels for `sections/`

**Field registry contract:**
- Every editable preference path must be registered in `src/lib/fields.ts` with section, label, type, and optional validator/keywords
- `FieldPath` / registry is the build-time contract for palette search, dirty tracking, and hints
- When adding a UI field: update `src/types.ts` (if schema), section component, **and** `src/lib/fields.ts`

**Platform abstraction:**
- UI talks to `ConfigBackend` / platform types (`src/platform/backend.tsx`, `src/platform/types.ts`)
- Web: localStorage draft + download (`webBackend.ts`); desktop: Tauri commands (`tauriBackend.ts`, `src-tauri/src/lib.rs`)
- Prefer pure TS in `src/lib/preferencesCore.ts` for YAML/frontmatter so web and tests do not need Tauri; keep Rust `core.rs` as the desktop source of truth for the same rules

**UI class names:**
- Prefer shared tokens from `src/lib/uiClasses.ts` and design tokens (`gsd-*` Tailwind/CSS classes from `src/index.css`)
- Follow `.agents/context/DESIGN.md`: cyan accent sparingly, no glass cards / gradient text / native multi-select listboxes

## React Patterns

**Components:**
- Function components only
- Controlled form state lifted to `ConfigApp` / shell; sections are presentational + local UI state
- Accessibility: `role="switch"`, `aria-checked`, `aria-label`, `role="tooltip"` on controls (`FormControls.tsx`)
- `data-field-path` / `data-invalid` attributes for field targeting

**State:**
- Prefer `useState` + `useCallback` + `useMemo` over external state libraries (none present)
- Dirty tracking via JSON snapshot string + `useDirty` (`src/hooks/useDirty.ts`)

## Rust Conventions (desktop)

**Style:**
- `snake_case` functions; module docs at file top
- Pure filesystem/YAML logic in `src-tauri/src/core.rs` (no Tauri types) so CLI can reuse later
- Commands and IPC live in `src-tauri/src/lib.rs`
- Prefer `Result` + `expect` only in tests/lock poison paths; user-facing failures propagate as errors to the frontend

**Serialization:**
- `serde` / `serde_json::Value` / `serde_yaml` for preferences documents
- Mirror TS behavior for sensitive redaction and stringy IDs when changing either side

## API / Serverless

**Files:** `api/*.ts` with Vercel `VercelRequest` / `VercelResponse`
- Env vars read via `process.env.*` with safe defaults where non-secret (`PRESETS_REPO`)
- Throw `Error` for misconfiguration; map to HTTP status in the handler
- Keep secrets server-side only (`GITHUB_CLIENT_SECRET` — never ship to Vite client)

---

*Convention analysis: 2026-07-21*
