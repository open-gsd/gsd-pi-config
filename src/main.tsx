// GSD Pi Config - Application Entry Point
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { migrateLegacyStorageKeys } from "./lib/storageMigration";
import { bootstrapTheme } from "./lib/theme";

migrateLegacyStorageKeys();
bootstrapTheme();

const loadApp = () =>
  import.meta.env.VITE_PLATFORM === "web"
    ? import("./App.web")
    : import("./App.desktop");

void loadApp().then(({ default: App }) => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
