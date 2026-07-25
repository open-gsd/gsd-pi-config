// GSD Pi Config - Phase 3 overlay OVL-01/02/03 contracts (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const OVERLAY_FILES = [
  "src/components/ShareModal.tsx",
  "src/components/ImportPreferencesModal.tsx",
  "src/components/LoadPresetModal.tsx",
  "src/components/SubmitPresetModal.tsx",
  "src/components/Palette.tsx",
] as const;

/** Forbidden uiClasses overlay/button-language symbols on Phase 3 overlays (D-22 / OVL). */
const FORBIDDEN_IMPORT_SYMBOLS = [
  "btn",
  "btnPrimary",
  "modalPanel",
] as const;

function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

/**
 * Detect uiClasses imports that pull forbidden button/modal symbols.
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
  if (/from\s+["'][^"']*uiClasses["']/.test(src)) {
    for (const sym of FORBIDDEN_IMPORT_SYMBOLS) {
      if (
        new RegExp(`(?:^|[^\\w])${sym}(?:[^\\w]|$)`).test(src) &&
        !hits.includes(sym)
      ) {
        hits.push(sym);
      }
    }
  }
  return [...new Set(hits)];
}

describe("phase03 overlays OVL-01/02/03 source contracts", () => {
  for (const rel of OVERLAY_FILES) {
    it(`${rel} uses Dialog and/or Command from @/components/ui`, () => {
      const src = readSrc(rel);
      const hasDialog = /from\s+["']@\/components\/ui\/dialog["']/.test(src);
      const hasCommand = /from\s+["']@\/components\/ui\/command["']/.test(src);
      expect(
        hasDialog || hasCommand,
        `${rel} must import dialog and/or command primitives`,
      ).toBe(true);
    });

    it(`${rel} does not import forbidden uiClasses btn/modalPanel language`, () => {
      const src = readSrc(rel);
      const hits = importsForbiddenUiClasses(src);
      expect(hits, `${rel} still imports: ${hits.join(", ")}`).toEqual([]);
      expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    });

    it(`${rel} does not use product backdrop-blur`, () => {
      const src = readSrc(rel);
      expect(src).not.toMatch(/backdrop-blur/);
    });
  }

  it("ShareModal keeps redaction keywords key/token/secret/password (D-17)", () => {
    const src = readSrc("src/components/ShareModal.tsx");
    expect(src).toMatch(/\bkey\b/);
    expect(src).toMatch(/\btoken\b/);
    expect(src).toMatch(/\bsecret\b/);
    expect(src).toMatch(/\bpassword\b/);
  });

  it("SubmitPresetModal keeps scanForLeakedSecrets + completeOAuthSubmit (D-08)", () => {
    const src = readSrc("src/components/SubmitPresetModal.tsx");
    expect(src).toMatch(/scanForLeakedSecrets/);
    expect(src).toMatch(/export\s+async\s+function\s+completeOAuthSubmit/);
  });

  it("Palette keeps scoreField/scoreSection, MAX_RESULTS = 50, shouldFilter false (D-10)", () => {
    const src = readSrc("src/components/Palette.tsx");
    expect(src).toMatch(/function\s+scoreField\b/);
    expect(src).toMatch(/function\s+scoreSection\b/);
    expect(src).toMatch(/MAX_RESULTS\s*=\s*50/);
    expect(src).toMatch(/shouldFilter=\{false\}/);
  });

  it("ConfigApp enforces single-open overlay exclusivity (D-16, OVL-03)", () => {
    const src = readSrc("src/ConfigApp.tsx");
    // close-all helper clears every product overlay flag
    expect(src).toMatch(/closeAllOverlays/);
    expect(src).toMatch(/setPaletteOpen\(false\)/);
    expect(src).toMatch(/setShareOpen\(false\)/);
    expect(src).toMatch(/setImportPrefsOpen\(false\)/);
    expect(src).toMatch(/setLoadPresetOpen\(false\)/);
    expect(src).toMatch(/setSubmitOpen\(false\)/);
    // exclusive open helpers exist
    expect(src).toMatch(/openPalette/);
    expect(src).toMatch(/openShare|openImport|openLoad|openSubmit/);
    // shortcut path must not raw-set palette true without exclusivity
    expect(src).not.toMatch(
      /shortcutCtx\.current\.setPaletteOpen\(true\)/,
    );
    // dirty confirms stay window.confirm (D-02, D-15) — no AlertDialog dump
    expect(src).toMatch(/\bconfirm\s*\(/);
    expect(src).not.toMatch(/AlertDialog/);
  });
});
