// GSD Pi Config - GitHub OAuth callback (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { completeOAuthSubmit } from "../components/SubmitPresetModal";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) {
      setError("Missing authorization code");
      return;
    }
    void (async () => {
      try {
        const prUrl = await completeOAuthSubmit(code);
        navigate("/", { replace: true, state: { prUrl } });
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gsd-bg text-gsd-text p-6">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <p className="text-gsd-danger text-sm">{error}</p>
            <Link to="/" className="text-gsd-accent text-sm mt-4 inline-block">
              Back to editor
            </Link>
          </>
        ) : (
          <p className="text-sm text-gsd-text-dim">Completing sign-in…</p>
        )}
      </div>
    </div>
  );
}
