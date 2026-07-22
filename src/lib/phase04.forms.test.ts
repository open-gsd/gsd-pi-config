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

describe("phase04 FormControls FRM-01 multi/combo/tag contracts", () => {
  const src = readSrc(FORM_CONTROLS);

  it("composes MultiSelect with Popover + Checkbox on web", () => {
    expect(src).toMatch(/from\s+["']@\/components\/ui\/popover["']/);
    expect(src).toMatch(/from\s+["']@\/components\/ui\/checkbox["']/);
    expect(src).toMatch(/\bPopover\b/);
    expect(src).toMatch(/\bCheckbox\b/);
  });

  it("does not use native multi listbox", () => {
    expect(src).not.toMatch(/select\s+multiple|multiple\s*=\s*\{?true/);
  });

  it("keeps Remove {label} chip aria-labels", () => {
    expect(src).toMatch(/Remove \$\{/);
  });

  it("uses Input for TagInput and Combo free text on web", () => {
    expect(src).toMatch(/from\s+["']@\/components\/ui\/input["']/);
    // Web TagInput path should use Input primitive (not only bare <input>)
    expect(src).toMatch(/function TagInput[\s\S]*?<Input[\s\S]*?function SectionHeader/);
  });
});

describe("phase04 FormControls FRM-03 ModelPicker contracts", () => {
  const src = readSrc(FORM_CONTROLS);

  it("exports ModelPicker with CUSTOM_SENTINEL __custom__", () => {
    expect(src).toMatch(/export function ModelPicker\b/);
    expect(src).toMatch(/CUSTOM_SENTINEL\s*=\s*["']__custom__["']/);
  });

  it("keeps custom free-text provider/model-id path", () => {
    expect(src).toMatch(/provider\/model-id/);
    expect(src).toMatch(/— Custom \(provider\/model\) —/);
  });

  it("uses Select groups on web for ModelPicker (Select-first, not Command)", () => {
    expect(src).toMatch(/SelectGroup/);
    expect(src).toMatch(/SelectLabel/);
    // ModelPicker web path must not default to Command search
    expect(src).not.toMatch(/function ModelPicker[\s\S]*?\bCommand\b[\s\S]*?function ModelChain/);
  });

  it("shows quiet No models available for empty catalog (D-12)", () => {
    expect(src).toMatch(/No models available/);
  });

  it("maps empty/default via sentinel without emitting CUSTOM_SENTINEL as model id", () => {
    expect(src).toMatch(/CUSTOM_SENTINEL/);
    // onChange rules: empty → undefined; custom sentinel → ""
    expect(src).toMatch(/v === CUSTOM_SENTINEL|next === CUSTOM_SENTINEL/);
  });
});
