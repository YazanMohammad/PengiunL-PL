# Task 5 RED evidence

Before host implementation; minimal compilable shells: policy returns null, loopback configuration is a no-op, startup methods throw NotImplementedException, diagnostics serialize the error. Synthetic credentials below are test fixtures only.

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening
Command: `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiHostTests --verbosity normal`
Native exit: 1
Discovered: 22; passed: 1; failed: 21. Scan-only already returns null. Other failures prove missing policy/configuration, readiness execution, and secret-free diagnostics. Recording transport opened no sockets.

Complete output (incremental no-source-change repetition avoids enormous compiler command lines):

```text
Build started 10/4/2026 1:29:54 AM.
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" on node 1 (Restore target(s)).
     1>ValidateSolutionConfiguration:
         Building solution configuration "Debug|Any CPU".
       _GetAllRestoreProjectPathItems:
         Determining projects to restore...
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (1) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj" (2:6) on node 1 (_GenerateProjectRestoreGraph target(s)).
     2>AddPrunePackageReferences:
         Loading prune package data from PrunePackageData folder
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (1) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:5) on node 2 (_GenerateProjectRestoreGraph target(s)).
     3>AddPrunePackageReferences:
         Loading prune package data from PrunePackageData folder
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
     2>AddPrunePackageReferences:
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12
     3>AddPrunePackageReferences:
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12
     2>AddPrunePackageReferences:
         Found package overrides file C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12\data\PackageOverrides.txt
         Loading prune package data from PrunePackageData folder
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\10.0.12
         Found package overrides file C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\10.0.12\data\PackageOverrides.txt
     3>AddPrunePackageReferences:
         Found package overrides file C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12\data\PackageOverrides.txt
         Loading prune package data from PrunePackageData folder
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\10.0.12
         Found package overrides file C:\Program Files\dotnet\packs\Microsoft.AspNetCore.App.Ref\10.0.12\data\PackageOverrides.txt
     2>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj" (_GenerateProjectRestoreGraph target(s)).
     3>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (_GenerateProjectRestoreGraph target(s)).
     1>Restore:
         X.509 certificate chain validation will use the default trust store selected by .NET for code signing.
         X.509 certificate chain validation will use the default trust store selected by .NET for timestamping.
         Assets file has not changed. Skipping assets file writing. Path: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\project.assets.json
         Assets file has not changed. Skipping assets file writing. Path: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\obj\project.assets.json
         Restored C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj (in 33 ms).
         Restored C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj (in 33 ms).

         NuGet Config files used:
             C:\Users\Yzn\AppData\Roaming\NuGet\NuGet.Config

         Feeds used:
             https://api.nuget.org/v3/index.json
         All projects are up-to-date for restore.
     1>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (Restore target(s)).
   1:2>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" on node 1 (VSTest target(s)).
     1>ValidateSolutionConfiguration:
         Building solution configuration "Debug|Any CPU".
   1:2>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (1:2) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:6) on node 2 (VSTest target(s)).
     3>BuildProject:
         Build started, please wait...
   3:6>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:6) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:7) on node 2 (default targets).
   3:7>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:7) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj" (2:9) on node 1 (default targets).
     2>GenerateTargetFrameworkMonikerAttribute:
       Skipping target "GenerateTargetFrameworkMonikerAttribute" because all output files are up-to-date with respect to the input files.
       CoreGenerateAssemblyInfo:
       Skipping target "CoreGenerateAssemblyInfo" because all output files are up-to-date with respect to the input files.
       _GenerateSourceLinkFile:
         Source Link is empty, file 'obj\Debug\net10.0\win-x64\PenguinLauncher.sourcelink.json' does not exist.
       CoreCompile:
       Skipping target "CoreCompile" because all output files are up-to-date with respect to the input files.
       _CreateAppHost:
       Skipping target "_CreateAppHost" because all output files are up-to-date with respect to the input files.
       _ProcessScopedCssFiles:
       Skipping target "_ProcessScopedCssFiles" because it has no outputs.
       _ProcessScopedCssFiles:
       Skipping target "_ProcessScopedCssFiles" because it has no outputs.
       ResolveBuildCompressedStaticWebAssetsConfiguration:
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\tulyjo88ah-{0}-s8v4l7cpoi-s8v4l7cpoi.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\assets\index-D9HK_ItX.css'.
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\klps2t0mjh-{0}-y34949yzza-y34949yzza.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\assets\index-DNZ_BUpz.js'.
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l4kv3fc4ve-{0}-8fkmr79u10-8fkmr79u10.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\index.html'.
         Resolved 3 compressed assets for 3 candidate assets.
       ResolveBuildCompressedStaticWebAssets:
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\tulyjo88ah-{0}-s8v4l7cpoi-s8v4l7cpoi.gz
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\klps2t0mjh-{0}-y34949yzza-y34949yzza.gz
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l4kv3fc4ve-{0}-8fkmr79u10-8fkmr79u10.gz
       _BuildCopyStaticWebAssetsPreserveNewest:
       Skipping target "_BuildCopyStaticWebAssetsPreserveNewest" because it has no outputs.
       _CopyOutOfDateSourceItemsToOutputDirectory:
       Skipping target "_CopyOutOfDateSourceItemsToOutputDirectory" because all output files are up-to-date with respect to the input files.
       GenerateBuildDependencyFile:
       Skipping target "GenerateBuildDependencyFile" because all output files are up-to-date with respect to the input files.
       GenerateBuildRuntimeConfigurationFiles:
       Skipping target "GenerateBuildRuntimeConfigurationFiles" because all output files are up-to-date with respect to the input files.
       CopyFilesToOutputDirectory:
         PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
     2>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj" (default targets).
     3>GenerateTargetFrameworkMonikerAttribute:
       Skipping target "GenerateTargetFrameworkMonikerAttribute" because all output files are up-to-date with respect to the input files.
       CoreGenerateAssemblyInfo:
       Skipping target "CoreGenerateAssemblyInfo" because all output files are up-to-date with respect to the input files.
       _GenerateSourceLinkFile:
         Source Link is empty, file 'obj\Debug\net10.0\PenguinLauncher.Tests.sourcelink.json' does not exist.
       CoreCompile:
       Skipping target "CoreCompile" because all output files are up-to-date with respect to the input files.
       _CopyOutOfDateSourceItemsToOutputDirectory:
       Skipping target "_CopyOutOfDateSourceItemsToOutputDirectory" because all output files are up-to-date with respect to the input files.
       GenerateBuildDependencyFile:
       Skipping target "GenerateBuildDependencyFile" because all output files are up-to-date with respect to the input files.
       GenerateBuildRuntimeConfigurationFiles:
       Skipping target "GenerateBuildRuntimeConfigurationFiles" because all output files are up-to-date with respect to the input files.
       CopyFilesToOutputDirectory:
         PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
     3>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (default targets).
     3>BuildProject:
         Build completed.

Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.
[xUnit.net 00:00:00.00] xUnit.net VSTest Adapter v3.1.5+1b188a7b0a (64-bit .NET 10.0.12)
[xUnit.net 00:00:00.05]   Discovering: PenguinLauncher.Tests
[xUnit.net 00:00:00.11]   Discovered:  PenguinLauncher.Tests
[xUnit.net 00:00:00.13]   Starting:    PenguinLauncher.Tests
[xUnit.net 00:00:00.16]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_GeneratesFreshCredentialDespiteConfiguredToken [FAIL]
[xUnit.net 00:00:00.16]       Assert.NotNull() Failure: Value is null
[xUnit.net 00:00:00.16]       Stack Trace:
[xUnit.net 00:00:00.16]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(52,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_GeneratesFreshCredentialDespiteConfiguredToken()
[xUnit.net 00:00:00.16]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.16]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "evil.example:5100", authenticated:[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null True, status: 200) [FAIL]

[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://evil.example:5173", forwardedHost: "localhost:5100", authenticated:[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null True, status: 403) [FAIL]

[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "evil.example:5100", authenticated: False, status: 401) [FAIL]
[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5173", authenticated: True, status: 200) [FAIL]
[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "evil.example:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5100", authenticated:[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null True, status: 403) [FAIL]

[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: False, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5100", authenticated: True, status: 403) [FAIL]
[xUnit.net 00:00:00.17]       Assert.NotNull() Failure: Value is null
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(187,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status)
[xUnit.net 00:00:00.17]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.23]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown [FAIL][xUnit.net 00:00:00.23]       System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.23]       Stack Trace:

[xUnit.net 00:00:00.23]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs(14,0): at PenguinLauncher.Hosting.LocalApiHost.RunServerAsync(WebApplication app, Action announceReady, CancellationToken cancellationToken)
[xUnit.net 00:00:00.23]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(123,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown()
[xUnit.net 00:00:00.23]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(145,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown()
[xUnit.net 00:00:00.23]         --- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_GeneratesFreshCredentialDespiteConfiguredToken [2 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_GeneratesFreshCredentialDespiteConfiguredToken() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 52
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "evil.example:5100", authenticated: True, status: 200) [1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://evil.example:5173", forwardedHost: "localhost:5100", authenticated: True, status: 403) [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "evil.example:5100", authenticated: False, status: 401) [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5173", authenticated: True, status: 200) [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: True, host: "evil.example:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5100", authenticated: True, status: 403) [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(development: False, host: "localhost:5100", origin: "http://localhost:5173", forwardedHost: "localhost:5100", authenticated: True, status: 403) [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ProxiedBrowser_ValidatesActualHostOriginAndCredential(Boolean development, String host, String origin, String forwardedHost, Boolean authenticated, Int32 status) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 187
--- End of stack trace from previous location ---
  Passed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ScanOnly_DoesNotValidateHttpCredentials [< 1 ms]
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown [70 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.LocalApiHost.RunServerAsync(WebApplication app, Action announceReady, CancellationToken cancellationToken) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs:line 14
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 123
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_AnnouncesOnceAfterStartupAndWaitsForShutdown() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 145
--- End of stack trace from previous location ---
[xUnit.net 00:00:00.25]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: False, token: null, origin: null) [FAIL]
[xUnit.net 00:00:00.25]       Assert.Throws() Failure: No exception was thrown
[xUnit.net 00:00:00.25]       Expected: typeof(System.ArgumentException)
[xUnit.net 00:00:00.25]       Stack Trace:
[xUnit.net 00:00:00.25]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(35,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin)
[xUnit.net 00:00:00.25]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.25]            at System.Reflection.MethodBaseInvoker.InvokeDirectByRefWithFewArgs(Object obj, Span`1 copyOfArgs, BindingFlags invokeAttr)
[xUnit.net 00:00:00.25]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: False, token: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", origin: "http://localhost:5173") [FAIL]
[xUnit.net 00:00:00.25]       Assert.Throws() Failure: No exception was thrown
[xUnit.net 00:00:00.25]       Expected: typeof(System.ArgumentException)
[xUnit.net 00:00:00.25]       Stack Trace:
[xUnit.net 00:00:00.25]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(35,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin)
[xUnit.net 00:00:00.25]            at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
[xUnit.net 00:00:00.25]            at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
[xUnit.net 00:00:00.25]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: True, token: "invalid-token", origin: "http://localhost:5173") [FAIL]
[xUnit.net 00:00:00.25]       Assert.Throws() Failure: No exception was thrown
[xUnit.net 00:00:00.25]       Expected: typeof(System.ArgumentException)
[xUnit.net 00:00:00.25]       Stack Trace:
[xUnit.net 00:00:00.25]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(35,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin)
[xUnit.net 00:00:00.25]            at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
[xUnit.net 00:00:00.25]            at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
[xUnit.net 00:00:00.25]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: Desktop, development: True, token: null, origin: "http://localhost:5173") [FAIL]
[xUnit.net 00:00:00.25]       Assert.Throws() Failure: No exception was thrown
[xUnit.net 00:00:00.25]       Expected: typeof(System.ArgumentException)
[xUnit.net 00:00:00.25]       Stack Trace:
[xUnit.net 00:00:00.25]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(35,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin)
[xUnit.net 00:00:00.25]            at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
[xUnit.net 00:00:00.25]            at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
[xUnit.net 00:00:00.26]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "kestrel-config") [FAIL]
[xUnit.net 00:00:00.26]       Assert.Equal() Failure: Values differ
[xUnit.net 00:00:00.26]       Expected: 2
[xUnit.net 00:00:00.26]       Actual:   1
[xUnit.net 00:00:00.26]       Stack Trace:
[xUnit.net 00:00:00.26]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(259,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints)
[xUnit.net 00:00:00.26]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(238,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.26]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(252,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.26]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(253,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.26]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.27]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "environment-config") [FAIL]
[xUnit.net 00:00:00.27]       Assert.Equal() Failure: Values differ
[xUnit.net 00:00:00.27]       Expected: 2
[xUnit.net 00:00:00.27]       Actual:   3
[xUnit.net 00:00:00.27]       Stack Trace:
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(259,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(238,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(252,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(253,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.27]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "command-line") [FAIL][xUnit.net 00:00:00.27]       Assert.Equal() Failure: Values differ
[xUnit.net 00:00:00.27]       Expected: 2

[xUnit.net 00:00:00.27]       Actual:   1
[xUnit.net 00:00:00.27]       Stack Trace:
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(259,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(238,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(252,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(253,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source)
[xUnit.net 00:00:00.27]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.27]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.StartupDiagnostics_DoNotDiscloseExceptionOrBootstrapCredential [FAIL][xUnit.net 00:00:00.27]       Assert.DoesNotContain() Failure: Sub-string found

[xUnit.net 00:00:00.27]                                       ↓ (pos 89)
[xUnit.net 00:00:00.27]       String: ···"00/#penguin-session=AAAAAAAAAAAAAAAAAAAAA"···
[xUnit.net 00:00:00.27]       Found:  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"···
[xUnit.net 00:00:00.27]       Stack Trace:
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(169,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.StartupDiagnostics_DoNotDiscloseExceptionOrBootstrapCredential()
[xUnit.net 00:00:00.27]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.27]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.27]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.ServerOnly_UsesExplicitCredentialAndDevelopmentOrigin [FAIL][xUnit.net 00:00:00.27]       Assert.NotNull() Failure: Value is null

[xUnit.net 00:00:00.27]       Stack Trace:
[xUnit.net 00:00:00.27]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(42,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ServerOnly_UsesExplicitCredentialAndDevelopmentOrigin()
[xUnit.net 00:00:00.27]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.27]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: False, token: null, origin: null) [1 ms]
  Error Message:
   Assert.Throws() Failure: No exception was thrown
Expected: typeof(System.ArgumentException)
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 35
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeDirectByRefWithFewArgs(Object obj, Span`1 copyOfArgs, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: False, token: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", origin: "http://localhost:5173") [< 1 ms]
  Error Message:
   Assert.Throws() Failure: No exception was thrown
Expected: typeof(System.ArgumentException)
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 35
   at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: ServerOnly, development: True, token: "invalid-token", origin: "http://localhost:5173") [< 1 ms]
  Error Message:
   Assert.Throws() Failure: No exception was thrown
Expected: typeof(System.ArgumentException)
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 35
   at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(mode: Desktop, development: True, token: null, origin: "http://localhost:5173") [< 1 ms]
  Error Message:
   Assert.Throws() Failure: No exception was thrown
Expected: typeof(System.ArgumentException)
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode, Boolean development, String token, String origin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 35
   at InvokeStub_LocalApiHostTests.InvalidHttpConfiguration_FailsBeforeStartup(Object, Span`1)
   at System.Reflection.MethodBaseInvoker.InvokeWithFewArgs(Object obj, BindingFlags invokeAttr, Binder binder, Object[] parameters, CultureInfo culture)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "kestrel-config") [25 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 2
Actual:   1
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 259
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 238
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 252
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 253
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "environment-config") [6 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 2
Actual:   3
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 259
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 238
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 252
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 253
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(source: "command-line") [2 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 2
Actual:   1
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.AssertLoopbackBindings(EndPoint[] endpoints) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 259
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 238
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 252
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.HostConfiguration_CannotAddNonLoopbackBindings(String source) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 253
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.StartupDiagnostics_DoNotDiscloseExceptionOrBootstrapCredential [< 1 ms]
  Error Message:
   Assert.DoesNotContain() Failure: Sub-string found
                                ↓ (pos 89)
String: ···"00/#penguin-session=AAAAAAAAAAAAAAAAAAAAA"···
Found:  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"···
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.StartupDiagnostics_DoNotDiscloseExceptionOrBootstrapCredential() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 169
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.ServerOnly_UsesExplicitCredentialAndDevelopmentOrigin [< 1 ms]
  Error Message:
   Assert.NotNull() Failure: Value is null
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.ServerOnly_UsesExplicitCredentialAndDevelopmentOrigin() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 42
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.28]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow [FAIL]
[xUnit.net 00:00:00.28]       Assert.Throws() Failure: Exception type was not an exact match
[xUnit.net 00:00:00.28]       Expected: typeof(System.InvalidOperationException)
[xUnit.net 00:00:00.28]       Actual:   typeof(System.NotImplementedException)
[xUnit.net 00:00:00.28]       ---- System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.28]       Stack Trace:
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(107,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass7_0.<Desktop_FailedStartupDoesNotLoadWindow>b__0()
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(303,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0()
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(105,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow()
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(112,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow()
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.28]         ----- Inner Stack Trace -----
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs(11,0): at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(107,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass7_0.<Desktop_FailedStartupDoesNotLoadWindow>b__1()
[xUnit.net 00:00:00.28]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(development: False) [FAIL][xUnit.net 00:00:00.28]       System.NotImplementedException : The method or operation is not implemented.

[xUnit.net 00:00:00.28]       Stack Trace:
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs(11,0): at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(71,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass6_1.<Desktop_WaitsForStartupThenLoadsOnCallingStaThread>b__0()
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(303,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0()
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(86,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(97,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(97,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.28]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(development: True) [FAIL]
[xUnit.net 00:00:00.28]       System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.28]       Stack Trace:
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs(11,0): at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(71,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass6_1.<Desktop_WaitsForStartupThenLoadsOnCallingStaThread>b__0()
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(303,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0()
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(86,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(97,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(97,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development)
[xUnit.net 00:00:00.28]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.29]     PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness [FAIL][xUnit.net 00:00:00.29]       Assert.Throws() Failure: Exception type was not an exact match

[xUnit.net 00:00:00.29]       Expected: typeof(System.InvalidOperationException)
[xUnit.net 00:00:00.29]       Actual:   typeof(System.NotImplementedException)
[xUnit.net 00:00:00.29]       ---- System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.29]       Stack Trace:
[xUnit.net 00:00:00.29]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(153,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness()
[xUnit.net 00:00:00.29]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(157,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness()
[xUnit.net 00:00:00.29]         --- End of stack trace from previous location ---
[xUnit.net 00:00:00.29]         ----- Inner Stack Trace -----
[xUnit.net 00:00:00.29]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs(14,0): at PenguinLauncher.Hosting.LocalApiHost.RunServerAsync(WebApplication app, Action announceReady, CancellationToken cancellationToken)
[xUnit.net 00:00:00.29]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs(154,0): at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass9_0.<Server_FailedStartupDoesNotAnnounceReadiness>b__0()
[xUnit.net 00:00:00.29]   Finished:    PenguinLauncher.Tests
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow [5 ms]
  Error Message:
   Assert.Throws() Failure: Exception type was not an exact match
Expected: typeof(System.InvalidOperationException)
Actual:   typeof(System.NotImplementedException)
---- System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass7_0.<Desktop_FailedStartupDoesNotLoadWindow>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 107
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 303
--- End of stack trace from previous location ---
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 105
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_FailedStartupDoesNotLoadWindow() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 112
--- End of stack trace from previous location ---
----- Inner Stack Trace -----
   at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs:line 11
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass7_0.<Desktop_FailedStartupDoesNotLoadWindow>b__1() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 107
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(development: False) [3 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs:line 11
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass6_1.<Desktop_WaitsForStartupThenLoadsOnCallingStaThread>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 71
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 303
--- End of stack trace from previous location ---
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 86
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 97
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 97
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(development: True) [2 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.LocalApiHost.StartDesktop(WebApplication app, ApiSessionPolicy policy, Boolean isDevelopment, Action`2 loadAndWait) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs:line 11
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass6_1.<Desktop_WaitsForStartupThenLoadsOnCallingStaThread>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 71
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass17_0.<OnStaThread>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 303
--- End of stack trace from previous location ---
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 86
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 97
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Desktop_WaitsForStartupThenLoadsOnCallingStaThread(Boolean development) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 97
--- End of stack trace from previous location ---
  Failed PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness [2 ms]
  Error Message:
   Assert.Throws() Failure: Exception type was not an exact match
Expected: typeof(System.InvalidOperationException)
Actual:   typeof(System.NotImplementedException)
---- System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 153
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.Server_FailedStartupDoesNotAnnounceReadiness() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 157
--- End of stack trace from previous location ---
----- Inner Stack Trace -----
   at PenguinLauncher.Hosting.LocalApiHost.RunServerAsync(WebApplication app, Action announceReady, CancellationToken cancellationToken) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\LocalApiHost.cs:line 14
   at PenguinLauncher.Tests.Hosting.LocalApiHostTests.<>c__DisplayClass9_0.<Server_FailedStartupDoesNotAnnounceReadiness>b__0() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\LocalApiHostTests.cs:line 154

Test Run Failed.Total tests: 22

     Passed: 1
     Failed: 21
 Total time: 0.6738 Seconds
       _VSTestConsole:
         MSB4181: The "VSTestTask" task returned false but did not log an error.
     3>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (VSTest target(s)) -- FAILED.
     1>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (VSTest target(s)) -- FAILED.

Build FAILED.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:02.10
NATIVE_EXIT=1
```
