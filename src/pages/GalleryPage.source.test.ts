// GSD Pi Config - Gallery linear list contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "GalleryPage.tsx"), "utf8");

describe("GalleryPage Mist Sky linear list (WEB-02 / WEB-07 / D-09–D-12)", () => {
  it("does not import btn / btnPrimary / heading / prose from uiClasses", () => {
    expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    expect(src).not.toMatch(/\bbtnPrimary\b/);
    expect(src).not.toMatch(/\bbtn\b/);
  });

  it("uses shadcn Input + Button/buttonVariants", () => {
    expect(src).toMatch(/from\s+["'][^"']*ui\/input["']/);
    expect(src).toMatch(/from\s+["'][^"']*ui\/button["']/);
    expect(src).toMatch(/buttonVariants|Button/);
    expect(src).toMatch(/Input/);
  });

  it("keeps single search input with type=search and accessible name", () => {
    expect(src).toMatch(/type=["']search["']/);
    expect(src).toMatch(/Search presets/);
    expect(src).toMatch(/aria-label=["']Search presets["']/);
  });

  it("uses linear list dividers not card grid", () => {
    expect(src).toMatch(/divide-y/);
    expect(src).not.toMatch(/grid-cols-/);
  });

  it("keeps Use preset / Preview / Refresh list / Create new preset labels", () => {
    expect(src).toMatch(/Use preset/);
    expect(src).toMatch(/Preview/);
    expect(src).toMatch(/Refresh list/);
    expect(src).toMatch(/Create new preset/);
    expect(src).toMatch(/Loading presets…/);
    expect(src).toMatch(/role=["']alert["']/);
  });

  it("distinguishes catalog-empty vs filtered-empty copy", () => {
    expect(src).toMatch(/No presets found/);
    expect(src).toMatch(/No presets match your search/);
  });

  it("preserves domain handlers", () => {
    expect(src).toMatch(/fetchPresetIndex/);
    expect(src).toMatch(/fetchPresetMarkdown/);
    expect(src).toMatch(/setWebDraft/);
    expect(src).toMatch(/buildShareablePreset/);
    expect(src).toMatch(/ShareModal/);
  });
});
