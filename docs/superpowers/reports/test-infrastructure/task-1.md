# Task 1 implementation report

Status: DONE (implementer verification complete; independent review remains the controller's gate).

Commit: `4ba808bf76ec9bc878a8838a08cca14c5b918848`

Subject: `test: characterize backend parser and JSON contracts`

Workspace: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`

Branch: `improvement/production-hardening`

## Scope and files

Committed exactly six files (236 insertions):

- `PenguinLauncher.sln`: test project and Debug/Release solution discovery.
- `tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj`: net10.0 test library with approved exact dependency versions.
- `tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectory.cs`: unique synthetic fixture roots and containment/reparse validation before deletion.
- `tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectoryTests.cs`: independent-root cleanup test.
- `tests/PenguinLauncher.Tests/Helpers/VdfParserTests.cs`: four characterizations against the real existing parser.
- `tests/PenguinLauncher.Tests/Models/JsonContractTests.cs`: four DTO contract tests with explicit web JSON options and string enum conversion.

No runtime source changes, package upgrades, application entry-point invocation, launcher inspection, credential access, network test fixtures, or subprocess test fixtures. No subagents/reviewers dispatched. This report is local execution evidence, intentionally outside the focused commit.

## Red/green helper evidence

Wrote `Dispose_RemovesOnlyItsOwnedRoot` before implementing the helper. Added only a compilable helper shell with a constructor throwing `NotImplementedException`.

Executed:

`dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~TemporaryDirectoryTests --verbosity normal`

Red: exit **1**, **1 discovered / 1 failed**, `System.NotImplementedException` from `TemporaryDirectory..ctor()` at shell line 7, reached from the test at line 10. Compilation succeeded with zero compiler warnings/errors; the failure represented the explicitly required missing implementation.

Implemented the helper, then ran the same command. Green: exit **0**, **1 discovered / 1 passed / 0 failed**, zero warnings/errors. After the final library configuration change, repeated the same command: exit **0**, **1 passed / 0 failed**.

The test writes synthetic files to two independent GUID roots, disposes the first, asserts its removal, and checks that the second file remains with literal content `synthetic second`. Its using declarations exercise repeated disposal of the first root and eventual cleanup of the second root.

## Characterization and runner probe evidence

The parser/DTO tests characterize existing approved behavior and passed immediately as permitted; no product bug or production behavior change was made.

Temporarily changed the first nested-parser assertion's literal expected value from `alice` to `runner-probe-wrong`. Executed:

`dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~VdfParserTests --verbosity normal`

Probe: exit **1**, **4 discovered / 3 passed / 1 failed**. Named failure: `Parse_PreservesNestedSiblingsAndIgnoresLookupCase`; diagnostic `Assert.Equal() Failure: Strings differ`, expected `runner-probe-wrong`, actual `alice`. Restored the correct literal with apply_patch. Repeated the probe after the final library-output configuration, again observing exit **1**, **3 passed / 1 failed**, the same diagnostic, and restored it again before final verification and commit. This is runner validation, not a bug regression or committed expectation.

## Unexpected configuration diagnosis

Property inspection initially showed `OutputType=Exe` despite the authored `OutputType=Library`. Read systematic-debugging before changing configuration. Traced the cause with:

`rg -n 'OutputType|GenerateProgramFile|TestingPlatform' C:/Users/Yzn/.nuget/packages/microsoft.net.test.sdk/17.14.1`

and read the complete `build/net8.0/Microsoft.NET.Test.Sdk.targets`. That imported target sets `OutputType=Exe` at line 21 and defaults `GenerateProgramFile=true` at line 34 after the normal implicit SDK import order.

Single scoped fix: explicit `Sdk.props` / `Sdk.targets` imports, `GenerateProgramFile=false`, and final `OutputType=Library` after `Sdk.targets`. Controller explicitly confirmed this scoped configuration correction. No dependency version or runtime project changed.

Before query (exit 0):

`dotnet msbuild tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj -getProperty:TargetFramework,OutputType,IsTestProject,IsPackable,Nullable,ImplicitUsings,PublishSingleFile,SelfContained,IncludeNativeLibrariesForSelfExtract,EnableCompressionInSingleFile`

After query (exit 0):

`dotnet msbuild tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj -getProperty:TargetFramework,OutputType,IsTestProject,IsPackable,Nullable,ImplicitUsings,GenerateProgramFile,PublishSingleFile,SelfContained,IncludeNativeLibrariesForSelfExtract,EnableCompressionInSingleFile`

Final evaluation: TargetFramework `net10.0`, OutputType `Library`, IsTestProject `true`, IsPackable `false`, Nullable/ImplicitUsings `enable`, GenerateProgramFile `false`. Application publish properties were empty: PublishSingleFile, SelfContained, IncludeNativeLibrariesForSelfExtract, EnableCompressionInSingleFile. VSTest discovery, failure reporting, complete Debug suite, Release build, and Release suite all worked with that final configuration.

## Commands, exits, counts

All commands below ran in the stated isolated workspace. Build/test commands ran sequentially.

| Command | Invocations/results |
| --- | --- |
| `dotnet restore PenguinLauncher.sln` | Exit 0; new test project restored, production project up to date. |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~TemporaryDirectoryTests --verbosity normal` | Shell red: exit 1, 1 failed. Implemented green: exit 0, 1 passed. Final-library repeat: exit 0, 1 passed. |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~VdfParserTests --verbosity normal` | Initial characterization exit 0, 4 passed. First probe exit 1, 3 passed/1 failed. Restored exit 0, 4 passed. Final-library probe exit 1, 3 passed/1 failed. Final restored exit 0, 4 passed. |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --filter FullyQualifiedName~JsonContractTests --verbosity normal` | Before and after library fix: each exit 0, 4 passed, 0 failed. |
| `dotnet test PenguinLauncher.sln --verbosity normal` | Before and after library fix: each exit 0, 9 discovered/passed, 0 failed. Final run total time 0.8985 seconds. |
| `dotnet build tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --configuration Release --verbosity minimal` | Exit 0, zero warnings/errors; production project and test library built. |
| `dotnet test tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --configuration Release --no-build --no-restore --verbosity normal` | Exit 0, 9 discovered/passed, 0 failed; test time 1.4342 seconds. |
| `dotnet list tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj package` | Exit 0; requested/resolved versions exactly Test.Sdk 17.14.1, xunit 2.9.3, runner 3.1.5, TestHost 10.0.12. |
| `git diff --check` | Exit 0 before staging and before commit. |
| `git diff --cached --check` | Exit 0, no whitespace diagnostics. |
| `dotnet format whitespace tests/PenguinLauncher.Tests/PenguinLauncher.Tests.csproj --verify-no-changes --no-restore --include tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectory.cs tests/PenguinLauncher.Tests/Fixtures/TemporaryDirectoryTests.cs tests/PenguinLauncher.Tests/Helpers/VdfParserTests.cs tests/PenguinLauncher.Tests/Models/JsonContractTests.cs --verbosity minimal` | Exit 0, no diagnostics; focused authored test-file formatting check requested by controller. |
| `git diff --name-only -- src` and `git diff --cached --name-only -- src` | Empty output, no runtime source changes. |
| `git diff HEAD^ HEAD --name-only -- src` | Empty output after commit. |
| `git -c user.name=Codex -c user.email=codex@openai.com commit -m "test: characterize backend parser and JSON contracts"` | Exit 0; six scoped files committed with per-command identity. |
| `git log -1 --format='%H%n%s'` and `git status --short` | Exit 0; expected SHA/subject and clean tracked worktree after commit. |

Some normal-verbosity test output was filtered in PowerShell to keep compiler command lines out of tool output. The underlying dotnet command and exit were preserved using `exit $LASTEXITCODE`. The initial parser characterization used `| Select-Object -Last 50; exit $LASTEXITCODE`. Probe commands used `| Select-String -Pattern 'FAIL|Failed Penguin|Passed |Expected:|Actual:|Assert.Equal|Total tests:|     Passed:|     Failed:|Warning\(s\)|Error\(s\)|Test Run'; exit $LASTEXITCODE` (the first probe also matched generic `Failed ` and omitted pass-count selectors). Final helper/parser focused runs used `| Select-String -Pattern 'Passed |Failed Penguin|Total tests:|     Passed:|     Failed:|Warning\(s\)|Error\(s\)|Test Run'; exit $LASTEXITCODE`. DTO, complete solution, and Release test outputs were inspected unfiltered.

All successful test/build commands reported zero warnings/errors. Normal SDK diagnostics mention falling back from prune-package data to targeting packs; this succeeded and was not a build warning. Git emitted ordinary LF-to-CRLF normalization warnings when staging; diff checks were clean. No unexpected test failures occurred. The initial read-only `rg --files` search returned 1 because there were no matching AGENTS/test/global configuration files. Existing whole-solution formatter/advisory baselines were not rerun or changed in this backend-only task; focused test-file whitespace verification passed. Frontend and full matrix checks remain later task scope.

## Mutation targets (hand-derived literal expectations)

| Test | Meaningful change caught |
| --- | --- |
| `Parse_PreservesNestedSiblingsAndIgnoresLookupCase` | Wrong stack pop attaching user 202 beneath user 101, wrong sibling value, changed comparer to case-sensitive, or non-null missing-key result. |
| `Parse_ReadsTopLevelKeyValue` | Dropped root key/value pair or wrong value token assignment. |
| `Serialize_ParseRoundTrip_PreservesSupportedValues` | Serializer drops one sibling, changes a leaf value, or emits braces that move either leaf to the wrong section. |
| `ParseFile_ReadsOnlySyntheticFixture` | ParseFile ignores the supplied fixture path, fails to read its contents, or returns an empty/default tree. |
| `Game_DtoContract_UsesCamelCaseAndStringPlatform` | Dropped/renamed platformGameId, account IDs or installation field; numeric enum output instead of Steam; wrong enum/account/identifier value. |
| `LaunchRequest_DtoContract_SerializesIdentifiers` | Dropped/renamed/swapped gameId or accountId in the DTO JSON contract. |
| `LaunchRequest_DtoContract_DeserializesCamelCaseIdentifiers` | Changed/ignored DTO identifier binding causing literal camel-case request identifiers to be lost or swapped. |
| `LaunchResult_DtoContract_SerializesOutcome` | Dropped/renamed/inverted success or accountSwapped fields, or omitted/incorrect message payload. |
| `Dispose_RemovesOnlyItsOwnedRoot` | Test-helper cleanup deletes the shared parent/another root, fails to remove its own root, or uses a shared root rather than independent GUID roots. This is a test-only helper mutation, not a runtime product mutation. |

## Self-review and limitations

Read the brief, binding context, approved design, TDD skill and writing-good-tests reference before authoring tests. Used systematic-debugging on the import-order finding and verification-before-completion before final verification and commit. Literal expectations are independent of production helpers; the round trip asserts each literal name independently rather than serializer formatting. DTO class documentation and test names explicitly identify DTO contracts, not Program.Main wiring.

Fixture paths are full paths under `Path.GetTempPath()/PenguinLauncher.Tests/<guid>`. Disposal accepts only a GUID-named direct child, rejecting the parent and traversal/outside targets before recursion. It rejects a reparse-point parent, root, files, and nested directories. Every directory is checked before enumeration; enumeration is nonrecursive until the child has passed its attribute check. All files created by tests are synthetic and inside RootPath. Cleanup intentionally leaves the shared fixture parent.

No known blocking concerns. The cleanup test proves normal ownership/isolation and repeated disposal; it does not simulate adversarial concurrent filesystem replacement or separately automate reparse-point creation. Reparse rejection and pre-enumeration ordering were inspected in self-review. The helper is for controlled synthetic test fixtures, not a general-purpose filesystem security boundary. Independent review is still required by the controller before task 2.
