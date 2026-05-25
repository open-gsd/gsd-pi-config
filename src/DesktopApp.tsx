// GSD Pi Config - Desktop (Tauri) shell
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { ConfigBackendProvider } from "./platform/backend";
import { tauriBackend } from "./platform/tauriBackend";
import { ConfigApp } from "./ConfigApp";

export function DesktopApp() {
  return (
    <ConfigBackendProvider backend={tauriBackend}>
      <ConfigApp variant="desktop" />
    </ConfigBackendProvider>
  );
}
