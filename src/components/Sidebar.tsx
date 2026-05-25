// GSD Pi Config - Sidebar Navigation
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { BrandMark } from "./BrandMark";

export const SECTION_GROUPS = [
  {
    label: "Setup",
    items: [
      { id: "general", label: "General" },
      { id: "models", label: "Models" },
      { id: "custom-providers", label: "Custom Providers" },
      { id: "api-keys", label: "API Keys & Auth" },
      { id: "agent-settings", label: "Agent Settings" },
      { id: "git", label: "Git" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { id: "phases", label: "Phases" },
      { id: "discussion", label: "Discussion" },
      { id: "hooks", label: "Hooks" },
      { id: "parallel", label: "Parallel" },
      { id: "notifications", label: "Notifications" },
    ],
  },
  {
    label: "Performance",
    items: [
      { id: "routing", label: "Dynamic Routing" },
      { id: "context", label: "Context" },
      { id: "budget", label: "Budget & Cost" },
      { id: "codebase", label: "Codebase Map" },
    ],
  },
  {
    label: "Quality",
    items: [
      { id: "safety", label: "Safety" },
      { id: "verification", label: "Verification" },
    ],
  },
  {
    label: "Skills & Agents",
    items: [
      { id: "skills", label: "Skill Rules" },
      { id: "skills-library", label: "Skills Library" },
      { id: "agents-library", label: "Agents Library" },
    ],
  },
  {
    label: "Integrations",
    items: [
      { id: "cmux", label: "CMux" },
      { id: "remote", label: "Remote Questions" },
      { id: "github", label: "GitHub Sync" },
      { id: "uok", label: "UOK" },
      { id: "workspace", label: "Workspace" },
      { id: "mcp", label: "Claude MCP" },
    ],
  },
  {
    label: "Experimental",
    items: [
      { id: "experimental", label: "Experimental" },
    ],
  },
] as const;

type AllItems = (typeof SECTION_GROUPS)[number]["items"][number];

export const SECTIONS: readonly AllItems[] = SECTION_GROUPS.flatMap(
  (g) => g.items as readonly AllItems[],
);

export type SectionId = AllItems["id"];

export type SectionGroup = {
  label: string;
  items: readonly { id: SectionId; label: string }[];
};

export function sectionLabel(
  id: SectionId,
  groups: readonly SectionGroup[],
): string {
  for (const group of groups) {
    const item = group.items.find((i) => i.id === id);
    if (item) return item.label;
  }
  return id;
}

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  /** Web: no logo block (branding lives in WebShell). */
  variant?: "desktop" | "web";
  /** Extra classes (e.g. mobile drawer positioning). */
  className?: string;
  /** Sections with unsaved changes — render a dirty dot next to each. */
  dirtySections?: Set<SectionId>;
  /** Override groups (e.g. web hides desktop-only sections). */
  sectionGroups?: readonly SectionGroup[] | typeof SECTION_GROUPS;
  /** Optional footer link (web: back to gallery). */
  footerLink?: { label: string; href: string };
}

export function Sidebar({
  active,
  onSelect,
  variant = "desktop",
  dirtySections,
  sectionGroups = SECTION_GROUPS,
  footerLink,
  className = "",
}: SidebarProps) {
  const isWeb = variant === "web";

  return (
    <nav
      className={`w-56 shrink-0 bg-gsd-surface-solid/95 border-r border-gsd-border overflow-y-auto z-40 backdrop-blur-sm ${className}`}
      aria-label={isWeb ? "Settings sections" : "Navigation"}
    >
      {isWeb ? (
        <div className="gsd-local-chrome px-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gsd-text-muted">
            Sections
          </p>
        </div>
      ) : (
        <div className="gsd-local-chrome flex min-h-[4.5rem] flex-col items-start justify-center gap-1.5 px-4">
          <BrandMark size="md" subtitle="Pi Config" />
          <p className="text-[9px] text-gsd-text-muted tracking-wide pl-[2.75rem]">
            Git · Ship · Done
          </p>
        </div>
      )}
      <div className="px-2 py-3">
        {sectionGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-gsd-text-muted">
              {group.label}
            </div>
            <ul>
              {group.items.map((s) => {
                const isDirty = dirtySections?.has(s.id) ?? false;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      className={`gsd-nav-item ${
                        active === s.id ? "gsd-nav-item-active" : "gsd-nav-item-idle"
                      }`}
                    >
                      <span>{s.label}</span>
                      {isDirty && (
                        <span
                          aria-label="Unsaved changes"
                          title="Unsaved changes"
                          className="h-1.5 w-1.5 rounded-full bg-gsd-accent shrink-0"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {footerLink && (
          <div className="px-3 pt-2 mt-2 border-t border-gsd-border">
            <a
              href={footerLink.href}
              className="text-xs text-gsd-accent hover:text-gsd-accent-hover"
            >
              {footerLink.label}
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
