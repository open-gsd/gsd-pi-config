// GSD Pi Config - Palette Command-in-Dialog contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "Palette.tsx"), "utf8");

describe("Palette Command-in-Dialog (OVL-02 / D-09–D-12)", () => {
  it("uses CommandDialog shell with shouldFilter false (D-09, D-10)", () => {
    expect(src).toMatch(/CommandDialog/);
    expect(src).toMatch(/from\s+["']@\/components\/ui\/command["']/);
    expect(src).toMatch(/shouldFilter=\{false\}/);
  });

  it("keeps authoritative scorers and MAX_RESULTS = 50 (D-10)", () => {
    expect(src).toMatch(/const MAX_RESULTS = 50/);
    expect(src).toMatch(/function scoreField\(/);
    expect(src).toMatch(/function scoreSection\(/);
    expect(src).toMatch(/onNavigate/);
  });

  it("uses Mist Sky left-edge active rows + quiet empty/footer (D-11, D-12)", () => {
    expect(src).toMatch(/border-l-primary|border-l-\[3px\]/);
    expect(src).toMatch(/bg-primary\/10/);
    expect(src).toMatch(/No matches/);
    expect(src).toMatch(/↑↓ navigate · ↵ open · esc close/);
    expect(src).toMatch(/max-h-96/);
    expect(src).toMatch(/Jump to section or field/);
  });

  it("drops product blur and uiClasses modal/button language", () => {
    expect(src).not.toMatch(/backdrop-blur/);
    expect(src).not.toMatch(/modalPanel/);
    expect(src).not.toMatch(/btnPrimary/);
    expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
  });
});
