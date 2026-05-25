// GSD Pi Config - New preset wizard (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WebShell } from "../components/WebShell";
import { applyModePreset, applyProfilePreset } from "../lib/presets";
import { setWebDraft, writeWebDraftMeta, writeWebWorkspaceLabel } from "../platform/web";
import type { TokenProfile, WorkflowMode } from "../types";
import { btn, btnPrimary, choiceBtn, choiceBtnActive, heading, prose } from "../lib/uiClasses";

export function WizardPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<WorkflowMode>("solo");
  const [profile, setProfile] = useState<TokenProfile>("balanced");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const create = async () => {
    let prefs = applyModePreset({}, mode);
    prefs = applyProfilePreset(prefs, profile);
    await setWebDraft(prefs);
    writeWebDraftMeta({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
    writeWebWorkspaceLabel(
      title.trim() ? `New preset: ${title.trim()}` : "New preset (wizard)",
    );
    navigate("/");
  };

  return (
    <WebShell active="new">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6 space-y-8">
        <header>
          <h1 className={`${heading} text-xl font-semibold text-gsd-text`}>New preset</h1>
          <p className={`${prose} text-sm text-gsd-text-dim mt-2`}>
            Choose workflow and token profile. You can refine every field in the editor, then
            download files for GSD Pi on your machine.
          </p>
        </header>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gsd-text-muted mb-3">
            Workflow mode
          </h2>
          <div className="flex gap-2">
            {(["solo", "team"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 text-sm capitalize ${
                  mode === m ? choiceBtnActive : choiceBtn
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gsd-text-muted mb-3">
            Token profile
          </h2>
          <div className="flex flex-col gap-2">
            {(["budget", "balanced", "quality"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProfile(p)}
                className={`w-full text-sm text-left capitalize ${
                  profile === p ? choiceBtnActive : choiceBtn
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gsd-text-muted">
            Optional metadata
          </h2>
          <input
            type="text"
            placeholder="Preset title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
          <textarea
            placeholder="Short description for the gallery"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full"
          />
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={() => void create()} className={btnPrimary}>
            Open editor
          </button>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                await setWebDraft({});
                writeWebWorkspaceLabel("Blank configuration");
                navigate("/");
              })();
            }}
            className={btn}
          >
            Skip (blank)
          </button>
        </div>
      </main>
    </WebShell>
  );
}
