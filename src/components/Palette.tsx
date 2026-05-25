// GSD Pi Config - ⌘K Command Palette
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Fuzzy-free substring + token-prefix search across the field registry and
// the section list. Keyboard-driven: ↑/↓ to move, Enter to open, Esc to
// dismiss.

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_FIELD_PATHS, getField } from "../lib/fields";
import type { FieldMeta } from "../lib/fields";
import { SECTION_GROUPS, type SectionId } from "./Sidebar";

import type { SectionGroup } from "./Sidebar";
import { modalPanel } from "../lib/uiClasses";

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId, fieldPath?: string) => void;
  sectionGroups?: readonly SectionGroup[];
}

type Result =
  | { kind: "section"; id: SectionId; label: string; group: string; score: number }
  | {
      kind: "field";
      path: string;
      meta: FieldMeta;
      score: number;
    };

const MAX_RESULTS = 50;

/**
 * Score a result against a query. Higher is better.
 * - exact label/section match: 1000
 * - label/section token prefix: 500
 * - substring on label: 250
 * - substring on hint/keywords: 100
 * - substring on path: 50
 * Returns 0 for no match.
 */
function scoreField(meta: FieldMeta, path: string, q: string): number {
  if (!q) return 1; // empty query → show everything
  const lq = q.toLowerCase();
  const label = meta.label.toLowerCase();
  const section = meta.section.toLowerCase();
  const hint = (meta.hint ?? "").toLowerCase();
  const kw = (meta.keywords ?? []).join(" ").toLowerCase();
  const p = path.toLowerCase();

  if (label === lq || section === lq) return 1000;
  // Token prefix: any whitespace-delimited token in label starts with the query
  if (label.split(/\s+/).some((tok) => tok.startsWith(lq))) return 500;
  if (section.startsWith(lq)) return 500;
  if (label.includes(lq)) return 250;
  if (hint.includes(lq)) return 100;
  if (kw.includes(lq)) return 100;
  if (p.includes(lq)) return 50;
  return 0;
}

function scoreSection(label: string, id: string, q: string): number {
  if (!q) return 1;
  const lq = q.toLowerCase();
  const ll = label.toLowerCase();
  if (ll === lq || id === lq) return 1200;
  if (ll.split(/\s+/).some((tok) => tok.startsWith(lq))) return 600;
  if (id.startsWith(lq)) return 600;
  if (ll.includes(lq)) return 300;
  return 0;
}

export function Palette({
  open,
  onClose,
  onNavigate,
  sectionGroups = SECTION_GROUPS,
}: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Flat list of { id, label, group } for all sections
  const allSections = useMemo(
    () =>
      sectionGroups.flatMap((g) =>
        g.items.map((it) => ({ id: it.id as SectionId, label: it.label, group: g.label })),
      ),
    [sectionGroups],
  );

  const results: Result[] = useMemo(() => {
    const out: Result[] = [];
    for (const s of allSections) {
      const score = scoreSection(s.label, s.id, query);
      if (score > 0) out.push({ kind: "section", id: s.id, label: s.label, group: s.group, score });
    }
    for (const path of ALL_FIELD_PATHS) {
      const meta = getField(path)!;
      const score = scoreField(meta, path, query);
      if (score > 0) out.push({ kind: "field", path, meta, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, MAX_RESULTS);
  }, [query, allSections]);

  // Reset cursor + focus when opening or query changes
  useEffect(() => {
    if (open) {
      setCursor(0);
      setQuery("");
      // Defer focus so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  // Ensure the cursored row is scrolled into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor, results.length]);

  if (!open) return null;

  const pick = (r: Result) => {
    if (r.kind === "section") {
      onNavigate(r.id);
    } else {
      onNavigate(r.meta.section, r.path);
    }
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[cursor];
      if (chosen) pick(chosen);
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl overflow-hidden ${modalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gsd-border">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Jump to section or field…"
            className="w-full bg-transparent outline-none text-sm text-gsd-text placeholder:text-gsd-text-muted"
          />
        </div>
        <ul
          ref={listRef}
          className="max-h-96 overflow-y-auto"
        >
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-gsd-text-muted">No matches</li>
          )}
          {results.map((r, i) => {
            const active = i === cursor;
            return (
              <li
                key={r.kind === "section" ? `s:${r.id}` : `f:${r.path}`}
                data-idx={i}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(r)}
                className={`min-h-10 px-4 py-2 cursor-pointer text-sm flex items-center justify-between gap-3 transition-[background-color,color,transform] active:scale-[0.96] ${
                  active
                    ? "bg-gsd-accent-dim text-gsd-accent"
                    : "text-gsd-text hover:bg-gsd-surface-hover"
                }`}
              >
                {r.kind === "section" ? (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-gsd-text-muted">
                        {r.group}
                      </span>
                      <span className="font-medium">{r.label}</span>
                    </span>
                    <span className="text-[10px] text-gsd-text-muted">section</span>
                  </>
                ) : (
                  <>
                    <span className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{r.meta.label}</span>
                      {r.meta.hint && (
                        <span className="text-[11px] text-gsd-text-muted truncate">
                          {r.meta.hint}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gsd-text-muted shrink-0 font-mono">
                      {r.meta.section} · {r.path}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-4 py-2 border-t border-gsd-border text-[10px] text-gsd-text-muted flex items-center justify-between">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
