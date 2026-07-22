// GSD Pi Config - Cloud editor empty / start state
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Git · Ship · Done
        </p>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Configure GSD Pi in the cloud
        </h1>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          This editor cannot read or write files on your computer. Start from an import, a community
          preset, or a blank template, then download when you are ready.
        </p>

        <div className="mb-8 space-y-4 border-l border-border pl-4">
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <span className="absolute -left-4 top-0.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-none border border-border bg-card text-[10px] font-semibold text-primary">
                {step.n}
              </span>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onUpload} className="min-h-10 rounded-none">
            Import files
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onLoadPreset}
            className="min-h-10 rounded-none"
          >
            Load preset
          </Button>
          <Link
            to="/new"
            className={cn(buttonVariants({ variant: "outline" }), "min-h-10 rounded-none")}
          >
            New preset
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Or{" "}
          <a href={galleryHref} className="text-primary hover:underline">
            browse the preset gallery
          </a>
        </p>
      </div>
    </div>
  );
}
