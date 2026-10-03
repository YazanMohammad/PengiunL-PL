# Task 2 implementation report

Status: implementation and self-review complete; independent review belongs to the controller.
Base: reviewed harness commit `4ba808b` on `improvement/production-hardening`.
Workspace: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening` only.
Commit: `64360c5d079feba402be11816b5ded4e28f577ad` â€” `test: cover account and launch request guards safely`.

## Scope and files

- `tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs`: creates a fresh in-process TestServer for each test, explicitly registers real account/scanner/launch coordinators with null loggers, empty scanner list, one rejecting Steam account swapper, and guard-only storage sentinel; maps the existing account and launch endpoints; asynchronously starts and disposes the host and disposes its client. Failed startup also disposes the host.
- `tests/PenguinLauncher.Tests/Fixtures/RejectingAccountSwapper.cs`: all eight interface operations increment an atomic operation counter and throw immediately. Platform selection is Steam. No credentials, filesystem, registry, network, or process implementation exists in the double.
- `tests/PenguinLauncher.Tests/Endpoints/RequestGuardTests.cs`: 55 independently discovered cases. Twenty invalid identifier cases, 23 invalid profile cases, 11 fixture boundary cases, and one sentinel safety fact.
- This report is intentionally retained under ignored `.superpowers/`; the commit contains the three focused test files only.

No production code, project/solution files, dependency pins, frontend files, or package versions changed. No successful mutation/launch request is sent. No delegation or reviewer dispatch was performed.

## Isolation and binding self-review

The fixture uses `UseTestServer()` and `GetTestClient()`; it never calls `Program.Main`, sets the production URL, invokes Photino, or contacts localhost:5100/vendor services. Existing HTTP string-enum settings are installed with `ConfigureHttpJsonOptions` and `JsonStringEnumConverter`.

Explicit coordinator construction means no platform scanner or platform swapper is registered/constructed. The scanner list is empty. The real `AccountSwapperService` receives only the rejecting double and `NullLogger<AccountSwapperService>.Instance`.

The sentinel uses `RuntimeHelpers.GetUninitializedObject(typeof(JsonStorageService))`. Its instance initializers do not execute: `_lock` remains null and `_state` remains null. Source review confirms `LoadAsync` and `SaveAsync` each start with `await _lock.WaitAsync()` before their `try` blocks and before any `File.Exists`, file read, directory create, serialization, or file write. The safety fact separately awaited both calls, observed `NullReferenceException`, and checked each stack trace names the corresponding storage method. No static AppData path is patched, and no actual AppData state is inspected. The sentinel is deliberately unsuitable for persistence/launch success tests.

Middleware allows POST only to the exact case-sensitive strings `/api/accounts/map`, `/api/accounts/swap`, `/api/accounts/add`, `/api/accounts/capture`, `/api/accounts/rename`, `/api/launch/`. Every other request receives 404. It never reads/validates the body and has no 400 branch. All 43 positive guard cases therefore obtain 400 and their `error` string from the mapped production handlers, not test middleware or a generic binding error. Nullable requests include literal JSON `null` on all six routes. Bodies and expected errors are literal independent data. Missing, empty, whitespace (including escaped tab), and explicit-null identifiers are covered independently; add/capture platform errors and add/rename display-name errors are covered.

The boundary theory includes synthetic account listing, platform listing, DELETE, logout, preflight, GET on allowed paths, unknown routes, uppercase route spelling, alternate trailing slash, and missing launch trailing slash. Its deliberately invalid JSON still returns 404, confirming admission rejects before binding. Every request uses a new fixture and asserts no session operations. No valid mutation is used to test this boundary.

## Tests-first evidence and failure diagnoses

Tests and fixture were authored before implementing endpoint admission. The initial fixture safely denied every request. After resolving the compile issue below, the first executed suite discovered 55 cases: 12 safety/boundary cases passed and all 43 handler cases failed with expected `BadRequest`, actual `NotFound`. This is a meaningful red assertion cycle for missing fixture admission; it also demonstrates a failing xUnit assertion makes the test command fail. The exact six-path POST admission was then added, with no body handling, and all 55 cases passed. Existing endpoint behavior is characterization and needed no product changes.

Unexpected compile failure: the initial untyped `(context, next)` middleware lambda matched both `Use` overloads (`Func<Task>` and `RequestDelegate`), yielding CS0121 at `GuardApiFixture.cs`. Read `superpowers:systematic-debugging` before correction. Root cause was the unused second argument not constraining overload resolution. The single change to `(HttpContext context, RequestDelegate next)` resolved that ambiguity. This compile failure was not counted as the red assertion cycle. No production behavior was changed to satisfy tests.

One exploratory read used nonexistent `src/PenguinLauncher/Api/AccountEndpoints.cs` and `Api/LaunchEndpoints.cs` paths, exit 1; `rg --files` established the existing `Endpoints/` paths and the corrected reads succeeded. Ancestor AGENTS lookup returned no files (PowerShell exit 1); no applicable AGENTS file was found by the scoped file inventory.

## Exact verification commands and results

All test commands ran sequentially in the isolated workspace. Output-tail pipelines below preserve the real dotnet exit code using `exit $LASTEXITCODE`; they do not limit execution or discovery.

1. `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~RequestGuardTests --verbosity normal`
   - Exit 1; compilation failed before test execution with CS0121, 0 warnings, 1 error; no test count claimed.
2. `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~RequestGuardTests --verbosity normal 2>&1 | Select-Object -Last 55; exit $LASTEXITCODE`
   - Exit 1; 55 discovered/executed, 12 passed, 43 failed. Failures are both theories' complete parameter sets (`InvalidIdentifiers_Return400WithoutSessionOperations`, 20; `InvalidProfileRequests_Return400WithoutSessionOperations`, 23), all caused by deny-all fixture 404 versus expected handler 400. Sentinel/boundary cases passed. Build summary 0 warnings/0 errors; VSTest reported MSB4181 because failing assertions correctly returned failure.
3. `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~RequestGuardTests --verbosity normal 2>&1 | Select-Object -Last 85; exit $LASTEXITCODE`
   - Exit 0; 55 passed, 0 failed, 0 skipped; build 0 warnings/0 errors. All 43 handler cases returned 400 with exact JSON error contract and zero double operations. All 11 unapproved request cases returned 404 and zero operations. Sentinel Load/Save fact passed.
4. `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --verbosity normal 2>&1 | Select-Object -Last 110; exit $LASTEXITCODE`
   - Exit 0; complete backend suite 64 passed, 0 failed, 0 skipped (existing 9 + new 55); build 0 warnings/0 errors. All individual cases and complete summary were inspected. No unexplained failures remain.
5. `git add tests/PenguinLauncher.Tests/Endpoints/RequestGuardTests.cs tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs tests/PenguinLauncher.Tests/Fixtures/RejectingAccountSwapper.cs`
   - Exit 0; only the three intended files staged. Git gave existing Windows LF-to-CRLF normalization notices, not whitespace diagnostics.
6. `git diff --cached --check`
   - Exit 0; no diagnostics (checked twice).
7. `git diff --cached --stat` and scoped `git diff --cached -- tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs tests/PenguinLauncher.Tests/Fixtures/RejectingAccountSwapper.cs tests/PenguinLauncher.Tests/Endpoints/RequestGuardTests.cs`
   - Exit 0; reviewed 3 new files, 248 insertions. No unrelated staged changes.
8. `git diff --name-only`, `git status --short`, `git check-ignore -v .superpowers/sdd/2026-10-03-test-infrastructure/task-2-report.md`, `git branch --show-current`
   - Exit 0; no unstaged tracked changes; status lists only the three staged additions; report is ignored by `.gitignore:12:/.superpowers/`; branch is `improvement/production-hardening`.
9. `git -c user.name=Codex -c user.email=codex@openai.com commit -m "test: cover account and launch request guards safely"`
   - Exit 0; focused commit `64360c5d079feba402be11816b5ded4e28f577ad`, 3 files/248 insertions.
10. `git rev-parse HEAD`, `git status --short`, `git show --stat --oneline HEAD`, `git diff HEAD --check`
    - Exit 0; correct commit SHA, clean tracked worktree, correct three-file commit scope, no diff-check diagnostics.

## Mutation targets

These are reasoned targets; no temporary production mutation was executed.

- Removing/bypassing map/swap/rename identifier checks, or accepting whitespace via `IsNullOrEmpty`, reaches sentinel `LoadAsync` and returns safe 500 instead of 400. No AppData I/O is reached.
- Removing/bypassing launch GameId validation reaches sentinel storage inside real `LaunchManagerService`, yielding failed launch/422 (or 500 for a null request), not 400; no scanner/process launch is reached.
- Removing/bypassing add display-name or capture platform validation reaches rejected operations where platform resolves to Steam (or another non-400 route outcome for invalid platform), or a safe null-reference failure before the operation. This fails 400/error assertions; double-operation assertion also protects against code that performs an operation then still returns 400.
- Changing/removing the JSON `error` property or required-field/platform/display-name explanation fails the independently literal response assertion, even if status stays 400.
- Broadening fixture middleware to admit GET/DELETE/logout/preflight, alternate path case/slash, or arbitrary paths fails the literal 404 boundary assertions. Endpoint admission missing entirely was exercised: all 43 guard cases failed, so tests cannot silently pass against test middleware's 404.
- Altering sentinel construction so instance field initializers execute breaks the reviewed isolation assumption. The narrow workaround must be replaced/re-reviewed before running guard tests after such changes; never probe real persistence to validate it.

## Concerns and handoff

No unresolved implementation failure. The sentinel intentionally depends on the current storage methods acquiring the null lock before I/O. The safety fact and source review characterize that assumption today; they do not make arbitrary future rearrangements of filesystem access safe to execute. If storage implementation/order changes, replace/review this sentinel before rerunning guards. The owning storage project should provide isolated storage, then remove this workaround.

The controller must independently review sentinel call ordering, explicit registration, exact allowlist, real-handler binding, and disposal before Task 3. Frontend checks, Release build, and repository-wide formatter matrix remain later project verification work; this task ran the full backend suite, not the complete frontend/build matrix. Baseline formatter/advisory cleanup remains out of scope.
