// GSD Pi Config - Open GSD brand mark (opengsd.net)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import opengsdLogo from "../assets/opengsd-logo.png";

interface BrandMarkProps {
  /** sm: shell header · md: desktop sidebar */
  size?: "sm" | "md";
  /** Secondary line under the title */
  subtitle?: string;
  className?: string;
}

export function BrandMark({ size = "sm", subtitle, className = "" }: BrandMarkProps) {
  const img = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <span className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src={opengsdLogo}
        alt=""
        className={`${img} shrink-0 rounded-sm object-contain`}
        width={36}
        height={36}
        decoding="async"
      />
      <span className="flex min-w-0 flex-col justify-center leading-none">
        <span className="text-sm font-semibold tracking-tight text-gsd-text truncate">
          Open GSD
        </span>
        {subtitle && (
          <span className="text-[10px] text-gsd-text-muted mt-1 tracking-wide truncate">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
