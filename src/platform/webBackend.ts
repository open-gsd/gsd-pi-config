// GSD Pi Config - Web backend (in-browser draft; download to install on disk)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { cleanPrefs } from "../lib/cleanPrefs";
import {
  buildShareablePreset,
  loadPreferencesFromText,
  serializePreferences,
} from "../lib/preferencesCore";
import type { AgentInfo } from "../components/sections/AgentsLibrarySection";
import type { SkillInfo } from "../components/sections/SkillsLibrarySection";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import { readWebWorkspaceLabel } from "./web";
import type { ConfigBackend, KeyStatus, LoadAllResult } from "./backend";

const STORE_VERSION = "v1";
const KEYS_STORE = "gsd-pi-config.web.keys";

type ScopeKind = "global" | "project";

interface StoredSkill {
  name: string;
  description: string;
  scope: string;
  dir_name: string;
  content: string;
}

interface StoredAgent {
  name: string;
  description: string;
  scope: string;
  file_name: string;
  content: string;
}

function scopeKey(scope: ScopeKind, projectPath?: string): string {
  if (scope === "global") return "global";
  return `project:${encodeURIComponent(projectPath ?? "")}`;
}

function docKey(
  kind: "preferences" | "models" | "settings",
  scope: ScopeKind,
  projectPath?: string,
): string {
  return `gsd-pi-config.web.${STORE_VERSION}.${scopeKey(scope, projectPath)}.${kind}`;
}

function libraryKey(
  kind: "skills" | "agents",
  scope: ScopeKind,
  projectPath?: string,
): string {
  return `gsd-pi-config.web.${STORE_VERSION}.${scopeKey(scope, projectPath)}.${kind}`;
}

function webPath(
  scope: string,
  kind: "skills" | "agents",
  id: string,
  file: string,
): string {
  return `web://${scope}/${kind}/${id}/${file}`;
}

function parseWebPath(path: string): {
  scopeKey: string;
  kind: "skills" | "agents";
  id: string;
} | null {
  const m = path.match(/^web:\/\/([^/]+)\/(skills|agents)\/([^/]+)\//);
  if (!m) return null;
  return { scopeKey: m[1], kind: m[2] as "skills" | "agents", id: m[3] };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadKeys(): Record<string, string> {
  return readJson<Record<string, string>>(KEYS_STORE, {});
}

function saveKeys(keys: Record<string, string>): void {
  writeJson(KEYS_STORE, keys);
}

function displayPath(): string {
  return readWebWorkspaceLabel();
}

function sanitizeDirName(name: string): string {
  const dir = name
    .toLowerCase()
    .split("")
    .map((c) => (/[a-z0-9_-]/.test(c) ? c : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return dir || "skill";
}

function parseSkillMeta(content: string, fallbackName: string): {
  name: string;
  description: string;
} {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return { name: fallbackName, description: "" };
  const body = fm[1];
  const nameM = body.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  const descM = body.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  return {
    name: nameM?.[1]?.trim() ?? fallbackName,
    description: descM?.[1]?.trim() ?? "",
  };
}

export const webBackend: ConfigBackend = {
  id: "web",
  isWeb: () => true,
  canCheckCli: () => false,

  async openUrl(url: string): Promise<void> {
    window.open(url, "_blank", "noopener,noreferrer");
  },

  async loadAll(projectPath?: string): Promise<LoadAllResult> {
    const scope: ScopeKind = projectPath ? "project" : "global";
    const prefs = readJson<GSDPreferences>(docKey("preferences", scope, projectPath), {});
    const models = readJson<GSDModelsConfig>(docKey("models", scope, projectPath), {});
    const settings = readJson<Record<string, unknown>>(
      docKey("settings", scope, projectPath),
      {},
    );
    return {
      preferences: prefs,
      filePath: displayPath(),
      models,
      modelsMtime: 1,
      settings,
      settingsMtime: 1,
    };
  },

  async savePreferences(prefs: GSDPreferences, projectPath?: string): Promise<void> {
    const scope: ScopeKind = projectPath ? "project" : "global";
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    writeJson(docKey("preferences", scope, projectPath), cleaned);
  },

  async saveModels(
    models: GSDModelsConfig,
    _expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<number> {
    const scope: ScopeKind = projectPath ? "project" : "global";
    writeJson(docKey("models", scope, projectPath), models);
    return Date.now();
  },

  async saveSettings(
    settings: Record<string, unknown>,
    _expectedMtimeMs: number,
    projectPath?: string,
  ): Promise<void> {
    const scope: ScopeKind = projectPath ? "project" : "global";
    writeJson(docKey("settings", scope, projectPath), settings);
  },

  async importPresetDialog(): Promise<GSDPreferences | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md,.preset.md";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        try {
          resolve(loadPreferencesFromText(await file.text()));
        } catch {
          resolve(null);
        }
      };
      input.click();
    });
  },

  async exportPresetDialog(prefs: GSDPreferences): Promise<void> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    const markdown = serializePreferences(cleaned as GSDPreferences);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gsd.preset.md";
    a.click();
    URL.revokeObjectURL(url);
  },

  async buildShareablePreset(prefs: GSDPreferences): Promise<string> {
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>);
    return buildShareablePreset(cleaned as GSDPreferences);
  },

  async listSkills(projectPath?: string): Promise<SkillInfo[]> {
    const results: SkillInfo[] = [];
    const scopes: { scope: ScopeKind; path?: string; label: string }[] = [
      { scope: "global", label: "global" },
    ];
    if (projectPath) {
      scopes.push({ scope: "project", path: projectPath, label: "project" });
    }
    for (const { scope, path, label } of scopes) {
      const store = readJson<Record<string, StoredSkill>>(
        libraryKey("skills", scope, path),
        {},
      );
      for (const [dirName, s] of Object.entries(store)) {
        const sk = scopeKey(scope, path);
        const p = webPath(sk, "skills", dirName, "SKILL.md");
        results.push({
          id: p,
          name: s.name,
          description: s.description,
          scope: label,
          path: p,
          dir_name: s.dir_name,
        });
      }
    }
    return results.sort((a, b) =>
      b.scope.localeCompare(a.scope) ||
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
  },

  async readSkill(path: string): Promise<string> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid skill path: ${path}`);
    const store = readJson<Record<string, StoredSkill>>(
      libraryKey(
        "skills",
        parsed.scopeKey.startsWith("project:") ? "project" : "global",
        parsed.scopeKey.startsWith("project:")
          ? decodeURIComponent(parsed.scopeKey.slice(8))
          : undefined,
      ),
      {},
    );
    const skill = store[parsed.id];
    if (!skill) throw new Error(`Skill not found: ${path}`);
    return skill.content;
  },

  async writeSkill(path: string, content: string): Promise<void> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid skill path: ${path}`);
    const isProject = parsed.scopeKey.startsWith("project:");
    const projectPath = isProject
      ? decodeURIComponent(parsed.scopeKey.slice(8))
      : undefined;
    const key = libraryKey("skills", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredSkill>>(key, {});
    const existing = store[parsed.id];
    const meta = parseSkillMeta(content, existing?.name ?? parsed.id);
    store[parsed.id] = {
      ...existing,
      name: meta.name,
      description: meta.description,
      scope: isProject ? "project" : "global",
      dir_name: parsed.id,
      content,
    };
    writeJson(key, store);
  },

  async createSkill(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<SkillInfo> {
    const dirName = sanitizeDirName(name);
    const isProject = scope === "project";
    const key = libraryKey("skills", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredSkill>>(key, {});
    if (store[dirName]) throw new Error(`Skill '${dirName}' already exists`);
    const template = `---\nname: ${name}\ndescription: Short description of what this skill does and when to use it.\n---\n\n# ${name}\n\nDescribe the skill here.\n`;
    store[dirName] = {
      name,
      description: "Short description of what this skill does and when to use it.",
      scope,
      dir_name: dirName,
      content: template,
    };
    writeJson(key, store);
    const sk = scopeKey(isProject ? "project" : "global", projectPath);
    const path = webPath(sk, "skills", dirName, "SKILL.md");
    return {
      id: path,
      name,
      description: store[dirName].description,
      scope,
      path,
      dir_name: dirName,
    };
  },

  async deleteSkill(path: string): Promise<void> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid skill path: ${path}`);
    const isProject = parsed.scopeKey.startsWith("project:");
    const projectPath = isProject
      ? decodeURIComponent(parsed.scopeKey.slice(8))
      : undefined;
    const key = libraryKey("skills", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredSkill>>(key, {});
    delete store[parsed.id];
    writeJson(key, store);
  },

  async listAgents(projectPath?: string): Promise<AgentInfo[]> {
    const results: AgentInfo[] = [];
    const scopes: { scope: ScopeKind; path?: string; label: string }[] = [
      { scope: "global", label: "global" },
    ];
    if (projectPath) {
      scopes.push({ scope: "project", path: projectPath, label: "project" });
    }
    for (const { scope, path, label } of scopes) {
      const store = readJson<Record<string, StoredAgent>>(
        libraryKey("agents", scope, path),
        {},
      );
      for (const [fileName, a] of Object.entries(store)) {
        const sk = scopeKey(scope, path);
        const p = webPath(sk, "agents", fileName.replace(/\.md$/, ""), a.file_name);
        results.push({
          id: p,
          name: a.name,
          description: a.description,
          scope: label,
          path: p,
          file_name: a.file_name,
        });
      }
    }
    return results.sort((a, b) =>
      b.scope.localeCompare(a.scope) ||
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
  },

  async readAgent(path: string): Promise<string> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid agent path: ${path}`);
    const isProject = parsed.scopeKey.startsWith("project:");
    const projectPath = isProject
      ? decodeURIComponent(parsed.scopeKey.slice(8))
      : undefined;
    const store = readJson<Record<string, StoredAgent>>(
      libraryKey("agents", isProject ? "project" : "global", projectPath),
      {},
    );
    const agent = store[parsed.id] ?? store[`${parsed.id}.md`];
    if (!agent) throw new Error(`Agent not found: ${path}`);
    return agent.content;
  },

  async writeAgent(path: string, content: string): Promise<void> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid agent path: ${path}`);
    const isProject = parsed.scopeKey.startsWith("project:");
    const projectPath = isProject
      ? decodeURIComponent(parsed.scopeKey.slice(8))
      : undefined;
    const key = libraryKey("agents", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredAgent>>(key, {});
    const fileName = `${parsed.id}.md`;
    const existing = store[parsed.id] ?? store[fileName];
    const meta = parseSkillMeta(content, existing?.name ?? parsed.id);
    store[parsed.id] = {
      name: meta.name,
      description: meta.description,
      scope: isProject ? "project" : "global",
      file_name: fileName,
      content,
    };
    writeJson(key, store);
  },

  async createAgent(
    name: string,
    scope: string,
    projectPath?: string,
  ): Promise<AgentInfo> {
    const fileName = `${sanitizeDirName(name)}.md`;
    const id = fileName.replace(/\.md$/, "");
    const isProject = scope === "project";
    const key = libraryKey("agents", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredAgent>>(key, {});
    if (store[id]) throw new Error(`Agent '${id}' already exists`);
    const template = `---\nname: ${name}\ndescription: What this subagent does.\n---\n\n# ${name}\n`;
    store[id] = {
      name,
      description: "What this subagent does.",
      scope,
      file_name: fileName,
      content: template,
    };
    writeJson(key, store);
    const sk = scopeKey(isProject ? "project" : "global", projectPath);
    const path = webPath(sk, "agents", id, fileName);
    return {
      id: path,
      name,
      description: store[id].description,
      scope,
      path,
      file_name: fileName,
    };
  },

  async deleteAgent(path: string): Promise<void> {
    const parsed = parseWebPath(path);
    if (!parsed) throw new Error(`Invalid agent path: ${path}`);
    const isProject = parsed.scopeKey.startsWith("project:");
    const projectPath = isProject
      ? decodeURIComponent(parsed.scopeKey.slice(8))
      : undefined;
    const key = libraryKey("agents", isProject ? "project" : "global", projectPath);
    const store = readJson<Record<string, StoredAgent>>(key, {});
    delete store[parsed.id];
    writeJson(key, store);
  },

  async listKeyStatuses(names: string[]): Promise<KeyStatus[]> {
    const keys = loadKeys();
    return names.map((name) => {
      const v = keys[name];
      if (!v) {
        return { name, is_set: false, preview: null };
      }
      const preview =
        v.length > 4 ? `…${v.slice(-4)}` : "…";
      return { name, is_set: true, preview };
    });
  },

  async getKey(name: string): Promise<string | null> {
    return loadKeys()[name] ?? null;
  },

  async setKey(name: string, value: string): Promise<void> {
    const keys = loadKeys();
    if (!value) {
      delete keys[name];
    } else {
      keys[name] = value;
    }
    saveKeys(keys);
  },

  async deleteKey(name: string): Promise<void> {
    const keys = loadKeys();
    delete keys[name];
    saveKeys(keys);
  },

  async exportEnvFile(names: string[]): Promise<string> {
    const keys = loadKeys();
    const lines = [
      "#!/usr/bin/env bash",
      "# Generated by GSD Pi Config (web) — copy to ~/.gsd/env.sh on your machine.",
      "",
    ];
    for (const name of names) {
      const v = keys[name];
      if (v) {
        const escaped = v.replace(/'/g, "'\\''");
        lines.push(`export ${name}='${escaped}'`);
      }
    }
    const body = lines.join("\n") + "\n";
    const blob = new Blob([body], { type: "text/x-sh;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "env.sh";
    a.click();
    URL.revokeObjectURL(url);
    return "~/.gsd/env.sh (downloaded)";
  },

  async checkCliInstalled(): Promise<boolean> {
    return false;
  },

  async pickProjectDirectory(): Promise<string | null> {
    try {
      if ("showDirectoryPicker" in window) {
        const handle = await (
          window as Window & {
            showDirectoryPicker?: () => Promise<{ name: string }>;
          }
        ).showDirectoryPicker?.();
        if (handle?.name) return handle.name;
      }
    } catch {
      // user cancelled
    }
    const manual = window.prompt(
      "Project label or path (used to namespace browser-stored project config):",
    );
    return manual?.trim() || null;
  },
};
