// GSD Pi Config - theme dual-write unit tests (Wave 0)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getStoredTheme, resolveTheme } from "./theme";

/** Minimal classList stub for node env (no jsdom). */
function makeClassList() {
  const classes = new Set<string>();
  return {
    toggle(token: string, force?: boolean) {
      if (force === true) classes.add(token);
      else if (force === false) classes.delete(token);
      else if (classes.has(token)) classes.delete(token);
      else classes.add(token);
      return classes.has(token);
    },
    contains(token: string) {
      return classes.has(token);
    },
    remove(...tokens: string[]) {
      for (const t of tokens) classes.delete(t);
    },
    add(...tokens: string[]) {
      for (const t of tokens) classes.add(t);
    },
  };
}

function installDocumentStub() {
  const classList = makeClassList();
  const dataset: Record<string, string> = {};
  const documentElement = { dataset, classList };
  (globalThis as { document?: { documentElement: typeof documentElement } }).document = {
    documentElement,
  };
  return documentElement;
}

function installMatchMedia(prefersLight: boolean) {
  const matchMedia = vi.fn((query: string) => ({
    matches: query.includes("prefers-color-scheme: light") ? prefersLight : !prefersLight,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  (globalThis as unknown as { window?: { matchMedia: typeof matchMedia } }).window = {
    matchMedia,
  };
  return matchMedia;
}

describe("resolveTheme", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("returns dark and light prefs unchanged", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
  });

  it("resolves system via matchMedia (light)", () => {
    installMatchMedia(true);
    expect(resolveTheme("system")).toBe("light");
  });

  it("resolves system via matchMedia (dark)", () => {
    installMatchMedia(false);
    expect(resolveTheme("system")).toBe("dark");
  });
});

describe("applyTheme dual-write", () => {
  let el: ReturnType<typeof installDocumentStub>;

  beforeEach(() => {
    el = installDocumentStub();
  });

  afterEach(() => {
    delete (globalThis as { document?: unknown }).document;
  });

  it("sets data-theme=dark and class dark", () => {
    applyTheme("dark");
    expect(el.dataset.theme).toBe("dark");
    expect(el.classList.contains("dark")).toBe(true);
  });

  it("sets data-theme=light and removes class dark", () => {
    el.classList.add("dark");
    applyTheme("light");
    expect(el.dataset.theme).toBe("light");
    expect(el.classList.contains("dark")).toBe(false);
  });
});

describe("getStoredTheme", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it("returns allowlisted values", () => {
    store.set("gsd-pi-config.theme", "dark");
    expect(getStoredTheme()).toBe("dark");
    store.set("gsd-pi-config.theme", "light");
    expect(getStoredTheme()).toBe("light");
    store.set("gsd-pi-config.theme", "system");
    expect(getStoredTheme()).toBe("system");
  });

  it("falls back to system for invalid values", () => {
    store.set("gsd-pi-config.theme", "neon");
    expect(getStoredTheme()).toBe("system");
  });
});
