// GSD Pi Config - WebStartPanel Mist Sky contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "WebStartPanel.tsx"), "utf8");

describe("WebStartPanel Mist Sky start empty (D-17 / D-18)", () => {
  it("does not import btn / btnPrimary from uiClasses", () => {
    expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    expect(src).not.toMatch(/\bbtnPrimary\b/);
  });

  it("uses shadcn Button / buttonVariants", () => {
    expect(src).toMatch(/from\s+["'][^"']*ui\/button["']/);
    expect(src).toMatch(/Button|buttonVariants/);
  });

  it("keeps Git · Ship · Done kicker and three CTAs", () => {
    expect(src).toMatch(/Git · Ship · Done/);
    expect(src).toMatch(/Import files/);
    expect(src).toMatch(/Load preset/);
    expect(src).toMatch(/New preset/);
    expect(src).toMatch(/browse the preset gallery/);
    // Router Link with app path — not BASE_URL+gallery replace (was /gallery/gallery)
    expect(src).toMatch(/to=\{?["']\/gallery["']\}?/);
    expect(src).not.toMatch(/BASE_URL\}gallery/);
  });

  it("uses Mist Sky primary for kicker not logo cyan utility alone", () => {
    expect(src).toMatch(/text-primary/);
    expect(src).not.toMatch(/text-gsd-accent/);
  });
});
