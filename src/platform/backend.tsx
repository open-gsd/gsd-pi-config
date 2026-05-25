// GSD Pi Config - Platform backend (desktop Tauri vs web storage)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { createContext, useContext, type ReactNode } from "react";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import type { AgentInfo } from "../components/sections/AgentsLibrarySection";
import type { SkillInfo } from "../components/sections/SkillsLibrarySection";

export interface KeyStatus {
  name: string;
  is_set: boolean;
  preview: string | null;
}

export interface LoadAllResult {
  preferences: GSDPreferences;
  filePath: string;
  models: GSDModelsConfig;
  modelsMtime: number;
  settings: Record<string, unknown>;
  settingsMtime: number;
}

export interface ConfigBackend {
  readonly id: "tauri" | "web";
  isWeb(): boolean;
  canCheckCli(): boolean;
  openUrl(url: string): Promise<void>;

  loadAll(projectPath?: string): Promise<LoadAllResult>;
  savePreferences(prefs: GSDPreferences, projectPath?: string): Promise<void>;
  saveModels(
    models: GSDModelsConfig,
    expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<number>;
  saveSettings(
    settings: Record<string, unknown>,
    expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<void>;

  importPresetDialog(): Promise<GSDPreferences | null>;
  exportPresetDialog(prefs: GSDPreferences): Promise<void>;
  buildShareablePreset(prefs: GSDPreferences): Promise<string>;

  listSkills(projectPath?: string): Promise<SkillInfo[]>;
  readSkill(path: string): Promise<string>;
  writeSkill(path: string, content: string): Promise<void>;
  createSkill(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<SkillInfo>;
  deleteSkill(path: string): Promise<void>;

  listAgents(projectPath?: string): Promise<AgentInfo[]>;
  readAgent(path: string): Promise<string>;
  writeAgent(path: string, content: string): Promise<void>;
  createAgent(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<AgentInfo>;
  deleteAgent(path: string): Promise<void>;

  listKeyStatuses(names: string[]): Promise<KeyStatus[]>;
  getKey(name: string): Promise<string | null>;
  setKey(name: string, value: string): Promise<void>;
  deleteKey(name: string): Promise<void>;
  exportEnvFile(names: string[]): Promise<string>;
  checkCliInstalled(binary: string): Promise<boolean>;

  pickProjectDirectory?(): Promise<string | null>;
}

const ConfigBackendContext = createContext<ConfigBackend | null>(null);

export function ConfigBackendProvider({
  backend,
  children,
}: {
  backend: ConfigBackend;
  children: ReactNode;
}) {
  return (
    <ConfigBackendContext.Provider value={backend}>
      {children}
    </ConfigBackendContext.Provider>
  );
}

export function useConfigBackend(): ConfigBackend {
  const ctx = useContext(ConfigBackendContext);
  if (!ctx) throw new Error("useConfigBackend requires ConfigBackendProvider");
  return ctx;
}
