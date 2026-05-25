// GSD Pi Config - Section renderers shared by desktop and web
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { ReactNode } from "react";
import type { GSDModelsConfig, GSDPreferences } from "../types";
import { MODEL_CATALOG } from "../constants";
import { mergeCustomProviders } from "../lib/customProviders";
import { GeneralSection } from "./sections/GeneralSection";
import { ModelsSection } from "./sections/ModelsSection";
import { GitSection } from "./sections/GitSection";
import { SkillsSection } from "./sections/SkillsSection";
import { BudgetSection } from "./sections/BudgetSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { ParallelSection } from "./sections/ParallelSection";
import { PhasesSection } from "./sections/PhasesSection";
import { ContextSection } from "./sections/ContextSection";
import { SafetySection } from "./sections/SafetySection";
import { VerificationSection } from "./sections/VerificationSection";
import { DiscussionSection } from "./sections/DiscussionSection";
import { HooksSection } from "./sections/HooksSection";
import { RoutingSection } from "./sections/RoutingSection";
import { CmuxSection } from "./sections/CmuxSection";
import { RemoteSection } from "./sections/RemoteSection";
import { CodebaseSection } from "./sections/CodebaseSection";
import { ExperimentalSection } from "./sections/ExperimentalSection";
import { UokSection } from "./sections/UokSection";
import { GitHubSection } from "./sections/GitHubSection";
import { WorkspaceSection } from "./sections/WorkspaceSection";
import { McpSection } from "./sections/McpSection";
import { SkillsLibrarySection } from "./sections/SkillsLibrarySection";
import { AgentsLibrarySection } from "./sections/AgentsLibrarySection";
import { ApiKeysSection } from "./sections/ApiKeysSection";
import { CustomProvidersSection } from "./sections/CustomProvidersSection";
import { AgentSettingsSection } from "./sections/AgentSettingsSection";
import type { SectionId } from "./Sidebar";

export interface SectionRenderContext {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
  projectPath?: string;
  modelsDoc?: GSDModelsConfig;
  onModelsChange?: (m: GSDModelsConfig) => void;
  settingsDoc?: Record<string, unknown>;
  onSettingsChange?: (s: Record<string, unknown>) => void;
  isWeb?: boolean;
}

export function renderPreferencesSection(
  section: SectionId,
  ctx: SectionRenderContext,
): ReactNode {
  const props = { prefs: ctx.prefs, onChange: ctx.onChange };
  const customModels = ctx.modelsDoc ?? {};
  const { catalog: modelCatalog } = mergeCustomProviders(MODEL_CATALOG, customModels);

  switch (section) {
    case "skills-library":
      return <SkillsLibrarySection projectPath={ctx.projectPath} />;
    case "agents-library":
      return <AgentsLibrarySection projectPath={ctx.projectPath} />;
    case "api-keys":
      return <ApiKeysSection />;
    case "custom-providers":
      return (
        <CustomProvidersSection
          value={ctx.modelsDoc ?? {}}
          onChange={ctx.onModelsChange ?? (() => {})}
        />
      );
    case "agent-settings":
      return (
        <AgentSettingsSection
          value={ctx.settingsDoc ?? {}}
          onChange={ctx.onSettingsChange ?? (() => {})}
          modelCatalog={modelCatalog}
        />
      );
    case "general":
      return <GeneralSection {...props} />;
    case "models":
      return (
        <ModelsSection
          {...props}
          customModels={customModels}
        />
      );
    case "git":
      return <GitSection {...props} />;
    case "skills":
      return <SkillsSection {...props} />;
    case "budget":
      return <BudgetSection {...props} />;
    case "notifications":
      return <NotificationsSection {...props} />;
    case "parallel":
      return <ParallelSection {...props} modelCatalog={modelCatalog} />;
    case "phases":
      return <PhasesSection {...props} />;
    case "context":
      return <ContextSection {...props} />;
    case "safety":
      return <SafetySection {...props} />;
    case "verification":
      return <VerificationSection {...props} />;
    case "discussion":
      return <DiscussionSection {...props} />;
    case "hooks":
      return <HooksSection {...props} modelCatalog={modelCatalog} />;
    case "routing":
      return <RoutingSection {...props} modelCatalog={modelCatalog} />;
    case "cmux":
      return <CmuxSection {...props} />;
    case "remote":
      return <RemoteSection {...props} />;
    case "github":
      return <GitHubSection {...props} />;
    case "uok":
      return <UokSection {...props} />;
    case "workspace":
      return <WorkspaceSection {...props} />;
    case "mcp":
      return <McpSection {...props} />;
    case "codebase":
      return <CodebaseSection {...props} />;
    case "experimental":
      return <ExperimentalSection {...props} modelCatalog={modelCatalog} />;
  }
}
