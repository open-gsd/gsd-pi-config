// GSD Pi Config - Platform CSS isolation + web semantic token gates
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const webCss = readFileSync(path.join(root, "src/index.web.css"), "utf8");
const desktopCss = readFileSync(path.join(root, "src/index.desktop.css"), "utf8");

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

  it("maps tokens through @theme inline", () => {
    expect(webCss).toMatch(/@theme\s+inline\s*\{/);
    expect(webCss).toMatch(/--color-background\s*:/);
    expect(webCss).toMatch(/--color-primary\s*:/);
  });

  it("does not map GSD cyan into --primary", () => {
    // Official neutral scaffold uses OKLCH, never #22d3ee as primary
    expect(webCss).not.toMatch(/--primary\s*:\s*#22d3ee/i);
    expect(webCss).not.toContain("--gsd-accent");
  });

  it("does not use legacy gsd-bg as the primary token system", () => {
    expect(webCss).not.toContain("--gsd-bg");
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
