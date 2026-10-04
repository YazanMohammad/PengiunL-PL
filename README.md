# Penguin Launcher

A desktop game-library and account-profile manager built with .NET, Photino, and React. Browse games from multiple launchers in one minimalist dark interface, filter by platform or account, and hand off launches to the appropriate client.

[Download releases](https://github.com/YazanMohammad/PengiunL-PL/releases) · [Report a bug](https://github.com/YazanMohammad/PengiunL-PL/issues) · [Development API guide](docs/development-api.md)

> **Experimental prerelease.** Account switching can stop launcher processes and modify their session/configuration files. Security, persistence, and recovery improvements remain unfinished. Back up your data, save running work, and use test profiles before relying on account operations. This is not a production-ready or independently security-certified application.

## Contents

- [Features](#features)
- [Platform coverage](#platform-coverage)
- [Download and install](#download-and-install)
- [Using the app](#using-the-app)
- [Data, privacy, and security](#data-privacy-and-security)
- [Build and run from source](#build-and-run-from-source)
- [Development and configuration](#development-and-configuration)
- [Tests and verification](#tests-and-verification)
- [Architecture](#architecture)
- [Build a Windows package](#build-a-windows-package)
- [Troubleshooting](#troubleshooting)
- [Known limitations and roadmap](#known-limitations-and-roadmap)
- [Contributing and licensing](#contributing-and-licensing)

## Features

- Unified library with artwork-led grid and compact list views.
- Search by title, platform game ID, or installation path.
- Filters for platform, account, and installation status.
- Name/platform sorting, grid density controls, and incremental loading for large libraries.
- Persistent Play/Install and Details actions; game details include platform, installation, and associated-account information.
- Platform-specific game discovery and manual rescanning.
- Account discovery, capture, manual profiles, display-name aliases, switching, logout, and removal where supported by a platform adapter.
- Account selection and launch preflight when multiple profiles are associated with a game.
- A loopback-only API authenticated with a per-process session credential.

Penguin Launcher does not replace the vendor launchers, grant ownership of games, bypass login/MFA, or guarantee that every title or account can be detected. The Install action hands off to the vendor client; this app is not a standalone download/install engine.

## Platform coverage

These are adapters present in the source, **not a certification of every vendor workflow**:

| Integration | Game discovery | Account/session adapter | Notes |
| --- | --- | --- | --- |
| Steam | Yes | Yes | Uses local Steam libraries, manifests, and account configuration. |
| Riot Games | Yes | Yes | Relies on local Riot client/game configuration and session files. |
| Epic Games | Yes | Yes | Uses launcher manifests/configuration and session backups. |
| EA App | Yes | Yes | Uses local installation/client data and session backups. |
| Linux native | `.desktop` discovery | No dedicated swapper | Source functionality; no Linux download is supplied for this release. |

The `v0.1.0` download targets **Windows x64 only**. Other operating systems and architectures are not release-validated. Vendor updates, custom installation paths, and differing account configurations can affect discovery and switching.

## Download and install

1. Open [GitHub Releases](https://github.com/YazanMohammad/PengiunL-PL/releases) and select the prerelease, including its warnings and verification notes.
2. Download `PenguinLauncher-v0.1.0-win-x64.zip` and `SHA256SUMS.txt`. GitHub's automatic “Source code” archives are not the runnable app.
3. Verify the ZIP against the checksum before extracting:

   ```powershell
   Get-FileHash -Algorithm SHA256 .\PenguinLauncher-v0.1.0-win-x64.zip
   Get-Content .\SHA256SUMS.txt
   ```

   Compare the complete hash; letter case does not matter. A matching checksum checks download integrity, not publisher identity or security.

4. Extract the **whole ZIP** to a writable folder. Keep `wwwroot` beside `PenguinLauncher.exe`; do not move the executable alone or run it inside the ZIP.
5. Run `PenguinLauncher.exe` as your normal Windows user. Administrator privileges are not part of the intended setup.

### Requirements

- A Windows x64 desktop environment; Windows 11 is the recommended testing target. Older Windows versions are not certified by this release.
- [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/). The native window uses a webview; the runtime is a separate system prerequisite, not bundled in this ZIP. See Microsoft's [distribution guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution).
- The relevant vendor clients installed, with legitimate access to the games/accounts you intend to use.
- Port `5100` available on loopback. Run only one Penguin Launcher instance at a time.
- Internet access for vendor services, remote artwork, Google Fonts, and Steam metadata as applicable.

The Windows package is self-contained for .NET: users do not need a separate .NET SDK/runtime installation. WebView2 is still required. The executable is **unsigned**; Windows reputation/signature warnings may occur. Do not disable protection or run an untrusted download merely to get past a warning.

“Portable” describes extraction without an installer. Settings and session backups are stored in your user profile, not beside the executable. There is no automatic updater; download a newer release and extract it into a new folder.

## Using the app

### Library

Launch the native app and allow discovery to finish. Use **Rescan** after installing games or changing client/account configuration. Search and the sidebar filters narrow the library; display settings change sorting and density. Choose grid/list view from the toolbar, and use Load More/Show All when offered.

Click a card/row or **Details** to inspect a game. **Play** uses the existing platform launch workflow. For a title associated with multiple accounts, choose the intended account when prompted. Selecting an account filter can also influence the launch target; check it before playing. **Install** hands off to the platform client and may require its own login or confirmation.

### Profiles and session operations

Open **Accounts** to inspect discovered profiles, filter by platform, rename a display alias, capture a signed-in session, or add a profile manually. A manually added name/ID is not a new vendor login and does not establish game ownership. Capture requires an existing detectable vendor session.

Before capture, switching, logout, or removal:

- Save work and close running games. The implementation can forcibly stop launcher process trees.
- Keep an independent backup of relevant client/session files and `%APPDATA%\PenguinLauncher`.
- Use only trusted, simple platform IDs. Account-ID/path validation and backup containment still need hardening.
- Expect that reauthentication or MFA may be necessary. Saved session material can expire or be invalidated by a vendor.

Removal/logout can affect backups or platform configuration; read the confirmation carefully. The app does not promise transactional rollback or lossless restoration. Do not use it as the only copy of important session data.

## Data, privacy, and security

### Local persistence

On Windows, application state is stored in:

```text
%APPDATA%\PenguinLauncher\state.json
%APPDATA%\PenguinLauncher\backups\<platform>\<account-id>\...
```

State includes discovered games, account records, mappings, and scan information. Riot/Epic/EA adapters can copy sensitive session/configuration material into backups; Steam uses its own account configuration rather than the same explicit session-backup mechanism. The app can also read/write vendor-managed files outside its state directory.

Backups are **not encrypted by this application**. Protect them like credentials: do not commit them, upload them with bug reports, or share them. Close the app and vendor clients before making an independent backup. Deleting the extracted app folder does not delete profile data or undo vendor-file modifications.

### Local API boundary

The backend binds to IPv4/IPv6 loopback on fixed port `5100`. All `/api` requests, including health/system information, require a bearer session credential. Desktop startup generates it and passes it privately to the UI via the initial fragment; the UI removes that fragment and retains the session in memory/sessionStorage for same-window reload.

This boundary is not protection against malware, debuggers, native dependencies, or trusted UI scripts running as the same OS user. Session storage is not encrypted. Do not publish API tokens, place them in `VITE_*` variables, or expose the local server through a public proxy. Opening `http://localhost:5100` in an unrelated browser does not establish the native app's session.

### Network access

The application uses vendor clients/protocol handlers and can fetch Steam title metadata. The UI loads remote cover/background artwork and Google Fonts. It is not a fully offline application; third-party requests are governed by those services. There is no configured cloud synchronization service in this repository.

## Build and run from source

### Developer prerequisites

- Git.
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0).
- Node.js and npm. The recorded verification environment used Node `24.19.0`, npm `11.17.0`, and .NET SDK `10.0.401`; these tools are not pinned by repository configuration.
- Windows x64 and WebView2 for native desktop testing.

From PowerShell:

```powershell
git clone https://github.com/YazanMohammad/PengiunL-PL.git
Set-Location PengiunL-PL

dotnet restore PenguinLauncher.sln
Push-Location src/penguinlauncher-ui
try {
    npm ci
    npm run build
}
finally { Pop-Location }

dotnet run --project src/PenguinLauncher --no-launch-profile
```

Check each command's exit status before proceeding. `npm run build` compiles TypeScript and writes the production UI to `src/PenguinLauncher/wwwroot`, replacing its contents. Run it before launching after UI changes. The backend serves those files, not Vite's source directly.

Some npm configurations require explicit dependency-install script approval. If npm reports a pending `esbuild` installation script and the build fails, review that package/script before granting permission; do not blindly approve all scripts.

## Development and configuration

For hot-reload UI development, use the [authenticated local API development guide](docs/development-api.md). It documents generating a private session token, running a headless Development backend, entering the token into the Vite UI, and cleanup. Starting `npm run dev` alone is not enough to authenticate API requests.

| Setting/mode | Purpose |
| --- | --- |
| Normal startup | Native desktop window with a new per-process session credential. |
| `--server-only` | Headless backend; requires `PENGUIN_SESSION_TOKEN`. |
| `--scan-only` | Scan diagnostic mode with no HTTP listener; takes precedence over server-only. **It still scans real clients and can write state/session backups.** |
| `PENGUIN_SESSION_TOKEN` | Headless credential: canonical unpadded base64url encoding of 32 random bytes; do not reuse/publish it. |
| `DOTNET_ENVIRONMENT` / `ASPNETCORE_ENVIRONMENT` | Hosting environment; native developer tools are enabled only in Development. |
| `PENGUIN_DEV_ORIGIN` | One exact loopback HTTP origin with an explicit non-5100 port, accepted only for server-only Development. |

`--urls`, `ASPNETCORE_URLS`, and configured Kestrel endpoints do not add/change public listeners. The app is not intended for public hosting. See the API guide for exact origin rules, error responses, and restart behavior.

## Tests and verification

Run from the repository root after restoring dependencies:

```powershell
dotnet test PenguinLauncher.sln --no-restore
dotnet build PenguinLauncher.sln -c Release --no-restore
dotnet format PenguinLauncher.sln --verify-no-changes --no-restore

Push-Location src/penguinlauncher-ui
try {
    npm test
    npm run typecheck
    npm run build
    npm audit
}
finally { Pop-Location }
```

Commands are listed individually; a later passing command does not cancel an earlier failure. Current suites use xUnit/TestServer for backend contracts/boundaries and Vitest/Testing Library/jsdom for client/UI behavior. The recorded baseline has 355 backend and 169 frontend tests. There is no dedicated native end-to-end runner or ESLint command configured.

Tests intentionally avoid real launcher mutations. Passing tests do not certify real vendor session operations, native focus/reload, every screen reader, or package operation on another machine. Existing verification records disclose **165 formatter whitespace diagnostics** and **nine npm audit advisory entries**; these have not been fixed by documentation/packaging. Counts may change as advisory databases evolve.

## Architecture

```text
src/PenguinLauncher/                .NET desktop host and local backend
  Program.cs                       DI, static UI, endpoints, native startup
  Hosting/                         Loopback host and API session boundary
  Endpoints/                       Games, accounts, launch/preflight HTTP routes
  Models/                          State, game, account, platform contracts
  Services/GameScanner/            Platform discovery and Steam metadata
  Services/AccountSwapper/         Platform-specific profile/session operations
  Services/LaunchManager/          Account targeting and game launch orchestration
  Services/Storage/                JSON state persistence
  Helpers/                         VDF, registry, and OS process helpers
  wwwroot/                         Generated React production assets
src/penguinlauncher-ui/             React/TypeScript/Vite/Tailwind frontend
  src/api/                         Authenticated transport and UI session
  src/hooks/                       Library/account data loading
  src/components/                  Library, profiles, dialogs, UI primitives
  tests/                           Vitest/Testing Library tests
tests/PenguinLauncher.Tests/        xUnit and in-process HTTP tests
docs/                              API guide, specs, review/verification records
PenguinLauncher.sln                Backend/application test solution
```

Photino opens the locally served React app. The authenticated UI requests games/accounts/system information; discovery merges platform scanner results into JSON state. Account operations route through platform swappers, while launch preflight/launch route through the launch manager and vendor clients. Persistence is currently file-based, not a transactional database.

API groups are `/api/games`, `/api/accounts`, and `/api/launch`, with authenticated health/system endpoints. The source endpoint handlers and model records define the contracts; there is no generated OpenAPI specification. Do not assume these prerelease interfaces are stable public APIs.

## Build a Windows package

After the UI build and verification, publish from the repository root:

```powershell
dotnet publish src/PenguinLauncher/PenguinLauncher.csproj `
    -c Release -r win-x64 --self-contained true `
    -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:DebugType=None -p:DebugSymbols=false -p:Version=0.1.0 `
    -o publish/windows-v0.1.0
```

Keep the executable and **all required published content**, particularly `wwwroot`, together. Single-file publishing bundles the managed application/runtime but is not a promise that the complete app fits into one standalone file. Package only clean publish output plus documentation and third-party license notices; never include user state, session backups, credentials, crash logs, or local developer files.

ZIP that directory's contents, compute SHA-256, and test a freshly extracted copy before uploading. Release notes must distinguish automated/package checks from native/vendor workflows actually exercised. This initial release is manually prepared; there is no automatic GitHub Actions release pipeline, signing, or reproducible-build guarantee yet.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| No window / immediate exit | Check WebView2, OS/architecture, extracted files, and port 5100. Inspect `crash.log` beside the executable if created; redact before sharing. |
| Port already in use | Close your other Penguin Launcher instance. Identify the owner with `Get-NetTCPConnection -LocalPort 5100 -State Listen`; do not kill an unrelated process. Dynamic ports are not implemented. |
| Blank UI / missing `index.html` | Extract the full ZIP and keep `wwwroot` next to the executable. Source builds require `npm run build`. |
| Disconnected / unauthorized | Relaunch the native app. For Vite, follow the API guide and enter the matching current backend token. Do not paste a token into a public URL or report. |
| Missing games | Verify the appropriate vendor client is installed/configured, then Rescan. Custom paths and vendor changes may not be detected. Associations are not authoritative ownership checks. |
| Switching/capture fails | Confirm the intended platform/profile, save work, close games, and check vendor login/session state. Reauthentication may be needed. Do not repeatedly manipulate important sessions without backups. |
| Missing artwork/title metadata | Check connectivity and vendor services. Some images/metadata are remote and may be unavailable. |
| Invalid/corrupt saved state | Close the app, copy the state directory to a separate safe location, and inspect a redacted copy. Automatic repair/transactional recovery is not implemented; do not delete the only copy. |

For reports, include version, OS, platform, reproduction steps, and a redacted error message. Do not include bearer tokens, session files, full backups, private account identifiers, or screenshots exposing credentials.

## Known limitations and roadmap

The current release adds documentation/download packaging around the implemented test infrastructure, authenticated local API boundary, and dark UI. It does **not** complete the approved hardening roadmap.

Important remaining work includes account-ID/backup-path containment, atomic persistence, serialized recoverable session operations, mapping integrity, safer command launch, Steam configuration/deletion semantics, exception redaction, ownership semantics, metadata refresh propagation, dependency advisories, and host lifecycle/release reproducibility. Session operations may lose data or affect the wrong files if supplied unsafe identifiers or run under unexpected conditions. Prefer isolated/test accounts; do not treat the prerelease as a trusted credential vault.

See [roadmap tracking](docs/superpowers/roadmap-status.md), [API boundary evidence](docs/superpowers/reports/2026-10-03-api-caller-boundary.md), and [UI verification/limits](docs/superpowers/reports/2026-10-04-minimal-dark-ui.md). Those are dated engineering records, not a guarantee that every check still passes on every machine.

## Contributing and licensing

Keep changes focused, preserve existing behavior unless a design explicitly changes it, and add regression tests before fixing behavioral bugs. Run the relevant focused tests and full verification before submitting a pull request. Never use live credentials/session backups as test fixtures.

This repository currently has **no project LICENSE file**. Do not assume an MIT or other open-source license for the project's own code; ask the owner before reuse or redistribution beyond permissions otherwise granted. Bundled third-party components retain their own licenses; the release includes their notices separately. A dependency license does not license the application itself.

Penguin Launcher is not affiliated with or endorsed by Valve, Riot Games, Epic Games, Electronic Arts, or Microsoft. Platform names, artwork, and trademarks belong to their respective owners. Use the app only with accounts you are authorized to manage and in accordance with vendor terms.
