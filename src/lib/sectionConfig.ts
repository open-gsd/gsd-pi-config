// GSD Pi Config - Section visibility per platform
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { SECTION_GROUPS, type SectionId } from "../components/Sidebar";

import type { SectionGroup } from "../components/Sidebar";

/** Desktop-only: filesystem-backed skill/agent editors. */
export const WEB_HIDDEN_SECTIONS: readonly SectionId[] = [
  "skills-library",
  "agents-library",
] as const;

const WEB_HIDDEN = new Set<SectionId>(WEB_HIDDEN_SECTIONS);

export function isSectionVisibleOnWeb(id: SectionId): boolean {
  return !WEB_HIDDEN.has(id);
}

export function visibleSectionIds(platform: "web" | "desktop" = "desktop"): SectionId[] {
  const ids = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.id));
  if (platform === "web") {
    return ids.filter(isSectionVisibleOnWeb);
  }
  return ids;
}

export function filterSectionGroups(platform: "web" | "desktop" = "desktop"): readonly SectionGroup[] {
  if (platform === "desktop") {
    return SECTION_GROUPS;
  }
  return SECTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => isSectionVisibleOnWeb(item.id)),
  })).filter((group) => group.items.length > 0);
}
