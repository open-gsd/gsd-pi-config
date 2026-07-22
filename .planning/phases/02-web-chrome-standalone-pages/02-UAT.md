---
status: testing
phase: 02-web-chrome-standalone-pages
source: [02-VERIFICATION.md]
started: 2026-07-22T01:25:00Z
updated: 2026-07-22T01:25:00Z
---

## Current Test

number: 1
name: Theme matrix + chrome
expected: |
  Auto/Dark/Light works; underline nav; PNG BrandMark; Mist Sky primary buttons
awaiting: user response

## Tests

### 1. Theme matrix + chrome
expected: Cycle Auto/Dark/Light; underline Editor/Gallery/New; soft sky primary CTAs
result: [pending]

### 2. Gallery
expected: Load list; search; empty/filtered empty; Use preset + Preview; Refresh list
result: [pending]

### 3. Wizard
expected: Linear mode/profile rows; title/description; Create → editor draft
result: [pending]

### 4. OAuth callback
expected: Quiet loading/error/success inside WebShell (no code in logs)
result: [pending]

### 5. Empty start panel
expected: 3 steps + Import/Load/New; gallery link goes to /gallery (not /gallery/gallery)
result: [pending]

### 6. Desktop isolation
expected: Desktop build/dev still legacy gsd look (not Mist Sky body)
result: [pending]
