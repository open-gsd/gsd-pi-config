// GSD Pi Config - Platform CSS isolation + web semantic token gates
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const webCss = readFileSync(path.join(root, "src/index.web.css"), "utf8");
const desktopCss = readFileSync(path.join(root, "src/index.desktop.css"), "utf8");

/** FND-03: Button/Input/Textarea + Dialog/Command/input-group + Phase 4 form kit (plus import-only tests). */
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
  "input.tsx",
  "input.import.test.ts",
  "textarea.tsx",
  "textarea.import.test.ts",
  // Phase 3 OVL-01/02 targets (D-24) — Dialog + Command + command peer only
  "dialog.tsx",
  "dialog.import.test.ts",
  "command.tsx",
  "command.import.test.ts",
  "input-group.tsx",
  "input-group.import.test.ts",
  // Phase 4 FRM-01 targets (D-05–D-08) — Switch/Select/Checkbox/Popover only
  "switch.tsx",
  "switch.import.test.ts",
  "select.tsx",
  "select.import.test.ts",
  "checkbox.tsx",
  "checkbox.import.test.ts",
  "popover.tsx",
  "popover.import.test.ts",
]);

/** Required THM-01 semantic token names on the web entry. */
const REQUIRED_WEB_TOKENS = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--muted",
  "--muted-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--radius",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--accent",
  "--accent-foreground",
] as const;

describe("web CSS semantic tokens (THM-01)", () => {
  it("defines required semantic token names as CSS custom properties", () => {
    for (const token of REQUIRED_WEB_TOKENS) {
      // Require a real property declaration, not a comment mention
      expect(
        webCss,
        `missing token declaration ${token}`,
      ).toMatch(new RegExp(`${token.replace(/-/g, "\\-")}\\s*:`));
    }
  });

  it("includes @custom-variant dark for .dark descendants", () => {
    expect(webCss).toMatch(/@custom-variant\s+dark\s*\(/);
  });

  it("imports tw-animate-css", () => {
    expect(webCss).toMatch(/@import\s+["']tw-animate-css["']/);
  });

  it("imports shadcn/tailwind.css after legitimacy gate", () => {
    expect(webCss).toMatch(/@import\s+["']shadcn\/tailwind\.css["']/);
  });

  it("maps tokens through @theme inline", () => {
    expect(webCss).toMatch(/@theme\s+inline\s*\{/);
    expect(webCss).toMatch(/--color-background\s*:/);
    expect(webCss).toMatch(/--color-primary\s*:/);
  });

  it("does not map GSD cyan into --primary", () => {
    // Mist Sky primary only — never logo cyan as --primary (D-00a / THM-01)
    expect(webCss).not.toMatch(/--primary\s*:\s*#22d3ee/i);
    expect(webCss).not.toMatch(/--primary\s*:\s*#0891b2/i);
  });

  it("keeps shadcn as the primary token system (no bare --gsd-* primary vars)", () => {
    // Primary system remains --background / --foreground / --primary
    expect(webCss).toMatch(/--background\s*:/);
    expect(webCss).toMatch(/--primary\s*:/);
    // Forbid bare legacy primary-system declarations (allow --color-gsd-* bridge only)
    expect(webCss).not.toMatch(/(?:^|[^-\w])--gsd-bg\s*:/m);
    expect(webCss).not.toMatch(/(?:^|[^-\w])--gsd-accent\s*:/m);
  });

  it("declares Mist Sky primary hexes (D-00a)", () => {
    // Dark primary + light primary from locked PALETTE.md
    expect(webCss).toMatch(/--primary\s*:\s*#a8c5e8/i);
    expect(webCss).toMatch(/--primary\s*:\s*#5a7fa8/i);
  });

  it("sets --radius to 0 for strict linear grammar (D-23)", () => {
    expect(webCss).toMatch(/--radius\s*:\s*0\s*;/);
    // Scaffold 0.625rem must not remain the product radius
    expect(webCss).not.toMatch(/--radius\s*:\s*0\.625rem/);
  });

  it("bridges transitional product color utilities + button chrome until Phase 4 (D-21, D-22)", () => {
    // uiClasses / ConfigApp still use gsd-* Tailwind colors and .gsd-btn until Phase 4
    expect(webCss).toMatch(/--color-gsd-bg\s*:/);
    expect(webCss).toMatch(/--color-gsd-accent\s*:/);
    // Accent utility source is Mist Sky primary path — not cyan bridge literals (D-21)
    expect(webCss).toMatch(/--color-gsd-accent\s*:\s*var\(--primary\)/);
    expect(webCss).not.toMatch(/--color-gsd-accent\s*:\s*var\(--bridge-accent\)/);
    expect(webCss).not.toMatch(/--color-gsd-accent\s*:\s*#22d3ee/i);
    expect(webCss).not.toMatch(/--color-gsd-accent\s*:\s*#0891b2/i);
    // Editor bridge class chrome retained until Phase 4 form restyle (D-22)
    expect(webCss).toContain(".gsd-btn");
    expect(webCss).toContain(".gsd-btn-segment");
    expect(webCss).toContain(".gsd-btn-primary");
  });

  it("does not copy legacy form tag chrome selectors", () => {
    // Desktop form chrome uses input[type=...] / bare select|textarea blocks
    expect(webCss).not.toMatch(/input\[type=["']text["']\]/);
    expect(webCss).not.toMatch(/(?:^|\n)\s*select\s*,/);
    expect(webCss).not.toMatch(/(?:^|\n)\s*textarea\s*\{/);
  });
});

describe("desktop CSS isolation (ISO-01 / FND-04)", () => {
  it("keeps legacy gsd tokens and button chrome", () => {
    expect(desktopCss).toContain("--gsd-bg");
    expect(desktopCss).toContain(".gsd-btn");
  });

  it("does not import shadcn/tailwind or tw-animate-css", () => {
    expect(desktopCss).not.toContain("shadcn/tailwind");
    expect(desktopCss).not.toContain("tw-animate-css");
  });

  it("retains legacy form tag chrome", () => {
    expect(desktopCss).toMatch(/input\[type=["']text["']\]/);
    expect(desktopCss).toMatch(/(?:^|\n)\s*select\s*\{/);
    expect(desktopCss).toMatch(/(?:^|\n)\s*textarea\s*\{/);
  });
});

describe("components.json lock (FND-02)", () => {
  const componentsJson = JSON.parse(
    readFileSync(path.join(root, "components.json"), "utf8"),
  ) as {
    style: string;
    rsc: boolean;
    tsx: boolean;
    iconLibrary: string;
    tailwind: {
      config: string;
      css: string;
      baseColor: string;
      cssVariables: boolean;
      prefix: string;
    };
    aliases: Record<string, string>;
  };

  it("locks irreversible style/baseColor/cssVariables/rsc fields", () => {
    expect(componentsJson.style).toBe("base-nova");
    expect(componentsJson.rsc).toBe(false);
    expect(componentsJson.tsx).toBe(true);
    expect(componentsJson.tailwind.baseColor).toBe("neutral");
    expect(componentsJson.tailwind.cssVariables).toBe(true);
  });

  it("points CLI CSS at web entry only with blank TW4 config", () => {
    expect(componentsJson.tailwind.css).toBe("src/index.web.css");
    expect(componentsJson.tailwind.config).toBe("");
    expect(componentsJson.tailwind.prefix).toBe("");
    expect(componentsJson.tailwind.css).not.toContain("desktop");
    expect(componentsJson.tailwind.css).not.toBe("src/index.css");
  });

  it("maps aliases to @/* paths matching tsconfig", () => {
    expect(componentsJson.aliases).toEqual({
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    });
    expect(componentsJson.iconLibrary).toBe("lucide");
  });
});

describe("ui primitive allowlist (FND-03)", () => {
  const uiDir = path.join(root, "src/components/ui");

  /** Phase 3 required primitives (D-24 / OVL-01/02) — presence required, not forbidden. */
  const REQUIRED_PHASE3 = ["dialog.tsx", "command.tsx", "input-group.tsx"] as const;

  /** Phase 4 required form primitives (FRM-01 / D-05–D-08) — flip former Phase 3 forbid of select/popover. */
  const REQUIRED_PHASE4 = [
    "switch.tsx",
    "select.tsx",
    "checkbox.tsx",
    "popover.tsx",
  ] as const;

  /** Registry dump still forbidden this phase (D-02 / D-24) — no Card/Sheet/Alert dump. */
  const FORBIDDEN_DUMP = [
    "card",
    "sheet",
    "drawer",
    "alert-dialog",
    "sonner",
    "tooltip",
  ] as const;

  it("only contains allowlisted Button/Input/Textarea/Dialog/Command/form-kit files", () => {
    expect(existsSync(uiDir)).toBe(true);
    const basenames = readdirSync(uiDir).filter((name) => !name.startsWith("."));
    for (const name of basenames) {
      expect(UI_ALLOWLIST.has(name), `unexpected ui file: ${name}`).toBe(true);
    }
    expect(basenames).toContain("button.tsx");
  });

  it("requires Phase 3/4 primitives and does not dump card/sheet peers", () => {
    // D-24: Phase 3 targets must exist; Phase 4 flips select/popover forbid → require
    expect(existsSync(uiDir)).toBe(true);
    const basenames = readdirSync(uiDir).map((n) => n.toLowerCase());
    for (const required of REQUIRED_PHASE3) {
      expect(
        basenames.includes(required),
        `missing required Phase 3 primitive: ${required}`,
      ).toBe(true);
    }
    for (const required of REQUIRED_PHASE4) {
      expect(
        basenames.includes(required),
        `missing required Phase 4 primitive: ${required}`,
      ).toBe(true);
    }
    for (const forbidden of FORBIDDEN_DUMP) {
      expect(
        basenames.some((n) => n === `${forbidden}.tsx` || n.startsWith(`${forbidden}.`)),
        `forbidden primitive present: ${forbidden}`,
      ).toBe(false);
    }
  });

  it("button source declares required CVA variants", () => {
    const buttonSrc = readFileSync(path.join(uiDir, "button.tsx"), "utf8");
    for (const variant of [
      "default",
      "secondary",
      "destructive",
      "outline",
      "ghost",
      "link",
    ]) {
      expect(buttonSrc).toMatch(new RegExp(`${variant}\\s*:`));
    }
    expect(buttonSrc).toContain("@base-ui/react");
    expect(buttonSrc).not.toMatch(/@radix-ui\//);
  });
});
