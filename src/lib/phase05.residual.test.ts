// GSD Pi Config - Phase 5 residual purge contracts (ISO-05 / WEB-06 completion)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

/** Web-visible residual sections purged in Plans 01–02 (D-01). */
const WEB_RESIDUAL_SECTIONS = [
  "src/components/sections/CustomProvidersSection.tsx",
  "src/components/sections/ApiKeysSection.tsx",
] as const;

/** Forbidden uiClasses button-language symbols on residual web sections (D-01 / WEB-06). */
const FORBIDDEN_IMPORT_SYMBOLS = [
  "btn",
  "btnPrimary",
  "btnDanger",
  "btnSegment",
  "btnSegmentActive",
] as const;

/**
 * Detect uiClasses imports that pull forbidden button symbols.
 * Avoids false positives on comments by requiring an import line.
 */
function importsForbiddenUiClasses(src: string): string[] {
  const hits: string[] = [];
  const importRe = /import\s*\{([^}]+)\}\s*from\s*["'][^"']*uiClasses["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim().split(/\s+as\s+/)[0]?.trim())
      .filter(Boolean);
    for (const name of names) {
      if ((FORBIDDEN_IMPORT_SYMBOLS as readonly string[]).includes(name)) {
        hits.push(name);
      }
    }
  }
  return [...new Set(hits)];
}

describe("phase05 residual web purge (ISO-05 / WEB-06 completion)", () => {
  for (const rel of WEB_RESIDUAL_SECTIONS) {
    it(`${rel} does not import forbidden uiClasses button symbols`, () => {
      const src = readSrc(rel);
      const hits = importsForbiddenUiClasses(src);
      expect(hits, `${rel} still imports: ${hits.join(", ")}`).toEqual([]);
      // Residual web sections must not depend on uiClasses at all post-purge
      expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    });

    it(`${rel} imports Button from ui/button`, () => {
      const src = readSrc(rel);
      expect(src).toMatch(
        /from\s+["'](?:@\/components\/ui\/button|\.\.\/ui\/button|\.\.\/components\/ui\/button)["']/,
      );
    });
  }

  it("web CSS drops .gsd-btn chrome; desktop keeps it (D-02 / ISO-01)", () => {
    const webCss = readSrc("src/index.web.css");
    const desktopCss = readSrc("src/index.desktop.css");
    // Post-purge: web free of button-bridge selectors
    expect(webCss).not.toMatch(/\.gsd-btn\b/);
    // Desktop isolation: button-bridge class still present
    expect(desktopCss).toContain(".gsd-btn");
  });

  it("WEB_HIDDEN_SECTIONS still only skills/agents libraries (ISO-05)", () => {
    const src = readSrc("src/lib/sectionConfig.ts");
    expect(src).toMatch(/WEB_HIDDEN_SECTIONS/);
    expect(src).toMatch(/skills-library/);
    expect(src).toMatch(/agents-library/);
    // Freeze membership: exactly those two ids (do not expand/shrink without product decision)
    const match = src.match(
      /export const WEB_HIDDEN_SECTIONS[^=]*=\s*\[([^\]]*)\]/s,
    );
    expect(match, "WEB_HIDDEN_SECTIONS array not found").toBeTruthy();
    const body = match![1];
    const ids = [...body.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
    expect(ids).toEqual(["skills-library", "agents-library"]);
  });

  it("ConfigApp may still import uiClasses btn symbols for desktop (D-03 / Q2)", () => {
    // Explicit non-ban: ConfigApp is allowed to keep uiClasses for desktop branches
    const src = readSrc("src/ConfigApp.tsx");
    expect(src).toMatch(/from\s+["'][^"']*uiClasses["']/);
  });

  it("button primitive stays linear rounded-none", () => {
    const src = readSrc("src/components/ui/button.tsx");
    expect(src).toMatch(/rounded-none/);
  });
});
