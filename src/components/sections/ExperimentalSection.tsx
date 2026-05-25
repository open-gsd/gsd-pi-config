// GSD Pi Config - Experimental Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, ReactiveExecutionConfig, GateEvaluationConfig } from "../../types";
import { Field, Toggle, NumberField, ModelPicker, SectionHeader, MultiSelectField, SelectField } from "../FormControls";
import { KNOWN_SLICE_GATES, REACTIVE_ISOLATION_MODES, type ProviderCatalog } from "../../constants";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  modelCatalog?: readonly ProviderCatalog[];
}

export function ExperimentalSection({ prefs, onChange, modelCatalog = [] }: Props) {
  const exp = prefs.experimental ?? {};
  const reactive = prefs.reactive_execution ?? {};
  const gate = prefs.gate_evaluation ?? {};

  const setReactive = (update: Partial<ReactiveExecutionConfig>) =>
    onChange({ ...prefs, reactive_execution: { ...reactive, ...update } });

  const setGate = (update: Partial<GateEvaluationConfig>) =>
    onChange({ ...prefs, gate_evaluation: { ...gate, ...update } });

  return (
    <div>
      <SectionHeader
        title="Experimental"
        description="Opt-in experimental features. These may change or be removed without deprecation."
      />

      <h3 className="text-sm font-medium text-gsd-text-dim mt-2 mb-2 uppercase tracking-wider">Core Experimental</h3>

      <Field path="experimental.rtk" label="RTK Shell Compression" description="Enable Real-Time Kompression for shell commands to reduce token usage.">
        <Toggle
          checked={exp.rtk ?? false}
          onChange={(v) => onChange({ ...prefs, experimental: { ...exp, rtk: v } })}
        />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Reactive Execution</h3>

      <Field path="reactive_execution.enabled" label="Enabled" description="Enable graph-derived parallel task execution within slices.">
        <Toggle checked={reactive.enabled ?? false} onChange={(v) => setReactive({ enabled: v })} />
      </Field>

      <Field path="reactive_execution.max_parallel" value={reactive.max_parallel} label="Max Parallel" description="Maximum tasks to dispatch in parallel (1-16).">
        <NumberField value={reactive.max_parallel} onChange={(v) => setReactive({ max_parallel: v })} min={1} max={16} placeholder="2" />
      </Field>

      <Field path="reactive_execution.isolation_mode" value={reactive.isolation_mode} label="Isolation Mode" description="How reactive tasks share the working tree.">
        <SelectField
          value={reactive.isolation_mode}
          onChange={(v) => setReactive({ isolation_mode: v })}
          options={REACTIVE_ISOLATION_MODES}
          placeholder="Default"
        />
      </Field>

      <Field path="reactive_execution.subagent_model" label="Subagent Model" description="Optional model override for reactive subagents.">
        <ModelPicker value={reactive.subagent_model} onChange={(v) => setReactive({ subagent_model: v })} catalog={modelCatalog} placeholder="Default" />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Gate Evaluation</h3>

      <Field path="gate_evaluation.enabled" label="Enabled" description="Enable parallel quality gate evaluation during slice planning.">
        <Toggle checked={gate.enabled ?? false} onChange={(v) => setGate({ enabled: v })} />
      </Field>

      <Field path="gate_evaluation.slice_gates" label="Slice Gates" description="Which slice-scoped gates to evaluate in parallel.">
        <MultiSelectField
          values={gate.slice_gates ?? []}
          onChange={(v) => setGate({ slice_gates: v.length > 0 ? v : undefined })}
          options={KNOWN_SLICE_GATES.map((g) => ({ value: g, label: g }))}
        />
      </Field>

      <Field path="gate_evaluation.task_gates" label="Task Gates" description="Evaluate task-level gates (Q5/Q6/Q7) via reactive-execute.">
        <Toggle checked={gate.task_gates ?? true} onChange={(v) => setGate({ task_gates: v })} />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Auto Supervisor</h3>

      <Field path="auto_supervisor.model" label="Model" description="Model ID for the auto-mode supervisor.">
        <ModelPicker
          value={prefs.auto_supervisor?.model}
          onChange={(v) => onChange({ ...prefs, auto_supervisor: { ...prefs.auto_supervisor, model: v } })}
          catalog={modelCatalog}
          placeholder="Current model"
        />
      </Field>

      <Field path="auto_supervisor.soft_timeout_minutes" value={prefs.auto_supervisor?.soft_timeout_minutes} label="Soft Timeout (min)" description="Minutes before soft warning.">
        <NumberField
          value={prefs.auto_supervisor?.soft_timeout_minutes}
          onChange={(v) => onChange({ ...prefs, auto_supervisor: { ...prefs.auto_supervisor, soft_timeout_minutes: v } })}
          min={1}
          placeholder="20"
        />
      </Field>

      <Field path="auto_supervisor.idle_timeout_minutes" value={prefs.auto_supervisor?.idle_timeout_minutes} label="Idle Timeout (min)" description="Minutes of inactivity before intervention.">
        <NumberField
          value={prefs.auto_supervisor?.idle_timeout_minutes}
          onChange={(v) => onChange({ ...prefs, auto_supervisor: { ...prefs.auto_supervisor, idle_timeout_minutes: v } })}
          min={1}
          placeholder="10"
        />
      </Field>

      <Field path="auto_supervisor.hard_timeout_minutes" value={prefs.auto_supervisor?.hard_timeout_minutes} label="Hard Timeout (min)" description="Minutes before forced termination.">
        <NumberField
          value={prefs.auto_supervisor?.hard_timeout_minutes}
          onChange={(v) => onChange({ ...prefs, auto_supervisor: { ...prefs.auto_supervisor, hard_timeout_minutes: v } })}
          min={1}
          placeholder="30"
        />
      </Field>
    </div>
  );
}
