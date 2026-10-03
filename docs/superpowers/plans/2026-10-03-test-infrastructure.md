# Test Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish meaningful, isolated backend and frontend characterization tests before remediation of audited defects.

**Architecture:** Add an xUnit project referencing the existing backend and an independently configured Vitest suite outside production UI sources. Exercise existing endpoint mapping functions in TestServer, not the Photino entry point. Production behavior and interfaces remain unchanged.

**Tech Stack:** .NET 10, xUnit 2, ASP.NET Core TestServer, React 18, Vite 5, Vitest 3, React Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-10-03-test-infrastructure-design.md` (approved 2026-10-03).

## Global Constraints

- Preserve current runtime behavior and public JSON interfaces during this improvement.
- Do not upgrade existing React, Vite, Tailwind, Photino, or YamlDotNet packages as part of this project.
- Do not operate on installed launchers or actual user credentials in automated tests.
- All work takes place on `improvement/production-hardening` in the isolated `.worktrees/production-hardening` checkout.
- No test may contact localhost:5100, vendor services, or an installed launcher.
- Keep tests outside production imports.
- Run build operations sequentially when the frontend writes backend `wwwroot`.
- Do not interpret zero discovered tests as a passing suite.
- Characterization tests may pass immediately; document the meaningful production mutation each catches. Any behavioral fix instead requires a failing regression first and its own approved task.
- Read `superpowers:test-driven-development` and its `writing-good-tests.md` reference before writing tests. Use `superpowers:systematic-debugging` for unexpected failures; never fix unrelated product defects here.

## Review Focus

1. Whitespace-only identifiers must receive 400 without entering storage/session/launch workflows (task 2).
2. Nested VDF siblings and case-insensitive lookup must preserve each distinct value, not just the first parsed item (task 1).
3. Structured HTTP errors must surface the server's error text for each supported JSON error field (task 3).
4. Selecting the second/inactive account must deliver that account exactly once, despite nested clickable elements (task 3).
5. Fixture reuse must not leak DOM, fetch replacements, or a runnable real launcher/storage service into the next test (tasks 2 and 3).

## File Map and Boundaries

| File | Responsibility |
| --- | --- |
| `tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj` | Pinned test dependencies, net10 target and production reference |
| `tests/PenguinLauncher.Tests/Helpers/VdfParserTests.cs` | Supported parsing, case-insensitive lookup and value-preserving round trips |
| `tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectory.cs` | Unique synthetic-file root and containment-checked cleanup |
| `tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectoryTests.cs` | Owned-root cleanup preserves independent fixture roots |
| `tests/PenguinLauncher.Tests/Models/JsonContractTests.cs` | Public DTO serialization contract with HTTP-equivalent options |
| `tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs` | In-process guard-only API host and lifetime |
| `tests/PenguinLauncher.Tests/Fixtures/RejectingAccountSwapper.cs` | Existing interface double that records/rejects every operation |
| `tests/PenguinLauncher.Tests/Endpoints/RequestGuardTests.cs` | Invalid requests produce 400 and no session operation |
| `src/penguinlauncher-ui/vitest.config.ts` | Separate jsdom test discovery; no production output/proxy inheritance |
| `src/penguinlauncher-ui/tsconfig.test.json` | Typechecking tests and test config without changing production include |
| `src/penguinlauncher-ui/tests/setup.ts` | DOM cleanup, rejecting default fetch and restoration |
| `src/penguinlauncher-ui/tests/api/client.test.ts` | Public client HTTP contracts with synthetic Responses |
| `src/penguinlauncher-ui/tests/components/AccountSelectorModal.test.tsx` | Real component rendering, selection and cancellation |
| `docs/superpowers/reports/2026-10-03-test-infrastructure.md` | Exact execution/review evidence and residual limitations |

Other modified files: `PenguinLauncher.sln` (test discovery), UI `package.json` and `package-lock.json` (test-only dependencies/scripts), roadmap tracking. No runtime C#/TS/TSX file is to be edited. No general filesystem/process abstraction is introduced.

## Pinned Dependencies

Backend: `Microsoft.NET.Test.Sdk` **17.14.1**, `xunit` **2.9.3**, `xunit.runner.visualstudio` **3.1.5**, `Microsoft.AspNetCore.TestHost` **10.0.12**. Set runner assets private; add `Microsoft.AspNetCore.App` framework reference. Target `net10.0`, nullable and implicit usings enabled, `IsTestProject=true`, `IsPackable=false`, `OutputType=Library`; reference `../../src/PenguinLauncher/PenguinLauncher.csproj`. Do not inherit application publish settings into the test project.

Frontend dev dependencies: `vitest` **3.2.6**, `@testing-library/react` **16.3.0**, `@testing-library/dom` **10.4.1**, `@testing-library/jest-dom` **6.9.1**, `jsdom` **26.1.0**, `@types/node` **24.0.0**. Use exact versions, no force/legacy-peer-deps flags. Registry metadata verified these versions on 2026-10-03; Vitest 3.2.6 accepts Vite 5 and Node 24, and RTL accepts React 18. The [Vitest 4 migration guide](https://vitest.dev/guide/migration.html) requires Vite 6+, so installing latest Vitest would violate this spec. Existing Vite/Tailwind security remediation stays separate.

## Task 1: Backend Parser and DTO Characterization

**Files:** create test project, `Helpers/VdfParserTests.cs`, `Fixtures/TemporaryDirectory.cs`, `Fixtures/TemporaryDirectoryTests.cs`, `Models/JsonContractTests.cs`; modify solution.

**Interfaces:**
- Consumes existing `VdfParser.Parse(string) -> VdfNode`, `ParseFile(string) -> VdfNode`, `Serialize(VdfNode, int indent=0) -> string`; DTOs `Game`, `LaunchRequest`, `LaunchResult`, `ConflictInfo`, `Account`, `Platform`.
- Produces solution-discovered tests and `TemporaryDirectory : IDisposable`, `string RootPath { get; }`. Temporary file creation remains inside `RootPath`.

- [ ] Add pinned project configuration and solution registration. Use apply_patch for authored files. Restore with `dotnet restore PenguinLauncher.sln`; require exit 0.
- [ ] Write `Parse_PreservesNestedSiblingsAndIgnoresLookupCase`: literal VDF `"Users" { "101" { "AccountName" "alice" } "202" { "AccountName" "bob" } }`; assert `tree["users"]!["101"]!["accountname"]!.Value == "alice"`, second user equals `"bob"`, and missing key is null. Add a simple top-level key/value case.
- [ ] Write `Serialize_ParseRoundTrip_PreservesSupportedValues`: serialize the above supported tree and reparse; assert the two literal names independently. Do not require byte-for-byte formatting or unsupported escaping/malformed-input behavior.
- [ ] Write `TemporaryDirectoryTests.Dispose_RemovesOnlyItsOwnedRoot` first: allocate two independent roots, write a synthetic file into each, dispose the first and assert its removal while the second file still exists. Add only a compilable helper shell whose constructor throws `NotImplementedException`, run the test and record that expected failure; implement `TemporaryDirectory` with unique roots under `Path.GetTempPath()/PenguinLauncher.Tests/<guid>` and containment-checked cleanup. Reject the parent itself and any reparse points in the owned tree before recursive deletion; never follow a linked directory to enumerate descendants. Run the test green. Keep cleanup test-only.
- [ ] Write `ParseFile_ReadsOnlySyntheticFixture`: create a UTF-8 VDF with value `"fixture-user"` inside the owned fixture root; assert that value after real `ParseFile`.
- [ ] Write DTO tests with `JsonSerializerOptions(JsonSerializerDefaults.Web)` plus `JsonStringEnumConverter`. Assert parsed JSON literals: Game `platform="Steam"`, `associatedAccountIds=["account-a"]`, `platformGameId="42"`, `isInstalled=true`; LaunchRequest `{gameId:"game-a", accountId:"account-a"}`; LaunchResult `{success:true,message:"synthetic launch",accountSwapped:false}`. Deserialize a literal camel-case launch request and assert identifiers. Label these DTO contract tests, not proof of `Program.Main` wiring.
- [ ] Temporarily change one assertion to an incorrect literal, run `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~VdfParserTests --verbosity normal`, record nonzero exit and assertion failure, then restore the correct assertion. This is runner validation, not a production bug regression.
- [ ] Run parser and DTO focused filters, then `dotnet test PenguinLauncher.sln --verbosity normal`. Require nonzero discovered tests and zero failures. Record each test's mutation target (wrong sibling, case comparer, dropped serialization field, etc.).
- [ ] Verify `git diff --check` and no runtime-source changes, then commit only project/solution/tests as `test: characterize backend parser and JSON contracts`.
- [ ] Fresh independent reviewer checks real code exercised, literal expectations, safe cleanup and pinned dependencies. Fix and re-review important findings before task 2.

## Task 2: Isolated Request Guard Integration Tests

**Files:** create `Fixtures/GuardApiFixture.cs`, `Fixtures/RejectingAccountSwapper.cs`, `Endpoints/RequestGuardTests.cs`.

**Interfaces:**
- Consumes task 1 test project; existing `MapAccountEndpoints(WebApplication)` and `MapLaunchEndpoints(WebApplication)`; `IAccountSwapper` signatures unchanged.
- Produces `GuardApiFixture : IAsyncDisposable`, `static Task<GuardApiFixture> CreateAsync()`, `HttpClient Client { get; }`, `RejectingAccountSwapper Swapper { get; }`, `JsonStorageService GuardStorage { get; }`; fake exposes `int OperationCalls { get; }`, with every interface operation incrementing and throwing. No shared production interface changes.

- [ ] Build `WebApplication` with `UseTestServer()`, explicit safe registrations, and the existing HTTP string-enum setting. Map actual account/launch endpoint functions. Start asynchronously, obtain TestServer client and dispose client/host asynchronously. Never call `Program.Main` or register platform implementations.
- [ ] Use real `AccountSwapperService` with only `RejectingAccountSwapper` and null logger. Register a **guard-only** `JsonStorageService` sentinel using `RuntimeHelpers.GetUninitializedObject`: its `_lock` remains null, so any accidental `LoadAsync`/`SaveAsync` fails before the filesystem branch. Register real scanner/launch coordinators with that sentinel and empty scanner list, never platform scanners. Document this narrow workaround and its replacement by the storage project; do not use the sentinel for positive persistence/launch tests. No reflection patching of static AppData paths.
- [ ] Middleware admits POST only for `/api/accounts/map`, `/api/accounts/swap`, `/api/accounts/add`, `/api/accounts/capture`, `/api/accounts/rename`, `/api/launch/`; rejects all other requests with 404 **without validating request bodies itself**. Guard storage and rejected session operations prevent accidental positive flow execution; the real handlers must enforce body validation.
- [ ] Add a fixture-safety test that `sentinel.LoadAsync()` and `sentinel.SaveAsync()` throw before I/O, and that a non-allowlisted path is 404. If existing storage changes make this assumption invalid later, replace the sentinel before rerunning guards. Do not inspect actual AppData to prove this.
- [ ] Write theory `InvalidIdentifiers_Return400WithoutSessionOperations` with independently literal JSON and expected error field: `/api/accounts/map` missing/empty/whitespace `gameId` or `accountId`; `/api/accounts/swap` missing/empty/whitespace `accountId`; `/api/launch/` missing/empty/whitespace `gameId`. Include JSON `null` bodies for nullable requests. Assert HTTP 400, JSON `error` explaining the required field, and `OperationCalls == 0` after each request. Input middleware must not manufacture 400.
- [ ] Add invalid `/api/accounts/add` platform and empty display-name cases, `/api/accounts/capture` empty/invalid platform, and `/api/accounts/rename` missing account or empty new name. Verify no operation. Do not send valid mutation requests or route success through sentinel services.
- [ ] Run `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~RequestGuardTests --verbosity normal`; require all cases discovered, 400 rather than binding 500/404 and no fake calls. Any unexpected status enters systematic debugging; don't change product behavior to satisfy characterization tests.
- [ ] Run complete backend suite. Record mutation targets: bypassed guard produces non-400 through fail-before-I/O service or rejected session double, altered error contract fails response assertion.
- [ ] Check diff scope and commit as `test: cover account and launch request guards safely`.
- [ ] Fresh independent reviewer checks sentinel call paths, allowlist, endpoint binding, disposal and that the test cannot operate on credentials/processes. Fix and re-review important findings before task 3.

## Task 3: Frontend HTTP and Account Selection Characterization

**Files:** create frontend files from file map; modify UI manifest/lock; produce evidence report and update roadmap tracking.

**Interfaces:**
- Consumes actual exported `api` methods and `AccountSelectorModal` props `{ conflict: ConflictInfo | null, onSelect: (account: Account) => void, onCancel: () => void }` unchanged.
- Produces scripts `test="vitest run"`, `test:watch="vitest"`, `typecheck="tsc --noEmit && tsc --project tsconfig.test.json --noEmit"`. Tests explicitly import Vitest APIs.

- [ ] Add exact dev-dependency pins using apply_patch, run `npm install --ignore-scripts`, and review lockfile differences. Existing direct/transitive production and pre-existing tooling versions must remain unchanged; investigate accidental upgrades rather than accepting them silently.
- [ ] Configure `vitest.config.ts` independently with React plugin, `environment: 'jsdom'`, `include: ['tests/**/*.test.{ts,tsx}']`, `setupFiles: ['tests/setup.ts']`, `restoreMocks: true`, `unstubGlobals: true`, `api: false`, `passWithNoTests: false`. Do not merge the production config/outDir/proxy. `tsconfig.test.json` extends production config and includes `tests`, `vitest.config.ts`, with node/Vitest/jest-dom type support; production `include: ['src']` remains unchanged.
- [ ] Implement setup importing `@testing-library/jest-dom/vitest`, explicit DOM cleanup and fake timer restoration. Install a rejecting default fetch **before each test**, restore spies/globals after each test. Any unhandled/unexpected request must fail, never reach native fetch. Do not add blanket mocked API/component modules.
- [ ] Write client tests for GET `getGames()` URL `/api/games?rescan=false` and `getGames(true)` URL `/api/games?rescan=true`; successful account list JSON decoding; POST `mapGameToAccount('game-a','account-b')` relative URL `/api/accounts/map`, content type, literal serialized body; POST launch with literal `{gameId:'game-a',accountId:'account-b'}`; DELETE account URL/method. Spy fetch and return real synthetic `Response` objects, never compute expected bodies with the client under test.
- [ ] Write error theory with status 400 and literal `detail`, `error`, `message` JSON responses, asserting rejection containing corresponding server text. Add successful 204/empty-body decoding to `{}`. Do not assert preservation of known malformed-body/read-twice defects; report discovered defects for a later approved task.
- [ ] Render real `AccountSelectorModal` with complete synthetic accounts `Alice` (active) and `Bob` (inactive), game `Synthetic Game`. Assert both display names, click Bob's `Switch & Play` button and assert `onSelect` called once with Bob and `onCancel` not called. Separate test clicks account display text/card; assert selected identity once. Test `conflict=null` renders no dialog and close button invokes cancel. No keyboard accessibility fix is in scope.
- [ ] Add cleanup/isolation coverage: after unmount a fresh render contains only its new account data; default unexpected fetch rejects without network. Use deterministic DOM queries, no sleeps or snapshots of component markup.
- [ ] Deliberately use an incorrect expected URL in one client assertion; run `npm test -- tests/api/client.test.ts`, record assertion failure and nonzero exit, restore correct expectation before commit. Record the mutation caught by every final test.
- [ ] Run focused frontend suites then the complete verification matrix below sequentially. Record exact commands, exit codes, discovered counts and diagnostics in the report. Do not silently stage generated `wwwroot` changes; preserve baseline bytes/content and explain only line-ending drift if applicable.
- [ ] Commit focused UI test/config/lock changes as `test: characterize frontend requests and account selection`; commit report/tracking separately as `docs: record test infrastructure verification and review` after review evidence exists.
- [ ] Fresh independent task reviewer checks synthetic isolation, real components, HTTP assertions, state restoration, version compatibility and no runtime edits. Fix and re-review important findings.

## Complete Verification and Project Review

Run from worktree root unless directory is UI (`src/penguinlauncher-ui`). Do not add a new linter or formatter as unrelated setup.

| Directory | Command | Required observation |
| --- | --- | --- |
| Root | `dotnet test PenguinLauncher.sln --verbosity normal` | Nonzero backend tests; no failures |
| UI | `npm test` | Nonzero frontend tests; no failures/unhandled errors |
| UI | `npm run typecheck` | Exit 0, production and tests checked |
| UI | `npm run build` | Exit 0; unchanged production bundle semantics |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | Exit 0; report warnings/errors |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | Report pre-existing 233 WHITESPACE separately; no new test-file diagnostics |
| UI | `npm ls --all` | Exit 0; no invalid peers |
| UI | `npm audit --json` | Record counts/new advisories; don't call baseline seven findings fixed |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | Report actual vulnerability findings |
| Root | `git diff --check` | No added whitespace errors |

- [ ] Request a fresh whole-project/branch review for this improvement, including regressions, against source baseline `3c1f2c3` and the approved spec. Distinguish untouched audit findings from new problems; do not start the next roadmap project with important review findings unresolved.
- [ ] After any fixes, rerun impacted focused checks and the complete matrix. Apply `superpowers:verification-before-completion` before claiming this project verified.
- [ ] Acceptance coverage: tasks 1/3 establish nonzero runners and deliberate failure evidence; tasks 1/2/3 characterize real supported behavior; task 2 plus frontend setup isolate side effects; matrix and independent reviews cover remaining acceptance criteria.
- [ ] Leave later roadmap items pending. This is not a whole-roadmap completion claim; each structural project needs its own approved spec/plan and regression tests before changes.

## Handoff

Status: implementation plan confirmed by the user on 2026-10-03 and executed with **subagent-driven development**, a fresh implementer and independent reviewer for each of the three tasks. All tasks are delivered and task-reviewed; whole-branch review/final verification remain pending. Detailed execution evidence is in `docs/superpowers/reports/2026-10-03-test-infrastructure.md`.
