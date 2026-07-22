// GSD Pi Config - Preset gallery (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShareModal } from "../components/ShareModal";
import { WebShell } from "../components/WebShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildShareablePreset, loadPreferencesFromText } from "../lib/preferencesCore";
import {
  fetchPresetIndex,
  fetchPresetMarkdown,
  PRESETS_CONTRIBUTING_URL,
  type PresetIndexEntry,
} from "../lib/presetsCatalog";
import { setWebDraft, writeWebDraftMeta, writeWebWorkspaceLabel } from "../platform/web";
import type { GSDPreferences } from "../types";

export function GalleryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<PresetIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const loadIndex = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const index = await fetchPresetIndex();
      setEntries(index.presets ?? []);
    } catch (e) {
      setError(String(e));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIndex();
  }, [loadIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.slug.toLowerCase().includes(q),
    );
  }, [entries, query]);

  const usePreset = async (entry: PresetIndexEntry) => {
    setLoadingSlug(entry.slug);
    try {
      setError("");
      const text = await fetchPresetMarkdown(entry.path);
      const prefs = loadPreferencesFromText(text);
      await setWebDraft(prefs);
      writeWebDraftMeta({
        title: entry.title,
        description: entry.description,
        sourcePresetSlug: entry.slug,
      });
      writeWebWorkspaceLabel(`Preset: ${entry.title}`);
      navigate("/");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingSlug(null);
    }
  };

  const previewPreset = async (entry: PresetIndexEntry) => {
    try {
      setError("");
      const text = await fetchPresetMarkdown(entry.path);
      const prefs = loadPreferencesFromText(text) as GSDPreferences;
      const content = buildShareablePreset(prefs);
      setPreviewContent(content);
      setPreviewOpen(true);
    } catch (e) {
      setError(String(e));
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <WebShell active="gallery">
      <ShareModal
        open={previewOpen}
        content={previewContent}
        onClose={() => setPreviewOpen(false)}
        title="Preview preset"
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Preset gallery</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Community starting points. Open one in the editor, customize, then download files for
            your machine. API keys and on-disk libraries need the{" "}
            <a
              href="https://github.com/open-gsd/gsd-pi-config"
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              desktop app
            </a>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/new"
              className={cn(buttonVariants({ variant: "default" }), "min-h-10 rounded-none")}
            >
              Create new preset
            </Link>
            <a
              href={PRESETS_CONTRIBUTING_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "min-h-10 rounded-none")}
            >
              Submit via PR
            </a>
          </div>
        </header>

        <div className="mb-6 flex gap-3">
          <Input
            type="search"
            placeholder="Search presets…"
            aria-label="Search presets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-10 flex-1 rounded-none"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadIndex()}
            disabled={loading}
            className="min-h-10 shrink-0 rounded-none"
          >
            Refresh list
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="text-sm text-muted-foreground">Loading presets…</p>}

        {!loading && filtered.length === 0 && !error && hasQuery && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">No presets match your search.</p>
            <p>
              Clear the search or{" "}
              <Link to="/new" className="text-primary hover:underline">
                Create new preset
              </Link>
              .
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && !error && !hasQuery && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">No presets found.</p>
            <p>
              Seed the{" "}
              <a
                href="https://github.com/open-gsd/gsd-pi-presets"
                className="text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                gsd-pi-presets
              </a>{" "}
              repository or check your network. Or{" "}
              <Link to="/new" className="text-primary hover:underline">
                Create new preset
              </Link>
              .
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <ul className="overflow-hidden rounded-none border border-border bg-card divide-y divide-border">
            {filtered.map((entry) => (
              <li
                key={entry.slug}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-start sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-foreground">{entry.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-none border border-border px-1.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 truncate font-mono text-xs text-muted-foreground">
                    by {entry.author}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => void usePreset(entry)}
                    disabled={loadingSlug === entry.slug}
                    className="min-h-10 rounded-none"
                  >
                    {loadingSlug === entry.slug ? "Loading…" : "Use preset"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void previewPreset(entry)}
                    className="min-h-10 rounded-none"
                  >
                    Preview
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </WebShell>
  );
}
