// GSD Pi Config - Tauri auto-update helper
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Thin wrapper around @tauri-apps/plugin-updater. The check() call hits the
// endpoint configured in tauri.conf.json (GitHub Releases latest.json),
// verifies the ed25519 signature against the pubkey baked into the binary,
// and returns an Update handle when a newer version is available.
//
// Failure modes handled:
//   - Offline / DNS failure → returns { available: false } (silent)
//   - Endpoint 404 (no published release) → returns { available: false }
//   - Bad signature → check() throws; we surface the error to the caller
//   - Browser mode (vite dev without tauri) → check() throws; treated as
//     "no update available" so dev server isn't noisy

import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface UpdateCheck {
  available: boolean;
  version?: string;
  notes?: string;
  handle?: Update;
  error?: string;
}

export async function checkForUpdate(): Promise<UpdateCheck> {
  try {
    const update = await check();
    if (!update) return { available: false };
    return {
      available: true,
      version: update.version,
      notes: update.body,
      handle: update,
    };
  } catch (e) {
    return { available: false, error: String(e) };
  }
}

export async function downloadAndInstallUpdate(update: Update): Promise<void> {
  await update.downloadAndInstall();
  await relaunch();
}
