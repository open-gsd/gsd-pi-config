import { useCallback, useState } from "react";
import {
  readJsonConfigFromFile,
  readPreferencesFromFile,
  type ImportedWorkspace,
} from "../lib/importWorkspace";
import { pickFile } from "../lib/pickFile";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex w-full max-w-md flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold">Import preferences</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isWeb ? (
              <>
                Choose files from your computer to edit in this browser session. Files stay on
                your machine until you use{" "}
                <strong className="font-medium text-foreground">Download files</strong> to save
                copies for GSD Pi (typically{" "}
                <code className="font-mono text-xs">~/.gsd/preferences.md</code>,{" "}
                <code className="font-mono text-xs">~/.gsd/agent/models.json</code>,{" "}
                <code className="font-mono text-xs">settings.json</code>).
              </>
            ) : (
              <>
                Load your existing GSD config from disk into this workspace. Usually{" "}
                <code className="font-mono text-xs">~/.gsd/preferences.md</code> with optional{" "}
                <code className="font-mono text-xs">models.json</code> and{" "}
                <code className="font-mono text-xs">settings.json</code> (or under{" "}
                <code className="font-mono text-xs">.gsd/</code> in a project).
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="flex min-h-10 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground">
                preferences.md{" "}
                <span className="font-normal text-primary">required</span>
              </div>
              <div className="truncate text-xs text-muted-foreground" title={prefsLabel}>
                {prefsLabel}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void browsePreferences()}
              className="shrink-0"
            >
              {pickLabel}
            </Button>
          </div>
          <div className="flex min-h-10 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground">
                models.json{" "}
                <span className="font-normal text-muted-foreground">optional</span>
              </div>
              <div className="truncate text-xs text-muted-foreground" title={modelsLabel}>
                {modelsLabel}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void browseModels()}
              className="shrink-0"
            >
              {pickLabel}
            </Button>
          </div>
          <div className="flex min-h-10 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground">
                settings.json{" "}
                <span className="font-normal text-muted-foreground">optional</span>
              </div>
              <div className="truncate text-xs text-muted-foreground" title={settingsLabel}>
                {settingsLabel}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void browseSettings()}
              className="shrink-0"
            >
              {pickLabel}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-none border-t border-border px-5 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canImport || busy}
            onClick={() => void handleImport()}
          >
            {busy ? "Importing…" : isWeb ? "Import into editor" : "Import into workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
