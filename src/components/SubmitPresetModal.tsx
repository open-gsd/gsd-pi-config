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
import { btn, btnPrimary, heading, modalPanel, prose } from "../lib/uiClasses";

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? "";
const SUBMIT_API_URL = import.meta.env.VITE_SUBMIT_PRESET_API_URL ?? "/api/submit-preset";

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
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const startOAuth = () => {
    if (!GITHUB_CLIENT_ID) {
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
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirect,
      scope: "public_repo",
      state,
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg p-5 ${modalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`${heading} text-sm font-semibold text-gsd-text`}>Submit to gallery</h2>
        <p className={`${prose} text-xs text-gsd-text-dim mt-1`}>
          Opens a pull request on{" "}
          <code className="text-[10px]">open-gsd/gsd-pi-presets</code>. Content is redacted
          for review — see preview in Share.
        </p>

        {prUrl ? (
          <div className="mt-4">
            <p className="text-sm text-gsd-text">Pull request created:</p>
            <a
              href={prUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gsd-accent break-all"
            >
              {prUrl}
            </a>
            <button
              type="button"
              onClick={onClose}
              className={`mt-4 ${btnPrimary}`}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-gsd-text-dim">
                Slug (filename)
                <input
                  className="mt-1 w-full"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </label>
              <label className="block text-xs text-gsd-text-dim">
                Title
                <input
                  className="mt-1 w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="block text-xs text-gsd-text-dim">
                Description
                <textarea
                  className="mt-1 w-full"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>

            {error && (
              <p className="mt-3 text-xs text-gsd-danger">{error}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => startOAuth()}
                className={btnPrimary}
              >
                {busy ? "Submitting…" : "Sign in with GitHub"}
              </button>
              <button type="button" onClick={onClose} className={btn}>
                Cancel
              </button>
            </div>
            <p className="mt-4 text-[10px] text-gsd-text-muted">
              Or{" "}
              <a
                href={PRESETS_CONTRIBUTING_URL}
                target="_blank"
                rel="noreferrer"
                className="text-gsd-accent"
              >
                open a manual PR
              </a>
              . Preview redacted YAML:{" "}
              <button
                type="button"
                className="text-gsd-accent underline"
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
          </>
        )}
      </div>
    </div>
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
