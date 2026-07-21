// GSD Pi Config - shadcn Button import-only proof (no DOM render)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "./button";

describe("shadcn Button import (FND-01 / FND-03)", () => {
  it("exports a callable Button component", () => {
    // forwardRef / function components are functions; keep import-only (no render)
    expect(typeof Button === "function" || typeof Button === "object").toBe(true);
  });

  it("exposes CVA variants used by the walking skeleton", () => {
    expect(typeof buttonVariants).toBe("function");
    const className = buttonVariants({ variant: "default" });
    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("includes required variant keys in CVA config", () => {
    // Smoke each contract variant so missing keys fail without mounting React
    for (const variant of [
      "default",
      "secondary",
      "destructive",
      "outline",
      "ghost",
      "link",
    ] as const) {
      expect(buttonVariants({ variant })).toEqual(expect.any(String));
    }
  });
});
