# Task 1 verification — red stage 1

## Red stage 2 and green

The expanded table suite ran against the same compiling shells before any policy implementation: native exit 1; 112 total, 111 failed and 1 passed. Failures are intended `NotImplementedException` from policy creation, `Assert.Throws` expecting `ArgumentException`, plus mode equality failures. Compilation completed with zero warnings/errors. Full output: `task-1-logs/red-stage-2.log`.

After implementation, the identical focused command exited 0: 112/112 tests passed; zero build warnings/errors. Full output: `task-1-logs/green-focused.log`.

## Complete task gate

All commands were run serially; native program exits were captured immediately from `$LASTEXITCODE`, separately from pipeline status. Root means `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`. UI means `Root/src/penguinlauncher-ui`. Full outputs reside in `task-1-logs/` beside this document. Generated logs are normalized to UTF-8, LF, stripped trailing whitespace and surplus terminal blank lines; all substantive content is preserved.

| Cwd | Command | Native exit | Result | Full output |
| --- | --- | ---: | --- | --- |
| Root | `dotnet test PenguinLauncher.sln --verbosity minimal` | 0 | 176 passed: 64 baseline + 112 policy | `task-1-logs/backend-test.log` |
| UI | `npm test` | 0 | 19 passed in 3 files | `task-1-logs/frontend-test.log` |
| UI | `npm run typecheck` | 0 | Both TypeScript configurations passed | `task-1-logs/frontend-typecheck.log` |
| UI | `npm run build` | 0 | 1987 modules; frontend build passed | `task-1-logs/frontend-build.log` |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | 0 | Build passed, 0 warnings/errors | `task-1-logs/backend-release-build.log` |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | 2 | 233 existing WHITESPACE diagnostics in Program/LaunchManagerService; none in task files | `task-1-logs/formatter.log` |
| UI | `npm ls --all` | 0 | Dependency inventory complete | `task-1-logs/npm-inventory.log` |
| UI | `npm audit --json` | 1 | 9 package entries: 6 high + 3 moderate | `task-1-logs/npm-audit.log` |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | 0 | No vulnerable packages in either project | `task-1-logs/nuget-audit.log` |
| Root | `git diff --check` (initial) | 2 | Known generated HTML CR newline drift | `task-1-logs/diff-check.log` |
| Root | `git diff --check` (after HTML content restoration) | 0 | Clean; Git line-ending conversion warning only | `task-1-logs/diff-check-final.log` |
| Root | `git diff --cached --check` (full staged evidence) | 0 | Clean after evidence whitespace normalization | `task-1-logs/staged-diff-check.log` |

The first staged evidence check returned 2 for four surplus final blank lines in command logs; removing only terminal blank lines made the same check pass. Source formatting and behavior were unchanged.

Frontend-build HTML content was verified equal to HEAD after removal of carriage returns, then restored with apply_patch; the generated HTML has no remaining diff. The advisory package entries are `@vitest/mocker`, `braces`, `chokidar`, `esbuild`, `fast-glob`, `micromatch`, `tailwindcss`, `vite`, and `vitest`; unchanged dependency files establish no introduced dependency change. Vitest remains run-only; no API/browser serving was started.


## Complete red stage 1 output

Before production implementation; throwing/no-op shells compile. Initial run native exit 1, 6 failed/1 passed; its compiler invocation output exceeded tool capture, so the identical command was repeated before implementation for complete evidence below.

Command: `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~ApiSessionPolicyTests --verbosity normal`
Cwd: repository root. Native exit: 1

```text
Build started 10/3/2026 9:06:53 PM.
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" on node 1 (Restore target(s)).
     1>ValidateSolutionConfiguration:
         Building solution configuration "Debug|Any CPU".
       _GetAllRestoreProjectPathItems:
         Determining projects to restore...
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (1) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj" (2:6) on node 1 (_GenerateProjectRestoreGraph target(s)).
     2>AddPrunePackageReferences:
         Loading prune package data from PrunePackageData folder
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12
     1>Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (1) is building "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (3:5) on node 2 (_GenerateProjectRestoreGraph target(s)).
     3>AddPrunePackageReferences:
         Loading prune package data from PrunePackageData folder
     2>AddPrunePackageReferences:
         Found package overrides file C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12\data\PackageOverrides.txt
     3>AddPrunePackageReferences:
         Failed to load prune package data from PrunePackageData folder, loading from targeting packs instead
         Looking for targeting packs in C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref
         Pack directories found: C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\10.0.12
     2>AddPrunePackageReferences:
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
         Assets file has not changed. Skipping assets file writing. Path: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\obj\project.assets.json
         Assets file has not changed. Skipping assets file writing. Path: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\project.assets.json
         Restored C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\PenguinLauncher.csproj (in 36 ms).
         Restored C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj (in 36 ms).

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
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\lnqzgn1mbp-{0}-6byv19m0yg-6byv19m0yg.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\assets\index-7ftwbyUw.css'.
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l6wybhg6ni-{0}-w004cgnuiw-w004cgnuiw.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\assets\index-Chg6bpHi.js'.
         Accepted compressed asset 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l4kv3fc4ve-{0}-jwp71bwugs-jwp71bwugs.gz' for 'C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\wwwroot\index.html'.
         Resolved 3 compressed assets for 3 candidate assets.
       ResolveBuildCompressedStaticWebAssets:
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\lnqzgn1mbp-{0}-6byv19m0yg-6byv19m0yg.gz
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l6wybhg6ni-{0}-w004cgnuiw-w004cgnuiw.gz
         Processing compressed asset: C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\obj\Debug\net10.0\win-x64\compressed\l4kv3fc4ve-{0}-jwp71bwugs-jwp71bwugs.gz
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
[xUnit.net 00:00:00.06]   Discovering: PenguinLauncher.Tests
[xUnit.net 00:00:00.10]   Discovered:  PenguinLauncher.Tests
[xUnit.net 00:00:00.12]   Starting:    PenguinLauncher.Tests
[xUnit.net 00:00:00.16]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_AcceptsItsCredentialAndRejectsAnotherProcess [FAIL]
[xUnit.net 00:00:00.16]       System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.16]       Stack Trace:
[xUnit.net 00:00:00.16]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs(8,0): at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin)
[xUnit.net 00:00:00.16]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(46,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_AcceptsItsCredentialAndRejectsAnotherProcess()
[xUnit.net 00:00:00.16]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.16]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.Policy_ToStringDoesNotDiscloseCredential [FAIL][xUnit.net 00:00:00.17]       System.NotImplementedException : The method or operation is not implemented.

[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs(8,0): at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin)
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(65,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.Policy_ToStringDoesNotDiscloseCredential()
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicies_CreateDifferentCanonicalBootstrapCredentials [FAIL][xUnit.net 00:00:00.17]       System.NotImplementedException : The method or operation is not implemented.

[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs(8,0): at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin)
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(27,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicies_CreateDifferentCanonicalBootstrapCredentials()
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ServerOnlyFlag_SelectsServerOnly [FAIL]
[xUnit.net 00:00:00.17]       Assert.Equal() Failure: Values differ
[xUnit.net 00:00:00.17]       Expected: ServerOnly
[xUnit.net 00:00:00.17]       Actual:   Desktop
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(21,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ServerOnlyFlag_SelectsServerOnly()
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_DoesNotAdoptConfiguredToken [FAIL]
[xUnit.net 00:00:00.17]       System.NotImplementedException : The method or operation is not implemented.
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs(8,0): at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin)
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(56,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_DoesNotAdoptConfiguredToken()
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]     PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ScanOnly_TakesPrecedence [FAIL]
[xUnit.net 00:00:00.17]       Assert.Equal() Failure: Values differ
[xUnit.net 00:00:00.17]       Expected: ScanOnly
[xUnit.net 00:00:00.17]       Actual:   Desktop
[xUnit.net 00:00:00.17]       Stack Trace:
[xUnit.net 00:00:00.17]         C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs(13,0): at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ScanOnly_TakesPrecedence()
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
[xUnit.net 00:00:00.17]            at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
[xUnit.net 00:00:00.17]   Finished:    PenguinLauncher.Tests
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_AcceptsItsCredentialAndRejectsAnotherProcess [3 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs:line 8
   at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_AcceptsItsCredentialAndRejectsAnotherProcess() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 46
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Passed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.EmptyArguments_SelectDesktop [4 ms]
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.Policy_ToStringDoesNotDiscloseCredential [< 1 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs:line 8
   at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.Policy_ToStringDoesNotDiscloseCredential() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 65
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicies_CreateDifferentCanonicalBootstrapCredentials [< 1 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs:line 8
   at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicies_CreateDifferentCanonicalBootstrapCredentials() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 27
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ServerOnlyFlag_SelectsServerOnly [1 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: ServerOnly
Actual:   Desktop
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ServerOnlyFlag_SelectsServerOnly() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 21
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_DoesNotAdoptConfiguredToken [< 1 ms]
  Error Message:
   System.NotImplementedException : The method or operation is not implemented.
  Stack Trace:
     at PenguinLauncher.Hosting.ApiSessionPolicy.Create(Boolean serverOnly, Boolean isDevelopment, String configuredToken, String developmentOrigin) in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\Hosting\ApiSessionPolicy.cs:line 8
   at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.DesktopPolicy_DoesNotAdoptConfiguredToken() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 56
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)
  Failed PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ScanOnly_TakesPrecedence [< 1 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: ScanOnly
Actual:   Desktop
  Stack Trace:
     at PenguinLauncher.Tests.Hosting.ApiSessionPolicyTests.ScanOnly_TakesPrecedence() in C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\Hosting\ApiSessionPolicyTests.cs:line 13
   at System.Reflection.MethodBaseInvoker.InterpretedInvoke_Method(Object obj, IntPtr* args)
   at System.Reflection.MethodBaseInvoker.InvokeWithNoArgs(Object obj, BindingFlags invokeAttr)

Test Run Failed.
Total tests: 7
     Passed: 1
     Failed: 6
 Total time: 0.5427 Seconds
       _VSTestConsole:
         MSB4181: The "VSTestTask" task returned false but did not log an error.
     3>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\PenguinLauncher.Tests.csproj" (VSTest target(s)) -- FAILED.
     1>Done Building Project "C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\PenguinLauncher.sln" (VSTest target(s)) -- FAILED.

Build FAILED.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:02.19
NATIVE_EXIT=1

```
