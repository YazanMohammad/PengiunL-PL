# Task 2 verification: dotnet-vulnerable

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`
Command: `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive`
Native exit: 0

```text
  Determining projects to restore...
  All projects are up-to-date for restore.

The following sources were used:
   https://api.nuget.org/v3/index.json

The given project `PenguinLauncher` has no vulnerable packages given the current sources.
The given project `PenguinLauncher.Tests` has no vulnerable packages given the current sources.
NATIVE_EXIT_CODE=0

```
