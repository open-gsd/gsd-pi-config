// GSD Pi Config - shadcn Checkbox import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Checkbox import (FRM-01 / FND-03)", () => {
  it("exports a callable Checkbox component", () => {
    // Keep import-only (no render / no jsdom)
    expect(typeof Checkbox === "function" || typeof Checkbox === "object").toBe(
      true,
    );
  });

  it("uses Base UI Checkbox only (no product Radix import)", () => {
    const srcPath = path.join(uiDir, "checkbox.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toContain("@base-ui/react/checkbox");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\//);
  });

  it("locks Mist Sky square checkbox chrome (rounded-none)", () => {
    const src = readFileSync(path.join(uiDir, "checkbox.tsx"), "utf8");
    expect(src).toMatch(/rounded-none/);
    // Registry rounded-[4px] must not remain as product default
    expect(src).not.toMatch(/rounded-\[4px\]/);
  });
});
