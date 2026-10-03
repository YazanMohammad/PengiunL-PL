# Task 2 verification: diff-check

Cwd: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`
Command: `git diff --check`
Native exit: 2

```text
warning: in the working copy of 'src/PenguinLauncher/wwwroot/assets/index-7ftwbyUw.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/PenguinLauncher/wwwroot/assets/index-Chg6bpHi.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs', LF will be replaced by CRLF the next time Git touches it
src/PenguinLauncher/wwwroot/index.html:1: trailing whitespace.
+<!DOCTYPE html>
src/PenguinLauncher/wwwroot/index.html:2: trailing whitespace.
+<html lang="en">
src/PenguinLauncher/wwwroot/index.html:3: trailing whitespace.
+  <head>
src/PenguinLauncher/wwwroot/index.html:4: trailing whitespace.
+    <meta charset="UTF-8" />
src/PenguinLauncher/wwwroot/index.html:5: trailing whitespace.
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
src/PenguinLauncher/wwwroot/index.html:6: trailing whitespace.
+    <title>Penguin Launcher</title>
src/PenguinLauncher/wwwroot/index.html:7: trailing whitespace.
+    <link rel="preconnect" href="https://fonts.googleapis.com" />
src/PenguinLauncher/wwwroot/index.html:8: trailing whitespace.
+    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
src/PenguinLauncher/wwwroot/index.html:9: trailing whitespace.
+    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
src/PenguinLauncher/wwwroot/index.html:12: trailing whitespace.
+  </head>
src/PenguinLauncher/wwwroot/index.html:13: trailing whitespace.
+  <body class="bg-penguin-bg text-penguin-text font-sans">
src/PenguinLauncher/wwwroot/index.html:14: trailing whitespace.
+    <div id="root"></div>
src/PenguinLauncher/wwwroot/index.html:15: trailing whitespace.
+  </body>
src/PenguinLauncher/wwwroot/index.html:16: trailing whitespace.
+</html>
NATIVE_EXIT_CODE=2

```
