// GSD Pi Config - Preset gallery (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShareModal } from "../components/ShareModal";
import { WebShell } from "../components/WebShell";
import { buildShareablePreset, loadPreferencesFromText } from "../lib/preferencesCore";
import {
  fetchPresetIndex,
  fetchPresetMarkdown,
  PRESETS_CONTRIBUTING_URL,
  type PresetIndexEntry,
} from "../lib/presetsCatalog";
import { setWebDraft, writeWebDraftMeta, writeWebWorkspaceLabel } from "../platform/web";
import type { GSDPreferences } from "../types";
import { btn, btnPrimary, heading, prose } from "../lib/uiClasses";

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

  return (
    <WebShell active="gallery">
      <ShareModal
        open={previewOpen}
        content={previewContent}
        onClose={() => setPreviewOpen(false)}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className={`${heading} text-xl font-semibold text-gsd-text`}>Preset gallery</h1>
          <p className={`${prose} text-sm text-gsd-text-dim mt-2 max-w-xl`}>
            Community starting points. Open one in the editor, customize, then download files for
            your machine. API keys and on-disk libraries need the{" "}
            <a
              href="https://github.com/open-gsd/gsd-pi-config"
              className="text-gsd-accent hover:text-gsd-accent-hover"
              target="_blank"
              rel="noreferrer"
            >
              desktop app
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/new" className={btnPrimary}>
              Create new preset
            </Link>
            <a
              href={PRESETS_CONTRIBUTING_URL}
              target="_blank"
              rel="noreferrer"
              className={btn}
            >
              Submit via PR
            </a>
          </div>
        </header>

        <div className="flex gap-3 mb-6">
          <input
            type="search"
            placeholder="Search presets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => void loadIndex()}
            disabled={loading}
            className={btn}
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-gsd-danger" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="text-sm text-gsd-text-dim">Loading presets…</p>}

        {!loading && filtered.length === 0 && !error && (
          <p className="text-sm text-gsd-text-dim">
            No presets found. Seed the{" "}
            <a
              href="https://github.com/open-gsd/gsd-pi-presets"
              className="text-gsd-accent hover:text-gsd-accent-hover"
              target="_blank"
              rel="noreferrer"
            >
              gsd-pi-presets
            </a>{" "}
            repository or check your network.
          </p>
        )}

        <ul className="rounded-lg border border-gsd-border bg-gsd-surface-solid/60 divide-y divide-gsd-border overflow-hidden">
          {filtered.map((entry) => (
            <li
              key={entry.slug}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-gsd-surface-hover/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h2 className={`${heading} text-base font-medium text-gsd-text`}>
                  {entry.title}
                </h2>
                <p className={`${prose} text-sm text-gsd-text-dim mt-1`}>{entry.description}</p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-gsd-border text-gsd-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gsd-text-muted mt-2 font-mono">by {entry.author}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void usePreset(entry)}
                  disabled={loadingSlug === entry.slug}
                  className={btnPrimary}
                >
                  {loadingSlug === entry.slug ? "Loading…" : "Use preset"}
                </button>
                <button type="button" onClick={() => void previewPreset(entry)} className={btn}>
                  Preview
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </WebShell>
  );
}
