// GSD Pi Config - Hooks Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, PostUnitHookConfig, PreDispatchHookConfig } from "../../types";
import { UNIT_TYPE_OPTIONS } from "../../types";
import type { ProviderCatalog } from "../../constants";
import { ModelPicker, MultiSelectField, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  modelCatalog?: readonly ProviderCatalog[];
}

function PostHookCard({
  hook,
  onUpdate,
  onRemove,
  modelCatalog,
}: {
  hook: PostUnitHookConfig;
  onUpdate: (h: PostUnitHookConfig) => void;
  onRemove: () => void;
  modelCatalog: readonly ProviderCatalog[];
}) {
  return (
    <div className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          value={hook.name}
          onChange={(e) => onUpdate({ ...hook, name: e.target.value })}
          placeholder="Hook name"
          className="text-sm font-medium w-48"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gsd-text-dim flex items-center gap-1">
            <input
              type="checkbox"
              checked={hook.enabled ?? true}
              onChange={(e) => onUpdate({ ...hook, enabled: e.target.checked })}
            />
            Enabled
          </label>
          <button onClick={onRemove} className="text-xs text-gsd-danger hover:text-red-400">Remove</button>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">After (unit types)</label>
          <MultiSelectField
            values={hook.after}
            onChange={(after) => onUpdate({ ...hook, after })}
            options={UNIT_TYPE_OPTIONS}
            placeholder="Select unit types…"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Prompt</label>
          <textarea
            value={hook.prompt}
            onChange={(e) => onUpdate({ ...hook, prompt: e.target.value })}
            rows={2}
            className="w-full text-xs"
            placeholder="Prompt with {milestoneId}, {sliceId}, {taskId} substitutions"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Model</label>
            <ModelPicker
              value={hook.model}
              onChange={(v) => onUpdate({ ...hook, model: v })}
              catalog={modelCatalog}
              placeholder="Default"
              className="w-full text-xs"
            />
          </div>
          <div className="w-20">
            <label className="text-xs text-gsd-text-dim block mb-1">Max Cycles</label>
            <input type="number" value={hook.max_cycles ?? ""} onChange={(e) => onUpdate({ ...hook, max_cycles: e.target.value ? Number(e.target.value) : undefined })} min={1} max={10} placeholder="1" className="w-full text-xs" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Artifact</label>
            <input type="text" value={hook.artifact ?? ""} onChange={(e) => onUpdate({ ...hook, artifact: e.target.value || undefined })} placeholder="Output file" className="w-full text-xs" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Retry On</label>
            <input type="text" value={hook.retry_on ?? ""} onChange={(e) => onUpdate({ ...hook, retry_on: e.target.value || undefined })} placeholder="Trigger file" className="w-full text-xs" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Agent</label>
            <input type="text" value={hook.agent ?? ""} onChange={(e) => onUpdate({ ...hook, agent: e.target.value || undefined })} placeholder="Optional agent id" className="w-full text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreHookCard({
  hook,
  onUpdate,
  onRemove,
  modelCatalog,
}: {
  hook: PreDispatchHookConfig;
  onUpdate: (h: PreDispatchHookConfig) => void;
  onRemove: () => void;
  modelCatalog: readonly ProviderCatalog[];
}) {
  return (
    <div className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          value={hook.name}
          onChange={(e) => onUpdate({ ...hook, name: e.target.value })}
          placeholder="Hook name"
          className="text-sm font-medium w-48"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gsd-text-dim flex items-center gap-1">
            <input
              type="checkbox"
              checked={hook.enabled ?? true}
              onChange={(e) => onUpdate({ ...hook, enabled: e.target.checked })}
            />
            Enabled
          </label>
          <button onClick={onRemove} className="text-xs text-gsd-danger hover:text-red-400">Remove</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Action</label>
            <select value={hook.action} onChange={(e) => onUpdate({ ...hook, action: e.target.value as "modify" | "skip" | "replace" })} className="w-full text-xs">
              <option value="modify">Modify</option>
              <option value="skip">Skip</option>
              <option value="replace">Replace</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Before (unit types)</label>
            <MultiSelectField
              values={hook.before}
              onChange={(before) => onUpdate({ ...hook, before })}
              options={UNIT_TYPE_OPTIONS}
              placeholder="Select unit types…"
              className="w-full"
            />
          </div>
        </div>
        {hook.action === "modify" && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gsd-text-dim block mb-1">Prepend</label>
              <textarea value={hook.prepend ?? ""} onChange={(e) => onUpdate({ ...hook, prepend: e.target.value || undefined })} rows={2} className="w-full text-xs" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gsd-text-dim block mb-1">Append</label>
              <textarea value={hook.append ?? ""} onChange={(e) => onUpdate({ ...hook, append: e.target.value || undefined })} rows={2} className="w-full text-xs" />
            </div>
          </div>
        )}
        {hook.action === "replace" && (
          <div>
            <label className="text-xs text-gsd-text-dim block mb-1">Replacement Prompt</label>
            <textarea value={hook.prompt ?? ""} onChange={(e) => onUpdate({ ...hook, prompt: e.target.value || undefined })} rows={2} className="w-full text-xs" />
          </div>
        )}
        {hook.action === "skip" && (
          <div>
            <label className="text-xs text-gsd-text-dim block mb-1">Skip If (file exists)</label>
            <input type="text" value={hook.skip_if ?? ""} onChange={(e) => onUpdate({ ...hook, skip_if: e.target.value || undefined })} className="w-full text-xs" placeholder="Relative file path" />
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Model</label>
            <ModelPicker
              value={hook.model}
              onChange={(v) => onUpdate({ ...hook, model: v })}
              catalog={modelCatalog}
              placeholder="Default"
              className="w-full text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gsd-text-dim block mb-1">Unit type filter</label>
            <input
              type="text"
              value={hook.unit_type ?? ""}
              onChange={(e) => onUpdate({ ...hook, unit_type: e.target.value || undefined })}
              className="w-full text-xs"
              placeholder="Optional unit type"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HooksSection({ prefs, onChange, modelCatalog = [] }: Props) {
  const postHooks = prefs.post_unit_hooks ?? [];
  const preHooks = prefs.pre_dispatch_hooks ?? [];

  const addPost = () => {
    onChange({
      ...prefs,
      post_unit_hooks: [...postHooks, { name: "", after: [], prompt: "", enabled: true }],
    });
  };

  const addPre = () => {
    onChange({
      ...prefs,
      pre_dispatch_hooks: [...preHooks, { name: "", before: [], action: "modify", enabled: true }],
    });
  };

  return (
    <div>
      <SectionHeader
        title="Hooks"
        description="Post-unit hooks fire after a unit completes. Pre-dispatch hooks intercept units before dispatch."
      />

      <div className="flex items-center justify-between mt-4 mb-3">
        <h3 className="text-sm font-medium text-gsd-text-dim uppercase tracking-wider">Post-Unit Hooks</h3>
        <button onClick={addPost} className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30">
          + Add Hook
        </button>
      </div>
      {postHooks.length === 0 && <p className="text-xs text-gsd-text-dim mb-4">No post-unit hooks configured.</p>}
      {postHooks.map((hook, i) => (
        <PostHookCard
          key={i}
          hook={hook}
          modelCatalog={modelCatalog}
          onUpdate={(h) => {
            const updated = [...postHooks];
            updated[i] = h;
            onChange({ ...prefs, post_unit_hooks: updated });
          }}
          onRemove={() => {
            onChange({ ...prefs, post_unit_hooks: postHooks.filter((_, j) => j !== i) });
          }}
        />
      ))}

      <div className="flex items-center justify-between mt-6 mb-3">
        <h3 className="text-sm font-medium text-gsd-text-dim uppercase tracking-wider">Pre-Dispatch Hooks</h3>
        <button onClick={addPre} className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30">
          + Add Hook
        </button>
      </div>
      {preHooks.length === 0 && <p className="text-xs text-gsd-text-dim mb-4">No pre-dispatch hooks configured.</p>}
      {preHooks.map((hook, i) => (
        <PreHookCard
          key={i}
          hook={hook}
          modelCatalog={modelCatalog}
          onUpdate={(h) => {
            const updated = [...preHooks];
            updated[i] = h;
            onChange({ ...prefs, pre_dispatch_hooks: updated });
          }}
          onRemove={() => {
            onChange({ ...prefs, pre_dispatch_hooks: preHooks.filter((_, j) => j !== i) });
          }}
        />
      ))}
    </div>
  );
}
