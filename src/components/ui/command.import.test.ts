// GSD Pi Config - shadcn Command import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Command import (OVL-02 / FND-03)", () => {
  it("exports callable Command primitives", () => {
    // Keep import-only (no render / no jsdom)
    for (const component of [
      Command,
      CommandDialog,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandSeparator,
      CommandShortcut,
    ]) {
      expect(
        typeof component === "function" || typeof component === "object",
      ).toBe(true);
    }
  });

  it("uses cmdk + Dialog shell without product Radix dialog import", () => {
    const srcPath = path.join(uiDir, "command.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toMatch(/from\s+["']cmdk["']/);
    expect(src).toMatch(/@\/components\/ui\/dialog/);
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\/react-dialog/);
  });

  it("locks linear Command defaults (D-00a / D-09)", () => {
    const src = readFileSync(path.join(uiDir, "command.tsx"), "utf8");
    expect(src).toMatch(/rounded-none/);
    // Product Command shell must not force registry rounded-xl
    expect(src).not.toMatch(/rounded-xl/);
  });
});
