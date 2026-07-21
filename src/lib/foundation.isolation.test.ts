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

/** FND-03: only Button (plus its import-only test) under components/ui. */
const UI_ALLOWLIST = new Set([
  "button.tsx",
  "button.import.test.ts",
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
    // Official neutral scaffold uses OKLCH, never #22d3ee as primary
    expect(webCss).not.toMatch(/--primary\s*:\s*#22d3ee/i);
    // Brand cyan may live on --bridge-accent / --color-gsd-accent only (not --primary)
  });

  it("keeps shadcn as the primary token system (no bare --gsd-* primary vars)", () => {
    // Primary system remains --background / --foreground / --primary
    expect(webCss).toMatch(/--background\s*:/);
    expect(webCss).toMatch(/--primary\s*:/);
    // Forbid bare legacy primary-system declarations (allow --color-gsd-* bridge only)
    expect(webCss).not.toMatch(/(?:^|[^-\w])--gsd-bg\s*:/m);
    expect(webCss).not.toMatch(/(?:^|[^-\w])--gsd-accent\s*:/m);
  });

  it("bridges transitional product color utilities + button chrome until Phase 2", () => {
    // uiClasses / WebShell still use gsd-* Tailwind colors and .gsd-btn until restyle
    expect(webCss).toMatch(/--color-gsd-bg\s*:/);
    expect(webCss).toMatch(/--color-gsd-accent\s*:/);
    expect(webCss).toMatch(/--bridge-accent\s*:/);
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

  it("only contains Button walking-skeleton files", () => {
    expect(existsSync(uiDir)).toBe(true);
    const basenames = readdirSync(uiDir).filter((name) => !name.startsWith("."));
    for (const name of basenames) {
      expect(UI_ALLOWLIST.has(name), `unexpected ui file: ${name}`).toBe(true);
    }
    expect(basenames).toContain("button.tsx");
  });

  it("does not dump card/dialog/input/select/command registry files", () => {
    const basenames = existsSync(uiDir)
      ? readdirSync(uiDir).map((n) => n.toLowerCase())
      : [];
    for (const forbidden of ["card", "dialog", "input", "select", "command"]) {
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
