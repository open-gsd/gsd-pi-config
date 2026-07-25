// GSD Pi Config - API Keys Manager
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "../FormControls";
import { useConfigBackend } from "../../platform/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KeyStatus {
  name: string;
  is_set: boolean;
  preview: string | null;
}

interface KeyDef {
  name: string;           // env var name
  label: string;          // display label
  description: string;
  url?: string;           // where to get the key
}

interface KeyGroup {
  id: string;
  label: string;
  description: string;
  keys: KeyDef[];
}

const KEY_GROUPS: KeyGroup[] = [
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT-5, GPT-4, o-series",
    keys: [
      {
        name: "OPENAI_API_KEY",
        label: "OpenAI API Key",
        description: "Direct OpenAI API access",
        url: "https://platform.openai.com/api-keys",
      },
      {
        name: "OPENAI_ORG_ID",
        label: "OpenAI Organization ID",
        description: "Optional org ID for billing/routing",
        url: "https://platform.openai.com/settings/organization/general",
      },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Anthropic API (Opus, Sonnet, Haiku)",
    keys: [
      {
        name: "ANTHROPIC_API_KEY",
        label: "Anthropic API Key",
        description: "Direct Anthropic API access",
        url: "https://console.anthropic.com/settings/keys",
      },
      {
        name: "ANTHROPIC_AUTH_TOKEN",
        label: "Anthropic Auth Token",
        description: "Alternative auth token for Anthropic API",
        url: "https://console.anthropic.com/",
      },
    ],
  },
  {
    id: "google",
    label: "Google",
    description: "Gemini API (direct) — use gcloud CLI for Vertex",
    keys: [
      {
        name: "GEMINI_API_KEY",
        label: "Gemini API Key",
        description: "Google AI Studio (Gemini direct API)",
        url: "https://aistudio.google.com/app/apikey",
      },
      {
        name: "GOOGLE_API_KEY",
        label: "Google API Key",
        description: "Alternative name for Gemini API key",
        url: "https://aistudio.google.com/app/apikey",
      },
    ],
  },
  {
    id: "xai",
    label: "xAI (Grok)",
    description: "Direct xAI API",
    keys: [
      {
        name: "XAI_API_KEY",
        label: "xAI API Key",
        description: "Grok models direct API",
        url: "https://console.x.ai/",
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    description: "DeepSeek direct API",
    keys: [
      {
        name: "DEEPSEEK_API_KEY",
        label: "DeepSeek API Key",
        description: "DeepSeek Chat, Reasoner, Coder",
        url: "https://platform.deepseek.com/api_keys",
      },
    ],
  },
  {
    id: "mistral",
    label: "Mistral AI",
    description: "Mistral direct API",
    keys: [
      {
        name: "MISTRAL_API_KEY",
        label: "Mistral API Key",
        description: "Mistral Large, Codestral, Devstral, Pixtral",
        url: "https://console.mistral.ai/api-keys/",
      },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    description: "Ultra-fast LPU inference",
    keys: [
      {
        name: "GROQ_API_KEY",
        label: "Groq API Key",
        description: "Fast inference for Llama, Gemma, DeepSeek distills",
        url: "https://console.groq.com/keys",
      },
    ],
  },
  {
    id: "cerebras",
    label: "Cerebras",
    description: "Wafer-scale inference",
    keys: [
      {
        name: "CEREBRAS_API_KEY",
        label: "Cerebras API Key",
        description: "Cerebras fast inference for Llama and Qwen",
        url: "https://cloud.cerebras.ai/platform/",
      },
    ],
  },
  {
    id: "gateway",
    label: "AI Gateways",
    description: "Unified access to multiple providers",
    keys: [
      {
        name: "OPENROUTER_API_KEY",
        label: "OpenRouter",
        description: "Unified gateway for 100+ models",
        url: "https://openrouter.ai/keys",
      },
      {
        name: "VERCEL_AI_GATEWAY_KEY",
        label: "Vercel AI Gateway",
        description: "Vercel's unified AI gateway",
        url: "https://vercel.com/dashboard/ai",
      },
    ],
  },
  {
    id: "chinese",
    label: "Chinese Providers",
    description: "Qwen, Z.AI, Moonshot",
    keys: [
      {
        name: "DASHSCOPE_API_KEY",
        label: "Alibaba DashScope (Qwen)",
        description: "Qwen3 Max, Coder Plus, VL Plus",
        url: "https://dashscope.console.aliyun.com/apiKey",
      },
      {
        name: "ZHIPU_API_KEY",
        label: "Z.AI / Zhipu",
        description: "GLM models",
        url: "https://open.bigmodel.cn/usercenter/apikeys",
      },
      {
        name: "MOONSHOT_API_KEY",
        label: "Moonshot (Kimi)",
        description: "Kimi K2 Thinking, Coding",
        url: "https://platform.moonshot.cn/console/api-keys",
      },
    ],
  },
  {
    id: "search",
    label: "Search Providers",
    description: "Web search for research phases",
    keys: [
      {
        name: "TAVILY_API_KEY",
        label: "Tavily",
        description: "AI-optimized search API (used by GSD research phases)",
        url: "https://app.tavily.com/home",
      },
      {
        name: "BRAVE_API_KEY",
        label: "Brave Search",
        description: "Independent search index",
        url: "https://api.search.brave.com/app/keys",
      },
      {
        name: "EXA_API_KEY",
        label: "Exa",
        description: "Neural search for developers",
        url: "https://dashboard.exa.ai/api-keys",
      },
      {
        name: "GOOGLE_SEARCH_API_KEY",
        label: "Google Custom Search",
        description: "Google programmable search (needs CSE ID too)",
        url: "https://developers.google.com/custom-search/v1/overview",
      },
      {
        name: "GOOGLE_CSE_ID",
        label: "Google CSE ID",
        description: "Custom Search Engine ID (paired with Google Search key)",
        url: "https://programmablesearchengine.google.com/",
      },
    ],
  },
  {
    id: "cloud",
    label: "Cloud Credentials",
    description: "AWS Bedrock, Azure OpenAI",
    keys: [
      {
        name: "AWS_ACCESS_KEY_ID",
        label: "AWS Access Key ID",
        description: "For Bedrock access (prefer IAM roles when possible)",
        url: "https://console.aws.amazon.com/iam/home#/security_credentials",
      },
      {
        name: "AWS_SECRET_ACCESS_KEY",
        label: "AWS Secret Access Key",
        description: "Paired with AWS_ACCESS_KEY_ID",
        url: "https://console.aws.amazon.com/iam/home#/security_credentials",
      },
      {
        name: "AWS_REGION",
        label: "AWS Region",
        description: "e.g. us-east-1, us-west-2",
      },
      {
        name: "AZURE_OPENAI_API_KEY",
        label: "Azure OpenAI Key",
        description: "Azure-hosted OpenAI models",
        url: "https://portal.azure.com/",
      },
      {
        name: "AZURE_OPENAI_ENDPOINT",
        label: "Azure OpenAI Endpoint",
        description: "https://YOUR-RESOURCE.openai.azure.com/",
      },
    ],
  },
];

/** OAuth / CLI-based auth providers (not API keys). */
interface OAuthProvider {
  id: string;
  label: string;
  description: string;
  binary: string;
  installCmd: string;
  authCmd: string;
  docsUrl: string;
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    description: "Google Gemini CLI with subscription auth.",
    binary: "gemini",
    installCmd: "npm install -g @google/gemini-cli",
    authCmd: "gemini auth",
    docsUrl: "https://github.com/google-gemini/gemini-cli",
  },
  {
    id: "github",
    label: "GitHub CLI (Copilot)",
    description: "Auth for GitHub Copilot models via gh CLI.",
    binary: "gh",
    installCmd: "brew install gh",
    authCmd: "gh auth login",
    docsUrl: "https://cli.github.com/",
  },
  {
    id: "gcloud",
    label: "Google Cloud (Vertex AI)",
    description: "gcloud application-default login for Vertex AI (multi-vendor models via GCP).",
    binary: "gcloud",
    installCmd: "brew install --cask google-cloud-sdk",
    authCmd: "gcloud auth application-default login",
    docsUrl: "https://cloud.google.com/sdk/docs/install",
  },
  {
    id: "claude-code",
    label: "Claude Code CLI",
    description: "Anthropic CLI with subscription auth (no per-token API billing when using subscription).",
    binary: "claude",
    installCmd: "npm install -g @anthropic-ai/claude-code",
    authCmd: "claude /login",
    docsUrl: "https://docs.claude.com/en/docs/claude-code",
  },
];

// Flatten all key names for bulk status fetch
const ALL_KEY_NAMES = KEY_GROUPS.flatMap((g) => g.keys.map((k) => k.name));

export function ApiKeysSection() {
  const backend = useConfigBackend();
  const [statuses, setStatuses] = useState<Record<string, KeyStatus>>({});
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [cliStatus, setCliStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [filter, setFilter] = useState("");

  const refreshStatuses = useCallback(async () => {
    try {
      setError("");
      const list = await backend.listKeyStatuses(ALL_KEY_NAMES);
      const map: Record<string, KeyStatus> = {};
      for (const s of list) map[s.name] = s;
      setStatuses(map);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const refreshCliStatus = useCallback(async () => {
    if (!backend.canCheckCli()) {
      setCliStatus({});
      return;
    }
    const entries: Record<string, boolean> = {};
    for (const p of OAUTH_PROVIDERS) {
      try {
        entries[p.id] = await backend.checkCliInstalled(p.binary);
      } catch {
        entries[p.id] = false;
      }
    }
    setCliStatus(entries);
  }, [backend]);

  useEffect(() => { refreshStatuses(); refreshCliStatus(); }, [refreshStatuses, refreshCliStatus]);

  const startEdit = async (name: string) => {
    try {
      const v = await backend.getKey(name);
      setEditing((p) => ({ ...p, [name]: v ?? "" }));
    } catch (e) {
      setError(String(e));
    }
  };

  const saveKey = async (name: string) => {
    try {
      const value = editing[name] ?? "";
      if (value) {
        await backend.setKey(name, value);
      } else {
        await backend.deleteKey(name);
      }
      setEditing((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
      await refreshStatuses();
    } catch (e) {
      setError(String(e));
    }
  };

  const cancelEdit = (name: string) => {
    setEditing((p) => {
      const next = { ...p };
      delete next[name];
      return next;
    });
  };

  const clearKey = async (name: string) => {
    if (!confirm(`Delete key ${name}?`)) return;
    try {
      await backend.deleteKey(name);
      setEditing((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
      await refreshStatuses();
    } catch (e) {
      setError(String(e));
    }
  };

  const toggleReveal = (name: string) => {
    setRevealed((p) => ({ ...p, [name]: !p[name] }));
  };

  const exportEnv = async () => {
    try {
      const path = await backend.exportEnvFile(ALL_KEY_NAMES);
      setExportMsg(`Exported to ${path}`);
      setTimeout(() => setExportMsg(""), 4000);
    } catch (e) {
      setError(String(e));
    }
  };

  const openExternal = async (url: string) => {
    try {
      await backend.openUrl(url);
    } catch (e) {
      setError(String(e));
    }
  };

  const setCount = Object.values(statuses).filter((s) => s.is_set).length;

  // Filter groups + keys by search
  const filteredGroups = KEY_GROUPS.map((g) => ({
    ...g,
    keys: g.keys.filter((k) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        k.name.toLowerCase().includes(q) ||
        k.label.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q) ||
        g.label.toLowerCase().includes(q)
      );
    }),
  })).filter((g) => g.keys.length > 0);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <SectionHeader
          title="API Keys & Auth"
          description={
            backend.isWeb()
              ? "Store keys in this browser workspace (export env.sh to copy to your machine). CLI detection requires the desktop app."
              : "Store provider keys securely in the macOS Keychain. Export to ~/.gsd/env.sh to source into your shell."
          }
        />
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {setCount} / {ALL_KEY_NAMES.length} set
          </span>
          <Button type="button" variant="default" size="sm" onClick={exportEnv}>
            Export env.sh
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-center justify-between rounded-none border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
        >
          <span>{error}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}
      {exportMsg && (
        <div className="mb-3 rounded-none border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
          {exportMsg}
        </div>
      )}

      <Input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search keys..."
        aria-label="Search keys"
        className="mb-4"
      />

      {/* OAuth / CLI-based providers */}
      <div className="mb-6">
        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          OAuth / CLI Auth (subscription-based)
        </h3>
        {!backend.canCheckCli() && (
          <p className="mb-2 px-1 text-xs text-muted-foreground">
            Install and run these CLIs on your machine — the web app cannot detect them. Use the
            desktop app for live CLI status.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {OAUTH_PROVIDERS.map((p) => {
            const installed = cliStatus[p.id];
            return (
              <div
                key={p.id}
                className="rounded-none border border-border bg-card p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{p.label}</h4>
                  {installed === undefined ? (
                    <span className="text-xs text-muted-foreground">checking...</span>
                  ) : installed ? (
                    <span className="rounded-none border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                      Installed
                    </span>
                  ) : (
                    <span className="rounded-none border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Not found
                    </span>
                  )}
                </div>
                <p className="mb-2 text-xs leading-snug text-muted-foreground">{p.description}</p>
                {!installed && (
                  <div className="mb-2">
                    <div className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Install</div>
                    <code className="block break-all rounded-none bg-background px-2 py-1 font-mono text-xs text-primary">
                      {p.installCmd}
                    </code>
                  </div>
                )}
                <div className="mb-2">
                  <div className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sign in</div>
                  <code className="block break-all rounded-none bg-background px-2 py-1 font-mono text-xs text-primary">
                    {p.authCmd}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => openExternal(p.docsUrl)}
                  className="text-xs text-primary hover:underline"
                >
                  Open docs →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key groups */}
      {filteredGroups.map((g) => (
        <div key={g.id} className="mb-5">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label} — {g.description}
          </h3>
          <div className="overflow-hidden rounded-none border border-border bg-card">
            {g.keys.map((k, i) => {
              const status = statuses[k.name];
              const isEditing = k.name in editing;
              const isRevealed = !!revealed[k.name];
              return (
                <div
                  key={k.name}
                  className={`p-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{k.label}</span>
                        <code className="font-mono text-xs text-muted-foreground">{k.name}</code>
                        {status?.is_set && !isEditing && (
                          <span className="rounded-none border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                            Set
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{k.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {k.url && !isEditing && (
                        <button
                          type="button"
                          onClick={() => openExternal(k.url!)}
                          className="px-1 text-xs text-primary hover:underline"
                          title="Get key"
                        >
                          Get key ↗
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Input
                        type={isRevealed ? "text" : "password"}
                        value={editing[k.name]}
                        onChange={(e) => setEditing((p) => ({ ...p, [k.name]: e.target.value }))}
                        placeholder="Paste key value"
                        className="min-w-0 flex-1 font-mono text-xs"
                        aria-label={`${k.label} value`}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReveal(k.name)}
                      >
                        {isRevealed ? "Hide" : "Show"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEdit(k.name)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => saveKey(k.name)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {status?.is_set ? `••••••••${status.preview ?? ""}` : "not set"}
                      </span>
                      <div className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(k.name)}
                      >
                        {status?.is_set ? "Edit" : "Set"}
                      </Button>
                      {status?.is_set && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10"
                          onClick={() => clearKey(k.name)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-1">
          <strong className="text-muted-foreground">Storage:</strong> Keys are stored in your OS keychain (macOS Keychain, Linux Secret Service, Windows Credential Manager). They never touch disk in plain text.
        </p>
        <p className="mb-1">
          <strong className="text-muted-foreground">Shell integration:</strong> Click <em>Export env.sh</em> to write a sourceable file at <code className="rounded-none bg-card px-1">~/.gsd/env.sh</code>, then add this to your <code className="rounded-none bg-card px-1">~/.zshrc</code>:
        </p>
        <code className="block rounded-none bg-background px-2 py-1 font-mono text-xs text-primary">
          [ -f ~/.gsd/env.sh ] && source ~/.gsd/env.sh
        </code>
      </div>
    </div>
  );
}
