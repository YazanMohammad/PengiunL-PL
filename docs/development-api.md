# Authenticated local API development

The API listens only on IPv4/IPv6 loopback port 5100. Every `/api` request,
including `/api/health` and `/api/system/info`, requires a session bearer token.
There is no anonymous mode. `--urls`, `ASPNETCORE_URLS`, and configured Kestrel
endpoints cannot add other listeners. Do not stop someone else's listener if
5100 is occupied; startup must fail before a window opens or readiness is printed.

Normal desktop startup generates a new random credential for that process,
passes it to Photino in the initial URL fragment after the server starts, and
disables developer tools outside Development. The UI scrubs the fragment before
mounting and uses memory plus the `penguin.api.session` sessionStorage key for
same-window reload. Relaunch the native app if disconnected; a new desktop
process invalidates its predecessor's token. Native webview delivery/reload has
not yet been smoke-tested in an isolated profile; automated UI tests do not
establish Photino runtime behavior.

## Start a headless development backend

Use a dedicated PowerShell window at the repository root. This creates 32 random
.NET bytes and canonical unpadded base64url in the current process environment,
without printing a token, using a credential file, or putting it in command
arguments. Generate a fresh value for each server invocation.

```powershell
[byte[]]$penguinTokenBytes = New-Object byte[] 32
$penguinTokenRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $penguinTokenRng.GetBytes($penguinTokenBytes) }
finally { $penguinTokenRng.Dispose() }
$env:PENGUIN_SESSION_TOKEN = [Convert]::ToBase64String($penguinTokenBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$env:DOTNET_ENVIRONMENT = 'Development'
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:PENGUIN_DEV_ORIGIN = 'http://localhost:5173'

# Optional: copy for manual entry into the dev UI without displaying the token.
Set-Clipboard -Value $env:PENGUIN_SESSION_TOKEN

try {
    dotnet run --project src/PenguinLauncher --no-launch-profile -- --server-only
}
finally {
    Remove-Item Env:PENGUIN_SESSION_TOKEN, Env:PENGUIN_DEV_ORIGIN -ErrorAction SilentlyContinue
    Remove-Item Env:DOTNET_ENVIRONMENT, Env:ASPNETCORE_ENVIRONMENT -ErrorAction SilentlyContinue
    Remove-Variable penguinTokenBytes, penguinTokenRng -ErrorAction SilentlyContinue
    Set-Clipboard -Value ''
}
```

The ready message appears only after binding succeeds. Missing/malformed tokens
or invalid development-origin configuration stop startup with a generic
diagnostic. `--scan-only` remains offline and takes precedence over
`--server-only`; it requires no HTTP credentials.

In a separate PowerShell window that has no `PENGUIN_SESSION_TOKEN`, start Vite:

```powershell
Set-Location src/penguinlauncher-ui
npm run dev -- --host localhost --port 5173 --strictPort
```

Open exactly `http://localhost:5173`, paste the matching backend token into the
password field, and submit. Clear the clipboard immediately after pasting.
No token is injected into Vite configuration, JavaScript, or the proxy. Do not
use a `VITE_*` variable for credentials. The production bundle only displays a
disconnected/relaunch message when it has no usable credential.

The backend must be both server-only and Development to accept
`PENGUIN_DEV_ORIGIN`. It must be one exact HTTP origin with an explicit port,
host `localhost`, `127.0.0.1`, or `[::1]`, and no credentials, path, trailing
slash, query, fragment, or wildcard. Port 5100 is not an allowed dev override.
Use the browser's actual origin; changing `localhost` to `127.0.0.1` changes it.
Vite's installed string proxy rewrites Host to its loopback target but retains
the browser Origin. Forwarded headers grant no permission.

For headless Production diagnostics, omit `PENGUIN_DEV_ORIGIN`, set both
environment variables to `Production`, generate the token as above, and use
`--server-only`. Supply the bearer value explicitly in diagnostic clients.
An authenticated health check in the token-owning PowerShell process is:

```powershell
Invoke-RestMethod -Uri 'http://localhost:5100/api/health' -Headers @{
    Authorization = 'Bearer ' + $env:PENGUIN_SESSION_TOKEN
}
```

The running backend occupies that shell, so a concurrent client needs its own
process-local token supplied privately; never paste a token literal into a
command, history, repository file, or public URL. An ordinary request without
Origin is permitted only with authentication. Valid development-origin errors
remain visible to the UI: 401 clears its session and returns to token entry;
403 reports a request-policy failure. Unknown authenticated API paths return
JSON 404, including filename-like paths; ordinary SPA/static navigation remains
available after authority validation.

Reload uses the same window's sessionStorage. Backend restart with a fresh
headless token requires entering that new token; neither a reload nor a 401
automatically retries mutations. Close the dedicated shells and clear the
clipboard on completion. The cleanup above removes only the task-specific
process environment variables; use a dedicated shell so it does not overwrite
environment settings needed by unrelated work.

This capability rejects unrelated websites and unauthenticated local callers.
It does not isolate the app from malware, debuggers, native dependencies, or
trusted UI scripts running as the same OS user. Session storage is not encrypted.
General exception-response redaction remains project 2b (M3); broader host
shutdown/recovery and dynamic ports remain project 7 (remaining M2).
