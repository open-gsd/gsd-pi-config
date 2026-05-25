// GSD Pi Config - Cloud editor empty / start state
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { Link } from "react-router-dom";
import { btn, btnPrimary, heading, prose } from "../lib/uiClasses";

interface WebStartPanelProps {
  onUpload: () => void;
  onLoadPreset: () => void;
}

const STEPS = [
  {
    n: "1",
    title: "Bring your config in",
    body: "Import preferences.md plus optional models.json and settings.json from your machine.",
  },
  {
    n: "2",
    title: "Edit in the browser",
    body: "Tune models, hooks, git, and workflow settings. A draft stays in this session only.",
  },
  {
    n: "3",
    title: "Download to install",
    body: "Use Download files and copy the three files into ~/.gsd/ for GSD Pi on your computer.",
  },
] as const;

export function WebStartPanel({ onUpload, onLoadPreset }: WebStartPanelProps) {
  const galleryHref = `${import.meta.env.BASE_URL}gallery`.replace(/\/?$/, "/gallery");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gsd-accent mb-3">
          Git · Ship · Done
        </p>
        <h1 className={`${heading} text-2xl font-semibold text-gsd-text mb-2`}>
          Configure GSD Pi in the cloud
        </h1>
        <p className={`${prose} text-sm text-gsd-text-dim mb-8 max-w-md`}>
          This editor cannot read or write files on your computer. Start from an import, a community
          preset, or a blank template, then download when you are ready.
        </p>

        <div className="mb-8 space-y-4 border-l border-gsd-border pl-4">
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <span className="absolute -left-4 top-0.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-gsd-border-strong bg-gsd-surface-solid text-[10px] font-semibold text-gsd-accent">
                {step.n}
              </span>
              <p className="text-sm font-medium text-gsd-text">{step.title}</p>
              <p className="text-xs text-gsd-text-dim mt-0.5 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onUpload} className={btnPrimary}>
            Import files
          </button>
          <button type="button" onClick={onLoadPreset} className={btn}>
            Load preset
          </button>
          <Link to="/new" className={btn}>
            New preset
          </Link>
        </div>

        <p className="mt-6 text-xs text-gsd-text-muted">
          Or{" "}
          <a href={galleryHref} className="text-gsd-accent hover:text-gsd-accent-hover">
            browse the preset gallery
          </a>
        </p>
      </div>
    </div>
  );
}
