# Test infrastructure design

Status: written design and implementation plan approved by the user on
2026-10-03; implementation tasks delivered and independently reviewed.
Whole-branch review and final verification remain pending.

## Intent and constraints

Make the existing PenguinLauncher safer to change by establishing real backend
and frontend test suites before fixing the audited defects. Preserve current
runtime behavior and public JSON interfaces during this improvement. Subsequent
approved improvements will intentionally change insecure or incorrect behavior
and must begin with a failing regression test.

All work takes place on `improvement/production-hardening` in the isolated
`.worktrees/production-hardening` checkout. Use focused commits, a fresh
implementer for significant tasks, and independent task review with fix and
re-review cycles. Changes to production behavior require a recorded red/green
test cycle. Do not operate on installed launchers or actual user credentials in
automated tests.

## Classification

Architectural: this introduces test projects, runners, fixtures, and verification
interfaces used by later roadmap projects. It does not introduce a new runtime
subsystem or restructure existing production services.

## Approaches considered

1. Recommended: xUnit for .NET, ASP.NET Core TestServer for API integration,
   and Vitest with React Testing Library and jsdom for the UI. These supply
   assertions, isolated fixtures, asynchronous testing, and component tests with
   ordinary ecosystem tooling.
2. A dependency-free console/Node test harness reduces initial package additions
   but requires custom discovery, failure reporting, isolation, and component
   testing. That maintenance burden conflicts with the project goal.
3. Starting with full desktop/browser automation would exercise packaging but
   depends on platform GUI availability and real launcher state. Defer that to
   controlled release smoke tests after core behavior is testable.

Choose compatible, explicitly pinned test package versions during planning.
Do not upgrade existing React, Vite, Tailwind, Photino, or YamlDotNet packages
as part of this project; tool upgrades belong to their own roadmap project.

## Backend structure

Add `tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj`, targeting
`net10.0`, referencing the production project, and participating in
`PenguinLauncher.sln` test discovery. Keep test fixtures and synthetic files
inside the test project. Temporary directories must be unique per test and
removed only after verifying containment within the fixture root.

Start with characterization tests for behaviors already supported:

- VDF key/value and nested-section parsing, case-insensitive lookup, and
  round trips of simple supported values.
- Existing account and launch request validation: missing required identifiers
  produce 400 responses without invoking mutation operations.
- Existing launch/game JSON contracts, including string platform enums.

API fixtures construct a TestServer from existing endpoint mapping functions.
Register safe dependencies explicitly; do not call `Program.Main`, create a
Photino window, scan installed games, discover real accounts, or write AppData.
Do not invoke successful session mutation or launch flows until those flows
have an isolated boundary in the project that owns their remediation.

Reuse existing `IGameScanner` and `IAccountSwapper` interfaces for test doubles
where needed. Do not add a universal filesystem/process/registry abstraction
to make the harness comprehensive. Introduce each necessary production seam
in its own later design, with a regression test first.

Characterization tests may pass immediately because they document existing
behavior. They must assert observable results and must not encode an audited
defect as required behavior. For each test, record which meaningful production
change would cause it to fail. Exercise the new runner's failure reporting with
a deliberate temporary assertion failure, then remove that probe before commit.

## Frontend structure

Add a separate `vitest.config.ts` and test setup. Keep production Vite output
configuration intact. Add `test` (one-shot run), `test:watch`, and `typecheck`
scripts. Use a jsdom environment for component tests and restore fake fetch,
timers, and DOM state after every test. Use a separate test TypeScript config
if necessary so test dependencies are checked without entering the production
bundle.

Start with characterization tests for:

- `api/client.ts`: expected HTTP method, relative URL, JSON request body,
  successful JSON decoding, and existing structured error messages.
- Account selector: lists available accounts and sends the selected account
  through its public callback. The test operates on synthetic account props.

Use a controlled fetch implementation that rejects unexpected requests.
No test may contact localhost:5100, vendor services, or an installed launcher.
Keep tests outside production imports. Add a regression test for any discovered
bug before fixing it in the owning roadmap project.

## Verification and error handling

The first complete suite consists of backend tests and frontend tests. The
project verification matrix is backend tests, frontend tests, frontend
typecheck, frontend build, backend Release build, and formatter verification.
Run build operations sequentially when the frontend writes backend `wwwroot`.

Record exact commands, exit codes, test counts, and diagnostics in the task
report. Do not interpret zero discovered tests as a passing suite. New suites
must discover nonzero tests and fail their command when an assertion fails.

The audit's 233 formatter diagnostics and seven npm development-tool advisory
findings are pre-existing issues. Record them until their separate roadmap
projects resolve them; do not mix formatting or package upgrades into this
project. Unexpected failures enter systematic debugging.

## Acceptance criteria

1. Backend and frontend runners each discover and run meaningful tests.
2. The test commands detect a deliberate failing assertion, with evidence.
3. Existing supported parser, request, and UI behavior has characterization
   coverage with no production behavior changes.
4. Automated tests cannot read/write real authentication files or start/stop
   vendor processes through their fixtures.
5. Focused tests, the complete suite, typecheck, and builds have fresh results.
6. An independent reviewer verifies scope, assertions, isolation, and package
   compatibility; important findings receive fixes and scoped re-review.

## Review gate and next stage

This written design is approved; it is not an approved implementation plan.
Use `superpowers:writing-plans` to produce the task-level plan and obtain its
review before implementation. The user has selected subagent-driven development
for significant work; preserve that execution method at the plan review gate.
