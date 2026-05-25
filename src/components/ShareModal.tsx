// GSD Pi Config - Share Modal (redacted preset copy-to-clipboard)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";
import { btn, btnPrimary, modalPanel } from "../lib/uiClasses";

interface ShareModalProps {
  open: boolean;
  content: string;
  onClose: () => void;
}

/**
 * Confirm-before-copy modal for shareable preset export. Shows the exact
 * bytes that will be written to the clipboard so the user can review what
 * leaves the app before pasting it anywhere public.
 */
export function ShareModal({ open, content, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in some Tauri webviews on permission error;
      // fall back to a textarea selection hack.
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden ${modalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gsd-border">
          <div>
            <h2 className="gsd-heading text-sm font-semibold text-gsd-text">Share preset</h2>
            <p className="gsd-prose mt-1 text-xs text-gsd-text-dim">
              Values under keys containing <code>key</code>, <code>token</code>,{" "}
              <code>secret</code>, or <code>password</code> are redacted. Review the block
              below before copying — this is exactly what will land on your clipboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${btn} min-w-10 !px-0 text-lg leading-none`}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          <pre className="text-xs font-mono text-gsd-text bg-gsd-bg border border-gsd-border rounded-md p-3 whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gsd-border">
          <button type="button" onClick={onClose} className={btn}>
            Cancel
          </button>
          <button type="button" onClick={() => void copy()} className={btnPrimary}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
