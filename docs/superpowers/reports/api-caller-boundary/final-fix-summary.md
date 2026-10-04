# Consolidated API caller boundary final fix report

Status: DONE_WITH_CONCERNS. Worktree: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Pre-wave base: `33a7ae71995de6bdbbfe55601e85718921821e64`.
The one consolidated final-review dispatch is implemented; independent review remains the controller's next gate. No merge, push, release, acceptance/ledger/roadmap/plan update, Main/native window, real scanners/vendor sessions/AppData or network listeners occurred.

## Diagnosis and implementation

1. Development CORS: the boundary wrote Allow-Origin and Vary before downstream code. A normal handler could replace Vary, and the actual exception middleware in Program order cleared early headers when handling a throw. Two intended runtime failures were recorded before production changes: successful response lost Vary Origin; handled 500 lost Allow-Origin. The foreign-origin rejection test passed. The fix registers a response-start callback that captures only the already validated immutable policy origin, emits the exact configured origin, and appends Origin without removing downstream Vary. Existing response-start no-store remains. The fixture includes actual UseExceptionHandler downstream of the boundary, a synthetic throwing route, and a Vary Accept-Encoding value in normal/error responses. Requests use mixed-case localhost Origin to verify the emitted canonical policy value. Existing authentication, preflight, foreign-origin/no-CORS and proxy tests pass. Synthetic exception-message behavior is intentionally retained; general redaction stays project 2b.

2. Headless disposal: StartAsync plus WaitForShutdownAsync stopped the host but omitted the disposal formerly owned by Run. Three intended regressions recorded 0 disposals where 1 was required after normal shutdown, cancellation, and startup failure. Tests resolve an async-disposable singleton registered by a DI factory and assert before finally cleanup; no caller await-using can mask missing ownership. RunServerAsync now awaits app.DisposeAsync in finally. Readiness ordering, waiting until shutdown, cancellation and original startup errors are preserved. Existing tests capture IHostApplicationLifetime before helper disposal and use DisposeAsync cleanup instead of calling StopAsync after disposal. Desktop startup and lifecycle scope are unchanged.

3. Reload-test reliability: tests-only characterization, not a production behavior fix; no intended RED is claimed. The 150 ms delay was replaced with the public active Kestrel loader configuration token and a specifically registered callback. Host configuration Reload synchronously changes its captured token, while the active loader token remains unchanged, its callback is uninvoked, and hostile endpoint keys are absent from that loader. This proves the hostile root cannot signal that active loader, avoiding an asynchronous waiting assumption. Recording transport assertions retain exactly IPv4/IPv6 loopback port 5100 before/after hostile changes and listener disposal. All 3 command-line/environment-config/Kestrel-config cases pass. No reflection, global subscriber-count assumption, sleep, socket or production test seam was added.

## Focused commits and files

| Commit | Scope |
| --- | --- |
| `a21dcc1` | CORS response-start fix; LocalApiBoundary.cs, ApiBoundaryFixture.cs, LocalApiBoundaryTests.cs, CORS RED/GREEN evidence |
| `000f0b0` | RunServerAsync ownership; LocalApiHost.cs, disposal changes in LocalApiHostTests.cs, disposal RED/GREEN evidence |
| `a7a8c1b` | Reload characterization in LocalApiHostTests.cs and reload evidence |
| final docs-only evidence commit | Full matrix outputs, generated-HTML drift report, this durable summary; removes extra EOF blanks from two CORS evidence files |

All source changes are confined to the two Hosting helpers, two host/boundary test files, and synthetic boundary fixture. The controller's whole-branch-review.md and report/acceptance edits were left unstaged.

## RED/GREEN and characterization evidence

All focused commands ran at worktree Root; exact commands and complete native output are in the linked evidence.

- [CORS intended RED](final-fix-cors-red.md): native 1,2 intended runtime failures / 1 rejection pass; build succeeded.
- [CORS focused GREEN](final-fix-cors-green.md): native 0,117 boundary/proxy tests pass.
- [Disposal intended RED](final-fix-disposal-red.md): native 1,3 disposal assertion failures; build succeeded.
- [Disposal focused GREEN and intermediate diagnosis](final-fix-disposal-green.md): native 0,25 host tests pass. An intermediate run passed 23 and failed 2 older tests with ObjectDisposedException when accessing app.Lifetime after newly owned disposal; capture-before-run fixes those assertions, without changing their expected lifetime signals.
- [Reload characterization and setup failure](final-fix-reload.md): native 0,3 cases pass. Initial CS1061 arose because ConfigurationManager implements GetReloadToken explicitly; using IConfiguration corrected setup. This compiler failure is not labeled behavioral RED.

Commands appended PowerShell capture of `$LASTEXITCODE`, printed `Native exit code: <value>`, and exited with that value. Every full output is retained, rather than inferred from pipeline status.

## Full serial ten-command matrix

Root means `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`; UI means that root plus `/src/penguinlauncher-ui`.
The complete matrix ran once after all source changes, serially including generated builds.

| Cwd | Exact native command | Native exit | Count/result | Output |
| --- | --- | --- | --- | --- |
| `Root` | `dotnet test PenguinLauncher.sln --verbosity minimal` | 0 | 355 passed; +6 over 349 pre-wave | [full output](final-fix-matrix-backend-tests.md) |
| `src/penguinlauncher-ui` | `npm test` | 0 | 90 passed / 5 files | [full output](final-fix-matrix-ui-tests.md) |
| `src/penguinlauncher-ui` | `npm run typecheck` | 0 | production and test TypeScript checks pass | [full output](final-fix-matrix-ui-typecheck.md) |
| `src/penguinlauncher-ui` | `npm run build` | 0 | 1989 modules; existing asset hashes retained | [full output](final-fix-matrix-ui-build.md) |
| `Root` | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | 0 warnings / 0 errors | [full output](final-fix-matrix-release-build.md) |
| `Root` | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | 2 | 165 WHITESPACE: Program 70 / LaunchManager 95; no changed-source diagnostics | [full output](final-fix-matrix-format.md) |
| `src/penguinlauncher-ui` | `npm ls --all` | 0 | dependency tree complete; optional packages listed as optional | [full output](final-fix-matrix-npm-inventory.md) |
| `src/penguinlauncher-ui` | `npm audit --json` | 1 | 9 affected package entries: 3 moderate / 6 high | [full output](final-fix-matrix-npm-audit.md) |
| `Root` | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | both projects: no vulnerable packages reported | [full output](final-fix-matrix-dotnet-audit.md) |
| `Root` | `git diff --check` | 2 | generated HTML newline drift; repaired, repeat 0 | [full output](final-fix-matrix-diff-check.md) |

The formatter's 165 existing diagnostics match the pre-wave residual: 70 Program.cs and 95 LaunchManagerService.cs; zero findings elsewhere. npm's 9 affected entries are @vitest/mocker, braces, chokidar, esbuild, fast-glob, micromatch, tailwindcss, vite and vitest; no dependency files changed. Relative to API-boundary work these entries are unchanged; the two test-infrastructure Vitest/mocker entries were added earlier in the branch and are not described as pre-branch debt. Inventory lists unmet optional dependencies without a native failure. NuGet's absence of reported vulnerable packages is limited to current sources.

The initial matrix diff-check native 2 was generated HTML line-ending drift. Read-only comparison proved identical HTML content ignoring CR/LF, with no bundle content diff. Exact committed HTML was restored using apply_patch, then [repeat diff-check](final-fix-html-drift.md) returned native 0. Final wwwroot diff is empty. No UI runtime change is requested or included. There was no reason to rerun passing builds/tests after an evidence-only or exact-content newline repair.

## Self-review and process observations

Reviewed the complete source/fixture/test diff and the separated staged commit hunks. Policy validation still precedes CORS registration; foreign origins return403 before handlers and receive no CORS. Exact allowed origin is emitted from immutable validated policy; no wildcard, credentials/cookies, header trust broadening or authorization bypass was introduced. CORS preserves downstream Vary and no-store on the real handled 500. Resource disposal is observed from actual host DI ownership, with no disposal before readiness/shutdown and startup errors still propagated. Reload proof concerns the exact public active-loader token, not unrelated framework/global subscriptions.

Mental mutations: removing response-start CORS fails the 500 test; replacing Vary fails the normal/error Vary assertions; allowing foreign origins invokes the throwing handler; omitting headless finally fails all 3 owned-resource assertions; retaining hostile host configuration in the active loader makes token/key assertions fail, independently of scheduling.

A staged whitespace check found extra blank EOF lines in newly authored CORS evidence. The CORS commit had already been created before that failure was acted on; the final docs-only evidence commit removes those blanks. No production change or failed test was omitted. Subsequent authored logs use the corrected EOF layout. Git's LF-to-CRLF conversion messages are configuration warnings, not new source formatter diagnostics.

## Concerns and explicitly deferred/unverified areas

Residual formatter 165 and npm advisory 9 entries remain, as authorized. Independent scoped review and controller acceptance are still pending; this report is not merge authorization.

All seven declined-to-judge review areas remain deferred/unverified:
1. Actual native webview fragment delivery, profile isolation, reload/reopen and occupied-port behavior; no GUI smoke was run under this dispatch's isolation limits.
2. General exception-response redaction and malformed non-JSON error decoding (project 2b).
3. Dynamic ports, desktop shutdown/recovery and broader lifecycle work (project 7); only the newly introduced headless disposal regression is fixed here.
4. Same-user malware, debugger/native dependency compromise and trusted-script injection, outside the approved capability threat boundary.
5. Account-ID/backup containment, transactionality, serialized vendor sessions, referential integrity, launch parsing, Steam edit/delete, ownership and metadata-refresh work (projects 3-8).
6. Full advisory remediation, reproducible packaging/release, broad formatting/hygiene/module extraction (projects 9-10); shipped assets are unchanged by this wave.
7. Successful real scanner/account mutation/launch/vendor workflows; synthetic and guard evidence cannot certify those workflows.
