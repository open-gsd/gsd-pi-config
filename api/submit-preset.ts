// GSD Pi Config - GitHub preset submit API (Vercel serverless)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>
//
// Env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PRESETS_REPO (default open-gsd/gsd-pi-presets)

import type { VercelRequest, VercelResponse } from "@vercel/node";

const PRESETS_REPO = process.env.PRESETS_REPO ?? "open-gsd/gsd-pi-presets";
const GITHUB_API = "https://api.github.com";

interface SubmitBody {
  code?: string;
  redirectUri?: string;
  accessToken?: string;
  slug?: string;
  title?: string;
  description?: string;
  presetMarkdown?: string;
}

async function exchangeCode(code: string, redirectUri: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured on the server");
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "OAuth token exchange failed");
  }
  return data.access_token;
}

async function gh(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
}

async function createPresetPr(
  token: string,
  slug: string,
  title: string,
  description: string,
  presetMarkdown: string,
): Promise<string> {
  const [owner, repo] = PRESETS_REPO.split("/");
  if (!owner || !repo) throw new Error("Invalid PRESETS_REPO");

  const userRes = await gh(token, "/user");
  const user = (await userRes.json()) as { login?: string };
  if (!user.login) throw new Error("Could not read GitHub user");

  const forkRes = await gh(token, `/repos/${owner}/${repo}/forks`, { method: "POST" });
  if (!forkRes.ok && forkRes.status !== 422) {
    const err = await forkRes.text();
    throw new Error(`Fork failed: ${err}`);
  }

  const forkOwner = user.login;
  const branch = `preset/${slug}-${Date.now()}`;
  const filePath = `presets/${slug}.preset.md`;

  const refRes = await gh(token, `/repos/${forkOwner}/${repo}/git/ref/heads/main`);
  if (!refRes.ok) throw new Error("Could not read main branch on fork");
  const refData = (await refRes.json()) as { object: { sha: string } };
  const baseSha = refData.object.sha;

  await gh(token, `/repos/${forkOwner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  });

  const frontmatter = `title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
tags: []
author: ${JSON.stringify(forkOwner)}
`;
  const fullContent =
    presetMarkdown.trimStart().startsWith("---")
      ? presetMarkdown
      : `---\n${frontmatter}---\n${presetMarkdown.replace(/^---[\s\S]*?---\n?/, "")}`;

  const contentB64 = Buffer.from(fullContent, "utf8").toString("base64");

  const putRes = await gh(token, `/repos/${forkOwner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Add preset: ${title}`,
      content: contentB64,
      branch,
    }),
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`Commit failed: ${err}`);
  }

  const prRes = await gh(token, `/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Add preset: ${title}`,
      head: `${forkOwner}:${branch}`,
      base: "main",
      body: `${description}\n\nSubmitted via GSD Pi Config web.`,
    }),
  });
  if (!prRes.ok) {
    const err = await prRes.text();
    throw new Error(`PR failed: ${err}`);
  }
  const pr = (await prRes.json()) as { html_url: string };
  return pr.html_url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body as SubmitBody;
    let token = body.accessToken;
    if (body.code && body.redirectUri) {
      token = await exchangeCode(body.code, body.redirectUri);
    }
    if (!token) {
      res.status(400).json({ error: "Missing access token or OAuth code" });
      return;
    }
    if (!body.slug || !body.presetMarkdown) {
      res.status(400).json({ error: "Missing slug or presetMarkdown" });
      return;
    }

    const prUrl = await createPresetPr(
      token,
      body.slug,
      body.title ?? body.slug,
      body.description ?? "",
      body.presetMarkdown,
    );
    res.status(200).json({ prUrl });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
