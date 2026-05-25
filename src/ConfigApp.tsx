// GSD Pi Config - Shared application shell (desktop + web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Sidebar, sectionLabel, type SectionId } from "./components/Sidebar";
import { Palette } from "./components/Palette";
import { ShareModal } from "./components/ShareModal";
import { ImportPreferencesModal } from "./components/ImportPreferencesModal";
import { LoadPresetModal } from "./components/LoadPresetModal";
import { SubmitPresetModal } from "./components/SubmitPresetModal";
import type { ImportedWorkspace } from "./lib/importWorkspace";
import {
  tauriPickModelsForImport,
  tauriPickPreferencesForImport,
  tauriPickSettingsForImport,
} from "./platform/tauri";
import { downloadWorkspaceFiles } from "./lib/downloadWorkspace";
import { WebShell } from "./components/WebShell";
import { WebStartPanel } from "./components/WebStartPanel";
import { writeWebDraftMeta, writeWebWorkspaceLabel } from "./platform/web";
import { ThemeToggle } from "./components/ThemeToggle";
import { renderPreferencesSection } from "./components/PreferencesSections";
import { useDirty } from "./hooks/useDirty";
import { useSidebarDrawerLayout } from "./hooks/useMediaQuery";
import { useShortcuts } from "./lib/keyboard";
import { useCloseRequested } from "./lib/tauriListeners";
import { useConfigBackend } from "./platform/backend";
import {
  checkForUpdate,
  downloadAndInstallUpdate,
  type UpdateCheck,
} from "./lib/updater";
import type { GSDPreferences, GSDModelsConfig } from "./types";
import { btn, btnPrimary, btnSegment, btnSegmentActive, segmentGroup } from "./lib/uiClasses";
import {
  filterSectionGroups,
  isSectionVisibleOnWeb,
} from "./lib/sectionConfig";

export interface ConfigAppProps {
  variant: "desktop" | "web";
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type Scope = "global" | "project";

const RECENT_PROJECTS_KEY = "gsd-pi-config.recent-projects";
const LAST_SCOPE_KEY = "gsd-pi-config.last-scope";
const LAST_PROJECT_KEY = "gsd-pi-config.last-project";

function loadRecentProjects(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentProjects(projects: string[]) {
  try {
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export function ConfigApp({ variant }: ConfigAppProps) {
  const backend = useConfigBackend();
  const isWeb = variant === "web";
  const sectionGroups = useMemo(
    () => filterSectionGroups(isWeb ? "web" : "desktop"),
    [isWeb],
  );
  const visibleSections = useMemo(
    () => sectionGroups.flatMap((g) => g.items),
    [sectionGroups],
  );
  const [section, setSection] = useState<SectionId>("general");
  const [prefs, setPrefs] = useState<GSDPreferences>({});
  const [originalPrefs, setOriginalPrefs] = useState<string>("{}");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedCount, setSavedCount] = useState(0);
  const [filePath, setFilePath] = useState("");
  const [error, setError] = useState("");
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);

  const [scope, setScope] = useState<Scope>(() => {
    const saved = localStorage.getItem(LAST_SCOPE_KEY);
    return saved === "project" ? "project" : "global";
  });
  const [projectPath, setProjectPath] = useState<string>(() => {
    return localStorage.getItem(LAST_PROJECT_KEY) ?? "";
  });
  const [recentProjects, setRecentProjects] = useState<string[]>(() => loadRecentProjects());

  // Second config document: ~/.gsd/agent/models.json (or project equivalent).
  // Tracked independently of preferences.md — same dirty/save flow, its own
  // mtime baseline for cross-process staleness detection.
  const [modelsDoc, setModelsDoc] = useState<GSDModelsConfig>({});
  const [originalModels, setOriginalModels] = useState<string>("{}");
  const [modelsMtime, setModelsMtime] = useState<number>(0);

  // Third config document: ~/.gsd/agent/settings.json (agent runtime settings).
  // Free-form Record so unknown keys (hooks, enterprise fields) round-trip.
  const [settingsDoc, setSettingsDoc] = useState<Record<string, unknown>>({});
  const [originalSettings, setOriginalSettings] = useState<string>("{}");
  const [settingsMtime, setSettingsMtime] = useState<number>(0);

  // Auto-update state. Silent check runs once on mount; banner appears only
  // if an update is available and the user hasn't dismissed it this session.
  const [updateInfo, setUpdateInfo] = useState<UpdateCheck | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updateInstalling, setUpdateInstalling] = useState(false);
  const [updateChecking, setUpdateChecking] = useState(false);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [loadPresetOpen, setLoadPresetOpen] = useState(false);
  const [importPrefsOpen, setImportPrefsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sidebarDrawer = useSidebarDrawerLayout();

  useEffect(() => {
    if (!sidebarDrawer) setMobileNavOpen(false);
  }, [sidebarDrawer]);

  const runUpdateCheck = useCallback(async (manual: boolean) => {
    if (isWeb) return;
    setUpdateChecking(true);
    try {
      const result = await checkForUpdate();
      setUpdateInfo(result);
      if (manual) setUpdateDismissed(false);
    } finally {
      setUpdateChecking(false);
    }
  }, [isWeb]);

  useEffect(() => {
    if (!isWeb) runUpdateCheck(false);
  }, [runUpdateCheck, isWeb]);

  useEffect(() => {
    if (isWeb && !isSectionVisibleOnWeb(section)) {
      setSection("general");
    }
  }, [isWeb, section]);

  useEffect(() => {
    if (!isWeb) return;
    if (scope !== "global") setScope("global");
    if (projectPath) setProjectPath("");
  }, [isWeb, scope, projectPath]);

  useEffect(() => {
    if (!isWeb) return;
    const prUrl = sessionStorage.getItem("gsd-oauth-pr-url");
    if (prUrl) {
      sessionStorage.removeItem("gsd-oauth-pr-url");
      setError(`Preset submitted — PR: ${prUrl}`);
    }
  }, [isWeb]);

  const installUpdate = async () => {
    if (!updateInfo?.handle) return;
    setUpdateInstalling(true);
    try {
      await downloadAndInstallUpdate(updateInfo.handle);
      // If relaunch() returns, something's off — leave the banner spinning
      // so the user knows install finished but relaunch didn't fire.
    } catch (e) {
      setError(`Update failed: ${String(e)}`);
      setUpdateInstalling(false);
    }
  };

  const activeProjectPath = isWeb ? undefined : scope === "project" ? projectPath : undefined;

  const persistWebDraft = useCallback(
    async (
      nextPrefs: GSDPreferences,
      nextModels: GSDModelsConfig,
      nextSettings: Record<string, unknown>,
    ) => {
      await backend.savePreferences(nextPrefs, undefined);
      await backend.saveModels(nextModels, 0, undefined);
      await backend.saveSettings(nextSettings, 0, undefined);
      setOriginalPrefs(JSON.stringify(nextPrefs));
      setOriginalModels(JSON.stringify(nextModels));
      setOriginalSettings(JSON.stringify(nextSettings));
    },
    [backend],
  );

  const markWebWorkspace = useCallback((label: string) => {
    setFilePath(label);
    writeWebWorkspaceLabel(label);
  }, []);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await backend.loadAll(activeProjectPath);
      setPrefs(data.preferences);
      setOriginalPrefs(JSON.stringify(data.preferences));
      setFilePath(data.filePath);
      setModelsDoc(data.models);
      setOriginalModels(JSON.stringify(data.models));
      setModelsMtime(data.modelsMtime);
      setSettingsDoc(data.settings);
      setOriginalSettings(JSON.stringify(data.settings));
      setSettingsMtime(data.settingsMtime);
      if (isWeb && !data.filePath) {
        const hasDraft =
          Object.keys(data.preferences).length > 0 ||
          Object.keys(data.models).length > 0 ||
          Object.keys(data.settings).length > 0;
        if (hasDraft) {
          const label = "Browser draft";
          setFilePath(label);
          writeWebWorkspaceLabel(label);
        }
      }
    } catch (e) {
      setError(String(e));
      setPrefs({});
      setOriginalPrefs("{}");
      setModelsDoc({});
      setOriginalModels("{}");
      setModelsMtime(0);
      setSettingsDoc({});
      setOriginalSettings("{}");
      setSettingsMtime(0);
    }
  }, [activeProjectPath, backend, isWeb]);

  useEffect(() => {
    // Only load when scope is global, or project with a valid path
    if (scope === "global" || (scope === "project" && projectPath)) {
      load();
    } else {
      setPrefs({});
      setOriginalPrefs("{}");
      setFilePath("");
    }
  }, [scope, projectPath, load]);

  const { isDirty, dirtySections, dirtyPaths } = useDirty(prefs, originalPrefs);

  // models.json dirty check — simple JSON-string compare since the doc is a
  // free-form registry shape and field-level paths don't make sense here.
  const isModelsDirty = useMemo(
    () => JSON.stringify(modelsDoc) !== originalModels,
    [modelsDoc, originalModels],
  );
  const isSettingsDirty = useMemo(
    () => JSON.stringify(settingsDoc) !== originalSettings,
    [settingsDoc, originalSettings],
  );
  const anyDirty = isDirty || isModelsDirty || isSettingsDirty;

  // Keep a ref to the latest any-doc dirty flag so the Tauri close-requested
  // handler, captured once on mount, always sees the current value.
  const isDirtyRef = useRef(anyDirty);
  useEffect(() => {
    isDirtyRef.current = anyDirty;
  }, [anyDirty]);

  const [paletteOpen, setPaletteOpen] = useState(false);

  const save = async () => {
    const count =
      dirtyPaths.length + (isModelsDirty ? 1 : 0) + (isSettingsDirty ? 1 : 0);
    setStatus("saving");
    setError("");

    if (isWeb) {
      if (!filePath) {
        setStatus("idle");
        return;
      }
      try {
        await persistWebDraft(prefs, modelsDoc, settingsDoc);
        downloadWorkspaceFiles({
          preferences: prefs,
          models: modelsDoc,
          settings: settingsDoc,
        });
        setSavedCount(count || 1);
        setStatus("saved");
        setTimeout(() => {
          setStatus("idle");
          setSavedCount(0);
        }, 2000);
      } catch (e) {
        setError(String(e));
        setStatus("error");
      }
      return;
    }

    const errs: string[] = [];

    // Preferences — independent failure domain. On failure, leave prefs
    // dirty so the user can retry without losing in-progress edits.
    if (isDirty) {
      try {
        await backend.savePreferences(prefs, activeProjectPath);
        setOriginalPrefs(JSON.stringify(prefs));
      } catch (e) {
        errs.push(`Preferences: ${String(e)}`);
      }
    }

    if (isModelsDirty) {
      try {
        const newMtime = await backend.saveModels(
          modelsDoc,
          modelsMtime,
          activeProjectPath,
        );
        setOriginalModels(JSON.stringify(modelsDoc));
        setModelsMtime(newMtime);
      } catch (e) {
        const msg = String(e);
        if (msg.includes("STALE:")) {
          errs.push(
            isWeb
              ? "Custom providers: draft was out of date. Reload the page and retry."
              : "Custom providers: file was changed on disk by GSD Pi. Reload the app to pick up external changes, then retry your edits.",
          );
        } else {
          errs.push(`Custom providers: ${msg}`);
        }
      }
    }

    // settings.json — independent failure domain. Raw round-trip: do NOT run
    // through cleanPrefs (would prune empty permission arrays etc.).
    if (isSettingsDirty) {
      try {
        await backend.saveSettings(
          settingsDoc,
          settingsMtime,
          activeProjectPath,
        );
        setOriginalSettings(JSON.stringify(settingsDoc));
        setSettingsMtime(Date.now());
      } catch (e) {
        const msg = String(e);
        if (msg.includes("STALE:")) {
          errs.push(
            isWeb
              ? "Agent settings: draft was out of date. Reload the page and retry."
              : "Agent settings: file was changed on disk by another process. Reload the app to pick up external changes, then retry your edits.",
          );
        } else {
          errs.push(`Agent settings: ${msg}`);
        }
      }
    }

    if (errs.length > 0) {
      setError(errs.join("\n"));
      setStatus("error");
    } else {
      setSavedCount(count);
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
        setSavedCount(0);
      }, 2000);
    }
  };

  const reset = () => {
    setPrefs(JSON.parse(originalPrefs));
    setModelsDoc(JSON.parse(originalModels));
    setSettingsDoc(JSON.parse(originalSettings));
  };

  const [shareOpen, setShareOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");

  const applyLoadedPreset = (
    loaded: GSDPreferences,
    meta?: { title?: string; slug?: string; description?: string },
  ) => {
    if (anyDirty) {
      const ok = confirm(
        "You have unsaved changes. Replace the current configuration with this preset?",
      );
      if (!ok) return;
    }
    setPrefs(loaded);
    if (isWeb) {
      const label = meta?.title
        ? `Preset: ${meta.title}`
        : meta?.slug
          ? `Preset: ${meta.slug}`
          : "Loaded preset";
      markWebWorkspace(label);
      if (meta) {
        writeWebDraftMeta({
          title: meta.title,
          description: meta.description,
          sourcePresetSlug: meta.slug,
        });
      }
      void persistWebDraft(loaded, modelsDoc, settingsDoc);
    } else if (meta) {
      writeWebDraftMeta({
        title: meta.title,
        description: meta.description,
        sourcePresetSlug: meta.slug,
      });
    }
    setError("");
  };

  const applyImportedWorkspace = (data: ImportedWorkspace) => {
    if (anyDirty) {
      const ok = confirm(
        isWeb
          ? "You have unsaved changes. Replace the current editor session with imported files?"
          : "You have unsaved changes. Replace the current workspace with imported files?",
      );
      if (!ok) return;
    }
    const nextPrefs = data.preferences ?? prefs;
    const nextModels = data.models ?? modelsDoc;
    const nextSettings = data.settings ?? settingsDoc;
    setPrefs(nextPrefs);
    setModelsDoc(nextModels);
    setSettingsDoc(nextSettings);
    const names = [
      data.preferencesFileName,
      data.modelsFileName,
      data.settingsFileName,
    ].filter(Boolean);
    const label = names.length > 0 ? `Imported: ${names.join(", ")}` : "Imported configuration";
    if (isWeb) {
      markWebWorkspace(label);
      void persistWebDraft(nextPrefs, nextModels, nextSettings);
    } else if (names.length > 0) {
      setFilePath(`Imported: ${names.join(", ")}`);
    }
    setError("");
  };

  const exportPreset = async () => {
    try {
      setError("");
      await backend.exportPresetDialog(prefs);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError(String(e));
    }
  };

  const sharePreset = async () => {
    try {
      setError("");
      const content = await backend.buildShareablePreset(prefs);
      setShareContent(content);
      setShareOpen(true);
    } catch (e) {
      setError(String(e));
    }
  };

  // Keep refs for shortcuts so handlers don't need to be re-memoized per render
  const saveRef = useRef(save);
  const resetRef = useRef(reset);
  useEffect(() => {
    saveRef.current = save;
    resetRef.current = reset;
  });

  const shortcutCtx = useRef<{
    section: SectionId;
    setSection: (s: SectionId) => void;
    setPaletteOpen: (v: boolean) => void;
    filePath: string;
  }>({ section, setSection, setPaletteOpen, filePath: "" });
  useEffect(() => {
    shortcutCtx.current = { section, setSection, setPaletteOpen, filePath };
  });

  // ⌘K palette · ⌘S save · ⌘⇧Z discard · [/] section prev/next
  useShortcuts([
    {
      id: "palette",
      key: "k",
      mod: true,
      allowInInput: true,
      handler: (ev) => {
        ev.preventDefault();
        shortcutCtx.current.setPaletteOpen(true);
      },
    },
    {
      id: "save",
      key: "s",
      mod: true,
      handler: (ev) => {
        ev.preventDefault();
        if (isWeb) {
          if (shortcutCtx.current.filePath) saveRef.current();
          return;
        }
        if (isDirtyRef.current) saveRef.current();
      },
    },
    {
      id: "discard",
      key: "z",
      mod: true,
      shift: true,
      handler: (ev) => {
        ev.preventDefault();
        if (isDirtyRef.current) resetRef.current();
      },
    },
    {
      id: "section-next",
      key: "]",
      handler: (ev) => {
        ev.preventDefault();
        const sections = visibleSections;
        const cur = sections.findIndex((s) => s.id === shortcutCtx.current.section);
        const next = sections[(cur + 1) % sections.length];
        if (next) shortcutCtx.current.setSection(next.id);
      },
    },
    {
      id: "section-prev",
      key: "[",
      handler: (ev) => {
        ev.preventDefault();
        const sections = visibleSections;
        const cur = sections.findIndex((s) => s.id === shortcutCtx.current.section);
        const prev = sections[(cur - 1 + sections.length) % sections.length];
        if (prev) shortcutCtx.current.setSection(prev.id);
      },
    },
  ]);

  // ⌘K → field focus: when the palette picks a field, scroll it into view and
  // flash a ring on the row. The section must render first (pendingFocus is
  // set alongside setSection), so we defer to the next frame before querying
  // the DOM. data-field-path lives on the Field wrapper in FormControls.tsx.
  useEffect(() => {
    if (!pendingFocus) return;
    const path = pendingFocus;
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-field-path="${CSS.escape(path)}"]`,
      );
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("gsd-field-focus");
        window.setTimeout(() => el.classList.remove("gsd-field-focus"), 1500);
      }
      setPendingFocus(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [pendingFocus, section]);

  // Window close guard — prompt before closing with unsaved changes
  useCloseRequested(
    async (event) => {
      if (isWeb || !isDirtyRef.current) return;
      const ok = confirm("You have unsaved changes. Close anyway?");
      if (!ok) event.preventDefault();
    },
    [isWeb],
  );

  const browseProject = async () => {
    try {
      const selected = await backend.pickProjectDirectory?.();
      if (selected) {
        setProjectPath(selected);
        localStorage.setItem(LAST_PROJECT_KEY, selected);

        // Update recent projects (most recent first, max 5)
        const updated = [selected, ...recentProjects.filter((p) => p !== selected)].slice(0, 5);
        setRecentProjects(updated);
        saveRecentProjects(updated);
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const selectScope = (s: Scope) => {
    if (anyDirty) {
      const ok = confirm("You have unsaved changes. Discard them and switch scope?");
      if (!ok) return;
    }
    setScope(s);
    localStorage.setItem(LAST_SCOPE_KEY, s);
  };

  const selectRecentProject = (path: string) => {
    if (anyDirty) {
      const ok = confirm("You have unsaved changes. Discard them and switch project?");
      if (!ok) return;
    }
    setProjectPath(path);
    localStorage.setItem(LAST_PROJECT_KEY, path);
  };

  const shortPath = (p: string) => {
    const parts = p.split("/");
    return parts[parts.length - 1] || p;
  };

  const renderSection = () =>
    renderPreferencesSection(section, {
      prefs,
      onChange: setPrefs,
      projectPath: projectPath || undefined,
      modelsDoc,
      onModelsChange: setModelsDoc,
      settingsDoc,
      onSettingsChange: setSettingsDoc,
      isWeb,
    });

  // These sections are independent of preferences load state
  const isLibrarySection =
    section === "skills-library" || section === "agents-library" || section === "api-keys";
  // Library sections with split panes need fixed-height flex layout
  const needsFixedHeight = section === "skills-library" || section === "agents-library";
  const isSkillsLibrary = isLibrarySection;

  const needsProjectSelection = !isWeb && scope === "project" && !projectPath;
  const webWorkspaceReady = !isWeb || filePath.length > 0;

  const selectSection = (id: SectionId) => {
    setSection(id);
    setMobileNavOpen(false);
  };

  const shell = (
    <div
      className={`relative flex overflow-hidden ${
        isWeb ? "flex-1 min-h-0 h-full" : "h-screen"
      }`}
    >
      <Palette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        sectionGroups={sectionGroups}
        onNavigate={(target, fieldPath) => {
          setSection(target);
          if (fieldPath) setPendingFocus(fieldPath);
        }}
      />
      <ShareModal
        open={shareOpen}
        content={shareContent}
        onClose={() => setShareOpen(false)}
      />
      <ImportPreferencesModal
        open={importPrefsOpen}
        onClose={() => setImportPrefsOpen(false)}
        onImport={applyImportedWorkspace}
        variant={isWeb ? "web" : "desktop"}
        pickPreferencesFile={
          backend.id === "tauri" ? tauriPickPreferencesForImport : undefined
        }
        pickModelsFile={backend.id === "tauri" ? tauriPickModelsForImport : undefined}
        pickSettingsFile={backend.id === "tauri" ? tauriPickSettingsForImport : undefined}
      />
      <LoadPresetModal
        open={loadPresetOpen}
        onClose={() => setLoadPresetOpen(false)}
        onLoaded={applyLoadedPreset}
      />
      {isWeb && (
        <SubmitPresetModal
          open={submitOpen}
          prefs={prefs}
          onClose={() => setSubmitOpen(false)}
        />
      )}
      {sidebarDrawer && mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-x-0 bottom-0 z-30 bg-black/50 top-[var(--gsd-shell-offset,3.5rem)]"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <Sidebar
        active={section}
        onSelect={selectSection}
        variant={isWeb ? "web" : "desktop"}
        dirtySections={dirtySections}
        sectionGroups={sectionGroups}
        className={`gsd-sidebar-drawer w-56 shrink-0 transition-transform duration-200 ease-out ${
          sidebarDrawer
            ? `fixed left-0 bottom-0 z-40 ${
                mobileNavOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative z-0"
        }`}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor toolbar — hidden on web until a workspace is loaded */}
        {(!isWeb || webWorkspaceReady) && !isSkillsLibrary && (
        <header className="gsd-local-chrome flex-wrap justify-between gap-3 px-4 bg-gsd-surface-solid/80 sm:px-6">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {sidebarDrawer && (
              <button
                type="button"
                className={`${btn} shrink-0`}
                aria-label="Open sections menu"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                Sections
              </button>
            )}
            {isWeb && !sidebarDrawer && (
              <h1 className="text-sm font-semibold text-gsd-text truncate">
                {sectionLabel(section, sectionGroups)}
              </h1>
            )}
            {/* Scope pill — desktop only (web cannot open local project folders) */}
            {!isWeb && (
              <div className={segmentGroup}>
                <button
                  type="button"
                  onClick={() => selectScope("global")}
                  className={`text-xs font-medium ${
                    scope === "global" ? btnSegmentActive : btnSegment
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => selectScope("project")}
                  className={`text-xs font-medium ${
                    scope === "project" ? btnSegmentActive : btnSegment
                  }`}
                >
                  Project
                </button>
              </div>
            )}

            {/* Project picker (when project scope active) */}
            {!isWeb && scope === "project" && (
              <div className="flex items-center gap-2 min-w-0">
                <button type="button" onClick={browseProject} className={`${btn} shrink-0`}>
                  Browse...
                </button>
                {projectPath && (
                  <span className="text-xs text-gsd-text truncate font-medium" title={projectPath}>
                    {shortPath(projectPath)}
                  </span>
                )}
                {recentProjects.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      if (v === "__clear__") {
                        setRecentProjects([]);
                        saveRecentProjects([]);
                        return;
                      }
                      selectRecentProject(v);
                    }}
                    className="text-xs max-w-40"
                  >
                    <option value="">Recent...</option>
                    {recentProjects.map((p) => (
                      <option key={p} value={p}>
                        {shortPath(p)}
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="__clear__">Clear recent projects</option>
                  </select>
                )}
              </div>
            )}

            {/* File path (when loaded) */}
            {filePath && !needsProjectSelection && !isWeb && (
              <div className="text-xs text-gsd-text-dim truncate max-w-md" title={filePath}>
                {filePath}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto shrink-0">
              {!isWeb && (
                <>
                  <button
                    type="button"
                    onClick={() => runUpdateCheck(true)}
                    disabled={updateChecking || updateInstalling}
                    title="Check for app updates"
                    className={btn}
                  >
                    {updateChecking ? "Checking..." : "Updates"}
                  </button>
                  <ThemeToggle />
                  <div className="w-px h-5 bg-gsd-border mx-1" aria-hidden />
                </>
              )}
              <button
                type="button"
                onClick={() => setImportPrefsOpen(true)}
                disabled={needsProjectSelection}
                title="Import preferences.md and optional models.json and settings.json from your computer"
                className={btn}
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => setLoadPresetOpen(true)}
                disabled={needsProjectSelection}
                title="Load a preset from the gallery or a .preset.md file"
                className={btn}
              >
                Load preset
              </button>
              {!isWeb && (
                <button
                  type="button"
                  onClick={exportPreset}
                  disabled={needsProjectSelection}
                  title="Export current preferences to a .preset.md file"
                  className={btn}
                >
                  Export
                </button>
              )}
              <button
                type="button"
                onClick={sharePreset}
                disabled={needsProjectSelection}
                title="Copy a redacted shareable YAML block to clipboard"
                className={btn}
              >
                Share
              </button>
              {isWeb && (
                <>
                  <button
                    type="button"
                    onClick={exportPreset}
                    disabled={needsProjectSelection}
                    title="Export as .preset.md"
                    className={btn}
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitOpen(true)}
                    disabled={needsProjectSelection}
                    className={btn}
                  >
                    Submit
                  </button>
                </>
              )}
              {anyDirty && (
                <>
                  <div className="w-px h-5 bg-gsd-border mx-1 hidden sm:block" aria-hidden />
                  <button type="button" onClick={reset} className={btn}>
                    Discard
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={save}
                disabled={
                  status === "saving" ||
                  needsProjectSelection ||
                  (isWeb ? !webWorkspaceReady : !anyDirty)
                }
                title={
                  isWeb
                    ? "Download preferences.md, models.json, and settings.json to your computer"
                    : undefined
                }
                className={`tabular-nums ${
                  (isWeb ? webWorkspaceReady : anyDirty) && !needsProjectSelection
                    ? btnPrimary
                    : `${btn} !bg-gsd-border !text-gsd-text-dim !border-transparent`
                }`}
              >
                {status === "saving"
                  ? isWeb
                    ? "Downloading…"
                    : "Saving..."
                  : status === "saved"
                  ? isWeb
                    ? "Downloaded"
                    : savedCount > 0
                      ? `Saved ${savedCount} change${savedCount === 1 ? "" : "s"}`
                      : "Saved"
                  : isWeb
                    ? "Download"
                    : "Save"}
              </button>
            </div>
        </header>
        )}

        {/* Update banner — shown when a newer version is available and the
            user hasn't dismissed it this session. Install is explicit; we
            never auto-download. */}
        {updateInfo?.available && !updateDismissed && !isWeb && (
          <div className="px-6 py-2 bg-gsd-accent/10 border-b border-gsd-accent/30 text-xs flex items-center justify-between gap-3">
            <span className="text-gsd-text">
              {updateInstalling
                ? `Installing v${updateInfo.version}… the app will relaunch when done.`
                : `Update available: v${updateInfo.version}. Install now to relaunch with the new version.`}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {!updateInstalling && (
                <>
                  <button type="button" onClick={() => setUpdateDismissed(true)} className={btn}>
                    Later
                  </button>
                  <button type="button" onClick={installUpdate} className={btnPrimary}>
                    Install &amp; restart
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="px-6 py-2 bg-gsd-danger/10 border-b border-gsd-danger/30 text-gsd-danger text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-2 hover:text-red-300">dismiss</button>
          </div>
        )}

        {/* Content */}
        <main
          className={`flex-1 min-w-0 px-4 py-4 sm:px-6 sm:py-5 ${
            needsFixedHeight
              ? "overflow-hidden flex flex-col"
              : "overflow-y-auto"
          }`}
        >
          {isWeb && !webWorkspaceReady ? (
            <WebStartPanel
              onUpload={() => setImportPrefsOpen(true)}
              onLoadPreset={() => setLoadPresetOpen(true)}
            />
          ) : needsProjectSelection && !isLibrarySection ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">📁</div>
              <h2 className="text-lg font-semibold text-gsd-text mb-2">No project selected</h2>
              <p className="text-sm text-gsd-text-dim mb-4 max-w-md">
                Browse to a project folder to edit its <code className="text-xs bg-gsd-surface px-1.5 py-0.5 rounded">.gsd/preferences.md</code> file.
              </p>
              <button type="button" onClick={browseProject} className={btnPrimary}>
                Browse for Project...
              </button>
            </div>
          ) : (
            renderSection()
          )}
        </main>
      </div>
    </div>
  );

  if (isWeb) {
    return (
      <WebShell active="editor" workspaceLabel={filePath || undefined}>
        {shell}
      </WebShell>
    );
  }

  return shell;
}
