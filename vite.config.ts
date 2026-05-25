// GSD Pi Config - Vite Configuration
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isWeb = mode === "web";

  return {
    plugins: [react(), tailwindcss()],
    clearScreen: false,
    base: isWeb ? (process.env.VITE_BASE_PATH ?? "/") : "/",
    define: {
      "import.meta.env.VITE_PLATFORM": JSON.stringify(isWeb ? "web" : "desktop"),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      port: isWeb ? 5173 : 1420,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
      proxy: isWeb
        ? {
            "/api": {
              target: "http://127.0.0.1:3000",
              changeOrigin: true,
            },
          }
        : undefined,
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
