# External Integrations

**Analysis Date:** 2026-07-21

## APIs & External Services

**GitHub (presets catalog — public raw content):**
- Loads gallery index and preset markdown from `open-gsd/gsd-pi-presets`
  - Client: browser `fetch` in `src/lib/presetsCatalog.ts`
  - Defaults:
    - `https://raw.githubusercontent.com/open-gsd/gsd-pi-presets/main/index.json`
    - `https://raw.githubusercontent.com/open-gsd/gsd-pi-presets/main/`
  - Override: `VITE_PRESETS_INDEX_URL`, `VITE_PRESETS_RAW_BASE_URL`, `VITE_PRESETS_CONTRIBUTING_URL`
  - Auth: none (public raw URLs)

**GitHub OAuth + REST API (preset submit — web):**
- Browser starts OAuth authorize at `https://github.com/login/oauth/authorize` (`src/components/SubmitPresetModal.tsx`)
- Server exchanges code at `https://github.com/login/oauth/access_token` (`api/submit-preset.ts`)
- Server uses `https://api.github.com` to fork, branch, commit file, open PR into presets repo
  - SDK/Client: native `fetch` (no Octokit package)
  - Auth: `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` (server); optional `VITE_GITHUB_CLIENT_ID` build-time; runtime client id also exposed via `GET /api/oauth-config`
  - Target repo: `PRESETS_REPO` env (default `open-gsd/gsd-pi-presets`)
  - API route: `POST /api/submit-preset` → JSON `{ prUrl }` or `{ error }`

**GitHub Releases (desktop auto-update):**
- Tauri updater endpoint: `https://github.com/open-gsd/gsd-pi-config/releases/latest/download/latest.json`
  - Config: `src-tauri/tauri.conf.json` → `plugins.updater`
  - Client: `@tauri-apps/plugin-updater` via `src/lib/updater.ts`
  - Auth: public release artifacts; signature verified with baked ed25519 pubkey

**Provider docs / deep links (UI only, not API clients):**
- OpenAI, Anthropic, Google, etc. console URLs in `src/components/sections/ApiKeysSection.tsx`
- Product site links: `https://www.opengsd.net` (`src/components/WebShell.tsx`)
- Repo links: `open-gsd/gsd-pi-config`, `open-gsd/gsd-pi-presets` (gallery UI)

## Data Storage

**Databases:**
- Not detected — no SQL/NoSQL client or ORM

**File Storage:**
- Desktop (local filesystem via Rust Tauri commands in `src-tauri/src/lib.rs` + `core.rs`):
  - Global preferences: `~/.gsd/preferences.md`
  - Project preferences: `<project>/.gsd/preferences.md`
  - Related: `models.json`, `settings.json` under `.gsd`
  - Skills/agents: `~/.claude/skills/`, `~/.claude/agents/`, project `.claude/` trees
  - Exported env: `~/.gsd/env.sh` (mode `0600`) for key export
- Web:
  - Session draft in browser `localStorage` (`src/platform/webBackend.ts` keys under `gsd-pi-config.web.*`)
  - User downloads workspace zip/files via `src/lib/downloadWorkspace.ts` — no server-side file store

**Secrets storage:**
- Desktop: OS keychain via Rust `keyring` crate (`src-tauri/src/lib.rs`)
- Web: `localStorage` key bag `gsd-pi-config.web.keys` (session-oriented; not OS keychain)

**Caching:**
- Preset fetches use `cache: "no-cache"`
- OAuth config response `Cache-Control: public, max-age=300` (`api/oauth-config.ts`)
- UI prefs (theme, recent projects, last scope) in `localStorage` (`src/lib/theme.ts`, `src/ConfigApp.tsx`, `src/lib/storageMigration.ts`)

## Authentication & Identity

**Auth Provider:**
- GitHub OAuth App (web preset submission only)
  - Implementation: authorization code flow; token exchange only on server (`api/submit-preset.ts`)
  - Client id resolution: build-time `VITE_GITHUB_CLIENT_ID` or `GET /api/oauth-config` (`src/components/SubmitPresetModal.tsx`)
  - Callback route: `src/pages/OAuthCallbackPage.tsx`
- Desktop app: no user login; local machine trust
- CLI auth status detection (desktop): probes tools like `gcloud` / `gh` presence via shell (`src-tauri/src/lib.rs` process checks) — not OAuth to those services from this app

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/etc.)

**Logs:**
- Desktop: `tauri-plugin-log` initialized in `src-tauri/src/lib.rs`
- Serverless: return JSON errors / HTTP status codes
- Frontend: errors surfaced in UI state (update check, preset load, submit)

## CI/CD & Deployment

**Hosting:**
- Web production: Vercel (`vercel.json`, `.vercel/`, workflow `.github/workflows/vercel-production.yml`)
  - Deploy uses repo secret `VERCEL_TOKEN`
  - Build: `npm ci` + `npm run build:web` → `dist/`
  - SPA rewrite: all non-`/api/*` → `/index.html`
- Desktop: GitHub Releases (`.github/workflows/release.yml` on `v*` tags) — multi-platform Tauri bundles + updater artifacts
- Optional: GitHub Pages (`.github/workflows/pages.yml`)

**CI Pipeline:**
- `.github/workflows/test-frontend.yml` — Node 20, `npm ci`, `npm test` (Vitest) on PR/push to `main` for frontend paths
- `.github/workflows/release.yml` — `cargo test --locked` then draft release + platform builds
- `.github/workflows/vercel-production.yml` — production deploy on push to `main` (fallback if Git integration missing)

## Environment Configuration

**Required env vars (web OAuth submit):**
- Server: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Optional server: `PRESETS_REPO`
- Optional client: `VITE_GITHUB_CLIENT_ID`, `VITE_SUBMIT_PRESET_API_URL`
- Preset gallery (client, has defaults): `VITE_PRESETS_*`, `VITE_BASE_PATH`

**Secrets location:**
- Vercel project environment for serverless secrets
- GitHub Actions secrets: `VERCEL_TOKEN`, `GITHUB_TOKEN` (Actions-provided for releases)
- Local: `.env.web` / `.env.web.local` for Vite (example in `.env.web.example`) — never commit real secrets
- Desktop updater pubkey is public and committed in `src-tauri/tauri.conf.json`

## Webhooks & Callbacks

**Incoming:**
- Browser OAuth redirect to app callback page (`OAuthCallbackPage`) after GitHub authorize — not a server webhook
- Vercel/GitHub deploy webhooks (platform-managed), not application endpoints

**Outgoing:**
- GitHub OAuth token exchange and REST calls from `api/submit-preset.ts`
- Preset raw content GET from `raw.githubusercontent.com`
- Updater metadata GET from GitHub Releases
- No application-defined webhook emitters

## Platform Integration Map

| Concern | Web | Desktop |
|---------|-----|---------|
| Preferences I/O | Upload/download + localStorage draft | Live FS under `~/.gsd` / project |
| API keys | localStorage | OS keychain (`keyring`) |
| Preset gallery | Yes (remote git raw) | File import/export primarily |
| Submit preset PR | Yes (OAuth + `/api/submit-preset`) | Not the primary path |
| Auto-update | No | Yes (GitHub Releases + Tauri updater) |
| Skills/agents libraries | No (web backend stubs/limits) | Yes on disk under `.claude` |

## Related Repos / Products

- **GSD Pi** — preferences consumer (`https://github.com/open-gsd/gsd-pi`)
- **gsd-pi-presets** — shared preset index and markdown gallery
- **open-gsd** org / **opengsd.net** — branding and product site

---

*Integration audit: 2026-07-21*
