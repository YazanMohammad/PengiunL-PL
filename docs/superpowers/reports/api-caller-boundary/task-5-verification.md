# Task 5 verification evidence

Date: 2026-10-04 (Asia/Amman).
Root cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
UI cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`.

Evidence whitespace (blank-line indentation/trailing spaces) is normalized for git diff checks; diagnostic and output content is retained.

Commands were run sequentially. Each native command's `$LASTEXITCODE` was captured immediately and emitted as `NATIVE_EXIT`, then returned from the command shell. No Program.Main, native window, real AppData, port probe, or socket listener was used. Host tests used real Kestrel configuration with replacement recording transports, or isolated TestServer/throwing server doubles. The native runtime gap is detailed in task-5-native-smoke.md.

RED evidence is separate in [task-5-red.md](task-5-red.md), recorded before implementation. Initial GREEN found a test-only mistake: System.Uri equality excludes its fragment; the two visibly distinct generated test fragments therefore compared equal. The test now compares fragments. No production fix was made for that test mistake. The full matrix had one test formatting diagnostic, which was corrected; final helper/fixture/test formatting check is below. Program's line endings were normalized mechanically to avoid mixed apply_patch line endings without unrelated semantic edits.

The mandatory matrix was completed in the specified serial order; supplemental formatter/backend verification follows the formatting-only corrections. `wwwroot/index.html` rebuild newline drift was restored to committed content using apply_patch. No JS/CSS change or dependency update was needed; Task 4 already shipped the authenticated bundle. Audit and formatter baseline failures remain explicit rather than an all-checks-pass claim.

## greenHost

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiHostTests --verbosity minimal`

Native exit: 0. 22 passed; no failures/skips.

Complete output:

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    22, Skipped:     0, Total:    22, Duration: 688 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT=0
```

## focused

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet test PenguinLauncher.sln --filter 'FullyQualifiedName~LocalApiHostTests|FullyQualifiedName~LocalApiBoundaryTests|FullyQualifiedName~AuthenticatedRequestGuardTests|FullyQualifiedName~RequestGuardTests|FullyQualifiedName~ApiSessionPolicyTests' --verbosity minimal`

Native exit: 0. 340 passed; no failures/skips.

Complete output:

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   340, Skipped:     0, Total:   340, Duration: 771 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT=0
```

## matrixDotnetTest

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet test PenguinLauncher.sln --verbosity minimal`

Native exit: 0. 349 passed; no failures/skips.

Complete output:

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   349, Skipped:     0, Total:   349, Duration: 745 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT=0
```

## matrixNpmTest

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`

Command: `npm test`

Native exit: 0. 90 passed in 5 files; no failures.

Complete output:

```text

> penguinlauncher-ui@1.0.0 test
> vitest run


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ✓ tests/isolation.test.tsx (3 tests) 17ms
 ✓ tests/api/session.test.ts (36 tests) 20ms
 ✓ tests/api/client.test.ts (35 tests) 26ms
 ✓ tests/components/AccountSelectorModal.test.tsx (5 tests) 119ms
 ✓ tests/components/ApiSessionGate.test.tsx (11 tests) 686ms
   ✓ RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests  416ms

 Test Files  5 passed (5)
      Tests  90 passed (90)
   Start at  01:34:46
   Duration  1.80s (transform 310ms, setup 977ms, collect 428ms, tests 869ms, environment 2.72s, prepare 452ms)

NATIVE_EXIT=0
```

## matrixTypecheck

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`

Command: `npm run typecheck`

Native exit: 0. Production and test TypeScript checks both exit 0.

Complete output:

```text

> penguinlauncher-ui@1.0.0 typecheck
> tsc --noEmit && tsc --project tsconfig.test.json --noEmit

NATIVE_EXIT=0
```

## matrixUiBuild

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`

Command: `npm run build`

Native exit: 0. 1989 modules; authenticated bundle reviewed.

Complete output:

```text

> penguinlauncher-ui@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 1989 modules transformed.
rendering chunks...
computing gzip size...
../PenguinLauncher/wwwroot/index.html                   0.73 kB │ gzip:   0.42 kB
../PenguinLauncher/wwwroot/assets/index-D9HK_ItX.css   47.10 kB │ gzip:   8.70 kB
../PenguinLauncher/wwwroot/assets/index-DNZ_BUpz.js   363.24 kB │ gzip: 108.64 kB
✓ built in 2.40s
NATIVE_EXIT=0
```

## matrixRelease

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal`

Native exit: 0. 0 warnings/errors.

Complete output:

```text
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Release\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Release\net10.0\PenguinLauncher.Tests.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.34
NATIVE_EXIT=0
```

## matrixFormat

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal`

Native exit: 2. Initial matrix: 189 WHITESPACE diagnostics (93 Program, 95 LaunchManager, 1 newly added test formatting issue). Test formatting issue and touched Program block formatting were corrected below.

Complete output:

```text
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(48,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(49,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(50,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(51,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(52,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(53,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(55,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(56,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(58,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(59,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(60,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(61,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(62,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(63,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(65,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(66,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(68,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(69,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(70,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(71,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(72,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(73,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(74,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(76,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(77,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(103,45): error WHITESPACE: Fix whitespace formatting. Replace 11 characters with '\r\n\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(106,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(107,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(108,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(109,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(110,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(111,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(112,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(113,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(114,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(115,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(116,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(117,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(118,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(119,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(121,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(122,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(123,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(124,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(125,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(126,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(127,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(129,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(130,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(131,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(132,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(133,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(134,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(136,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(137,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(138,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(139,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(140,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(141,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(142,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(143,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(144,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(145,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(147,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(148,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(149,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(150,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(151,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(152,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(153,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(155,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(155,65): error WHITESPACE: Fix whitespace formatting. Replace 13 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(156,86): error WHITESPACE: Fix whitespace formatting. Replace 9 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(157,41): error WHITESPACE: Fix whitespace formatting. Replace 9 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(163,18): error WHITESPACE: Fix whitespace formatting. Replace 13 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(164,68): error WHITESPACE: Fix whitespace formatting. Replace 13 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(166,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(167,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(168,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(169,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(170,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(171,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(172,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(173,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(174,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(175,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(184,14): error WHITESPACE: Fix whitespace formatting. Replace 13 characters with '\r\n\r\n\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(188,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(188,59): error WHITESPACE: Fix whitespace formatting. Replace 9 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(190,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(191,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(192,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(192,58): error WHITESPACE: Fix whitespace formatting. Replace 14 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(88,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(89,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(90,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(91,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(92,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(94,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(95,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(96,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(97,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(99,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(101,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(102,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(103,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(105,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(106,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(107,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(109,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(110,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(111,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(112,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(113,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(114,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(115,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(116,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(117,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(118,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(119,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(120,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(121,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(122,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(124,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(125,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(126,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(127,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(128,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(129,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(130,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(131,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(132,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(133,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(135,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(136,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(137,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(138,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(139,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(140,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(141,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(142,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(143,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(144,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(146,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(147,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(148,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(149,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(150,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(152,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(154,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(155,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(156,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(157,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(159,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(160,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(162,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(163,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(164,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(165,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(166,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(167,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(168,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(169,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(170,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(171,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(173,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(174,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(175,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(176,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(177,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(178,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(179,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(181,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(182,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(183,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(184,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(185,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(186,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(187,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(188,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(189,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(190,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(191,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(193,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(194,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(195,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(196,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(198,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(310,11): error WHITESPACE: Fix whitespace formatting. Replace 1 characters with '\r\n\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj]
NATIVE_EXIT=2
```

## matrixNpmLs

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`

Command: `npm ls --all`

Native exit: 0. Exit 0; no invalid dependencies. UNMET OPTIONAL entries are platform/optional dependencies, not invalid packages.

Complete output:

```text
penguinlauncher-ui@1.0.0 C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\penguinlauncher-ui
├─┬ @radix-ui/react-dialog@1.1.23
│ ├── @radix-ui/primitive@1.1.7
│ ├─┬ @radix-ui/react-compose-refs@1.1.5
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-context@1.2.2
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-dismissable-layer@1.1.19
│ │ ├── @radix-ui/primitive@1.1.7 deduped
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├─┬ @radix-ui/react-use-callback-ref@1.1.4
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├─┬ @radix-ui/react-use-effect-event@0.0.5
│ │ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-focus-guards@1.1.6
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-focus-scope@1.1.16
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @radix-ui/react-use-callback-ref@1.1.4 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-id@1.1.4
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-portal@1.1.17
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-presence@1.1.10
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-primitive@2.1.10
│ │ ├── @radix-ui/react-slot@1.3.3 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-slot@1.3.3
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-use-controllable-state@1.2.6
│ │ ├── @radix-ui/primitive@1.1.7 deduped
│ │ ├── @radix-ui/react-use-effect-event@0.0.5 deduped
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├─┬ @radix-ui/react-use-layout-effect@1.1.4
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├── @types/react-dom@18.3.7 deduped
│ ├── @types/react@18.3.31 deduped
│ ├─┬ aria-hidden@1.2.6
│ │ └── tslib@2.8.1
│ ├── react-dom@18.3.1 deduped
│ ├─┬ react-remove-scroll@2.7.2
│ │ ├── @types/react@18.3.31 deduped
│ │ ├─┬ react-remove-scroll-bar@2.3.8
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ ├── react-style-singleton@2.2.3 deduped
│ │ │ ├── react@18.3.1 deduped
│ │ │ └── tslib@2.8.1 deduped
│ │ ├─┬ react-style-singleton@2.2.3
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ ├── get-nonce@1.0.1
│ │ │ ├── react@18.3.1 deduped
│ │ │ └── tslib@2.8.1 deduped
│ │ ├── react@18.3.1 deduped
│ │ ├── tslib@2.8.1 deduped
│ │ ├─┬ use-callback-ref@1.3.3
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ ├── react@18.3.1 deduped
│ │ │ └── tslib@2.8.1 deduped
│ │ └─┬ use-sidecar@1.1.3
│ │   ├── @types/react@18.3.31 deduped
│ │   ├── detect-node-es@1.1.0
│ │   ├── react@18.3.1 deduped
│ │   └── tslib@2.8.1 deduped
│ └── react@18.3.1 deduped
├─┬ @radix-ui/react-dropdown-menu@2.1.24
│ ├── @radix-ui/primitive@1.1.7 deduped
│ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ ├── @radix-ui/react-context@1.2.2 deduped
│ ├── @radix-ui/react-id@1.1.4 deduped
│ ├─┬ @radix-ui/react-menu@2.1.24
│ │ ├── @radix-ui/primitive@1.1.7 deduped
│ │ ├─┬ @radix-ui/react-collection@1.1.15
│ │ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ │ ├── @radix-ui/react-context@1.2.2 deduped
│ │ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ │ ├── @radix-ui/react-slot@1.3.3 deduped
│ │ │ ├── @types/react-dom@18.3.7 deduped
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ ├── react-dom@18.3.1 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @radix-ui/react-context@1.2.2 deduped
│ │ ├── @radix-ui/react-direction@1.1.4 deduped
│ │ ├── @radix-ui/react-dismissable-layer@1.1.19 deduped
│ │ ├── @radix-ui/react-focus-guards@1.1.6 deduped
│ │ ├── @radix-ui/react-focus-scope@1.1.16 deduped
│ │ ├── @radix-ui/react-id@1.1.4 deduped
│ │ ├── @radix-ui/react-popper@1.3.7 deduped
│ │ ├── @radix-ui/react-portal@1.1.17 deduped
│ │ ├── @radix-ui/react-presence@1.1.10 deduped
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @radix-ui/react-roving-focus@1.1.19 deduped
│ │ ├── @radix-ui/react-slot@1.3.3 deduped
│ │ ├── @radix-ui/react-use-callback-ref@1.1.4 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── aria-hidden@1.2.6 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ ├── react-remove-scroll@2.7.2 deduped
│ │ └── react@18.3.1 deduped
│ ├── @radix-ui/react-primitive@2.1.10 deduped
│ ├── @radix-ui/react-use-controllable-state@1.2.6 deduped
│ ├── @types/react-dom@18.3.7 deduped
│ ├── @types/react@18.3.31 deduped
│ ├── react-dom@18.3.1 deduped
│ └── react@18.3.1 deduped
├─┬ @radix-ui/react-tabs@1.1.21
│ ├── @radix-ui/primitive@1.1.7 deduped
│ ├── @radix-ui/react-context@1.2.2 deduped
│ ├─┬ @radix-ui/react-direction@1.1.4
│ │ ├── @types/react@18.3.31 deduped
│ │ └── react@18.3.1 deduped
│ ├── @radix-ui/react-id@1.1.4 deduped
│ ├── @radix-ui/react-presence@1.1.10 deduped
│ ├── @radix-ui/react-primitive@2.1.10 deduped
│ ├─┬ @radix-ui/react-roving-focus@1.1.19
│ │ ├── @radix-ui/primitive@1.1.7 deduped
│ │ ├── @radix-ui/react-collection@1.1.15 deduped
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @radix-ui/react-context@1.2.2 deduped
│ │ ├── @radix-ui/react-direction@1.1.4 deduped
│ │ ├── @radix-ui/react-id@1.1.4 deduped
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @radix-ui/react-use-callback-ref@1.1.4 deduped
│ │ ├── @radix-ui/react-use-controllable-state@1.2.6 deduped
│ │ ├─┬ @radix-ui/react-use-is-hydrated@0.1.3
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├── @radix-ui/react-use-controllable-state@1.2.6 deduped
│ ├── @types/react-dom@18.3.7 deduped
│ ├── @types/react@18.3.31 deduped
│ ├── react-dom@18.3.1 deduped
│ └── react@18.3.1 deduped
├─┬ @radix-ui/react-tooltip@1.2.16
│ ├── @radix-ui/primitive@1.1.7 deduped
│ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ ├── @radix-ui/react-context@1.2.2 deduped
│ ├── @radix-ui/react-dismissable-layer@1.1.19 deduped
│ ├── @radix-ui/react-id@1.1.4 deduped
│ ├─┬ @radix-ui/react-popper@1.3.7
│ │ ├─┬ @floating-ui/react-dom@2.1.9
│ │ │ ├─┬ @floating-ui/dom@1.8.0
│ │ │ │ ├─┬ @floating-ui/core@1.8.0
│ │ │ │ │ └── @floating-ui/utils@0.2.12 deduped
│ │ │ │ └── @floating-ui/utils@0.2.12
│ │ │ ├── react-dom@18.3.1 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├─┬ @radix-ui/react-arrow@1.1.15
│ │ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ │ ├── @types/react-dom@18.3.7 deduped
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ ├── react-dom@18.3.1 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├── @radix-ui/react-compose-refs@1.1.5 deduped
│ │ ├── @radix-ui/react-context@1.2.2 deduped
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @radix-ui/react-use-callback-ref@1.1.4 deduped
│ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ ├─┬ @radix-ui/react-use-rect@1.1.4
│ │ │ ├── @radix-ui/rect@1.1.3 deduped
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├─┬ @radix-ui/react-use-size@1.1.4
│ │ │ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ │ │ ├── @types/react@18.3.31 deduped
│ │ │ └── react@18.3.1 deduped
│ │ ├── @radix-ui/rect@1.1.3
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├── @radix-ui/react-portal@1.1.17 deduped
│ ├── @radix-ui/react-presence@1.1.10 deduped
│ ├── @radix-ui/react-primitive@2.1.10 deduped
│ ├── @radix-ui/react-slot@1.3.3 deduped
│ ├── @radix-ui/react-use-controllable-state@1.2.6 deduped
│ ├── @radix-ui/react-use-layout-effect@1.1.4 deduped
│ ├─┬ @radix-ui/react-visually-hidden@1.2.11
│ │ ├── @radix-ui/react-primitive@2.1.10 deduped
│ │ ├── @types/react-dom@18.3.7 deduped
│ │ ├── @types/react@18.3.31 deduped
│ │ ├── react-dom@18.3.1 deduped
│ │ └── react@18.3.1 deduped
│ ├── @types/react-dom@18.3.7 deduped
│ ├── @types/react@18.3.31 deduped
│ ├── react-dom@18.3.1 deduped
│ └── react@18.3.1 deduped
├─┬ @testing-library/dom@10.4.1
│ ├─┬ @babel/code-frame@7.29.7
│ │ ├── @babel/helper-validator-identifier@7.29.7
│ │ ├── js-tokens@4.0.0
│ │ └── picocolors@1.1.1 deduped
│ ├── @babel/runtime@7.29.7
│ ├── @types/aria-query@5.0.4
│ ├─┬ aria-query@5.3.0
│ │ └── dequal@2.0.3
│ ├── dom-accessibility-api@0.5.16
│ ├── lz-string@1.5.0
│ ├── picocolors@1.1.1
│ └─┬ pretty-format@27.5.1
│   ├── ansi-regex@5.0.1
│   ├── ansi-styles@5.2.0
│   └── react-is@17.0.2
├─┬ @testing-library/jest-dom@6.9.1
│ ├── @adobe/css-tools@4.5.0
│ ├── aria-query@5.3.0 deduped
│ ├── css.escape@1.5.1
│ ├── dom-accessibility-api@0.6.3
│ ├── picocolors@1.1.1 deduped
│ └─┬ redent@3.0.0
│   ├── indent-string@4.0.0
│   └─┬ strip-indent@3.0.0
│     └── min-indent@1.0.1
├─┬ @testing-library/react@16.3.0
│ ├── @babel/runtime@7.29.7 deduped
│ ├── @testing-library/dom@10.4.1 deduped
│ ├── @types/react-dom@18.3.7 deduped
│ ├── @types/react@18.3.31 deduped
│ ├── react-dom@18.3.1 deduped
│ └── react@18.3.1 deduped
├─┬ @types/node@24.0.0
│ └── undici-types@7.8.0
├─┬ @types/react-dom@18.3.7
│ └── @types/react@18.3.31 deduped
├─┬ @types/react@18.3.31
│ ├── @types/prop-types@15.7.15
│ └── csstype@3.2.3
├─┬ @vitejs/plugin-react@4.7.0
│ ├─┬ @babel/core@7.29.7
│ │ ├── @babel/code-frame@7.29.7 deduped
│ │ ├─┬ @babel/generator@7.29.8
│ │ │ ├── @babel/parser@7.29.9 deduped
│ │ │ ├── @babel/types@7.29.8 deduped
│ │ │ ├── @jridgewell/gen-mapping@0.3.13 deduped
│ │ │ ├─┬ @jridgewell/trace-mapping@0.3.31
│ │ │ │ ├── @jridgewell/resolve-uri@3.1.2
│ │ │ │ └── @jridgewell/sourcemap-codec@1.6.0 deduped
│ │ │ └── jsesc@3.1.0
│ │ ├─┬ @babel/helper-compilation-targets@7.29.7
│ │ │ ├── @babel/compat-data@7.29.7
│ │ │ ├── @babel/helper-validator-option@7.29.7
│ │ │ ├── browserslist@4.29.3 deduped
│ │ │ ├─┬ lru-cache@5.1.1
│ │ │ │ └── yallist@3.1.1
│ │ │ └── semver@6.3.1 deduped
│ │ ├─┬ @babel/helper-module-transforms@7.29.7
│ │ │ ├── @babel/core@7.29.7 deduped
│ │ │ ├─┬ @babel/helper-module-imports@7.29.7
│ │ │ │ ├── @babel/traverse@7.29.8 deduped
│ │ │ │ └── @babel/types@7.29.8 deduped
│ │ │ ├── @babel/helper-validator-identifier@7.29.7 deduped
│ │ │ └── @babel/traverse@7.29.8 deduped
│ │ ├─┬ @babel/helpers@7.29.7
│ │ │ ├── @babel/template@7.29.7 deduped
│ │ │ └── @babel/types@7.29.8 deduped
│ │ ├─┬ @babel/parser@7.29.9
│ │ │ └── @babel/types@7.29.8 deduped
│ │ ├─┬ @babel/template@7.29.7
│ │ │ ├── @babel/code-frame@7.29.7 deduped
│ │ │ ├── @babel/parser@7.29.9 deduped
│ │ │ └── @babel/types@7.29.8 deduped
│ │ ├─┬ @babel/traverse@7.29.8
│ │ │ ├── @babel/code-frame@7.29.7 deduped
│ │ │ ├── @babel/generator@7.29.8 deduped
│ │ │ ├── @babel/helper-globals@7.29.7
│ │ │ ├── @babel/parser@7.29.9 deduped
│ │ │ ├── @babel/template@7.29.7 deduped
│ │ │ ├── @babel/types@7.29.8 deduped
│ │ │ └── debug@4.4.3 deduped
│ │ ├─┬ @babel/types@7.29.8
│ │ │ ├── @babel/helper-string-parser@7.29.7
│ │ │ └── @babel/helper-validator-identifier@7.29.7 deduped
│ │ ├─┬ @jridgewell/remapping@2.3.5
│ │ │ ├── @jridgewell/gen-mapping@0.3.13 deduped
│ │ │ └── @jridgewell/trace-mapping@0.3.31 deduped
│ │ ├── convert-source-map@2.0.0
│ │ ├── debug@4.4.3 deduped
│ │ ├── gensync@1.0.0-beta.2
│ │ ├── json5@2.2.3
│ │ └── semver@6.3.1
│ ├─┬ @babel/plugin-transform-react-jsx-self@7.29.7
│ │ ├── @babel/core@7.29.7 deduped
│ │ └── @babel/helper-plugin-utils@7.29.7
│ ├─┬ @babel/plugin-transform-react-jsx-source@7.29.7
│ │ ├── @babel/core@7.29.7 deduped
│ │ └── @babel/helper-plugin-utils@7.29.7 deduped
│ ├── @rolldown/pluginutils@1.0.0-beta.27
│ ├─┬ @types/babel__core@7.20.5
│ │ ├── @babel/parser@7.29.9 deduped
│ │ ├── @babel/types@7.29.8 deduped
│ │ ├─┬ @types/babel__generator@7.27.0
│ │ │ └── @babel/types@7.29.8 deduped
│ │ ├─┬ @types/babel__template@7.4.4
│ │ │ ├── @babel/parser@7.29.9 deduped
│ │ │ └── @babel/types@7.29.8 deduped
│ │ └─┬ @types/babel__traverse@7.28.0
│ │   └── @babel/types@7.29.8 deduped
│ ├── react-refresh@0.17.0
│ └── vite@5.4.21 deduped
├─┬ autoprefixer@10.6.1
│ ├─┬ browserslist@4.29.3
│ │ ├── baseline-browser-mapping@2.11.26
│ │ ├── caniuse-lite@1.0.30001813 deduped
│ │ ├── electron-to-chromium@1.5.440
│ │ ├── node-releases@2.0.57
│ │ └─┬ update-browserslist-db@1.3.3
│ │   ├── browserslist@4.29.3 deduped
│ │   ├── escalade@3.2.0
│ │   └── picocolors@1.1.1 deduped
│ ├── caniuse-lite@1.0.30001813
│ ├── fraction.js@5.3.4
│ ├── picocolors@1.1.1 deduped
│ ├── postcss-value-parser@4.2.0
│ └── postcss@8.5.28 deduped
├─┬ class-variance-authority@0.7.1
│ └── clsx@2.1.1 deduped
├── clsx@2.1.1
├─┬ jsdom@26.1.0
│ ├── UNMET OPTIONAL DEPENDENCY canvas@^3.0.0
│ ├─┬ cssstyle@4.6.0
│ │ ├─┬ @asamuzakjp/css-color@3.2.0
│ │ │ ├─┬ @csstools/css-calc@2.1.4
│ │ │ │ ├── @csstools/css-parser-algorithms@3.0.5 deduped
│ │ │ │ └── @csstools/css-tokenizer@3.0.4 deduped
│ │ │ ├─┬ @csstools/css-color-parser@3.1.0
│ │ │ │ ├── @csstools/color-helpers@5.1.0
│ │ │ │ ├── @csstools/css-calc@2.1.4 deduped
│ │ │ │ ├── @csstools/css-parser-algorithms@3.0.5 deduped
│ │ │ │ └── @csstools/css-tokenizer@3.0.4 deduped
│ │ │ ├─┬ @csstools/css-parser-algorithms@3.0.5
│ │ │ │ └── @csstools/css-tokenizer@3.0.4 deduped
│ │ │ ├── @csstools/css-tokenizer@3.0.4
│ │ │ └── lru-cache@10.4.3
│ │ └── rrweb-cssom@0.8.0 deduped
│ ├─┬ data-urls@5.0.0
│ │ ├── whatwg-mimetype@4.0.0 deduped
│ │ └── whatwg-url@14.2.0 deduped
│ ├── decimal.js@10.6.0
│ ├─┬ html-encoding-sniffer@4.0.0
│ │ └── whatwg-encoding@3.1.1 deduped
│ ├─┬ http-proxy-agent@7.0.2
│ │ ├── agent-base@7.1.4
│ │ └── debug@4.4.3 deduped
│ ├─┬ https-proxy-agent@7.0.6
│ │ ├── agent-base@7.1.4 deduped
│ │ └── debug@4.4.3 deduped
│ ├── is-potential-custom-element-name@1.0.1
│ ├── nwsapi@2.2.28
│ ├─┬ parse5@7.3.0
│ │ └── entities@6.0.1
│ ├── rrweb-cssom@0.8.0
│ ├─┬ saxes@6.0.0
│ │ └── xmlchars@2.2.0
│ ├── symbol-tree@3.2.4
│ ├─┬ tough-cookie@5.1.2
│ │ └─┬ tldts@6.1.86
│ │   └── tldts-core@6.1.86
│ ├─┬ w3c-xmlserializer@5.0.0
│ │ └── xml-name-validator@5.0.0 deduped
│ ├── webidl-conversions@7.0.0
│ ├─┬ whatwg-encoding@3.1.1
│ │ └─┬ iconv-lite@0.6.3
│ │   └── safer-buffer@2.1.2
│ ├── whatwg-mimetype@4.0.0
│ ├─┬ whatwg-url@14.2.0
│ │ ├─┬ tr46@5.1.1
│ │ │ └── punycode@2.3.1
│ │ └── webidl-conversions@7.0.0 deduped
│ ├─┬ ws@8.22.0
│ │ ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
│ │ └── UNMET OPTIONAL DEPENDENCY utf-8-validate@>=5.0.2
│ └── xml-name-validator@5.0.0
├─┬ lucide-react@1.48.0
│ └── react@18.3.1 deduped
├─┬ postcss@8.5.28
│ ├── nanoid@3.3.19
│ ├── picocolors@1.1.1 deduped
│ └── source-map-js@1.2.1
├─┬ react-dom@18.3.1
│ ├─┬ loose-envify@1.4.0
│ │ └── js-tokens@4.0.0 deduped
│ ├── react@18.3.1 deduped
│ └─┬ scheduler@0.23.2
│   └── loose-envify@1.4.0 deduped
├─┬ react@18.3.1
│ └── loose-envify@1.4.0 deduped
├── tailwind-merge@3.7.0
├─┬ tailwindcss@3.4.19
│ ├── @alloc/quick-lru@5.3.0
│ ├── arg@5.0.2
│ ├─┬ chokidar@3.6.0
│ │ ├─┬ anymatch@3.1.3
│ │ │ ├── normalize-path@3.0.0 deduped
│ │ │ └── picomatch@2.3.2 deduped
│ │ ├─┬ braces@3.0.3
│ │ │ └─┬ fill-range@7.1.1
│ │ │   └─┬ to-regex-range@5.0.1
│ │ │     └── is-number@7.0.0
│ │ ├── UNMET OPTIONAL DEPENDENCY fsevents@~2.3.2
│ │ ├─┬ glob-parent@5.1.2
│ │ │ └── is-glob@4.0.3 deduped
│ │ ├─┬ is-binary-path@2.1.0
│ │ │ └── binary-extensions@2.3.0
│ │ ├── is-glob@4.0.3 deduped
│ │ ├── normalize-path@3.0.0 deduped
│ │ └─┬ readdirp@3.6.0
│ │   └── picomatch@2.3.2 deduped
│ ├── didyoumean@1.2.2
│ ├── dlv@1.1.3
│ ├─┬ fast-glob@3.3.3
│ │ ├── @nodelib/fs.stat@2.0.5
│ │ ├─┬ @nodelib/fs.walk@1.2.8
│ │ │ ├─┬ @nodelib/fs.scandir@2.1.5
│ │ │ │ ├── @nodelib/fs.stat@2.0.5 deduped
│ │ │ │ └─┬ run-parallel@1.2.0
│ │ │ │   └── queue-microtask@1.2.3
│ │ │ └─┬ fastq@1.20.3
│ │ │   └── reusify@1.1.0
│ │ ├─┬ glob-parent@5.1.2
│ │ │ └── is-glob@4.0.3 deduped
│ │ ├── merge2@1.4.1
│ │ └── micromatch@4.0.8 deduped
│ ├─┬ glob-parent@6.0.2
│ │ └── is-glob@4.0.3 deduped
│ ├─┬ is-glob@4.0.3
│ │ └── is-extglob@2.1.1
│ ├── jiti@1.21.7
│ ├── lilconfig@3.1.3
│ ├─┬ micromatch@4.0.8
│ │ ├── braces@3.0.3 deduped
│ │ └── picomatch@2.3.2
│ ├── normalize-path@3.0.0
│ ├── object-hash@3.0.0
│ ├── picocolors@1.1.1 deduped
│ ├─┬ postcss-import@15.1.0
│ │ ├── postcss-value-parser@4.2.0 deduped
│ │ ├── postcss@8.5.28 deduped
│ │ ├── read-cache@1.0.2
│ │ └── resolve@1.22.12 deduped
│ ├─┬ postcss-js@4.1.0
│ │ ├── camelcase-css@2.0.1
│ │ └── postcss@8.5.28 deduped
│ ├─┬ postcss-load-config@6.0.1
│ │ ├── jiti@1.21.7 deduped
│ │ ├── lilconfig@3.1.3 deduped
│ │ ├── postcss@8.5.28 deduped
│ │ ├── UNMET OPTIONAL DEPENDENCY tsx@^4.8.1
│ │ └── UNMET OPTIONAL DEPENDENCY yaml@^2.4.2
│ ├─┬ postcss-nested@6.2.0
│ │ ├── postcss-selector-parser@6.1.4 deduped
│ │ └── postcss@8.5.28 deduped
│ ├─┬ postcss-selector-parser@6.1.4
│ │ ├── cssesc@3.0.0
│ │ └── util-deprecate@1.0.2
│ ├── postcss@8.5.28 deduped
│ ├─┬ resolve@1.22.12
│ │ ├── es-errors@1.3.0
│ │ ├─┬ is-core-module@2.17.0
│ │ │ └─┬ hasown@2.0.4
│ │ │   └── function-bind@1.1.2
│ │ ├── path-parse@1.0.7
│ │ └── supports-preserve-symlinks-flag@1.0.0
│ └─┬ sucrase@3.35.1
│   ├─┬ @jridgewell/gen-mapping@0.3.13
│   │ ├── @jridgewell/sourcemap-codec@1.6.0 deduped
│   │ └── @jridgewell/trace-mapping@0.3.31 deduped
│   ├── commander@4.1.1
│   ├── lines-and-columns@1.2.4
│   ├─┬ mz@2.7.0
│   │ ├── any-promise@1.3.0
│   │ ├── object-assign@4.1.1
│   │ └─┬ thenify-all@1.6.0
│   │   └─┬ thenify@3.3.1
│   │     └── any-promise@1.3.0 deduped
│   ├── pirates@4.0.7
│   ├── tinyglobby@0.2.17 deduped
│   └── ts-interface-checker@0.1.13
├── typescript@5.9.3
├─┬ vite@5.4.21
│ ├── @types/node@24.0.0 deduped
│ ├─┬ esbuild@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/aix-ppc64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/android-arm@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/android-arm64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/android-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/darwin-arm64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/darwin-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/freebsd-arm64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/freebsd-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-arm@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-arm64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-ia32@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-loong64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-mips64el@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-ppc64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-riscv64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-s390x@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/linux-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/netbsd-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/openbsd-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/sunos-x64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/win32-arm64@0.21.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @esbuild/win32-ia32@0.21.5
│ │ └── @esbuild/win32-x64@0.21.5
│ ├── UNMET OPTIONAL DEPENDENCY fsevents@~2.3.3
│ ├── UNMET OPTIONAL DEPENDENCY less@*
│ ├── UNMET OPTIONAL DEPENDENCY lightningcss@^1.21.0
│ ├── postcss@8.5.28 deduped
│ ├─┬ rollup@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @napi-rs/lzma-linux-x64-gnu@1.5.1
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-android-arm-eabi@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-android-arm64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-darwin-arm64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-darwin-x64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-freebsd-arm64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-freebsd-x64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-arm-gnueabihf@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-arm-musleabihf@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-arm64-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-arm64-musl@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-loong64-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-loong64-musl@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-ppc64-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-ppc64-musl@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-riscv64-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-riscv64-musl@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-s390x-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-x64-gnu@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-linux-x64-musl@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-openbsd-x64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-openharmony-arm64@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-win32-arm64-msvc@4.63.5
│ │ ├── UNMET OPTIONAL DEPENDENCY @rollup/rollup-win32-ia32-msvc@4.63.5
│ │ ├── @rollup/rollup-win32-x64-gnu@4.63.5
│ │ ├── @rollup/rollup-win32-x64-msvc@4.63.5
│ │ ├── @types/estree@1.0.9
│ │ └── UNMET OPTIONAL DEPENDENCY fsevents@~2.3.2
│ ├── UNMET OPTIONAL DEPENDENCY sass-embedded@*
│ ├── UNMET OPTIONAL DEPENDENCY sass@*
│ ├── UNMET OPTIONAL DEPENDENCY stylus@*
│ ├── UNMET OPTIONAL DEPENDENCY sugarss@*
│ └── UNMET OPTIONAL DEPENDENCY terser@^5.4.0
└─┬ vitest@3.2.6
  ├── UNMET OPTIONAL DEPENDENCY @edge-runtime/vm@*
  ├─┬ @types/chai@5.2.3
  │ ├── @types/deep-eql@4.0.2
  │ └── assertion-error@2.0.1
  ├── UNMET OPTIONAL DEPENDENCY @types/debug@^4.1.12
  ├── @types/node@24.0.0 deduped
  ├── UNMET OPTIONAL DEPENDENCY @vitest/browser@3.2.6
  ├─┬ @vitest/expect@3.2.6
  │ ├── @types/chai@5.2.3 deduped
  │ ├── @vitest/spy@3.2.6 deduped
  │ ├── @vitest/utils@3.2.6 deduped
  │ ├── chai@5.3.3 deduped
  │ └── tinyrainbow@2.0.0 deduped
  ├─┬ @vitest/mocker@3.2.6
  │ ├── @vitest/spy@3.2.6 deduped
  │ ├─┬ estree-walker@3.0.3
  │ │ └── @types/estree@1.0.9 deduped
  │ ├── magic-string@0.30.21 deduped
  │ ├── UNMET OPTIONAL DEPENDENCY msw@^2.4.9
  │ └── vite@5.4.21 deduped
  ├─┬ @vitest/pretty-format@3.2.7
  │ └── tinyrainbow@2.0.0 deduped
  ├─┬ @vitest/runner@3.2.6
  │ ├── @vitest/utils@3.2.6 deduped
  │ ├── pathe@2.0.3 deduped
  │ └─┬ strip-literal@3.1.0
  │   └── js-tokens@9.0.1
  ├─┬ @vitest/snapshot@3.2.6
  │ ├─┬ @vitest/pretty-format@3.2.6
  │ │ └── tinyrainbow@2.0.0 deduped
  │ ├── magic-string@0.30.21 deduped
  │ └── pathe@2.0.3 deduped
  ├─┬ @vitest/spy@3.2.6
  │ └── tinyspy@4.0.6
  ├── UNMET OPTIONAL DEPENDENCY @vitest/ui@3.2.6
  ├─┬ @vitest/utils@3.2.6
  │ ├─┬ @vitest/pretty-format@3.2.6
  │ │ └── tinyrainbow@2.0.0 deduped
  │ ├── loupe@3.2.1
  │ └── tinyrainbow@2.0.0 deduped
  ├─┬ chai@5.3.3
  │ ├── assertion-error@2.0.1 deduped
  │ ├── check-error@2.1.3
  │ ├── deep-eql@5.0.2
  │ ├── loupe@3.2.1 deduped
  │ └── pathval@2.0.1
  ├─┬ debug@4.4.3
  │ └── ms@2.1.3
  ├── expect-type@1.4.0
  ├── UNMET OPTIONAL DEPENDENCY happy-dom@*
  ├── jsdom@26.1.0 deduped
  ├─┬ magic-string@0.30.21
  │ └── @jridgewell/sourcemap-codec@1.6.0
  ├── pathe@2.0.3
  ├── picomatch@4.0.7
  ├── std-env@3.10.0
  ├── tinybench@2.9.0
  ├── tinyexec@0.3.2
  ├─┬ tinyglobby@0.2.17
  │ ├─┬ fdir@6.5.0
  │ │ └── picomatch@4.0.7 deduped
  │ └── picomatch@4.0.7
  ├── tinypool@1.1.1
  ├── tinyrainbow@2.0.0
  ├─┬ vite-node@3.2.4
  │ ├── cac@6.7.14
  │ ├── debug@4.4.3 deduped
  │ ├── es-module-lexer@1.7.0
  │ ├── pathe@2.0.3 deduped
  │ └── vite@5.4.21 deduped
  ├── vite@5.4.21 deduped
  └─┬ why-is-node-running@2.3.0
    ├── siginfo@2.0.0
    └── stackback@0.0.2

NATIVE_EXIT=0
```

## matrixNpmAudit

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui`

Command: `npm audit --json`

Native exit: 1. 9 baseline package entries: 3 moderate, 6 high; 324 dependency entries; no dependency changes.

Complete output:

```text
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "@vitest/mocker": {
      "name": "@vitest/mocker",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1193684,
          "name": "@vitest/mocker",
          "dependency": "@vitest/mocker",
          "title": "Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock",
          "url": "https://github.com/advisories/GHSA-82fw-gwwq-j7x9",
          "severity": "moderate",
          "cwe": [
            "CWE-22"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=2.1.0 <4.1.11"
        }
      ],
      "effects": [
        "vitest"
      ],
      "range": "2.1.0 - 4.1.10",
      "nodes": [
        "node_modules/@vitest/mocker"
      ],
      "fixAvailable": {
        "name": "vitest",
        "version": "5.0.3",
        "isSemVerMajor": true
      }
    },
    "braces": {
      "name": "braces",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1240992,
          "name": "braces",
          "dependency": "braces",
          "title": "braces vulnerable to stack-exhaustion denial of service through deeply nested patterns",
          "url": "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
          "severity": "high",
          "cwe": [
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<=3.0.3"
        }
      ],
      "effects": [
        "chokidar",
        "micromatch"
      ],
      "range": "*",
      "nodes": [
        "node_modules/braces"
      ],
      "fixAvailable": {
        "name": "tailwindcss",
        "version": "4.3.3",
        "isSemVerMajor": true
      }
    },
    "chokidar": {
      "name": "chokidar",
      "severity": "high",
      "isDirect": false,
      "via": [
        "braces"
      ],
      "effects": [
        "tailwindcss"
      ],
      "range": "2.0.0 - 3.6.0",
      "nodes": [
        "node_modules/chokidar"
      ],
      "fixAvailable": {
        "name": "tailwindcss",
        "version": "4.3.3",
        "isSemVerMajor": true
      }
    },
    "esbuild": {
      "name": "esbuild",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1102341,
          "name": "esbuild",
          "dependency": "esbuild",
          "title": "esbuild enables any website to send any requests to the development server and read the response",
          "url": "https://github.com/advisories/GHSA-67mh-4wv8-2f99",
          "severity": "moderate",
          "cwe": [
            "CWE-346"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N"
          },
          "range": "<=0.24.2"
        }
      ],
      "effects": [
        "vite"
      ],
      "range": "<=0.24.2",
      "nodes": [
        "node_modules/esbuild"
      ],
      "fixAvailable": {
        "name": "vite",
        "version": "8.3.2",
        "isSemVerMajor": true
      }
    },
    "fast-glob": {
      "name": "fast-glob",
      "severity": "high",
      "isDirect": false,
      "via": [
        "micromatch"
      ],
      "effects": [],
      "range": "*",
      "nodes": [
        "node_modules/fast-glob"
      ],
      "fixAvailable": true
    },
    "micromatch": {
      "name": "micromatch",
      "severity": "high",
      "isDirect": false,
      "via": [
        "braces"
      ],
      "effects": [
        "fast-glob",
        "tailwindcss"
      ],
      "range": ">=0.2.0",
      "nodes": [
        "node_modules/micromatch"
      ],
      "fixAvailable": {
        "name": "tailwindcss",
        "version": "4.3.3",
        "isSemVerMajor": true
      }
    },
    "tailwindcss": {
      "name": "tailwindcss",
      "severity": "high",
      "isDirect": true,
      "via": [
        "chokidar",
        "fast-glob",
        "micromatch"
      ],
      "effects": [],
      "range": "<=0.0.0-oxide-insiders.ff2c25f || 2.1.0-canary.1 - 3.4.19",
      "nodes": [
        "node_modules/tailwindcss"
      ],
      "fixAvailable": {
        "name": "tailwindcss",
        "version": "4.3.3",
        "isSemVerMajor": true
      }
    },
    "vite": {
      "name": "vite",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1116229,
          "name": "vite",
          "dependency": "vite",
          "title": "Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling",
          "url": "https://github.com/advisories/GHSA-4w7w-66w2-5vf9",
          "severity": "moderate",
          "cwe": [
            "CWE-22",
            "CWE-200"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<=6.4.1"
        },
        {
          "source": 1120784,
          "name": "vite",
          "dependency": "vite",
          "title": "launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows",
          "url": "https://github.com/advisories/GHSA-v6wh-96g9-6wx3",
          "severity": "moderate",
          "cwe": [
            "CWE-73",
            "CWE-522"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<=6.4.2"
        },
        {
          "source": 1123525,
          "name": "vite",
          "dependency": "vite",
          "title": "vite: `server.fs.deny` bypass on Windows alternate paths",
          "url": "https://github.com/advisories/GHSA-fx2h-pf6j-xcff",
          "severity": "high",
          "cwe": [
            "CWE-22",
            "CWE-200"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": "<=6.4.2"
        },
        "esbuild"
      ],
      "effects": [],
      "range": "<=6.4.2",
      "nodes": [
        "node_modules/vite"
      ],
      "fixAvailable": {
        "name": "vite",
        "version": "8.3.2",
        "isSemVerMajor": true
      }
    },
    "vitest": {
      "name": "vitest",
      "severity": "moderate",
      "isDirect": true,
      "via": [
        "@vitest/mocker",
        {
          "source": 1193683,
          "name": "vitest",
          "dependency": "vitest",
          "title": "Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock",
          "url": "https://github.com/advisories/GHSA-82fw-gwwq-j7x9",
          "severity": "moderate",
          "cwe": [
            "CWE-22"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=2.1.0 <4.1.11"
        }
      ],
      "effects": [],
      "range": "2.1.0-beta.1 - 4.1.10",
      "nodes": [
        "node_modules/vitest"
      ],
      "fixAvailable": {
        "name": "vitest",
        "version": "5.0.3",
        "isSemVerMajor": true
      }
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 3,
      "high": 6,
      "critical": 0,
      "total": 9
    },
    "dependencies": {
      "prod": 57,
      "dev": 268,
      "optional": 50,
      "peer": 0,
      "peerOptional": 0,
      "total": 324
    }
  }
}
NATIVE_EXIT=1
```

## matrixNugetAudit

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive`

Native exit: 0. Both projects: no vulnerable packages given current sources.

Complete output:

```text
  Determining projects to restore...
  All projects are up-to-date for restore.

The following sources were used:
   https://api.nuget.org/v3/index.json

The given project `PenguinLauncher` has no vulnerable packages given the current sources.
The given project `PenguinLauncher.Tests` has no vulnerable packages given the current sources.
NATIVE_EXIT=0
```

## matrixDiffCheck

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `git diff --check`

Native exit: 0. No whitespace errors.

Complete output:

```text
NATIVE_EXIT=0
```

## matrixFormatFinal

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal`

Native exit: 2. Final: 165 WHITESPACE diagnostics (70 Program, 95 LaunchManager), down from 233 baseline; none in new helper/fixture/test files. Program retains its pre-existing incorrectly indented middleware/services sections; formatter locations around the added boundary also describe adjacent existing trivia. No whole-file formatter cleanup.

Complete output:

```text
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(48,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(49,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(50,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(51,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(52,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(53,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(55,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(56,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(58,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(59,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(60,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(61,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(62,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(63,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(65,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(66,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(68,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(69,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(70,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(71,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(72,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(73,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(74,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(76,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(77,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(103,45): error WHITESPACE: Fix whitespace formatting. Replace 16 characters with '\r\n\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(105,62): error WHITESPACE: Fix whitespace formatting. Replace 14 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(106,38): error WHITESPACE: Fix whitespace formatting. Replace 14 characters with '\r\n\s\s\s\s\s\s\s\s\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(108,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(109,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(110,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(111,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(112,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(113,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(114,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(115,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(116,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(117,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(118,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(119,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(121,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(122,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(123,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(124,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(125,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(126,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(127,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(129,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(130,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(131,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(132,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(133,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(134,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(136,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(137,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(138,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(139,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(140,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(141,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(142,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(143,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(144,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(145,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(147,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(148,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(149,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(150,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(151,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(152,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Program.cs(153,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(88,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(89,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(90,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(91,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(92,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(94,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(95,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(96,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(97,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(99,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(101,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(102,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(103,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(105,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(106,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(107,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(109,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(110,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(111,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(112,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(113,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(114,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(115,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(116,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(117,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(118,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(119,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(120,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(121,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(122,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(124,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(125,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(126,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(127,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(128,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(129,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(130,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(131,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(132,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(133,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(135,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(136,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(137,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(138,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(139,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(140,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(141,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(142,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(143,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(144,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(146,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(147,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(148,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(149,21): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(150,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(152,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(154,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(155,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(156,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(157,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(159,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(160,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(162,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(163,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(164,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(165,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(166,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(167,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(168,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(169,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(170,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(171,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(173,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(174,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(175,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(176,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(177,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(178,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(179,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(181,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(182,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(183,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(184,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(185,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(186,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(187,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(188,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(189,17): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(190,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(191,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(193,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(194,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(195,13): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(196,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Services\LaunchManager\LaunchManagerService.cs(198,9): error WHITESPACE: Fix whitespace formatting. Insert '\s\s\s\s'. [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj]
NATIVE_EXIT=2
```

## focusedFormat

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --include src/PenguinLauncher/Hosting/LocalApiHost.cs tests/PenguinLauncher.Tests/Hosting/LocalApiHostTests.cs tests/PenguinLauncher.Tests/Fixtures/RecordingConnectionListenerFactory.cs --verbosity minimal`

Native exit: 0. New helper/test/fixture formatting verification exit 0.

Complete output:

```text
NATIVE_EXIT=0
```

## matrixDotnetTestFinal

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet test PenguinLauncher.sln --verbosity minimal`

Native exit: 0. After formatting corrections/newline normalization: 349 passed, zero failures/skips.

Complete output:

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   349, Skipped:     0, Total:   349, Duration: 761 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT=0
```

## matrixReleaseFinal

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Command: `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal`

Native exit: 0. After formatting corrections: zero warnings/errors.

Complete output:

```text
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Release\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Release\net10.0\PenguinLauncher.Tests.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.20
NATIVE_EXIT=0
```

## Shipped asset review

`git diff --exit-code -- src/PenguinLauncher/wwwroot` returned 0 after HTML-only restoration. SHA256 hashes and credential-name/literal scan output:

```text
GENERATED_DIFF_NATIVE_EXIT=0
[
    {
        "File":  "index-D9HK_ItX.css",
        "SHA256":  "D4D7EE14D4B9BEA6C8BE66EB58F727E15743A31783BA0AFC2AC5B0AC21E74C22"
    },
    {
        "File":  "index-DNZ_BUpz.js",
        "SHA256":  "F25AE56B2265134EF3A70579E25230D6C83BD28436FACDB6EB3F945A3F44423A"
    }
]
CREDENTIAL_LITERAL_MATCH_COUNT=0
```

Source inspection: main initializes apiSession before rendering the gate; client.ts obtains credential per call, overwrites Authorization with Bearer, and uses redirect: error; mounted gate selects production disconnected UI. Generated index-DNZ_BUpz.js contains penguin.api.session, penguin-session, sessionStorage, runtime Bearer construction, redirect:error, and allowDevelopmentEntry:!1 at the actual production mount. No PENGUIN_SESSION_TOKEN/PENGUIN_DEV_ORIGIN/test-token/Vite credential literal was found. No task supplied real credentials to a build. The absence scan supplements source/bundle review; it is not a general proof about arbitrary future secret literals.
