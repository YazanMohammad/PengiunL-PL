# Local API caller boundary execution report

Status: implementation and automated acceptance completed for project 2a on
2026-10-04, including final regression fixes and independent re-review. Native
runtime delivery remains unverified; the wider roadmap is not complete. Spec
and five-task plan were approved on 2026-10-03.

Spec: [design](../specs/2026-10-03-api-caller-boundary-design.md).
Plan: [implementation tasks](../plans/2026-10-03-api-caller-boundary.md).
Worktree: `.worktrees/production-hardening`, branch `improvement/production-hardening`.
Execution start: `0c35b62`; original project baseline: `3c1f2c3`.

## Fresh pre-implementation baseline

Commands below completed immediately before the first task dispatch. No
production code was changed by approval/plan documentation commits.

| Cwd | Command | Native result |
| --- | --- | --- |
| Worktree root | `dotnet test PenguinLauncher.sln --verbosity minimal` | Exit 0; 64 passed, 0 failed, 0 skipped |
| `src/penguinlauncher-ui` | `npm test` | Exit 0; 19 passed, 0 failed; 3 files |
| Worktree root | `git status --short` | Empty before dispatch |

Backend output:

```text
Determining projects to restore...
All projects are up-to-date for restore.
PenguinLauncher -> .../src/PenguinLauncher/bin/Debug/net10.0/win-x64/PenguinLauncher.dll
PenguinLauncher.Tests -> .../tests/PenguinLauncher.Tests/bin/Debug/net10.0/PenguinLauncher.Tests.dll
Test run for .../tests/PenguinLauncher.Tests/bin/Debug/net10.0/PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
Passed! - Failed: 0, Passed: 64, Skipped: 0, Total: 64, Duration: 851 ms
```

Frontend output:

```text
> penguinlauncher-ui@1.0.0 test
> vitest run
RUN v3.2.6 .../src/penguinlauncher-ui
tests/api/client.test.ts (11 tests) 9ms
tests/isolation.test.tsx (3 tests) 41ms
tests/components/AccountSelectorModal.test.tsx (5 tests) 107ms
Test Files 3 passed (3)
Tests 19 passed (19)
Start at 21:02:09
Duration 14.10s
```

The prior test-infrastructure report separately records existing 233 whitespace
diagnostics and nine npm advisory package entries. They remain baseline debt,
not authentication-introduced failures. Every task will capture fresh applicable
verification; historical results above do not certify a subsequent task.

## Execution and review gates

Task 1 is implemented as `7279e46`, with behavioral red runs preceding code.
Independent review returned spec compliant and task quality Approved, with no
Critical/Important findings. A controller fresh focused run also passed 112/112
policy tests. Full task evidence records 176 backend and 19 frontend tests,
typechecks and both builds; baseline formatter/advisory debt remains separate.

- [Task 1 verification](api-caller-boundary/task-1-verification.md)
- [Task 1 independent review](api-caller-boundary/task-1-review.md)

Task 2 shared HTTP enforcement is accepted after independent review and a
regression-first fallback fix (`860257f`, `1b2aa69`). Initial full verification
records 325 backend/19 frontend tests and passing typechecks/builds. The fix
received 206 focused passing tests and clean scoped re-review; baseline debt
remains separate. The controller fresh covering run also passed 206/206.

- [Task 2 verification](api-caller-boundary/task-2-verification.md)
- [Task 2 independent review and fix](api-caller-boundary/task-2-review.md)

Task 3 session/client capability is accepted (`9d99d8f`), with independent
spec-compliance and quality approval and no introduced important findings.
The recorded full matrix has 327 backend/79 frontend tests; a controller fresh
focused run passed 71/71. Usage interruption preserved completed matrix/TDD
evidence; the original implementer resumed without repeating red steps.

- [Task 3 verification](api-caller-boundary/task-3-verification.md)
- [Task 3 independent review](api-caller-boundary/task-3-review.md)

Task 4 gate/Main integration is accepted (`698ee42`) after fresh independent
spec/quality approval with no important findings. Full recorded verification
has 327 backend/90 UI tests; the controller fresh gate run passed 11/11.
Production bundle disables manual entry and initializes before rendering.

- [Task 4 verification](api-caller-boundary/task-4-verification.md)
- [Task 4 independent review](api-caller-boundary/task-4-review.md)

Task 5 managed host wiring is accepted (`91245ba`), with independent spec/quality
approval and no Critical/Important findings. Recorded full verification has
349 backend/90 UI tests; the controller fresh combined filter passed 340/340.
Formatter debt is now 165 diagnostics after focused changed-block corrections;
nine npm advisories remain. Native runtime smoke is explicitly unavailable.

- [Task 5 verification](api-caller-boundary/task-5-verification.md)
- [Task 5 independent review](api-caller-boundary/task-5-review.md)
- [Native smoke gap](api-caller-boundary/task-5-native-smoke.md)

All five implementation tasks are accepted. Whole-branch regression review found
one Important CORS/error-composition issue and two Minor disposal/reload-test
issues. The consolidated fix wave addressed all three, with separate focused
commits and independent scoped re-review finding no new breakage. The controller's
fresh post-review matrix has355 backend/UI90 passing, typechecks/builds passing,
and unchanged formatter165/npm9 residuals. No native runtime or complete-roadmap
closure is claimed. Every task received spec-compliance and quality approval.
The plan-scoped recovery ledger records task bases, agents, reviews and rulings.
Durable task evidence will be copied into this report's sibling directory before
any scratch cleanup. Other plans' workspaces are outside this plan's scope.

## Rulings made during execution

Task 4 may add the installed Vite client type reference in `src/vite-env.d.ts`.
The approved `import.meta.env.DEV` integration needs it; the repository has no
such declarations today. This is type wiring only. Cost if wrong: unnecessary
ambient declarations or type compatibility changes; both typechecks must detect
conflicts. The task brief and plan include this prerequisite.

Both final-review minors are included in the consolidated fix wave, with separate
focused commits. Headless disposal restores previous owner behavior; deterministic
reload proof strengthens the approved host contract without a project 7 rewrite.
Cost if wrong: premature caller-owned host disposal or brittle configuration proof;
regression tests and scoped re-review must check both.

The seven areas declined by the whole-branch reviewer remain explicitly deferred
or unverified: actual native delivery/profile/reload/reopen/port behavior; general
error redaction/decoding (2b); broad lifecycle/dynamic ports (7); same-user/native/
trusted-script threat exclusions; account/persistence/vendor/launch/ownership/
metadata projects 3–8; dependency/release/formatting/structural projects 9–10;
and successful real vendor workflows until safe owning seams exist. Newly found
CORS/disposal/reload issues are assessed separately. Cost if wrong: known risks
or unverified behavior remain; this branch must not be represented as fully
production-ready or released.

## Whole-branch review

[Original independent regression review](api-caller-boundary/whole-branch-review.md)
compares the original source baseline `3c1f2c3` through `33a7ae7`, including test
infrastructure, authentication and generated assets. It found no Critical issues,
one Important issue (handled exceptions lose permitted development CORS headers)
and two Minors (timing-dependent reload observation and dropped headless disposal).
The initial verdict is “With fixes,” not merge authorization.

The one consolidated wave spans `33a7ae7..19c21a7`: `a21dcc1` restores permitted
development CORS at response start, `000f0b0` restores headless disposal,
`a7a8c1b` replaces timed reload observation with token evidence, and `19c21a7`
records the full fix matrix. Behavioral fixes have intended failing regressions;
reload strengthening is honestly labeled tests-only characterization.

- [Fix implementation and evidence](api-caller-boundary/final-fix-summary.md)
- [Independent scoped re-review: all three addressed, no new breakage](api-caller-boundary/final-fix-review.md)
- [Fresh controller final matrix and exact outputs](api-caller-boundary/final-verification.md)

The scoped review read the supplied full range and supporting tests/evidence;
it did not rerun suites. The controller then executed the entire ten-command
matrix freshly at source head `19c21a7`. Backend355/UI90 and typechecks/builds
pass; formatter165/npm9 remain named failures, not an all-checks-pass result.
Generated HTML newline drift was proven content-equivalent, restored exactly
using apply_patch, and diff-check repeated with exit0. No generated asset content
change remains and no production edit followed the reviewed fix wave.

## Spec acceptance reconciliation

| Spec section | Delivered implementation and evidence | Qualification |
| --- | --- | --- |
| Intent and classification | Hosting policy/boundary, session/client/gate, Program; full branch review | Project2a only, plus prior H7 infrastructure; not all roadmap |
| Alternatives/security limits | Strict capability, authority/origin tests; development-api.md | Same-user malware/debugger/native compromise/trusted script excluded |
| Credential lifecycle/native bootstrap | ApiSessionPolicyTests; session.test.ts; host callback readiness/STA tests | Actual Photino fragment delivery, reload/reopen not runtime-verified |
| Headless/development contracts | Mode precedence/environment policy, host/proxy/gate tests, operator docs | Explicit headless ownership restored; no real vendor host invocation |
| Listener/request boundary | Shared LocalApiBoundary, recording Kestrel transport, guard/auth tests; new real handled500 CORS regression | Fixed loopback5100; reload proof deterministic, transport-header parsing outside middleware remains Kestrel-owned |
| React/client compatibility | session/client API tables and stale-generation cases; real App gate integration; production bundle review | Successful API payloads preserved; jsdom does not certify native delivery |
| Acceptance/testing | Five task TDD/reviews, original whole-branch review, scoped final fixes/re-review, fresh controller matrix | Formatter/advisories fail as documented; no separate E2E/ESLint suite configured |
| Risks/deferred work | Native gap and all seven declined areas explicitly reconciled above; roadmap updated | M3/project2b and remaining M2/project7 unresolved; projects3–10 pending |

## Handoff and next design

Keep `improvement/production-hardening` and its worktree in place. Nothing was
merged, pushed or released; no worktree was removed. Plan-scoped scratch/evidence
is preserved (an earlier scratch-cleanup operation was blocked before execution;
no alternate deletion was attempted). Durable review/verification/rulings above
are the acceptance record, not a certification of real vendor workflows.

Next project2b is bounded if the existing error contract can be kept: replace
unexpected exception messages in the global handler, endpoint catches and failed
LaunchResult with generic messages, preserving URLs, status codes, validation
and successful DTOs. Regression tests must exercise safe synthetic failure paths
before each behavioral fix; no storage/host redesign or unrelated cleanup. If
safe owning seams require changed interfaces, upgrade to architectural design
instead of improvising. This short design is proposed for user approval; no2b
production code has been changed. Error-decoder behavior is not silently changed.
