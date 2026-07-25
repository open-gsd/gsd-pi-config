// GSD Pi Config - shadcn Input import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Input import (FND-03 / D-15)", () => {
  it("exports a callable Input component", () => {
    // Keep import-only (no render / no jsdom)
    expect(typeof Input === "function" || typeof Input === "object").toBe(true);
  });

  it("uses cn from @/lib/utils and stays Base UI (no Radix)", () => {
    const srcPath = path.join(uiDir, "input.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\//);
  });
});
