// GSD Pi Config - Reusable Form Controls
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { getField, type FieldPath } from "../lib/fields";

interface FieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  /**
   * Optional registry path. When supplied, Field pulls the hint tooltip and
   * validator from `src/lib/fields.ts` — section files don't have to thread
   * validation state manually.
   */
  path?: FieldPath;
  /**
   * Current value for the field. Required when `path` is set and the
   * registry entry has a validator. Used to compute the inline error.
   */
  value?: unknown;
}

export function Field({ label, description, children, path, value }: FieldProps) {
  const meta = path ? getField(path) : undefined;
  const error =
    meta?.validator && value !== undefined && value !== null && value !== ""
      ? meta.validator(value)
      : null;

  return (
    <div
      className="flex flex-col gap-3 py-3 border-b border-gsd-border last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      data-invalid={error ? "" : undefined}
      data-field-path={path}
    >
      <div className="min-w-0 flex-1">
        <label className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-gsd-text">
          <span className="min-w-0">{label}</span>
          {meta?.hint && (
            <span className="group relative shrink-0">
              <button
                type="button"
                aria-label={meta.hint}
                className="gsd-hint-trigger relative z-[1] flex h-4 w-4 items-center justify-center rounded-full border border-gsd-border text-[9px] font-bold leading-none text-gsd-text-dim cursor-help hover:border-gsd-border-strong hover:text-gsd-text transition-[color,border-color,transform] active:scale-[0.96] focus:outline-none focus-visible:ring-0"
              >
                ?
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[min(16rem,calc(100vw-2rem))] rounded-md border border-gsd-border-strong bg-gsd-surface-solid px-2.5 py-1.5 text-xs font-normal leading-snug text-gsd-text shadow-xl opacity-0 translate-y-[-2px] transition-[opacity,transform] duration-100 origin-top-left group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
              >
                {meta.hint}
              </span>
            </span>
          )}
        </label>
        {description && (
          <p className="gsd-prose mt-0.5 text-xs leading-relaxed text-gsd-text-dim">{description}</p>
        )}
        {error && <p className="mt-1 text-xs text-gsd-danger">{error}</p>}
      </div>
      <div className="gsd-field-control [&_select]:w-full [&_input]:w-full [&_input]:max-w-full sm:[&_select]:w-52 sm:[&_input]:w-52">
        {children}
      </div>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center self-start rounded-full transition-transform active:scale-[0.96] sm:self-center"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? "bg-gsd-accent" : "bg-gsd-border"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
            checked ? "translate-x-4.5 ml-0" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

interface SelectFieldProps<T extends string> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  placeholder?: string;
  allowEmpty?: boolean;
  className?: string;
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Default",
  allowEmpty = true,
  className = "w-full sm:w-52",
}: SelectFieldProps<T>) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
      className={className}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

interface LabeledSelectOption {
  value: string;
  label: string;
}

interface LabeledSelectFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: readonly LabeledSelectOption[];
  placeholder?: string;
  className?: string;
}

/** Dropdown with human-readable labels (value may differ from display text). */
export function LabeledSelectField({
  value,
  onChange,
  options,
  placeholder = "Default",
  className = "w-full sm:w-52",
}: LabeledSelectFieldProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface MultiSelectFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

/** Checkbox dropdown for choosing multiple values from a fixed list. */
export function MultiSelectField({
  values,
  onChange,
  options,
  className = "w-full sm:w-64",
  placeholder = "Select…",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const labelFor = (value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  const summary =
    values.length === 0
      ? placeholder
      : values.length <= 2
        ? values.map(labelFor).join(", ")
        : `${values.length} selected`;

  return (
    <div ref={rootRef} className={`relative text-xs ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="gsd-dropdown-trigger"
      >
        <span className={`min-w-0 flex-1 truncate text-left ${values.length === 0 ? "text-gsd-text-dim" : "text-gsd-text"}`}>
          {summary}
        </span>
        <span className="shrink-0 text-[10px] text-gsd-text-dim" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="gsd-dropdown-panel"
        >
          {options.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <label
                key={opt.value}
                role="option"
                aria-selected={checked}
                className="gsd-dropdown-option"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="shrink-0"
                />
                <span className="min-w-0 truncate">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {values.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {values.map((v) => (
            <span key={v} className="gsd-chip">
              <span className="max-w-[12rem] truncate">{labelFor(v)}</span>
              <button
                type="button"
                aria-label={`Remove ${labelFor(v)}`}
                onClick={() => toggle(v)}
                className="gsd-chip-remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Combo input — a dropdown of known values plus a free-text field.
 * Useful when there's a recommended list but the user can also type custom.
 */
interface ComboFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}

export function ComboField({
  value,
  onChange,
  options,
  placeholder = "Select or type",
  className = "w-full sm:w-52",
}: ComboFieldProps) {
  const listId = `combo-${Math.random().toString(36).slice(2)}`;
  return (
    <>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        list={listId}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}

/**
 * Provider+Model picker. Each option represents a specific auth/routing path
 * (e.g. "OpenAI API" vs "Anthropic API" vs "OpenRouter") paired with a
 * model ID. The emitted value is a `provider/model` qualified string that
 * GSD Pi understands.
 */
import type { ProviderCatalog } from "../constants";

interface ModelPickerProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  catalog: readonly ProviderCatalog[];
  placeholder?: string;
  className?: string;
}

const CUSTOM_SENTINEL = "__custom__";

export function ModelPicker({
  value,
  onChange,
  catalog,
  placeholder = "Default",
  className = "w-full sm:w-64",
}: ModelPickerProps) {
  // Build set of all qualified `provider/model` keys we know
  const knownQualified = new Set<string>();
  for (const prov of catalog) {
    for (const m of prov.models) {
      knownQualified.add(`${prov.id}/${m}`);
    }
  }

  const isCustom = value !== undefined && value !== "" && !knownQualified.has(value);

  return (
    <div className="flex flex-col gap-1 items-end">
      <select
        value={isCustom ? CUSTOM_SENTINEL : (value ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange(undefined);
          } else if (v === CUSTOM_SENTINEL) {
            onChange("");
          } else {
            onChange(v);
          }
        }}
        className={className}
        title={value}
      >
        <option value="">{placeholder}</option>
        {catalog.map((prov) => (
          <optgroup key={prov.id} label={prov.label}>
            {prov.models.map((m) => (
              <option key={`${prov.id}/${m}`} value={`${prov.id}/${m}`}>
                {m}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={CUSTOM_SENTINEL}>— Custom (provider/model) —</option>
      </select>
      {isCustom && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="provider/model-id"
          className={className}
        />
      )}
    </div>
  );
}

/**
 * Ordered list of ModelPickers. Index 0 is the primary choice; subsequent
 * rows are fallbacks tried in order. Reusable for any "ordered multi-choice
 * from a structured catalog" setting.
 */
interface ModelChainProps {
  chain: string[];
  onChange: (chain: string[]) => void;
  catalog: readonly ProviderCatalog[];
  className?: string;
}

export function ModelChain({
  chain,
  onChange,
  catalog,
  className = "w-full sm:w-64",
}: ModelChainProps) {
  // Local state lets us keep trailing empty rows visible while the user is
  // picking. The parent only ever sees the filtered (non-empty) chain, so
  // those in-flight empties don't round-trip and disappear on re-render.
  const [rows, setRows] = useState<string[]>(() =>
    chain.length > 0 ? chain : [""],
  );

  // Resync when the external chain changes to something our filtered view
  // doesn't already match (e.g. preferences loaded from disk).
  useEffect(() => {
    const filtered = rows.filter(Boolean);
    const same =
      filtered.length === chain.length &&
      filtered.every((v, i) => v === chain[i]);
    if (!same) {
      setRows(chain.length > 0 ? chain : [""]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  const commit = (next: string[]) => {
    setRows(next);
    onChange(next.filter(Boolean));
  };

  const setRow = (idx: number, value: string | undefined) => {
    const next = [...rows];
    next[idx] = value ?? "";
    commit(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  const remove = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx);
    commit(next.length === 0 ? [""] : next);
  };

  const add = () => {
    commit([...rows, ""]);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((value, idx) => {
        const isPrimary = idx === 0;
        const label = isPrimary ? "Primary" : `Fallback ${idx}`;
        const canUp = idx > 0;
        const canDown = idx < rows.length - 1;
        return (
          <div key={idx} className="flex items-start gap-1.5">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-gsd-text-dim leading-none">
                {label}
              </span>
              <ModelPicker
                value={value || undefined}
                onChange={(v) => setRow(idx, v)}
                catalog={catalog}
                placeholder={isPrimary ? "Not set" : "Add fallback"}
                className={className}
              />
            </div>
            <div className="flex flex-col gap-0.5 pt-3.5">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={!canUp}
                className="text-xs text-gsd-text-dim hover:text-gsd-text disabled:opacity-30 disabled:cursor-not-allowed leading-none px-1"
                title="Move up"
                aria-label={`Move ${label} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={!canDown}
                className="text-xs text-gsd-text-dim hover:text-gsd-text disabled:opacity-30 disabled:cursor-not-allowed leading-none px-1"
                title="Move down"
                aria-label={`Move ${label} down`}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              disabled={rows.length === 1}
              className="text-xs text-gsd-text-dim hover:text-gsd-danger disabled:opacity-30 disabled:cursor-not-allowed pt-3.5 px-1"
              title="Remove"
              aria-label={`Remove ${label}`}
            >
              ×
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="self-start text-xs text-gsd-accent hover:text-gsd-accent-hover mt-0.5"
      >
        + Add fallback
      </button>
    </div>
  );
}

interface NumberFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function NumberField({
  value,
  onChange,
  min,
  max,
  placeholder,
}: NumberFieldProps) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      min={min}
      max={max}
      placeholder={placeholder}
      className="w-52"
    />
  );
}

interface TextFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function TextField({
  value,
  onChange,
  placeholder,
  className = "w-full sm:w-52",
}: TextFieldProps) {
  // Defensive coercion: some preference keys can arrive as numbers when a
  // YAML file stored them unquoted (e.g. a Discord snowflake `channel_id`).
  // React would still render a number via toString but downstream validators
  // check `typeof value === "string"`. Coerce here so the displayed value and
  // the type the user sees are always aligned.
  const display = value == null ? "" : typeof value === "string" ? value : String(value);
  return (
    <input
      type="text"
      value={display}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={placeholder}
      className={className}
    />
  );
}

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagInput({ values, onChange, placeholder }: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newVal = e.currentTarget.value.trim();
      if (!values.includes(newVal)) {
        onChange([...values, newVal]);
      }
      e.currentTarget.value = "";
    }
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-64">
      <div className="flex flex-wrap gap-1 mb-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gsd-accent/20 text-gsd-accent-hover"
          >
            {v}
            <button
              onClick={() => remove(i)}
              className="text-gsd-text-dim hover:text-gsd-danger ml-0.5"
            >
              x
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Type and press Enter"}
        className="w-full"
      />
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="gsd-heading text-lg font-semibold text-gsd-text">{title}</h2>
      {description && (
        <p className="gsd-prose mt-1 text-sm text-gsd-text-dim">{description}</p>
      )}
    </div>
  );
}
