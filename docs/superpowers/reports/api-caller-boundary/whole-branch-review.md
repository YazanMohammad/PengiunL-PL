# Whole-branch regression review

Reviewed range: `3c1f2c32d9156ac4669771afb36d9e607617def4..33a7ae71995de6bdbbfe55601e85718921821e64`.
Review package: `review-3c1f2c3..33a7ae7.diff` (22 commits).
Review date: 2026-10-04. This is a code-review verdict, not authorization to merge.

## Scope and evidence

Read the supplied contextual package, both approved designs/plans, execution report,
roadmap and SDD ledger. Read all changed production, test and tooling code, with
focused inspection of generated assets and recorded test/dependency evidence.
Checked surrounding endpoint maps, storage sentinel assumptions, client consumers,
host integration and production configuration. Prior task verdicts were context,
not substitutes for this review.

No production files, index, HEAD or branch state were changed. No suite/matrix was
rerun and no Main, native window, vendor service, actual AppData or socket listener
was invoked. The sole authored artifact is this controller-requested report.
Read-only asset/dependency diagnostics confirmed that all 228 pre-existing non-root
lockfile entries are unchanged and all 96 additions are development dependencies.
The current bundle contains session initialization before rendering, forced bearer
headers/redirect rejection, generation checks and `allowDevelopmentEntry:!1`.
No configured-token names or synthetic credential literals were embedded. The CSS
change is the generated `.transition` utility. HTML references the current hashes.

Recorded Task 5 evidence has 349 backend tests and 90 UI tests passing, both
TypeScript checks and builds passing, and zero Release warnings/errors
(`docs/superpowers/reports/api-caller-boundary/task-5-verification.md:59`, `:81`,
`:114`, `:159`, `:1607`). These are inspected historical results, not a fresh final
matrix from this review. The controller's final matrix remains required after fixes.

## Strengths

- Capability parsing is small and strict: canonical 32-byte tokens, immutable
  policy, random desktop credentials, exact authority/origin parsing, and
  `CryptographicOperations.FixedTimeEquals` (`Hosting/ApiSessionPolicy.cs:20`,
  `:49`, `:76`, relative to `src/PenguinLauncher`). It does not introduce a token
  discovery endpoint, configurable desktop token or anonymous escape hatch.
- The shared middleware authenticates API segments case-insensitively before
  model binding/handlers; preflight is narrowly scoped, static authorities are
  checked, dotted unknown API paths retain JSON 404, and no-store is applied when
  headers start (`Hosting/LocalApiBoundary.cs:5`, `Program.cs:103`, `:156`).
- The client obtains credentials per request, forces Authorization and redirect
  protection, and rejects stale fetch/body completions. Invalid fresh fragments
  cannot fall back to a stored credential, and fragment-scrubbing failure prevents
  connection (`src/penguinlauncher-ui/src/api/session.ts:43`, `api/client.ts:6`).
  The React gate prevents data effects before bootstrap and unmounts them on 401
  (`components/ApiSessionGate.tsx:10`, `src/main.tsx:8`).
- Readiness and calling-thread preservation are explicit; hostile host
  configuration is exercised through real Kestrel configuration with non-network
  transports. Main reads credentials from process environment, retains scan-only
  precedence, gates developer tools and suppresses credential-bearing diagnostics
  (`Hosting/LocalApiHost.cs:12`, `:23`, `Program.cs:84`, `:100`, `:201`, `:210`).
- Test infrastructure uses real parsers, DTOs, endpoint guards and React/client
  behavior while keeping side effects isolated. The storage sentinel is accurately
  limited to guards, with null-lock failure before I/O confirmed by current storage
  source (`tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs:46`,
  `src/PenguinLauncher/Services/Storage/JsonStorageService.cs:26`). Strict red/green
  evidence distinguishes intended failures, characterization, compiler errors and
  later passing probes. Native-runtime limitations are not presented as jsdom proof.

## Issues

### Critical (Must Fix)

None found.

### Important (Should Fix)

1. **Development CORS headers are lost when the global handler handles an exception.**
   - Evidence: `src/PenguinLauncher/Hosting/LocalApiBoundary.cs:45` and `:46` set
     Access-Control-Allow-Origin/Vary immediately, then `:91` runs downstream code.
     `src/PenguinLauncher/Program.cs:108` installs UseExceptionHandler downstream.
     The matching ASP.NET Core 10.0.12 implementation calls `ClearHttpContext`,
     which invokes `context.Response.Clear()`, before its exception handler writes
     the response ([framework source](https://github.com/dotnet/aspnetcore/blob/v10.0.12/src/Middleware/Diagnostics/src/ExceptionHandler/ExceptionHandlerMiddlewareImpl.cs#L149)).
   - This is a source-confirmed integration inference, not a runtime reproduction
     claimed by this reviewer: an authenticated request from the configured
     development origin whose binding/service/serialization failure reaches that
     global handler loses both CORS headers. A direct cross-origin browser client
     sees a fetch/CORS failure instead of the error response. The same-origin Vite
     proxy may hide this symptom, but the explicitly supported development-origin
     response contract still fails. This is separate from the pre-existing raw
     exception-message leakage assigned to project 2b.
   - The current fixture does not include the production exception-handler
     composition; `/api/synthetic-error` returns a 400 directly
     (`tests/PenguinLauncher.Tests/Fixtures/ApiBoundaryFixture.cs:53`). Thus its
     successful error/cache assertions cannot establish this interaction.
   - Fix: preserve/reapply the narrowly approved CORS headers at response-start
     time (including Vary without losing existing values), as already done for
     no-store. Add a regression first using the shared boundary, production-order
     exception handler and a synthetic throwing handler; assert 500, exact allowed
     origin, Vary and no-store, and retain rejection/no-CORS cases for foreign
     origins. Do not introduce general error redaction into this bounded fix.

### Minor (Nice to Have)

1. **The deferred reload test's 150 ms delay is not a processing barrier.**
   - Evidence: `tests/PenguinLauncher.Tests/Hosting/LocalApiHostTests.cs:245`.
     A broken asynchronous reload subscription can react after the assertion on a
     busy runner, producing a false pass. Longer sleeps would not prove absence.
   - Current production code explicitly replaces the loader and disables reload
     (`src/PenguinLauncher/Hosting/LocalApiHost.cs:18`), and initial hostile binding
     assertions exercise actual Kestrel composition. This is a regression-test
     reliability weakness, not evidence of a present external binding bypass.
   - Strengthen with an observable change-token/subscription assertion or a
     deterministic processing barrier alongside transport endpoint assertions.
     This explicitly retains and triages the Task 5 deferred minor; it is not lost.

2. **The headless path no longer disposes the host that the previous Run call owned.**
   - Evidence: `src/PenguinLauncher/Hosting/LocalApiHost.cs:32` only starts and waits
     for shutdown; `src/PenguinLauncher/Program.cs:81` has no owning disposal scope,
     and `:180` returns after that helper. Previously `app.Run()` reached the host
     RunAsync `finally` disposal ([framework source](https://github.com/dotnet/runtime/blob/v10.0.0/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs#L57)).
   - Stopping is not disposing. Host/service-provider/configuration resources are
     now left to process termination on this path, including startup failure. The
     host tests wrap apps in `await using` (`LocalApiHostTests.cs:120`), so their
     cleanup does not establish production ownership.
   - This is a small newly introduced ownership regression, not merely the
     pre-existing desktop lifecycle backlog. Severity is minor because current
     Main returns and the process exits; no demonstrated persistent listener or
     vendor data loss results. Restore explicit owner disposal for the headless
     path, or carry this specifically into project 7 with the controller's ruling.

## Requirements and deferred-item reconciliation

- Credential/bootstrap, headless/development configuration, listener authority,
  auth/preflight/fallback/cache, client generation handling and React gating are
  implemented consistently with the designs, except Important issue 1's handled
  error CORS visibility. Authenticated route bodies and successful decoding were
  not rewritten; the 43 real guard cases preserve existing validation responses.
- Native startup callback readiness/STA/dev-tools behavior has managed evidence.
  Actual Photino fragment delivery, storage/reload, close/reopen and occupied-port
  smoke remain unavailable, exactly as recorded in
  `docs/superpowers/reports/api-caller-boundary/task-5-native-smoke.md:18`.
  The plan permits an explicit unavailable report under these isolation limits;
  it does not permit a native delivery success claim.
- The ledger's Vite client type-reference ruling is justified by Main's
  `import.meta.env.DEV`; it adds only types, with a corresponding test reference.
  No runtime dependency or unrelated ambient implementation was introduced.
- Deferred formatting/line-ending work remains roadmap 10a/9b. Current recorded
  formatter debt is 165, not the original 233. No broad formatter rewrite occurred.
- Deferred npm advisory work remains roadmap 9a. Relative to original baseline,
  test infrastructure added two Vitest/mocker moderate entries to seven existing
  affected package entries; those two are not falsely classified as pre-existing
  before this branch. Relative to API-boundary work all nine are unchanged. The
  supplied test configuration keeps API/browser/public mocker serving disabled.
  Remediation is still required before exposing those facilities; no blanket
  dependency-security approval is given.

## Recommendations

1. Resolve Important issue 1 with a recorded failing regression, bounded fix and
   independent scoped review before accepting project 2a.
2. Have the controller explicitly rule on both minors. The reload observation can
   be strengthened in the same test-focused wave; headless owner disposal is a
   narrow choice and should not trigger an unreviewed general lifecycle rewrite.
3. Run the final full matrix after any fixes; update the durable report/roadmap
   with actual counts, residual formatter/advisory failures and native gap.
   Preserve this branch/worktree for the remaining approved roadmap.

## Declined to judge

- Full native webview delivery/profile isolation/reload/reopen/occupied-port behavior:
  safely unavailable under the plan's conditional smoke requirement; managed/jsdom
  evidence cannot certify it.
- General exception-response redaction and malformed non-JSON error decoding:
  existing behavior, deliberately preserved for project 2b; the new CORS interaction
  above is assessed rather than deferred with it.
- Dynamic ports, desktop shutdown/recovery and broad lifecycle redesign:
  project 7; the new headless disposal regression is separately recorded above.
- Same-user malware, debugger/native dependency compromise and trusted-script
  injection: explicitly outside the bearer capability threat boundary; no claim
  that sessionStorage or loopback authenticates against those actors.
- Account-ID/backup containment, transactionality, serialized vendor session
  operations, referential integrity, command launch parsing, Steam edit/delete
  semantics, ownership and metadata refresh repairs: unchanged implementations
  assigned to roadmap projects 3-8, not claimed delivered by this branch.
- Full toolchain advisory remediation, reproducible packaging/release and broad
  formatting/hygiene/module extraction: roadmap 9-10. Added test dependency risk,
  changed lock entries and shipped authentication assets were assessed here.
- Successful real scanner/account mutation/launch workflows: deliberately excluded
  from these fixtures until safe owning seams exist; guard tests and unchanged
  business source do not certify those vendor workflows.

## Assessment

**Ready to merge? With fixes.**

**Reasoning:** The authentication design is implemented coherently, scope is
controlled, and meaningful isolated tests support most contracts. The new global
exception-handler/CORS interaction leaves a required development response path
uncovered and incorrect; fix it, rule on the minors, and complete the controller's
fresh final matrix. Native delivery remains explicitly unverified, and this
verdict neither approves merging now nor declares the broader roadmap complete.
