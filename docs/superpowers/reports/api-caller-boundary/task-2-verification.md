# Task 2: shared HTTP boundary and safe API fallback

Implementation status: ready for independent review, with baseline verification concerns.
Base: `b9e1a1bb1c887f742f1032387ef795cc3f5968db`.
Workdir: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
UI cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`.
Approved requirements: Task 2 brief, execution-context.md and docs/superpowers/specs/2026-10-03-api-caller-boundary-design.md. No plan/roadmap/ledger completion has been changed.

## Implementation and changed files

- `src/PenguinLauncher/Hosting/LocalApiBoundary.cs`: shared composition validates exact single authority before all content; protects case-insensitive API segments; validates Origin and cross-site fetch metadata before authentication; validates narrow explicit development preflights before bearer checking; delegates credential comparison to the accepted immutable ApiSessionPolicy. Generic 401/403 errors and JSON 404 helper use the exact approved messages. API Cache-Control is set to no-store through OnStarting after handlers set headers.
- `tests/PenguinLauncher.Tests/Fixtures/ApiBoundaryFixture.cs`: safe synthetic handlers reproduce all existing API route/method shapes, count business entry, deliberately overwrite cache headers, and serve harmless static/SPA responses. Client authority is localhost:5100. Direct TestServer contexts preserve malformed middleware-visible headers. Client and app are disposed on startup failure and normal teardown.
- `tests/PenguinLauncher.Tests/Hosting/LocalApiBoundaryTests.cs`: 106 boundary cases cover every current anonymous route, unknown/API root/mixed-case/slash paths, unsupported methods, malformed body, strict credentials and retired capability, authority/origin/metadata, authenticated responses/fallback, token-free SPA/static content, explicit allowed/invalid/duplicate preflights and readable development 401/403 responses.
- `tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs`: optional policy composes the same boundary before its unchanged reject-only admission. Authenticated clients use localhost:5100; the null-policy guard-only construction retains its original client authority and behavior. Startup failure cleanup includes the client.
- `tests/PenguinLauncher.Tests/Endpoints/AuthenticatedRequestGuardTests.cs`: all 43 existing invalid-body cases first receive anonymous 401, then retain their exact authenticated 400 messages, with zero session operations. No successful sentinel mutation is exercised.
- Task 2 evidence files in this report directory. No Program, UI, dependency, storage or launcher implementation was changed. The build's generated HTML was confirmed equal to HEAD ignoring line endings and restored with apply_patch; no generated content remains changed.

## TDD and debugging evidence

Commands were run at Root, with an explicit native exit captured after every invocation.

1. `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiBoundaryTests --verbosity normal`: first anonymous RED, native 1, 25 failed/0 passed. No-op boundary shell compiled. Expected Unauthorized differed from synthetic OK/404/405; no production services were reachable. [Full output](task-2-red-anonymous.log).
2. Same command after complete hostile/authenticated/fallback/preflight tables: RED, native 1, 99 failed/7 passed of 106. This preceded production enforcement. The seven existing token-free SPA/static/allowed-metadata observations were expected to retain existing behavior. [Full output](task-2-red-complete-boundary.log).
3. First enforcement attempt, `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiBoundaryTests --verbosity minimal`: native 1, 5 failed/101 passed. The file is named green-boundary.log but records an unsuccessful attempt, not green evidence. [Full output](task-2-green-boundary.log).
4. Systematic-debugging instrumentation recorded the headers arriving before the boundary. HttpClient changed double-space/tab authorization to a single-space form, trimmed the trailing authorization space, and replaced an empty Host with localhost:5100. An empty Origin was omitted. The diagnostic assertions and expected/actual values are preserved. [Full output](task-2-httpclient-normalization-diagnostic.log).
5. Malformed inputs were moved to fixture `SendRawAsync`, which uses TestServer.SendAsync through the actual shared middleware and endpoint pipeline. No production policy was weakened. The full amended suite was re-run with the no-op shell: RED, native 1, 99 failed/7 passed of 106. The real middleware was then restored. [Full output](task-2-red-amended-raw-contexts.log).
6. Direct-context boundary GREEN, same minimal boundary filter, native 0, 106 passed. [Full output](task-2-green-raw-boundary.log).
7. `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~AuthenticatedRequestGuardTests --verbosity normal`: RED before GuardApiFixture composition, native 1, all 43 cases failed Expected Unauthorized / Actual BadRequest. [Full output](task-2-red-guard-composition.log).
8. `dotnet test PenguinLauncher.sln --filter 'FullyQualifiedName~LocalApiBoundaryTests|FullyQualifiedName~AuthenticatedRequestGuardTests|FullyQualifiedName~RequestGuardTests' --verbosity normal`: final focused GREEN after shared guard composition, native 0, 204 passed (106 boundary + 43 authenticated guard + 55 existing guard cases). [Full output](task-2-green-boundary-and-guards.log).
9. Scoped formatting of only these five authored files: native 0. Full project formatter output below contains no task-file diagnostics.

These tests prove validation of headers as received by the middleware. They do not prove that wire-level HTTP whitespace survives a transport parser or is rejected before normalization. Kestrel may reject malformed transport headers with 400 before this middleware, as allowed by the spec. This task uses TestServer only, with no real listener or Program.Main invocation.

## Full final matrix

The complete matrix ran serially after focused green and scoped formatting. Each linked output contains cwd, full command, native exit and complete output.

| Cwd | Command | Native exit | Evidence |
| --- | --- | --- | --- |
| Root | `dotnet test PenguinLauncher.sln --verbosity minimal` | 0 | [full output](task-2-backend-tests.md) |
| UI | `npm test` | 0 | [full output](task-2-frontend-tests.md) |
| UI | `npm run typecheck` | 0 | [full output](task-2-typecheck.md) |
| UI | `npm run build` | 0 | [full output](task-2-frontend-build.md) |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | [full output](task-2-release-build.md) |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | 2 | [full output](task-2-format.md) |
| UI | `npm ls --all` | 0 | [full output](task-2-npm-inventory.md) |
| UI | `npm audit --json` | 1 | [full output](task-2-npm-audit.md) |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | [full output](task-2-dotnet-vulnerable.md) |
| Root | `git diff --check` | 2 | [full output](task-2-diff-check.md) |

Results: backend 325/325, frontend 19/19; both TypeScript configurations pass; frontend and Release backend builds pass; Release build has zero warnings/errors; npm inventory exits 0; NuGet reports no vulnerable packages for either project.

Formatter native 2: exactly 233 existing WHITESPACE diagnostics, 138 in Program.cs and 95 in LaunchManagerService.cs; no task file appears. These unchanged files are outside this task.
npm audit native 1: nine advisory package entries, six high and three moderate: @vitest/mocker, braces, chokidar, esbuild, fast-glob, micromatch, tailwindcss, vite and vitest. Dependency files were untouched. Vitest API/browser serving remains disabled; the existing advisory/deprecation follow-up stays in roadmap 9a.
The initial diff-check native 2 was only the documented frontend-build HTML newline drift. After a content comparison ignoring CR/LF and apply_patch restoration, `git diff --check` exits 0. [Fresh final output](task-2-diff-check-after-html-restoration.md).

The first staged diff check found only captured log trailing whitespace/terminal blank lines and an extra terminal blank line in the authored authenticated-guard test. These were corrected with apply_patch. Native output evidence retains all substantive lines, messages, counts and exit markers; only trailing horizontal whitespace and redundant terminal blank lines are normalized. A subsequent staged diff check exits 0. [Staged evidence](task-2-staged-diff-check.md).

## Self-review

Read the final middleware, both fixtures, both new test files and the GuardApiFixture diff against BASE. Checked authority-first ordering, case-insensitive segment detection, raw header count checks, origin-before-token behavior, cross-site exception scope, explicit preflight method/header validation, absence of blanket CORS/cookie/wildcard permission, and error CORS ordering. API cache enforcement uses OnStarting and the synthetic success/error handlers intentionally attempt an overwrite. Unknown API fallback composes the shared API detector/error helper; static/SPA requests reach token-free content only after accepted authority.

Mentally removing authority/origin/authentication/preflight validation or no-store enforcement causes named hostile/anonymous/cache cases to fail. The 43 paired real guard cases catch missing shared composition or changed validation responses; the original guard-only tests remain unchanged. Fixtures never call Program.Main, real scanner/swapper/launch workflows or AppData; sentinel admission is unchanged and rejects all successful mutation paths.

No introduced correctness concerns found during self-review. No unresolved context, API/interface redesign, dependency changes or out-of-scope cleanup. Independent review remains the controller's gate. Program/Main integration and its fallback wiring are intentionally deferred to Task 5, per the approved task boundary.

## Concerns and limitations

- Existing formatter and npm audit failures remain and are reported above; this is not an all-checks-pass claim.
- TestServer evidence covers middleware-visible headers, not native wire parsing or a webview lifecycle smoke test. Those are not Task 2 deliverables.
- This task provides the shared implementation and fixture composition; production Main does not yet call it.
