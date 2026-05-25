// GSD Pi Config - Tauri Backend (command layer over `core`)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

pub mod core;

use keyring::Entry;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

use crate::core::{
    config_path, load_json_at, load_preferences_at, normalize_stringy_ids, parse_frontmatter,
    preferences_path, read_frontmatter_field, save_json_at, save_preferences_at,
    serialize_preferences, write_atomic, ConfigDoc, JsonDoc,
};

const KEYRING_SERVICE: &str = "net.fluxlabs.gsd-pi-config";
const LEGACY_KEYRING_SERVICE: &str = "net.fluxlabs.gsd2-config";

/// Env var names managed in the API Keys UI (`ApiKeysSection.tsx`). Used for
/// one-time startup migration from the pre-rebrand keychain service.
const KNOWN_API_KEY_NAMES: &[&str] = &[
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "OPENAI_API_KEY",
    "OPENAI_ORG_ID",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "XAI_API_KEY",
    "DEEPSEEK_API_KEY",
    "MISTRAL_API_KEY",
    "GROQ_API_KEY",
    "CEREBRAS_API_KEY",
    "OPENROUTER_API_KEY",
    "VERCEL_AI_GATEWAY_KEY",
    "DASHSCOPE_API_KEY",
    "ZHIPU_API_KEY",
    "MOONSHOT_API_KEY",
    "TAVILY_API_KEY",
    "BRAVE_API_KEY",
    "EXA_API_KEY",
    "GOOGLE_SEARCH_API_KEY",
    "GOOGLE_CSE_ID",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_ENDPOINT",
];

fn ensure_parent_dir(path: &PathBuf) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }
    Ok(())
}

// ─── Preferences commands ────────────────────────────────────────────────────

#[tauri::command]
fn load_preferences(project_path: Option<String>) -> Result<Value, String> {
    let path = preferences_path(project_path.as_deref())?;
    load_preferences_at(&path)
}

#[tauri::command]
fn save_preferences(preferences: Value, project_path: Option<String>) -> Result<(), String> {
    let path = preferences_path(project_path.as_deref())?;
    save_preferences_at(&path, &preferences)
}

#[tauri::command]
fn get_preferences_path(project_path: Option<String>) -> Result<String, String> {
    Ok(preferences_path(project_path.as_deref())?
        .to_string_lossy()
        .to_string())
}

// ─── Settings / Models commands ─────────────────────────────────────────────
//
// GSD Pi reads three independent config files: preferences.md (above),
// settings.json (agent runtime), and models.json (custom providers). Settings
// and models are plain JSON and share the same load/save machinery in
// `core::{load_json_at, save_json_at}`. Each returns a JsonDoc (value + mtime)
// so the frontend can round-trip the mtime on save and detect external edits.

#[tauri::command]
fn load_settings(project_path: Option<String>) -> Result<JsonDoc, String> {
    let path = config_path(ConfigDoc::Settings, project_path.as_deref())?;
    load_json_at(&path)
}

#[tauri::command]
fn save_settings(
    settings: Value,
    expected_mtime_ms: Option<i64>,
    project_path: Option<String>,
) -> Result<i64, String> {
    let path = config_path(ConfigDoc::Settings, project_path.as_deref())?;
    save_json_at(&path, &settings, expected_mtime_ms)
}

#[tauri::command]
fn get_settings_path(project_path: Option<String>) -> Result<String, String> {
    Ok(config_path(ConfigDoc::Settings, project_path.as_deref())?
        .to_string_lossy()
        .to_string())
}

#[tauri::command]
fn load_models(project_path: Option<String>) -> Result<JsonDoc, String> {
    let path = config_path(ConfigDoc::Models, project_path.as_deref())?;
    load_json_at(&path)
}

#[tauri::command]
fn save_models(
    models: Value,
    expected_mtime_ms: Option<i64>,
    project_path: Option<String>,
) -> Result<i64, String> {
    let path = config_path(ConfigDoc::Models, project_path.as_deref())?;
    save_json_at(&path, &models, expected_mtime_ms)
}

#[tauri::command]
fn get_models_path(project_path: Option<String>) -> Result<String, String> {
    Ok(config_path(ConfigDoc::Models, project_path.as_deref())?
        .to_string_lossy()
        .to_string())
}

// ─── Preset export / share ──────────────────────────────────────────────────
//
// Export writes the current preferences to a user-chosen `.preset.md` file —
// same canonical format as the live preferences file, but at a location the
// user picks. Share returns a fenced ```yaml block with sensitive-looking
// values stripped so the caller can show a confirm-before-copy modal.

/// Export the given preferences to an arbitrary file path.
#[tauri::command]
fn export_preset(target_path: String, preferences: Value) -> Result<String, String> {
    let path = PathBuf::from(&target_path);
    if target_path.trim().is_empty() {
        return Err("Target path is empty".to_string());
    }
    // Normalize stringy IDs so an exported preset doesn't reintroduce the
    // unquoted-snowflake bug on reimport. See core::normalize_stringy_ids.
    let mut normalized = preferences;
    normalize_stringy_ids(&mut normalized);
    let serialized = serialize_preferences(&normalized)?;
    write_atomic(&path, serialized.as_bytes())?;
    Ok(path.to_string_lossy().to_string())
}

/// Load preferences from an arbitrary `.preset.md` file. Mirrors `export_preset`
/// — the frontend calls this when the user picks Import, then keeps the result
/// in the dirty buffer so the user reviews before committing with Save.
#[tauri::command]
fn import_preset(source_path: String) -> Result<Value, String> {
    if source_path.trim().is_empty() {
        return Err("Source path is empty".to_string());
    }
    let path = PathBuf::from(&source_path);
    if !path.exists() {
        return Err(format!("Preset file does not exist: {}", source_path));
    }
    // load_preferences_at already handles frontmatter parsing + snowflake
    // coercion, so a round-trip through export_preset/import_preset is safe.
    load_preferences_at(&path)
}

/// Load arbitrary JSON config (models.json, settings.json) from a user-picked path.
#[tauri::command]
fn import_json_file(source_path: String) -> Result<Value, String> {
    if source_path.trim().is_empty() {
        return Err("Source path is empty".to_string());
    }
    let path = PathBuf::from(&source_path);
    if !path.exists() {
        return Err(format!("File does not exist: {}", source_path));
    }
    Ok(load_json_at(&path)?.value)
}

/// Walk a JSON value and replace any string value whose key contains
/// `key`/`token`/`secret`/`password` (case-insensitive) with `<redacted>`.
/// Recurses through objects and arrays. Non-string values under sensitive
/// keys are left alone — the intent is to strip only obvious secrets in
/// free-text fields like `custom_instructions`.
fn redact_sensitive(value: &mut Value) {
    match value {
        Value::Object(map) => {
            for (k, v) in map.iter_mut() {
                let k_lower = k.to_lowercase();
                let is_sensitive = k_lower.contains("key")
                    || k_lower.contains("token")
                    || k_lower.contains("secret")
                    || k_lower.contains("password");
                if is_sensitive {
                    if let Value::String(_) = v {
                        *v = Value::String("<redacted>".to_string());
                        continue;
                    }
                }
                redact_sensitive(v);
            }
        }
        Value::Array(items) => {
            for v in items.iter_mut() {
                redact_sensitive(v);
            }
        }
        _ => {}
    }
}

/// Build a shareable, redacted YAML fenced block for copy-to-clipboard.
/// The frontend shows this in a modal so the user can see exactly what will
/// land on the clipboard before confirming.
#[tauri::command]
fn build_shareable_preset(preferences: Value) -> Result<String, String> {
    let mut redacted = preferences;
    redact_sensitive(&mut redacted);
    normalize_stringy_ids(&mut redacted);
    let serialized = serialize_preferences(&redacted)?;
    // Extract just the YAML body (between the `---` fences) so the fenced
    // code block is cleaner when pasted into chat/docs.
    let body = serialized
        .strip_prefix("---\n")
        .and_then(|s| s.strip_suffix("---\n"))
        .unwrap_or(&serialized)
        .trim_end();
    Ok(format!("```yaml\n{}\n```\n", body))
}

// ─── Skills ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SkillInfo {
    /// Unique path-based ID (same as `path`).
    id: String,
    /// Display name (from frontmatter `name`, falls back to directory name).
    name: String,
    /// Short description (from frontmatter `description`).
    description: String,
    /// "global" or "project".
    scope: String,
    /// Absolute path to SKILL.md.
    path: String,
    /// Directory name (useful for rename detection).
    dir_name: String,
}

/// Roots to scan for skills in a given scope.
fn skill_roots(project_path: Option<&str>) -> Vec<(PathBuf, &'static str)> {
    let mut roots: Vec<(PathBuf, &'static str)> = Vec::new();

    // Global roots — both Claude and GSD conventions
    if let Some(home) = dirs::home_dir() {
        roots.push((home.join(".claude").join("skills"), "global"));
        roots.push((home.join(".gsd").join("skills"), "global"));
    }

    // Project roots (if a project is selected)
    if let Some(p) = project_path {
        if !p.is_empty() {
            let base = PathBuf::from(p);
            roots.push((base.join(".claude").join("skills"), "project"));
            roots.push((base.join(".gsd").join("skills"), "project"));
        }
    }

    roots
}

/// Legacy GSD-1 skills live under `.claude/skills/gsd-*` and should not be
/// surfaced in the GSD Pi config manager. Returns true when the given skill
/// directory sitting under a `.claude/skills` root should be filtered out.
fn is_legacy_gsd_skill(root: &Path, dir_name: &str) -> bool {
    if !dir_name.starts_with("gsd-") {
        return false;
    }
    // Only filter when we're scanning a `.claude/skills` root — a legitimate
    // `.gsd/skills/gsd-something` directory is still valid.
    root.components().any(|c| c.as_os_str() == ".claude")
}

/// Scan a single skills root directory for SKILL.md files.
fn scan_skills_root(root: &Path, scope: &str) -> Vec<SkillInfo> {
    let mut results = Vec::new();
    if !root.exists() || !root.is_dir() {
        return results;
    }

    let entries = match fs::read_dir(root) {
        Ok(e) => e,
        Err(_) => return results,
    };

    for entry in entries.flatten() {
        let entry_path = entry.path();
        if !entry_path.is_dir() {
            continue;
        }

        // Check for SKILL.md in the immediate directory
        let skill_file = entry_path.join("SKILL.md");
        if skill_file.exists() {
            let dir_name = entry_path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            if is_legacy_gsd_skill(root, &dir_name) {
                continue;
            }

            let content = fs::read_to_string(&skill_file).unwrap_or_default();
            let yaml = parse_frontmatter(&content).unwrap_or_default();
            let name =
                read_frontmatter_field(&yaml, "name").unwrap_or_else(|| dir_name.clone());
            let description = read_frontmatter_field(&yaml, "description").unwrap_or_default();

            let path_str = skill_file.to_string_lossy().to_string();
            results.push(SkillInfo {
                id: path_str.clone(),
                name,
                description,
                scope: scope.to_string(),
                path: path_str,
                dir_name,
            });
        } else {
            // Also walk one level deeper for namespaced skills (e.g. skills/group/name/SKILL.md)
            let parent_dir_name = entry_path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();
            if is_legacy_gsd_skill(root, &parent_dir_name) {
                continue;
            }
            if let Ok(sub_entries) = fs::read_dir(&entry_path) {
                for sub in sub_entries.flatten() {
                    let sub_path = sub.path();
                    if sub_path.is_dir() {
                        let inner = sub_path.join("SKILL.md");
                        if inner.exists() {
                            let parent_name = entry_path
                                .file_name()
                                .and_then(|s| s.to_str())
                                .unwrap_or("")
                                .to_string();
                            let dir_name = sub_path
                                .file_name()
                                .and_then(|s| s.to_str())
                                .unwrap_or("unknown")
                                .to_string();

                            let content = fs::read_to_string(&inner).unwrap_or_default();
                            let yaml = parse_frontmatter(&content).unwrap_or_default();
                            let name = read_frontmatter_field(&yaml, "name")
                                .unwrap_or_else(|| format!("{}/{}", parent_name, dir_name));
                            let description =
                                read_frontmatter_field(&yaml, "description").unwrap_or_default();

                            let path_str = inner.to_string_lossy().to_string();
                            results.push(SkillInfo {
                                id: path_str.clone(),
                                name,
                                description,
                                scope: scope.to_string(),
                                path: path_str,
                                dir_name: format!("{}/{}", parent_name, dir_name),
                            });
                        }
                    }
                }
            }
        }
    }

    results
}

#[tauri::command]
fn list_skills(project_path: Option<String>) -> Result<Vec<SkillInfo>, String> {
    let roots = skill_roots(project_path.as_deref());
    let mut all = Vec::new();
    for (root, scope) in roots {
        let mut found = scan_skills_root(&root, scope);
        all.append(&mut found);
    }
    // Sort: project scope first, then by name
    all.sort_by(|a, b| {
        b.scope
            .cmp(&a.scope)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(all)
}

#[tauri::command]
fn read_skill(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Skill file does not exist: {}", path));
    }
    fs::read_to_string(&p).map_err(|e| format!("Failed to read skill: {}", e))
}

#[tauri::command]
fn write_skill(path: String, content: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    ensure_parent_dir(&p)?;

    // Backup existing file
    if p.exists() {
        let backup = p.with_extension("md.bak");
        fs::copy(&p, &backup).ok();
    }

    fs::write(&p, content).map_err(|e| format!("Failed to write skill: {}", e))?;
    Ok(())
}

#[tauri::command]
fn create_skill(
    name: String,
    scope: String,
    project_path: Option<String>,
) -> Result<SkillInfo, String> {
    // Sanitize directory name
    let dir_name: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect();
    let dir_name = dir_name.trim_matches('-').to_lowercase();
    if dir_name.is_empty() {
        return Err("Skill name cannot be empty".to_string());
    }

    let root = match scope.as_str() {
        "global" => {
            let home = dirs::home_dir().ok_or("could not resolve home directory")?;
            home.join(".claude").join("skills")
        }
        "project" => {
            let pp = project_path.ok_or("Project path required for project-scoped skill")?;
            if pp.is_empty() {
                return Err("Project path required for project-scoped skill".to_string());
            }
            PathBuf::from(pp).join(".claude").join("skills")
        }
        other => return Err(format!("Unknown scope: {}", other)),
    };

    let skill_dir = root.join(&dir_name);
    if skill_dir.exists() {
        return Err(format!("Skill '{}' already exists", dir_name));
    }
    fs::create_dir_all(&skill_dir).map_err(|e| format!("Failed to create skill dir: {}", e))?;

    let skill_file = skill_dir.join("SKILL.md");
    let template = format!(
        "---\nname: {}\ndescription: Short description of what this skill does and when to use it.\n---\n\n# {}\n\nDescribe the skill here. This body is read by Claude when the skill is loaded.\n\n## When to use\n\n- Condition 1\n- Condition 2\n\n## How to apply\n\nSteps or guidance for applying this skill.\n",
        name, name
    );
    fs::write(&skill_file, template).map_err(|e| format!("Failed to write skill: {}", e))?;

    let path_str = skill_file.to_string_lossy().to_string();
    Ok(SkillInfo {
        id: path_str.clone(),
        name: name.clone(),
        description: "Short description of what this skill does and when to use it.".to_string(),
        scope: scope.clone(),
        path: path_str,
        dir_name,
    })
}

#[tauri::command]
fn delete_skill(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Skill file does not exist: {}", path));
    }
    // Delete the parent directory (the skill folder)
    if let Some(parent) = p.parent() {
        fs::remove_dir_all(parent).map_err(|e| format!("Failed to delete skill: {}", e))?;
    }
    Ok(())
}

// ─── API key management (OS keychain + .env export) ─────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
struct KeyStatus {
    /// Env var name (used as the keychain account key).
    name: String,
    /// Whether a value is currently set in the OS keychain.
    is_set: bool,
    /// If set, a preview of the last N characters (for visual confirmation).
    preview: Option<String>,
}

fn keyring_entry(service: &str, name: &str) -> Result<Entry, String> {
    Entry::new(service, name).map_err(|e| format!("Keyring error: {}", e))
}

fn current_keyring_entry(name: &str) -> Result<Entry, String> {
    keyring_entry(KEYRING_SERVICE, name)
}

/// Copy a credential from `net.fluxlabs.gsd2-config` when the new service has
/// no entry yet. Removes the legacy entry after a successful copy.
fn migrate_legacy_keyring_entry(name: &str) -> Result<(), String> {
    let new_entry = current_keyring_entry(name)?;
    match new_entry.get_password() {
        Ok(_) => return Ok(()),
        Err(keyring::Error::NoEntry) => {}
        Err(e) => return Err(format!("Failed to read key {}: {}", name, e)),
    }

    let legacy_entry = keyring_entry(LEGACY_KEYRING_SERVICE, name)?;
    match legacy_entry.get_password() {
        Ok(value) => {
            new_entry
                .set_password(&value)
                .map_err(|e| format!("Failed to migrate key {}: {}", name, e))?;
            if let Err(e) = legacy_entry.delete_credential() {
                log::warn!("Migrated {} but could not remove legacy keyring entry: {}", name, e);
            } else {
                log::info!("Migrated keyring entry {} from legacy service", name);
            }
            Ok(())
        }
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("Failed to read legacy key {}: {}", name, e)),
    }
}

fn migrate_all_legacy_keyring_entries() {
    for name in KNOWN_API_KEY_NAMES {
        if let Err(e) = migrate_legacy_keyring_entry(name) {
            log::warn!("Keyring migration skipped for {}: {}", name, e);
        }
    }
}

#[tauri::command]
fn get_key(name: String) -> Result<Option<String>, String> {
    migrate_legacy_keyring_entry(&name)?;
    let entry = current_keyring_entry(&name)?;
    match entry.get_password() {
        Ok(v) => Ok(Some(v)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to read key: {}", e)),
    }
}

#[tauri::command]
fn set_key(name: String, value: String) -> Result<(), String> {
    if value.is_empty() {
        return delete_key(name);
    }
    migrate_legacy_keyring_entry(&name)?;
    let entry = current_keyring_entry(&name)?;
    entry
        .set_password(&value)
        .map_err(|e| format!("Failed to set key: {}", e))
}

#[tauri::command]
fn delete_key(name: String) -> Result<(), String> {
    migrate_legacy_keyring_entry(&name)?;
    let entry = current_keyring_entry(&name)?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("Failed to delete key: {}", e)),
    }
}

#[tauri::command]
fn list_key_statuses(names: Vec<String>) -> Result<Vec<KeyStatus>, String> {
    let mut result = Vec::with_capacity(names.len());
    for name in names {
        migrate_legacy_keyring_entry(&name)?;
        let entry = current_keyring_entry(&name)?;
        match entry.get_password() {
            Ok(v) => {
                let preview = if v.len() > 4 {
                    Some(format!("…{}", &v[v.len().saturating_sub(4)..]))
                } else {
                    Some("…".to_string())
                };
                result.push(KeyStatus {
                    name,
                    is_set: true,
                    preview,
                });
            }
            Err(keyring::Error::NoEntry) => result.push(KeyStatus {
                name,
                is_set: false,
                preview: None,
            }),
            Err(e) => return Err(format!("Keyring error for {}: {}", name, e)),
        }
    }
    Ok(result)
}

/// Write all set keys to ~/.gsd/env.sh as a sourceable shell file.
#[tauri::command]
fn export_env_file(names: Vec<String>) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("could not resolve home directory")?;
    let dir = home.join(".gsd");
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create dir: {}", e))?;
    let file = dir.join("env.sh");

    let mut lines: Vec<String> = Vec::new();
    lines.push("#!/usr/bin/env bash".to_string());
    lines.push("# Generated by GSD Pi Config — do not edit by hand.".to_string());
    lines.push("# Source this file from your shell profile:".to_string());
    lines.push("#   [ -f ~/.gsd/env.sh ] && source ~/.gsd/env.sh".to_string());
    lines.push(String::new());

    for name in names {
        migrate_legacy_keyring_entry(&name)?;
        let entry = current_keyring_entry(&name)?;
        match entry.get_password() {
            Ok(v) => {
                // Single-quote and escape internal single quotes
                let escaped = v.replace('\'', "'\\''");
                lines.push(format!("export {}='{}'", name, escaped));
            }
            Err(keyring::Error::NoEntry) => {}
            Err(e) => return Err(format!("Failed to read {}: {}", name, e)),
        }
    }
    lines.push(String::new());

    fs::write(&file, lines.join("\n")).map_err(|e| format!("Failed to write env.sh: {}", e))?;

    // Set 0600 permissions on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perm = fs::Permissions::from_mode(0o600);
        fs::set_permissions(&file, perm).ok();
    }

    Ok(file.to_string_lossy().to_string())
}

// ─── Agents ─────────────────────────────────────────────────────────────────
//
// Agents are flat `.md` files living in `~/.claude/agents/` (global) or
// `<project>/.claude/agents/` (project). Each file has YAML frontmatter with
// `name`, `description`, optionally `model` and `tools`. The body is the
// system prompt for the agent.

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AgentInfo {
    /// Unique path-based id (same as `path`).
    id: String,
    /// Display name (frontmatter `name`, falls back to file stem).
    name: String,
    /// Short description from frontmatter.
    description: String,
    /// "global" or "project".
    scope: String,
    /// Absolute path to the agent .md file.
    path: String,
    /// Filename (e.g. "code-reviewer.md") — useful for rename detection.
    file_name: String,
}

fn agent_roots(project_path: Option<&str>) -> Vec<(PathBuf, &'static str)> {
    let mut roots: Vec<(PathBuf, &'static str)> = Vec::new();
    if let Some(home) = dirs::home_dir() {
        roots.push((home.join(".claude").join("agents"), "global"));
    }
    if let Some(p) = project_path {
        if !p.is_empty() {
            let base = PathBuf::from(p);
            roots.push((base.join(".claude").join("agents"), "project"));
        }
    }
    roots
}

fn scan_agents_root(root: &Path, scope: &str) -> Vec<AgentInfo> {
    let mut results = Vec::new();
    if !root.exists() || !root.is_dir() {
        return results;
    }
    let entries = match fs::read_dir(root) {
        Ok(e) => e,
        Err(_) => return results,
    };
    for entry in entries.flatten() {
        let p = entry.path();
        if !p.is_file() {
            continue;
        }
        if p.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        let file_name = p
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_string();
        let stem = p
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string();
        // Hide legacy/bundled `gsd-*` agents from the GUI — they're part of
        // GSD itself, not user-authored, and shouldn't show up in the library.
        if stem.starts_with("gsd-") {
            continue;
        }
        let content = fs::read_to_string(&p).unwrap_or_default();
        let yaml = parse_frontmatter(&content).unwrap_or_default();
        let name = read_frontmatter_field(&yaml, "name").unwrap_or_else(|| stem.clone());
        let description = read_frontmatter_field(&yaml, "description").unwrap_or_default();
        let path_str = p.to_string_lossy().to_string();
        results.push(AgentInfo {
            id: path_str.clone(),
            name,
            description,
            scope: scope.to_string(),
            path: path_str,
            file_name,
        });
    }
    results
}

#[tauri::command]
fn list_agents(project_path: Option<String>) -> Result<Vec<AgentInfo>, String> {
    let roots = agent_roots(project_path.as_deref());
    let mut all = Vec::new();
    for (root, scope) in roots {
        let mut found = scan_agents_root(&root, scope);
        all.append(&mut found);
    }
    // Project scope first, then alphabetical
    all.sort_by(|a, b| {
        b.scope
            .cmp(&a.scope)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(all)
}

#[tauri::command]
fn read_agent(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Agent file does not exist: {}", path));
    }
    fs::read_to_string(&p).map_err(|e| format!("Failed to read agent: {}", e))
}

#[tauri::command]
fn write_agent(path: String, content: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    ensure_parent_dir(&p)?;
    if p.exists() {
        let backup = p.with_extension("md.bak");
        fs::copy(&p, &backup).ok();
    }
    fs::write(&p, content).map_err(|e| format!("Failed to write agent: {}", e))?;
    Ok(())
}

#[tauri::command]
fn create_agent(
    name: String,
    scope: String,
    project_path: Option<String>,
) -> Result<AgentInfo, String> {
    // Sanitize → lowercase-hyphen stem
    let file_stem: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect();
    let file_stem = file_stem.trim_matches('-').to_lowercase();
    if file_stem.is_empty() {
        return Err("Agent name cannot be empty".to_string());
    }

    let root = match scope.as_str() {
        "global" => {
            let home = dirs::home_dir().ok_or("could not resolve home directory")?;
            home.join(".claude").join("agents")
        }
        "project" => {
            let pp = project_path.ok_or("Project path required for project-scoped agent")?;
            if pp.is_empty() {
                return Err("Project path required for project-scoped agent".to_string());
            }
            PathBuf::from(pp).join(".claude").join("agents")
        }
        other => return Err(format!("Unknown scope: {}", other)),
    };

    fs::create_dir_all(&root).map_err(|e| format!("Failed to create agents dir: {}", e))?;

    let file_name = format!("{}.md", file_stem);
    let agent_file = root.join(&file_name);
    if agent_file.exists() {
        return Err(format!("Agent '{}' already exists", file_stem));
    }

    let template = format!(
        "---\nname: {}\ndescription: Short description of what this agent does and when Claude should dispatch to it.\n---\n\n# {}\n\nYou are an expert at [task]. When invoked, you should:\n\n1. Step one\n2. Step two\n3. Step three\n\n## Output format\n\nDescribe the expected output format here.\n",
        name, name
    );
    fs::write(&agent_file, template).map_err(|e| format!("Failed to write agent: {}", e))?;

    let path_str = agent_file.to_string_lossy().to_string();
    Ok(AgentInfo {
        id: path_str.clone(),
        name: name.clone(),
        description: "Short description of what this agent does and when Claude should dispatch to it.".to_string(),
        scope: scope.clone(),
        path: path_str,
        file_name,
    })
}

#[tauri::command]
fn delete_agent(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Agent file does not exist: {}", path));
    }
    fs::remove_file(&p).map_err(|e| format!("Failed to delete agent: {}", e))?;
    Ok(())
}

/// Check whether an external CLI is installed (e.g. claude, gcloud, gemini).
#[tauri::command]
fn check_cli_installed(binary: String) -> Result<bool, String> {
    // Use `which` via shell command
    let output = std::process::Command::new("which")
        .arg(&binary)
        .output()
        .map_err(|e| format!("Failed to run which: {}", e))?;
    Ok(output.status.success())
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn redact_sensitive_scrubs_key_named_string_fields() {
        let mut v = json!({
            "mode": "solo",
            "api_key": "sk-ant-abc123",
            "auth_token": "tok_xyz",
            "some_secret": "password123",
            "user_password": "hunter2",
            "nested": {
                "openai_api_key": "sk-openai-zzz",
                "safe_field": "visible",
            },
            "hooks": [
                { "name": "lint", "token": "gh_tok_123" },
            ],
        });
        redact_sensitive(&mut v);
        assert_eq!(v["mode"], json!("solo"));
        assert_eq!(v["api_key"], json!("<redacted>"));
        assert_eq!(v["auth_token"], json!("<redacted>"));
        assert_eq!(v["some_secret"], json!("<redacted>"));
        assert_eq!(v["user_password"], json!("<redacted>"));
        assert_eq!(v["nested"]["openai_api_key"], json!("<redacted>"));
        assert_eq!(v["nested"]["safe_field"], json!("visible"));
        assert_eq!(v["hooks"][0]["name"], json!("lint"));
        assert_eq!(v["hooks"][0]["token"], json!("<redacted>"));
    }

    #[test]
    fn redact_sensitive_is_case_insensitive() {
        let mut v = json!({
            "API_KEY": "aaa",
            "Token": "bbb",
            "SECRET": "ccc",
        });
        redact_sensitive(&mut v);
        assert_eq!(v["API_KEY"], json!("<redacted>"));
        assert_eq!(v["Token"], json!("<redacted>"));
        assert_eq!(v["SECRET"], json!("<redacted>"));
    }

    #[test]
    fn export_import_preset_round_trip_preserves_snowflake_ids() {
        let tmp = tempfile::TempDir::new().unwrap();
        let path = tmp.path().join("gsd.preset.md");
        let original = json!({
            "mode": "solo",
            "remote_questions": {
                "channel_id": "1234567890123456789",
                "channel": "discord"
            },
            "verification_commands": ["npm run build", "cargo test"],
        });
        export_preset(path.to_string_lossy().to_string(), original.clone())
            .expect("export_preset");
        let loaded = import_preset(path.to_string_lossy().to_string())
            .expect("import_preset");
        assert_eq!(loaded, original, "round-trip must preserve all values");
        // Specifically: the snowflake must still be a string, not a truncated number.
        assert_eq!(
            loaded["remote_questions"]["channel_id"],
            json!("1234567890123456789")
        );
    }

    #[test]
    fn import_preset_errors_on_missing_file() {
        let tmp = tempfile::TempDir::new().unwrap();
        let path = tmp.path().join("does-not-exist.preset.md");
        let err = import_preset(path.to_string_lossy().to_string()).unwrap_err();
        assert!(err.contains("does not exist"));
    }

    #[test]
    fn build_shareable_preset_emits_fenced_yaml_block() {
        let prefs = json!({ "mode": "solo", "api_key": "shouldnotleak" });
        let out = build_shareable_preset(prefs).expect("shareable build");
        assert!(out.starts_with("```yaml\n"));
        assert!(out.trim_end().ends_with("```"));
        assert!(out.contains("mode: solo"));
        assert!(out.contains("<redacted>"));
        assert!(
            !out.contains("shouldnotleak"),
            "raw secret must not appear in shareable output"
        );
    }
}

// ─── App entry ───────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            migrate_all_legacy_keyring_entries();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_preferences,
            save_preferences,
            get_preferences_path,
            load_settings,
            save_settings,
            get_settings_path,
            load_models,
            save_models,
            get_models_path,
            export_preset,
            import_preset,
            import_json_file,
            build_shareable_preset,
            list_skills,
            read_skill,
            write_skill,
            create_skill,
            delete_skill,
            list_agents,
            read_agent,
            write_agent,
            create_agent,
            delete_agent,
            get_key,
            set_key,
            delete_key,
            list_key_statuses,
            export_env_file,
            check_cli_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
