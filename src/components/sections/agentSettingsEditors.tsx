// GSD Pi Config - Sub-editors for settings.json
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState, type ReactNode } from "react";
import { Field } from "../FormControls";
import type { BashInterceptorRule, FallbackChainEntry, HookEntry, HooksSettings } from "../../lib/agentSettingsTypes";
import { HOOK_EVENTS, type HookEventName } from "../../lib/agentSettings";

// ─── String list ─────────────────────────────────────────────────────────────

export interface StringListFieldProps {
  label: string;
  description?: string;
  values: string[] | undefined;
  onChange: (next: string[] | undefined) => void;
  placeholder?: string;
  wide?: boolean;
}

export function StringListField({
  label,
  description,
  values,
  onChange,
  placeholder,
  wide,
}: StringListFieldProps) {
  const [draft, setDraft] = useState("");
  const list = values ?? [];

  const commit = (next: string[]) => {
    onChange(next.length > 0 ? next : undefined);
  };

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || list.includes(trimmed)) {
      setDraft("");
      return;
    }
    commit([...list, trimmed]);
    setDraft("");
  };

  return (
    <Field label={label} description={description}>
      <div className={wide ? "w-full max-w-xl" : "w-80"}>
        <div className="flex flex-wrap gap-1 mb-1.5 min-h-[1.25rem]">
          {list.length === 0 && (
            <span className="text-xs text-gsd-text-dim italic">empty</span>
          )}
          {list.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded bg-gsd-accent/20 text-gsd-accent-hover"
            >
              {v}
              <button
                type="button"
                onClick={() => commit(list.filter((_, j) => j !== i))}
                className="text-gsd-text-dim hover:text-gsd-danger ml-0.5"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            className="flex-1 text-xs font-mono"
          />
          <button
            type="button"
            onClick={add}
            className="px-2 py-1 text-xs rounded-md border border-gsd-border text-gsd-text-dim hover:text-gsd-text hover:bg-gsd-surface-hover"
          >
            Add
          </button>
        </div>
      </div>
    </Field>
  );
}

// ─── Environment variables ───────────────────────────────────────────────────

export function EnvEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const [draftKey, setDraftKey] = useState("");
  const [draftVal, setDraftVal] = useState("");
  const entries = Object.entries(value);

  const add = () => {
    const k = draftKey.trim();
    if (!k) return;
    onChange({ ...value, [k]: draftVal });
    setDraftKey("");
    setDraftVal("");
  };

  return (
    <div>
      {entries.length === 0 && (
        <div className="text-xs text-gsd-text-dim italic mb-2">No environment variables set.</div>
      )}
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2 mb-2">
          <input type="text" value={k} readOnly className="w-52 font-mono text-xs bg-gsd-bg" />
          <input
            type="text"
            value={v}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
            className="flex-1 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => {
              const { [k]: _drop, ...rest } = value;
              void _drop;
              onChange(rest);
            }}
            className="px-2 py-1 text-xs rounded-md border border-gsd-border text-gsd-text-dim hover:text-gsd-danger"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 border-t border-gsd-border">
        <input
          type="text"
          value={draftKey}
          onChange={(e) => setDraftKey(e.target.value)}
          placeholder="KEY"
          className="w-52 font-mono text-xs"
        />
        <input
          type="text"
          value={draftVal}
          onChange={(e) => setDraftVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="value"
          className="flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draftKey.trim()}
          className="px-3 py-1 text-xs rounded-md border border-gsd-border text-gsd-text-dim hover:text-gsd-text hover:bg-gsd-surface-hover disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function HookEntryCard({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: HookEntry;
  onUpdate: (e: HookEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-2 rounded border border-gsd-border/80 bg-gsd-bg/40 mb-2 text-xs space-y-2">
      <div className="flex justify-between gap-2">
        <input
          type="text"
          value={entry.command}
          onChange={(e) => onUpdate({ ...entry, command: e.target.value })}
          placeholder="Shell command"
          className="flex-1 font-mono"
        />
        <button type="button" onClick={onRemove} className="text-gsd-danger shrink-0">
          Remove
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1 text-gsd-text-dim">
          <input
            type="checkbox"
            checked={entry.blocking !== false}
            onChange={(e) => onUpdate({ ...entry, blocking: e.target.checked })}
          />
          Blocking
        </label>
        <label className="text-gsd-text-dim">
          Timeout (ms)
          <input
            type="number"
            value={entry.timeout ?? ""}
            onChange={(e) =>
              onUpdate({
                ...entry,
                timeout: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-20 ml-1"
            min={0}
          />
        </label>
      </div>
      <input
        type="text"
        value={
          Array.isArray(entry.match?.tool)
            ? entry.match.tool.join(", ")
            : (entry.match?.tool ?? "")
        }
        onChange={(e) => {
          const raw = e.target.value.trim();
          const tool = raw.includes(",")
            ? raw.split(",").map((s) => s.trim()).filter(Boolean)
            : raw || undefined;
          onUpdate({
            ...entry,
            match: { ...entry.match, tool: tool as string | string[] | undefined },
          });
        }}
        placeholder="Match tool (optional, comma-separated)"
        className="w-full font-mono"
      />
      <input
        type="text"
        value={entry.match?.command ?? ""}
        onChange={(e) =>
          onUpdate({
            ...entry,
            match: { ...entry.match, command: e.target.value || undefined },
          })
        }
        placeholder="Match command prefix (optional)"
        className="w-full font-mono"
      />
    </div>
  );
}

export function HooksEditor({
  hooks,
  onChangeEvent,
}: {
  hooks: HooksSettings;
  onChangeEvent: (event: HookEventName, entries: HookEntry[] | undefined) => void;
}) {
  const [expanded, setExpanded] = useState<HookEventName | null>(null);

  return (
    <div className="space-y-2">
      {HOOK_EVENTS.map((event) => {
        const entries = hooks[event] ?? [];
        const isOpen = expanded === event;
        return (
          <div key={event} className="rounded-lg border border-gsd-border overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-mono bg-gsd-surface hover:bg-gsd-surface-hover"
              onClick={() => setExpanded(isOpen ? null : event)}
            >
              <span>{event}</span>
              <span className="text-gsd-text-dim">
                {entries.length} hook{entries.length === 1 ? "" : "s"}
              </span>
            </button>
            {isOpen && (
              <div className="p-3 border-t border-gsd-border">
                {entries.map((entry, i) => (
                  <HookEntryCard
                    key={i}
                    entry={entry}
                    onUpdate={(e) => {
                      const next = [...entries];
                      next[i] = e;
                      onChangeEvent(event, next);
                    }}
                    onRemove={() => {
                      const next = entries.filter((_, j) => j !== i);
                      onChangeEvent(event, next.length > 0 ? next : undefined);
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="text-xs text-gsd-accent hover:text-gsd-accent-hover"
                  onClick={() =>
                    onChangeEvent(event, [
                      ...entries,
                      { command: "", blocking: true },
                    ])
                  }
                >
                  + Add hook
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Fallback chains ─────────────────────────────────────────────────────────

export function FallbackChainsEditor({
  chains,
  onChange,
}: {
  chains: Record<string, FallbackChainEntry[]>;
  onChange: (next: Record<string, FallbackChainEntry[]> | undefined) => void;
}) {
  const names = Object.keys(chains);

  const setChain = (name: string, entries: FallbackChainEntry[] | undefined) => {
    const next = { ...chains };
    if (!entries?.length) delete next[name];
    else next[name] = entries;
    onChange(Object.keys(next).length > 0 ? next : undefined);
  };

  const renameChain = (oldName: string, newName: string) => {
    if (!newName || newName === oldName) return;
    const { [oldName]: entries, ...rest } = chains;
    onChange({ ...rest, [newName]: entries });
  };

  return (
    <div className="space-y-3">
      {names.length === 0 && (
        <p className="text-xs text-gsd-text-dim">No fallback chains configured.</p>
      )}
      {names.map((name) => (
        <div key={name} className="p-3 rounded-lg bg-gsd-surface border border-gsd-border">
          <input
            type="text"
            defaultValue={name}
            onBlur={(e) => renameChain(name, e.target.value.trim())}
            className="text-sm font-mono font-medium mb-2 w-48"
          />
          {(chains[name] ?? []).map((entry, i) => (
            <div key={i} className="flex flex-wrap gap-2 mb-2 items-end">
              <div>
                <label className="text-[10px] text-gsd-text-dim">Provider</label>
                <input
                  type="text"
                  value={entry.provider}
                  onChange={(e) => {
                    const list = [...chains[name]];
                    list[i] = { ...entry, provider: e.target.value };
                    setChain(name, list);
                  }}
                  className="block w-28 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gsd-text-dim">Model</label>
                <input
                  type="text"
                  value={entry.model}
                  onChange={(e) => {
                    const list = [...chains[name]];
                    list[i] = { ...entry, model: e.target.value };
                    setChain(name, list);
                  }}
                  className="block w-36 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gsd-text-dim">Priority</label>
                <input
                  type="number"
                  value={entry.priority}
                  onChange={(e) => {
                    const list = [...chains[name]];
                    list[i] = { ...entry, priority: Number(e.target.value) || 0 };
                    setChain(name, list);
                  }}
                  className="block w-16 text-xs"
                  min={0}
                />
              </div>
              <button
                type="button"
                className="text-xs text-gsd-danger pb-1"
                onClick={() => {
                  const list = chains[name].filter((_, j) => j !== i);
                  setChain(name, list);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs text-gsd-accent"
              onClick={() =>
                setChain(name, [
                  ...(chains[name] ?? []),
                  { provider: "", model: "", priority: (chains[name]?.length ?? 0) + 1 },
                ])
              }
            >
              + Entry
            </button>
            <button
              type="button"
              className="text-xs text-gsd-danger"
              onClick={() => setChain(name, undefined)}
            >
              Delete chain
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover"
        onClick={() => {
          const id = `chain-${names.length + 1}`;
          onChange({ ...chains, [id]: [] });
        }}
      >
        + Add chain
      </button>
    </div>
  );
}

// ─── Bash interceptor rules ────────────────────────────────────────────────

export function BashInterceptorRulesEditor({
  rules,
  onChange,
}: {
  rules: BashInterceptorRule[];
  onChange: (next: BashInterceptorRule[] | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      {rules.map((rule, i) => (
        <div key={i} className="p-3 rounded-lg bg-gsd-surface border border-gsd-border text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gsd-text-dim">Rule {i + 1}</span>
            <button
              type="button"
              className="text-gsd-danger"
              onClick={() => {
                const next = rules.filter((_, j) => j !== i);
                onChange(next.length > 0 ? next : undefined);
              }}
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={rule.pattern}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...rule, pattern: e.target.value };
              onChange(next);
            }}
            placeholder="Regex pattern"
            className="w-full font-mono"
          />
          <input
            type="text"
            value={rule.flags ?? ""}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...rule, flags: e.target.value || undefined };
              onChange(next);
            }}
            placeholder="Regex flags (optional)"
            className="w-24 font-mono"
          />
          <input
            type="text"
            value={rule.tool}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...rule, tool: e.target.value };
              onChange(next);
            }}
            placeholder="Replacement tool"
            className="w-full"
          />
          <textarea
            value={rule.message}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...rule, message: e.target.value };
              onChange(next);
            }}
            rows={2}
            placeholder="Message shown when blocked"
            className="w-full"
          />
        </div>
      ))}
      <button
        type="button"
        className="text-xs text-gsd-accent"
        onClick={() =>
          onChange([
            ...rules,
            { pattern: "", tool: "read", message: "" },
          ])
        }
      >
        + Add rule
      </button>
    </div>
  );
}

export function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <h3 className="mt-6 mb-1 text-xs font-semibold tracking-wide text-gsd-text uppercase">
        {title}
      </h3>
      <div className="rounded-lg bg-gsd-surface border border-gsd-border px-4">
        {children}
      </div>
    </>
  );
}
