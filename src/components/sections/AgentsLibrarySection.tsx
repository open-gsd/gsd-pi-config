// GSD Pi Config - Agents Library Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Mirrors the Skills Library but targets `.claude/agents/*.md` (flat .md files
// rather than skill directories). Global and project scopes supported.

import { useState, useEffect, useCallback, useMemo } from "react";
import { SectionHeader } from "../FormControls";
import { useConfigBackend } from "../../platform/backend";
import {
  btn,
  btnPrimary,
  btnSegment,
  btnSegmentActive,
  btnDanger,
  choiceBtn,
  choiceBtnActive,
  segmentGroup,
  bannerDanger,
} from "../../lib/uiClasses";

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  scope: "global" | "project" | string;
  path: string;
  file_name: string;
}

interface Props {
  projectPath: string | undefined;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function AgentsLibrarySection({ projectPath }: Props) {
  const backend = useConfigBackend();
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "project">("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState<"global" | "project">("global");

  const loadAgents = useCallback(async () => {
    try {
      setError("");
      const list = await backend.listAgents(projectPath);
      setAgents(list);
    } catch (e) {
      setError(String(e));
    }
  }, [projectPath]);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const selected = useMemo(
    () => agents.find((a) => a.id === selectedId) ?? null,
    [agents, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setContent("");
      setOriginalContent("");
      return;
    }
    (async () => {
      try {
        const text = await backend.readAgent(selected.path);
        setContent(text);
        setOriginalContent(text);
        setSaveState("idle");
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [selected]);

  const isDirty = content !== originalContent;

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (scopeFilter !== "all" && a.scope !== scopeFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.file_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agents, filter, scopeFilter]);

  const save = async () => {
    if (!selected) return;
    setSaveState("saving");
    try {
      await backend.writeAgent(selected.path, content);
      setOriginalContent(content);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
      await loadAgents();
    } catch (e) {
      setError(String(e));
      setSaveState("error");
    }
  };

  const discard = () => setContent(originalContent);

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Delete agent "${selected.name}"? This removes the .md file.`)) return;
    try {
      await backend.deleteAgent(selected.path);
      setSelectedId(null);
      await loadAgents();
    } catch (e) {
      setError(String(e));
    }
  };

  const createNew = async () => {
    if (!newName.trim()) return;
    try {
      const args: { name: string; scope: string; projectPath?: string } = {
        name: newName.trim(),
        scope: newScope,
      };
      if (newScope === "project" && projectPath) args.projectPath = projectPath;
      const created = await backend.createAgent(
        args.name,
        args.scope,
        args.projectPath,
      );
      setShowNewDialog(false);
      setNewName("");
      await loadAgents();
      setSelectedId(created.id);
    } catch (e) {
      setError(String(e));
    }
  };

  const hasProject = Boolean(projectPath);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <SectionHeader
          title="Agents Library"
          description="View and edit subagent definitions. Agents are single .md files with YAML frontmatter the runtime dispatches for specialized tasks."
        />
        <button type="button" onClick={() => setShowNewDialog(true)} className={`${btnPrimary} shrink-0`}>
          + New Agent
        </button>
      </div>

      {error && (
        <div className={`${bannerDanger} mb-3 flex items-center justify-between text-xs`}>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className={`${btn} ml-2`}>
            Dismiss
          </button>
        </div>
      )}

      {showNewDialog && (
        <div className="mb-4 p-4 rounded-lg bg-gsd-surface border border-gsd-border">
          <h3 className="text-sm font-semibold text-gsd-accent mb-3">Create New Agent</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gsd-text-dim block mb-1">Agent Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. code-reviewer"
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gsd-text-dim block mb-1">Scope</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewScope("global")}
                  className={newScope === "global" ? choiceBtnActive : choiceBtn}
                >
                  Global (~/.claude/agents)
                </button>
                <button
                  type="button"
                  onClick={() => setNewScope("project")}
                  disabled={!hasProject}
                  className={newScope === "project" ? choiceBtnActive : choiceBtn}
                >
                  Project (.claude/agents)
                </button>
              </div>
              {!hasProject && (
                <p className="text-[10px] text-gsd-text-muted mt-1">Select a project folder in the top bar to enable project scope.</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowNewDialog(false);
                  setNewName("");
                }}
                className={btn}
              >
                Cancel
              </button>
              <button type="button" onClick={createNew} disabled={!newName.trim()} className={btnPrimary}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Agent list */}
        <div className="w-72 shrink-0 flex flex-col border border-gsd-border rounded-lg overflow-hidden bg-gsd-surface">
          <div className="p-2 border-b border-gsd-border space-y-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search agents..."
              className="w-full text-xs"
            />
            <div className={`${segmentGroup} text-[10px]`}>
              {(["all", "global", "project"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScopeFilter(s)}
                  className={`flex-1 uppercase tracking-wider font-medium ${
                    scopeFilter === s ? btnSegmentActive : btnSegment
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-4 text-xs text-gsd-text-dim text-center">
                No agents found. {hasProject ? "" : "Select a project to also see project agents."}
              </div>
            )}
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`w-full text-left px-3 py-2 border-b border-gsd-border/50 transition-colors ${
                  selectedId === a.id
                    ? "bg-gsd-accent-dim"
                    : "hover:bg-gsd-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium truncate ${selectedId === a.id ? "text-gsd-accent" : "text-gsd-text"}`}>
                    {a.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    a.scope === "project"
                      ? "bg-gsd-accent/20 text-gsd-accent"
                      : "bg-gsd-border text-gsd-text-dim"
                  }`}>
                    {a.scope === "project" ? "Proj" : "Global"}
                  </span>
                </div>
                {a.description && (
                  <p className="text-[10px] text-gsd-text-dim mt-1 line-clamp-2">
                    {a.description}
                  </p>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-gsd-border text-[10px] text-gsd-text-muted">
            {filtered.length} of {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col border border-gsd-border rounded-lg overflow-hidden bg-gsd-surface min-w-0">
          {selected ? (
            <>
              <div className="p-3 border-b border-gsd-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gsd-accent truncate">{selected.name}</div>
                  <div className="text-[10px] text-gsd-text-muted truncate" title={selected.path}>
                    {selected.path}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={remove} className={btnDanger}>
                    Delete
                  </button>
                  {isDirty && (
                    <button type="button" onClick={discard} className={btn}>
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={!isDirty || saveState === "saving"}
                    className={
                      isDirty
                        ? btnPrimary
                        : `${btn} !bg-gsd-border !text-gsd-text-dim !border-transparent`
                    }
                  >
                    {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 resize-none p-4 font-mono text-xs !bg-gsd-surface-solid !border-0 !rounded-none leading-relaxed"
                spellCheck={false}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-3 opacity-60">🤖</div>
              <h3 className="text-sm font-semibold text-gsd-text mb-1">No agent selected</h3>
              <p className="text-xs text-gsd-text-dim max-w-xs">
                Select an agent from the list to view or edit its .md file.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
