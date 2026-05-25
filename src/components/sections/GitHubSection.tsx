// GSD Pi Config - GitHub Sync Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, GitHubSyncConfig } from "../../types";
import { Field, Toggle, TextField, NumberField, TagInput, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function GitHubSection({ prefs, onChange }: Props) {
  const github = prefs.github ?? {};
  const setGithub = (patch: Partial<GitHubSyncConfig>) =>
    onChange({ ...prefs, github: { ...github, ...patch } });

  return (
    <div>
      <SectionHeader
        title="GitHub Sync"
        description="Sync GSD milestones, slices, and tasks to GitHub Issues, Projects, and PRs."
      />

      <Field path="github.enabled" label="Enabled">
        <Toggle checked={github.enabled ?? false} onChange={(v) => setGithub({ enabled: v })} />
      </Field>

      <Field path="github.repo" label="Repository" description="owner/repo — auto-detected from git remote if omitted.">
        <TextField
          value={github.repo}
          onChange={(v) => setGithub({ repo: v })}
          placeholder="open-gsd/gsd-pi"
        />
      </Field>

      <Field path="github.project" value={github.project} label="Project Number" description="GitHub Projects v2 number (optional).">
        <NumberField
          value={github.project}
          onChange={(v) => setGithub({ project: v })}
          min={1}
          placeholder="Optional"
        />
      </Field>

      <Field path="github.labels" label="Issue Labels">
        <TagInput
          values={github.labels ?? []}
          onChange={(v) => setGithub({ labels: v.length > 0 ? v : undefined })}
          placeholder="Add label"
        />
      </Field>

      <Field path="github.auto_link_commits" label="Auto-Link Commits" description='Append "Resolves #N" to task commits.'>
        <Toggle checked={github.auto_link_commits ?? true} onChange={(v) => setGithub({ auto_link_commits: v })} />
      </Field>

      <Field path="github.slice_prs" label="Slice PRs" description="Create per-slice draft PRs.">
        <Toggle checked={github.slice_prs ?? true} onChange={(v) => setGithub({ slice_prs: v })} />
      </Field>
    </div>
  );
}
