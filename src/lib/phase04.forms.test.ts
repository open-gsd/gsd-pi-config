// GSD Pi Config - Phase 4 FormControls FRM-01/02 contracts (source-level, no DOM)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function readSrc(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

const FORM_CONTROLS = "src/components/FormControls.tsx";

const CORE_EXPORTS = [
  "Field",
  "Toggle",
  "SelectField",
  "LabeledSelectField",
  "MultiSelectField",
  "ComboField",
  "TextField",
  "NumberField",
  "TagInput",
  "SectionHeader",
  "ModelPicker",
  "ModelChain",
] as const;

describe("phase04 FormControls FRM-01 core kit contracts", () => {
  const src = readSrc(FORM_CONTROLS);

  for (const name of CORE_EXPORTS) {
    it(`exports ${name}`, () => {
      expect(src).toMatch(new RegExp(`export function ${name}\\b`));
    });
  }

  it("keeps Field data-field-path and data-invalid contracts", () => {
    expect(src).toMatch(/data-field-path=\{path\}/);
    expect(src).toMatch(/data-invalid=\{error \? "" : undefined\}/);
  });

  it("branches presentation with isWebPlatform", () => {
    expect(src).toMatch(/isWebPlatform/);
    expect(src).toMatch(/from\s+["']@\/platform["']|from\s+["']\.\.\/platform["']/);
  });

  it("imports web Switch, Select, and Input primitives", () => {
    expect(src).toMatch(/from\s+["']@\/components\/ui\/switch["']/);
    expect(src).toMatch(/from\s+["']@\/components\/ui\/select["']/);
    expect(src).toMatch(/from\s+["']@\/components\/ui\/input["']/);
  });

  it("maps Toggle to Switch on web and keeps desktop role=switch", () => {
    expect(src).toMatch(/Switch/);
    expect(src).toMatch(/onCheckedChange/);
    expect(src).toMatch(/role="switch"/);
  });

  it("preserves TextField snowflake String(value) coercion", () => {
    expect(src).toMatch(/String\(value\)/);
  });

  it("keeps desktop native select markup for legacy branch", () => {
    expect(src).toMatch(/<select[\s>]/);
  });

  it("SectionHeader web uses text-xl font-semibold heading scale", () => {
    expect(src).toMatch(/text-xl/);
    expect(src).toMatch(/font-semibold/);
  });
});
