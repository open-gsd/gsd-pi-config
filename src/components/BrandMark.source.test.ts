// GSD Pi Config - BrandMark wordmark contracts
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(dir, "BrandMark.tsx"), "utf8");

describe("BrandMark wordmark (header chrome)", () => {
  it("exports BrandMark with size and subtitle props", () => {
    expect(src).toMatch(/export function BrandMark\b/);
    expect(src).toMatch(/size\?:/);
    expect(src).toMatch(/subtitle\?:/);
  });

  it("is a pure wordmark — no PNG/SVG image asset", () => {
    expect(src).not.toMatch(/opengsd-logo\.png/);
    expect(src).not.toMatch(/gsd-logo\.svg/);
    expect(src).not.toMatch(/<img\b/);
    expect(src).toMatch(/Open/);
    expect(src).toMatch(/GSD/);
  });

  it("uses dual-platform gsd text/accent tokens", () => {
    expect(src).toMatch(/text-gsd-text/);
    expect(src).toMatch(/text-gsd-accent/);
    expect(src).toMatch(/text-gsd-text-muted/);
  });
});
