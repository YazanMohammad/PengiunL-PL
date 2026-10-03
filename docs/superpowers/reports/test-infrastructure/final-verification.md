# Fresh serial verification — test infrastructure

Date: 2026-10-03. Run after whole-branch review at `1a5270b`; runtime/test implementation unchanged since `06f1ca0`.
Commands ran sequentially, awaiting each process completion. This is not a claim that all checks passed.

## Worktree root: exit 0

```powershell
dotnet test PenguinLauncher.sln --verbosity minimal
```

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    64, Skipped:     0, Total:    64, Duration: 803 ms - PenguinLauncher.Tests.dll (net10.0)
```

## UI: exit 0

```powershell
npm test
```

```text

> penguinlauncher-ui@1.0.0 test
> vitest run


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ✓ tests/isolation.test.tsx (3 tests) 17ms
 ✓ tests/api/client.test.ts (11 tests) 8ms
 ✓ tests/components/AccountSelectorModal.test.tsx (5 tests) 113ms

 Test Files  3 passed (3)
      Tests  19 passed (19)
   Start at  20:00:24
   Duration  6.36s (transform 104ms, setup 2.32s, collect 381ms, tests 138ms, environment 11.37s, prepare 697ms)
```

## UI: exit 0

```powershell
npm run typecheck
```

```text

> penguinlauncher-ui@1.0.0 typecheck
> tsc --noEmit && tsc --project tsconfig.test.json --noEmit
```

## UI: exit 0

```powershell
npm run build
```

```text

> penguinlauncher-ui@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 1987 modules transformed.
rendering chunks...
computing gzip size...
../PenguinLauncher/wwwroot/index.html                   0.73 kB │ gzip:   0.41 kB
../PenguinLauncher/wwwroot/assets/index-7ftwbyUw.css   46.87 kB │ gzip:   8.67 kB
../PenguinLauncher/wwwroot/assets/index-Chg6bpHi.js   360.53 kB │ gzip: 107.63 kB
✓ built in 2.30s
```

## Worktree root: exit 0

```powershell
dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal
```

```text
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Release\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Release\net10.0\PenguinLauncher.Tests.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.90
```

## Worktree root: exit 2

```powershell
$formatDiagnostics = & dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal 2>&1; $formatNativeExit = $LASTEXITCODE; Write-Output "Native formatter exit: $formatNativeExit"; Write-Output "WHITESPACE diagnostics: $(@($formatDiagnostics | Where-Object { $_ -match 'WHITESPACE' }).Count)"; Write-Output "Test-file diagnostics: $(@($formatDiagnostics | Where-Object { $_ -match 'tests[\\/]' }).Count)"; exit $formatNativeExit
```

```text
Native formatter exit: 2
WHITESPACE diagnostics: 233
Test-file diagnostics: 0
```

## UI: exit 0

```powershell
$dependencyTree = & npm ls --all 2>&1; $dependencyNativeExit = $LASTEXITCODE; $dependencyTree | Select-Object -Last 8; Write-Output "Native npm ls exit: $dependencyNativeExit"; exit $dependencyNativeExit
```

```text
  │ ├── es-module-lexer@1.7.0
  │ ├── pathe@2.0.3 deduped
  │ └── vite@5.4.21 deduped
  ├── vite@5.4.21 deduped
  └─┬ why-is-node-running@2.3.0
    ├── siginfo@2.0.0
    └── stackback@0.0.2

Native npm ls exit: 0
```

## UI: exit 1

```powershell
$auditResult = & npm audit --json; $auditNativeExit = $LASTEXITCODE; $auditObject = ($auditResult -join "`n") | ConvertFrom-Json; $auditObject.metadata.vulnerabilities | ConvertTo-Json -Compress; $auditObject.vulnerabilities.PSObject.Properties | ForEach-Object { Write-Output "$($_.Name): $($_.Value.severity)" }; Write-Output "Native audit exit: $auditNativeExit"; exit $auditNativeExit
```

```text
{"info":0,"low":0,"moderate":3,"high":6,"critical":0,"total":9}
@vitest/mocker: moderate
braces: high
chokidar: high
esbuild: moderate
fast-glob: high
micromatch: high
tailwindcss: high
vite: high
vitest: moderate
Native audit exit: 1
```

## Worktree root: exit 0

```powershell
dotnet list PenguinLauncher.sln package --vulnerable --include-transitive
```

```text
  Determining projects to restore...
  All projects are up-to-date for restore.

The following sources were used:
   https://api.nuget.org/v3/index.json

The given project `PenguinLauncher` has no vulnerable packages given the current sources.
The given project `PenguinLauncher.Tests` has no vulnerable packages given the current sources.
```

## Worktree root: exit 1

```powershell
git diff --check
```

```text
warning: in the working copy of 'src/PenguinLauncher/wwwroot/assets/index-7ftwbyUw.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/PenguinLauncher/wwwroot/assets/index-Chg6bpHi.js', LF will be replaced by CRLF the next time Git touches it
src/PenguinLauncher/wwwroot/index.html:1: trailing whitespace.
+<!DOCTYPE html>
src/PenguinLauncher/wwwroot/index.html:2: trailing whitespace.
+<html lang="en">
src/PenguinLauncher/wwwroot/index.html:3: trailing whitespace.
+  <head>
src/PenguinLauncher/wwwroot/index.html:4: trailing whitespace.
+    <meta charset="UTF-8" />
src/PenguinLauncher/wwwroot/index.html:5: trailing whitespace.
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
src/PenguinLauncher/wwwroot/index.html:6: trailing whitespace.
+    <title>Penguin Launcher</title>
src/PenguinLauncher/wwwroot/index.html:7: trailing whitespace.
+    <link rel="preconnect" href="https://fonts.googleapis.com" />
src/PenguinLauncher/wwwroot/index.html:8: trailing whitespace.
+    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
src/PenguinLauncher/wwwroot/index.html:9: trailing whitespace.
+    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
src/PenguinLauncher/wwwroot/index.html:12: trailing whitespace.
+  </head>
src/PenguinLauncher/wwwroot/index.html:13: trailing whitespace.
+  <body class="bg-penguin-bg text-penguin-text font-sans">
src/PenguinLauncher/wwwroot/index.html:14: trailing whitespace.
+    <div id="root"></div>
src/PenguinLauncher/wwwroot/index.html:15: trailing whitespace.
+  </body>
src/PenguinLauncher/wwwroot/index.html:16: trailing whitespace.
+</html>
```

## Generated-output follow-up

The final diff check initially exited 1 because Vite reproduced known HTML carriage-return drift. Compared content with carriage returns removed against HEAD: identical. Restored only index.html newline normalization with apply_patch. Repeated `git diff --check`: exit 0. Repeated baseline runtime/config/assets diff: exit 0, empty. Refreshed the index for those three known generated assets: no staged content changes. No runtime fix was made.
