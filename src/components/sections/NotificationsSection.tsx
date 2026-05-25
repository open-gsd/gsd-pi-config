// GSD Pi Config - Notifications Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, NotificationPreferences } from "../../types";
import { Field, Toggle, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function NotificationsSection({ prefs, onChange }: Props) {
  const notif = prefs.notifications ?? {};
  const setNotif = (update: Partial<NotificationPreferences>) =>
    onChange({ ...prefs, notifications: { ...notif, ...update } });

  return (
    <div>
      <SectionHeader
        title="Notifications"
        description="Desktop notification behavior for GSD events."
      />

      <Field path="notifications.enabled" label="Enabled" description="Master toggle for all notifications.">
        <Toggle checked={notif.enabled ?? true} onChange={(v) => setNotif({ enabled: v })} />
      </Field>

      <Field path="notifications.on_complete" label="On Complete" description="Notify when a unit completes.">
        <Toggle checked={notif.on_complete ?? true} onChange={(v) => setNotif({ on_complete: v })} />
      </Field>

      <Field path="notifications.on_error" label="On Error" description="Notify on errors.">
        <Toggle checked={notif.on_error ?? true} onChange={(v) => setNotif({ on_error: v })} />
      </Field>

      <Field path="notifications.on_budget" label="On Budget" description="Notify on budget thresholds.">
        <Toggle checked={notif.on_budget ?? true} onChange={(v) => setNotif({ on_budget: v })} />
      </Field>

      <Field path="notifications.on_milestone" label="On Milestone" description="Notify when a milestone finishes.">
        <Toggle checked={notif.on_milestone ?? true} onChange={(v) => setNotif({ on_milestone: v })} />
      </Field>

      <Field path="notifications.on_attention" label="On Attention" description="Notify when manual attention is needed.">
        <Toggle checked={notif.on_attention ?? true} onChange={(v) => setNotif({ on_attention: v })} />
      </Field>
    </div>
  );
}
