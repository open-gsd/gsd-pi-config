// GSD Pi Config - Safety Harness Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, SafetyHarnessConfig } from "../../types";
import { Field, Toggle, NumberField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function SafetySection({ prefs, onChange }: Props) {
  const safety = prefs.safety_harness ?? {};
  const setSafety = (update: Partial<SafetyHarnessConfig>) =>
    onChange({ ...prefs, safety_harness: { ...safety, ...update } });

  return (
    <div>
      <SectionHeader
        title="Safety Harness"
        description="LLM safety harness monitors, validates, and constrains behavior during auto-mode."
      />

      <Field path="safety_harness.enabled" label="Enabled" description="Master toggle for the safety harness.">
        <Toggle checked={safety.enabled ?? true} onChange={(v) => setSafety({ enabled: v })} />
      </Field>

      <Field path="safety_harness.evidence_collection" label="Evidence Collection" description="Collect evidence during execution.">
        <Toggle checked={safety.evidence_collection ?? true} onChange={(v) => setSafety({ evidence_collection: v })} />
      </Field>

      <Field path="safety_harness.file_change_validation" label="File Change Validation" description="Validate file changes against plan.">
        <Toggle checked={safety.file_change_validation ?? true} onChange={(v) => setSafety({ file_change_validation: v })} />
      </Field>

      <Field path="safety_harness.evidence_cross_reference" label="Evidence Cross-Reference" description="Cross-reference evidence across tasks.">
        <Toggle checked={safety.evidence_cross_reference ?? true} onChange={(v) => setSafety({ evidence_cross_reference: v })} />
      </Field>

      <Field path="safety_harness.destructive_command_warnings" label="Destructive Command Warnings" description="Warn on destructive shell commands.">
        <Toggle checked={safety.destructive_command_warnings ?? true} onChange={(v) => setSafety({ destructive_command_warnings: v })} />
      </Field>

      <Field path="safety_harness.content_validation" label="Content Validation" description="Validate generated content quality.">
        <Toggle checked={safety.content_validation ?? true} onChange={(v) => setSafety({ content_validation: v })} />
      </Field>

      <Field path="safety_harness.checkpoints" label="Checkpoints" description="Enable execution checkpoints.">
        <Toggle checked={safety.checkpoints ?? true} onChange={(v) => setSafety({ checkpoints: v })} />
      </Field>

      <Field path="safety_harness.auto_rollback" label="Auto Rollback" description="Auto-rollback on detected failures.">
        <Toggle checked={safety.auto_rollback ?? false} onChange={(v) => setSafety({ auto_rollback: v })} />
      </Field>

      <Field path="safety_harness.timeout_scale_cap" value={safety.timeout_scale_cap} label="Timeout Scale Cap" description="Maximum timeout scale factor (1-100).">
        <NumberField value={safety.timeout_scale_cap} onChange={(v) => setSafety({ timeout_scale_cap: v })} min={1} max={100} placeholder="Default" />
      </Field>

      <Field path="safety_harness.file_change_allowlist" label="File Change Allowlist" description="Glob patterns exempt from file-change validation.">
        <TagInput
          values={safety.file_change_allowlist ?? []}
          onChange={(v) => setSafety({ file_change_allowlist: v.length > 0 ? v : undefined })}
          placeholder="e.g. docs/**"
        />
      </Field>
    </div>
  );
}
