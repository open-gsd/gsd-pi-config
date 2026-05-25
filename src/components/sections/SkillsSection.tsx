// GSD Pi Config - Skills Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, SkillDiscoveryMode, GSDSkillRule } from "../../types";
import { CATALOG_PROVIDER_IDS, MODEL_CATALOG } from "../../constants";
import { Field, SelectField, NumberField, TagInput, SectionHeader, MultiSelectField } from "../FormControls";

function SkillRuleCard({
  rule,
  onUpdate,
  onRemove,
}: {
  rule: GSDSkillRule;
  onUpdate: (r: GSDSkillRule) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gsd-text-dim">When condition</span>
        <button type="button" onClick={onRemove} className="text-xs text-gsd-danger hover:text-red-400">
          Remove
        </button>
      </div>
      <input
        type="text"
        value={rule.when}
        onChange={(e) => onUpdate({ ...rule, when: e.target.value })}
        placeholder="e.g. unit:execute-task"
        className="w-full text-sm mb-2"
      />
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Use</label>
          <TagInput
            values={rule.use ?? []}
            onChange={(use) => onUpdate({ ...rule, use: use.length > 0 ? use : undefined })}
            placeholder="Skill name"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Prefer</label>
          <TagInput
            values={rule.prefer ?? []}
            onChange={(prefer) => onUpdate({ ...rule, prefer: prefer.length > 0 ? prefer : undefined })}
            placeholder="Skill name"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Avoid</label>
          <TagInput
            values={rule.avoid ?? []}
            onChange={(avoid) => onUpdate({ ...rule, avoid: avoid.length > 0 ? avoid : undefined })}
            placeholder="Skill name"
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function SkillsSection({ prefs, onChange }: Props) {
  const set = <K extends keyof GSDPreferences>(key: K, val: GSDPreferences[K]) =>
    onChange({ ...prefs, [key]: val });

  const skillRules = prefs.skill_rules ?? [];

  return (
    <div>
      <SectionHeader
        title="Skills"
        description="Control which skills GSD uses, prefers, or avoids. Manage discovery behavior and staleness."
      />

      <Field path="skill_discovery" value={prefs.skill_discovery} label="Skill Discovery" description="Whether GSD discovers and applies skills during auto-mode.">
        <SelectField<SkillDiscoveryMode>
          value={prefs.skill_discovery}
          onChange={(v) => set("skill_discovery", v)}
          options={["auto", "suggest", "off"]}
          placeholder="suggest"
        />
      </Field>

      <Field path="skill_staleness_days" value={prefs.skill_staleness_days} label="Skill Staleness (days)" description="Skills unused for N days get deprioritized. 0 disables.">
        <NumberField
          value={prefs.skill_staleness_days}
          onChange={(v) => set("skill_staleness_days", v)}
          min={0}
          max={365}
          placeholder="60"
        />
      </Field>

      <Field path="always_use_skills" label="Always Use Skills" description="Skills GSD should use whenever relevant.">
        <TagInput
          values={prefs.always_use_skills ?? []}
          onChange={(v) => set("always_use_skills", v.length > 0 ? v : undefined)}
          placeholder="Add skill name"
        />
      </Field>

      <Field path="prefer_skills" label="Prefer Skills" description="Soft defaults GSD should prefer when relevant.">
        <TagInput
          values={prefs.prefer_skills ?? []}
          onChange={(v) => set("prefer_skills", v.length > 0 ? v : undefined)}
          placeholder="Add skill name"
        />
      </Field>

      <Field path="avoid_skills" label="Avoid Skills" description="Skills GSD should avoid unless clearly needed.">
        <TagInput
          values={prefs.avoid_skills ?? []}
          onChange={(v) => set("avoid_skills", v.length > 0 ? v : undefined)}
          placeholder="Add skill name"
        />
      </Field>

      <Field path="custom_instructions" label="Custom Instructions" description="Extra durable instructions related to skill use.">
        <TagInput
          values={prefs.custom_instructions ?? []}
          onChange={(v) => set("custom_instructions", v.length > 0 ? v : undefined)}
          placeholder="Add instruction"
        />
      </Field>

      <Field path="disabled_model_providers" label="Disabled Model Providers" description="Provider IDs to exclude from model selection.">
        <MultiSelectField
          values={prefs.disabled_model_providers ?? []}
          onChange={(v) => set("disabled_model_providers", v.length > 0 ? v : undefined)}
          options={CATALOG_PROVIDER_IDS.map((id) => ({
            value: id,
            label: MODEL_CATALOG.find((p) => p.id === id)?.label ?? id,
          }))}
        />
      </Field>

      <div className="flex items-center justify-between mt-6 mb-3">
        <h3 className="text-sm font-medium text-gsd-text-dim uppercase tracking-wider">Conditional Rules</h3>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...prefs,
              skill_rules: [...skillRules, { when: "" }],
            })
          }
          className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30"
        >
          + Add rule
        </button>
      </div>
      {skillRules.length === 0 && (
        <p className="text-xs text-gsd-text-dim mb-4">No conditional skill rules.</p>
      )}
      {skillRules.map((rule, i) => (
        <SkillRuleCard
          key={i}
          rule={rule}
          onUpdate={(r) => {
            const next = [...skillRules];
            next[i] = r;
            onChange({ ...prefs, skill_rules: next });
          }}
          onRemove={() => {
            const next = skillRules.filter((_, j) => j !== i);
            onChange({ ...prefs, skill_rules: next.length > 0 ? next : undefined });
          }}
        />
      ))}
    </div>
  );
}
