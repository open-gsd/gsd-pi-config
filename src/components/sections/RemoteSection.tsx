// GSD Pi Config - Remote Questions Settings Section
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { GSDPreferences, RemoteQuestionsConfig, RemoteChannel } from "../../types";
import { Field, SelectField, NumberField, TextField, SectionHeader } from "../FormControls";

interface Props {
  prefs: GSDPreferences;
  onChange: (prefs: GSDPreferences) => void;
}

export function RemoteSection({ prefs, onChange }: Props) {
  const rawRemote = prefs.remote_questions ?? {};
  // Discord/Slack channel IDs are opaque snowflakes that exceed JS's
  // MAX_SAFE_INTEGER. If the YAML file stored the ID unquoted, it arrives
  // here as a precision-lossy number. Coerce to string on read and any
  // downstream edits will stay clean. The Rust load path also normalizes,
  // but this guards against any code path that bypasses it.
  const remote: RemoteQuestionsConfig = {
    ...rawRemote,
    channel_id:
      rawRemote.channel_id == null
        ? undefined
        : typeof rawRemote.channel_id === "string"
          ? rawRemote.channel_id
          : String(rawRemote.channel_id),
  };
  const setRemote = (update: Partial<RemoteQuestionsConfig>) => {
    const merged = { ...remote, ...update };
    const hasValues = merged.channel || merged.channel_id;
    onChange({ ...prefs, remote_questions: hasValues ? merged : undefined });
  };

  return (
    <div>
      <SectionHeader
        title="Remote Questions"
        description="Route interactive questions to Slack, Discord, or Telegram when running unattended."
      />

      <Field path="remote_questions.channel" value={remote.channel} label="Channel" description="Platform to route questions to.">
        <SelectField<RemoteChannel>
          value={remote.channel}
          onChange={(v) => setRemote({ channel: v })}
          options={["slack", "discord", "telegram"]}
          placeholder="Not configured"
        />
      </Field>

      <Field path="remote_questions.channel_id" value={remote.channel_id} label="Channel ID" description="The channel/room ID to send questions to.">
        <TextField
          value={remote.channel_id}
          onChange={(v) => setRemote({ channel_id: v })}
          placeholder="Channel ID"
          className="w-52"
        />
      </Field>

      <Field path="remote_questions.timeout_minutes" value={remote.timeout_minutes} label="Timeout (minutes)" description="How long to wait for an answer (1-1440).">
        <NumberField
          value={remote.timeout_minutes}
          onChange={(v) => setRemote({ timeout_minutes: v })}
          min={1}
          max={1440}
          placeholder="10"
        />
      </Field>

      <Field path="remote_questions.poll_interval_seconds" value={remote.poll_interval_seconds} label="Poll Interval (seconds)" description="How often to check for answers (1-600).">
        <NumberField
          value={remote.poll_interval_seconds}
          onChange={(v) => setRemote({ poll_interval_seconds: v })}
          min={1}
          max={600}
          placeholder="5"
        />
      </Field>
    </div>
  );
}
