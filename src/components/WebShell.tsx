// GSD Pi Config - Cloud web chrome (opengsd.net parity)
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import type { CSSProperties, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { btn, btnSegment, btnSegmentActive, segmentGroup } from "../lib/uiClasses";

export type WebShellNav = "editor" | "gallery" | "new";

interface WebShellProps {
  active: WebShellNav;
  children: ReactNode;
  /** Shown under nav on editor when a workspace is loaded */
  workspaceLabel?: string;
}

const NAV: { id: WebShellNav; to: string; label: string }[] = [
  { id: "editor", to: "/", label: "Editor" },
  { id: "gallery", to: "/gallery", label: "Gallery" },
  { id: "new", to: "/new", label: "New preset" },
];

export function WebShell({ active, children, workspaceLabel }: WebShellProps) {
  const shellStyle = {
    "--gsd-shell-nav-height": "3.5rem",
    "--gsd-shell-editor-strip": "2.25rem",
    "--gsd-shell-offset":
      active === "editor"
        ? "calc(var(--gsd-shell-nav-height) + var(--gsd-shell-editor-strip))"
        : "var(--gsd-shell-nav-height)",
  } as CSSProperties;

  return (
    <div
      className="min-h-screen flex flex-col bg-gsd-bg text-gsd-text gsd-web-shell"
      style={shellStyle}
    >
      <header className="shrink-0 border-b border-gsd-border bg-gsd-bg/90 backdrop-blur-md z-50">
        <div className="flex h-[var(--gsd-shell-nav-height)] w-full items-center gap-3 px-4 sm:px-6">
          <a
            href="https://www.opengsd.net"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md transition-opacity hover:opacity-90"
          >
            <BrandMark size="sm" subtitle="Pi Config" />
          </a>

          <nav className={`${segmentGroup} ml-1`} aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.id === "editor"}
                className={({ isActive }) =>
                  `text-xs font-medium ${isActive ? btnSegmentActive : btnSegment}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <a
              href="https://www.opengsd.net"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} hidden sm:inline-flex`}
            >
              opengsd.net
            </a>
          </div>
        </div>

        {active === "editor" && (
          <div className="border-t border-gsd-border/80 bg-gsd-surface-solid/60">
            <div className="flex h-[var(--gsd-shell-editor-strip)] w-full items-center gap-x-4 px-4 text-[11px] text-gsd-text-dim sm:px-6">
              <span>
                <span className="text-gsd-text-secondary font-medium">Cloud editor</span>
                {" · "}
                Import or create a config, edit in the browser, then download files for{" "}
                <code className="font-mono text-[10px] text-gsd-text-muted">~/.gsd/</code>
              </span>
              {workspaceLabel && (
                <span
                  className="font-mono text-[10px] text-gsd-accent truncate max-w-full"
                  title={workspaceLabel}
                >
                  {workspaceLabel}
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="relative flex-1 flex flex-col min-h-0 z-[1]">{children}</div>
    </div>
  );
}
