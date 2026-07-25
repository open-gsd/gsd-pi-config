# Technology Stack

**Analysis Date:** 2026-07-21

## Languages

**Primary:**
- TypeScript (ES2020 target, strict mode) — React frontend (`src/`), Vite config, Vercel serverless handlers (`api/`)
- Rust (edition 2021, `rust-version = "1.77.2"`) — Tauri desktop backend (`src-tauri/`)

**Secondary:**
- CSS via Tailwind CSS 4 utility classes — `src/index.css` and component class helpers in `src/lib/uiClasses.ts`
- YAML — preferences frontmatter / serialization (`yaml` npm package; `serde_yaml` in Rust)
- Markdown — skill/agent definitions and preset files (parsed/written by app logic)

## Runtime

**Environment:**
- Node.js 20+ (README + CI `actions/setup-node` with `node-version: "20"`)
- Browser (web build) or system WebView via Tauri 2 (desktop)
- Rust stable toolchain for desktop builds

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (use `npm ci` in CI/Vercel)

**Rust package manager:**
- Cargo (`src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`)

## Frameworks

**Core:**
- React 19.2.x + React DOM — UI
- react-router-dom 7.x — web routing (gallery, wizard, OAuth callback, editor)
- Tauri 2.10.x — desktop shell (`@tauri-apps/api`, `src-tauri`)
- Vite 8.x — bundler/dev server (`vite.config.ts`)

**Testing:**
- Vitest 4.x — frontend unit tests (`npm test`, config under `vite.config.ts` `test` block)
- Cargo test — Rust backend tests (`src-tauri`, release workflow)

**Build/Dev:**
- `@vitejs/plugin-react` 6.x
- `@tailwindcss/vite` + `tailwindcss` 4.2.x
- TypeScript 6.x (`tsc && vite build`)
- `@tauri-apps/cli` 2.x — `npm run tauri`
- `@vercel/node` 5.x — typed serverless handlers for `api/`

## Key Dependencies

**Critical:**
- `@tauri-apps/api` + plugins (`dialog`, `opener`, `process`, `shell`, `updater`) — desktop FS dialogs, open external URLs, process relaunch, auto-update
- `yaml` — parse/serialize preference documents on the frontend (`src/lib/preferencesCore.ts`)
- `keyring` (Rust) — OS keychain for API keys (`src-tauri/src/lib.rs`)
- `serde` / `serde_json` / `serde_yaml` — Rust data interchange
- `dirs` — resolve home / config paths on desktop

**Infrastructure:**
- Tauri plugins: `tauri-plugin-log`, `dialog`, `opener`, `updater`, `process`
- Vercel serverless (`api/submit-preset.ts`, `api/oauth-config.ts`) for GitHub OAuth + preset PR submission
- GitHub Releases + Tauri updater (`latest.json` endpoint in `src-tauri/tauri.conf.json`)

## Configuration

**Environment:**
- Web Vite env: `.env.web` / `.env.web.example` / local overrides (e.g. `.env.web.local`)
  - `VITE_BASE_PATH`
  - `VITE_PRESETS_INDEX_URL`
  - `VITE_PRESETS_RAW_BASE_URL`
  - `VITE_PRESETS_CONTRIBUTING_URL`
  - `VITE_GITHUB_CLIENT_ID` (optional build-time OAuth client id)
  - `VITE_SUBMIT_PRESET_API_URL` (default `/api/submit-preset`)
- Serverless (Vercel project env, not committed):
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `PRESETS_REPO` (default `open-gsd/gsd-pi-presets`)
- Mode-injected: `import.meta.env.VITE_PLATFORM` = `"web"` | `"desktop"` (`vite.config.ts`)
- `.env` / `.env.web` exist for local config — **do not commit secrets**; never read secret values into docs

**Build:**
- `vite.config.ts` — dual mode (`web` vs default desktop), ports 5173 (web) / 1420 (desktop), API proxy in web dev
- `tsconfig.json` — frontend only (`include: ["src"]`)
- `api/tsconfig.json` — serverless handlers
- `src-tauri/tauri.conf.json` — window, bundle, updater pubkey/endpoints
- `src-tauri/capabilities/default.json` — Tauri capability permissions
- `vercel.json` — install/build/output, SPA rewrite excluding `/api/*`

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- Rust stable + Tauri 2 platform prerequisites (WebKitGTK on Linux, etc.)
- Desktop: `npm run tauri dev` (Vite on `1420`)
- Web: `npm run dev:web` (Vite on `5173`; optional proxy to local API on `3000`)

**Production:**
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

---

*Stack analysis: 2026-07-21*
