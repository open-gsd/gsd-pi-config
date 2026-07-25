// GSD Pi Config - shadcn Dialog import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const uiDir = path.dirname(fileURLToPath(import.meta.url));

describe("shadcn Dialog import (OVL-01 / FND-03)", () => {
  it("exports callable Dialog primitives", () => {
    // Keep import-only (no render / no jsdom)
    for (const component of [
      Dialog,
      DialogClose,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogOverlay,
      DialogPortal,
      DialogTitle,
      DialogTrigger,
    ]) {
      expect(
        typeof component === "function" || typeof component === "object",
      ).toBe(true);
    }
  });

  it("uses Base UI Dialog only (no product Radix dialog import)", () => {
    const srcPath = path.join(uiDir, "dialog.tsx");
    expect(existsSync(srcPath)).toBe(true);
    const src = readFileSync(srcPath, "utf8");
    expect(src).toContain("@base-ui/react/dialog");
    expect(src).toMatch(/@\/lib\/utils/);
    expect(src).not.toMatch(/@radix-ui\/react-dialog/);
    expect(src).not.toMatch(/@radix-ui\//);
  });

  it("locks Mist Sky scrim and linear radius (D-03 / D-00a)", () => {
    const src = readFileSync(path.join(uiDir, "dialog.tsx"), "utf8");
    expect(src).toMatch(/bg-black\/60/);
    expect(src).toMatch(/rounded-none/);
    expect(src).not.toMatch(/backdrop-blur/);
    // Registry defaults must not remain as product defaults
    expect(src).not.toMatch(/bg-black\/10/);
    expect(src).not.toMatch(/rounded-xl/);
  });
});
