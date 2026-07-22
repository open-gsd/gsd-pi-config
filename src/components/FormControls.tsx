// GSD Pi Config - Reusable Form Controls
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { getField, type FieldPath } from "../lib/fields";
import type { ProviderCatalog } from "../constants";
import { isWebPlatform } from "@/platform";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/** Internal Select empty sentinel — never emitted into prefs (D-06 / RESEARCH Q1). */
const SELECT_EMPTY_SENTINEL = "__gsd_select_empty__";

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

  const web = isWebPlatform();

  return (
    <div
      className={
        web
          ? cn(
              "flex flex-col gap-3 py-3 border-b border-border last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
              error && "border-destructive/40",
            )
          : "flex flex-col gap-3 py-3 border-b border-gsd-border last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      }
      data-invalid={error ? "" : undefined}
      data-field-path={path}
    >
      <div className="min-w-0 flex-1">
        <label
          className={
            web
              ? "inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-foreground"
              : "inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-gsd-text"
          }
        >
          <span className="min-w-0">{label}</span>
          {meta?.hint && (
            <span className="group relative shrink-0">
              <button
                type="button"
                aria-label={meta.hint}
                className={
                  web
                    ? "relative z-[1] flex h-5 w-5 items-center justify-center rounded-none border border-border text-xs font-semibold leading-none text-muted-foreground cursor-help hover:border-foreground/30 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    : "gsd-hint-trigger relative z-[1] flex h-4 w-4 items-center justify-center rounded-full border border-gsd-border text-[9px] font-bold leading-none text-gsd-text-dim cursor-help hover:border-gsd-border-strong hover:text-gsd-text transition-[color,border-color,transform] active:scale-[0.96] focus:outline-none focus-visible:ring-0"
                }
              >
                ?
              </button>
              <span
                role="tooltip"
                className={
                  web
                    ? "pointer-events-none absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[min(16rem,calc(100vw-2rem))] rounded-none border border-border bg-popover px-2.5 py-1.5 text-xs font-normal leading-snug text-popover-foreground shadow-md opacity-0 translate-y-[-2px] transition-[opacity,transform] duration-100 origin-top-left group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                    : "pointer-events-none absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[min(16rem,calc(100vw-2rem))] rounded-md border border-gsd-border-strong bg-gsd-surface-solid px-2.5 py-1.5 text-xs font-normal leading-snug text-gsd-text shadow-xl opacity-0 translate-y-[-2px] transition-[opacity,transform] duration-100 origin-top-left group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                }
              >
                {meta.hint}
              </span>
            </span>
          )}
        </label>
        {description && (
          <p
            className={
              web
                ? "mt-0.5 text-xs leading-relaxed text-muted-foreground"
                : "gsd-prose mt-0.5 text-xs leading-relaxed text-gsd-text-dim"
            }
          >
            {description}
          </p>
        )}
        {error && (
          <p
            className={
              web
                ? "mt-1 text-xs text-destructive"
                : "mt-1 text-xs text-gsd-danger"
            }
          >
            {error}
          </p>
        )}
      </div>
      <div
        className={
          web
            ? "w-full min-w-0 sm:w-52 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=input]]:w-full"
            : "gsd-field-control [&_select]:w-full [&_input]:w-full [&_input]:max-w-full sm:[&_select]:w-52 sm:[&_input]:w-52"
        }
      >
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
  if (isWebPlatform()) {
    return (
      <div className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center self-start sm:self-center">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className="h-5 w-9"
        />
      </div>
    );
  }

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
  if (isWebPlatform()) {
    const selectValue =
      value === undefined || value === ""
        ? allowEmpty
          ? SELECT_EMPTY_SENTINEL
          : (value ?? null)
        : value;

    return (
      <Select
        value={selectValue as string | null}
        onValueChange={(next) => {
          if (next == null || next === "" || next === SELECT_EMPTY_SENTINEL) {
            onChange(undefined);
            return;
          }
          onChange(next as T);
        }}
      >
        <SelectTrigger className={cn("min-h-10 h-10 rounded-none", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {allowEmpty && (
            <SelectItem value={SELECT_EMPTY_SENTINEL}>{placeholder}</SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

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
  if (isWebPlatform()) {
    const selectValue =
      value === undefined || value === "" ? SELECT_EMPTY_SENTINEL : value;

    return (
      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (next == null || next === "" || next === SELECT_EMPTY_SENTINEL) {
            onChange(undefined);
            return;
          }
          onChange(next);
        }}
      >
        <SelectTrigger className={cn("min-h-10 h-10 rounded-none", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value={SELECT_EMPTY_SENTINEL}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

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
  const web = isWebPlatform();

  // Desktop owns dismiss via hand-rolled listeners; web Popover owns ESC/outside.
  useEffect(() => {
    if (web || !open) return;
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
  }, [open, web]);

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

  if (web) {
    return (
      <div className={cn("text-sm", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-none border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30 dark:hover:bg-input/50",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left",
                values.length === 0 ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {summary}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground" aria-hidden>
              {open ? "▴" : "▾"}
            </span>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-(--anchor-width) min-w-56 max-h-64 overflow-y-auto rounded-none p-1 gap-0"
          >
            <div role="listbox" aria-multiselectable="true" className="flex flex-col">
              {options.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    role="option"
                    aria-selected={checked}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-none px-2 py-2 text-sm outline-none",
                      "hover:bg-muted/60",
                      checked && "border-l-2 border-l-primary bg-primary/10 pl-[6px]",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(opt.value)}
                    />
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {values.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {values.map((v) => (
              <span
                key={v}
                className="inline-flex max-w-full items-center gap-1 rounded-none border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground"
              >
                <span className="max-w-[12rem] truncate">{labelFor(v)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${labelFor(v)}`}
                  onClick={() => toggle(v)}
                  className="size-6 min-h-6 text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

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
  const [open, setOpen] = useState(false);
  const listId = useId();

  if (isWebPlatform()) {
    const query = value ?? "";
    const filtered =
      query.trim() === ""
        ? options
        : options.filter((opt) =>
            opt.toLowerCase().includes(query.trim().toLowerCase()),
          );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <div className={cn("relative", className)} />
          }
          nativeButton={false}
        >
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              onChange(e.target.value || undefined);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-none"
            aria-autocomplete="list"
            aria-expanded={open}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-(--anchor-width) min-w-52 max-h-56 overflow-y-auto rounded-none p-1 gap-0"
          // Keep focus on the input while browsing suggestions.
          initialFocus={false}
        >
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No matches</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="flex w-full cursor-pointer items-center rounded-none px-2 py-2 text-left text-sm hover:bg-muted/60"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>
    );
  }

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
  const hasModels = catalog.some((prov) => prov.models.length > 0);

  const applySelectValue = (v: string | null | undefined) => {
    if (v == null || v === "" || v === SELECT_EMPTY_SENTINEL) {
      onChange(undefined);
    } else if (v === CUSTOM_SENTINEL) {
      onChange("");
    } else {
      onChange(v);
    }
  };

  if (isWebPlatform()) {
    const selectValue = isCustom
      ? CUSTOM_SENTINEL
      : value === undefined || value === ""
        ? SELECT_EMPTY_SENTINEL
        : value;

    return (
      <div className="flex flex-col gap-1 items-end">
        {!hasModels && (
          <p className="self-stretch text-xs text-muted-foreground sm:text-right">
            No models available
          </p>
        )}
        <Select value={selectValue} onValueChange={applySelectValue}>
          <SelectTrigger
            className={cn("min-h-10 h-10 rounded-none", className)}
            title={value}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value={SELECT_EMPTY_SENTINEL}>{placeholder}</SelectItem>
            {catalog.map((prov) => (
              <SelectGroup key={prov.id}>
                <SelectLabel>{prov.label}</SelectLabel>
                {prov.models.map((m) => (
                  <SelectItem key={`${prov.id}/${m}`} value={`${prov.id}/${m}`}>
                    {m}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            <SelectItem value={CUSTOM_SENTINEL}>— Custom (provider/model) —</SelectItem>
          </SelectContent>
        </Select>
        {isCustom && (
          <Input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="provider/model-id"
            className={cn("min-h-10 h-10 rounded-none", className)}
          />
        )}
      </div>
    );
  }

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

  const web = isWebPlatform();

  return (
    <div className="flex flex-col gap-2">
      {rows.map((value, idx) => {
        const isPrimary = idx === 0;
        const label = isPrimary ? "Primary" : `Fallback ${idx}`;
        const canUp = idx > 0;
        const canDown = idx < rows.length - 1;
        return (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
              <span
                className={
                  web
                    ? "text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-none"
                    : "text-[10px] uppercase tracking-wide text-gsd-text-dim leading-none"
                }
              >
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
            {web ? (
              <>
                <div className="flex flex-col gap-0.5 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(idx, -1)}
                    disabled={!canUp}
                    title="Move up"
                    aria-label={`Move ${label} up`}
                    className="rounded-none text-muted-foreground"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(idx, 1)}
                    disabled={!canDown}
                    title="Move down"
                    aria-label={`Move ${label} down`}
                    className="rounded-none text-muted-foreground"
                  >
                    ↓
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(idx)}
                  disabled={rows.length === 1}
                  title="Remove"
                  aria-label={`Remove ${label}`}
                  className="mt-4 rounded-none text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        );
      })}
      {web ? (
        <button
          type="button"
          onClick={add}
          className="mt-0.5 self-start text-xs text-primary hover:underline"
        >
          + Add fallback
        </button>
      ) : (
        <button
          type="button"
          onClick={add}
          className="self-start text-xs text-gsd-accent hover:text-gsd-accent-hover mt-0.5"
        >
          + Add fallback
        </button>
      )}
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
  if (isWebPlatform()) {
    return (
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : Number(v));
        }}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full sm:w-52 rounded-none"
      />
    );
  }

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

  if (isWebPlatform()) {
    return (
      <Input
        type="text"
        value={display}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        className={cn("rounded-none", className)}
      />
    );
  }

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
  const [draft, setDraft] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newVal = e.currentTarget.value.trim();
      if (!values.includes(newVal)) {
        onChange([...values, newVal]);
      }
      e.currentTarget.value = "";
      setDraft("");
    }
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  if (isWebPlatform()) {
    return (
      <div className="w-full sm:w-64">
        {values.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {values.map((v, i) => (
              <span
                key={`${v}-${i}`}
                className="inline-flex max-w-full items-center gap-1 rounded-none border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground"
              >
                <span className="max-w-[12rem] truncate">{v}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${v}`}
                  onClick={() => remove(i)}
                  className="size-6 min-h-6 text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              </span>
            ))}
          </div>
        )}
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Type and press Enter"}
          className="w-full rounded-none"
        />
      </div>
    );
  }

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
              aria-label={`Remove ${v}`}
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
  if (isWebPlatform()) {
    return (
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="gsd-heading text-lg font-semibold text-gsd-text">{title}</h2>
      {description && (
        <p className="gsd-prose mt-1 text-sm text-gsd-text-dim">{description}</p>
      )}
    </div>
  );
}
