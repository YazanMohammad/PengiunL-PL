# Fresh controller final verification

Date: 2026-10-04. Reviewed source head: `19c21a7b38b95fa30f6929f2c8f3857071e508ff`.
Run started 03:41:09 UTC, after independent scoped fix re-review. All ten commands
ran serially in the isolated worktree; explicit native exits were captured, not
inferred from PowerShell pipeline success. This is fresh controller execution,
not reuse of the implementer's evidence. No production edits followed this run.

Root: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
UI: Root plus `/src/penguinlauncher-ui`.

| Cwd | Exact command | Native exit | Observed result and complete output |
| --- | --- | --- | --- |
| Root | `dotnet test PenguinLauncher.sln --verbosity minimal` | 0 | 355 passed, 0 failed/skipped; [output](final-verification/backend-tests.txt) |
| UI | `npm test` | 0 | 90 passed, 5 files; [output](final-verification/ui-tests.txt) |
| UI | `npm run typecheck` | 0 | Production and test TypeScript checks; [output](final-verification/typecheck.txt) |
| UI | `npm run build` | 0 | 1,989 modules, existing JS/CSS hashes retained; [output](final-verification/ui-build.txt) |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | 0 warnings/errors; [output](final-verification/release-build.txt) |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | 2 | 165 WHITESPACE diagnostics, Program70/LaunchManager95; [output](final-verification/formatter.txt) |
| UI | `npm ls --all` | 0 | Complete tree, no invalid dependency failure; optional uninstalled packages identified as optional; [output](final-verification/npm-inventory.txt) |
| UI | `npm audit --json` | 1 | 9 affected package entries, 6 high/3 moderate; [output](final-verification/npm-audit.txt) |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | Neither project has vulnerable packages reported by current sources; [output](final-verification/dotnet-audit.txt) |
| Root | `git diff --check` | 2 initially, 0 after exact-content HTML repair | [Initial output](final-verification/diff-check.txt), [repeat output](final-verification/diff-check-after-html.txt) |

## Failures, coverage and interpretation

Formatter diagnostics are the same 165 remaining before this fix wave, confined
to Program.cs70 and LaunchManagerService.cs95. Original pre-branch diagnostics
were233; focused changed-block formatting earlier reduced that count. They are
not claimed resolved and no broad formatting pass belongs to this project.
Every fresh diagnostic was parsed/read; parsed165 matches raw165 messages.

Npm's nine affected entries remain unchanged during API-boundary work. Seven
belong to the original repository; two Vitest/mocker entries were introduced by
the prior test-infrastructure project on this branch. They are NOT all pre-branch
debt. Test API/browser/public mocker serving is disabled, not a substitute for
remediation. No forced dependency upgrade was performed. A NuGet audit result
is limited to the configured source's current advisory knowledge.

Vite again produced mixed-CR/LF generated HTML. Read-only comparison confirmed
the current and committed HTML are identical after excluding CR/LF, and JS/CSS
have no content diff. The initial diff-check failure is retained. The controller
restored only this generated HTML using apply_patch and repeated diff-check,
native0; `git diff --stat -- src/PenguinLauncher/wwwroot` is empty. A combined
delete/add same-path patch was rejected before execution; separate apply_patch
operations restored the exact Git content. No behavior change or new source fix
was made. Full tests/builds therefore refer to the same production content.

Additional `git diff 3c1f2c3..HEAD --check` returned native0 after the repair.
Acceptance/evidence documentation gets a final staged/committed diff check.
Archived outputs are UTF-8 readable captures; line-end/trailing capture whitespace
is normalized, with every diagnostic/message retained. PowerShell NativeCommandError
wrappers around stderr are retained and are not additional native failures.

No standalone ESLint or browser end-to-end suite is configured. Formatter and
the actual backend/frontend suites above are the applicable configured checks.
TestServer/recording Kestrel transports and jsdom test synthetic behavior; no real
listener, Program.Main, vendor workflow, AppData, or native webview was invoked.
The [native smoke gap](task-5-native-smoke.md) remains explicit. No all-checks-pass,
native-runtime-verified, fully-secure or complete-roadmap claim is supported.
