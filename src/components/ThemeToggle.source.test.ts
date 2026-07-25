// GSD Pi Config - ThemeToggle presentation contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "ThemeToggle.tsx"), "utf8");

describe("ThemeToggle linear text trio (THM-04 / D-02)", () => {
  it("does not import segment uiClasses helpers", () => {
    expect(src).not.toMatch(/btnSegment/);
    expect(src).not.toMatch(/segmentGroup/);
    expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
  });

  it("keeps radiogroup semantics and setTheme on click", () => {
    expect(src).toMatch(/role=["']radiogroup["']/);
    expect(src).toMatch(/aria-label=["']Theme["']/);
    expect(src).toMatch(/role=["']radio["']/);
    expect(src).toMatch(/aria-checked/);
    expect(src).toMatch(/setTheme\(opt\.value\)/);
  });

  it("exposes Auto / Dark / Light labels for system / dark / light", () => {
    expect(src).toMatch(/value:\s*["']system["'][\s\S]*label:\s*["']Auto["']/);
    expect(src).toMatch(/value:\s*["']dark["'][\s\S]*label:\s*["']Dark["']/);
    expect(src).toMatch(/value:\s*["']light["'][\s\S]*label:\s*["']Light["']/);
  });

  it("uses underline active rule (not filled pills)", () => {
    // 1px primary bottom rule per UI-SPEC / D-02
    expect(src).toMatch(/border-b/);
    expect(src).toMatch(/border-primary/);
    expect(src).toMatch(/text-muted-foreground/);
    expect(src).toMatch(/min-h-10/);
  });
});
