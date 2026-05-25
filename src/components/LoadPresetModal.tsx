// GSD Pi Config - Load preset (gallery or file)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadPreferencesFromText } from "../lib/preferencesCore";
import {
  fetchPresetIndex,
  fetchPresetMarkdown,
  type PresetIndexEntry,
} from "../lib/presetsCatalog";
import { useConfigBackend } from "../platform/backend";
import type { GSDPreferences } from "../types";
import { btn, modalPanel } from "../lib/uiClasses";

export interface LoadedPresetMeta {
  title?: string;
  slug?: string;
  description?: string;
}

interface LoadPresetModalProps {
  open: boolean;
  onClose: () => void;
  onLoaded: (prefs: GSDPreferences, meta?: LoadedPresetMeta) => void;
}

export function LoadPresetModal({ open, onClose, onLoaded }: LoadPresetModalProps) {
  const backend = useConfigBackend();
  const [entries, setEntries] = useState<PresetIndexEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
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
    if (!open) {
      setQuery("");
      setError("");
      setLoadingSlug(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    void loadIndex();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loadIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [entries, query]);

  const loadEntry = async (entry: PresetIndexEntry) => {
    setLoadingSlug(entry.slug);
    setError("");
    try {
      const text = await fetchPresetMarkdown(entry.path);
      const prefs = loadPreferencesFromText(text);
      onLoaded(prefs, {
        title: entry.title,
        slug: entry.slug,
        description: entry.description,
      });
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingSlug(null);
    }
  };

  const loadFromFile = async () => {
    setError("");
    try {
      const loaded = await backend.importPresetDialog();
      if (loaded) {
        onLoaded(loaded);
        onClose();
      }
    } catch (e) {
      setError(String(e));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden ${modalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gsd-border shrink-0">
          <h2 className="gsd-heading text-sm font-semibold text-gsd-text">Load preset</h2>
          <p className="gsd-prose mt-1 text-xs text-gsd-text-dim">
            Choose a community preset or load a <code className="text-[10px]">.preset.md</code>{" "}
            file from your computer. Review changes, then Save to apply.
          </p>
        </div>

        <div className="px-5 py-3 border-b border-gsd-border flex gap-2 shrink-0">
          <input
            type="search"
            placeholder="Search presets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={() => void loadFromFile()}
            className={`${btn} shrink-0`}
          >
            From file…
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
          {error && (
            <p className="text-xs text-gsd-danger mb-3">{error}</p>
          )}
          {loading && (
            <p className="text-xs text-gsd-text-dim">Loading gallery…</p>
          )}
          {!loading && filtered.length === 0 && !error && (
            <p className="text-xs text-gsd-text-dim">
              No presets in the gallery index. Try{" "}
              <button
                type="button"
                className="text-gsd-accent underline"
                onClick={() => void loadFromFile()}
              >
                loading from file
              </button>
              .
            </p>
          )}
          <ul className="space-y-2">
            {filtered.map((entry) => (
              <li key={entry.slug}>
                <button
                  type="button"
                  disabled={loadingSlug !== null}
                  onClick={() => void loadEntry(entry)}
                  className="w-full min-h-10 text-left p-3 rounded-md border border-gsd-border hover:border-gsd-accent/50 hover:bg-gsd-surface-hover transition-[border-color,background-color,transform] active:scale-[0.96] disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gsd-text">{entry.title}</span>
                    {loadingSlug === entry.slug && (
                      <span className="text-[10px] text-gsd-text-dim">Loading…</span>
                    )}
                  </div>
                  {entry.description && (
                    <p className="text-xs text-gsd-text-dim mt-1 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-gsd-bg border border-gsd-border text-gsd-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-3 border-t border-gsd-border flex items-center justify-between gap-3 shrink-0">
          {backend.isWeb() ? (
            <Link
              to="/gallery"
              className="text-xs text-gsd-accent hover:text-gsd-accent-hover"
              onClick={onClose}
            >
              Browse full gallery
            </Link>
          ) : (
            <span className="text-xs text-gsd-text-dim">Community presets</span>
          )}
          <button type="button" onClick={onClose} className={btn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
