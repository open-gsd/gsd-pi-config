// GSD Pi Config - Context Management Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, ContextManagementConfig, ContextModeConfig } from "../../types";
import { Field, Toggle, NumberField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function ContextSection({ prefs, onChange }: Props) {
  const ctx = prefs.context_management ?? {};
  const setCtx = (update: Partial<ContextManagementConfig>) =>
    onChange({ ...prefs, context_management: { ...ctx, ...update } });

  const mode = prefs.context_mode ?? {};
  const setMode = (update: Partial<ContextModeConfig>) =>
    onChange({ ...prefs, context_mode: { ...mode, ...update } });

  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  return (
    <div>
      <SectionHeader
        title="Context"
        description="Context window management, gsd_exec sandboxing, and compaction settings."
      />

      <Field path="context_management.observation_masking" label="Observation Masking" description="Mask old tool results to reduce context bloat.">
        <Toggle checked={ctx.observation_masking ?? true} onChange={(v) => setCtx({ observation_masking: v })} />
      </Field>

      <Field path="context_management.observation_mask_turns" value={ctx.observation_mask_turns} label="Mask Turns" description="Keep this many recent turns verbatim (1-50).">
        <NumberField value={ctx.observation_mask_turns} onChange={(v) => setCtx({ observation_mask_turns: v })} min={1} max={50} placeholder="8" />
      </Field>

      <Field path="context_management.compaction_threshold_percent" value={ctx.compaction_threshold_percent} label="Compaction Threshold (%)" description="Trigger compaction at this % of context window (0.5-0.95).">
        <NumberField value={ctx.compaction_threshold_percent} onChange={(v) => setCtx({ compaction_threshold_percent: v })} min={0.5} max={0.95} placeholder="0.70" />
      </Field>

      <Field path="context_management.tool_result_max_chars" value={ctx.tool_result_max_chars} label="Tool Result Max Chars" description="Max characters per tool result (200-10000).">
        <NumberField value={ctx.tool_result_max_chars} onChange={(v) => setCtx({ tool_result_max_chars: v })} min={200} max={10000} placeholder="800" />
      </Field>

      <Field path="context_window_override" value={prefs.context_window_override} label="Context Window Override" description="Token limit for prompt budget when the model registry cannot resolve runtime window.">
        <NumberField
          value={prefs.context_window_override}
          onChange={(v) => set("context_window_override", v)}
          min={1000}
          placeholder="Optional"
        />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Context Mode (gsd_exec)</h3>

      <Field path="context_mode.enabled" label="Enabled" description="Sandbox tool output via subprocess digest. Default on unless explicitly false.">
        <Toggle
          checked={mode.enabled !== false}
          onChange={(v) => setMode({ enabled: v ? undefined : false })}
        />
      </Field>

      <Field path="context_mode.exec_timeout_ms" value={mode.exec_timeout_ms} label="Exec Timeout (ms)">
        <NumberField value={mode.exec_timeout_ms} onChange={(v) => setMode({ exec_timeout_ms: v })} min={1000} max={600000} placeholder="30000" />
      </Field>

      <Field path="context_mode.exec_stdout_cap_bytes" value={mode.exec_stdout_cap_bytes} label="Stdout Cap (bytes)">
        <NumberField value={mode.exec_stdout_cap_bytes} onChange={(v) => setMode({ exec_stdout_cap_bytes: v })} min={4096} max={16777216} placeholder="1048576" />
      </Field>

      <Field path="context_mode.exec_digest_chars" value={mode.exec_digest_chars} label="Digest Chars">
        <NumberField value={mode.exec_digest_chars} onChange={(v) => setMode({ exec_digest_chars: v })} min={0} max={4000} placeholder="300" />
      </Field>

      <Field path="context_mode.exec_env_allowlist" label="Env Allowlist" description="Extra env var names forwarded to sandboxed processes (PATH and HOME always forwarded).">
        <TagInput
          values={mode.exec_env_allowlist ?? []}
          onChange={(v) => setMode({ exec_env_allowlist: v.length > 0 ? v : undefined })}
          placeholder="VAR_NAME"
        />
      </Field>
    </div>
  );
}
