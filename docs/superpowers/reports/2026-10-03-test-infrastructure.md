# Test infrastructure execution evidence

Date: 2026-10-03. Branch: `improvement/production-hardening`.
Source baseline: `3c1f2c3`. Approved plan: `b56a7d5`.
Worktree: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Status: test-infrastructure project implemented, independently task-reviewed,
whole-branch reviewed and freshly verified. This is not whole-roadmap completion
or a security claim. Formatting and npm advisory checks remain nonzero as
explicitly recorded below.

## Scope and commits

| Task | Commit | Deliverable |
| --- | --- | --- |
| 1 | `4ba808b` | xUnit project, solution discovery, VDF/DTO characterization and safe synthetic-file fixture |
| 2 | `64360c5` | Guard-only TestServer, rejecting session double and 55 API/isolation cases |
| 3 | `06f1ca0` | Separate Vitest/jsdom configuration, pinned test dependencies, scripts and 19 UI/HTTP/isolation cases |

Runtime C#/TS/TSX, production Vite/TypeScript configuration and shipped assets
are unchanged versus the source baseline. New UI dependencies are dev-only;
all 228 pre-existing non-root lock entries were unchanged, with 96 entries added.
No fixture reads credentials, discovers real accounts, scans installations or
starts/stops a vendor process. TestServer is in-process, not port 5100.

## Test-first and failure-reporting evidence

| Command | Expected failure observed | Corrected result |
| --- | --- | --- |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~TemporaryDirectoryTests --verbosity normal` | Exit 1; one test failed on unimplemented fixture constructor | Exit 0; one passed after minimal helper implementation |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~VdfParserTests --verbosity normal` | Deliberate wrong expected name: exit 1; one failed, three passed; actual `alice` | Correct assertion restored; exit 0, four passed |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~RequestGuardTests --verbosity normal` | Deny-all fixture: exit 1; 43 expected-400 assertions received 404, 12 boundary/safety cases passed | Admission implemented without body validation; exit 0, 55 passed |
| UI: `npm test -- tests/isolation.test.tsx` | Missing cleanup/default fetch rejection: exit 1; two failed, one passed | Setup hooks implemented; all three isolation tests green |
| UI: `npm test -- tests/api/client.test.ts` | Deliberate wrong URL expectation: exit 1; one failed, ten passed | Correct expectation restored; exit 0, 11 passed |

Characterization assertions otherwise describe supported existing behavior and
may pass immediately under the approved spec. No product behavior was fixed.
The deliberately wrong assertions were removed before committing.

Mutation targets include dropped/wrong VDF siblings, case-sensitive lookup,
incorrect serialized DTO identifiers/outcomes, bypassed whitespace guards,
session work before validation, wrong HTTP method/URL/body, discarded server
error text, duplicate/wrong account callback, and leaked DOM/timers/fetch state.
Expectations use hand-derived literal data and real production parsers, endpoint
mappings, exported client methods and the account-selection component.

## Implementer verification matrix

Root commands ran in the worktree root; UI commands in `src/penguinlauncher-ui`.
The final matrix ran sequentially, and frontend/backend builds never overlapped.

| Directory | Exact command | Exit | Observation |
| --- | --- | ---: | --- |
| Root | `dotnet restore PenguinLauncher.sln` | 0 | Pinned test packages restored |
| Root | `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~JsonContractTests --verbosity normal` | 0 | Four DTO cases passed |
| Root | `dotnet test PenguinLauncher.sln --verbosity normal` | 0 | 64 passed, zero failed/skipped |
| UI | `npm install --ignore-scripts` | 0 | Exact dev additions; existing lock entries preserved; whatwg-encoding deprecation notice |
| UI | `npm test -- tests/isolation.test.tsx tests/api/client.test.ts tests/components/AccountSelectorModal.test.tsx` | 0 | 19 cases passed across three files |
| UI | `npm test` | 0 | 19 passed; no unhandled errors |
| UI | `npm run typecheck` | 0 | Production and test TypeScript checked |
| UI | `npm run build` | 0 | 1,987 modules; baseline JS/CSS content retained |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | Both projects built; zero warnings/errors |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | 2 | Baseline 233 WHITESPACE; Program 138, LaunchManager 95; zero test-file diagnostics |
| UI | `npm ls --all` | 0 | No invalid required dependencies/peers |
| UI | `npm audit --json` | 1 | Nine affected package entries: six high, three moderate; see below |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | No known vulnerable NuGet packages reported in either project |
| Root | `git diff --check` | 0 | No added whitespace errors |
| UI | `npm run test:watch` | 0 after `q` | 19 passed, waited, then quit; process snapshot found zero TCP listeners |

Task 1 additionally built and tested its final library configuration in Release:
`dotnet build tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --configuration Release --verbosity minimal`
exited 0 with zero warnings/errors; `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --configuration Release --no-build --no-restore --verbosity normal`
exited 0 with nine passing tests before API tests were added.

Normal-verbosity test output was sometimes tail/diagnostic-filtered for readable
tool output; commands still ran in full and retained native exit codes.
Formatter exit was captured immediately with `$LASTEXITCODE`; PowerShell's
default outer failure code must not be mistaken for the native formatter result.

## Unexpected findings and limitations

- Test SDK import order overwrote `OutputType=Library`. Systematic debugging
  traced its targets; explicit SDK imports and a post-target Library override
  preserve the approved test-project contract. No application settings changed.
- An ambiguous middleware overload was resolved with explicit `HttpContext` /
  `RequestDelegate` parameter types. This compile failure was not counted as TDD red.
- Vite produced index.html line-ending drift under existing Git defaults. It
  was normalized back with apply_patch; no generated content change was retained.
- Hard-coded AppData storage remains untestable as general isolated persistence.
  Guard tests use an uninitialized storage sentinel whose null lock fails before
  I/O. Reviewer verified current ordering. Replace this fixture before storage
  changes; do not use it for successful storage or launch workflows.
- DTO tests configure HTTP-equivalent JSON options explicitly; they do not prove
  Photino/Program startup wiring. Desktop/package E2E remains unimplemented and
  belongs to controlled release smoke testing, not real user sessions.

## Dependency advisory evidence

The original seven affected npm package entries remain. Added Vitest 3.2.6 and
@vitest/mocker 3.2.6 account for two new moderate entries sharing
[GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9).
The maintained fix requires Vitest 4.1.11+, incompatible with the current Vite 5
constraint. No forced dependency upgrade or local upstream patch was applied.

The advisory's unauthenticated file-read path requires a reachable server with
the public mocker/interceptor plugin. These configurations use jsdom, api:false,
no browser mode and no public plugin; installed source gates listening on an API
port. A watch-mode snapshot found zero test-process TCP listeners. This supports
limited applicability to the supplied commands, not a blanket security guarantee.
The vulnerable packages remain installed and toolchain remediation is pending.
Do not expose test API/browser/mocker servers before that remediation.

## Independent review gates

- Task 1: `/root/review_backend_core`, `b56a7d5..4ba808b`; spec compliant and
  quality Approved; no findings. Reviewed safe cleanup, real assertions, pins
  and library import ordering. Historical red/probe evidence came from command
  reports and milestone messages, not final diff alone.
- Task 2: `/root/review_api_guards`, `4ba808b..64360c5`; spec compliant and
  quality Approved; no findings. Checked actual storage/launch call ordering,
  nullable HTTP binding, explicit DI, body-independent admission and disposal.
- Task 3: `/root/review_frontend`, `64360c5..06f1ca0`; spec compliant and quality
  Approved. No Critical/Important findings for configured workflows. Independently
  checked advisory server prerequisites, unchanged production config/imports and
  typecheck boundaries. Deferred minors: latent Vitest/mocker advisory and
  whatwg-encoding deprecation, both routed to tooling remediation.
- Whole-branch regression review: `/root/review_test_whole_branch`,
  `3c1f2c3..1a5270b`; no Critical/Important findings, no runtime regression
  identified. Independently verified the empty production diff and all unchanged
  lock entries. Both dependency minors remain nonblocking for configured tests.

## Fresh controller verification

Initial rerun at `06f1ca0`: `dotnet test PenguinLauncher.sln --verbosity minimal`
exited 0, 64 passed; UI `npm test` exited 0, 19 passed; UI `npm run typecheck`
exited 0. Backend command yielded while UI checks began; this was an initial
check, not the final serial matrix. A complete fresh matrix follows final review.
Scoped baseline runtime/config/assets diff returned exit 0 (empty); tracked
worktree was clean before this report was authored.

Final serial matrix after whole-branch review: backend 64/64, frontend 19/19,
typecheck and both builds exited 0; Release build had zero warnings/errors.
Dependency tree check exited 0; NuGet vulnerability check reported none.
Formatter native exit 2: original 233 WHITESPACE, no test-file diagnostics.
npm audit native exit 1: nine package entries (six high, three moderate), including
the two new entries already documented. Initial diff-check exit 1 from known
build-generated HTML carriage returns became exit 0 after scoped normalization;
runtime/config/assets diff against source baseline is empty. No runtime behavior
was changed to obtain these results.

Exact final command wrappers and output are preserved in
`test-infrastructure/final-verification.md`; historical implementer snapshots,
including per-test mutation targets and red/green diagnostics, are in
`test-infrastructure/task-1.md`, `task-2.md`, and `task-3.md`. Their pending-review
wording is historical; the verdicts in this top-level report are current.

## Acceptance checklist

1. Backend and frontend nonzero discovery: verified, 64 and 19 cases.
2. Deliberate failing assertions: both runners returned exit 1, then restored green.
3. Supported behavior characterization/no runtime changes: source/diff reviewed.
4. Credential/process isolation: reviewed actual call paths, fixture registrations,
   rejection and cleanup; persistence sentinel replacement requirement retained.
5. Focused/full tests, typecheck/builds: exact runs recorded, final serial rerun fresh.
6. Independent task/whole-branch review: all gates reviewed, no blocking findings;
   two minor dependency items retained for tooling remediation.

No integration, merge, push, or release occurred. The working branch remains
isolated for subsequent roadmap projects; all later roadmap items remain pending.
