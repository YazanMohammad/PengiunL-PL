# Minimal Dark UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply approved direction A to the existing launcher without changing launch/account/security behavior.

**Architecture:** Refresh existing React presentation components and their shared Tailwind tokens. Keep API orchestration in GameLibrary/useGames and existing Radix primitives; remove only the obsolete spotlight and route body selection to the existing details dialog.

**Tech Stack:** React 18, TypeScript, Tailwind 3, Radix, Lucide, Vitest/Testing Library; existing .NET backend unchanged.

**Spec:** `docs/superpowers/specs/2026-10-04-minimal-dark-ui-design.md`

## Global Constraints

- Preserve API contracts, account targeting, persistence, authentication, and backend behavior.
- No new dependencies, backend edits, storage changes, vendor integrations, or unrelated cleanup.
- Fixed dark appearance: background `#101112`, opaque card/chrome surface `#17191b`, subtle border `#2a2d30`, foreground `#eeefef`, secondary text `#a3aaae`, restrained sage accent `#c9d8ca` with dark foreground `#1c241e`.
- No real launch/account operation as a test; browser preview uses synthetic games/accounts only.
- New behavior and bug fixes require a test observed failing for the correct reason before implementation.
- Keep every existing platform, all density/sort choices, and pagination (initial 80, Load More adds 100, Show All).

## Review Focus

1. A card/row action must not bubble into a second details/launch action — Task 1 interaction tests.
2. Missing/broken artwork and long titles must leave games identifiable/actions usable — Task 1 fallback and manual compact-width checks.
3. Filtering an inactive account and launching a multi-owner game must retain existing targeting/conflict decisions — Task 1 boundary characterization tests.
4. Loading, failed API results, empty filters, and large libraries must remain navigable — Task 1 state and pagination tests.
5. Dialog restyling must not hide destructive warnings, authentication failures, or focus/close paths — Task 2 primitive/dialog tests and final preview checks.

---

### Task 1: Flat design system and artwork-led library

**Files:**
- Modify: `src/penguinlauncher-ui/src/index.css`, `src/penguinlauncher-ui/src/components/ui/button.tsx`, `src/penguinlauncher-ui/src/components/ui/badge.tsx`.
- Modify: `src/penguinlauncher-ui/src/components/TopBar.tsx`, `Sidebar.tsx`, `GameLibrary.tsx`, `GameCard.tsx`, `GameListItem.tsx`.
- Remove: `src/penguinlauncher-ui/src/components/HeroSpotlight.tsx` only after confirming there are no remaining consumers.
- Create tests: `src/penguinlauncher-ui/tests/components/GameLibrary.test.tsx`, `LibraryControls.test.tsx`, `DarkTheme.test.tsx`.

**Interfaces:**
- Consumes: existing `Game`, `Account`, filter/view/density types, `useGames()`, `api.preflight/launch`, and component props. Inspect actual declarations before authoring fixtures.
- Produces: same public library component interfaces, flat existing Button/Badge variants, updated CSS theme variables. `onSelect(game)` now opens existing game details. No new API.

- [x] Step 1: Add characterization tests using synthetic hook/API boundary data for search, filters, grid/list, account targeting/conflict, loading/error/empty, rescan busy, and pagination. Observe old behavior accurately; no real network/account writes.
- [x] Step 2: Add failing design/behavior tests: `shows library heading without spotlight`; `card body opens details`; `row body opens details`; `play invokes launch only once without opening details`; `search and icon controls have accessible labels`; `flat primary and legacy glow button variants contain no gradient/shadow/blur classes`. Missing/broken artwork keeps the title and actions. Style tests assert the specified surface/variant contract, not complete markup snapshots.
- [x] Step 3: Run `npm test -- tests/components/GameLibrary.test.tsx tests/components/LibraryControls.test.tsx tests/components/DarkTheme.test.tsx`; record expected failure reasons before changing production code. Fix incorrect tests rather than mistaking harness errors for RED.
- [x] Step 4: Update CSS HSL theme variables to the exact palette; make shared button/badge variants flat while preserving variant names for downstream dialogs. Redesign TopBar/Sidebar/cards/list/library chrome in direction A, remove the spotlight, and connect selection to details. Keep existing sorting, launch/preflight/mapping/swapping logic and pagination intact; keep all important actions visible without hover. Add accessible labels/selected-state semantics, live statuses, responsive wrapping, and image fallback without redundant wrappers or new subsystems. Preserve selected-account warnings in a quiet account strip.
- [x] Step 5: Run focused tests, `npm test`, `npm run typecheck`, `npm run build` in `src/penguinlauncher-ui`; `dotnet test PenguinLauncher.sln --no-restore` at root; `git diff --check`. Report all failures by name and distinguish pre-existing failures. Build output belongs in existing tracked wwwroot; no alternate bundle publication. Use systematic-debugging for unexpected failures.
- [x] Step 6: Self-review against the spec; make small focused commits (theme/primitives and library presentation may be separate). Record exact test commands/counts and red-before-green evidence in the task report. Independent review must approve spec compliance and task quality before Task 2.

### Task 2: Consistent dialogs, gate, and shared UI surfaces

**Files:**
- Modify: `src/penguinlauncher-ui/src/components/AccountSelectorModal.tsx`, `AccountsManagerModal.tsx`, `GameDetailsModal.tsx`, `ApiSessionGate.tsx`.
- Modify as needed: `src/penguinlauncher-ui/src/components/ui/dialog.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, `tooltip.tsx`, `input.tsx`, `separator.tsx`, `scroll-area.tsx` (only files that actually exist).
- Create/extend tests: `src/penguinlauncher-ui/tests/components/DialogPresentation.test.tsx`, existing `AccountSelectorModal.test.tsx`, existing `ApiSessionGate.test.tsx`.

**Interfaces:**
- Consumes: flat Button/Badge and CSS variables from Task 1; existing modal props, callbacks, and Radix behavior unchanged.
- Produces: consistent opaque dark dialogs/forms/menus/statuses; unchanged API/authentication interfaces.

- [x] Step 1: Inspect the actual dialog/gate and shared primitive files. Characterize close/Escape, launch/map callbacks, conflict account selection, busy/disabled state and authentication failure display with synthetic fixtures. No invented backend actions or vendor interactions.
- [x] Step 2: Add failing `dialog surface is opaque and flat` and `tabs and input use neutral theme surfaces` contract tests against real primitives; add failing tests for any accessible labels/live status introduced. Reuse existing account-selection/session tests, preserving their behavioral assertions rather than relaxing them.
- [x] Step 3: Run `npm test -- tests/components/DialogPresentation.test.tsx tests/components/AccountSelectorModal.test.tsx tests/components/ApiSessionGate.test.tsx`; verify failures are missing design/semantics, not setup errors.
- [x] Step 4: Restyle existing active modal/gate components and primitives consistently: remove decorative blur/gradients/glow, use opaque card/chrome and border tokens, quiet platform tabs/account rows, legible fields, compact headers, retained warnings/error contrast. Keep form logic, API calls, focus handling, close behavior, and all account/detail workflows. Do not mechanically change external artwork contrast overlays into unreadable images.
- [x] Step 5: Run focused tests plus all frontend tests/typecheck/build, root .NET tests, `git diff --check`; use systematic-debugging for unexpected results. Self-review and commit in focused changes. Record exact commands/results and RED/GREEN evidence in the report.
- [x] Step 6: Independent task review, fix/re-review important findings, then fresh whole-UI/branch review for requirements and regressions.

## Final controller verification and handoff

- [x] Read the actual final source and scan this spec for unimplemented requirements.
- [x] Visually inspect actual React components using ignored synthetic-data browser preview instrumentation, not production authentication bypass. Check desktop/compact widths, grid/list, account selector, and details; record what was and was not exercised.
- [x] Run `npm test`, `npm run typecheck`, `npm run build`; `dotnet test PenguinLauncher.sln --no-restore`; `dotnet build PenguinLauncher.sln -c Release --no-restore`; `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore`; `git diff --check`. No lint or E2E runner is configured; record rather than invent them.
- [x] Use superpowers:verification-before-completion; save fresh results and review disposition in `docs/superpowers/reports/2026-10-04-minimal-dark-ui.md`. Include pre-existing formatter/dependency findings without claiming this UI task resolves them.
- [x] Leave focused commits on the isolated branch; do not merge/push/delete the worktree or restart the user's running app without authorization. Retain task evidence until the final report captures the results. Present integration options via finishing-a-development-branch when applicable.
