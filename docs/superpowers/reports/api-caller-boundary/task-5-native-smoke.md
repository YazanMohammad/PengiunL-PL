# Task 5 native smoke: unavailable

Date: 2026-10-04. Worktree: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.

The plan-owned `native-smoke-investigation.md` establishes that the installed
Photino.NET 3.2.3 source exposes SetTemporaryFilesPath, and that its managed
logging honors LogVerbosity below 1. It does not establish that the native
Windows implementation isolates the webview profile/backing session data at
that path. The available computer-use surface does not provide native GUI
control. These conditions do not safely support an isolated synthetic-only
native smoke run.

No native window or Photino assembly was instantiated, no Program.Main was run,
and no vendor service/profile, AppData, or existing listener was touched. No
listener was bound or probed by automated tests. In particular, no occupied
port was terminated or reused for a smoke test.

| Required native case | Actual evidence |
| --- | --- |
| Initial private fragment bootstrap | Unavailable; only managed callback URI delivery and jsdom bootstrap behavior verified |
| Same-window reload/sessionStorage | Unavailable in Photino; jsdom evidence is not a native runtime claim |
| Close/reopen with a new credential | Unavailable in Photino; immutable policy/random per-process generation covered separately |
| Occupied-port failure before window/readiness | Actual occupied-port native run unavailable; throwing IServer startup failure tests prove callbacks are suppressed without touching an existing listener |

Program source review confirms `[STAThread]`, synchronous StartDesktop startup,
Photino construction and WaitForClose inside its calling-thread callback,
SetDevToolsEnabled from the callback flag, and SetLogVerbosity(0) before the
credential-bearing Load. Managed TestServer tests exercise an asynchronous
startup gate and verify the callback remains on its original Windows STA
thread after ApplicationStarted; Development and Production are both covered.
These tests validate the host contract, not webview delivery.

This is an explicit operational acceptance gap for independent/controller
review. Do not substitute automated jsdom claims for these missing native
cases. A future smoke requires verification of actual native profile isolation,
a synthetic-only host, and GUI control; broad host lifecycle and recovery remain
project 7, and general exception-response redaction remains project 2b/M3.
