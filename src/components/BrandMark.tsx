// GSD Pi Config - Open GSD brand wordmark
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** sm: shell header · md: desktop sidebar */
  size?: "sm" | "md";
  /** Secondary line under the title */
  subtitle?: string;
  className?: string;
}

/**
 * Linear wordmark only (no PNG). Dual-platform tokens via `gsd-text` / `gsd-accent`
 * (web maps those to Mist Sky semantic colors).
 */
export function BrandMark({ size = "sm", subtitle, className = "" }: BrandMarkProps) {
  const titleSize = size === "sm" ? "text-sm" : "text-base";
  const subSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-col justify-center leading-none",
        className,
      )}
    >
      <span
        className={cn(
          titleSize,
          "font-semibold tracking-tight text-gsd-text truncate",
        )}
      >
        Open<span className="text-gsd-accent">GSD</span>
      </span>
      {subtitle ? (
        <span
          className={cn(
            subSize,
            "mt-0.5 tracking-wide text-gsd-text-muted truncate",
          )}
        >
          {subtitle}
        </span>
      ) : null}
    </span>
  );
}
