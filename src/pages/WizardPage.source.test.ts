// GSD Pi Config - Wizard linear choice rows contract (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "WizardPage.tsx"), "utf8");

describe("WizardPage Mist Sky choice rows (WEB-03 / D-13–D-16)", () => {
  it("does not import choiceBtn / btn / btnPrimary from uiClasses", () => {
    expect(src).not.toMatch(/from\s+["'][^"']*uiClasses["']/);
    expect(src).not.toMatch(/choiceBtn/);
    expect(src).not.toMatch(/\bbtnPrimary\b/);
  });

  it("uses shadcn Input and Textarea", () => {
    expect(src).toMatch(/from\s+["'][^"']*ui\/input["']/);
    expect(src).toMatch(/from\s+["'][^"']*ui\/textarea["']/);
    expect(src).toMatch(/from\s+["'][^"']*ui\/button["']/);
  });

  it("uses left-edge active choice row styling", () => {
    expect(src).toMatch(/border-l-\[3px\]|border-l-primary|border-l-\[2px\]/);
    expect(src).toMatch(/min-h-12/);
  });

  it("keeps Open editor and Skip (blank) CTAs and single-page WebShell", () => {
    expect(src).toMatch(/Open editor/);
    expect(src).toMatch(/Skip \(blank\)/);
    expect(src).toMatch(/WebShell/);
    expect(src).toMatch(/active=["']new["']/);
  });

  it("preserves create/skip domain handlers", () => {
    expect(src).toMatch(/applyModePreset/);
    expect(src).toMatch(/applyProfilePreset/);
    expect(src).toMatch(/setWebDraft/);
  });
});
