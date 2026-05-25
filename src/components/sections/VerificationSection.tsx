// GSD Pi Config - Verification Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences } from "../../types";
import { Field, Toggle, NumberField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function VerificationSection({ prefs, onChange }: Props) {
  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  return (
    <div>
      <SectionHeader
        title="Verification"
        description="Enhanced verification and custom verification commands."
      />

      <h3 className="text-sm font-medium text-gsd-text-dim mt-2 mb-2 uppercase tracking-wider">Enhanced Verification</h3>

      <Field path="enhanced_verification" label="Enabled" description="Enable enhanced verification (both pre and post-execution checks).">
        <Toggle checked={prefs.enhanced_verification ?? true} onChange={(v) => set("enhanced_verification", v)} />
      </Field>

      <Field path="enhanced_verification_pre" label="Pre-Execution Checks" description="Check package existence, file references, etc. before execution.">
        <Toggle checked={prefs.enhanced_verification_pre ?? true} onChange={(v) => set("enhanced_verification_pre", v)} />
      </Field>

      <Field path="enhanced_verification_post" label="Post-Execution Checks" description="Runtime error detection, audit warnings after execution.">
        <Toggle checked={prefs.enhanced_verification_post ?? true} onChange={(v) => set("enhanced_verification_post", v)} />
      </Field>

      <Field path="enhanced_verification_strict" label="Strict Mode" description="Treat pre-execution check failures as blocking (not just warnings).">
        <Toggle checked={prefs.enhanced_verification_strict ?? false} onChange={(v) => set("enhanced_verification_strict", v)} />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Custom Verification</h3>

      <Field path="verification_commands" label="Verification Commands" description="Shell commands to run as verification after task execution.">
        <TagInput
          values={prefs.verification_commands ?? []}
          onChange={(v) => set("verification_commands", v.length > 0 ? v : undefined)}
          placeholder="e.g. npm test"
        />
      </Field>

      <Field path="verification_auto_fix" label="Auto Fix" description="Automatically attempt to fix verification failures.">
        <Toggle checked={prefs.verification_auto_fix ?? false} onChange={(v) => set("verification_auto_fix", v)} />
      </Field>

      <Field path="verification_max_retries" value={prefs.verification_max_retries} label="Max Retries" description="Maximum fix-and-retry cycles (0-10).">
        <NumberField value={prefs.verification_max_retries} onChange={(v) => set("verification_max_retries", v)} min={0} max={10} placeholder="0" />
      </Field>
    </div>
  );
}
