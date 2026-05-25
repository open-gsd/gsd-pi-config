// GSD Pi Config - pi-coding-agent settings.json types (mirrors settings-manager.ts)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type TransportSetting = "sse" | "websocket" | "auto";
export type SteeringMode = "all" | "one-at-a-time";
export type AdaptiveTuiMode = "auto" | "chat" | "workflow" | "validation" | "debug" | "compact";
export type DoubleEscapeAction = "fork" | "tree" | "none";
export type TreeFilterMode = "default" | "no-tools" | "user-only" | "labeled-only" | "all";
export type EditMode = "standard" | "hashline";
export type TimestampFormat = "date-time-iso" | "date-time-us";
export type TaskIsolationMode = "none" | "worktree" | "fuse-overlay";
export type TaskIsolationMerge = "patch" | "branch";

export interface CompactionSettings {
  enabled?: boolean;
  reserveTokens?: number;
  keepRecentTokens?: number;
  thresholdPercent?: number;
}

export interface BranchSummarySettings {
  reserveTokens?: number;
  skipPrompt?: boolean;
}

export interface RetrySettings {
  enabled?: boolean;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface TerminalSettings {
  showImages?: boolean;
  clearOnShrink?: boolean;
  adaptiveMode?: AdaptiveTuiMode;
}

export interface ImageSettings {
  autoResize?: boolean;
  blockImages?: boolean;
}

export interface ThinkingBudgetsSettings {
  minimal?: number;
  low?: number;
  medium?: number;
  high?: number;
}

export interface BashInterceptorRule {
  pattern: string;
  flags?: string;
  tool: string;
  message: string;
}

export interface BashInterceptorSettings {
  enabled?: boolean;
  rules?: BashInterceptorRule[];
}

export interface MarkdownSettings {
  codeBlockIndent?: string;
}

export interface MemorySettings {
  enabled?: boolean;
  maxRolloutsPerStartup?: number;
  maxRolloutAgeDays?: number;
  minRolloutIdleHours?: number;
  stage1Concurrency?: number;
  summaryInjectionTokenLimit?: number;
}

export interface AsyncSettings {
  enabled?: boolean;
  maxJobs?: number;
}

export interface TaskIsolationSettings {
  mode?: TaskIsolationMode;
  merge?: TaskIsolationMerge;
}

export interface FallbackChainEntry {
  provider: string;
  model: string;
  priority: number;
}

export interface FallbackSettings {
  enabled?: boolean;
  chains?: Record<string, FallbackChainEntry[]>;
}

export interface ModelDiscoverySettings {
  enabled?: boolean;
  providers?: string[];
  ttlMinutes?: number;
  autoRefreshOnModelSelect?: boolean;
}

export interface HookEntry {
  match?: {
    tool?: string | string[];
    command?: string;
  };
  command: string;
  timeout?: number;
  blocking?: boolean;
  env?: Record<string, string>;
}

export interface HooksSettings {
  PreToolUse?: HookEntry[];
  PostToolUse?: HookEntry[];
  UserPromptSubmit?: HookEntry[];
  SessionStart?: HookEntry[];
  SessionEnd?: HookEntry[];
  Stop?: HookEntry[];
  Notification?: HookEntry[];
  PreCompact?: HookEntry[];
  PostCompact?: HookEntry[];
  PreCommit?: HookEntry[];
  PostCommit?: HookEntry[];
  PrePush?: HookEntry[];
  PostPush?: HookEntry[];
  PrePr?: HookEntry[];
  PostPr?: HookEntry[];
  PreMilestone?: HookEntry[];
  PostMilestone?: HookEntry[];
  PreUnit?: HookEntry[];
  PostUnit?: HookEntry[];
  PreVerify?: HookEntry[];
  PostVerify?: HookEntry[];
  BudgetThreshold?: HookEntry[];
  Blocked?: HookEntry[];
}

export type PackageSource =
  | string
  | {
      source: string;
      extensions?: string[];
      skills?: string[];
      prompts?: string[];
      themes?: string[];
    };

/** pi-coding-agent `Settings` — primary schema for ~/.gsd/agent/settings.json */
export interface PiAgentSettings {
  lastChangelogVersion?: string;
  defaultProvider?: string;
  defaultModel?: string;
  defaultThinkingLevel?: ThinkingLevel;
  transport?: TransportSetting;
  steeringMode?: SteeringMode;
  followUpMode?: SteeringMode;
  theme?: string;
  compaction?: CompactionSettings;
  branchSummary?: BranchSummarySettings;
  retry?: RetrySettings;
  hideThinkingBlock?: boolean;
  shellPath?: string;
  quietStartup?: boolean;
  shellCommandPrefix?: string;
  collapseChangelog?: boolean;
  packages?: PackageSource[];
  extensions?: string[];
  skills?: string[];
  prompts?: string[];
  themes?: string[];
  enableSkillCommands?: boolean;
  terminal?: TerminalSettings;
  images?: ImageSettings;
  enabledModels?: string[];
  doubleEscapeAction?: DoubleEscapeAction;
  treeFilterMode?: TreeFilterMode;
  thinkingBudgets?: ThinkingBudgetsSettings;
  editorPaddingX?: number;
  autocompleteMaxVisible?: number;
  respectGitignoreInPicker?: boolean;
  searchExcludeDirs?: string[];
  showHardwareCursor?: boolean;
  markdown?: MarkdownSettings;
  memory?: MemorySettings;
  async?: AsyncSettings;
  bashInterceptor?: BashInterceptorSettings;
  taskIsolation?: TaskIsolationSettings;
  fallback?: FallbackSettings;
  modelDiscovery?: ModelDiscoverySettings;
  editMode?: EditMode;
  timestampFormat?: TimestampFormat;
  allowedCommandPrefixes?: string[];
  fetchAllowedUrls?: string[];
  hooks?: HooksSettings;
}

/** Claude Code–compatible keys that may coexist in the same file */
export interface ClaudeCodeSettingsExtension {
  model?: string;
  apiKeyHelper?: string;
  env?: Record<string, string>;
  permissions?: {
    defaultMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "auto";
    allow?: string[];
    deny?: string[];
    ask?: string[];
  };
  statusLine?: {
    type?: "command" | "static_text";
    command?: string;
    padding?: number;
  };
  outputStyle?: string;
  includeCoAuthoredBy?: boolean;
  cleanupPeriodDays?: number;
  verbose?: boolean;
  autoUpdates?: boolean;
  alwaysThinkingEnabled?: boolean;
}

export type AgentSettingsDoc = PiAgentSettings & ClaudeCodeSettingsExtension;
