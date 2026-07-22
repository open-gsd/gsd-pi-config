// GSD Pi Config - shadcn Popover import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Popover import (FRM-01 / FND-03)", () => {
  it("exports callable Popover primitives", () => {
    // Keep import-only (no render / no jsdom)
    for (const component of [
      Popover,
      PopoverContent,
      PopoverDescription,
      PopoverHeader,
      PopoverTitle,
      PopoverTrigger,
    ]) {
      expect(
        typeof component === "function" || typeof component === "object",
      ).toBe(true);
    }
  });

  it("uses Base UI Popover only (no product Radix import)", () => {
    const srcPath = path.join(uiDir, "popover.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toContain("@base-ui/react/popover");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\/react-popover/);
    expect(src).not.toMatch(/@radix-ui\//);
  });

  it("locks Mist Sky flat linear Popover (rounded-none, no glass blur)", () => {
    const src = readFileSync(path.join(uiDir, "popover.tsx"), "utf8");
    expect(src).toMatch(/rounded-none/);
    expect(src).not.toMatch(/backdrop-blur/);
    // Registry rounded-lg must not remain as product default
    expect(src).not.toMatch(/rounded-lg/);
  });
});
