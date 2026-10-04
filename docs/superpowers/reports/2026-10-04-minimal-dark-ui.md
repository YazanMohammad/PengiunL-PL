# Minimal dark UI: implementation and verification

Date: 2026-10-04. Branch: `improvement/production-hardening`, isolated worktree `.worktrees/production-hardening`. Final production source: `d8cce0d8fa41fc7c3591b6a90526bea902d7cf41`; UI baseline: `0c6261eb9079964fcb50d33d1fbf2deeb6d3f661`.

The approved artwork-led direction A is implemented and independently reviewed. All original final-review findings are addressed; no Critical/Important finding remains open. One newly discovered Minor shared-primitive compatibility edge is explicitly deferred below. This is a UI delivery, not certification of the pending security roadmap or native release.

## Delivered scope and acceptance evidence

| Requirement | Evidence |
| --- | --- |
| Fixed dark, opaque, flat surfaces; sage controls and dark action foreground | Actual CSS tokens, Button/Badge/shared primitive tests; exact seven-token palette characterization |
| Artwork-led library without oversized spotlight | GameLibrary/Card/ListItem; body/Details opens existing inspector, Play remains separate; obsolete spotlight removed |
| Search, platform/account/install filters, sort and density choices | Real-component LibraryControls/GameLibrary tests; all five platforms including Linux native retained |
| Account targeting, conflicts, deduplication and 80/+100/Show All pagination | Synthetic boundary characterization tests using real presentation components and existing orchestration |
| Missing/broken covers, long names and persistent actions | Fallback/interaction tests and actual desktop/compact React preview checks |
| Flat dialogs, labeled forms, selected states, warnings and busy/error feedback | DialogPresentation, AccountSelectorModal and ApiSessionGate tests; real Radix primitives retained |
| Actual controlled-dialog keyboard focus restoration | Eight grid/list x body/Details x Escape/Close regressions; four nested forms, removed origin, caller overrides and modal-stack compatibility tests; browser recheck |
| Unchanged security/account/backend boundaries | UI-range diff contains no backend source, client/session/hook/storage/config/dependency change; existing auth/session tests retained |

The existing unused `onMapAccount` prop/API callback remains present; no mapping UI existed in the baseline and none was invented. Unused Card and nonexistent primitives were left alone. No dependency upgrades or unrelated security/refactor work were bundled into the redesign.

## TDD, focused commits and review

- Library/theme: commits `e79350d`, `aee2d00`; expected design/interaction failures before implementation. Independent review identified inert ownership/status metadata in list rows; regression RED4 preceded `b7849a2`, scoped re-review approved it.
- Dialogs/forms/gate: `b7b87d0`, generated assets `064f297`. Initial focused RED13 and additional scoped RED2/group-label failures preceded their fixes. Focused GREEN33, full UI152/backend355, typecheck/build verified before review. Independent task review approved with a nested-error-context Minor.
- Fresh whole-branch review covered original branch `3c1f2c3..064f297`, including earlier test infrastructure/API boundary and specifically UI regressions. It found Important controlled-dialog focus loss and two Minors: stale errors in unrelated forms and missing palette coverage.
- One consolidated final fix wave: `8249b16` focus/error regressions and fixes, `a3984d0` palette characterization, `d8cce0d` assets. Behavioral RED14/36 passed preceded fixes; GREEN50, expanded focused83, complete UI169/backend355 followed. Palette was already correct; its test is characterization, not claimed RED.
- Fresh scoped re-review addressed all three original findings with no new Critical/Important. A focused compatibility probe found the Minor below. Full reports and exact failure/command evidence are retained in [minimal-dark-ui](minimal-dark-ui/).

## Fresh final controller verification

Frontend working directory: `src/penguinlauncher-ui`; .NET/git/bundle checks: worktree root. Node v24.19.0, npm 11.17.0, .NET SDK10.0.401. Final source HEAD was unchanged during these runs.

| Exact command | Observed result |
| --- | --- |
| `npm test` | Exit0; 169/169 tests, nine files; no warnings/errors |
| `npm run typecheck` | Exit0; application and test TypeScript configurations |
| `npm run build` | Exit0; Vite5.4.21, 1,988 modules; index-B_76knR7.js / index-npkNKYyz.css |
| `dotnet test PenguinLauncher.sln --no-restore` | Exit0; 355 passed, zero failed/skipped |
| `dotnet build PenguinLauncher.sln -c Release --no-restore` | Exit0; zero warnings/errors |
| `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore` | Exit2; 165 existing WHITESPACE diagnostics, unchanged UI baseline |
| `npm audit --json` | Exit1; nine advisory entries: six high, three moderate; unchanged UI dependency set |
| `node --check src/PenguinLauncher/wwwroot/assets/index-B_76knR7.js` | Exit0 |
| `git diff --check` and `git diff --check 0c6261eb9079964fcb50d33d1fbf2deeb6d3f661..HEAD` | Exit0; no whitespace findings after generated-only normalization |
| `git diff --ignore-space-at-eol --exit-code -- src/PenguinLauncher/wwwroot` | Exit0 after fresh build: raw drift was formatting only |
| `git diff --quiet -- src/PenguinLauncher/wwwroot` | Exit0 after normalization: fresh generated artifacts match committed HEAD |

Fresh build reproduced inherited Windows generated formatting: 15 CR characters in HTML and five whitespace-only JS template lines. Only that generated formatting was normalized; no executable text or source behavior was hand-rewritten. Fresh bundle syntax and committed-artifact comparison passed. Git autocrlf notices are not test/build failures.

Formatter diagnostic counting initially missed wrapped stderr lines; counting raw `WHITESPACE:` occurrences confirmed165. The final audit log collector initially used a repository-relative path from the frontend directory and failed; an absolute-path retry with terminating error handling produced the recorded exit1/9-advisory result. These collector errors are not product failures or successful checks. There is no configured ESLint, separate integration command, or browser E2E runner; existing frontend and .NET suites were run in full, not replaced by invented commands.

Initial staging of newly captured text evidence identified excess blank lines at EOF. Only those generated text logs were normalized to one final newline; the staged whitespace check then exited0. Original scratch output remains available; no product code was changed for evidence formatting.

The PowerShell stderr capture's original `fffe` BOM identified UTF-16LE. Its committed diagnostic copy was decoded explicitly to UTF-8 after staging exposed a binary log; the decoded copy retains all165 diagnostics. This conversion affects evidence only, not source or command results.

UI baseline was frontend90/backend355 passing. Formatter/advisories predate this UI task; some tooling dependencies/advisories were introduced during earlier test-infrastructure work and are not all attributed to the original repository snapshot.

## Actual browser checks and limits

Ignored preview instrumentation imports actual React components/CSS and substitutes only synthetic hook/API boundaries, without a backend proxy. All account mutations reject; launch returns a preview-only failure. Production authentication/bootstrap is unchanged. No real account, credential, vendor, deletion or launch operation was performed.

At 1200x800 and 640x800: grid/list, missing artwork, long titles/profiles, wrapped toolbar, scrollable filters, details, conflict selector/cancel, accounts manager, labeled manual form/Escape and removal warning/Cancel were inspected. Final committed source was reloaded. Grid body Enter/Escape and list body Enter/Close restore the original named game control; nested Add Escape restores Add Profile, then manager Escape restores Accounts. Browser warning/error capture returned empty. Viewport override was reset; synthetic preview remains open.

Native Photino appearance/focus/token delivery/reopen, occupied-port behavior, live screen-reader announcements, successful real vendor operations and exhaustive viewport/account-volume geometry remain unverified. Source review and synthetic tests do not certify these. Packaged release reproducibility and the pending roadmap projects remain separate; the running native app was not restarted.

## Residual Minor and controller rulings

1. Three standard columns from the existing lg/1024px breakpoint were chosen after a two-column 1200x800 preview made covers oversized and pushed actions to the viewport edge. Cost if wrong: a denser desktop default than a two-column preference; other densities remain available.
2. The final review's declined judgments were accepted as explicit non-certification/scope limits: native and live assistive-technology checks; release reproducibility; pending exception/storage/transaction/session/integrity/launch/Steam/ownership/metadata and broader host lifecycle work; excluded same-user/trusted-origin compromise; real vendor operations; unused mapping UI; unsupported-data/case/concurrency/old timer behavior; dependencies/formatter/pipeline/extraction. Fresh generated equivalence was resolved by this build, not deferred. Cost if wrong: those runtime/security/release behaviors can still fail despite synthetic checks. [Roadmap status](../roadmap-status.md) remains authoritative and pending.
3. Newly found Minor: when an existing Radix Trigger is activated without receiving focus, the wrapper restores the previously focused control rather than the Trigger. A focused actual-Radix comparison reproduced this; the focused-Trigger test does not cover it. Production has only the Trigger definition/export and no consumers (`rg -n 'DialogTrigger' src/penguinlauncher-ui/src`); controlled app keyboard/nested paths are verified. Deferred after the single final fix/re-review wave. Cost if wrong: future/programmatic or non-focusing pointer Trigger consumers can restore focus incorrectly. This is not a claim of perfect primitive compatibility; regression coverage and a targeted Trigger-aware adjustment remain follow-up work.

## Handoff

Focused commits and verification evidence remain on the isolated branch. No merge, push, worktree deletion, global Git setting change or native app restart occurred. The UI is ready for review/integration with the residual Minor and verification limits disclosed; the full original production-hardening roadmap is not complete.
