// GSD Pi Config - WebShell chrome contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "WebShell.tsx"), "utf8");

describe("WebShell underline nav + Button chrome (WEB-01 / D-01 / D-08)", () => {
  it("does not import btn / btnSegment / segmentGroup from uiClasses", () => {
    expect(src).not.toMatch(/btnSegment/);
    expect(src).not.toMatch(/segmentGroup/);
    expect(src).not.toMatch(/\bbtn\b.*uiClasses|from\s+["'][^"']*uiClasses["']/);
  });

  it("keeps Editor / Gallery / New preset NavLink routes", () => {
    expect(src).toMatch(/label:\s*["']Editor["']/);
    expect(src).toMatch(/label:\s*["']Gallery["']/);
    expect(src).toMatch(/label:\s*["']New preset["']/);
    expect(src).toMatch(/to:\s*["']\/["']/);
    expect(src).toMatch(/to:\s*["']\/gallery["']/);
    expect(src).toMatch(/to:\s*["']\/new["']/);
    expect(src).toMatch(/NavLink/);
    expect(src).toMatch(/end=\{item\.id === ["']editor["']\}/);
  });

  it("uses underline active nav + opaque header height constant", () => {
    expect(src).toMatch(/--gsd-shell-nav-height["']?:\s*["']3\.5rem["']/);
    expect(src).toMatch(/border-primary/);
    expect(src).toMatch(/border-b/);
    expect(src).toMatch(/bg-background/);
    expect(src).not.toMatch(/backdrop-blur-md/);
  });

  it("styles external opengsd.net via buttonVariants and brands home with wordmark", () => {
    expect(src).toMatch(/buttonVariants/);
    expect(src).toMatch(/opengsd\.net/);
    expect(src).toMatch(/rel=["']noopener noreferrer["']/);
    expect(src).toMatch(/BrandMark/);
    expect(src).toMatch(/size=["']sm["']/);
    // Brand goes to editor home (not external); wordmark is Link to /
    expect(src).toMatch(/<Link\s+to=["']\/["']/);
    expect(src).not.toMatch(/opengsd-logo\.png/);
  });

  it("keeps editor workspace strip at 2.25rem with primary mono label", () => {
    expect(src).toMatch(/--gsd-shell-editor-strip["']?:\s*["']2\.25rem["']/);
    expect(src).toMatch(/active === ["']editor["']/);
    expect(src).toMatch(/text-primary/);
    expect(src).toMatch(/font-mono/);
  });
});
