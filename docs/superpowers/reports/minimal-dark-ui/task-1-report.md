# Task 1 report — flat dark design system and artwork-led library

## Scope and result

Implemented the approved direction A in the isolated `improvement/production-hardening` worktree. Base UI: `144854bbf325f12d5f341597f2e9e96ea5265eb8`. Existing React component responsibilities and public props remain. No API, hook, backend, authentication, storage, dependency, or security changes were made.

The library starts with All games/current library and filtered count. Standard density uses three desktop columns from 1024px and four from 1536px; compact uses four/five/six and spacious two/three at their desktop breakpoints. Cards put artwork above readable metadata with persistent Play/Install and Details actions. Rows wrap, retaining title/path/platform, ownership, installation status, and actions. Missing or failed cover images show a quiet monogram while keeping title and actions usable.

Body clicks and Enter/Space open the existing details dialog. Actions sit outside the body control and stop propagation. Launch/preflight, account targeting, account choice, mapping, hot swap, filters, sorting, and 80/+100/all pagination remain in the existing library orchestration. Selected account warnings remain in a quiet strip, with its session switch disabled while swapping.

Toolbar search, clear, view, display, and accounts controls have accessible names; view/filter/menu selections expose selected semantics. Loading/count/empty/toasts use status semantics and scan/launch failures use alerts. Removed the unimplemented Ctrl+K advertisement, decorative gradients/glass/glow/pulsing brand indicators, and hover enlargement in Task 1 surfaces.

## Files

- `src/penguinlauncher-ui/src/index.css`: fixed dark HSL equivalents for background #101112, card/chrome #17191b, border #2a2d30, foreground #eeefef, secondary #a3aaae, sage #c9d8ca, dark accent foreground #1c241e; radius 8px; flat legacy helpers.
- `src/penguinlauncher-ui/src/components/ui/button.tsx`: flat variants, preserving default/glow/destructive/outline/secondary/ghost/link/steam/riot names.
- `src/penguinlauncher-ui/src/components/ui/badge.tsx`: restrained flat platform badges, keeping textual identities and separate success/error status variants.
- `src/penguinlauncher-ui/src/components/TopBar.tsx`: subdued branding, wrapping controls/search, flat display menu, accessible names/selections.
- `src/penguinlauncher-ui/src/components/Sidebar.tsx`: readable quiet platform/installation/account navigation, Linux Native retained, active/standby labels, scrollable narrow layout.
- `src/penguinlauncher-ui/src/components/GameCard.tsx` and `GameListItem.tsx`: artwork/metadata/actions redesign, keyboard body selection, preserved ownership and launch semantics.
- `src/penguinlauncher-ui/src/components/GameLibrary.tsx`: library heading/count, quiet account strip and feedback, responsive densities, body selection to details, spotlight wiring removal; total sidebar count now reflects deduplicated cards.
- Removed `src/penguinlauncher-ui/src/components/HeroSpotlight.tsx` only after `rg HeroSpotlight src/penguinlauncher-ui` found no consumer references beyond that file itself.
- New real-component tests: `tests/components/GameLibrary.test.tsx` (19), `LibraryControls.test.tsx` (11), `DarkTheme.test.tsx` (11).
- Normal existing Vite output in `src/PenguinLauncher/wwwroot/index.html`, `assets/index-9eztFvuI.css`, `assets/index-D-KxW4kn.js`; old hashed bundle replaced by the configured build.

## RED evidence

Read and applied test-driven-development, writing-good-tests, systematic-debugging, and verification-before-completion instructions. Tests exercise real React library/toolbar/sidebar/card/row/dialog/primitives. Only the externally stateful useGames boundary and process-launch API methods are mocked, with typed complete synthetic fixtures. No real account/vendor/network/credential/launch operations were performed.

Before any production edits:

```
npm test -- tests/components/GameLibrary.test.tsx tests/components/LibraryControls.test.tsx tests/components/DarkTheme.test.tsx
Tests: 15 failed | 17 passed (32)
```

Expected failures: absent All games heading/count/spotlight removal; grid and list body selection did not open details; cached errors lacked role alert; standby session switch was not disabled while swapping; toolbar lacked Search games accessible name; card/row body lacked keyboard accessible controls; all five tested button variants had shadow/gradient/blur/scale classes; steam/riot badges had decorative shadows. Nine initial library characterization tests passed on the original implementation and are not claimed as RED evidence. Existing play propagation and image-fallback checks also passed.

Additional tests were observed failing before the corresponding production edits:

- LibraryControls focused: 6 failed / 4 passed after adding navigation selected-state and card/row opaque-surface contracts (three additional failures: absent aria-pressed and absent bg-card).
- `-t 'retains all sort'`: one expected failure, no menuitemradio selected semantics on the old display menu.
- `-t 'announces a failed launch'`: one expected failure, no launch-feedback alert.
- Controller visual feedback at 1200x800 found oversized two-column cards. `-t 'three comfortable'` failed because standard had xl:grid-cols-3 rather than lg:grid-cols-3; `-t 'meaningfully denser'` failed because compact had lg:grid-cols-3 rather than lg:grid-cols-4. The breakpoint changes followed these failures.

## GREEN verification

All commands below completed with exit 0 on the final Task 1 production changes:

| Command | Result |
| --- | --- |
| `npm test -- tests/components/GameLibrary.test.tsx tests/components/LibraryControls.test.tsx tests/components/DarkTheme.test.tsx` | 41 passed, 3 files |
| `npm test` | 131 passed, 8 files; existing session/client/account-selector/isolation suites preserved |
| `npm run typecheck` | production and test TypeScript clean |
| `npm run build` | tsc + Vite successful; 1988 modules; configured wwwroot output only |
| `dotnet test PenguinLauncher.sln --no-restore` | 355 passed, 0 failed/skipped |
| `git diff --check` and `git diff --cached --check` | no whitespace errors after generated-output formatting |

Frontend commands ran in `src/penguinlauncher-ui`; backend and Git commands ran at the isolated worktree root.

Failures encountered and resolved:

- One administrative focused command was accidentally issued at the repository root: npm ENOENT for root package.json. Reran from the UI directory; this is not RED evidence.
- Newly added rescan characterization initially asserted zero callback arguments and failed because React supplies its click event to the existing callback. Inspected the unchanged onClick forwarding and no-argument useGames rescan implementation; corrected the test to assert one rescan invocation. No production change was needed.
- Vite emitted mixed CRLF/CRCRLF in generated wwwroot/index.html from Windows source line endings plus HTML transformation. git reported w/-text and trailing whitespace on those lines. Normalized only the generated HTML line endings using a formatting command; final diff is the intended two asset references. No build config/source HTML change. Later Windows builds may require the same generated-file normalization.
- Staging the new JS hash exposed five whitespace-only lines inside the existing react-remove-scroll CSS template strings (new/untracked bundle was not covered by the earlier unstaged check). Confirmed these were CSS separator lines, removed only whitespace on blank lines, and checked both staged/unstaged diffs. No JS logic or CSS declarations changed.
- Git emits normal LF-to-CRLF working-copy notices under the user's core.autocrlf=true. These are not whitespace-check failures.

## Self-review and boundaries

Reviewed the actual Game/Account/useGames declarations, component implementations, and final library diff. Account ID case-insensitive selection/ownership rules, multi-owner immediate account choice and server preflight conflict, selected-account bypass of automatic preflight, launch request shape, success account refresh, manual swap, mapping callback, sorting/filter resets, and incremental pagination remain intact. All platform labels/counts and account workflows remain reachable. No orchestration moved into presentation components.

Accessible body controls and sibling action buttons avoid nested interactive elements. Important actions are present at rest. Three desktop standard columns are calmer than the former six; below 768px the scrollable filter pane stacks above the main content, and toolbar/list/account/pagination controls wrap.

Controller inspected the actual React synthetic preview at 1200x800 and confirmed flat readable chrome/persistent actions, then requested the now-applied density refinement. Controller rechecked the refined three-column standard grid with visible first-row actions, readable list view, and wrapped toolbar/scrollable filter/main at 640x800. Preview fixture/server are controller-owned, ignored, and outside shipped source. Independent review is still controller-owned and pending. This report does not claim native Photino verification; the running application was not restarted, nor was the branch merged/pushed.

Task 2 remains responsible for the specified dialogs and remaining shared primitives. Their existing workflows remain functional, but Task 1 does not claim the whole-UI visual refresh complete. No outstanding Task 1 code/test failure remains.

## Commits

- `e79350d` — style(ui): establish flat dark theme and restrained controls
- `aee2d00` — style(ui): present an artwork-led accessible game library
- This report remains in the deliberately ignored `.superpowers` task-artifact directory.

## Fix round 1 — row metadata selection

Base: `aee2d003946e9c3297d7143aa1e6e6294a07a479`. Independent review identified an Important gap: profile/ownership and installation status sat outside the only row details selection region, so clicking those non-action areas did nothing.

Verified the finding against the real GameListItem and reproduced it before editing production code:

```
npm test -- tests/components/LibraryControls.test.tsx tests/components/GameLibrary.test.tsx -t 'metadata'
4 failed | 30 skipped (34)
```

Expected RED output: Alice, Installed, and Ready to Install clicks each produced `Number of calls: 0` instead of one onSelect; the integrated list installation click left the Alpha details dialog absent. These are regression reproductions, not harness errors.

Minimal correction in `src/penguinlauncher-ui/src/components/GameListItem.tsx`: moved profile/status metadata into the existing keyboard-accessible selection region. Added flex wrapping and a title basis so non-action content remains usable in narrow rows. Actions remain sibling buttons; no article handler or nested interactive controls were added. Launch/account orchestration and semantics are untouched.

Tests added in `LibraryControls.test.tsx` assert one onSelect for each ownership/installation click, no play/details callback, and no interactive descendants inside the selection region. Existing keyboard test now checks Enter once before Space; existing separate actions test also checks Details does not invoke Play again. `GameLibrary.test.tsx` exercises the real existing details dialog after a list status click without launching.

GREEN on final fix:

- `npm test -- tests/components/LibraryControls.test.tsx tests/components/GameLibrary.test.tsx`: 34 passed (2 files).
- `npm test`: 135 passed (8 files), including strengthened keyboard/action assertions.
- `npm run typecheck`: clean production and test TypeScript.
- `npm run build`: successful configured wwwroot build, 1988 modules.
- `dotnet test PenguinLauncher.sln --no-restore`: 355 passed, 0 failed/skipped.
- `node --check src/PenguinLauncher/wwwroot/assets/index-C7zJ_Lgb.js`: successful.
- Staged and unstaged Git whitespace checks clean; regenerated HTML line endings and inherited CSS-template blank whitespace formatted using the previously documented procedure.

New normal bundles: `index-BhwddC_-.css`, `index-C7zJ_Lgb.js`, matching generated HTML references. Authored source changes are limited to the row component and its two test files. Self-review confirms all non-action content is inside one selection region, Play/Details are siblings, click/keyboard callbacks remain single, and no unrelated Task 2/palette changes were made. The review's Minor palette contract suggestion remains explicitly deferred to final review.

Fix commit: `b7849a252df7c4cbbf572f5dcedffcd8957bc9b4` — fix(ui): open details from all list row metadata. Tracked worktree clean after commit.
