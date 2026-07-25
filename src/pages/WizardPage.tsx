// GSD Pi Config - New preset wizard (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WebShell } from "../components/WebShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { applyModePreset, applyProfilePreset } from "../lib/presets";
import { setWebDraft, writeWebDraftMeta, writeWebWorkspaceLabel } from "../platform/web";
import type { TokenProfile, WorkflowMode } from "../types";

function choiceRowClass(active: boolean, extra?: string) {
  return cn(
    "rounded-none border border-border bg-transparent p-4 text-sm capitalize min-h-12",
    "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
    active
      ? "border-l-[3px] border-l-primary bg-primary/10 text-foreground"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    extra,
  );
}

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
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-8 sm:px-6">
        <header>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">New preset</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose workflow and token profile. You can refine every field in the editor, then
            download files for GSD Pi on your machine.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workflow mode
          </h2>
          <div className="flex gap-2">
            {(["solo", "team"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={choiceRowClass(mode === m, "flex-1 text-center")}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Token profile
          </h2>
          <div className="flex flex-col gap-2">
            {(["budget", "balanced", "quality"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProfile(p)}
                className={choiceRowClass(profile === p, "w-full text-left")}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Optional metadata
          </h2>
          <div className="space-y-1.5">
            <label htmlFor="preset-title" className="text-sm text-foreground">
              Preset title
            </label>
            <Input
              id="preset-title"
              type="text"
              placeholder="Preset title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-10 rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="preset-desc" className="text-sm text-foreground">
              Short description for the gallery
            </label>
            <Textarea
              id="preset-desc"
              placeholder="Short description for the gallery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-none"
            />
          </div>
        </section>

        <div className="flex flex-col-reverse flex-wrap gap-2 pt-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => void create()}
            className="min-h-10 w-full rounded-none sm:w-auto"
          >
            Open editor
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void (async () => {
                await setWebDraft({});
                writeWebWorkspaceLabel("Blank configuration");
                navigate("/");
              })();
            }}
            className="min-h-10 w-full rounded-none sm:w-auto"
          >
            Skip (blank)
          </Button>
        </div>
      </main>
    </WebShell>
  );
}
