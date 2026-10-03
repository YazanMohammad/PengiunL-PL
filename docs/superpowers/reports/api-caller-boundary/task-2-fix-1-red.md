# Task 2 review fix 1: regression RED

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`
Command: `dotnet test PenguinLauncher.sln --filter 'FullyQualifiedName~AuthenticatedDottedUnknownApi_ReturnsJson404|FullyQualifiedName~MissingNonApiStaticAsset_RemainsFramework404' --verbosity minimal`
Native exit: 1

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.26]     PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AuthenticatedDottedUnknownApi_ReturnsJson404 [FAIL]
  Failed PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AuthenticatedDottedUnknownApi_ReturnsJson404 [14 ms]
  Error Message:
   Assert.Equal() Failure: Strings differ
Expected: "application/json"
Actual:   null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AssertErrorAsync(HttpResponseMessage response, HttpStatusCode status, String error) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 439
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AuthenticatedDottedUnknownApi_ReturnsJson404() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 275
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AuthenticatedDottedUnknownApi_ReturnsJson404() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 276
--- End of stack trace from previous location ---

Failed!  - Failed:     1, Passed:     1, Skipped:     0, Total:     2, Duration: 113 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT_CODE=1
```
