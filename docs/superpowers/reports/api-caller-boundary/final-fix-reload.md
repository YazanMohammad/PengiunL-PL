# reload verification

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Command: `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter "FullyQualifiedName~HostConfiguration_CannotAddNonLoopbackBindings" --verbosity minimal`.
Native exit: 0.

Tests-only characterization of already correct production binding. No intended behavioral RED is claimed. The live active Kestrel loader token does not change and its specifically registered callback is not invoked when the host token fires; hostile endpoint keys are absent from the loader. Recording transports retain exactly IPv4/IPv6 loopback port5100. No delays, reflection, global subscriber counts or sockets. Initial setup compile failure CS1061 was corrected using IConfiguration explicitly.

## Intermediate failure (not intended RED)

Native exit: 1. Same command/cwd.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(305,61): error CS1061: 'ConfigurationManager' does not contain a definition for 'GetReloadToken' and no accessible extension method 'GetReloadToken' accepting a first argument of type 'ConfigurationManager' could be found (are you missing a using directive or an assembly reference?) [C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj]
Native exit code: 1
```

## Final focused result

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     3, Skipped:     0, Total:     3, Duration: 98 ms - PenguinLauncher.Tests.dll (net10.0)
Native exit code: 0
```
