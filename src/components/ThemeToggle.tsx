// GSD Pi Config - Theme Toggle (system / dark / light text trio)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useTheme, type ThemePreference } from "../lib/theme";
import { cn } from "../lib/utils";

const OPTIONS: { value: ThemePreference; label: string; title: string }[] = [
  { value: "system", label: "Auto", title: "Follow system theme" },
  { value: "dark", label: "Dark", title: "Force dark theme" },
  { value: "light", label: "Light", title: "Force light theme" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            title={opt.title}
            className={cn(
              "inline-flex items-center justify-center min-h-10 px-2 text-xs border-b border-transparent",
              "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "border-primary text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-normal",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
