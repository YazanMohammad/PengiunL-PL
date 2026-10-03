# Task 3 implementation and complete verification report

Status: **DONE_WITH_CONCERNS**. Implementation, self-review, and verification matrix are complete. Fresh independent Task 3 review and whole-branch review are **PENDING**, owned by the controller. New test-tool advisory findings are explicitly outstanding; this is not a claim that the dependency tree is secure or that the whole roadmap is complete.

Commit: `06f1ca07a42afef1a10d47c510fff44f0c6a32cc` â€” `test: characterize frontend requests and account selection`.

Base: reviewed backend commits `4ba808b` and `64360c5`; production source baseline `3c1f2c3`.

Workspace: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`, branch `improvement/production-hardening`. All edits and commands were confined to this worktree. Verification date: 2026-10-03. Node `v24.19.0`, npm `11.17.0`, .NET SDK `10.0.401`, Vite `5.4.21`, Vitest `3.2.6`.

## Scope and files

Focused commit contains exactly eight files, 1524 insertions and five deletions:

- `src/penguinlauncher-ui/package.json`: approved exact dev-dependency pins and test/test:watch/typecheck scripts.
- `src/penguinlauncher-ui/package-lock.json`: six new root dev dependencies and their transitive entries; all pre-existing package entries preserved.
- `src/penguinlauncher-ui/vitest.config.ts`: independent React/jsdom test configuration, test-only discovery/setup, restoreMocks, unstubGlobals, api:false, passWithNoTests:false. Does not merge production outDir/proxy configuration.
- `src/penguinlauncher-ui/tsconfig.test.json`: extends production compiler options, includes tests and Vitest config, and adds node/Vitest/jest-dom types.
- `src/penguinlauncher-ui/tests/setup.ts`: jest-dom integration, rejecting default fetch installed before each test, explicit DOM/timer/spy/global cleanup after each test.
- `src/penguinlauncher-ui/tests/api/client.test.ts`: 11 discovered cases against the actual exported API client, with real synthetic Response objects and literal requests/results/errors.
- `src/penguinlauncher-ui/tests/components/AccountSelectorModal.test.tsx`: five cases against the real modal and its real Radix/UI dependencies, using complete synthetic account props and observable callbacks.
- `src/penguinlauncher-ui/tests/isolation.test.tsx`: three cases for rejecting unexpected fetch and restoring test state between cases.

No production C#, TS, TSX, Vite config, production tsconfig, or public JSON interfaces changed. No blanket module mocks, component mocks, snapshots, sleeps, keyboard accessibility changes, launcher operations, credentials, or actual session requests were introduced. No subagents/reviewers were dispatched by this worker.

## Tests-first helper evidence and deliberate runner failure

Read the brief, binding context, approved spec, test-driven-development skill, and its complete writing-good-tests reference before writing tests. Existing behavior uses the approved characterization exemption. Setup behavior was tested first.

Initially setup imported only jest-dom, with the three isolation cases authored before the fetch/cleanup hooks. Ran `npm test -- tests/isolation.test.tsx`: exit **1**, three discovered, one passed, two failed. The unexpected-request case expected `Unexpected fetch request: /unexpected-test-request` but received native fetch's `Failed to parse URL from /unexpected-test-request`. Its relative URL cannot contact a network endpoint. The state-restoration case found the previous test's paragraph still in the document. This was the intended red assertion cycle, not a compile/load error.

Implemented beforeEach/afterEach hooks, then ran `npm test -- tests/isolation.test.tsx tests/api/client.test.ts tests/components/AccountSelectorModal.test.tsx`: exit **0**, 19 discovered/passed, zero failures. Isolation tests separately check DOM, fake timers, global marker, console spy, and fresh rejecting fetch; the controlled case uses a one-shot response, preserving the rejecting fallback.

Temporarily replaced the first client theory's expected URL with literal `/api/games?rescan=deliberately-wrong`. Ran `npm test -- tests/api/client.test.ts`: exit **1**, 11 discovered, ten passed, one failed. Named failure: `API client > requests games with rescan=undefined`. The call assertion showed the expected deliberately-wrong URL versus actual `/api/games?rescan=false`, with one actual call. Restored the correct literal with apply_patch before commit. Same focused command then returned exit **0**, 11 passed. The deliberate probe is absent from the commit.

## Commands, native exits, counts, diagnostics

Root commands ran at the worktree root; UI commands ran at `src/penguinlauncher-ui`. The final matrix beginning with the second backend suite invocation ran sequentially, awaiting process completion before the next command. An earlier exploratory backend test was still running while frontend test/typecheck began; both completed successfully before any frontend build, and the matrix test/typecheck sequence was then repeated serially. Frontend and backend builds never overlapped.

| Directory | Exact underlying command | Exit | Observed result |
| --- | --- | ---: | --- |
| UI | `npm install --ignore-scripts` | 0 | Added 96 packages/lock entries. Deprecation: whatwg-encoding 3.1.1. Reported nine vulnerability entries. No force or legacy-peer-deps flags. |
| UI | `npm test -- tests/isolation.test.tsx` | 1 | Intentional setup red: 2 failed, 1 passed, 3 discovered. |
| UI | `npm test -- tests/isolation.test.tsx tests/api/client.test.ts tests/components/AccountSelectorModal.test.tsx` | 0 | 19 passed across 3 files (11 client, 5 modal, 3 isolation). |
| UI | `npm test -- tests/api/client.test.ts` | 1 | Deliberate incorrect URL: 1 assertion failed, 10 passed. |
| UI | `npm test -- tests/api/client.test.ts` | 0 | Restored URL: 11 passed. |
| Root | `dotnet test PenguinLauncher.sln --verbosity normal` | 0 | Initial and final serial invocations: 64 passed, 0 failed/skipped, 0 warnings/errors. Final run total test time 2.4004s. |
| UI | `npm test` | 0 | Initial and final serial invocations: 19 passed, 0 failures, 3 files. Final serial run duration 2.01s. No unhandled errors or warnings. |
| UI | `npm run typecheck` | 0 | Both production `tsc --noEmit` and `tsc --project tsconfig.test.json --noEmit` completed. Initial and final serial invocations passed. |
| UI | `npm run build` | 0 | 1987 modules, built in 4.32s. Same JS/CSS artifact filenames and content as baseline. |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | Both projects built; 0 warnings/errors, 3.71s. |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | **2** | Native exit confirmed with explicit capture. Exactly baseline 233 WHITESPACE: Program.cs 138, LaunchManagerService.cs 95. Zero test-file diagnostics. |
| UI | `npm ls --all` | 0 | No invalid peers or required dependency errors. Unmet OPTIONAL packages are shown for unused platforms/features. |
| UI | `npm audit --json` | **1** | 9 entries: 3 moderate, 6 high; 0 info/low/critical. Baseline seven remain; two new moderate package entries share one advisory. |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | Both PenguinLauncher and PenguinLauncher.Tests report no vulnerable packages against current NuGet source. |
| Root | `git diff --check` | 0 | No whitespace errors. Windows LF/CRLF notices only. |
| UI | `npm run test:watch` | 0 on `q` | 19 passed, then waited for changes. Quit with the runner's `q` command. |
| Root | `git diff --cached --check` | 0 | Eight-file staged change had no whitespace errors. |
| Root | `git -c user.name=Codex -c user.email=codex@openai.com commit -m "test: characterize frontend requests and account selection"` | 0 | Focused commit above. No global identity change. |
| Root | `git diff 3c1f2c3 --exit-code -- src/PenguinLauncher src/penguinlauncher-ui/src src/penguinlauncher-ui/vite.config.ts src/penguinlauncher-ui/tsconfig.json` | 0 | Empty diff: baseline production sources/config/assets preserved. |
| Root | `git status --short` | 0 | Empty after commit. Report remains in ignored execution workspace. |

The first unwrapped formatter tool invocation returned shell exit 1; default PowerShell translated the nonzero native result. Repeated diagnostic capture explicitly retained `$formatExit = $LASTEXITCODE` immediately after dotnet and ended with `exit $formatExit`, confirming native **2**, not pipeline success. Its final diagnostic wrapper counted output lines in a foreach loop: 233 WHITESPACE, two production files above, zero lines naming the test project. An earlier grouping wrapper also returned native 2 but displayed only the count; the final wrapper resolved that presentation gap. npm audit was likewise repeated with immediate `$auditExit = $LASTEXITCODE` capture, parsed JSON summary, and `exit $auditExit`, confirming native 1. Successful commands had native/shell 0; failing test commands returned 1 as observed.

One exploratory read used nonexistent `src/types.ts`; corrected inventory established `src/types/index.ts`. One exploratory rg used Windows-incompatible explicit filename wildcards for dependency chunks; corrected directory searches with `-g '*.js'` succeeded. No product defect or implementation test failure required a fix. Read systematic-debugging before investigating the additional advisory. A combined delete/add restoration patch was rejected before writing because apply_patch disallows multiple operations on one target; an Update File patch then restored the approved output normalization.

## Dependency compatibility and new-versus-baseline advisories

Approved exact additions: vitest 3.2.6, @testing-library/react 16.3.0, @testing-library/dom 10.4.1, @testing-library/jest-dom 6.9.1, jsdom 26.1.0, @types/node 24.0.0. Installation worked on Node 24 and npm 11. React remained 18.3.1, Vite 5.4.21, and every other existing version was retained.

Compared the old lock via `git show HEAD:src/penguinlauncher-ui/package-lock.json` before committing against parsed new JSON. **All 228 pre-existing non-root package entries were identical in every property**, including versions, integrity/resolution metadata, peer/dependency declarations and flags; 96 package paths were added. Root dependency declarations are unchanged except the six approved dev additions. This is stronger than only checking version equality. No package upgrade was silently accepted.

The existing seven affected package entries remain: braces, chokidar, esbuild, fast-glob, micromatch, tailwindcss, vite. New moderate entries are **vitest** and **@vitest/mocker**, both from [GHSA-82fw-gwwq-j7x9 / CVE-2026-84373](https://github.com/advisories/GHSA-82fw-gwwq-j7x9). npm's total is affected-package entries, not nine distinct advisories. No baseline findings were fixed or claimed fixed.

The [primary advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) identifies redirect-mock file reads in a development-server plugin. Unauthenticated exploitation requires a reachable HMR socket using public mockerPlugin/interceptorPlugin; Vitest browser RPC uses token authentication. Fixed releases start at 4.1.11; the 3.x branch has no planned backport. Our configuration uses jsdom, api:false, no browser mode, and no public mocker plugin. Installed CLI source gates server.listen on config.api?.port. This supports the inference that these supplied test commands do not expose the described serving path; the affected packages remain installed.

Runtime observation while watch mode was idle after its green run: `Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"` filtered command lines to this worktree found five CLI/worker processes; `Get-NetTCPConnection -State Listen` filtered OwningProcess to those process IDs found **zero TCP listeners** (diagnostic command exit 0). No test request used a real server, and no exploit/credential read was attempted. This is an observed process/network snapshot, not a general security guarantee.

Controller explicitly instructed keeping the approved pins, recording DONE_WITH_CONCERNS, and routing the new advisory to independent review and the upcoming toolchain remediation project. No npm audit fix, override, major upgrade, or patch was applied. Independent acceptance of this concern remains pending.

## Production output preservation

Frontend build wrote `src/PenguinLauncher/wwwroot` through unchanged production Vite outDir. Tracked asset files remained identical: `assets/index-7ftwbyUw.css` and `assets/index-Chg6bpHi.js`. Only index.html showed drift: CRLF/mixed carriage returns, including a doubled carriage return on the root-div line. Read-only comparison after removing carriage returns proved exact content equality. Restored that single file with an apply_patch Update File normalization, then byte comparison against `git show HEAD:src/PenguinLauncher/wwwroot/index.html` returned **true** and scoped git diff exit 0. No generated output drift was committed. The complete baseline production-directory diff is empty.

## Mutation targets for every final test

These are meaningful reasoned targets, not executed temporary production mutations. The only executed incorrect client expectation was the deliberate runner probe above.

| Final test/case | Change caught |
| --- | --- |
| requests games, default rescan | Incorrect API base/path, default rescan, omitted/wrong content type, wrong explicit method/options, extra fetch, or non-array successful decode. |
| requests games, rescan true | Ignoring/inverting true, wrong query/path/header/options, extra fetch, or non-array decode. |
| decodes account list | Returning raw JSON/empty default or dropping/changing full synthetic account fields; wrong account path/header or extra request. |
| mapping POST | Wrong method/path/header, omitted/swapped game/account identifiers, altered serialized body, or duplicate submission. |
| launch POST | Wrong method/path/header/body or selected account; dropping/inverting launch outcome fields or duplicate submission. |
| account DELETE | Wrong DELETE method/account URL/header; dropped/incorrect successful result or duplicate request. |
| 400 detail | Ignoring detail text or treating failed response as success. |
| 400 error | Ignoring error text or treating failed response as success. |
| 400 message | Ignoring message text or treating failed response as success. |
| empty successful 200 | Removing the empty-body guard and throwing on JSON parse or returning undefined/string. |
| empty successful 204 | Same empty-body contract for no-content response. |
| modal lists/selects Switch & Play | Missing account/game/active data; selecting Alice instead of Bob; missing click callback; absent stopPropagation causing duplicate selection; cancel fired during selection. |
| modal display text click | Card click absent, wrong identity, duplicate callback, or cancellation during selection. |
| modal no conflict | Rendering a spurious dialog/account data or emitting selection/cancel callbacks on the null branch. |
| modal close button | Missing/duplicated cancel callback or erroneously selecting on close. |
| modal fresh render after unmount | Stale account state/portal retained across mounting, old account data still displayed, or wrong new account data. |
| isolation unexpected request | Missing default blocker or a changed implementation that does not reject unexpected fetch before network. Test-only setup boundary. |
| isolation temporary state | Guard that disallows deliberate one-shot Responses or inability of the test environment to render/use fake timers; supports the subsequent leakage test. Test-only helper coverage. |
| isolation next test restoration | Missing DOM cleanup, fake-timer reset, restored spy/global state, or fresh default fetch guard. Test-only helper boundary; detects leakage between tests. |

## Self-review, limitations, and remaining gate

Inspected staged diffs, manifest/lock entries, complete real Account/ConflictInfo shapes, HTTP methods and literal bodies, real modal event bubbling/close behavior, setup order, cleanup, separate config/typecheck, and production output preservation. Read verification-before-completion before final matrix and commit. DOM queries are deterministic, and tests explicitly import Vitest APIs. API spies return one controlled real Response then fall back to the rejecting default. Synthetic account values are complete, contain null backup/login fields, and cause no account/session discovery.

Existing malformed-body behavior remains outside approved scope: source inspection shows unsuccessful JSON parsing followed by a second read of an already-consumed Response body, and successful malformed JSON can be returned as a raw string under a typed contract. No preservation assertion for these defects was added, no defect was fixed, and no reproduction against a real server was run. The owning future HTTP/error remediation task needs a failing regression first. Keyboard behavior remains unmodified.

Backend evidence is in sibling `task-1-report.md` and `task-2-report.md`. Independent reviews in `task-1-review.md` and `task-2-review.md` are Approved with no findings. Their storage sentinel remains intentionally dependent on null-lock access before I/O; review/replace it before storage ordering changes.

Fresh independent Task 3 review and whole-project/branch review against `3c1f2c3` and the approved spec are **PENDING**. This worker did not mark any independent review as passed. The controller should assess the new tooling advisory, scope, test assertions, synthetic isolation, and state restoration; address important findings and rerun impacted/full checks if fixes change implementation. Durable docs/roadmap tracking commit is intentionally separate and left for the controller after review evidence exists. Later roadmap projects remain pending.
