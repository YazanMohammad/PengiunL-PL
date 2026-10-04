# Minimal dark UI — direction A

## Intent and approval

The user wants the existing launcher redesigned to be minimalist, very clean, and dark. They chose direction A in the browser preview: a spacious artwork-led library. They then explicitly requested implementation at once, superseding additional approval pauses. This spec records the already-presented scope; it does not authorize unrelated roadmap work, integration into main, or vendor/account operations during verification.

Classification: architectural UI refresh across existing presentation components, without replacing the existing application architecture. Execution uses an isolated linked worktree, strict TDD for changes, focused commits, fresh implementers, independent task reviewers, and a fresh final review.

## Visual system

- Fixed dark appearance: background `#101112`, opaque card/chrome surface `#17191b`, subtle border `#2a2d30`, foreground `#eeefef`, secondary text `#a3aaae`, restrained sage accent `#c9d8ca` with dark foreground `#1c241e`.
- Adapt these values to the existing HSL CSS-variable/Tailwind system; do not introduce a second styling framework or new dependencies.
- Use flat surfaces, restrained 6–10px corner radii, system/Inter typography, and generous spacing. Remove decorative glass/backdrop blur, UI gradients, colored glow shadows, pulsing brand indicators, and hover enlargement. Game artwork may retain necessary contrast scrims.
- Keep platform identities and success/error/warning indications understandable through labels and icons, not only color. Destructive and error states remain distinct from ordinary controls.
- Real game artwork comes from existing game data; missing/broken images must still have a usable title/fallback. The concept's sample geometric artwork is not shipped.

## Library and navigation

Retain TopBar, Sidebar, GameLibrary, GameCard, and GameListItem responsibilities and existing public props where practical. Avoid moving API orchestration or duplicating filtering/launch logic in presentation components.

The compact toolbar contains subdued PenguinLauncher branding, search, grid/list selection, display settings, accounts, and rescan. Search has an accessible name; clear-search and icon-only controls have explicit labels. Do not advertise an unimplemented keyboard shortcut. Keep OS information unobtrusive when supplied.

The sidebar presents readable installation, platform, and account filters with quiet selected states and existing counts. Keep every existing platform, including Linux-native entries. Account rows retain active/standby/session distinctions.

The content starts with an `All games`/current-library heading and useful filtered game count. The grid is the default, with comfortable artwork-led cards and persistent Play/Install and Details actions. Retain all density and sorting choices. Preserve grid/list toggling, deduplication, filtering, and incremental pagination (initial 80; Load More adds 100; Show All remains). At desktop width, the standard grid should be significantly calmer than the current six-column default; use responsive columns and avoid clipping at narrow windows. List view retains profile/status information and all actions.

Remove the oversized HeroSpotlight from the library. Selection must not become a dead interaction: card/row body selection opens the existing game-details dialog, while Play and Details buttons stop propagation to avoid duplicate actions. Remove only now-unused spotlight wiring/components; do not delete unrelated code. Do not change account targeting or launch/preflight behavior.

## Dialogs and shared states

Carry the same opaque dark surfaces and restrained typography into AccountSelectorModal, AccountsManagerModal, GameDetailsModal, ApiSessionGate, and shared UI primitives. Preserve existing dialog titles unless an accessibility improvement requires a more precise label; preserve all actions and result messages. Keep Radix focus trapping, Escape/close behavior, selected platform tabs, and clear form labels.

Account capture/manual addition/rename/delete/switch, conflict resolution, game-account mapping, account-library navigation, and session bootstrap flows are unchanged. No security boundary or token transport/storage changes. No real credential/vendor operations during automated or browser verification.

Loading, disconnected/authentication, empty, error, and toast states use restrained surfaces, clear copy, and visible affordances. Async actions retain disabled/busy states. Add suitable live status/alert semantics where these presentations lack them; never expose secrets or suppress authentication errors. Preserve API response handling.

## Boundaries and non-goals

- Preserve API contracts, account targeting, persistence, authentication, and backend behavior.
- No new dependencies, backend edits, storage changes, vendor integrations, or unrelated cleanup.
- No rewrite of working hooks or large structural refactor. Existing UI primitives and React state remain the implementation mechanism.
- No real launch/account operation as a test; browser preview uses synthetic games/accounts only.

## Testing and acceptance

Use React Testing Library/Vitest for semantic interaction tests and narrowly scoped styling contracts for the deliberately changed flat variants/palette. New behavior and bug fixes require a test observed failing for the correct reason before implementation. Existing-behavior characterization tests may pass on the old implementation and must not be misreported as red TDD evidence.

Cover library heading and removal of spotlight, card/row details opening without accidental launch, Play single invocation, filtering/search/view toggling, selected account targeting, multi-owner conflict resolution, missing artwork, busy controls, errors/empty states, and pagination. Preserve the existing authentication/session and account selector suite. Shared UI/dialog tests must verify flat surface contracts and accessible controls while exercising real components with only external boundaries stubbed.

After each major change run focused tests, all frontend tests, frontend typecheck/build, and all .NET tests. Final verification repeats these checks plus Release build, `git diff --check`, and fresh whole-UI/branch review against this spec. Record baseline failures separately; there is no configured ESLint command, browser E2E runner, or separate integration command to invent.

Visually inspect the actual React UI served locally with synthetic data at desktop and compact window widths, including grid/list, details, and account selector. Keep preview instrumentation outside shipped production source. Report native Photino verification separately from a browser-based preview; do not equate them.

Acceptance: direction A is recognizable, all existing workflows remain reachable, changes are independently reviewed, no important review finding remains unresolved, and verification results are freshly recorded. This is a UI improvement, not a claim that all previously audited security/tooling issues are resolved.
