// GSD Pi Config - Phases Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, PhaseSkipPreferences } from "../../types";
import { Field, Toggle, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function PhasesSection({ prefs, onChange }: Props) {
  const phases = prefs.phases ?? {};
  const setPhases = (update: Partial<PhaseSkipPreferences>) =>
    onChange({ ...prefs, phases: { ...phases, ...update } });

  return (
    <div>
      <SectionHeader
        title="Phases"
        description="Fine-grained control over which phases are skipped or required during auto-mode execution."
      />

      <Field path="phases.skip_research" label="Skip Research" description="Skip milestone-level research phase.">
        <Toggle checked={phases.skip_research ?? false} onChange={(v) => setPhases({ skip_research: v })} />
      </Field>

      <Field path="phases.skip_slice_research" label="Skip Slice Research" description="Skip per-slice research phase.">
        <Toggle checked={phases.skip_slice_research ?? false} onChange={(v) => setPhases({ skip_slice_research: v })} />
      </Field>

      <Field path="phases.skip_reassess" label="Skip Reassess" description="Force-disable roadmap reassessment.">
        <Toggle checked={phases.skip_reassess ?? false} onChange={(v) => setPhases({ skip_reassess: v })} />
      </Field>

      <Field path="phases.skip_milestone_validation" label="Skip Milestone Validation" description="Skip milestone validation phase.">
        <Toggle checked={phases.skip_milestone_validation ?? false} onChange={(v) => setPhases({ skip_milestone_validation: v })} />
      </Field>

      <Field path="phases.reassess_after_slice" label="Reassess After Slice" description="Run roadmap reassessment after each slice.">
        <Toggle checked={phases.reassess_after_slice ?? false} onChange={(v) => setPhases({ reassess_after_slice: v })} />
      </Field>

      <Field path="phases.require_slice_discussion" label="Require Slice Discussion" description="Pause before each slice for discussion.">
        <Toggle checked={phases.require_slice_discussion ?? false} onChange={(v) => setPhases({ require_slice_discussion: v })} />
      </Field>

      <Field path="phases.mid_execution_escalation" label="Mid-Execution Escalation" description="Honor escalation payloads from complete-task (ADR-011 P2).">
        <Toggle checked={phases.mid_execution_escalation ?? false} onChange={(v) => setPhases({ mid_execution_escalation: v })} />
      </Field>

      <Field path="phases.progressive_planning" label="Progressive Planning" description="Plan S01 fully; later slices as sketches until refined.">
        <Toggle checked={phases.progressive_planning ?? false} onChange={(v) => setPhases({ progressive_planning: v })} />
      </Field>
    </div>
  );
}
