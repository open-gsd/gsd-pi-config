// GSD Pi Config - Parallel Execution Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, ParallelConfig, MergeStrategy, AutoMergeMode } from "../../types";
import { Field, Toggle, SelectField, NumberField, ModelPicker, SectionHeader } from "../FormControls";
import type { ProviderCatalog } from "../../constants";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  modelCatalog?: readonly ProviderCatalog[];
}

export function ParallelSection({ prefs, onChange, modelCatalog = [] }: Props) {
  const par = prefs.parallel ?? {};
  const setPar = (update: Partial<ParallelConfig>) =>
    onChange({ ...prefs, parallel: { ...par, ...update } });

  const slice = prefs.slice_parallel ?? {};
  const setSlice = (update: Partial<{ enabled?: boolean; max_workers?: number }>) =>
    onChange({ ...prefs, slice_parallel: { ...slice, ...update } });

  return (
    <div>
      <SectionHeader
        title="Parallel Execution"
        description="Milestone-level and slice-level parallelism settings."
      />

      <h3 className="text-sm font-medium text-gsd-text-dim mt-4 mb-2 uppercase tracking-wider">Milestone Parallel</h3>

      <Field path="parallel.enabled" label="Enabled" description="Enable parallel milestone execution.">
        <Toggle checked={par.enabled ?? false} onChange={(v) => setPar({ enabled: v })} />
      </Field>

      <Field path="parallel.max_workers" value={par.max_workers} label="Max Workers" description="Maximum concurrent workers (1-32).">
        <NumberField value={par.max_workers} onChange={(v) => setPar({ max_workers: v })} min={1} max={32} placeholder="2" />
      </Field>

      <Field path="parallel.budget_ceiling" label="Budget Ceiling ($)" description="Optional per-parallel-run budget.">
        <NumberField value={par.budget_ceiling} onChange={(v) => setPar({ budget_ceiling: v })} min={0} placeholder="None" />
      </Field>

      <Field path="parallel.merge_strategy" value={par.merge_strategy} label="Merge Strategy" description="When to merge parallel work.">
        <SelectField<MergeStrategy>
          value={par.merge_strategy}
          onChange={(v) => setPar({ merge_strategy: v })}
          options={["per-slice", "per-milestone"]}
          placeholder="per-milestone"
        />
      </Field>

      <Field path="parallel.auto_merge" value={par.auto_merge} label="Auto Merge" description="Merge behavior after parallel execution.">
        <SelectField<AutoMergeMode>
          value={par.auto_merge}
          onChange={(v) => setPar({ auto_merge: v })}
          options={["auto", "confirm", "manual"]}
          placeholder="confirm"
        />
      </Field>

      <Field path="parallel.worker_model" label="Worker Model" description="Optional model override for parallel workers.">
        <ModelPicker value={par.worker_model} onChange={(v) => setPar({ worker_model: v })} catalog={modelCatalog} placeholder="Default" />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Slice Parallel</h3>

      <Field path="slice_parallel.enabled" label="Enabled" description="Enable slice-level parallelism within a milestone.">
        <Toggle checked={slice.enabled ?? false} onChange={(v) => setSlice({ enabled: v })} />
      </Field>

      <Field path="slice_parallel.max_workers" value={slice.max_workers} label="Max Workers" description="Maximum concurrent slice workers (1-16).">
        <NumberField value={slice.max_workers} onChange={(v) => setSlice({ max_workers: v })} min={1} max={16} placeholder="2" />
      </Field>
    </div>
  );
}
