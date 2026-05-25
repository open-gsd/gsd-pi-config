// GSD Pi Config - public OAuth client id for browser (Vercel serverless)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID ?? "";
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).json({
    clientId,
    configured: Boolean(clientId && process.env.GITHUB_CLIENT_SECRET),
    clientIdSet: Boolean(clientId),
    clientSecretSet: Boolean(process.env.GITHUB_CLIENT_SECRET),
  });
}
