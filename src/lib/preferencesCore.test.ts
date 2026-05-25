// GSD Pi Config - preferencesCore tests (mirrors Rust unit tests)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { describe, expect, it } from "vitest";
import type { GSDPreferences, WorkflowMode } from "../types";
import {
  buildShareablePreset,
  loadPreferencesFromText,
  normalizeStringyIds,
  redactSensitive,
  serializePreferences,
  type JsonValue,
} from "./preferencesCore";

describe("loadPreferencesFromText", () => {
  it("round-trips snowflake channel_id as string", () => {
    const original: GSDPreferences = {
      mode: "solo" as WorkflowMode,
      remote_questions: {
        channel_id: "1234567890123456789",
        channel: "discord",
      },
      verification_commands: ["npm run build", "cargo test"],
    };
    const markdown = serializePreferences(original);
    const loaded = loadPreferencesFromText(markdown);
    expect(loaded).toEqual(original);
    expect(loaded.remote_questions?.channel_id).toBe("1234567890123456789");
  });

  it("preserves quoted snowflake channel_id from YAML", () => {
    const yaml = `---
mode: solo
remote_questions:
  channel_id: "1234567890123456789"
  channel: discord
---
`;
    const loaded = loadPreferencesFromText(yaml);
    expect(loaded.remote_questions?.channel_id).toBe("1234567890123456789");
  });

  it("coerces small numeric channel_id to string", () => {
    const yaml = `---
remote_questions:
  channel_id: 42
---
`;
    const loaded = loadPreferencesFromText(yaml);
    expect(loaded.remote_questions?.channel_id).toBe("42");
  });
});

describe("redactSensitive", () => {
  it("redacts sensitive string keys case-insensitively", () => {
    const v = {
      API_KEY: "aaa",
      Token: "bbb",
      SECRET: "ccc",
      safe: "visible",
    };
    redactSensitive(v as JsonValue);
    expect((v as Record<string, string>).API_KEY).toBe("<redacted>");
    expect(v.Token).toBe("<redacted>");
    expect(v.SECRET).toBe("<redacted>");
    expect(v.safe).toBe("visible");
  });
});

describe("buildShareablePreset", () => {
  it("emits fenced yaml block without raw secrets", () => {
    const out = buildShareablePreset({
      mode: "solo",
      api_key: "shouldnotleak",
    } as never);
    expect(out.startsWith("```yaml\n")).toBe(true);
    expect(out.trimEnd().endsWith("```")).toBe(true);
    expect(out).toContain("mode: solo");
    expect(out).toContain("<redacted>");
    expect(out).not.toContain("shouldnotleak");
  });
});

describe("normalizeStringyIds", () => {
  it("removes invalid channel_id shapes", () => {
    const v = {
      remote_questions: { channel_id: { bad: true } },
    };
    normalizeStringyIds(v as Record<string, JsonValue>);
    expect(
      (v.remote_questions as Record<string, unknown>).channel_id,
    ).toBeUndefined();
  });
});
