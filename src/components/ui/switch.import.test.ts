// GSD Pi Config - shadcn Switch import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Switch } from "./switch";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Switch import (FRM-01 / FND-03)", () => {
  it("exports a callable Switch component", () => {
    // Keep import-only (no render / no jsdom)
    expect(typeof Switch === "function" || typeof Switch === "object").toBe(true);
  });

  it("uses Base UI Switch only (no product Radix import)", () => {
    const srcPath = path.join(uiDir, "switch.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toContain("@base-ui/react/switch");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\//);
  });

  it("locks Mist Sky capsule size (h-5 w-9 sole non-square exception)", () => {
    const src = readFileSync(path.join(uiDir, "switch.tsx"), "utf8");
    // Product default size — not registry 18.4×32
    expect(src).toMatch(/h-5/);
    expect(src).toMatch(/w-9/);
    expect(src).toMatch(/rounded-full/);
    expect(src).not.toMatch(/h-\[18\.4px\]/);
    expect(src).not.toMatch(/w-\[32px\]/);
  });
});
