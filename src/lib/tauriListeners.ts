// GSD Pi Config - Tauri window event listener helpers
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Wraps Tauri v2 window event subscriptions so the React component that
// installs them can unlisten cleanly on unmount. Without this, Vite HMR
// reloads stack duplicate close-dialog handlers and every subsequent
// close request fires the dialog N times.

import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Install a window close handler. The handler receives the Tauri close
 * event and may call `preventClose()` to cancel (e.g. to prompt the user).
 *
 * The handler identity is captured on mount; if it needs to read fresh
 * React state, keep the latest value in a ref. Passing a new function every
 * render would cause churn (re-subscribing on each paint is wasteful).
 */
export function useCloseRequested(
  handler: (event: { preventDefault: () => void }) => void | Promise<void>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const win = getCurrentWindow();
        const fn = await win.onCloseRequested(async (event) => {
          // Tauri's event exposes preventDefault() to cancel the close.
          await handler(event);
        });
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      } catch {
        // Not running under Tauri (e.g. vitest) — no-op.
      }
    })();

    return () => {
      cancelled = true;
      if (unlisten) unlisten();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
