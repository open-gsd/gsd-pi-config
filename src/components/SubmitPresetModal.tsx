// GSD Pi Config - Submit preset to gallery (GitHub PR)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";
import { cleanPrefs } from "../lib/cleanPrefs";
import {
  buildShareablePreset,
  scanForLeakedSecrets,
  serializePreferences,
} from "../lib/preferencesCore";
import { PRESETS_CONTRIBUTING_URL } from "../lib/presetsCatalog";
import { readWebDraftMeta } from "../platform/web";
import type { GSDPreferences } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BUILD_TIME_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? "";
const SUBMIT_API_URL = import.meta.env.VITE_SUBMIT_PRESET_API_URL ?? "/api/submit-preset";
const OAUTH_CONFIG_URL = "/api/oauth-config";

async function resolveGitHubClientId(): Promise<string> {
  if (BUILD_TIME_CLIENT_ID) return BUILD_TIME_CLIENT_ID;
  try {
    const res = await fetch(OAUTH_CONFIG_URL);
    if (!res.ok) return "";
    const data = (await res.json()) as { clientId?: string };
    return data.clientId ?? "";
  } catch {
    return "";
  }
}

interface SubmitPresetModalProps {
  open: boolean;
  prefs: GSDPreferences;
  onClose: () => void;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function SubmitPresetModal({ open, prefs, onClose }: SubmitPresetModalProps) {
  const meta = readWebDraftMeta();
  const [slug, setSlug] = useState(meta.sourcePresetSlug ?? slugify(meta.title ?? "my-preset"));
  const [title, setTitle] = useState(meta.title ?? "");
  const [description, setDescription] = useState(meta.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prUrl, setPrUrl] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      setPrUrl("");
      setBusy(false);
    }
  }, [open]);

  const startOAuth = async () => {
    const githubClientId = await resolveGitHubClientId();
    if (!githubClientId) {
      setError("GitHub OAuth is not configured. Use the manual PR link below.");
      return;
    }
    const cleaned = cleanPrefs(prefs as unknown as Record<string, unknown>) as GSDPreferences;
    const markdown = serializePreferences(cleaned);
    const leaks = scanForLeakedSecrets(markdown);
    if (leaks.length > 0) {
      setError(`Remove secrets before submitting: ${leaks.join("; ")}`);
      return;
    }
    const redirect = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/oauth/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem("gsd-oauth-state", state);
    sessionStorage.setItem(
      "gsd-oauth-pending-submit",
      JSON.stringify({
        slug: slugify(slug),
        title: title.trim() || slugify(slug),
        description: description.trim(),
        presetMarkdown: markdown,
      }),
    );
    const params = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: redirect,
      scope: "public_repo",
      state,
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold">Submit to gallery</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Opens a pull request on{" "}
            <code className="font-mono text-xs">open-gsd/gsd-pi-presets</code>. Content is
            redacted for review — see preview in Share.
          </DialogDescription>
        </DialogHeader>

        {prUrl ? (
          <>
            <div className="min-h-0 flex-1 space-y-2 overflow-auto px-5 py-4">
              <p className="text-sm text-foreground">Pull request created:</p>
              <a
                href={prUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm text-primary hover:underline"
              >
                {prUrl}
              </a>
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-none border-t border-border px-5 py-3 sm:justify-end">
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto px-5 py-4">
              <label className="block text-xs text-muted-foreground">
                Slug (filename)
                <Input
                  className="mt-1 rounded-none"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Title
                <Input
                  className="mt-1 rounded-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Description
                <Textarea
                  className="mt-1 min-h-0 rounded-none"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Or{" "}
                <a
                  href={PRESETS_CONTRIBUTING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-foreground"
                >
                  open a manual PR
                </a>
                . Preview redacted YAML:{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:text-foreground"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      buildShareablePreset(
                        cleanPrefs(prefs as unknown as Record<string, unknown>) as GSDPreferences,
                      ),
                    );
                  }}
                >
                  copy share block
                </button>
              </p>
            </div>

            <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-none border-t border-border px-5 py-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void startOAuth()}
              >
                {busy ? "Submitting…" : "Sign in with GitHub"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PendingSubmit {
  slug: string;
  title: string;
  description: string;
  presetMarkdown: string;
}

/** Call from OAuth callback route with code from GitHub redirect. */
export async function completeOAuthSubmit(code: string): Promise<string> {
  const pendingRaw = sessionStorage.getItem("gsd-oauth-pending-submit");
  const state = sessionStorage.getItem("gsd-oauth-state");
  const urlState = new URLSearchParams(window.location.search).get("state");
  if (!pendingRaw || !state || state !== urlState) {
    throw new Error("OAuth state mismatch");
  }
  const pending = JSON.parse(pendingRaw) as PendingSubmit;
  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/oauth/callback`;

  const res = await fetch(SUBMIT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      redirectUri,
      ...pending,
    }),
  });
  const data = (await res.json()) as { prUrl?: string; error?: string };
  sessionStorage.removeItem("gsd-oauth-pending-submit");
  sessionStorage.removeItem("gsd-oauth-state");
  if (!res.ok || !data.prUrl) {
    throw new Error(data.error ?? `Submit failed (${res.status})`);
  }
  sessionStorage.setItem("gsd-oauth-pr-url", data.prUrl);
  return data.prUrl;
}
