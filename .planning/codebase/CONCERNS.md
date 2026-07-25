# Codebase Concerns

**Analysis Date:** 2026-07-21

## Tech Debt

**Monolithic shared app shell (`ConfigApp.tsx`):**
- Issue: Nearly all load/save/dirty/scope/OAuth/modal orchestration lives in one ~1000-line React component.
- Files: `src/ConfigApp.tsx`
- Impact: High change risk for unrelated features; hard to unit-test save paths, dirty tracking, and web vs desktop branches.
- Fix approach: Extract hooks (`useConfigDocuments`, `useProjectScope`, `useSaveAll`) and thin presentational shell; keep platform differences behind `ConfigBackend`.

**Duplicated preference serialization (Rust + TS):**
- Issue: Frontmatter parse/load, `normalizeStringyIds`, `redactSensitive`, and shareable preset formatting are implemented twice and must stay in lockstep.
- Files: `src-tauri/src/core.rs`, `src-tauri/src/lib.rs` (`redact_sensitive`, `build_shareable_preset`), `src/lib/preferencesCore.ts`
- Impact: Drift causes silent precision bugs (channel IDs) or secret leakage on one platform only.
- Fix approach: Treat `preferencesCore.test.ts` + Rust `core::tests` as a paired contract; add shared fixtures/corpus tests for every coercion and redaction rule.

**Platform backend split + cast noise:**
- Issue: `cleanPrefs` requires `as unknown as Record<string, unknown>` at every save/export call site.
- Files: `src/lib/cleanPrefs.ts`, `src/platform/tauri.ts`, `src/platform/tauriBackend.ts`, `src/platform/web.ts`, `src/platform/webBackend.ts`, `src/components/SubmitPresetModal.tsx`, `src/lib/downloadWorkspace.ts`
- Impact: Type safety around preferences is weak at the boundary; refactors do not catch shape mistakes.
- Fix approach: Change `cleanPrefs` to accept `GSDPreferences | Record<string, unknown>` (or generic) so call sites stay typed.

**`cleanPrefs` drops empty arrays:**
- Issue: Documented intentional pruning of empty arrays on save/export.
- Files: `src/lib/cleanPrefs.ts`
- Impact: User cannot persist an explicit empty list; key disappears and runtime may fall back to defaults differently than “empty override.”
- Fix approach: Whitelist array keys that must round-trip as `[]`, or only prune on share/export, not on local save.

**Preferences lack mtime/staleness checks (JSON docs have them):**
- Issue: `settings.json` / `models.json` use `expected_mtime_ms` + `STALE:` errors; `preferences.md` saves always overwrite with only a `.bak` sibling.
- Files: `src-tauri/src/core.rs` (`save_preferences_at` vs `save_json_at`), `src-tauri/src/lib.rs` (`save_preferences`), `src/ConfigApp.tsx`
- Impact: Concurrent GSD Pi + config app edits clobber preferences without UI recovery path used for models/settings.
- Fix approach: Mirror JsonDoc mtime API for preferences (or a content hash) and surface the same reload messaging in `ConfigApp.tsx`.

**Inconsistent atomic write for skills/agents:**
- Issue: Preferences/JSON use `write_atomic`; skill/agent writes use `fs::write` after best-effort backup.
- Files: `src-tauri/src/lib.rs` (`write_skill`, `write_agent`, `create_skill`, `create_agent`)
- Impact: Crash mid-write can leave truncated SKILL.md / agent prompts.
- Fix approach: Route all content writes through `write_atomic` in `core.rs`.

**Large UI section files:**
- Issue: Several section editors exceed 500 lines with dense form state.
- Files: `src/components/sections/AgentSettingsSection.tsx`, `src/components/sections/ApiKeysSection.tsx`, `src/components/FormControls.tsx`, `src/components/sections/agentSettingsEditors.tsx`
- Impact: Slow review, easy to introduce field/path typos without tests.
- Fix approach: Split by subsection; drive fields from schema tables where possible (`src/lib/fields.ts` pattern).

**Unused / half-wired shell dependency:**
- Issue: `@tauri-apps/plugin-shell` is in `package.json` but not registered in Tauri capabilities; CLI checks use `std::process::Command::new("which")` instead.
- Files: `package.json`, `src-tauri/src/lib.rs` (`check_cli_installed`), `src-tauri/capabilities/default.json`
- Impact: Dead dependency surface; confusion about intended security model for process spawn.
- Fix approach: Remove unused npm plugin or wire it deliberately with allowlists.

## Known Bugs

**Fork race on preset submit (GitHub API):**
- Symptoms: Submit fails with “Could not read main branch on fork” or commit/PR errors shortly after first-time OAuth submit.
- Files: `api/submit-preset.ts` (`createPresetPr` — POST forks then immediately GET ref on fork)
- Trigger: First submit when user has no existing fork (GitHub fork is async).
- Workaround: Retry submit after fork finishes; or submit manually via gallery CONTRIBUTING flow.
- Fix approach: Poll fork readiness / `default_branch` ref until available with timeout.

**`redactSensitive` false positives and false negatives:**
- Symptoms: Share/export may redact benign fields whose names contain `key` (e.g. `keyboard`, `api_key_name`-style metadata already handled only if string values). Non-string secrets and free-text secrets in `custom_instructions` are not redacted by key walk alone.
- Files: `src-tauri/src/lib.rs` (`redact_sensitive`), `src/lib/preferencesCore.ts` (`redactSensitive`, `scanForLeakedSecrets`)
- Trigger: Share modal / gallery submit with nested or free-text credentials.
- Workaround: Manual review of shareable YAML (UI already warns).
- Fix approach: Use explicit allow/deny key lists for known preference schema; expand `SECRET_PATTERNS` for common LLM keys (`sk-ant-`, OpenAI project keys, etc.).

**Backup extension inconsistency for preferences vs JSON:**
- Symptoms: Preferences use `with_extension("md.bak")` (works for `preferences.md`); JSON carefully uses `backup_sibling` to avoid doubled extensions. Skill/agent backups use `with_extension("md.bak")` which is OK for `.md` but diverges from the JSON helper.
- Files: `src-tauri/src/core.rs` (`save_preferences_at`, `backup_sibling`), `src-tauri/src/lib.rs` (`write_skill`, `write_agent`)
- Trigger: N/A day-to-day; maintenance risk if file naming changes.
- Workaround: None needed if names stay `*.md`.
- Fix approach: Always use `backup_sibling` for all path types.

## Security Considerations

**Arbitrary path read/write/delete via Tauri commands:**
- Risk: Any renderer-invoked path string can read, overwrite, or delete filesystem content for skills/agents/presets without root allowlisting.
- Files: `src-tauri/src/lib.rs` — `read_skill`, `write_skill`, `delete_skill` (deletes parent directory), `read_agent`, `write_agent`, `delete_agent`, `import_preset`, `import_json_file`, `export_preset`
- Current mitigation: Desktop app is local-trusted; no remote untrusted webview content assumed. Tauri capabilities do not include broad FS plugin, but custom commands implement FS themselves.
- Recommendations: Canonicalize paths and require they stay under known roots (`~/.gsd`, `~/.claude/skills|agents`, selected project `.gsd`/`.claude`). Reject `..` and non-md paths. Prefer dialog-picked paths over free-string for write/delete.

**API keys on web stored in `localStorage`:**
- Risk: XSS or shared-browser access exposes all provider keys as plaintext JSON.
- Files: `src/platform/webBackend.ts` (`KEYS_STORE = "gsd-pi-config.web.keys"`)
- Current mitigation: Web is a draft workspace; keys are not OS-keychain protected.
- Recommendations: Prefer never storing raw secrets on web; use session-only memory, or Web Crypto + non-extractable keys if persistence is required. Document risk in UI copy.

**Desktop keychain `get_key` returns full secrets to frontend:**
- Risk: Full secret values cross the IPC boundary into JS memory whenever revealed or exported.
- Files: `src-tauri/src/lib.rs` (`get_key`, `list_key_statuses`, `export_env_file`), `src/platform/tauriBackend.ts`, `src/components/sections/ApiKeysSection.tsx`
- Current mitigation: OS keyring at rest; list view only shows last-4 preview; `env.sh` written with mode `0600` on Unix.
- Recommendations: Minimize full-value fetches; clear reveal state aggressively; ensure `env.sh` export is opt-in with strong warning (already generated under `~/.gsd/env.sh`).

**Preset submit API accepts client-supplied access tokens:**
- Risk: `body.accessToken` is trusted if present (skips code exchange). No auth of caller identity beyond the token itself; no rate limiting; no slug sanitization beyond GitHub path usage; no server-side secret scan.
- Files: `api/submit-preset.ts`, `src/components/SubmitPresetModal.tsx` (client-side `scanForLeakedSecrets` only)
- Current mitigation: Client secret scan for a few token shapes; OAuth state check in callback path; secrets stay server-side for client id/secret.
- Recommendations: Reject raw `accessToken` from clients in production (code exchange only); validate `slug` (`^[a-z0-9-]+$`); run server-side secret scan; add rate limits / abuse controls; set CORS deliberately if endpoints are public.

**OAuth config endpoint discloses configuration shape:**
- Risk: Low — `configured` / `clientSecretSet` boolean leak is minor recon info.
- Files: `api/oauth-config.ts`
- Current mitigation: Does not return secret values.
- Recommendations: Return only `clientId` + `configured`; drop granular secret-set flags if unused.

**`check_cli_installed` spawns `which` with caller-controlled argument:**
- Risk: Argument injection if `binary` is not validated (spaces/metacharacters depending on platform). Currently uses `Command::new("which").arg(&binary)` (no shell), so risk is lower than shell injection but still allows probing PATH existence for arbitrary names.
- Files: `src-tauri/src/lib.rs` (`check_cli_installed`)
- Current mitigation: No shell; argv form.
- Recommendations: Allowlist known CLIs (`claude`, `gcloud`, `gemini`, etc.) in the command.

**GitHub OAuth scope `public_repo`:**
- Risk: Broader than “open a PR on one community repo” — grants write access to all public repos for the user token lifetime.
- Files: `src/components/SubmitPresetModal.tsx`
- Current mitigation: Token used only server-side during submit exchange path when code is used; still powerful if leaked from session/network.
- Recommendations: Prefer GitHub Apps or fine-grained tokens / minimal scopes; never persist token client-side.

## Performance Bottlenecks

**Full skill/agent library scans on demand:**
- Problem: Listing skills walks multiple roots and reads every SKILL.md for frontmatter; agents read every `.md` file.
- Files: `src-tauri/src/lib.rs` (`scan_skills_root`, `scan_agents_root`, `list_skills`, `list_agents`)
- Cause: Synchronous full directory scan + file reads per list call.
- Improvement path: Cache by root mtime; parse only frontmatter bytes; lazy-load descriptions.

**`ConfigApp` dirty checks via JSON.stringify snapshots:**
- Problem: Large prefs/models/settings trees stringify on each edit path for dirty comparison.
- Files: `src/ConfigApp.tsx`, `src/hooks/useDirty.ts`
- Cause: Snapshot equality rather than structural/field-level tracking for models/settings.
- Improvement path: Reuse `useDirty` patterns or hash only changed subtrees.

**LocalStorage thrash on web:**
- Problem: Entire libraries and docs rewritten as one JSON blob per write.
- Files: `src/platform/webBackend.ts`
- Cause: Simple key-value store design.
- Improvement path: Acceptable for draft sizes; watch quota errors and surface them.

## Fragile Areas

**Channel ID snowflake precision:**
- Files: `src-tauri/src/core.rs` (`normalize_stringy_ids`, load/save comments), `src/lib/preferencesCore.ts`, `src/components/sections/RemoteSection.tsx`, tests in both languages
- Why fragile: Any path that reintroduces numeric JSON for Discord/Slack IDs corrupts IDs above `Number.MAX_SAFE_INTEGER`.
- Safe modification: Always coerce at load and save; never cast channel IDs through `number`; extend tests when adding new snowflake fields.
- Test coverage: Good for `channel_id`; other future snowflake fields not covered.

**Project vs global path asymmetry:**
- Files: `src-tauri/src/core.rs` (`config_path`)
- Why fragile: Project `settings.json` is `.gsd/settings.json` while global is `.gsd/agent/settings.json`; models always under `agent/`. Wrong path silently loads empty defaults.
- Safe modification: Change only via `config_path` + existing unit tests (`config_path_resolves_*`).
- Test coverage: Present in `core.rs` tests; no frontend path tests.

**Dual desktop entry shims:**
- Files: `src/platform/tauri.ts`, `src/platform/tauriBackend.ts`, `src/platform/web.ts`, `src/platform/webBackend.ts`, `src/platform/backend.tsx`
- Why fragile: Two layers of backend wrappers can diverge (e.g. cleanPrefs applied in one path only).
- Safe modification: Prefer implementing only on `ConfigBackend` implementations; deprecate direct `tauri.ts` / `web.ts` helpers if unused.
- Test coverage: None for backend adapters.

**Submit OAuth round-trip via sessionStorage:**
- Files: `src/components/SubmitPresetModal.tsx`, `src/ConfigApp.tsx` (PR URL flash)
- Why fragile: Full preset markdown stored in `sessionStorage` during OAuth redirect; tab close or storage quota loses submit; multi-tab races on state key.
- Safe modification: Keep state validation; consider `sessionStorage` size limits for large prefs.
- Test coverage: None (UI/API).

## Scaling Limits

**In-process file locks only:**
- Current capacity: Multiple windows in the same process serialize via `with_file_lock`.
- Limit: Separate OS processes (another editor, CLI, second app instance) are not locked; only models/settings mtime helps.
- Files: `src-tauri/src/core.rs` (`file_locks`, comments on cross-process safety)
- Scaling path: Optional `fs2`/fcntl locks or always-on mtime for preferences too.

**Web localStorage workspace:**
- Current capacity: Browser quota (~5MB typical).
- Limit: Large skills libraries + keys + three docs can hit quota without graceful UX.
- Files: `src/platform/webBackend.ts`
- Scaling path: Catch `QuotaExceededError`; offer download-only mode.

**Preset gallery dependency on external raw GitHub URLs:**
- Current capacity: Public CDN-like raw content.
- Limit: Rate limits / outages break gallery load (`VITE_PRESETS_*` in `.env.web.example`).
- Files: `.env.web.example`, `src/lib/presets.ts`, `src/pages/GalleryPage.tsx`
- Scaling path: Mirror index, cache, offline fallbacks.

## Dependencies at Risk

**`serde_yaml` 0.9:**
- Risk: Crate is effectively unmaintained relative to ecosystem direction; YAML edge cases (anchors, large numbers) differ from JS `yaml` package.
- Impact: Desktop vs web parse divergence for the same preferences file.
- Files: `src-tauri/Cargo.toml`, `src/lib/preferencesCore.ts` (uses `yaml` npm)
- Migration plan: Pin and corpus-test; evaluate `serde_yml` or `saphyr` when stable; keep JS/Rust fixtures identical.

**Tauri 2 + keyring 3 native backends:**
- Risk: Platform keychain permission prompts and Linux secret-service differences cause “keys missing” support issues.
- Impact: API key UX regressions on Linux especially.
- Files: `src-tauri/Cargo.toml` (`keyring` features), `src-tauri/src/lib.rs` (migration from `net.fluxlabs.gsd2-config`)
- Migration plan: Keep legacy migration; document Linux secret service requirements.

**No ESLint/Prettier/Biome config detected:**
- Risk: Style and hook dependency bugs rely on review only (`eslint-disable` comments already present).
- Files: `src/lib/tauriListeners.ts`, `src/lib/keyboard.ts`, `src/components/FormControls.tsx`
- Impact: Inconsistent quality gates vs Vitest-only CI.
- Migration plan: Add Biome or ESLint in `test-frontend.yml`.

## Missing Critical Features

**No server-side secret scanning on preset PR creation:**
- Problem: Malicious or mistaken clients can POST markdown with secrets directly to `api/submit-preset.ts`.
- Blocks: Safe public gallery growth without maintainer secret scrubbing.

**No automated Rust test job in CI:**
- Problem: Frontend Vitest runs in `.github/workflows/test-frontend.yml`; Rust `cargo test` is not in that workflow (release workflow may build only).
- Blocks: Catching core path/mtime regressions before release.
- Files: `.github/workflows/test-frontend.yml`, `src-tauri/src/core.rs`, `src-tauri/src/lib.rs`

**No component/integration tests for save orchestration:**
- Problem: STALE handling, multi-doc partial save, web download path untested in JS.
- Blocks: Safe refactors of `ConfigApp.tsx`.

**Preferences external-edit recovery UX incomplete:**
- Problem: Models/settings get STALE messages; preferences overwrite.
- Blocks: Safe multi-tool editing of `preferences.md`.

## Test Coverage Gaps

**API serverless handlers:**
- What's not tested: OAuth exchange, fork/branch/PR flow, error mapping, method checks.
- Files: `api/submit-preset.ts`, `api/oauth-config.ts`
- Risk: Production-only failures (fork race, auth misconfig) ship unnoticed.
- Priority: High

**Tauri command security boundaries:**
- What's not tested: Path allowlisting, delete_skill parent removal, export_env_file permissions, keyring migration.
- Files: `src-tauri/src/lib.rs`
- Risk: Destructive FS bugs and credential mishandling.
- Priority: High

**Web backend / localStorage:**
- What's not tested: `webBackend` load/save/skills/keys, quota errors, scope keys.
- Files: `src/platform/webBackend.ts`
- Risk: Web-only data loss or key leakage regressions.
- Priority: Medium

**UI sections and validators:**
- What's not tested: Most of `src/components/sections/*`, `src/lib/validators.ts`, import/share modals.
- Files: `src/components/**`, `src/lib/validators.ts`
- Risk: Field path typos persist bad config to disk.
- Priority: Medium

**Only one frontend test file:**
- What's not tested: Everything outside preferences redaction/load helpers.
- Files: `src/lib/preferencesCore.test.ts` (sole `*.test.ts`)
- Risk: Large surface area changes without automated signal.
- Priority: High

**CI path filters skip API/Rust:**
- What's not tested in PR CI: Changes under `api/` or `src-tauri/` do not trigger `test-frontend.yml` path filters.
- Files: `.github/workflows/test-frontend.yml`
- Risk: Backend-only PRs merge without any test job.
- Priority: High

---

*Concerns audit: 2026-07-21*
