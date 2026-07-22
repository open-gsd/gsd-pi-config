// GSD Pi Config - shadcn Textarea import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Textarea import (FND-03 / D-15)", () => {
  it("exports a callable Textarea component", () => {
    // Keep import-only (no render / no jsdom)
    expect(typeof Textarea === "function" || typeof Textarea === "object").toBe(true);
  });

  it("uses cn from @/lib/utils and stays Base UI (no Radix)", () => {
    const srcPath = path.join(uiDir, "textarea.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\//);
  });
});
