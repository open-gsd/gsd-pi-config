// GSD Pi Config - ⌘K Command Palette
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Fuzzy-free substring + token-prefix search across the field registry and
// the section list. Keyboard-driven: ↑/↓ to move, Enter to open, Esc to
// dismiss. Ranking stays authoritative via scoreField/scoreSection +
// shouldFilter={false} (cmdk must not re-rank).

import { useEffect, useMemo, useState } from "react";
import { ALL_FIELD_PATHS, getField } from "../lib/fields";
import type { FieldMeta } from "../lib/fields";
import { SECTION_GROUPS, type SectionId } from "./Sidebar";
import type { SectionGroup } from "./Sidebar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

  // Reset query when opening so ranking starts clean (D-09 open reset)
  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const pick = (r: Result) => {
    if (r.kind === "section") {
      onNavigate(r.id);
    } else {
      onNavigate(r.meta.section, r.path);
    }
    onClose();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="Command palette"
      description="Jump to section or field"
      // D-09: top-ish pt-24 feel; max-w-xl; linear radius via CommandDialog defaults
      className="top-24 max-w-xl translate-y-0 sm:max-w-xl"
      showCloseButton={false}
    >
      {/* D-10: shouldFilter false — pre-sorted scoreField/scoreSection results only */}
      <Command shouldFilter={false} className="rounded-none">
        <CommandInput
          placeholder="Jump to section or field…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-96">
          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
            No matches
          </CommandEmpty>
          {results.map((r) => {
            const value = r.kind === "section" ? `s:${r.id}` : `f:${r.path}`;
            return (
              <CommandItem
                key={value}
                value={value}
                onSelect={() => pick(r)}
                className="min-h-10 items-center justify-between gap-3 rounded-none border-l-[3px] border-l-transparent px-3 py-2 data-selected:border-l-primary data-selected:bg-primary/10 data-selected:text-foreground [&>svg]:hidden"
              >
                {r.kind === "section" ? (
                  <>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-xs font-normal uppercase tracking-widest text-muted-foreground">
                        {r.group}
                      </span>
                      <span className="truncate text-sm font-semibold">{r.label}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">section</span>
                  </>
                ) : (
                  <>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">{r.meta.label}</span>
                      {r.meta.hint && (
                        <span className="truncate text-xs text-muted-foreground">
                          {r.meta.hint}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {r.meta.section} · {r.path}
                    </span>
                  </>
                )}
              </CommandItem>
            );
          })}
        </CommandList>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}
