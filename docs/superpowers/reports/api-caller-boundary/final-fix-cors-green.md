# CORS focused GREEN

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Command: `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter "FullyQualifiedName~LocalApiBoundaryTests|FullyQualifiedName~LocalApiHostTests.ProxiedBrowser" --verbosity minimal`.
Native exit: 0. 117 tests passed.

Response-start callback captures the already validated policy origin and appends Origin to downstream Vary. Shared fixture now uses actual exception middleware in Program order and a synthetic throwing handler. Existing auth, preflight, foreign-origin and proxy checks pass.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   117, Skipped:     0, Total:   117, Duration: 488 ms - PenguinLauncher.Tests.dll (net10.0)
Native exit code: 0
```

