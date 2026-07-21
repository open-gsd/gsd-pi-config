// GSD Pi Config - class name utility (cn)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution (later utilities win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
