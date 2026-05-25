// GSD Pi Config - Dynamic Routing Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, DynamicRoutingConfig, ModelCapabilityScores } from "../../types";
import { CATALOG_PROVIDER_IDS } from "../../constants";
import { Field, Toggle, ModelPicker, SectionHeader, MultiSelectField, NumberField, TextField } from "../FormControls";
import type { ProviderCatalog } from "../../constants";

const CAPABILITY_KEYS: (keyof ModelCapabilityScores)[] = [
  "coding", "debugging", "research", "reasoning", "speed", "longContext", "instruction",
];

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  modelCatalog?: readonly ProviderCatalog[];
}

export function RoutingSection({ prefs, onChange, modelCatalog = [] }: Props) {
  const routing = prefs.dynamic_routing ?? {};
  const setRouting = (update: Partial<DynamicRoutingConfig>) =>
    onChange({ ...prefs, dynamic_routing: { ...routing, ...update } });

  const tiers = routing.tier_models ?? {};

  return (
    <div>
      <SectionHeader
        title="Dynamic Routing"
        description="Dynamic model router that selects models based on task complexity tiers."
      />

      <Field path="dynamic_routing.enabled" label="Enabled" description="Enable dynamic model routing.">
        <Toggle checked={routing.enabled ?? false} onChange={(v) => setRouting({ enabled: v })} />
      </Field>

      <Field path="dynamic_routing.escalate_on_failure" label="Escalate on Failure" description="Escalate to higher-tier model on failure.">
        <Toggle checked={routing.escalate_on_failure ?? true} onChange={(v) => setRouting({ escalate_on_failure: v })} />
      </Field>

      <Field path="dynamic_routing.budget_pressure" label="Budget Pressure" description="Downgrade model tier when under budget pressure.">
        <Toggle checked={routing.budget_pressure ?? true} onChange={(v) => setRouting({ budget_pressure: v })} />
      </Field>

      <Field path="dynamic_routing.cross_provider" label="Cross Provider" description="Allow routing across different providers.">
        <Toggle checked={routing.cross_provider ?? true} onChange={(v) => setRouting({ cross_provider: v })} />
      </Field>

      <Field path="dynamic_routing.hooks" label="Hooks" description="Enable routing hooks.">
        <Toggle checked={routing.hooks ?? true} onChange={(v) => setRouting({ hooks: v })} />
      </Field>

      <Field path="dynamic_routing.capability_routing" label="Capability Routing" description="Enable capability-profile scoring.">
        <Toggle checked={routing.capability_routing ?? false} onChange={(v) => setRouting({ capability_routing: v })} />
      </Field>

      <Field path="dynamic_routing.allow_flat_rate_providers" label="Route Flat-Rate Providers" description="Allow dynamic routing for flat-rate providers (default: bypass).">
        <Toggle checked={routing.allow_flat_rate_providers ?? false} onChange={(v) => setRouting({ allow_flat_rate_providers: v })} />
      </Field>

      <Field path="flat_rate_providers" label="Flat-Rate Provider IDs" description="Providers treated as flat-rate for routing guardrails.">
        <MultiSelectField
          values={prefs.flat_rate_providers ?? []}
          onChange={(v) => onChange({ ...prefs, flat_rate_providers: v.length > 0 ? v : undefined })}
          options={CATALOG_PROVIDER_IDS.map((id) => ({ value: id, label: id }))}
        />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-4 mb-2 uppercase tracking-wider">Tier Models</h3>

      <Field path="dynamic_routing.tier_models.light" label="Light" description="Model for simple/light tasks.">
        <ModelPicker
          value={tiers.light}
          onChange={(v) => setRouting({ tier_models: { ...tiers, light: v } })}
          catalog={modelCatalog}
          placeholder="Default"
        />
      </Field>

      <Field path="dynamic_routing.tier_models.standard" label="Standard" description="Model for standard tasks.">
        <ModelPicker
          value={tiers.standard}
          onChange={(v) => setRouting({ tier_models: { ...tiers, standard: v } })}
          catalog={modelCatalog}
          placeholder="Default"
        />
      </Field>

      <Field path="dynamic_routing.tier_models.heavy" label="Heavy" description="Model for complex/heavy tasks.">
        <ModelPicker
          value={tiers.heavy}
          onChange={(v) => setRouting({ tier_models: { ...tiers, heavy: v } })}
          catalog={modelCatalog}
          placeholder="Default"
        />
      </Field>

      <h3 className="text-sm font-medium text-gsd-text-dim mt-6 mb-2 uppercase tracking-wider">Model Capability Overrides</h3>
      <p className="text-xs text-gsd-text-dim mb-3">Per-model 7-D scores (0–100) for capability-aware routing (ADR-004).</p>

      {Object.entries(prefs.modelOverrides ?? {}).map(([modelId, override]) => (
        <div key={modelId} className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
          <div className="flex items-center justify-between mb-2">
            <TextField
              value={modelId}
              onChange={(newId) => {
                if (!newId || newId === modelId) return;
                const { [modelId]: val, ...rest } = prefs.modelOverrides ?? {};
                onChange({
                  ...prefs,
                  modelOverrides: { ...rest, [newId]: val },
                });
              }}
              className="font-mono text-sm w-48"
            />
            <button
              type="button"
              className="text-xs text-gsd-danger"
              onClick={() => {
                const { [modelId]: _drop, ...rest } = prefs.modelOverrides ?? {};
                void _drop;
                onChange({
                  ...prefs,
                  modelOverrides: Object.keys(rest).length > 0 ? rest : undefined,
                });
              }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CAPABILITY_KEYS.map((key) => (
              <div key={key}>
                <label className="text-[10px] text-gsd-text-dim block mb-0.5">{key}</label>
                <NumberField
                  value={override.capabilities?.[key]}
                  onChange={(v) => {
                    const caps = { ...override.capabilities, [key]: v };
                    onChange({
                      ...prefs,
                      modelOverrides: {
                        ...prefs.modelOverrides,
                        [modelId]: { capabilities: caps },
                      },
                    });
                  }}
                  min={0}
                  max={100}
                  placeholder="—"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30"
        onClick={() => {
          const id = `model-${Object.keys(prefs.modelOverrides ?? {}).length + 1}`;
          onChange({
            ...prefs,
            modelOverrides: { ...prefs.modelOverrides, [id]: { capabilities: {} } },
          });
        }}
      >
        + Add model override
      </button>
    </div>
  );
}
