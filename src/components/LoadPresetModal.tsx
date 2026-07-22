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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
    void loadIndex();
  }, [open, loadIndex]);

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

  const hasQuery = query.trim().length > 0;

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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold">Load preset</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose a community preset or load a{" "}
            <code className="font-mono text-xs">.preset.md</code> file from your computer. Review
            changes, then Save to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 gap-2 border-b border-border px-5 py-3">
          <Input
            type="search"
            placeholder="Search presets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-10 flex-1 rounded-none"
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadFromFile()}
            className="shrink-0"
          >
            From file…
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {error && (
            <p className="mb-3 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          {loading && (
            <p className="text-xs text-muted-foreground">Loading gallery…</p>
          )}
          {!loading && filtered.length === 0 && !error && !hasQuery && (
            <p className="text-xs text-muted-foreground">
              No presets in the gallery index. Try{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-2 hover:text-foreground"
                onClick={() => void loadFromFile()}
              >
                loading from file
              </button>
              .
            </p>
          )}
          {!loading && filtered.length === 0 && !error && hasQuery && (
            <p className="text-xs text-muted-foreground">
              No presets match your search. Clear the search or use{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-2 hover:text-foreground"
                onClick={() => void loadFromFile()}
              >
                From file…
              </button>
            </p>
          )}
          <ul className="space-y-2">
            {filtered.map((entry) => {
              const isLoading = loadingSlug === entry.slug;
              return (
                <li key={entry.slug}>
                  <button
                    type="button"
                    disabled={loadingSlug !== null}
                    onClick={() => void loadEntry(entry)}
                    className={cn(
                      "w-full min-h-10 rounded-none border border-border p-3 text-left transition-colors",
                      "hover:bg-muted/50 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      "disabled:opacity-50",
                      isLoading && "border-l-[3px] border-l-primary bg-primary/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{entry.title}</span>
                      {isLoading && (
                        <span className="text-xs text-muted-foreground">Loading…</span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                    {entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-none border border-border px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 items-center gap-3 rounded-none border-t border-border px-5 py-3 sm:justify-between">
          {backend.isWeb() ? (
            <Link
              to="/gallery"
              className="text-xs text-primary hover:underline"
              onClick={onClose}
            >
              Browse full gallery
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Community presets</span>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
