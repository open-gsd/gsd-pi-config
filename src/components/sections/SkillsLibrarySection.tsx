// GSD Pi Config - Skills Library Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState, useEffect, useCallback, useMemo } from "react";
import { SectionHeader } from "../FormControls";
import {
  btn,
  btnPrimary,
  btnSegment,
  btnSegmentActive,
  choiceBtn,
  choiceBtnActive,
  segmentGroup,
  bannerDanger,
  btnDanger,
} from "../../lib/uiClasses";
import { useConfigBackend } from "../../platform/backend";

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  scope: "global" | "project" | string;
  path: string;
  dir_name: string;
}

interface Props {
  projectPath: string | undefined;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function SkillsLibrarySection({ projectPath }: Props) {
  const backend = useConfigBackend();
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "project">("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillScope, setNewSkillScope] = useState<"global" | "project">("global");

  const loadSkills = useCallback(async () => {
    try {
      setError("");
      const list = await backend.listSkills(projectPath);
      setSkills(list);
    } catch (e) {
      setError(String(e));
    }
  }, [projectPath]);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  const selected = useMemo(
    () => skills.find((s) => s.id === selectedId) ?? null,
    [skills, selectedId],
  );

  // Load selected skill content
  useEffect(() => {
    if (!selected) {
      setContent("");
      setOriginalContent("");
      return;
    }
    (async () => {
      try {
        const text = await backend.readSkill(selected.path);
        setContent(text);
        setOriginalContent(text);
        setSaveState("idle");
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [selected]);

  const isDirty = content !== originalContent;

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      if (scopeFilter !== "all" && s.scope !== scopeFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.dir_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [skills, filter, scopeFilter]);

  const save = async () => {
    if (!selected) return;
    setSaveState("saving");
    try {
      await backend.writeSkill(selected.path, content);
      setOriginalContent(content);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
      // Refresh list to pick up frontmatter changes
      await loadSkills();
    } catch (e) {
      setError(String(e));
      setSaveState("error");
    }
  };

  const discard = () => setContent(originalContent);

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Delete skill "${selected.name}"? This removes the entire skill folder.`)) return;
    try {
      await backend.deleteSkill(selected.path);
      setSelectedId(null);
      await loadSkills();
    } catch (e) {
      setError(String(e));
    }
  };

  const createNew = async () => {
    if (!newSkillName.trim()) return;
    try {
      const args: { name: string; scope: string; projectPath?: string } = {
        name: newSkillName.trim(),
        scope: newSkillScope,
      };
      if (newSkillScope === "project" && projectPath) args.projectPath = projectPath;
      const created = await backend.createSkill(
        args.name,
        args.scope,
        args.projectPath,
      );
      setShowNewDialog(false);
      setNewSkillName("");
      await loadSkills();
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
          title="Skills Library"
          description="View and edit agent skills (GSD + Claude Code layout). Skills are markdown files with YAML frontmatter loaded on demand by the agent runtime."
        />
        <button type="button" onClick={() => setShowNewDialog(true)} className={`${btnPrimary} shrink-0`}>
          + New Skill
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

      {/* New skill dialog */}
      {showNewDialog && (
        <div className="mb-4 p-4 rounded-lg bg-gsd-surface border border-gsd-border">
          <h3 className="text-sm font-semibold text-gsd-accent mb-3">Create New Skill</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gsd-text-dim block mb-1">Skill Name</label>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. test-writer"
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gsd-text-dim block mb-1">Scope</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewSkillScope("global")}
                  className={newSkillScope === "global" ? choiceBtnActive : choiceBtn}
                >
                  Global (~/.claude/skills)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSkillScope("project")}
                  disabled={!hasProject}
                  className={newSkillScope === "project" ? choiceBtnActive : choiceBtn}
                >
                  Project (.claude/skills)
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
                  setNewSkillName("");
                }}
                className={btn}
              >
                Cancel
              </button>
              <button type="button" onClick={createNew} disabled={!newSkillName.trim()} className={btnPrimary}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main split: list + editor */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Skill list */}
        <div className="w-72 shrink-0 flex flex-col border border-gsd-border rounded-lg overflow-hidden bg-gsd-surface">
          <div className="p-2 border-b border-gsd-border space-y-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search skills..."
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
            {filteredSkills.length === 0 && (
              <div className="p-4 text-xs text-gsd-text-dim text-center">
                No skills found. {hasProject ? "" : "Select a project to also see project skills."}
              </div>
            )}
            {filteredSkills.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-3 py-2 border-b border-gsd-border/50 transition-colors ${
                  selectedId === s.id
                    ? "bg-gsd-accent-dim"
                    : "hover:bg-gsd-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium truncate ${selectedId === s.id ? "text-gsd-accent" : "text-gsd-text"}`}>
                    {s.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    s.scope === "project"
                      ? "bg-gsd-accent/20 text-gsd-accent"
                      : "bg-gsd-border text-gsd-text-dim"
                  }`}>
                    {s.scope === "project" ? "Proj" : "Global"}
                  </span>
                </div>
                {s.description && (
                  <p className="text-[10px] text-gsd-text-dim mt-1 line-clamp-2">
                    {s.description}
                  </p>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-gsd-border text-[10px] text-gsd-text-muted">
            {filteredSkills.length} of {skills.length} skill{skills.length !== 1 ? "s" : ""}
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
              <div className="text-4xl mb-3 opacity-60">📖</div>
              <h3 className="text-sm font-semibold text-gsd-text mb-1">No skill selected</h3>
              <p className="text-xs text-gsd-text-dim max-w-xs">
                Select a skill from the list to view or edit its SKILL.md file.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
