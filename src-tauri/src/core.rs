// GSD Pi Config - Core preferences/filesystem primitives
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Pure (non-Tauri) logic that both the GUI command layer and the future
// `gsd-pi-config-cli` binary depend on. Kept free of tauri types on purpose.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::UNIX_EPOCH;

// ─── Per-file mutex registry ────────────────────────────────────────────────
//
// Two open windows editing the same prefs file would otherwise race on
// read-modify-write. Every save / restore / snapshot acquires the mutex
// for that canonical path first.

fn file_locks() -> &'static Mutex<HashMap<String, Arc<Mutex<()>>>> {
    static LOCKS: OnceLock<Mutex<HashMap<String, Arc<Mutex<()>>>>> = OnceLock::new();
    LOCKS.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Acquire (or lazily create) a per-path mutex and run `f` while holding it.
pub fn with_file_lock<T>(path: &Path, f: impl FnOnce() -> T) -> T {
    let key = path.to_string_lossy().to_string();
    let mutex = {
        let mut map = file_locks().lock().expect("file_locks poisoned");
        map.entry(key)
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone()
    };
    let _guard = mutex.lock().expect("per-file mutex poisoned");
    f()
}

// ─── Atomic write ───────────────────────────────────────────────────────────

/// Write `bytes` to `path` atomically: write a sibling temp file, fsync it,
/// then rename into place. The rename is atomic on POSIX and on Windows for
/// files on the same volume (which they are — sibling).
pub fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    let file_name = path
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "invalid target path".to_string())?;
    let tmp = path.with_file_name(format!(".{}.tmp-{}", file_name, std::process::id()));
    {
        let mut f = fs::File::create(&tmp).map_err(|e| format!("Failed to create temp file: {}", e))?;
        f.write_all(bytes)
            .map_err(|e| format!("Failed to write temp file: {}", e))?;
        f.sync_all()
            .map_err(|e| format!("Failed to fsync temp file: {}", e))?;
    }
    fs::rename(&tmp, path).map_err(|e| format!("Failed to rename temp file: {}", e))?;
    Ok(())
}

// ─── Frontmatter helpers ────────────────────────────────────────────────────

/// Extract the YAML frontmatter body from a markdown string.
///
/// Returns `None` when the content does not start with `---`.
pub fn parse_frontmatter(content: &str) -> Option<String> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return None;
    }
    let after_first = &trimmed[3..];
    if let Some(end_pos) = after_first.find("\n---") {
        return Some(after_first[..end_pos].to_string());
    }
    let end_with_eof = after_first.trim_end();
    if end_with_eof.ends_with("---") {
        return Some(end_with_eof[..end_with_eof.len() - 3].to_string());
    }
    Some(after_first.to_string())
}

/// Extract a scalar field from YAML frontmatter (primitive, quoted or unquoted).
pub fn read_frontmatter_field(yaml: &str, key: &str) -> Option<String> {
    for line in yaml.lines() {
        let trimmed = line.trim_start();
        if let Some(rest) = trimmed.strip_prefix(&format!("{}:", key)) {
            let v = rest.trim();
            let unquoted = v
                .trim_start_matches('"')
                .trim_end_matches('"')
                .trim_start_matches('\'')
                .trim_end_matches('\'');
            if unquoted.is_empty() {
                return None;
            }
            return Some(unquoted.to_string());
        }
    }
    None
}

// ─── Path resolution ────────────────────────────────────────────────────────

/// Resolve the preferences path for global (None/empty) or project scope.
/// Errors if `project_path` is provided but does not exist.
pub fn preferences_path(project_path: Option<&str>) -> Result<PathBuf, String> {
    match project_path {
        Some(p) if !p.is_empty() => {
            let base = PathBuf::from(p);
            if !base.exists() {
                return Err(format!("Project folder does not exist: {}", p));
            }
            Ok(base.join(".gsd").join("preferences.md"))
        }
        _ => {
            let home = dirs::home_dir().ok_or("could not resolve home directory")?;
            Ok(home.join(".gsd").join("preferences.md"))
        }
    }
}

// ─── Preferences load/save ──────────────────────────────────────────────────

/// Read preferences from `path` as a JSON value. Missing file → empty object.
pub fn load_preferences_at(path: &Path) -> Result<Value, String> {
    if !path.exists() {
        return Ok(Value::Object(serde_json::Map::new()));
    }
    let content = fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))?;
    let yaml_str = parse_frontmatter(&content).unwrap_or_default();
    if yaml_str.trim().is_empty() {
        return Ok(Value::Object(serde_json::Map::new()));
    }
    let yaml_value: serde_yaml::Value =
        serde_yaml::from_str(&yaml_str).map_err(|e| format!("YAML parse error: {}", e))?;
    let json_str =
        serde_json::to_string(&yaml_value).map_err(|e| format!("JSON convert error: {}", e))?;
    let mut json_value: Value =
        serde_json::from_str(&json_str).map_err(|e| format!("JSON parse error: {}", e))?;
    // Must happen BEFORE the value crosses the Tauri bridge: Discord/Slack
    // channel IDs are 64-bit snowflakes that exceed JS's MAX_SAFE_INTEGER.
    // If we leave them as JSON numbers, JSON.parse on the JS side silently
    // loses precision. Coerce to a string here while we still have full i64.
    normalize_stringy_ids(&mut json_value);
    Ok(json_value)
}

/// Coerce well-known "always-a-string" preference keys from number → string.
/// Currently just `remote_questions.channel_id`. This is intentionally
/// conservative: we only touch keys we know must round-trip as strings.
pub fn normalize_stringy_ids(value: &mut Value) {
    let Some(root) = value.as_object_mut() else {
        return;
    };
    let Some(remote) = root.get_mut("remote_questions") else {
        return;
    };
    let Some(remote_obj) = remote.as_object_mut() else {
        return;
    };
    let Some(cid) = remote_obj.get("channel_id").cloned() else {
        return;
    };
    let coerced = match cid {
        Value::String(s) => Value::String(s),
        Value::Number(n) => Value::String(n.to_string()),
        Value::Bool(b) => Value::String(b.to_string()),
        Value::Null => return,
        // Arrays/objects under channel_id are nonsense — drop them so the
        // frontend validator doesn't render a confusing error.
        _ => {
            remote_obj.remove("channel_id");
            return;
        }
    };
    remote_obj.insert("channel_id".to_string(), coerced);
}

/// Serialize preferences to the canonical `---\n{yaml}---\n` format.
pub fn serialize_preferences(prefs: &Value) -> Result<String, String> {
    let yaml_value: serde_yaml::Value =
        serde_json::from_value(prefs.clone()).map_err(|e| format!("Conversion error: {}", e))?;
    let yaml_str =
        serde_yaml::to_string(&yaml_value).map_err(|e| format!("YAML serialize error: {}", e))?;
    Ok(format!("---\n{}---\n", yaml_str))
}

/// Save preferences to `path` under a per-path mutex:
///   1. Copy current file to `{name}.md.bak` (best-effort)
///   2. Serialize and atomically write
///
/// Channel IDs are normalized to strings before serialization so the YAML
/// on disk always round-trips cleanly — a YAML writer may emit an unquoted
/// large integer, which then corrupts under JS Number precision on reload.
pub fn save_preferences_at(path: &Path, prefs: &Value) -> Result<(), String> {
    with_file_lock(path, || {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        if path.exists() {
            let backup = path.with_extension("md.bak");
            fs::copy(path, &backup).ok();
        }
        let mut normalized = prefs.clone();
        normalize_stringy_ids(&mut normalized);
        let output = serialize_preferences(&normalized)?;
        write_atomic(path, output.as_bytes())
    })
}

// ─── Generic JSON document load/save ────────────────────────────────────────
//
// settings.json and models.json are plain JSON (not YAML frontmatter), but
// they share the same safety needs as preferences.md: atomic write, per-path
// mutex, `.bak` sibling, and protection against silently clobbering edits
// made by GSD Pi itself while the editor was open.
//
// Cross-process safety: `with_file_lock` only guards in-process races. GSD Pi
// can write to these files too, so we compare the on-disk mtime to an
// `expected_mtime_ms` captured at load time and refuse the save on mismatch
// with a `STALE:` prefix the UI can detect.

#[derive(Debug, Clone, Copy)]
pub enum ConfigDoc {
    Preferences,
    Settings,
    Models,
}

/// Typed resolver for every config file the editor touches.
///
/// Path asymmetry is intentional and matches what GSD Pi actually reads:
///   - project settings.json lives at `<p>/.gsd/settings.json`
///   - project models.json lives at `<p>/.gsd/agent/models.json`
/// Centralising the table here keeps the asymmetry explicit and testable.
pub fn config_path(doc: ConfigDoc, project_path: Option<&str>) -> Result<PathBuf, String> {
    let home = || dirs::home_dir().ok_or_else(|| "could not resolve home directory".to_string());
    let project_base = |p: &str| -> Result<PathBuf, String> {
        let base = PathBuf::from(p);
        if !base.exists() {
            return Err(format!("Project folder does not exist: {}", p));
        }
        Ok(base)
    };
    match (doc, project_path) {
        (ConfigDoc::Preferences, Some(p)) if !p.is_empty() => {
            Ok(project_base(p)?.join(".gsd").join("preferences.md"))
        }
        (ConfigDoc::Preferences, _) => Ok(home()?.join(".gsd").join("preferences.md")),
        (ConfigDoc::Settings, Some(p)) if !p.is_empty() => {
            Ok(project_base(p)?.join(".gsd").join("settings.json"))
        }
        (ConfigDoc::Settings, _) => Ok(home()?.join(".gsd").join("agent").join("settings.json")),
        (ConfigDoc::Models, Some(p)) if !p.is_empty() => {
            Ok(project_base(p)?
                .join(".gsd")
                .join("agent")
                .join("models.json"))
        }
        (ConfigDoc::Models, _) => Ok(home()?.join(".gsd").join("agent").join("models.json")),
    }
}

/// A parsed JSON document plus the mtime it was loaded with, so the caller
/// can pass the mtime back on save and we can detect external edits.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonDoc {
    pub value: Value,
    /// Milliseconds since UNIX epoch. `0` when the file did not exist at load time.
    pub mtime_ms: i64,
}

fn file_mtime_ms(path: &Path) -> Result<i64, String> {
    let meta = fs::metadata(path).map_err(|e| format!("Failed to stat file: {}", e))?;
    let mtime = meta
        .modified()
        .map_err(|e| format!("Failed to read mtime: {}", e))?;
    let dur = mtime
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("Invalid mtime: {}", e))?;
    Ok(dur.as_millis() as i64)
}

/// Produce a backup sibling by appending `.bak` to the full filename so we
/// never double an extension (`settings.json` → `settings.json.bak`, not
/// `settings.json.json.bak` that `with_extension` would give for some inputs).
fn backup_sibling(path: &Path) -> PathBuf {
    let mut s = path.as_os_str().to_os_string();
    s.push(".bak");
    PathBuf::from(s)
}

/// Read a JSON file into a `JsonDoc`. Missing file → empty object + `mtime_ms: 0`.
pub fn load_json_at(path: &Path) -> Result<JsonDoc, String> {
    if !path.exists() {
        return Ok(JsonDoc {
            value: Value::Object(serde_json::Map::new()),
            mtime_ms: 0,
        });
    }
    let content = fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))?;
    let value: Value = if content.trim().is_empty() {
        Value::Object(serde_json::Map::new())
    } else {
        serde_json::from_str(&content).map_err(|e| format!("JSON parse error: {}", e))?
    };
    let mtime_ms = file_mtime_ms(path)?;
    Ok(JsonDoc { value, mtime_ms })
}

/// Write `value` to `path` as pretty JSON. If `expected_mtime_ms` is `Some`
/// and the file already exists, the on-disk mtime must match or the save is
/// refused with a `STALE:`-prefixed error. Returns the new mtime so the
/// caller can update its baseline.
pub fn save_json_at(
    path: &Path,
    value: &Value,
    expected_mtime_ms: Option<i64>,
) -> Result<i64, String> {
    with_file_lock(path, || {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        if path.exists() {
            if let Some(expected) = expected_mtime_ms {
                let actual = file_mtime_ms(path)?;
                if actual != expected {
                    return Err(format!(
                        "STALE: file changed on disk since last load (expected mtime {}, found {})",
                        expected, actual
                    ));
                }
            }
            let backup = backup_sibling(path);
            fs::copy(path, &backup).ok();
        }
        let mut serialized =
            serde_json::to_vec_pretty(value).map_err(|e| format!("JSON serialize error: {}", e))?;
        serialized.push(b'\n');
        write_atomic(path, &serialized)?;
        file_mtime_ms(path)
    })
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use tempfile::TempDir;

    /// Representative sample covering every GUI section — parsed from a raw
    /// JSON string so we don't blow the `json!` macro recursion limit.
    const FULL_FIXTURE: &str = r#"{
        "version": 1,
        "mode": "solo",
        "token_profile": "balanced",
        "widget_mode": "small",
        "search_provider": "auto",
        "context_selection": "smart",
        "service_tier": "flex",
        "show_token_cost": true,
        "always_use_skills": ["skill-a", "skill-b"],
        "prefer_skills": ["skill-c"],
        "skill_discovery": "auto",
        "skill_staleness_days": 30,
        "skill_rules": [
            { "when": "frontend", "use": ["react-skill"] }
        ],
        "custom_instructions": ["line 1", "line 2"],
        "models": {
            "research": "gpt-4o-mini",
            "planning": "gpt-4o",
            "execution": {
                "model": "gpt-4o",
                "provider": "openai",
                "fallbacks": ["gpt-4o-mini"]
            }
        },
        "budget_ceiling": 10.5,
        "budget_enforcement": "warn",
        "context_pause_threshold": 80,
        "notifications": {
            "enabled": true, "on_complete": true, "on_error": true,
            "on_budget": false, "on_milestone": true, "on_attention": true
        },
        "cmux": { "enabled": true, "notifications": false, "sidebar": true, "splits": true, "browser": false },
        "remote_questions": { "channel": "slack", "channel_id": "C123", "timeout_minutes": 30, "poll_interval_seconds": 10 },
        "git": {
            "auto_push": true, "push_branches": false, "remote": "origin",
            "snapshots": true, "main_branch": "main",
            "merge_strategy": "squash", "isolation": "worktree",
            "manage_gitignore": true, "auto_pr": false
        },
        "post_unit_hooks": [
            { "name": "lint", "after": ["execute-task"], "prompt": "run lint", "max_cycles": 2, "enabled": true }
        ],
        "pre_dispatch_hooks": [
            { "name": "audit", "before": ["execute-task"], "action": "modify", "prepend": "audit: ", "enabled": true }
        ],
        "parallel": { "enabled": true, "max_workers": 4, "budget_ceiling": 20.0, "merge_strategy": "per-slice", "auto_merge": "confirm" },
        "slice_parallel": { "enabled": false, "max_workers": 2 },
        "reactive_execution": { "enabled": true, "max_parallel": 3, "isolation_mode": "same-tree" },
        "gate_evaluation": { "enabled": true, "slice_gates": ["verification"], "task_gates": true },
        "context_management": { "observation_masking": true, "observation_mask_turns": 3, "compaction_threshold_percent": 75, "tool_result_max_chars": 20000 },
        "dynamic_routing": {
            "enabled": true,
            "tier_models": { "light": "openai/gpt-4o-mini", "standard": "openai/gpt-4o", "heavy": "anthropic/claude-opus-4-6" },
            "escalate_on_failure": true,
            "budget_pressure": true,
            "cross_provider": false,
            "hooks": true,
            "capability_routing": true
        },
        "phases": {
            "skip_research": false, "skip_reassess": false, "skip_slice_research": false,
            "skip_milestone_validation": false, "reassess_after_slice": true, "require_slice_discussion": false
        },
        "safety_harness": {
            "enabled": true, "evidence_collection": true, "file_change_validation": true,
            "evidence_cross_reference": true, "destructive_command_warnings": true,
            "content_validation": true, "checkpoints": true, "auto_rollback": false,
            "timeout_scale_cap": 4
        },
        "enhanced_verification": true,
        "enhanced_verification_pre": false,
        "enhanced_verification_post": true,
        "enhanced_verification_strict": false,
        "verification_commands": ["npm run build", "cargo test"],
        "verification_auto_fix": true,
        "verification_max_retries": 3,
        "discuss_preparation": true,
        "discuss_web_research": false,
        "discuss_depth": "standard",
        "experimental": { "rtk": false },
        "codebase": { "exclude_patterns": ["node_modules", "target"], "max_files": 5000, "collapse_threshold": 100 },
        "auto_visualize": false,
        "auto_report": true,
        "forensics_dedup": true,
        "uat_dispatch": true,
        "unique_milestone_ids": true,
        "stale_commit_threshold_minutes": 60
    }"#;

    #[test]
    fn round_trip_preserves_full_preferences() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("preferences.md");

        let original: Value = serde_json::from_str(FULL_FIXTURE).expect("fixture parses");
        save_preferences_at(&path, &original).expect("save");
        let reloaded = load_preferences_at(&path).expect("load");
        assert_eq!(
            original, reloaded,
            "round-trip must preserve all preference values"
        );
    }

    #[test]
    fn atomic_write_creates_parent_and_file() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("nested").join("out.txt");
        write_atomic(&path, b"hello").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "hello");
    }

    #[test]
    fn atomic_write_overwrites_existing_file() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("a.txt");
        fs::write(&path, "old").unwrap();
        write_atomic(&path, b"new").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "new");
    }

    #[test]
    fn parse_frontmatter_normal_case() {
        let content = "---\nkey: value\nother: 1\n---\n\nbody";
        let yaml = parse_frontmatter(content).expect("frontmatter present");
        assert!(yaml.contains("key: value"));
        assert!(yaml.contains("other: 1"));
    }

    #[test]
    fn parse_frontmatter_missing_returns_none() {
        assert_eq!(parse_frontmatter("no frontmatter here"), None);
    }

    #[test]
    fn read_frontmatter_field_handles_quoted_values() {
        let yaml = "name: \"my-skill\"\ndescription: 'does a thing'\n";
        assert_eq!(read_frontmatter_field(yaml, "name").as_deref(), Some("my-skill"));
        assert_eq!(
            read_frontmatter_field(yaml, "description").as_deref(),
            Some("does a thing")
        );
    }

    #[test]
    fn save_creates_bak_sibling_when_file_exists() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("preferences.md");
        save_preferences_at(&path, &json!({ "mode": "solo" })).unwrap();
        // Second save should create a .bak sibling
        save_preferences_at(&path, &json!({ "mode": "team" })).unwrap();
        let bak = path.with_extension("md.bak");
        assert!(bak.exists(), "backup sibling must exist after second save");
        let bak_content = fs::read_to_string(&bak).unwrap();
        assert!(bak_content.contains("solo"), "backup should have the previous value");
    }

    /// Regression: a Discord snowflake written unquoted in YAML was being
    /// parsed as an integer and sent across the Tauri bridge as a JSON
    /// number. JS Number loses precision above 2^53, so the channel_id
    /// arrived corrupted and the frontend validator ("Must be a string")
    /// flagged it. Load path must coerce to a string while the full i64 is
    /// still intact.
    #[test]
    fn load_coerces_unquoted_channel_id_to_string() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("preferences.md");
        // Raw YAML with an unquoted snowflake — simulates a hand-edited file
        // or one saved by a tool that doesn't know to quote channel IDs.
        let raw = "---\nremote_questions:\n  channel: discord\n  channel_id: 1234567890123456789\n---\n";
        fs::write(&path, raw).unwrap();

        let loaded = load_preferences_at(&path).expect("load");
        let cid = loaded
            .get("remote_questions")
            .and_then(|r| r.get("channel_id"))
            .expect("channel_id present");
        assert!(
            cid.is_string(),
            "channel_id must be coerced to string, got {:?}",
            cid
        );
        assert_eq!(
            cid.as_str().unwrap(),
            "1234567890123456789",
            "full i64 precision must be preserved across the coercion"
        );
    }

    /// On save, even if the frontend sent a number (defense in depth), the
    /// written file must store the channel_id as a quoted string so the next
    /// reload doesn't reintroduce the precision bug.
    #[test]
    fn json_round_trip_preserves_arbitrary_shape() {
        // Unknown/future fields must survive a load→save round-trip untouched.
        // This is the backend guarantee that front-end edits merged on top of
        // the loaded Value won't silently drop fields the UI doesn't know about.
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("settings.json");
        let original = json!({
            "theme": "dark",
            "shellPath": "/bin/zsh",
            "unknownFutureKey": { "nested": [1, 2, 3], "flag": true },
            "fallback": ["a", "b"],
        });
        save_json_at(&path, &original, None).unwrap();
        let loaded = load_json_at(&path).unwrap();
        assert_eq!(loaded.value, original);
        assert!(loaded.mtime_ms > 0);
    }

    #[test]
    fn json_save_creates_bak_sibling_with_single_suffix() {
        // Backup must be `settings.json.bak`, never `settings.json.json.bak`.
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("settings.json");
        save_json_at(&path, &json!({ "v": 1 }), None).unwrap();
        save_json_at(&path, &json!({ "v": 2 }), None).unwrap();
        let bak = tmp.path().join("settings.json.bak");
        assert!(bak.exists(), "backup must exist at settings.json.bak");
        assert!(
            !tmp.path().join("settings.json.json.bak").exists(),
            "must not produce doubled-extension backup"
        );
        let bak_content = fs::read_to_string(&bak).unwrap();
        assert!(bak_content.contains("\"v\": 1"));
    }

    #[test]
    fn json_save_detects_stale_mtime() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("models.json");
        save_json_at(&path, &json!({ "providers": {} }), None).unwrap();
        let doc = load_json_at(&path).unwrap();
        // Simulate GSD Pi writing to the file externally.
        std::thread::sleep(std::time::Duration::from_millis(20));
        fs::write(&path, b"{\"providers\":{\"ext\":{}}}").unwrap();
        let err = save_json_at(&path, &json!({ "providers": { "ours": {} } }), Some(doc.mtime_ms))
            .unwrap_err();
        assert!(
            err.starts_with("STALE:"),
            "expected STALE: error prefix, got: {}",
            err
        );
    }

    #[test]
    fn json_save_without_expected_mtime_skips_staleness_check() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("models.json");
        save_json_at(&path, &json!({ "v": 1 }), None).unwrap();
        fs::write(&path, b"{\"v\":99}").unwrap();
        save_json_at(&path, &json!({ "v": 2 }), None).expect("no mtime → no staleness check");
        let loaded = load_json_at(&path).unwrap();
        assert_eq!(loaded.value, json!({ "v": 2 }));
    }

    #[test]
    fn load_json_missing_file_returns_empty_object_and_zero_mtime() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("does-not-exist.json");
        let doc = load_json_at(&path).unwrap();
        assert_eq!(doc.value, json!({}));
        assert_eq!(doc.mtime_ms, 0);
    }

    #[test]
    fn config_path_resolves_global_variants() {
        let global_prefs = config_path(ConfigDoc::Preferences, None).unwrap();
        assert!(global_prefs.ends_with(".gsd/preferences.md"));
        let global_settings = config_path(ConfigDoc::Settings, None).unwrap();
        assert!(global_settings.ends_with(".gsd/agent/settings.json"));
        let global_models = config_path(ConfigDoc::Models, None).unwrap();
        assert!(global_models.ends_with(".gsd/agent/models.json"));
    }

    #[test]
    fn config_path_resolves_project_variants_with_asymmetry() {
        let tmp = TempDir::new().unwrap();
        let proj = tmp.path().to_string_lossy().to_string();

        let prefs = config_path(ConfigDoc::Preferences, Some(&proj)).unwrap();
        assert!(prefs.ends_with(".gsd/preferences.md"));

        // Project settings.json lives at .gsd/settings.json (NOT .gsd/agent/)
        let settings = config_path(ConfigDoc::Settings, Some(&proj)).unwrap();
        assert!(
            settings.ends_with(".gsd/settings.json"),
            "project settings.json must be at .gsd/settings.json, got {:?}",
            settings
        );
        assert!(!settings.to_string_lossy().contains("/agent/"));

        // Project models.json lives at .gsd/agent/models.json
        let models = config_path(ConfigDoc::Models, Some(&proj)).unwrap();
        assert!(models.ends_with(".gsd/agent/models.json"));
    }

    #[test]
    fn config_path_errors_on_missing_project() {
        let err = config_path(ConfigDoc::Settings, Some("/definitely/not/a/real/path/xyz"))
            .unwrap_err();
        assert!(err.contains("does not exist"));
    }

    #[test]
    fn save_normalizes_numeric_channel_id_to_string() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("preferences.md");
        let prefs = json!({
            "remote_questions": {
                "channel": "discord",
                "channel_id": 1234567890123456789_u64
            }
        });
        save_preferences_at(&path, &prefs).expect("save");
        let reloaded = load_preferences_at(&path).expect("load");
        let cid = reloaded
            .get("remote_questions")
            .and_then(|r| r.get("channel_id"))
            .expect("channel_id present after reload");
        assert_eq!(cid.as_str(), Some("1234567890123456789"));
    }
}
