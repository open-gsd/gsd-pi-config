// GSD Pi Config - Models Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type {
  GSDPreferences,
  GSDModelConfig,
  GSDPhaseModelConfig,
  GSDModelsConfig,
} from "../../types";
import { MODEL_PHASES } from "../../types";
import { Field, ModelChain, SectionHeader } from "../FormControls";
import { MODEL_CATALOG } from "../../constants";
import { mergeCustomProviders } from "../../lib/customProviders";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  /** Custom providers loaded from models.json — merged into dropdown catalog. */
  customModels?: GSDModelsConfig;
}

type PhaseKey = (typeof MODEL_PHASES)[number];

const PHASE_LABELS: Record<PhaseKey, string> = {
  research: "Research",
  planning: "Planning",
  discuss: "Discussion",
  execution: "Execution",
  execution_simple: "Execution (Simple)",
  completion: "Completion",
  validation: "Validation",
  subagent: "Subagent",
};

/** Build the ordered chain [primary, ...fallbacks] as qualified strings. */
function getChain(val: string | GSDPhaseModelConfig | undefined): string[] {
  if (!val) return [];
  if (typeof val === "string") return [val];
  const primary = val.provider ? `${val.provider}/${val.model}` : val.model;
  return [primary, ...(val.fallbacks ?? [])];
}

/** Parse a qualified string into `{provider, model}`, matching against a provided catalog. */
function parseQualified(
  v: string,
  catalog: readonly { id: string }[],
): { provider?: string; model: string } {
  const slash = v.indexOf("/");
  if (slash === -1) return { model: v };
  const prefix = v.slice(0, slash);
  const rest = v.slice(slash + 1);
  if (catalog.some((p) => p.id === prefix)) {
    return { provider: prefix, model: rest };
  }
  return { model: v };
}

export function ModelsSection({ prefs, onChange, customModels }: Props) {
  const models = (prefs.models ?? {}) as GSDModelConfig;
  const { catalog: mergedCatalog } = mergeCustomProviders(MODEL_CATALOG, customModels);

  /** Write phase config from an ordered chain: [0] = primary, [1..] = fallbacks. */
  const setPhase = (phase: PhaseKey, chain: string[]) => {
    const cleaned = chain.map((s) => s.trim()).filter(Boolean);
    let next: string | GSDPhaseModelConfig | undefined;

    if (cleaned.length === 0) {
      next = undefined;
    } else {
      const [primary, ...fb] = cleaned;
      const { provider, model } = parseQualified(primary, mergedCatalog);
      if (provider || fb.length > 0) {
        next = {
          model,
          ...(provider ? { provider } : {}),
          ...(fb.length > 0 ? { fallbacks: fb } : {}),
        };
      } else {
        next = model;
      }
    }

    const updated = { ...models, [phase]: next };
    for (const k of Object.keys(updated) as PhaseKey[]) {
      if (updated[k] === undefined) delete updated[k];
    }
    onChange({ ...prefs, models: Object.keys(updated).length > 0 ? updated : undefined });
  };

  return (
    <div>
      <SectionHeader
        title="Models"
        description="Per-phase model selection with ordered fallbacks. The primary is tried first; each fallback is tried in turn if the previous one fails or is unavailable."
      />

      {MODEL_PHASES.map((phase) => {
        const val = models[phase];
        const chain = getChain(val);
        return (
          <div key={phase} className="mb-4 p-4 rounded-lg bg-gsd-surface border border-gsd-border">
            <h3 className="text-sm font-semibold text-gsd-accent mb-2 tracking-tight">
              {PHASE_LABELS[phase]}
            </h3>
            <Field label="Model chain" description="Primary first, then fallbacks in order">
              <ModelChain
                chain={chain}
                onChange={(next) => setPhase(phase, next)}
                catalog={mergedCatalog}
                className="w-64"
              />
            </Field>
          </div>
        );
      })}
    </div>
  );
}
