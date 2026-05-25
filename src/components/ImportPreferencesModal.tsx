import { useCallback, useEffect, useState } from "react";
import {
  readJsonConfigFromFile,
  readPreferencesFromFile,
  type ImportedWorkspace,
} from "../lib/importWorkspace";
import { pickFile } from "../lib/pickFile";
import { btn, btnPrimary, modalPanel } from "../lib/uiClasses";
import type { GSDModelsConfig, GSDPreferences } from "../types";

interface ImportPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: ImportedWorkspace) => void;
  /** Cloud web: upload copy; desktop: browse on disk. */
  variant?: "web" | "desktop";
  /** When set, use native file dialogs instead of the browser picker. */
  pickPreferencesFile?: () => Promise<ImportedWorkspace | null>;
  pickModelsFile?: () => Promise<Pick<ImportedWorkspace, "models" | "modelsFileName"> | null>;
  pickSettingsFile?: () => Promise<Pick<ImportedWorkspace, "settings" | "settingsFileName"> | null>;
}

function fileLabel(name: string | undefined, placeholder: string): string {
  return name ?? placeholder;
}

export function ImportPreferencesModal({
  open,
  onClose,
  onImport,
  variant = "desktop",
  pickPreferencesFile,
  pickModelsFile,
  pickSettingsFile,
}: ImportPreferencesModalProps) {
  const isWeb = variant === "web";
  const pickLabel = "Browse…";
  const [prefsFile, setPrefsFile] = useState<File | null>(null);
  const [modelsFile, setModelsFile] = useState<File | null>(null);
  const [settingsFile, setSettingsFile] = useState<File | null>(null);
  const [nativeLabels, setNativeLabels] = useState<{
    preferences?: string;
    models?: string;
    settings?: string;
  }>({});
  const [nativePrefs, setNativePrefs] = useState<GSDPreferences | null>(null);
  const [nativeModels, setNativeModels] = useState<GSDModelsConfig | null>(null);
  const [nativeSettings, setNativeSettings] = useState<ImportedWorkspace["settings"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const useNative = Boolean(pickPreferencesFile);

  const reset = useCallback(() => {
    setPrefsFile(null);
    setModelsFile(null);
    setSettingsFile(null);
    setNativeLabels({});
    setNativePrefs(null);
    setNativeModels(null);
    setNativeSettings(null);
    setError(null);
    setBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const browsePreferences = useCallback(async () => {
    setError(null);
    if (pickPreferencesFile) {
      const result = await pickPreferencesFile();
      if (!result?.preferences) return;
      setNativePrefs(result.preferences);
      setNativeLabels((l) => ({
        ...l,
        preferences: result.preferencesFileName ?? "preferences.md",
      }));
      return;
    }
    const file = await pickFile(".md,text/markdown,text/plain");
    if (file) setPrefsFile(file);
  }, [pickPreferencesFile]);

  const browseModels = useCallback(async () => {
    setError(null);
    if (pickModelsFile) {
      const result = await pickModelsFile();
      if (!result?.models) return;
      setNativeModels(result.models);
      setNativeLabels((l) => ({
        ...l,
        models: result.modelsFileName ?? "models.json",
      }));
      return;
    }
    const file = await pickFile(".json,application/json");
    if (file) setModelsFile(file);
  }, [pickModelsFile]);

  const browseSettings = useCallback(async () => {
    setError(null);
    if (pickSettingsFile) {
      const result = await pickSettingsFile();
      if (!result?.settings) return;
      setNativeSettings(result.settings);
      setNativeLabels((l) => ({
        ...l,
        settings: result.settingsFileName ?? "settings.json",
      }));
      return;
    }
    const file = await pickFile(".json,application/json");
    if (file) setSettingsFile(file);
  }, [pickSettingsFile]);

  const canImport = useNative
    ? nativePrefs != null
    : prefsFile != null;

  const handleImport = useCallback(async () => {
    if (!canImport) return;
    setBusy(true);
    setError(null);
    try {
      const payload: ImportedWorkspace = {};
      if (useNative && nativePrefs) {
        payload.preferences = nativePrefs;
        payload.preferencesFileName = nativeLabels.preferences;
        if (nativeModels) {
          payload.models = nativeModels;
          payload.modelsFileName = nativeLabels.models;
        }
        if (nativeSettings) {
          payload.settings = nativeSettings;
          payload.settingsFileName = nativeLabels.settings;
        }
      } else {
        if (!prefsFile) return;
        payload.preferences = await readPreferencesFromFile(prefsFile);
        payload.preferencesFileName = prefsFile.name;
        if (modelsFile) {
          payload.models = (await readJsonConfigFromFile(
            modelsFile,
          )) as ImportedWorkspace["models"];
          payload.modelsFileName = modelsFile.name;
        }
        if (settingsFile) {
          payload.settings = await readJsonConfigFromFile(settingsFile);
          payload.settingsFileName = settingsFile.name;
        }
      }
      onImport(payload);
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [
    canImport,
    useNative,
    nativePrefs,
    nativeLabels,
    nativeModels,
    nativeSettings,
    prefsFile,
    modelsFile,
    settingsFile,
    onImport,
    handleClose,
  ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const prefsLabel = useNative
    ? fileLabel(nativeLabels.preferences, "No file selected")
    : fileLabel(prefsFile?.name, "No file selected");
  const modelsLabel = useNative
    ? fileLabel(nativeLabels.models, "Optional")
    : fileLabel(modelsFile?.name, "Optional");
  const settingsLabel = useNative
    ? fileLabel(nativeLabels.settings, "Optional")
    : fileLabel(settingsFile?.name, "Optional");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-prefs-title"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md flex flex-col overflow-hidden ${modalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gsd-border shrink-0">
          <h2 id="import-prefs-title" className="gsd-heading text-sm font-semibold text-gsd-text">
            Import preferences
          </h2>
          <p className="gsd-prose mt-1 text-xs text-gsd-text-dim">
            {isWeb ? (
              <>
                Choose files from your computer to edit in this browser session. Files stay on
                your machine until you use <strong className="font-medium text-gsd-text">Download files</strong>{" "}
                to save copies for GSD Pi (typically{" "}
                <code className="text-[10px]">~/.gsd/preferences.md</code>,{" "}
                <code className="text-[10px]">~/.gsd/agent/models.json</code>,{" "}
                <code className="text-[10px]">settings.json</code>).
              </>
            ) : (
              <>
                Load your existing GSD config from disk into this workspace. Usually{" "}
                <code className="text-[10px]">~/.gsd/preferences.md</code> with optional{" "}
                <code className="text-[10px]">models.json</code> and{" "}
                <code className="text-[10px]">settings.json</code> (or under{" "}
                <code className="text-[10px]">.gsd/</code> in a project).
              </>
            )}
          </p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gsd-text">
                preferences.md{" "}
                <span className="text-gsd-accent font-normal">required</span>
              </div>
              <div className="text-[10px] text-gsd-text-dim truncate" title={prefsLabel}>
                {prefsLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void browsePreferences()}
              className={`${btn} shrink-0`}
            >
              {pickLabel}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gsd-text">
                models.json{" "}
                <span className="text-gsd-text-dim font-normal">optional</span>
              </div>
              <div className="text-[10px] text-gsd-text-dim truncate" title={modelsLabel}>
                {modelsLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void browseModels()}
              className={`${btn} shrink-0`}
            >
              {pickLabel}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gsd-text">
                settings.json{" "}
                <span className="text-gsd-text-dim font-normal">optional</span>
              </div>
              <div className="text-[10px] text-gsd-text-dim truncate" title={settingsLabel}>
                {settingsLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void browseSettings()}
              className={`${btn} shrink-0`}
            >
              {pickLabel}
            </button>
          </div>

          {error && (
            <p className="text-xs text-gsd-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gsd-border flex justify-end gap-2 shrink-0">
          <button type="button" onClick={handleClose} className={btn}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canImport || busy}
            onClick={() => void handleImport()}
            className={btnPrimary}
          >
            {busy ? "Importing…" : isWeb ? "Import into editor" : "Import into workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
