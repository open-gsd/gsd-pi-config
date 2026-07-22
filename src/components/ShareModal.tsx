// GSD Pi Config - Share Modal (redacted preset copy-to-clipboard)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareModalProps {
  open: boolean;
  content: string;
  onClose: () => void;
  /** Defaults to "Share preset"; Gallery preview passes "Preview preset" (D-07). */
  title?: string;
}

/**
 * Confirm-before-copy modal for shareable preset export. Shows the exact
 * bytes that will be written to the clipboard so the user can review what
 * leaves the app before pasting it anywhere public.
 */
export function ShareModal({
  open,
  content,
  onClose,
  title = "Share preset",
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Values under keys containing <code>key</code>, <code>token</code>,{" "}
            <code>secret</code>, or <code>password</code> are redacted. Review the block
            below before copying — this is exactly what will land on your clipboard.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <pre className="whitespace-pre-wrap break-words rounded-none border border-border bg-background p-3 font-mono text-xs text-foreground">
            {content}
          </pre>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-none border-t border-border px-5 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void copy()}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
