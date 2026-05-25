// GSD Pi Config - CMux Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, CmuxPreferences } from "../../types";
import { Field, Toggle, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function CmuxSection({ prefs, onChange }: Props) {
  const cmux = prefs.cmux ?? {};
  const setCmux = (update: Partial<CmuxPreferences>) =>
    onChange({ ...prefs, cmux: { ...cmux, ...update } });

  return (
    <div>
      <SectionHeader
        title="CMux"
        description="Terminal multiplexer integration for notifications, sidebar metadata, and split panes."
      />

      <Field path="cmux.enabled" label="Enabled" description="Enable CMux integration.">
        <Toggle checked={cmux.enabled ?? false} onChange={(v) => setCmux({ enabled: v })} />
      </Field>

      <Field path="cmux.notifications" label="Notifications" description="Route notifications through CMux.">
        <Toggle checked={cmux.notifications ?? true} onChange={(v) => setCmux({ notifications: v })} />
      </Field>

      <Field path="cmux.sidebar" label="Sidebar" description="Publish metadata to CMux sidebar.">
        <Toggle checked={cmux.sidebar ?? true} onChange={(v) => setCmux({ sidebar: v })} />
      </Field>

      <Field path="cmux.splits" label="Splits" description="Run subagent work in visible CMux splits.">
        <Toggle checked={cmux.splits ?? false} onChange={(v) => setCmux({ splits: v })} />
      </Field>

      <Field path="cmux.browser" label="Browser" description="Future browser integration flag.">
        <Toggle checked={cmux.browser ?? false} onChange={(v) => setCmux({ browser: v })} />
      </Field>
    </div>
  );
}
