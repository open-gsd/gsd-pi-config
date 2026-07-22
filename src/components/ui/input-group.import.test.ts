// GSD Pi Config - shadcn input-group import-only proof (command peer only)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn input-group import (D-24 peer / FND-03)", () => {
  it("exports callable input-group primitives", () => {
    // Keep import-only (no render / no jsdom)
    for (const component of [
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
      InputGroupText,
      InputGroupTextarea,
    ]) {
      expect(
        typeof component === "function" || typeof component === "object",
      ).toBe(true);
    }
  });

  it("uses cn + existing Button/Input/Textarea without Radix", () => {
    const srcPath = path.join(uiDir, "input-group.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).toMatch(/@\/components\/ui\/button/);
    expect(src).not.toMatch(/@radix-ui\//);
  });
});
