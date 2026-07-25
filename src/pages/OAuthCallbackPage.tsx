// GSD Pi Config - GitHub OAuth callback (web)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { completeOAuthSubmit } from "../components/SubmitPresetModal";
import { WebShell } from "../components/WebShell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <WebShell active="editor">
      <main className="flex flex-1 items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md text-center">
          {error ? (
            <>
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
              <Link
                to="/"
                className={cn(buttonVariants({ variant: "link" }), "mt-4 inline-flex")}
              >
                Back to editor
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
          )}
        </div>
      </main>
    </WebShell>
  );
}
