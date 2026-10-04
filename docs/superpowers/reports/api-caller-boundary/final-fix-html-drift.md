# Generated HTML newline drift and final whitespace check

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.

The full serial matrix initially returned git diff --check native exit2 for generated wwwroot/index.html CR/LF drift after npm build. Read-only comparison returned `HTML content equal ignoring CR/LF: True`; numstat was14 added/14 removed, with no bundle content diff. Restored exact committed HTML through apply_patch. A subsequent git diff --numstat -- src/PenguinLauncher/wwwroot had no output. No UI runtime or asset content change remains.

Command: `git diff --check`.
Native exit: 0.

```text
warning: in the working copy of 'src/PenguinLauncher/Hosting/LocalApiBoundary.cs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/PenguinLauncher/Hosting/LocalApiHost.cs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/PenguinLauncher/wwwroot/index.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/PenguinLauncher.Tests/Fixtures/ApiBoundaryFixture.cs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/PenguinLauncher.Tests/Hosting/LocalApiBoundaryTests.cs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/PenguinLauncher.Tests/Hosting/LocalApiHostTests.cs', LF will be replaced by CRLF the next time Git touches it
Native exit code: 0
```
