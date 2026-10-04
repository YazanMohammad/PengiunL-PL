# Headless disposal regression RED

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Command: `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter "FullyQualifiedName~Server_DisposesOwnedResources" --verbosity minimal`.
Native exit: 1.

All 3 tests compiled and failed at the intended disposal assertion: expected 1, actual 0. Shutdown (normal and cancellation) and startup failure leave a resolved DI factory-owned async-disposable resource undisposed before test cleanup. Tests deliberately have no caller await-using scope. Readiness and original startup error assertions pass before the failing ownership assertion.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.23]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesOnStartupFailureAndPropagatesError [FAIL]
[xUnit.net 00:00:00.24]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(cancel: False) [FAIL]
[xUnit.net 00:00:00.25]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(cancel: True) [FAIL]
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesOnStartupFailureAndPropagatesError [65 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 1
Actual:   0
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesOnStartupFailureAndPropagatesError() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 210
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesOnStartupFailureAndPropagatesError() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 215
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(cancel: False) [10 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 1
Actual:   0
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(Boolean cancel) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 185
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(Boolean cancel) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 192
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(cancel: True) [2 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 1
Actual:   0
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(Boolean cancel) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 185
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_DisposesOwnedResourcesAfterShutdown(Boolean cancel) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 192
--- End of stack trace from previous location ---

Failed!  - Failed:     3, Passed:     0, Skipped:     0, Total:     3, Duration: 92 ms - PenguinLauncher.Tests.dll (net10.0)
Native exit code: 1
```
