// GSD Pi Config - Phase 2 surface WEB-06 contracts (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SURFACE_FILES = [
  "src/components/WebShell.tsx",
  "src/components/ThemeToggle.tsx",
  "src/components/WebStartPanel.tsx",
  "src/pages/GalleryPage.tsx",
  "src/pages/WizardPage.tsx",
  "src/pages/OAuthCallbackPage.tsx",
] as const;

/** Forbidden uiClasses button-language symbols on Phase 2 surfaces (D-22 / WEB-06). */
const FORBIDDEN_IMPORT_SYMBOLS = [
  "btn",
  "btnPrimary",
  "btnSegment",
  "btnSegmentActive",
  "choiceBtn",
  "choiceBtnActive",
  "segmentGroup",
] as const;

function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

/**
 * Detect uiClasses imports that pull forbidden button symbols.
 * Avoids false positives on comments by requiring an import line.
 */
function importsForbiddenUiClasses(src: string): string[] {
  const hits: string[] = [];
  const importRe =
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*uiClasses["']/g;
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
  // Also catch side-effect / namespace style if ever used
  if (/from\s+["'][^"']*uiClasses["']/.test(src)) {
    for (const sym of FORBIDDEN_IMPORT_SYMBOLS) {
      // bare identifier usage of forbidden symbols (not inside longer words)
      if (new RegExp(`(?:^|[^\\w])${sym}(?:[^\\w]|$)`).test(src) && !hits.includes(sym)) {
        // Only flag if the file still imports uiClasses
        if (/from\s+["'][^"']*uiClasses["']/.test(src)) {
          hits.push(sym);
        }
      }
    }
  }
  return [...new Set(hits)];
}

describe("phase02 surfaces WEB-06 (no uiClasses button language)", () => {
  for (const rel of SURFACE_FILES) {
    it(`${rel} does not import forbidden uiClasses button symbols`, () => {
      const src = readSrc(rel);
      const hits = importsForbiddenUiClasses(src);
      expect(hits, `${rel} still imports: ${hits.join(", ")}`).toEqual([]);
      expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    });
  }

  it("OAuthCallbackPage wraps status in WebShell", () => {
    const src = readSrc("src/pages/OAuthCallbackPage.tsx");
    expect(src).toMatch(/WebShell/);
    expect(src).toMatch(/active=["']editor["']/);
    expect(src).toMatch(/completeOAuthSubmit/);
    expect(src).toMatch(/Completing sign-in…/);
    expect(src).toMatch(/role=["']alert["']/);
    // Never log OAuth code / tokens
    expect(src).not.toMatch(/console\.(log|debug|info|warn|error)\s*\(/);
  });

  it("button primitive stays linear rounded-none", () => {
    const src = readSrc("src/components/ui/button.tsx");
    expect(src).toMatch(/rounded-none/);
  });

  it("web CSS keeps Mist Sky primary hexes", () => {
    const css = readSrc("src/index.web.css");
    expect(css).toMatch(/--primary\s*:\s*#a8c5e8/i);
    expect(css).toMatch(/--primary\s*:\s*#5a7fa8/i);
  });
});
