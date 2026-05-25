// GSD Pi Config - Multi-Repository Workspace Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type {
  GSDPreferences,
  WorkspacePreferences,
  WorkspaceRepositoryPreference,
  WorkspaceMode,
} from "../../types";
import { Field, SelectField, TextField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

function RepoCard({
  id,
  repo,
  onUpdate,
  onRemove,
}: {
  id: string;
  repo: WorkspaceRepositoryPreference;
  onUpdate: (r: WorkspaceRepositoryPreference) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-3 rounded-lg bg-gsd-surface border border-gsd-border mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gsd-text">{id}</span>
        {id !== "project" && (
          <button type="button" onClick={onRemove} className="text-xs text-gsd-danger hover:text-red-400">
            Remove
          </button>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Path</label>
          <TextField
            value={repo.path}
            onChange={(path) => onUpdate({ ...repo, path: path ?? "" })}
            placeholder="relative/path"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Role</label>
          <TextField
            value={repo.role}
            onChange={(role) => onUpdate({ ...repo, role: role || undefined })}
            placeholder="Optional"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Verification commands</label>
          <TagInput
            values={repo.verification ?? []}
            onChange={(verification) =>
              onUpdate({ ...repo, verification: verification.length > 0 ? verification : undefined })
            }
            placeholder="Add command"
          />
        </div>
        <div>
          <label className="text-xs text-gsd-text-dim block mb-1">Commit policy</label>
          <SelectField<"auto" | "skip">
            value={repo.commit_policy}
            onChange={(commit_policy) => onUpdate({ ...repo, commit_policy })}
            options={["auto", "skip"]}
            placeholder="auto"
          />
        </div>
      </div>
    </div>
  );
}

export function WorkspaceSection({ prefs, onChange }: Props) {
  const workspace = prefs.workspace ?? {};
  const repos = workspace.repositories ?? {};
  const entries = Object.entries(repos);

  const setWorkspace = (patch: Partial<WorkspacePreferences>) =>
    onChange({ ...prefs, workspace: { ...workspace, ...patch } });

  const setRepos = (next: Record<string, WorkspaceRepositoryPreference>) =>
    setWorkspace({ repositories: Object.keys(next).length > 0 ? next : undefined });

  const addRepo = () => {
    const id = `repo-${entries.length + 1}`;
    setRepos({ ...repos, [id]: { path: "" } });
  };

  return (
    <div>
      <SectionHeader
        title="Workspace"
        description="Parent-workspace mode coordinates multiple repositories from one .gsd root."
      />

      <Field path="workspace.mode" value={workspace.mode} label="Workspace Mode">
        <SelectField<WorkspaceMode>
          value={workspace.mode}
          onChange={(v) => setWorkspace({ mode: v })}
          options={["project", "parent"]}
          placeholder="project"
        />
      </Field>

      <div className="flex items-center justify-between mt-4 mb-3">
        <h3 className="text-sm font-medium text-gsd-text-dim uppercase tracking-wider">Repositories</h3>
        <button
          type="button"
          onClick={addRepo}
          className="text-xs px-2 py-1 rounded bg-gsd-accent/20 text-gsd-accent-hover hover:bg-gsd-accent/30"
        >
          + Add repository
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-gsd-text-dim mb-4">No child repositories configured.</p>
      )}

      {entries.map(([id, repo]) => (
        <RepoCard
          key={id}
          id={id}
          repo={repo}
          onUpdate={(r) => setRepos({ ...repos, [id]: r })}
          onRemove={() => {
            const { [id]: _drop, ...rest } = repos;
            void _drop;
            setRepos(rest);
          }}
        />
      ))}
    </div>
  );
}
