// GSD Pi Config - Git Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type {
  GSDPreferences,
  GitPreferences,
  GitIsolation,
  GitMergeStrategy,
  GitCollapseCadence,
} from "../../types";
import { Field, Toggle, SelectField, TextField, SectionHeader, LabeledSelectField } from "../FormControls";
import { COMMIT_TYPES } from "../../constants";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function GitSection({ prefs, onChange }: Props) {
  const git = prefs.git ?? {};
  const setGit = (update: Partial<GitPreferences>) =>
    onChange({ ...prefs, git: { ...git, ...update } });

  return (
    <div>
      <SectionHeader
        title="Git"
        description="Git behavior: push settings, isolation strategy, merge options, and worktree configuration."
      />

      <Field path="git.auto_push" label="Auto Push" description="Automatically push commits to remote after committing.">
        <Toggle checked={git.auto_push ?? false} onChange={(v) => setGit({ auto_push: v })} />
      </Field>

      <Field path="git.push_branches" label="Push Branches" description="Push the milestone branch to remote after commits.">
        <Toggle checked={git.push_branches ?? false} onChange={(v) => setGit({ push_branches: v })} />
      </Field>

      <Field path="git.remote" label="Remote" description="Git remote name to push to.">
        <TextField value={git.remote} onChange={(v) => setGit({ remote: v })} placeholder="origin" />
      </Field>

      <Field path="git.snapshots" label="Snapshots" description="Create snapshot commits (WIP saves) during long-running tasks.">
        <Toggle checked={git.snapshots ?? true} onChange={(v) => setGit({ snapshots: v })} />
      </Field>

      <Field path="git.isolation" value={git.isolation} label="Isolation" description="Auto-mode git isolation strategy.">
        <SelectField<GitIsolation>
          value={git.isolation}
          onChange={(v) => setGit({ isolation: v })}
          options={["worktree", "branch", "none"]}
          placeholder="none"
        />
      </Field>

      <Field path="git.merge_strategy" value={git.merge_strategy} label="Merge Strategy" description="How worktree branches are merged.">
        <SelectField<GitMergeStrategy>
          value={git.merge_strategy}
          onChange={(v) => setGit({ merge_strategy: v })}
          options={["squash", "merge"]}
          placeholder="squash"
        />
      </Field>

      <Field path="git.pre_merge_check" label="Pre-Merge Check" description="Run pre-merge checks before merging worktree.">
        <LabeledSelectField
          value={
            git.pre_merge_check === undefined
              ? undefined
              : String(git.pre_merge_check)
          }
          onChange={(v) => {
            if (!v) {
              setGit({ pre_merge_check: undefined });
              return;
            }
            setGit({
              pre_merge_check: v === "auto" ? "auto" : v === "true",
            });
          }}
          options={[
            { value: "true", label: "Enabled" },
            { value: "false", label: "Disabled" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </Field>

      <Field path="git.main_branch" label="Main Branch" description="Primary branch name for new git repos.">
        <TextField value={git.main_branch} onChange={(v) => setGit({ main_branch: v })} placeholder="main" />
      </Field>

      <Field path="git.commit_type" label="Commit Type" description="Conventional commit type prefix. Default: inferred from diff.">
        <SelectField<(typeof COMMIT_TYPES)[number]>
          value={git.commit_type as (typeof COMMIT_TYPES)[number] | undefined}
          onChange={(v) => setGit({ commit_type: v })}
          options={COMMIT_TYPES}
          placeholder="Inferred"
        />
      </Field>

      <Field path="git.manage_gitignore" label="Manage .gitignore" description="Allow GSD to modify .gitignore with baseline patterns.">
        <Toggle checked={git.manage_gitignore ?? true} onChange={(v) => setGit({ manage_gitignore: v })} />
      </Field>

      <Field path="git.auto_pr" label="Auto PR" description="Automatically create a GitHub PR after milestone completion.">
        <Toggle checked={git.auto_pr ?? false} onChange={(v) => setGit({ auto_pr: v })} />
      </Field>

      <Field path="git.pr_target_branch" label="PR Target Branch" description="Target branch when auto_pr is enabled.">
        <TextField value={git.pr_target_branch} onChange={(v) => setGit({ pr_target_branch: v })} placeholder="main" />
      </Field>

      <Field path="git.worktree_post_create" value={git.worktree_post_create} label="Worktree Post-Create Script" description="Script to run after worktree creation. Receives SOURCE_DIR and WORKTREE_DIR env vars.">
        <TextField
          value={git.worktree_post_create}
          onChange={(v) => setGit({ worktree_post_create: v })}
          placeholder="None"
          className="w-52"
        />
      </Field>

      <Field path="git.absorb_snapshot_commits" label="Absorb Snapshot Commits" description="Squash gsd snapshot commits into the next real commit.">
        <Toggle checked={git.absorb_snapshot_commits ?? true} onChange={(v) => setGit({ absorb_snapshot_commits: v })} />
      </Field>

      <Field path="git.collapse_cadence" value={git.collapse_cadence} label="Collapse Cadence" description="When worktree commits collapse back to main.">
        <SelectField<GitCollapseCadence>
          value={git.collapse_cadence}
          onChange={(v) => setGit({ collapse_cadence: v })}
          options={["milestone", "slice"]}
          placeholder="milestone"
        />
      </Field>

      <Field path="git.milestone_resquash" label="Milestone Resquash" description="With slice cadence, squash slice commits to one milestone commit at end.">
        <Toggle checked={git.milestone_resquash ?? true} onChange={(v) => setGit({ milestone_resquash: v })} />
      </Field>
    </div>
  );
}
