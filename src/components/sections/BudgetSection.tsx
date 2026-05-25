// GSD Pi Config - Budget & Cost Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, BudgetEnforcementMode } from "../../types";
import { Field, SelectField, NumberField, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function BudgetSection({ prefs, onChange }: Props) {
  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  return (
    <div>
      <SectionHeader
        title="Budget & Cost"
        description="Control spending limits and cost behavior for auto-mode."
      />

      <Field path="budget_ceiling" value={prefs.budget_ceiling} label="Budget Ceiling ($)" description="Maximum dollar amount to spend on auto-mode.">
        <NumberField
          value={prefs.budget_ceiling}
          onChange={(v) => set("budget_ceiling", v)}
          min={0}
          placeholder="No limit"
        />
      </Field>

      <Field path="budget_enforcement" value={prefs.budget_enforcement} label="Budget Enforcement" description="Action when budget ceiling is reached.">
        <SelectField<BudgetEnforcementMode>
          value={prefs.budget_enforcement}
          onChange={(v) => set("budget_enforcement", v)}
          options={["warn", "pause", "halt"]}
          placeholder="pause"
        />
      </Field>

      <Field path="context_pause_threshold" value={prefs.context_pause_threshold} label="Context Pause Threshold (%)" description="Context window usage % at which auto-mode pauses. 0 disables.">
        <NumberField
          value={prefs.context_pause_threshold}
          onChange={(v) => set("context_pause_threshold", v)}
          min={0}
          max={100}
          placeholder="0"
        />
      </Field>

      <Field path="per_unit_cost_cap_usd" value={prefs.per_unit_cost_cap_usd} label="Per-Unit Cost Cap ($)" description="Maximum USD per dispatched unit.">
        <NumberField
          value={prefs.per_unit_cost_cap_usd}
          onChange={(v) => set("per_unit_cost_cap_usd", v)}
          min={0}
          placeholder="5"
        />
      </Field>
    </div>
  );
}
