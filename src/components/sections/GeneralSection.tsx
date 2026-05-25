// GSD Pi Config - General Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type {
  GSDPreferences,
  WorkflowMode,
  TokenProfile,
  SearchProvider,
  WidgetMode,
  ContextSelectionMode,
  ServiceTier,
  PlanningDepth,
} from "../../types";
import { Field, Toggle, SelectField, NumberField, TextField, SectionHeader } from "../FormControls";
import {
  applyModePreset,
  applyProfilePreset,
  diffModePreset,
  diffProfilePreset,
  formatValue,
  type PresetDiffEntry,
} from "../../lib/presets";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

/** Build a human-readable confirm message listing every field the cascade
 *  will overwrite so the user sees exactly what's about to change. */
function buildCascadeMessage(
  presetLabel: string,
  diff: PresetDiffEntry[],
): string {
  const lines = diff.map(
    (d) => `  • ${d.path}: ${formatValue(d.before)} → ${formatValue(d.after)}`,
  );
  const n = diff.length;
  return (
    `Applying the "${presetLabel}" preset will update ${n} setting${n === 1 ? "" : "s"}:\n\n` +
    lines.join("\n") +
    `\n\nApply these defaults? Click Cancel to switch without cascading.`
  );
}

export function GeneralSection({ prefs, onChange }: Props) {
  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  // Cascade handler for `mode`. If the user picks solo/team, preview the
  // cascaded fields, ask to confirm, and apply the full preset on OK. On
  // cancel we still flip `mode` — they explicitly picked it — just without
  // the cascade. Clearing the field (undefined) never cascades.
  const onModeChange = (v: WorkflowMode | undefined) => {
    if (v === undefined) {
      set("mode", undefined);
      return;
    }
    const diff = diffModePreset(prefs, v);
    if (diff.length === 0) {
      set("mode", v);
      return;
    }
    const ok = window.confirm(buildCascadeMessage(`${v} mode`, diff));
    if (ok) {
      onChange(applyModePreset(prefs, v));
    } else {
      set("mode", v);
    }
  };

  // Same shape for `token_profile`.
  const onProfileChange = (v: TokenProfile | undefined) => {
    if (v === undefined) {
      set("token_profile", undefined);
      return;
    }
    const diff = diffProfilePreset(prefs, v);
    if (diff.length === 0) {
      set("token_profile", v);
      return;
    }
    const ok = window.confirm(buildCascadeMessage(`${v} profile`, diff));
    if (ok) {
      onChange(applyProfilePreset(prefs, v));
    } else {
      set("token_profile", v);
    }
  };

  return (
    <div>
      <SectionHeader
        title="General"
        description="Core workflow mode, profiles, and global behavior."
      />

      <Field path="mode" value={prefs.mode} label="Workflow Mode">
        <SelectField<WorkflowMode>
          value={prefs.mode}
          onChange={onModeChange}
          options={["solo", "team"]}
          placeholder="Not set"
        />
      </Field>

      <Field path="token_profile" value={prefs.token_profile} label="Token Profile">
        <SelectField<TokenProfile>
          value={prefs.token_profile}
          onChange={onProfileChange}
          options={["budget", "balanced", "quality", "burn-max"]}
          placeholder="Not set"
        />
      </Field>

      <Field path="planning_depth" value={prefs.planning_depth} label="Planning Depth" description="New project/milestone interactive planning flow depth.">
        <SelectField<PlanningDepth>
          value={prefs.planning_depth}
          onChange={(v) => set("planning_depth", v)}
          options={["light", "deep"]}
          placeholder="light"
        />
      </Field>

      <Field path="language" value={prefs.language} label="Response Language" description="Language for agent responses (e.g. English).">
        <TextField
          value={prefs.language}
          onChange={(v) => set("language", v || undefined)}
          placeholder="Default"
        />
      </Field>

      <Field path="search_provider" value={prefs.search_provider} label="Search Provider">
        <SelectField<SearchProvider>
          value={prefs.search_provider}
          onChange={(v) => set("search_provider", v)}
          options={["auto", "brave", "tavily", "ollama", "native"]}
        />
      </Field>

      <Field path="widget_mode" value={prefs.widget_mode} label="Widget Mode">
        <SelectField<WidgetMode>
          value={prefs.widget_mode}
          onChange={(v) => set("widget_mode", v)}
          options={["full", "small", "min", "off"]}
        />
      </Field>

      <Field path="context_selection" value={prefs.context_selection} label="Context Selection">
        <SelectField<ContextSelectionMode>
          value={prefs.context_selection}
          onChange={(v) => set("context_selection", v)}
          options={["full", "smart"]}
          placeholder="Derived from profile"
        />
      </Field>

      <Field path="service_tier" value={prefs.service_tier} label="Service Tier">
        <SelectField<ServiceTier>
          value={prefs.service_tier}
          onChange={(v) => set("service_tier", v)}
          options={["priority", "flex"]}
          placeholder="Not set"
        />
      </Field>

      <Field path="unique_milestone_ids" label="Unique Milestone IDs">
        <Toggle
          checked={prefs.unique_milestone_ids ?? false}
          onChange={(v) => set("unique_milestone_ids", v)}
        />
      </Field>

      <Field path="uat_dispatch" label="UAT Dispatch" description="Enable User Acceptance Testing dispatch mode.">
        <Toggle
          checked={prefs.uat_dispatch ?? false}
          onChange={(v) => set("uat_dispatch", v)}
        />
      </Field>

      <Field path="auto_visualize" label="Auto Visualize" description="Show visualizer hint after each milestone completion.">
        <Toggle
          checked={prefs.auto_visualize ?? false}
          onChange={(v) => set("auto_visualize", v)}
        />
      </Field>

      <Field path="auto_report" label="Auto Report" description="Generate HTML report snapshot after each milestone completion.">
        <Toggle
          checked={prefs.auto_report ?? true}
          onChange={(v) => set("auto_report", v)}
        />
      </Field>

      <Field path="show_token_cost" label="Show Token Cost" description="Show per-prompt and cumulative session token cost.">
        <Toggle
          checked={prefs.show_token_cost ?? false}
          onChange={(v) => set("show_token_cost", v)}
        />
      </Field>

      <Field path="forensics_dedup" label="Forensics Dedup" description="Search existing issues/PRs before filing from forensics.">
        <Toggle
          checked={prefs.forensics_dedup ?? false}
          onChange={(v) => set("forensics_dedup", v)}
        />
      </Field>

      <Field path="stale_commit_threshold_minutes" value={prefs.stale_commit_threshold_minutes} label="Stale Commit Threshold" description="Minutes without a commit before auto-safety-snapshot. 0 disables.">
        <NumberField
          value={prefs.stale_commit_threshold_minutes}
          onChange={(v) => set("stale_commit_threshold_minutes", v)}
          min={0}
          placeholder="30"
        />
      </Field>

      <Field path="min_request_interval_ms" value={prefs.min_request_interval_ms} label="Min Request Interval (ms)" description="Minimum ms between auto-mode LLM requests. 0 disables rate pacing.">
        <NumberField
          value={prefs.min_request_interval_ms}
          onChange={(v) => set("min_request_interval_ms", v)}
          min={0}
          placeholder="0"
        />
      </Field>
    </div>
  );
}
