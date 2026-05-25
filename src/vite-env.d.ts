/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM: "web" | "desktop";
  readonly VITE_BASE_PATH?: string;
  readonly VITE_PRESETS_INDEX_URL?: string;
  readonly VITE_PRESETS_RAW_BASE_URL?: string;
  readonly VITE_PRESETS_CONTRIBUTING_URL?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_SUBMIT_PRESET_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}
