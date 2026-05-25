// GSD Pi Config - Tauri desktop backend
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
import { cleanPrefs } from "../lib/cleanPrefs";
import type { AgentInfo } from "../components/sections/AgentsLibrarySection";
import type { SkillInfo } from "../components/sections/SkillsLibrarySection";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import type { ConfigBackend, KeyStatus, LoadAllResult } from "./backend";
import {
  tauriExportPresetDialog,
  tauriImportPresetDialog,
  tauriLoadAll,
  tauriSaveModels,
  tauriSavePreferences,
  tauriSaveSettings,
} from "./tauri";

export const tauriBackend: ConfigBackend = {
  id: "tauri",
  isWeb: () => false,
  canCheckCli: () => true,

  async openUrl(url: string): Promise<void> {
    await openUrl(url);
  },

  async loadAll(projectPath?: string): Promise<LoadAllResult> {
    return tauriLoadAll(projectPath);
  },

  async savePreferences(prefs: GSDPreferences, projectPath?: string): Promise<void> {
    await tauriSavePreferences(prefs, projectPath);
  },

  async saveModels(
    models: GSDModelsConfig,
    expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<number> {
    return tauriSaveModels(models, expectedMtimeMs, projectPath);
  },

  async saveSettings(
    settings: Record<string, unknown>,
    expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<void> {
    await tauriSaveSettings(settings, expectedMtimeMs, projectPath);
  },

  async importPresetDialog(): Promise<GSDPreferences | null> {
    return tauriImportPresetDialog();
  },

  async exportPresetDialog(prefs: GSDPreferences): Promise<void> {
    await tauriExportPresetDialog(prefs);
  },

  async buildShareablePreset(prefs: GSDPreferences): Promise<string> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    return invoke<string>("build_shareable_preset", { preferences: cleaned });
  },

  async listSkills(projectPath?: string): Promise<SkillInfo[]> {
    const args = projectPath ? { projectPath } : {};
    return invoke<SkillInfo[]>("list_skills", args);
  },

  async readSkill(path: string): Promise<string> {
    return invoke<string>("read_skill", { path });
  },

  async writeSkill(path: string, content: string): Promise<void> {
    await invoke("write_skill", { path, content });
  },

  async createSkill(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<SkillInfo> {
    const args: { name: string; scope: string; projectPath?: string } = {
      name,
      scope,
    };
    if (scope === "project" && projectPath) args.projectPath = projectPath;
    return invoke<SkillInfo>("create_skill", args);
  },

  async deleteSkill(path: string): Promise<void> {
    await invoke("delete_skill", { path });
  },

  async listAgents(projectPath?: string): Promise<AgentInfo[]> {
    const args = projectPath ? { projectPath } : {};
    return invoke<AgentInfo[]>("list_agents", args);
  },

  async readAgent(path: string): Promise<string> {
    return invoke<string>("read_agent", { path });
  },

  async writeAgent(path: string, content: string): Promise<void> {
    await invoke("write_agent", { path, content });
  },

  async createAgent(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<AgentInfo> {
    const args: { name: string; scope: string; projectPath?: string } = {
      name,
      scope,
    };
    if (scope === "project" && projectPath) args.projectPath = projectPath;
    return invoke<AgentInfo>("create_agent", args);
  },

  async deleteAgent(path: string): Promise<void> {
    await invoke("delete_agent", { path });
  },

  async listKeyStatuses(names: string[]): Promise<KeyStatus[]> {
    return invoke<KeyStatus[]>("list_key_statuses", { names });
  },

  async getKey(name: string): Promise<string | null> {
    return invoke<string | null>("get_key", { name });
  },

  async setKey(name: string, value: string): Promise<void> {
    await invoke("set_key", { name, value });
  },

  async deleteKey(name: string): Promise<void> {
    await invoke("delete_key", { name });
  },

  async exportEnvFile(names: string[]): Promise<string> {
    return invoke<string>("export_env_file", { names });
  },

  async checkCliInstalled(binary: string): Promise<boolean> {
    return invoke<boolean>("check_cli_installed", { binary });
  },

  async pickProjectDirectory(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Project Folder",
    });
    return typeof selected === "string" && selected ? selected : null;
  },
};
