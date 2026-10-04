# disposal-green verification

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
Command: `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter "FullyQualifiedName~LocalApiHostTests" --verbosity minimal`.
Native exit: 0.

25 host tests pass. Existing assertions now capture lifetime before helper disposal; cleanup uses DisposeAsync rather than StopAsync on a disposed host. Intermediate run correctly exposed 2 old tests accessing app.Lifetime after provider disposal (23 passed); this was test adaptation, not an intended RED.

## Intermediate failure (not intended RED)

Native exit: 1. Same command/cwd.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.33]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown [FAIL]
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown [6 ms]
  Error Message:
   System.ObjectDisposedException : Cannot access a disposed object.
Object name: 'IServiceProvider'.
  Stack Trace:
     at Microsoft.Extensions.DependencyInjection.ServiceLookup.ThrowHelper.ThrowObjectDisposedException()
   at Microsoft.Extensions.DependencyInjection.ServiceProvider.GetService(ServiceIdentifier serviceIdentifier, ServiceProviderEngineScope serviceProviderEngineScope)
   at Microsoft.Extensions.DependencyInjection.ServiceProvider.GetService(Type serviceType)
   at Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService(IServiceProvider provider, Type serviceType)
   at Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService[T](IServiceProvider provider)
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 139
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 145
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 145
--- End of stack trace from previous location ---
[xUnit.net 00:00:00.87]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness [FAIL]
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness [1 ms]
  Error Message:
   System.ObjectDisposedException : Cannot access a disposed object.
Object name: 'IServiceProvider'.
  Stack Trace:
     at Microsoft.Extensions.DependencyInjection.ServiceLookup.ThrowHelper.ThrowObjectDisposedException()
   at Microsoft.Extensions.DependencyInjection.ServiceProvider.GetService(ServiceIdentifier serviceIdentifier, ServiceProviderEngineScope serviceProviderEngineScope)
   at Microsoft.Extensions.DependencyInjection.ServiceProvider.GetService(Type serviceType)
   at Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService(IServiceProvider provider, Type serviceType)
   at Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService[T](IServiceProvider provider)
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 157
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 157
--- End of stack trace from previous location ---

Failed!  - Failed:     2, Passed:    23, Skipped:     0, Total:    25, Duration: 704 ms - PenguinLauncher.Tests.dll (net10.0)
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

Passed!  - Failed:     0, Passed:    25, Skipped:     0, Total:    25, Duration: 688 ms - PenguinLauncher.Tests.dll (net10.0)
Native exit code: 0
```
