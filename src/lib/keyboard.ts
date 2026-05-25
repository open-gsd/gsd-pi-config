// GSD Pi Config - Global keyboard shortcut manager
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// A tiny hook-based shortcut system. Handlers are registered by id so that
// component remounts (HMR or otherwise) don't stack duplicate listeners.

import { useEffect } from "react";

export interface Shortcut {
  /** Stable id — used for dedup on remount. */
  id: string;
  /** KeyboardEvent.key value (e.g. "k", "s", "z"). Compared case-insensitive. */
  key: string;
  /** Require ⌘ on mac / Ctrl on other platforms. Default: false. */
  mod?: boolean;
  /** Require shift. Default: false. */
  shift?: boolean;
  /** Required alt / option. Default: false. */
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
  /**
   * Whether to trigger even when the event target is an input / textarea.
   * Default: false — most shortcuts should not hijack typing.
   */
  allowInInput?: boolean;
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || "");
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

function matches(ev: KeyboardEvent, s: Shortcut): boolean {
  if (ev.key.toLowerCase() !== s.key.toLowerCase()) return false;
  const wantMod = !!s.mod;
  const hasMod = isMac() ? ev.metaKey : ev.ctrlKey;
  if (wantMod !== hasMod) return false;
  if (!!s.shift !== ev.shiftKey) return false;
  if (!!s.alt !== ev.altKey) return false;
  return true;
}

/**
 * Register a single shortcut for the lifetime of the calling component.
 * Automatically unregisters on unmount (HMR-safe).
 */
export function useShortcut(shortcut: Shortcut): void {
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (!matches(ev, shortcut)) return;
      if (!shortcut.allowInInput && isInputTarget(ev.target)) return;
      shortcut.handler(ev);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // The shortcut object is expected to be stable for the component lifetime.
    // If callers pass an inline object they should memoize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut.id]);
}

/** Register multiple shortcuts at once. */
export function useShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      for (const s of shortcuts) {
        if (!matches(ev, s)) continue;
        if (!s.allowInInput && isInputTarget(ev.target)) continue;
        s.handler(ev);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts.map((s) => s.id).join("|")]);
}
