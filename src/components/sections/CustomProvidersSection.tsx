// GSD Pi Config - Custom Providers (models.json) Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// CRUD editor for `~/.gsd/agent/models.json` (or `<project>/.gsd/agent/models.json`).
// Renders one card per provider; each card edits a subset of fields covered
// by CustomProviderConfig (baseUrl, api, apiKey, and a model list). Unknown
// fields on the underlying JSON value are preserved verbatim by the backend
// round-trip — we only touch the keys we own.

import { useState } from "react";
import { SectionHeader, Field, TextField, NumberField, Toggle } from "../FormControls";
import { Button } from "@/components/ui/button";
import { MODEL_CATALOG } from "../../constants";
import type {
  GSDModelsConfig,
  CustomProviderConfig,
  CustomModelDefinition,
} from "../../types";

interface Props {
  value: GSDModelsConfig;
  onChange: (next: GSDModelsConfig) => void;
}

const BUILTIN_IDS = new Set(MODEL_CATALOG.map((p) => p.id));

export function CustomProvidersSection({ value, onChange }: Props) {
  const providers = value.providers ?? {};
  const entries = Object.entries(providers);

  const updateProvider = (id: string, patch: Partial<CustomProviderConfig>) => {
    const next: GSDModelsConfig = {
      ...value,
      providers: { ...providers, [id]: { ...(providers[id] ?? {}), ...patch } },
    };
    onChange(next);
  };

  const renameProvider = (oldId: string, newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed || trimmed === oldId) return;
    if (providers[trimmed]) return; // Would clobber another provider
    const nextProviders: Record<string, CustomProviderConfig> = {};
    for (const [k, v] of Object.entries(providers)) {
      nextProviders[k === oldId ? trimmed : k] = v;
    }
    onChange({ ...value, providers: nextProviders });
  };

  const deleteProvider = (id: string) => {
    const { [id]: _drop, ...rest } = providers;
    onChange({ ...value, providers: rest });
  };

  const addProvider = () => {
    // Pick a unique placeholder name
    let n = 1;
    while (providers[`new-provider-${n}`]) n += 1;
    const id = `new-provider-${n}`;
    onChange({
      ...value,
      providers: {
        ...providers,
        [id]: { baseUrl: "", api: "openai-completions", models: [] },
      },
    });
  };

  return (
    <div>
      <SectionHeader
        title="Custom Providers"
        description="Register additional model providers GSD can route to. Writes to ~/.gsd/agent/models.json (or the project equivalent). Built-in providers always win on ID collision — rename any custom provider that shares a name with one of the built-ins."
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {entries.length} provider{entries.length === 1 ? "" : "s"}
        </div>
        <Button type="button" variant="default" size="sm" onClick={addProvider}>
          + Add provider
        </Button>
      </div>

      {entries.length === 0 && (
        <div className="rounded-none border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No custom providers yet. Click <span className="font-medium">Add provider</span> to register one.
        </div>
      )}

      {entries.map(([id, cfg]) => (
        <ProviderCard
          key={id}
          id={id}
          cfg={cfg}
          collision={BUILTIN_IDS.has(id)}
          onRename={(next) => renameProvider(id, next)}
          onChange={(patch) => updateProvider(id, patch)}
          onDelete={() => deleteProvider(id)}
        />
      ))}
    </div>
  );
}

interface CardProps {
  id: string;
  cfg: CustomProviderConfig;
  collision: boolean;
  onRename: (next: string) => void;
  onChange: (patch: Partial<CustomProviderConfig>) => void;
  onDelete: () => void;
}

function ProviderCard({ id, cfg, collision, onRename, onChange, onDelete }: CardProps) {
  const [localId, setLocalId] = useState(id);
  const [showKey, setShowKey] = useState(false);
  const models = cfg.models ?? [];

  const updateModel = (idx: number, patch: Partial<CustomModelDefinition>) => {
    const next = models.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    onChange({ models: next });
  };

  const addModel = () => {
    onChange({ models: [...models, { id: "" }] });
  };

  const removeModel = (idx: number) => {
    onChange({ models: models.filter((_, i) => i !== idx) });
  };

  return (
    <div
      className={`mb-4 rounded-none border p-4 ${
        collision
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Provider ID
          </label>
          <input
            type="text"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            onBlur={() => {
              if (localId !== id) onRename(localId);
            }}
            className="mt-1 w-full"
            placeholder="openrouter"
          />
          {collision && (
            <p className="mt-1 text-xs text-destructive">
              <strong>Collision:</strong> "{id}" conflicts with a built-in provider.
              GSD will ignore this custom entry until you rename it.
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
          title="Delete provider"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>

      <Field label="Base URL" description="OpenAI-compatible endpoint (or native API root)">
        <TextField
          value={cfg.baseUrl}
          onChange={(v) => onChange({ baseUrl: v })}
          placeholder="https://openrouter.ai/api/v1"
          className="w-80"
        />
      </Field>

      <Field label="API type" description="Transport hint — e.g. openai-completions">
        <TextField
          value={cfg.api}
          onChange={(v) => onChange({ api: v })}
          placeholder="openai-completions"
          className="w-64"
        />
      </Field>

      <Field label="API key" description="Plaintext or shell-expansion, e.g. !echo $OPENROUTER_API_KEY">
        <div className="flex items-center gap-2">
          <input
            type={showKey ? "text" : "password"}
            value={cfg.apiKey ?? ""}
            onChange={(e) => onChange({ apiKey: e.target.value || undefined })}
            placeholder="sk-..."
            className="w-64"
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowKey((s) => !s)}
          >
            {showKey ? "Hide" : "Show"}
          </Button>
        </div>
      </Field>

      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Models ({models.length})
          </h4>
          <Button type="button" variant="outline" size="sm" onClick={addModel}>
            + Add model
          </Button>
        </div>

        {models.length === 0 && (
          <div className="p-3 text-xs italic text-muted-foreground">No models defined.</div>
        )}

        {models.map((m, idx) => (
          <div
            key={idx}
            className="mb-2 rounded-none border border-border bg-background p-3"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <input
                type="text"
                value={m.id}
                onChange={(e) => updateModel(idx, { id: e.target.value })}
                placeholder="model-id (required)"
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => removeModel(idx)}
              >
                Remove
              </Button>
            </div>
            <Field label="Display name">
              <TextField
                value={m.name}
                onChange={(v) => updateModel(idx, { name: v })}
                placeholder="Display name (e.g. Sonnet 4 via OpenRouter)"
                className="w-72"
              />
            </Field>
            <Field label="Context window">
              <NumberField
                value={m.contextWindow}
                onChange={(v) => updateModel(idx, { contextWindow: v })}
                placeholder="200000"
              />
            </Field>
            <Field label="Max output tokens">
              <NumberField
                value={m.maxTokens}
                onChange={(v) => updateModel(idx, { maxTokens: v })}
                placeholder="16384"
              />
            </Field>
            <Field label="Reasoning model">
              <Toggle
                checked={m.reasoning === true}
                onChange={(b) => updateModel(idx, { reasoning: b || undefined })}
              />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}
