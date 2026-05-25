// GSD Pi Config - Theme Toggle (system / dark / light segmented control)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useTheme, type ThemePreference } from "../lib/theme";
import { btnSegment, btnSegmentActive, segmentGroup } from "../lib/uiClasses";

const OPTIONS: { value: ThemePreference; label: string; title: string }[] = [
  { value: "system", label: "Auto", title: "Follow system theme" },
  { value: "dark", label: "Dark", title: "Force dark theme" },
  { value: "light", label: "Light", title: "Force light theme" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={segmentGroup} role="radiogroup"
      aria-label="Theme"
    >
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
            className={`text-xs font-medium ${active ? btnSegmentActive : btnSegment}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
