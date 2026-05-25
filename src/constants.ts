// GSD Pi Config - Shared Constants (model catalog, commit types, etc.)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

/**
 * Provider-first model catalog. Each provider represents a distinct auth/routing path.
 * The same model ID can appear under multiple providers (e.g. gpt-4o via OpenAI
 * vs Azure, or claude-opus-4-6 via Anthropic vs Bedrock) —
 * the picker preserves which one was chosen so GSD can route correctly.
 *
 * Values are stored in `provider/model` prefix notation that GSD Pi supports,
 * or as `{provider, model}` pairs on GSDPhaseModelConfig.
 */
export interface ProviderCatalog {
  /** Provider ID stored in config (lowercase, slash-safe). */
  id: string;
  /** Human label shown in the optgroup. */
  label: string;
  /** Short description of the auth/routing path. */
  description: string;
  /** Model IDs this provider exposes. */
  models: readonly string[];
}

export const MODEL_CATALOG: readonly ProviderCatalog[] = [
  // ─── Anthropic paths ──────────────────────────────────────────────────
  {
    id: "claude-code",
    label: "Claude Code CLI",
    description: "Routed through the Claude Code subscription (zero API cost)",
    models: [
      "claude-opus-4-6",
      "claude-sonnet-4-6",
      "claude-haiku-4-5",
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic API",
    description: "Direct Anthropic API (requires ANTHROPIC_API_KEY)",
    models: [
      "claude-opus-4-6",
      "claude-opus-4-6-thinking",
      "claude-sonnet-4-6",
      "claude-haiku-4-5",
      "claude-haiku-4-5-20251001",
      "claude-opus-4-5",
      "claude-opus-4-5-thinking",
      "claude-sonnet-4-5",
      "claude-sonnet-4-5-thinking",
      "claude-opus-4-1",
      "claude-sonnet-4-0",
      "claude-3-7-sonnet-latest",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-latest",
      "claude-3-opus-20240229",
    ],
  },
  {
    id: "bedrock",
    label: "AWS Bedrock",
    description: "Anthropic/Meta/Mistral via AWS (IAM auth)",
    models: [
      "anthropic.claude-opus-4-6-v1:0",
      "anthropic.claude-sonnet-4-6-v1:0",
      "anthropic.claude-haiku-4-5-v1:0",
      "anthropic.claude-opus-4-5-v1:0",
      "anthropic.claude-sonnet-4-5-v1:0",
      "anthropic.claude-3-7-sonnet-20250219-v1:0",
      "anthropic.claude-3-5-sonnet-20241022-v2:0",
      "meta.llama3-3-70b-instruct-v1:0",
      "meta.llama3-1-405b-instruct-v1:0",
      "mistral.mistral-large-2407-v1:0",
    ],
  },
  {
    id: "vertex",
    label: "Google Vertex AI",
    description: "Multi-vendor models via GCP Vertex (service account)",
    models: [
      "claude-opus-4-6@vertex",
      "claude-sonnet-4-6@vertex",
      "gemini-3-pro-preview",
      "gemini-3-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ],
  },

  // ─── OpenAI paths ────────────────────────────────────────────────────
  {
    id: "openai",
    label: "OpenAI API",
    description: "Direct OpenAI API (requires OPENAI_API_KEY)",
    models: [
      "gpt-5",
      "gpt-5-pro",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-5-codex",
      "gpt-5-chat-latest",
      "codex-mini-latest",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4-turbo",
      "o3",
      "o3-mini",
      "o4-mini",
    ],
  },
  {
    id: "azure-openai",
    label: "Azure OpenAI",
    description: "OpenAI models via Azure (AAD/key auth)",
    models: [
      "gpt-5",
      "gpt-5-mini",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "o3",
      "o3-mini",
    ],
  },

  // ─── Google paths ────────────────────────────────────────────────────
  {
    id: "google",
    label: "Google AI Studio",
    description: "Gemini via direct API (GEMINI_API_KEY)",
    models: [
      "gemini-3-pro-preview",
      "gemini-3-flash",
      "gemini-3-flash-preview",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ],
  },
  {
    id: "google-gemini-cli",
    label: "Gemini CLI",
    description: "Routed through the Gemini CLI (subscription)",
    models: [
      "gemini-3-pro-preview",
      "gemini-3-flash",
      "gemini-2.5-pro",
    ],
  },

  // ─── xAI / Grok ──────────────────────────────────────────────────────
  {
    id: "xai",
    label: "xAI (Grok)",
    description: "Direct xAI API (XAI_API_KEY)",
    models: [
      "grok-4",
      "grok-4-fast",
      "grok-4-1-fast",
      "grok-code-fast-1",
      "grok-3",
      "grok-3-fast",
      "grok-3-mini",
      "grok-2-latest",
      "grok-2-vision-latest",
    ],
  },

  // ─── DeepSeek ────────────────────────────────────────────────────────
  {
    id: "deepseek",
    label: "DeepSeek",
    description: "Direct DeepSeek API",
    models: [
      "deepseek-chat",
      "deepseek-reasoner",
      "deepseek-r1",
      "deepseek-v3",
      "deepseek-coder",
    ],
  },

  // ─── Mistral ─────────────────────────────────────────────────────────
  {
    id: "mistral",
    label: "Mistral AI",
    description: "Direct Mistral API",
    models: [
      "mistral-large-latest",
      "mistral-medium-latest",
      "mistral-small-latest",
      "codestral-latest",
      "devstral-medium-latest",
      "devstral-small-2507",
      "pixtral-large-latest",
    ],
  },

  // ─── Fast inference providers ────────────────────────────────────────
  {
    id: "groq",
    label: "Groq",
    description: "Ultra-fast LPU inference",
    models: [
      "llama3-70b-8192",
      "llama3-8b-8192",
      "gemma2-9b-it",
      "deepseek-r1-distill-llama-70b",
      "kimi-k2-thinking",
    ],
  },
  {
    id: "cerebras",
    label: "Cerebras",
    description: "Wafer-scale inference",
    models: [
      "llama-3.3-70b",
      "llama-3.1-405b",
      "llama-3.1-70b",
      "qwen3-coder",
    ],
  },

  // ─── Aggregator / gateway providers ──────────────────────────────────
  {
    id: "openrouter",
    label: "OpenRouter",
    description: "Unified gateway across 100+ models",
    models: [
      "anthropic/claude-opus-4-6",
      "anthropic/claude-sonnet-4-6",
      "anthropic/claude-haiku-4-5",
      "openai/gpt-5",
      "openai/gpt-5-mini",
      "openai/gpt-4o",
      "google/gemini-3-pro-preview",
      "google/gemini-2.5-pro",
      "x-ai/grok-4",
      "x-ai/grok-code-fast-1",
      "deepseek/deepseek-r1",
      "qwen/qwen3-coder-plus",
      "meta-llama/llama-3.3-70b-instruct",
    ],
  },
  {
    id: "vercel",
    label: "Vercel AI Gateway",
    description: "Vercel's unified AI gateway",
    models: [
      "anthropic/claude-opus-4-6",
      "anthropic/claude-sonnet-4-6",
      "openai/gpt-5",
      "openai/gpt-4o",
      "google/gemini-3-pro-preview",
      "xai/grok-4",
    ],
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    description: "Models via GitHub Copilot subscription",
    models: [
      "claude-opus-4-6",
      "claude-sonnet-4-6",
      "gpt-5",
      "gpt-4o",
      "o3-mini",
      "gemini-2.5-pro",
    ],
  },

  // ─── Chinese providers ───────────────────────────────────────────────
  {
    id: "qwen",
    label: "Alibaba Qwen",
    description: "Direct DashScope API",
    models: [
      "qwen3-max",
      "qwen3-coder-plus",
      "qwen3-coder",
      "qwen3-vl-plus",
      "qwen-max",
      "qwen-plus",
      "qwen-turbo",
    ],
  },
  {
    id: "zhipu",
    label: "Z.AI / Zhipu",
    description: "GLM models direct API",
    models: [
      "glm-5",
      "glm-5-turbo",
    ],
  },
  {
    id: "moonshot",
    label: "Moonshot / Kimi",
    description: "Kimi models direct API",
    models: [
      "kimi-k2-thinking",
      "kimi-coding",
    ],
  },

  // ─── Local / self-hosted ─────────────────────────────────────────────
  {
    id: "ollama",
    label: "Ollama (Local)",
    description: "Self-hosted local models via Ollama",
    models: [
      "llama3.3",
      "llama3.2",
      "qwen3-coder",
      "deepseek-r1",
      "mistral",
      "codellama",
    ],
  },
];

/** Flattened list of `provider/model` strings for autocomplete. */
export const ALL_QUALIFIED_MODELS: readonly string[] = MODEL_CATALOG.flatMap((p) =>
  p.models.map((m) => `${p.id}/${m}`),
);

/** Simple model names (no provider prefix) for free-text fallback. */
export const ALL_MODEL_NAMES: readonly string[] = Array.from(
  new Set(MODEL_CATALOG.flatMap((p) => p.models)),
);

/**
 * Parse a `provider/model` qualified string into its parts.
 * Returns null if the value is not qualified.
 */
export function parseQualified(val: string | undefined): { provider: string; model: string } | null {
  if (!val) return null;
  const slash = val.indexOf("/");
  if (slash === -1) return null;
  const provider = val.slice(0, slash);
  const model = val.slice(slash + 1);
  // Sanity: provider must be one we know, otherwise treat as plain model id
  // (e.g. "anthropic/claude-opus-4-6" via openrouter is the full model id)
  const known = MODEL_CATALOG.some((p) => p.id === provider);
  if (!known) return null;
  return { provider, model };
}

/** Find the provider entry for a given provider id. */
export function getProviderCatalog(id: string): ProviderCatalog | undefined {
  return MODEL_CATALOG.find((p) => p.id === id);
}

/** Provider IDs from the model catalog (for multi-select UIs). */
export const CATALOG_PROVIDER_IDS = MODEL_CATALOG.map((p) => p.id);

/** Known slice-scoped gate names (free-form strings are also allowed elsewhere). */
export const KNOWN_SLICE_GATES = [
  "verification",
  "discussion",
  "research",
  "planning",
] as const;

/** Reactive execution isolation modes supported by GSD Pi. */
export const REACTIVE_ISOLATION_MODES = ["same-tree"] as const;

/** Git pre-merge check stored values (UI maps labels separately). */
export const GIT_PRE_MERGE_VALUES = ["true", "false", "auto"] as const;

/** Conventional commit types. */
export const COMMIT_TYPES = [
  "feat",
  "fix",
  "refactor",
  "docs",
  "test",
  "chore",
  "perf",
  "ci",
  "build",
  "style",
] as const;
