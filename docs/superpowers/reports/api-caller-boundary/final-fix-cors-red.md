# CORS regression RED

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Command: `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter "FullyQualifiedName~DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart|FullyQualifiedName~ForeignDevelopmentOrigin_IsBlockedBeforeThrowingHandlerWithoutCors" --verbosity minimal`.
Native exit: 1.

Before production edits: 2 intended runtime failures, 1 foreign-origin rejection passes. A successful handler overwrites Vary, losing Origin; actual exception middleware clears the early CORS headers, losing Allow-Origin on the handled 500. Build/setup succeeded. No general error redaction changes.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.32]     PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(path: "/api/health", status: 200) [FAIL]
[xUnit.net 00:00:00.33]     PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(path: "/api/synthetic-throw", status: 500) [FAIL]
  Failed PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(path: "/api/health", status: 200) [134 ms]
  Error Message:
   Assert.Contains() Failure: Item not found in collection
Collection: ["Accept-Encoding"]
Not found:  "Origin"
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AssertCors(HttpResponseMessage response) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 463
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(String path, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 420
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(String path, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 424
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(path: "/api/synthetic-throw", status: 500) [14 ms]
  Error Message:
   System.InvalidOperationException : The given header was not found.
  Stack Trace:
     at System.Net.Http.Headers.HttpHeaders.GetValues(HeaderDescriptor descriptor)
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.AssertCors(HttpResponseMessage response) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 462
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(String path, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 420
   at PenguinLauncher.Tests.Hosting.LocalApiBoundaryTests.DevelopmentResponse_PreservesCorsAndExistingVaryAtResponseStart(String path, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiBoundaryTests.cs:line 424
--- End of stack trace from previous location ---

Failed!  - Failed:     2, Passed:     1, Skipped:     0, Total:     3, Duration: 172 ms - PenguinLauncher.Tests.dll (net10.0)
Native exit code: 1
```
