// GSD Pi Config - Discussion Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, DiscussDepth } from "../../types";
import { Field, Toggle, SelectField, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function DiscussionSection({ prefs, onChange }: Props) {
  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  return (
    <div>
      <SectionHeader
        title="Discussion"
        description="Control the preparation phase before discussion sessions."
      />

      <Field path="discuss_preparation" label="Preparation" description="Enable preparation phase (codebase analysis, context review) before discussions.">
        <Toggle checked={prefs.discuss_preparation ?? true} onChange={(v) => set("discuss_preparation", v)} />
      </Field>

      <Field path="discuss_web_research" label="Web Research" description="Enable web research during preparation. Requires TAVILY_API_KEY or BRAVE_API_KEY.">
        <Toggle checked={prefs.discuss_web_research ?? true} onChange={(v) => set("discuss_web_research", v)} />
      </Field>

      <Field path="discuss_depth" value={prefs.discuss_depth} label="Depth" description="Depth of preparation analysis.">
        <SelectField<DiscussDepth>
          value={prefs.discuss_depth}
          onChange={(v) => set("discuss_depth", v)}
          options={["quick", "standard", "thorough"]}
          placeholder="standard"
        />
      </Field>
    </div>
  );
}
