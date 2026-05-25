// GSD Pi Config - Agent Settings (settings.json) — pi-coding-agent Settings
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import {
  SectionHeader,
  Field,
  Toggle,
  SelectField,
  TextField,
  NumberField,
  ModelPicker,
  TagInput,
} from "../FormControls";
import type { ProviderCatalog } from "../../constants";
import { CATALOG_PROVIDER_IDS } from "../../constants";
import {
  asAgentSettings,
  setKey,
  patchNested,
  defaultModelPickerValue,
  applyDefaultModelPicker,
  readHooks,
  setHookEvent,
  packageSourceLabels,
  setPackageSourcesFromLabels,
} from "../../lib/agentSettings";
import type { HookEventName } from "../../lib/agentSettings";
import type {
  ThinkingLevel,
  TransportSetting,
  SteeringMode,
  AdaptiveTuiMode,
  DoubleEscapeAction,
  TreeFilterMode,
  EditMode,
  TimestampFormat,
  TaskIsolationMode,
  TaskIsolationMerge,
} from "../../lib/agentSettingsTypes";
import {
  StringListField,
  EnvEditor,
  HooksEditor,
  FallbackChainsEditor,
  BashInterceptorRulesEditor,
  SettingsGroup,
} from "./agentSettingsEditors";

interface Props {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  modelCatalog?: readonly ProviderCatalog[];
}

const THINKING_LEVELS: ThinkingLevel[] = ["off", "minimal", "low", "medium", "high", "xhigh"];
const PERMISSION_MODES = ["default", "acceptEdits", "bypassPermissions", "plan", "auto"] as const;

export function AgentSettingsSection({ value, onChange, modelCatalog = [] }: Props) {
  const s = () => asAgentSettings(value);
  const update = (key: string, next: unknown) => onChange(setKey(value, key, next));

  const permissions = s().permissions ?? {};
  const statusLine = s().statusLine ?? {};
  const env = s().env ?? {};
  const compaction = s().compaction ?? {};
  const branchSummary = s().branchSummary ?? {};
  const retry = s().retry ?? {};
  const terminal = s().terminal ?? {};
  const images = s().images ?? {};
  const thinkingBudgets = s().thinkingBudgets ?? {};
  const memory = s().memory ?? {};
  const asyncCfg = s().async ?? {};
  const bashInterceptor = s().bashInterceptor ?? {};
  const taskIsolation = s().taskIsolation ?? {};
  const fallback = s().fallback ?? {};
  const modelDiscovery = s().modelDiscovery ?? {};
  const markdown = s().markdown ?? {};
  const hooks = readHooks(value);

  return (
    <div>
      <SectionHeader
        title="Agent Settings"
        description="pi-coding-agent runtime settings (settings.json). Writes to ~/.gsd/agent/settings.json or the project .gsd copy. Unknown keys round-trip verbatim on save."
      />

      <SettingsGroup title="Model &amp; defaults">
        <Field label="Default model" description="provider/model or model ID. Maps to defaultProvider + defaultModel.">
          {modelCatalog.length > 0 ? (
            <ModelPicker
              value={defaultModelPickerValue(value)}
              onChange={(v) => onChange(applyDefaultModelPicker(value, v))}
              catalog={modelCatalog}
              placeholder="Not set"
              className="w-72"
            />
          ) : (
            <TextField
              value={defaultModelPickerValue(value)}
              onChange={(v) => onChange(applyDefaultModelPicker(value, v))}
              placeholder="provider/model-id"
              className="w-72"
            />
          )}
        </Field>
        <Field label="Default provider" description="Optional explicit provider when defaultModel has no slash.">
          <SelectField
            value={s().defaultProvider}
            onChange={(v) => update("defaultProvider", v)}
            options={CATALOG_PROVIDER_IDS}
            placeholder="From model picker"
          />
        </Field>
        <Field label="Default thinking level">
          <SelectField<ThinkingLevel>
            value={s().defaultThinkingLevel}
            onChange={(v) => update("defaultThinkingLevel", v)}
            options={THINKING_LEVELS}
            placeholder="off"
          />
        </Field>
        <Field label="Transport">
          <SelectField<TransportSetting>
            value={s().transport}
            onChange={(v) => update("transport", v)}
            options={["auto", "sse", "websocket"]}
            placeholder="auto"
          />
        </Field>
        <Field label="Steering mode">
          <SelectField<SteeringMode>
            value={s().steeringMode}
            onChange={(v) => update("steeringMode", v)}
            options={["all", "one-at-a-time"]}
          />
        </Field>
        <Field label="Follow-up mode">
          <SelectField<SteeringMode>
            value={s().followUpMode}
            onChange={(v) => update("followUpMode", v)}
            options={["all", "one-at-a-time"]}
          />
        </Field>
        <Field label="Theme">
          <TextField value={s().theme} onChange={(v) => update("theme", v)} placeholder="default" />
        </Field>
        <StringListField
          label="Enabled models"
          description="Patterns for model cycling (same as --models CLI)."
          values={s().enabledModels}
          onChange={(v) => update("enabledModels", v)}
          placeholder="provider/model"
          wide
        />
        <Field label="API key helper" description="Shell command that prints an API key (Claude Code compat).">
          <TextField
            value={s().apiKeyHelper}
            onChange={(v) => update("apiKeyHelper", v)}
            placeholder="/path/to/helper"
            className="w-72"
          />
        </Field>
        <Field label="Output style">
          <TextField value={s().outputStyle} onChange={(v) => update("outputStyle", v)} placeholder="default" />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Compaction &amp; retry">
        <Field label="Compaction enabled">
          <Toggle
            checked={compaction.enabled !== false}
            onChange={(b) =>
              onChange(patchNested(value, "compaction", { enabled: b ? undefined : false }))
            }
          />
        </Field>
        <Field label="Reserve tokens">
          <NumberField
            value={compaction.reserveTokens}
            onChange={(v) => onChange(patchNested(value, "compaction", { reserveTokens: v }))}
            min={0}
            placeholder="16384"
          />
        </Field>
        <Field label="Keep recent tokens">
          <NumberField
            value={compaction.keepRecentTokens}
            onChange={(v) => onChange(patchNested(value, "compaction", { keepRecentTokens: v }))}
            min={0}
            placeholder="20000"
          />
        </Field>
        <Field label="Threshold percent" description="Runtime override; 0–1 fraction of context window.">
          <NumberField
            value={compaction.thresholdPercent}
            onChange={(v) => onChange(patchNested(value, "compaction", { thresholdPercent: v }))}
            min={0}
            max={1}
            placeholder="Optional"
          />
        </Field>
        <Field label="Branch summary reserve tokens">
          <NumberField
            value={branchSummary.reserveTokens}
            onChange={(v) => onChange(patchNested(value, "branchSummary", { reserveTokens: v }))}
            min={0}
          />
        </Field>
        <Field label="Skip branch summary prompt">
          <Toggle
            checked={branchSummary.skipPrompt ?? false}
            onChange={(b) => onChange(patchNested(value, "branchSummary", { skipPrompt: b || undefined }))}
          />
        </Field>
        <Field label="Retry enabled">
          <Toggle
            checked={retry.enabled !== false}
            onChange={(b) => onChange(patchNested(value, "retry", { enabled: b ? undefined : false }))}
          />
        </Field>
        <Field label="Max retries">
          <NumberField
            value={retry.maxRetries}
            onChange={(v) => onChange(patchNested(value, "retry", { maxRetries: v }))}
            min={0}
            placeholder="3"
          />
        </Field>
        <Field label="Base delay (ms)">
          <NumberField
            value={retry.baseDelayMs}
            onChange={(v) => onChange(patchNested(value, "retry", { baseDelayMs: v }))}
            min={0}
          />
        </Field>
        <Field label="Max delay (ms)">
          <NumberField
            value={retry.maxDelayMs}
            onChange={(v) => onChange(patchNested(value, "retry", { maxDelayMs: v }))}
            min={0}
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Terminal, images &amp; shell">
        <Field label="Show images in terminal">
          <Toggle
            checked={terminal.showImages !== false}
            onChange={(b) => onChange(patchNested(value, "terminal", { showImages: b ? undefined : false }))}
          />
        </Field>
        <Field label="Clear terminal on shrink">
          <Toggle
            checked={terminal.clearOnShrink ?? false}
            onChange={(b) => onChange(patchNested(value, "terminal", { clearOnShrink: b || undefined }))}
          />
        </Field>
        <Field label="Adaptive TUI mode">
          <SelectField<AdaptiveTuiMode>
            value={terminal.adaptiveMode}
            onChange={(v) => onChange(patchNested(value, "terminal", { adaptiveMode: v }))}
            options={["auto", "chat", "workflow", "validation", "debug", "compact"]}
          />
        </Field>
        <Field label="Auto-resize images">
          <Toggle
            checked={images.autoResize !== false}
            onChange={(b) => onChange(patchNested(value, "images", { autoResize: b ? undefined : false }))}
          />
        </Field>
        <Field label="Block all images">
          <Toggle
            checked={images.blockImages ?? false}
            onChange={(b) => onChange(patchNested(value, "images", { blockImages: b || undefined }))}
          />
        </Field>
        <Field label="Shell path">
          <TextField value={s().shellPath} onChange={(v) => update("shellPath", v)} className="w-72" />
        </Field>
        <Field label="Shell command prefix">
          <TextField
            value={s().shellCommandPrefix}
            onChange={(v) => update("shellCommandPrefix", v)}
            className="w-full max-w-xl font-mono text-xs"
          />
        </Field>
        <Field label="Quiet startup">
          <Toggle
            checked={s().quietStartup ?? false}
            onChange={(b) => update("quietStartup", b || undefined)}
          />
        </Field>
        <Field label="Hide thinking block">
          <Toggle
            checked={s().hideThinkingBlock ?? false}
            onChange={(b) => update("hideThinkingBlock", b || undefined)}
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Editor &amp; UI">
        <Field label="Edit mode">
          <SelectField<EditMode>
            value={s().editMode}
            onChange={(v) => update("editMode", v)}
            options={["standard", "hashline"]}
          />
        </Field>
        <Field label="Timestamp format">
          <SelectField<TimestampFormat>
            value={s().timestampFormat}
            onChange={(v) => update("timestampFormat", v)}
            options={["date-time-iso", "date-time-us"]}
          />
        </Field>
        <Field label="Double-escape action">
          <SelectField<DoubleEscapeAction>
            value={s().doubleEscapeAction}
            onChange={(v) => update("doubleEscapeAction", v)}
            options={["tree", "fork", "none"]}
          />
        </Field>
        <Field label="Tree filter mode">
          <SelectField<TreeFilterMode>
            value={s().treeFilterMode}
            onChange={(v) => update("treeFilterMode", v)}
            options={["default", "no-tools", "user-only", "labeled-only", "all"]}
          />
        </Field>
        <Field label="Editor padding X">
          <NumberField value={s().editorPaddingX} onChange={(v) => update("editorPaddingX", v)} min={0} />
        </Field>
        <Field label="Autocomplete max visible">
          <NumberField
            value={s().autocompleteMaxVisible}
            onChange={(v) => update("autocompleteMaxVisible", v)}
            min={1}
            placeholder="5"
          />
        </Field>
        <Field label="Respect .gitignore in @ picker">
          <Toggle
            checked={s().respectGitignoreInPicker !== false}
            onChange={(b) => update("respectGitignoreInPicker", b ? undefined : false)}
          />
        </Field>
        <StringListField
          label="Search exclude dirs"
          values={s().searchExcludeDirs}
          onChange={(v) => update("searchExcludeDirs", v)}
          placeholder="node_modules"
        />
        <Field label="Show hardware cursor">
          <Toggle
            checked={s().showHardwareCursor ?? false}
            onChange={(b) => update("showHardwareCursor", b || undefined)}
          />
        </Field>
        <Field label="Markdown code block indent">
          <TextField
            value={markdown.codeBlockIndent}
            onChange={(v) => onChange(patchNested(value, "markdown", { codeBlockIndent: v }))}
            placeholder="  "
          />
        </Field>
        <Field label="Collapse changelog">
          <Toggle
            checked={s().collapseChangelog ?? false}
            onChange={(b) => update("collapseChangelog", b || undefined)}
          />
        </Field>
        <Field label="Last changelog version">
          <TextField
            value={s().lastChangelogVersion}
            onChange={(v) => update("lastChangelogVersion", v)}
            className="w-40"
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Thinking budgets">
        {(["minimal", "low", "medium", "high"] as const).map((level) => (
          <Field key={level} label={level}>
            <NumberField
              value={thinkingBudgets[level]}
              onChange={(v) => onChange(patchNested(value, "thinkingBudgets", { [level]: v }))}
              min={0}
            />
          </Field>
        ))}
      </SettingsGroup>

      <SettingsGroup title="Resources (packages &amp; paths)">
        <Field label="Enable skill commands">
          <Toggle
            checked={s().enableSkillCommands !== false}
            onChange={(b) => update("enableSkillCommands", b ? undefined : false)}
          />
        </Field>
        <Field
          label="Package sources"
          description="npm/git package sources (string paths). Filtered object packages are preserved on save."
        >
          <TagInput
            values={packageSourceLabels(s().packages)}
            onChange={(labels) => onChange(setPackageSourcesFromLabels(value, labels))}
            placeholder="npm package or git URL"
          />
        </Field>
        <StringListField
          label="Extensions"
          values={s().extensions}
          onChange={(v) => update("extensions", v)}
          placeholder="/path/to/extension"
          wide
        />
        <StringListField
          label="Skills paths"
          values={s().skills}
          onChange={(v) => update("skills", v)}
          wide
        />
        <StringListField label="Prompts paths" values={s().prompts} onChange={(v) => update("prompts", v)} wide />
        <StringListField label="Themes paths" values={s().themes} onChange={(v) => update("themes", v)} wide />
      </SettingsGroup>

      <SettingsGroup title="Memory &amp; async jobs">
        <Field label="Memory rollouts enabled">
          <Toggle
            checked={memory.enabled ?? false}
            onChange={(b) => onChange(patchNested(value, "memory", { enabled: b || undefined }))}
          />
        </Field>
        <Field label="Max rollouts per startup">
          <NumberField
            value={memory.maxRolloutsPerStartup}
            onChange={(v) => onChange(patchNested(value, "memory", { maxRolloutsPerStartup: v }))}
            min={0}
          />
        </Field>
        <Field label="Max rollout age (days)">
          <NumberField
            value={memory.maxRolloutAgeDays}
            onChange={(v) => onChange(patchNested(value, "memory", { maxRolloutAgeDays: v }))}
            min={0}
          />
        </Field>
        <Field label="Min rollout idle (hours)">
          <NumberField
            value={memory.minRolloutIdleHours}
            onChange={(v) => onChange(patchNested(value, "memory", { minRolloutIdleHours: v }))}
            min={0}
          />
        </Field>
        <Field label="Stage-1 concurrency">
          <NumberField
            value={memory.stage1Concurrency}
            onChange={(v) => onChange(patchNested(value, "memory", { stage1Concurrency: v }))}
            min={1}
          />
        </Field>
        <Field label="Summary injection token limit">
          <NumberField
            value={memory.summaryInjectionTokenLimit}
            onChange={(v) => onChange(patchNested(value, "memory", { summaryInjectionTokenLimit: v }))}
            min={0}
          />
        </Field>
        <Field label="Async jobs enabled">
          <Toggle
            checked={asyncCfg.enabled ?? false}
            onChange={(b) => onChange(patchNested(value, "async", { enabled: b || undefined }))}
          />
        </Field>
        <Field label="Max async jobs">
          <NumberField
            value={asyncCfg.maxJobs}
            onChange={(v) => onChange(patchNested(value, "async", { maxJobs: v }))}
            min={1}
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Task isolation (pi runtime)">
        <p className="text-xs text-gsd-text-dim py-2">
          pi-coding-agent task isolation. GSD workflow git isolation is configured under Git in preferences.
        </p>
        <Field label="Isolation mode">
          <SelectField<TaskIsolationMode>
            value={taskIsolation.mode}
            onChange={(v) => onChange(patchNested(value, "taskIsolation", { mode: v }))}
            options={["none", "worktree", "fuse-overlay"]}
          />
        </Field>
        <Field label="Merge mode">
          <SelectField<TaskIsolationMerge>
            value={taskIsolation.merge}
            onChange={(v) => onChange(patchNested(value, "taskIsolation", { merge: v }))}
            options={["patch", "branch"]}
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Fallback chains">
        <Field label="Fallback enabled">
          <Toggle
            checked={fallback.enabled ?? false}
            onChange={(b) => onChange(patchNested(value, "fallback", { enabled: b || undefined }))}
          />
        </Field>
        <FallbackChainsEditor
          chains={fallback.chains ?? {}}
          onChange={(chains) => onChange(patchNested(value, "fallback", { chains }))}
        />
      </SettingsGroup>

      <SettingsGroup title="Model discovery">
        <Field label="Discovery enabled">
          <Toggle
            checked={modelDiscovery.enabled ?? false}
            onChange={(b) => onChange(patchNested(value, "modelDiscovery", { enabled: b || undefined }))}
          />
        </Field>
        <StringListField
          label="Providers"
          values={modelDiscovery.providers}
          onChange={(v) => onChange(patchNested(value, "modelDiscovery", { providers: v }))}
        />
        <Field label="TTL (minutes)">
          <NumberField
            value={modelDiscovery.ttlMinutes}
            onChange={(v) => onChange(patchNested(value, "modelDiscovery", { ttlMinutes: v }))}
            min={1}
          />
        </Field>
        <Field label="Auto-refresh on model select">
          <Toggle
            checked={modelDiscovery.autoRefreshOnModelSelect ?? false}
            onChange={(b) =>
              onChange(patchNested(value, "modelDiscovery", { autoRefreshOnModelSelect: b || undefined }))
            }
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Bash interceptor">
        <Field label="Interceptor enabled">
          <Toggle
            checked={bashInterceptor.enabled !== false}
            onChange={(b) =>
              onChange(patchNested(value, "bashInterceptor", { enabled: b ? undefined : false }))
            }
          />
        </Field>
        <BashInterceptorRulesEditor
          rules={bashInterceptor.rules ?? []}
          onChange={(rules) => onChange(patchNested(value, "bashInterceptor", { rules }))}
        />
      </SettingsGroup>

      <SettingsGroup title="Shell hooks">
        <p className="text-xs text-gsd-text-dim py-2 mb-2">
          Layer 0 shell-command hooks. Project hooks require <code className="font-mono">.gsd/hooks.trusted</code>.
        </p>
        <HooksEditor
          hooks={hooks}
          onChangeEvent={(event: HookEventName, entries) =>
            onChange(setHookEvent(value, event, entries))
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Security overrides (global only)">
        <p className="text-xs text-gsd-text-dim py-2">
          Only applied from global <code className="font-mono">~/.gsd/agent/settings.json</code>; ignored in project settings.
        </p>
        <StringListField
          label="Allowed command prefixes"
          values={s().allowedCommandPrefixes}
          onChange={(v) => update("allowedCommandPrefixes", v)}
          placeholder="!npm"
          wide
        />
        <StringListField
          label="Fetch allowed URLs"
          values={s().fetchAllowedUrls}
          onChange={(v) => update("fetchAllowedUrls", v)}
          placeholder="example.com"
          wide
        />
      </SettingsGroup>

      <SettingsGroup title="Claude Code extensions">
        <Field label="Default permission mode">
          <SelectField
            value={permissions.defaultMode}
            onChange={(v) => {
              const next = { ...permissions, defaultMode: v };
              update("permissions", Object.keys(next).length ? next : undefined);
            }}
            options={PERMISSION_MODES}
          />
        </Field>
        <StringListField
          label="Allow list"
          values={permissions.allow}
          onChange={(allow) => update("permissions", { ...permissions, allow })}
        />
        <StringListField
          label="Deny list"
          values={permissions.deny}
          onChange={(deny) => update("permissions", { ...permissions, deny })}
        />
        <StringListField
          label="Ask list"
          values={permissions.ask}
          onChange={(ask) => update("permissions", { ...permissions, ask })}
        />
        <Field label="Status line type">
          <SelectField
            value={statusLine.type}
            onChange={(v) => update("statusLine", { ...statusLine, type: v })}
            options={["command", "static_text"]}
          />
        </Field>
        <Field label="Status line command / text">
          <TextField
            value={statusLine.command}
            onChange={(v) => update("statusLine", { ...statusLine, command: v })}
            className="w-80"
          />
        </Field>
        <Field label="Status line padding">
          <NumberField
            value={statusLine.padding}
            onChange={(v) => update("statusLine", { ...statusLine, padding: v })}
            min={0}
          />
        </Field>
        <Field label="Include Co-Authored-By">
          <Toggle
            checked={s().includeCoAuthoredBy === true}
            onChange={(b) => update("includeCoAuthoredBy", b || undefined)}
          />
        </Field>
        <Field label="Verbose">
          <Toggle checked={s().verbose === true} onChange={(b) => update("verbose", b || undefined)} />
        </Field>
        <Field label="Auto-updates">
          <Toggle
            checked={s().autoUpdates !== false}
            onChange={(b) => update("autoUpdates", b ? undefined : false)}
          />
        </Field>
        <Field label="Always thinking">
          <Toggle
            checked={s().alwaysThinkingEnabled === true}
            onChange={(b) => update("alwaysThinkingEnabled", b || undefined)}
          />
        </Field>
        <Field label="Cleanup period (days)">
          <NumberField
            value={s().cleanupPeriodDays}
            onChange={(v) => update("cleanupPeriodDays", v)}
            min={0}
          />
        </Field>
      </SettingsGroup>

      <SettingsGroup title="Environment variables">
        <EnvEditor
          value={env}
          onChange={(next) => update("env", Object.keys(next).length > 0 ? next : undefined)}
        />
      </SettingsGroup>
    </div>
  );
}
