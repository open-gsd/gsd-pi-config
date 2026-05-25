// GSD Pi Config - Claude Code MCP per-model filters
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { ClaudeCodeMcpPerModelEntry, GSDPreferences } from "../../types";
import { TextField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

function McpModelCard({
  prefix,
  entry,
  onUpdate,
  onRemove,
  onRenamePrefix,
}: {
  prefix: string;
  entry: ClaudeCodeMcpPerModelEntry;
  onUpdate: (e: ClaudeCodeMcpPerModelEntry) => void;
  onRemove: () => void;
  onRenamePrefix: (next: string) => void;
}) {
  return (
    <div className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <TextField
          value={prefix}
          onChange={(v) => v && onRenamePrefix(v)}
          className="font-mono text-sm flex-1"
        />
        <button type="button" onClick={onRemove} className="text-xs text-gsd-danger hover:text-red-400 shrink-0">
          Remove
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Allowed servers</label>
          <TagInput
            values={entry.allowed_servers ?? []}
            onChange={(allowed_servers) =>
              onUpdate({
                ...entry,
                allowed_servers: allowed_servers.length > 0 ? allowed_servers : undefined,
              })
            }
            placeholder="server-name"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Blocked servers</label>
          <TagInput
            values={entry.blocked_servers ?? []}
            onChange={(blocked_servers) =>
              onUpdate({
                ...entry,
                blocked_servers: blocked_servers.length > 0 ? blocked_servers : undefined,
              })
            }
            placeholder="server-name"
          />
        </div>
      </div>
    </div>
  );
}

export function McpSection({ prefs, onChange }: Props) {
  const perModel = prefs.claude_code_mcp?.per_model ?? {};
  const entries = Object.entries(perModel);

  const setPerModel = (next: Record<string, ClaudeCodeMcpPerModelEntry>) =>
    onChange({
      ...prefs,
      claude_code_mcp: {
        ...prefs.claude_code_mcp,
        per_model: Object.keys(next).length > 0 ? next : undefined,
      },
    });

  const addPrefix = () => {
    const prefix = `model-${entries.length + 1}`;
    setPerModel({ ...perModel, [prefix]: {} });
  };

  return (
    <div>
      <SectionHeader
        title="Claude MCP"
        description="Per-model MCP server allow/block lists (model ID prefix → servers)."
      />

      <div className="flex items-center justify-between mt-2 mb-3">
        <p className="text-xs text-gsd-text-dim">Keys are model ID prefixes matched longest-first.</p>
        <button
          type="button"
          onClick={addPrefix}
          className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30 shrink-0"
        >
          + Add prefix
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-gsd-text-dim mb-4">No per-model MCP filters configured.</p>
      )}

      {entries.map(([prefix, entry]) => (
        <McpModelCard
          key={prefix}
          prefix={prefix}
          entry={entry}
          onUpdate={(e) => setPerModel({ ...perModel, [prefix]: e })}
          onRenamePrefix={(newPrefix) => {
            if (!newPrefix || newPrefix === prefix) return;
            const { [prefix]: val, ...rest } = perModel;
            setPerModel({ ...rest, [newPrefix]: val });
          }}
          onRemove={() => {
            const { [prefix]: _drop, ...rest } = perModel;
            void _drop;
            setPerModel(rest);
          }}
        />
      ))}
    </div>
  );
}
