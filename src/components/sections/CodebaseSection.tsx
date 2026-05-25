// GSD Pi Config - Codebase Map Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, CodebaseMapPreferences } from "../../types";
import { Field, NumberField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function CodebaseSection({ prefs, onChange }: Props) {
  const cb = prefs.codebase ?? {};
  const setCb = (update: Partial<CodebaseMapPreferences>) =>
    onChange({ ...prefs, codebase: { ...cb, ...update } });

  return (
    <div>
      <SectionHeader
        title="Codebase Map"
        description="Configuration for the /gsd-map-codebase generator."
      />

      <Field path="codebase.max_files" value={cb.max_files} label="Max Files" description="Maximum files to include in the codebase map.">
        <NumberField value={cb.max_files} onChange={(v) => setCb({ max_files: v })} min={1} placeholder="500" />
      </Field>

      <Field path="codebase.collapse_threshold" value={cb.collapse_threshold} label="Collapse Threshold" description="Files-per-directory threshold before collapsing to a summary line.">
        <NumberField value={cb.collapse_threshold} onChange={(v) => setCb({ collapse_threshold: v })} min={1} placeholder="20" />
      </Field>

      <Field path="codebase.exclude_patterns" label="Exclude Patterns" description="Additional directory/file patterns to exclude from the map.">
        <TagInput
          values={cb.exclude_patterns ?? []}
          onChange={(v) => setCb({ exclude_patterns: v.length > 0 ? v : undefined })}
          placeholder='e.g. docs/, fixtures/'
        />
      </Field>
    </div>
  );
}
