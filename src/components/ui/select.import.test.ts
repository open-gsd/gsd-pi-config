// GSD Pi Config - shadcn Select import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Select import (FRM-01 / FND-03)", () => {
  it("exports callable Select primitives", () => {
    // Keep import-only (no render / no jsdom)
    for (const component of [
      Select,
      SelectContent,
      SelectGroup,
      SelectItem,
      SelectLabel,
      SelectScrollDownButton,
      SelectScrollUpButton,
      SelectSeparator,
      SelectTrigger,
      SelectValue,
    ]) {
      expect(
        typeof component === "function" || typeof component === "object",
      ).toBe(true);
    }
  });

  it("uses Base UI Select only (no product Radix import)", () => {
    const srcPath = path.join(uiDir, "select.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toContain("@base-ui/react/select");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\/react-select/);
    expect(src).not.toMatch(/@radix-ui\//);
  });

  it("locks Mist Sky linear Select defaults (min-h-10 + rounded-none)", () => {
    const src = readFileSync(path.join(uiDir, "select.tsx"), "utf8");
    expect(src).toMatch(/min-h-10/);
    expect(src).toMatch(/rounded-none/);
    // Registry defaults must not remain as product defaults
    expect(src).not.toMatch(/rounded-lg/);
    expect(src).not.toMatch(/data-\[size=default\]:h-8/);
  });
});
