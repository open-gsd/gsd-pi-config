// GSD Pi Config - Phase 4 form kit + editor chrome contracts (FRM-01–04, WEB-04)
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
const CONFIG_APP = "src/ConfigApp.tsx";
const SIDEBAR = "src/components/Sidebar.tsx";

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

  it("imports web Switch, Select, Checkbox, Popover, Input, and Button primitives", () => {
    // Flexible @/ or relative ui import paths
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/switch|\.\.\/components\/ui\/switch|\.\/ui\/switch)["']/,
    );
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/select|\.\.\/components\/ui\/select|\.\/ui\/select)["']/,
    );
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/checkbox|\.\.\/components\/ui\/checkbox|\.\/ui\/checkbox)["']/,
    );
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/popover|\.\.\/components\/ui\/popover|\.\/ui\/popover)["']/,
    );
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/input|\.\.\/components\/ui\/input|\.\/ui\/input)["']/,
    );
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/button|\.\.\/components\/ui\/button|\.\/ui\/button)["']/,
    );
  });

  it("maps Toggle to Switch on web and keeps desktop role=switch", () => {
    expect(src).toMatch(/Switch/);
    expect(src).toMatch(/onCheckedChange/);
    expect(src).toMatch(/role="switch"/);
  });

  it("preserves TextField snowflake String(value) coercion", () => {
    expect(src).toMatch(/String\(value\)/);
  });

  it("keeps desktop native select markup for legacy branch (locked Q4)", () => {
    expect(src).toMatch(/<select[\s>]/);
  });

  it("maps empty sentinel to labels via items + SelectValue (no raw __gsd_select_empty__ in trigger)", () => {
    // Base UI closed-trigger shows raw value unless items map / Value children resolve labels
    expect(src).toMatch(/__gsd_select_empty__/);
    expect(src).toMatch(/function selectItemsMap\b|selectItemsMap\(/);
    expect(src).toMatch(/function selectDisplayLabel\b|selectDisplayLabel\(/);
    expect(src).toMatch(/items=\{items\}/);
    expect(src).toMatch(/SelectValue placeholder=\{placeholder\}>/);
  });

  it("SectionHeader web uses text-xl font-semibold heading scale", () => {
    expect(src).toMatch(/text-xl/);
    expect(src).toMatch(/font-semibold/);
  });
});

describe("phase04 FormControls FRM-01 multi/combo/tag contracts", () => {
  const src = readSrc(FORM_CONTROLS);

  it("composes MultiSelect with Popover + Checkbox on web", () => {
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
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/input|\.\.\/components\/ui\/input|\.\/ui\/input)["']/,
    );
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

describe("phase04 FormControls FRM-03 ModelChain contracts", () => {
  const src = readSrc(FORM_CONTROLS);

  it("exports ModelChain with filter(Boolean) commit + rows resync", () => {
    expect(src).toMatch(/export function ModelChain\b/);
    expect(src).toMatch(/filter\(Boolean\)/);
    expect(src).toMatch(/setRows/);
    expect(src).toMatch(/const commit\s*=/);
  });

  it("keeps Primary/Fallback labels, + Add fallback, and move/remove aria-labels", () => {
    expect(src).toMatch(/\+ Add fallback/);
    expect(src).toMatch(/"Primary"/);
    expect(src).toMatch(/Fallback \$\{/);
    expect(src).toMatch(/Move \$\{label\} up/);
    expect(src).toMatch(/Move \$\{label\} down/);
    expect(src).toMatch(/Remove \$\{label\}/);
  });

  it("web ModelChain uses quiet ghost Buttons and Mist Sky label type scale", () => {
    // Labels: 12px uppercase muted (not legacy text-[10px] gsd)
    expect(src).toMatch(
      /function ModelChain[\s\S]*?text-xs font-semibold uppercase[\s\S]*?text-muted-foreground/,
    );
    // Reorder/remove as ghost Button on web
    expect(src).toMatch(
      /function ModelChain[\s\S]*?variant=["']ghost["'][\s\S]*?function NumberField/,
    );
    // + Add fallback is primary text link style, not filled default Button
    expect(src).toMatch(
      /function ModelChain[\s\S]*?\+ Add fallback[\s\S]*?function NumberField/,
    );
    expect(src).toMatch(/text-primary/);
  });

  it("does not invent drag-and-drop for ModelChain", () => {
    expect(src).not.toMatch(
      /function ModelChain[\s\S]*?\b(onDrag|dnd|DragDrop|useSortable)\b[\s\S]*?function NumberField/,
    );
  });
});

describe("phase04 ConfigApp FRM-04 + WEB-04 shell contracts", () => {
  const src = readSrc(CONFIG_APP);

  it("still uses useDirty( for preference dirty tracking", () => {
    expect(src).toMatch(/useDirty\s*\(/);
    expect(src).toMatch(/from\s+["']\.\/hooks\/useDirty["']/);
  });

  it("keeps webWorkspaceReady and anyDirty in save enablement region", () => {
    expect(src).toMatch(/webWorkspaceReady/);
    expect(src).toMatch(/anyDirty/);
    // Enablement predicates must remain in disabled= expressions (FRM-04 / Pitfall 6)
    expect(src).toMatch(
      /disabled=\{[\s\S]*?webWorkspaceReady[\s\S]*?anyDirty|disabled=\{[\s\S]*?anyDirty[\s\S]*?webWorkspaceReady/,
    );
    expect(src).toMatch(/isWeb \? !webWorkspaceReady : !anyDirty/);
    expect(src).toMatch(/isWeb \? webWorkspaceReady : anyDirty/);
  });

  it("imports Button from ui/button for web chrome", () => {
    expect(src).toMatch(
      /from\s+["'](?:@\/components\/ui\/button|\.\.\/components\/ui\/button|\.\/components\/ui\/button)["']/,
    );
    expect(src).toMatch(/\bButton\b/);
  });

  it("web primary Download path uses Button (not exclusively btnPrimary-only)", () => {
    // Web branch renders Button for Download; desktop may keep btnPrimary
    expect(src).toMatch(/isWeb \?[\s\S]*?<Button[\s\S]*?Download|Download[\s\S]*?<\/Button>/);
    expect(src).toMatch(/<Button[\s\S]*?Downloading|Downloaded|Download/);
  });

  it("keeps quiet error banner role=alert with title-case Dismiss", () => {
    expect(src).toMatch(/role=["']alert["']/);
    expect(src).toMatch(/>\s*Dismiss\s*</);
  });

  it("does not reintroduce gsd-btn class strings on web Button toolbar path", () => {
    // FormControls/ConfigApp web path must not reintroduce btn language on Button elements.
    // Desktop may still import btn/btnPrimary from uiClasses — that is OK (ISO).
    // Guard: no className={"gsd-btn...} on web Button usage.
    expect(src).not.toMatch(/<Button[^>]*className=\{?["'`][^"'`]*gsd-btn/);
  });
});

describe("phase04 Sidebar WEB-04 left-edge contracts", () => {
  const src = readSrc(SIDEBAR);

  it("uses left-edge primary active language on web", () => {
    expect(src).toMatch(/border-l-\[3px\]/);
    expect(src).toMatch(/border-l-primary/);
    expect(src).toMatch(/bg-primary\/10/);
    expect(src).toMatch(/font-semibold/);
  });

  it("keeps Unsaved changes dirty aria", () => {
    expect(src).toMatch(/aria-label=["']Unsaved changes["']/);
    expect(src).toMatch(/title=["']Unsaved changes["']/);
  });

  it("keeps desktop gsd-nav-item branch for ISO isolation", () => {
    expect(src).toMatch(/gsd-nav-item/);
    expect(src).toMatch(/gsd-nav-item-active/);
  });

  it("uses muted uppercase group labels on web (text-xs)", () => {
    expect(src).toMatch(/text-xs font-semibold tracking-wider uppercase text-muted-foreground/);
  });
});
