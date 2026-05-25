// GSD Pi Config - Field Registry (single source of truth for palette, dirty tracking, validation, hints)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// The registry maps a dotted JSON path (e.g. "git.auto_push") to metadata:
// which section owns it, a human label, a hint, a coarse type, and an optional
// validator. All palette search, per-section dirty detection, and field
// tooltips read from this file. When a new field is added to a section
// component, it MUST be added here too — the `FieldPath` type is the build
// contract that keeps section components and the registry in sync via
// `bindField()` in FormControls.

import type { SectionId } from "../components/Sidebar";
import { isEnum, numInRange, nonEmpty, validPath } from "./validators";

export type FieldType = "bool" | "number" | "text" | "enum" | "list" | "object";

export interface FieldMeta {
  section: SectionId;
  label: string;
  hint?: string;
  type: FieldType;
  /** Optional inline validator. Returns null if valid, error string if not. */
  validator?: (value: unknown) => string | null;
  /** Extra palette search terms beyond label/section/path. */
  keywords?: string[];
  /** Example value shown in hints/tooltips. */
  example?: string;
}

// ─── Registry ───────────────────────────────────────────────────────────────
//
// Keys are dotted json-paths matching the GSDPreferences shape in `types.ts`.
// List-of-object fields (hooks, skill_rules) are registered at the array
// level only; per-item UI lives inside the section component.

const registry = {
  // ─── General ────────────────────────────────────────────────────────────
  "mode": { section: "general", label: "Workflow Mode", type: "enum",
    hint: "Solo (single dev) or Team (multi-dev). Sets sensible defaults.",
    validator: isEnum(["solo", "team"]) },
  "token_profile": { section: "general", label: "Token Profile", type: "enum",
    hint: "Coordinates model selection, phase skipping, and compression.",
    validator: isEnum(["budget", "balanced", "quality", "burn-max"]) },
  "planning_depth": { section: "general", label: "Planning Depth", type: "enum",
    hint: "light: single discuss session; deep: staged PROJECT → REQUIREMENTS → CONTEXT → ROADMAP.",
    validator: isEnum(["light", "deep"]) },
  "language": { section: "general", label: "Response Language", type: "text",
    hint: "Language for agent responses (e.g. English, Spanish)." },
  "min_request_interval_ms": { section: "general", label: "Min Request Interval (ms)", type: "number",
    hint: "Minimum ms between auto-mode LLM requests. 0 disables.", validator: numInRange(0, 600_000) },
  "search_provider": { section: "general", label: "Search Provider", type: "enum",
    hint: "Search backend. auto uses the default provider.",
    validator: isEnum(["brave", "tavily", "ollama", "native", "auto"]) },
  "widget_mode": { section: "general", label: "Widget Mode", type: "enum",
    hint: "Widget display size for the auto-mode dashboard.",
    validator: isEnum(["full", "small", "min", "off"]) },
  "context_selection": { section: "general", label: "Context Selection", type: "enum",
    hint: "full inlines whole files; smart uses semantic chunking.",
    validator: isEnum(["full", "smart"]) },
  "service_tier": { section: "general", label: "Service Tier", type: "enum",
    hint: "Provider latency tier when supported (e.g. OpenAI priority/flex). priority costs more, flex costs less.",
    validator: isEnum(["priority", "flex"]) },
  "unique_milestone_ids": { section: "general", label: "Unique Milestone IDs", type: "bool",
    hint: "Generate milestone IDs in M{seq}-{rand6} format." },
  "uat_dispatch": { section: "general", label: "UAT Dispatch", type: "bool" },
  "auto_visualize": { section: "general", label: "Auto Visualize", type: "bool" },
  "auto_report": { section: "general", label: "Auto Report", type: "bool" },
  "show_token_cost": { section: "general", label: "Show Token Cost", type: "bool" },
  "forensics_dedup": { section: "general", label: "Forensics Dedup", type: "bool" },
  "stale_commit_threshold_minutes": { section: "general", label: "Stale Commit Threshold",
    hint: "Minutes without a commit before auto-safety-snapshot. 0 disables.",
    type: "number", validator: numInRange(0, 1440) },

  // ─── Models ─────────────────────────────────────────────────────────────
  "models": { section: "models", label: "Model Overrides", type: "object",
    keywords: ["openai", "gemini", "anthropic", "gpt", "provider", "model"] },
  "models.research": { section: "models", label: "Research Model", type: "text" },
  "models.planning": { section: "models", label: "Planning Model", type: "text" },
  "models.discuss": { section: "models", label: "Discussion Model", type: "text" },
  "models.execution": { section: "models", label: "Execution Model", type: "text" },
  "models.execution_simple": { section: "models", label: "Execution (Simple) Model", type: "text" },
  "models.completion": { section: "models", label: "Completion Model", type: "text" },
  "models.validation": { section: "models", label: "Validation Model", type: "text" },
  "models.subagent": { section: "models", label: "Subagent Model", type: "text" },
  "disabled_model_providers": { section: "models", label: "Disabled Providers", type: "list" },

  // ─── Git ────────────────────────────────────────────────────────────────
  "git.auto_push": { section: "git", label: "Auto Push", type: "bool" },
  "git.push_branches": { section: "git", label: "Push Branches", type: "bool" },
  "git.remote": { section: "git", label: "Remote", type: "text", example: "origin" },
  "git.snapshots": { section: "git", label: "Snapshots", type: "bool" },
  "git.pre_merge_check": { section: "git", label: "Pre-Merge Check", type: "enum",
    validator: isEnum(["true", "false", "auto"]) },
  "git.commit_type": { section: "git", label: "Commit Type", type: "enum",
    hint: "Conventional commit prefix; inferred from diff by default." },
  "git.main_branch": { section: "git", label: "Main Branch", type: "text", example: "main" },
  "git.merge_strategy": { section: "git", label: "Merge Strategy", type: "enum",
    validator: isEnum(["squash", "merge"]) },
  "git.isolation": { section: "git", label: "Isolation", type: "enum",
    validator: isEnum(["worktree", "branch", "none"]) },
  "git.manage_gitignore": { section: "git", label: "Manage .gitignore", type: "bool" },
  "git.worktree_post_create": { section: "git", label: "Worktree Post-Create Script", type: "text",
    validator: validPath },
  "git.auto_pr": { section: "git", label: "Auto PR", type: "bool" },
  "git.pr_target_branch": { section: "git", label: "PR Target Branch", type: "text", example: "main" },
  "git.absorb_snapshot_commits": { section: "git", label: "Absorb Snapshot Commits", type: "bool",
    hint: "Squash gsd snapshot commits into the next real commit." },
  "git.collapse_cadence": { section: "git", label: "Collapse Cadence", type: "enum",
    validator: isEnum(["milestone", "slice"]) },
  "git.milestone_resquash": { section: "git", label: "Milestone Resquash", type: "bool",
    hint: "When collapse_cadence is slice, re-squash to one commit per milestone at end." },

  // ─── Skills ─────────────────────────────────────────────────────────────
  "always_use_skills": { section: "skills", label: "Always Use Skills", type: "list",
    keywords: ["force", "required"] },
  "prefer_skills": { section: "skills", label: "Preferred Skills", type: "list" },
  "avoid_skills": { section: "skills", label: "Avoided Skills", type: "list" },
  "skill_rules": { section: "skills", label: "Skill Rules", type: "list",
    hint: "Conditional when/use/prefer/avoid overrides." },
  "skill_discovery": { section: "skills", label: "Skill Discovery", type: "enum",
    validator: isEnum(["auto", "suggest", "off"]) },
  "skill_staleness_days": { section: "skills", label: "Skill Staleness Days", type: "number",
    validator: numInRange(0, 365) },
  "custom_instructions": { section: "skills", label: "Custom Instructions", type: "list" },

  // ─── Budget & Cost ──────────────────────────────────────────────────────
  "budget_ceiling": { section: "budget", label: "Budget Ceiling", type: "number",
    hint: "Max USD per session. 0 disables.", validator: numInRange(0, 10000) },
  "budget_enforcement": { section: "budget", label: "Enforcement Mode", type: "enum",
    validator: isEnum(["warn", "pause", "halt"]) },
  "context_pause_threshold": { section: "budget", label: "Context Pause Threshold", type: "number",
    hint: "Percent of context window before pausing.", validator: numInRange(0, 100) },
  "per_unit_cost_cap_usd": { section: "budget", label: "Per-Unit Cost Cap ($)", type: "number",
    validator: numInRange(0, 10_000) },
  "flat_rate_providers": { section: "routing", label: "Flat-Rate Providers", type: "list",
    hint: "Provider IDs billed at flat rate (used with dynamic routing)." },

  // ─── Notifications ──────────────────────────────────────────────────────
  "notifications.enabled": { section: "notifications", label: "Notifications Enabled", type: "bool" },
  "notifications.on_complete": { section: "notifications", label: "On Complete", type: "bool" },
  "notifications.on_error": { section: "notifications", label: "On Error", type: "bool" },
  "notifications.on_budget": { section: "notifications", label: "On Budget", type: "bool" },
  "notifications.on_milestone": { section: "notifications", label: "On Milestone", type: "bool" },
  "notifications.on_attention": { section: "notifications", label: "On Attention", type: "bool" },

  // ─── Parallel ───────────────────────────────────────────────────────────
  "parallel.enabled": { section: "parallel", label: "Parallel Enabled", type: "bool" },
  "parallel.max_workers": { section: "parallel", label: "Max Workers", type: "number",
    validator: numInRange(1, 32) },
  "parallel.budget_ceiling": { section: "parallel", label: "Parallel Budget Ceiling", type: "number" },
  "parallel.merge_strategy": { section: "parallel", label: "Merge Strategy", type: "enum",
    validator: isEnum(["per-slice", "per-milestone"]) },
  "parallel.auto_merge": { section: "parallel", label: "Auto-Merge Mode", type: "enum",
    validator: isEnum(["auto", "confirm", "manual"]) },
  "parallel.worker_model": { section: "parallel", label: "Worker Model", type: "text" },
  "slice_parallel.enabled": { section: "parallel", label: "Slice Parallel Enabled", type: "bool" },
  "slice_parallel.max_workers": { section: "parallel", label: "Slice Max Workers", type: "number",
    validator: numInRange(1, 16) },
  "reactive_execution.enabled": { section: "parallel", label: "Reactive Execution", type: "bool" },
  "reactive_execution.max_parallel": { section: "parallel", label: "Reactive Max Parallel", type: "number",
    validator: numInRange(1, 16) },
  "reactive_execution.isolation_mode": { section: "parallel", label: "Reactive Isolation", type: "enum",
    validator: isEnum(["same-tree"]) },
  "reactive_execution.subagent_model": { section: "parallel", label: "Reactive Subagent Model", type: "text" },

  // ─── Phases ─────────────────────────────────────────────────────────────
  "phases.skip_research": { section: "phases", label: "Skip Research", type: "bool" },
  "phases.skip_reassess": { section: "phases", label: "Skip Reassess", type: "bool" },
  "phases.skip_slice_research": { section: "phases", label: "Skip Slice Research", type: "bool" },
  "phases.skip_milestone_validation": { section: "phases", label: "Skip Milestone Validation", type: "bool" },
  "phases.reassess_after_slice": { section: "phases", label: "Reassess After Slice", type: "bool" },
  "phases.require_slice_discussion": { section: "phases", label: "Require Slice Discussion", type: "bool" },
  "phases.mid_execution_escalation": { section: "phases", label: "Mid-Execution Escalation", type: "bool",
    hint: "Allow complete-task escalation payloads (ADR-011 P2)." },
  "phases.progressive_planning": { section: "phases", label: "Progressive Planning", type: "bool",
    hint: "Plan S01 fully; S02+ as sketches until refined." },
  "gate_evaluation.enabled": { section: "phases", label: "Gate Evaluation", type: "bool" },
  "gate_evaluation.slice_gates": { section: "phases", label: "Slice Gates", type: "list" },
  "gate_evaluation.task_gates": { section: "phases", label: "Task Gates", type: "bool" },

  // ─── Context ────────────────────────────────────────────────────────────
  "context_management.observation_masking": { section: "context", label: "Observation Masking", type: "bool" },
  "context_management.observation_mask_turns": { section: "context", label: "Mask Turns", type: "number",
    validator: numInRange(0, 50) },
  "context_management.compaction_threshold_percent": { section: "context", label: "Compaction Threshold %", type: "number",
    validator: numInRange(0, 100) },
  "context_management.tool_result_max_chars": { section: "context", label: "Tool Result Max Chars", type: "number",
    validator: numInRange(0, 1_000_000) },
  "context_window_override": { section: "context", label: "Context Window Override", type: "number",
    hint: "Token limit for prompt budget when registry cannot resolve runtime window.",
    validator: numInRange(1_000, 10_000_000) },
  "context_mode.enabled": { section: "context", label: "Context Mode (gsd_exec)", type: "bool",
    hint: "Tool-output sandboxing via subprocess digest. Default on unless false." },
  "context_mode.exec_timeout_ms": { section: "context", label: "Exec Timeout (ms)", type: "number",
    validator: numInRange(1_000, 600_000) },
  "context_mode.exec_stdout_cap_bytes": { section: "context", label: "Exec Stdout Cap (bytes)", type: "number",
    validator: numInRange(4_096, 16_777_216) },
  "context_mode.exec_digest_chars": { section: "context", label: "Exec Digest Chars", type: "number",
    validator: numInRange(0, 4_000) },
  "context_mode.exec_env_allowlist": { section: "context", label: "Exec Env Allowlist", type: "list" },

  // ─── Dynamic Routing ────────────────────────────────────────────────────
  "dynamic_routing.enabled": { section: "routing", label: "Dynamic Routing", type: "bool" },
  "dynamic_routing.tier_models.light": { section: "routing", label: "Light Tier Model", type: "text" },
  "dynamic_routing.tier_models.standard": { section: "routing", label: "Standard Tier Model", type: "text" },
  "dynamic_routing.tier_models.heavy": { section: "routing", label: "Heavy Tier Model", type: "text" },
  "dynamic_routing.escalate_on_failure": { section: "routing", label: "Escalate On Failure", type: "bool" },
  "dynamic_routing.budget_pressure": { section: "routing", label: "Budget Pressure Routing", type: "bool" },
  "dynamic_routing.cross_provider": { section: "routing", label: "Cross-Provider Routing", type: "bool" },
  "dynamic_routing.hooks": { section: "routing", label: "Routing Hooks", type: "bool" },
  "dynamic_routing.capability_routing": { section: "routing", label: "Capability Routing", type: "bool" },
  "dynamic_routing.allow_flat_rate_providers": { section: "routing", label: "Route Flat-Rate Providers", type: "bool",
    hint: "Opt in to dynamic routing for flat-rate providers (#4386)." },
  "modelOverrides": { section: "routing", label: "Model Capability Overrides", type: "object",
    hint: "Per-model 7-D capability scores for routing (ADR-004)." },

  // ─── Safety ─────────────────────────────────────────────────────────────
  "safety_harness.enabled": { section: "safety", label: "Safety Harness", type: "bool" },
  "safety_harness.evidence_collection": { section: "safety", label: "Evidence Collection", type: "bool" },
  "safety_harness.file_change_validation": { section: "safety", label: "File Change Validation", type: "bool" },
  "safety_harness.evidence_cross_reference": { section: "safety", label: "Evidence Cross-Reference", type: "bool" },
  "safety_harness.destructive_command_warnings": { section: "safety", label: "Destructive Command Warnings", type: "bool" },
  "safety_harness.content_validation": { section: "safety", label: "Content Validation", type: "bool" },
  "safety_harness.checkpoints": { section: "safety", label: "Checkpoints", type: "bool" },
  "safety_harness.auto_rollback": { section: "safety", label: "Auto Rollback", type: "bool" },
  "safety_harness.timeout_scale_cap": { section: "safety", label: "Timeout Scale Cap", type: "number",
    validator: numInRange(1, 100) },
  "safety_harness.file_change_allowlist": { section: "safety", label: "File Change Allowlist", type: "list",
    hint: "Glob patterns exempt from file-change validation." },

  // ─── Verification ───────────────────────────────────────────────────────
  "enhanced_verification": { section: "verification", label: "Enhanced Verification", type: "bool" },
  "enhanced_verification_pre": { section: "verification", label: "Enhanced Verify (Pre)", type: "bool" },
  "enhanced_verification_post": { section: "verification", label: "Enhanced Verify (Post)", type: "bool" },
  "enhanced_verification_strict": { section: "verification", label: "Enhanced Verify (Strict)", type: "bool" },
  "verification_commands": { section: "verification", label: "Verification Commands", type: "list",
    hint: "Shell commands run as part of verification gates." },
  "verification_auto_fix": { section: "verification", label: "Auto-Fix", type: "bool" },
  "verification_max_retries": { section: "verification", label: "Max Retries", type: "number",
    validator: numInRange(0, 10) },

  // ─── Discussion ─────────────────────────────────────────────────────────
  "discuss_preparation": { section: "discussion", label: "Discuss Preparation", type: "bool" },
  "discuss_web_research": { section: "discussion", label: "Discuss Web Research", type: "bool" },
  "discuss_depth": { section: "discussion", label: "Discuss Depth", type: "enum",
    validator: isEnum(["quick", "standard", "thorough"]) },

  // ─── Hooks ──────────────────────────────────────────────────────────────
  "post_unit_hooks": { section: "hooks", label: "Post-Unit Hooks", type: "list",
    hint: "Commands run after specific unit types complete." },
  "pre_dispatch_hooks": { section: "hooks", label: "Pre-Dispatch Hooks", type: "list",
    hint: "Hooks that modify, skip, or replace dispatches." },

  // ─── CMux ───────────────────────────────────────────────────────────────
  "cmux.enabled": { section: "cmux", label: "CMux Enabled", type: "bool" },
  "cmux.notifications": { section: "cmux", label: "CMux Notifications", type: "bool" },
  "cmux.sidebar": { section: "cmux", label: "CMux Sidebar", type: "bool" },
  "cmux.splits": { section: "cmux", label: "CMux Splits", type: "bool" },
  "cmux.browser": { section: "cmux", label: "CMux Browser", type: "bool" },

  // ─── Remote Questions ───────────────────────────────────────────────────
  "remote_questions.channel": { section: "remote", label: "Remote Channel", type: "enum",
    validator: isEnum(["slack", "discord", "telegram"]) },
  "remote_questions.channel_id": { section: "remote", label: "Channel ID", type: "text",
    validator: nonEmpty },
  "remote_questions.timeout_minutes": { section: "remote", label: "Remote Timeout (min)", type: "number",
    validator: numInRange(1, 1440) },
  "remote_questions.poll_interval_seconds": { section: "remote", label: "Remote Poll Interval (s)", type: "number",
    validator: numInRange(1, 600) },

  // ─── Codebase Map ───────────────────────────────────────────────────────
  "codebase.exclude_patterns": { section: "codebase", label: "Exclude Patterns", type: "list" },
  "codebase.max_files": { section: "codebase", label: "Max Files", type: "number",
    validator: numInRange(0, 1_000_000) },
  "codebase.collapse_threshold": { section: "codebase", label: "Collapse Threshold", type: "number",
    validator: numInRange(0, 10_000) },

  // ─── UOK ────────────────────────────────────────────────────────────────
  "uok.enabled": { section: "uok", label: "UOK Enabled", type: "bool" },
  "uok.legacy_fallback.enabled": { section: "uok", label: "Legacy Fallback", type: "bool" },
  "uok.gates.enabled": { section: "uok", label: "Gates", type: "bool" },
  "uok.model_policy.enabled": { section: "uok", label: "Model Policy", type: "bool" },
  "uok.execution_graph.enabled": { section: "uok", label: "Execution Graph", type: "bool" },
  "uok.gitops.enabled": { section: "uok", label: "GitOps", type: "bool" },
  "uok.gitops.turn_action": { section: "uok", label: "GitOps Turn Action", type: "enum",
    validator: isEnum(["commit", "snapshot", "status-only"]) },
  "uok.gitops.turn_push": { section: "uok", label: "GitOps Turn Push", type: "bool" },
  "uok.audit_unified.enabled": { section: "uok", label: "Unified Audit", type: "bool" },
  "uok.plan_v2.enabled": { section: "uok", label: "Plan v2", type: "bool" },

  // ─── GitHub sync ──────────────────────────────────────────────────────────
  "github.enabled": { section: "github", label: "GitHub Sync Enabled", type: "bool" },
  "github.repo": { section: "github", label: "Repository", type: "text", example: "owner/repo" },
  "github.project": { section: "github", label: "Project Number", type: "number" },
  "github.labels": { section: "github", label: "Issue Labels", type: "list" },
  "github.auto_link_commits": { section: "github", label: "Auto-Link Commits", type: "bool" },
  "github.slice_prs": { section: "github", label: "Slice PRs", type: "bool" },

  // ─── Workspace ──────────────────────────────────────────────────────────
  "workspace.mode": { section: "workspace", label: "Workspace Mode", type: "enum",
    validator: isEnum(["project", "parent"]) },
  "workspace.repositories": { section: "workspace", label: "Repositories", type: "object" },

  // ─── Claude Code MCP ──────────────────────────────────────────────────────
  "claude_code_mcp.per_model": { section: "mcp", label: "Per-Model MCP Filters", type: "object" },

  // ─── Auto supervisor ────────────────────────────────────────────────────
  "auto_supervisor.model": { section: "experimental", label: "Supervisor Model", type: "text" },
  "auto_supervisor.soft_timeout_minutes": { section: "experimental", label: "Supervisor Soft Timeout", type: "number",
    validator: numInRange(1, 1440) },
  "auto_supervisor.idle_timeout_minutes": { section: "experimental", label: "Supervisor Idle Timeout", type: "number",
    validator: numInRange(1, 1440) },
  "auto_supervisor.hard_timeout_minutes": { section: "experimental", label: "Supervisor Hard Timeout", type: "number",
    validator: numInRange(1, 1440) },

  // ─── Experimental ───────────────────────────────────────────────────────
  "experimental.rtk": { section: "experimental", label: "RTK", type: "bool",
    hint: "Experimental Rapid Task Kernel." },
} satisfies Record<string, FieldMeta>;

// Re-export the registry with a widened value type so downstream callers get
// back `FieldMeta` (not the narrowed literal) without losing `FieldPath` keys.
export const fields: Record<string, FieldMeta> = registry;

/** All registered field paths as a literal-union type. */
export type FieldPath = keyof typeof registry;

/** Enumerate every registered path (stable iteration order). */
export const ALL_FIELD_PATHS = Object.keys(registry) as FieldPath[];

/** Lookup metadata. Returns undefined if the path is not in the registry. */
export function getField(path: string): FieldMeta | undefined {
  return registry[path as FieldPath];
}

/**
 * Return all field paths owned by a given section. Used by `useDirty` and the
 * section-reset action to scope work to a single section.
 */
export function fieldsForSection(section: SectionId): FieldPath[] {
  return ALL_FIELD_PATHS.filter((p) => registry[p].section === section);
}

/**
 * Resolve a dotted path against an object. Returns `undefined` if any
 * intermediate segment is missing.
 */
export function getAtPath(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined) return undefined;
  const segs = path.split(".");
  let cur: unknown = obj;
  for (const seg of segs) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/**
 * Produce a shallow clone of `obj` with `path` removed (or unset). Used by
 * section reset to drop only the paths owned by a single section.
 */
export function unsetAtPath(obj: Record<string, unknown>, path: string): Record<string, unknown> {
  const segs = path.split(".");
  if (segs.length === 1) {
    const { [segs[0]]: _drop, ...rest } = obj;
    void _drop;
    return rest;
  }
  const [head, ...tail] = segs;
  const child = obj[head];
  if (child === null || child === undefined || typeof child !== "object") return obj;
  return {
    ...obj,
    [head]: unsetAtPath(child as Record<string, unknown>, tail.join(".")),
  };
}
