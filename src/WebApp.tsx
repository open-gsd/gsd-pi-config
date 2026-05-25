// GSD Pi Config - Web shell
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { ConfigBackendProvider } from "./platform/backend";
import { webBackend } from "./platform/webBackend";
import { ConfigApp } from "./ConfigApp";

export function WebApp() {
  return (
    <ConfigBackendProvider backend={webBackend}>
      <ConfigApp variant="web" />
    </ConfigBackendProvider>
  );
}
