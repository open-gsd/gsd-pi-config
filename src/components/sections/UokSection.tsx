// GSD Pi Config - UOK (Unified Orchestration Kernel) Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, UokPreferences, UokTurnActionMode } from "../../types";
import { Field, Toggle, SelectField, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

function setNestedToggle(
  uok: UokPreferences,
  group: keyof UokPreferences,
  enabled: boolean,
): UokPreferences {
  const prev = uok[group];
  if (typeof prev === "object" && prev !== null) {
    return { ...uok, [group]: { ...prev, enabled } };
  }
  return { ...uok, [group]: { enabled } };
}

export function UokSection({ prefs, onChange }: Props) {
  const uok = prefs.uok ?? {};
  const setUok = (patch: Partial<UokPreferences>) =>
    onChange({ ...prefs, uok: { ...uok, ...patch } });

  const gitops = uok.gitops ?? {};

  return (
    <div>
      <SectionHeader
        title="UOK"
        description="Unified Orchestration Kernel — opt-out controls for gates, gitops, and planning."
      />

      <Field path="uok.enabled" label="UOK Enabled">
        <Toggle checked={uok.enabled ?? true} onChange={(v) => setUok({ enabled: v })} />
      </Field>

      <Field path="uok.legacy_fallback.enabled" label="Legacy Fallback">
        <Toggle
          checked={uok.legacy_fallback?.enabled ?? false}
          onChange={(v) => setUok(setNestedToggle(uok, "legacy_fallback", v))}
        />
      </Field>

      <Field path="uok.gates.enabled" label="Gates">
        <Toggle
          checked={uok.gates?.enabled ?? true}
          onChange={(v) => setUok(setNestedToggle(uok, "gates", v))}
        />
      </Field>

      <Field path="uok.model_policy.enabled" label="Model Policy">
        <Toggle
          checked={uok.model_policy?.enabled ?? true}
          onChange={(v) => setUok(setNestedToggle(uok, "model_policy", v))}
        />
      </Field>

      <Field path="uok.execution_graph.enabled" label="Execution Graph">
        <Toggle
          checked={uok.execution_graph?.enabled ?? true}
          onChange={(v) => setUok(setNestedToggle(uok, "execution_graph", v))}
        />
      </Field>

      <Field path="uok.audit_unified.enabled" label="Unified Audit">
        <Toggle
          checked={uok.audit_unified?.enabled ?? true}
          onChange={(v) => setUok(setNestedToggle(uok, "audit_unified", v))}
        />
      </Field>

      <Field path="uok.plan_v2.enabled" label="Plan v2">
        <Toggle
          checked={uok.plan_v2?.enabled ?? true}
          onChange={(v) => setUok(setNestedToggle(uok, "plan_v2", v))}
        />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">GitOps</h3>

      <Field path="uok.gitops.enabled" label="GitOps Enabled">
        <Toggle
          checked={gitops.enabled ?? true}
          onChange={(v) => setUok({ gitops: { ...gitops, enabled: v } })}
        />
      </Field>

      <Field path="uok.gitops.turn_action" value={gitops.turn_action} label="Turn Action">
        <SelectField<UokTurnActionMode>
          value={gitops.turn_action}
          onChange={(v) => setUok({ gitops: { ...gitops, turn_action: v } })}
          options={["commit", "snapshot", "status-only"]}
          placeholder="commit"
        />
      </Field>

      <Field path="uok.gitops.turn_push" label="Turn Push">
        <Toggle
          checked={gitops.turn_push ?? false}
          onChange={(v) => setUok({ gitops: { ...gitops, turn_push: v } })}
        />
      </Field>
    </div>
  );
}
