# Local API Caller Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require an explicit caller capability for every local API operation while preserving authenticated business behavior.

**Architecture:** An immutable backend session policy and shared HTTP middleware protect the existing endpoint maps. The native host privately bootstraps a per-process token; a small client session module owns reload/invalidation, and a React gate prevents unauthenticated effects. Host integration remains a focused change rather than a service or storage rewrite.

**Tech Stack:** Existing .NET 10/ASP.NET Core/Photino, React 18/TypeScript/Vite, xUnit/TestServer, Vitest/Testing Library/jsdom; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-api-caller-boundary-design.md` (written spec approved 2026-10-03).

## Global Constraints

- Preserve authenticated route behavior and successful JSON payloads. Intentionally stop anonymous API access.
- Desktop mode generates 32 cryptographically random bytes once per process and encodes them as canonical unpadded base64url (43 characters).
- Keep port 5100 for this project. Construct only loopback HTTP listeners.
- Protect `/api/health` and `/api/system/info` as well.
- Never use localStorage, cookies, a repository file, a public static asset, or Vite environment substitution for the token.
- Store the credential under the single `penguin.api.session` sessionStorage key.
- `--server-only` requires `PENGUIN_SESSION_TOKEN` in its process environment.
- Development browser access additionally requires `--server-only`, the backend Development environment, and one `PENGUIN_DEV_ORIGIN`.
- No user accounts, roles, JWTs, remote access, TLS service, or credential database are introduced.
- No changes to saved state, backup paths, vendor sessions, account IDs, launch commands, or platform ownership are included.
- General exception-response redaction remains project 2b; complete host lifecycle remains project 7.
- Work only in the existing `.worktrees/production-hardening` branch checkout; preserve unrelated/user edits.
- Strict TDD: record an intended failing assertion/exception before implementation, not merely a compiler error. New interfaces may have minimal compilable throwing/no-op shells for the red run.
- Read test-driven-development and writing-good-tests before execution; use systematic-debugging for unexpected failures. No forced dependency upgrades or unrelated cleanup.
- Automated tests use TestServer or a non-network recording Kestrel transport, mocked fetch, and synthetic data; never call `Program.Main`, real scanners/swappers, or actual AppData.

## Review Focus

1. A late 401 from an old connection must not erase a newly entered token; a late successful response must not repopulate disconnected state (task 3).
2. Invalid fresh fragments must not revive an older stored token, even when storage access/removal throws (task 3).
3. Uppercase API routes and segment lookalikes must receive the intended boundary, not slip into a token-free SPA route (task 2).
4. Vite-proxied browser requests preserve their real development Origin; exact configured origins work, lookalikes fail, and 401 remains readable (tasks 2 and 5).
5. Kestrel configuration reload, URL/environment overrides, and failed binding must never broaden listeners or load a credential-bearing window prematurely (task 5).

## File Map

Backend additions live in `src/PenguinLauncher/Hosting/`: `ApiSessionPolicy.cs`
owns immutable credential/authority/origin decisions; `LaunchMode.cs` resolves
the existing CLI modes; `LocalApiBoundary.cs` owns HTTP enforcement and API
fallback; `LocalApiHost.cs` controls listeners/readiness and safe diagnostics.
Only `Program.cs` consumes those seams. Existing business endpoint/service files
are not rewritten.

Frontend additions: `src/penguinlauncher-ui/src/api/session.ts` owns session
bootstrap and generation; `src/components/ApiSessionGate.tsx` owns connection UI.
Modify existing `src/api/client.ts` and `src/main.tsx`. Existing App and useGames
behavior is retained behind the gate. Test counterparts are listed per task.

Document operations in `docs/development-api.md`, execution evidence in
`docs/superpowers/reports/2026-10-03-api-caller-boundary.md`, and task snapshots
under `docs/superpowers/reports/api-caller-boundary/`. Update roadmap status and
this plan as gates are completed. Generated backend `wwwroot` is rebuilt from
the authenticated client, reviewed separately from source changes.
Tasks 1-4 establish testable pieces; task 5 completes runtime integration.
Intermediate commits are not release candidates and must not be published.

## Task 1: Immutable Credential and Mode Policy

**Files:** create `Hosting/ApiSessionPolicy.cs`, `Hosting/LaunchMode.cs` and
`tests/PenguinLauncher.Tests/Hosting/ApiSessionPolicyTests.cs` (paths above).

**Interfaces produced:** namespace `PenguinLauncher.Hosting`:

```csharp
public enum LaunchMode { Desktop, ServerOnly, ScanOnly }
public static class LaunchModes {
    public static LaunchMode Resolve(string[] args);
}
public sealed class ApiSessionPolicy {
    public static ApiSessionPolicy Create(bool serverOnly, bool isDevelopment,
        string? configuredToken, string? developmentOrigin);
    public string? DevelopmentOrigin { get; }
    public bool IsAuthorized(Microsoft.Extensions.Primitives.StringValues authorization);
    public bool IsAllowedAuthority(string authority);
    public bool IsAllowedOrigin(string origin, string authority);
    public Uri CreateBootstrapUri();
}
```

No public token/byte-array property or credential-bearing ToString. Scan-only
resolves before policy creation; the policy is not created for offline scans.
Use `Convert.ToBase64String(new byte[32]).TrimEnd('=').Replace('+','-').Replace('/','_')`
only to construct the **synthetic test token** (43 `A` characters); real generation
uses `RandomNumberGenerator.GetBytes(32)`.

- [x] Write mode and credential tests, with minimal compilable shells. Assertions:
  `Resolve(["--server-only","--scan-only"]) == ScanOnly`; empty args == Desktop;
  server-only flag == ServerOnly; two desktop policies yield different bootstrap
  fragments; each token decodes to 32 bytes; bootstrap PathAndQuery == `/`, query
  empty, fragment starts `#penguin-session=`; fresh policy accepts its Bearer
  token and rejects the other policy's token. A configured desktop token is not
  adopted. `policy.ToString()` must not contain its token.

  ```csharp
  [Fact]
  public void ScanOnly_TakesPrecedence() => Assert.Equal(LaunchMode.ScanOnly,
      LaunchModes.Resolve(["--server-only", "--scan-only"]));
  ```

- [x] Run `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~ApiSessionPolicyTests --verbosity normal`; record intended red failures before implementation.
- [x] Add credential parsing cases: missing token configuration, empty/padded/
  whitespace/noncanonical-last-character tokens, wrong length, wrong scheme,
  comma-combined values, duplicate StringValues, two spaces and trailing spaces
  reject; lowercase `bearer` with exact token accepts. Invalid configuration
  throws `ArgumentException` with message `"Invalid API session configuration."`,
  never input values.
- [x] Add authority/origin cases: the three exact port-5100 authorities accept,
  hostname case accepts; foreign/missing-port/trailing-dot/lookalike authorities
  reject; same canonical HTTP origin accepts; null literal, HTTPS, differing port,
  suffix and multiple origin strings reject. Development origin accepts only
  server-only + Development, canonical loopback origin, explicit port not 5100;
  path/query/fragment/userinfo/trailing-slash/wildcard/non-loopback inputs reject.
- [x] Run the same focused filter again with parsing/authority/origin tables;
  record intended red results for these added cases before implementing them.
- [x] Implement only these policy interfaces: private immutable decoded bytes,
  canonical re-encoding validation, `CryptographicOperations.FixedTimeEquals`,
  exact parsed authority/origin matching, and fresh desktop randomness. A missing
  dev-origin option grants no cross-origin access. Config errors remain generic.
- [x] Run the focused filter green, then the task gate below; require baseline
  tests preserved and no token in diagnostics. Commit only policy/mode/tests as
  `feat: define immutable local API session policy`.
- [x] Fresh independent review checks canonical parsing, no mutable secret
  exposure, headless exceptions, and configuration semantics; fix/re-review
  important findings before task 2.

## Task 2: Shared HTTP Boundary and Safe API Fallback

**Files:** create `Hosting/LocalApiBoundary.cs`,
`tests/PenguinLauncher.Tests/Fixtures/ApiBoundaryFixture.cs`, and
`tests/PenguinLauncher.Tests/Hosting/LocalApiBoundaryTests.cs`.
Add an authenticated construction option to `Fixtures/GuardApiFixture.cs` and
new `Endpoints/AuthenticatedRequestGuardTests.cs`; preserve existing guard tests.

**Consumes:** task 1 policy. **Produces:**

```csharp
public static class LocalApiBoundary {
    public static WebApplication UseLocalApiBoundary(this WebApplication app,
        ApiSessionPolicy policy);
    public static bool IsApiPath(PathString path);
    public static Task WriteApiNotFoundAsync(HttpContext context);
}
```

`ApiBoundaryFixture.CreateAsync(ApiSessionPolicy policy)` returns an async-owned
TestServer fixture with `HttpClient Client` (base address localhost:5100) and
`int HandlerCalls`. Register synthetic counted handlers at the exact existing
API route/method shapes, plus harmless static/SPA responses. Dispose host/client
on both startup failure and normal teardown. No production services here.
`GuardApiFixture.CreateAsync(ApiSessionPolicy? boundaryPolicy = null)` optionally
adds the **same** boundary before its existing reject-only route admission.

- [x] Write `AnonymousApiRequests_NeverReachHandlers`: parameterize every
  currently mapped games/accounts/launch/system/health route, including DELETE,
  `/api`, unknown routes, HEAD/PUT/PATCH/OPTIONS, and malformed JSON. Assert 401,
  JSON `error == "Authentication required."`, Bearer challenge, no-store, and
  `HandlerCalls == 0`. A no-op boundary shell lets these fail against safe
  reachable handlers, not real launchers.

  ```csharp
  [Fact]
  public async Task AnonymousHealth_NeverReachesHandler()
  {
      await using var fixture = await ApiBoundaryFixture.CreateAsync(
          ApiSessionPolicy.Create(false, false, null, null));
      var response = await fixture.Client.GetAsync("/api/health");
      Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
      Assert.Equal(0, fixture.HandlerCalls);
  }
  ```

- [x] Run `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiBoundaryTests --verbosity normal`; preserve red output showing missing protection.
- [x] Write invalid-credential, authority, origin, and metadata tests with exact
  401/403 status, generic JSON errors and zero handler calls. Include `/API/health`
  (protected), `/apiary` (non-API), mixed-case descendants, slash variants,
  lookalike hosts, forwarded-header spoofing, Origin null/duplicates, and
  `Sec-Fetch-Site: cross-site` with/without configured development Origin.
- [x] Write valid authenticated synthetic request/no-Origin tests; unknown API
  gets JSON 404 `"API endpoint not found."`, SPA routes remain HTML, and static
  files do not require a token but still reject foreign authorities. All API
  responses, including success/error/404, have no-store; static caching is not
  changed. Supply authentic token + bad Origin and verify 403, not access.
- [x] Write preflight tables: explicit development Origin + GET/POST/DELETE/HEAD
  and Authorization/Content-Type header set (case-insensitive, empty allowed)
  yields 204/no handler/no token; foreign origin, unsupported method/header or
  malformed declaration yields 403. Ordinary OPTIONS without a declaration needs
  a token. Production supplies no cross-origin permission. Assert exact allow
  origin, appropriate allow methods/headers, Vary Origin, no `*`/cookie permission,
  and readable 401/403 for otherwise valid development-origin requests.
- [x] Run the full boundary filter red again after adding the hostile inputs,
  authenticated success/fallback cases, and preflight tables.
- [x] Implement the middleware in spec order, before endpoint/model binding or
  static handling. Use segment-aware ordinal-ignore-case API detection, explicit
  preflight validation and narrow CORS response headers, not blanket framework
  CORS that silently accepts disallowed preflights. Set API no-store using
  response-start handling so handlers cannot accidentally overwrite it.
- [x] Add authenticated real endpoint guard tests using the sentinel fixture:
  invalid map/swap/add/capture/rename/launch bodies keep their existing 400
  messages and `Swapper.OperationCalls == 0`; missing auth on those same requests
  yields 401 first. Never test successful mutation with the sentinel storage.
- [x] Run focused boundary/authenticated-guard filters green, then the task gate.
  Commit `feat: enforce authenticated local API requests` (not wired into Main
  until task 5). Independent reviewer checks bypasses, CORS ordering, fixture
  safety, and actual shared composition; fix/re-review before task 3.

## Task 3: Client Session Bootstrap and Authenticated Requests

**Files:** create UI `src/api/session.ts`, `tests/api/session.test.ts`; modify
`src/api/client.ts`, `tests/api/client.test.ts`, and test setup only as necessary
to invalidate the singleton, clear the owned session key, and restore browser
history between tests. Never clear unrelated application storage keys.

**Produces:**

```typescript
export type ApiSessionSnapshot = Readonly<{ connected: boolean; generation: number }>;
export type SessionEnvironment = {
  location: Pick<Location, 'hash' | 'pathname' | 'search'>;
  history: Pick<History, 'replaceState'>;
  storage: () => Storage;
};
export interface ApiSession {
  initialize(): void;
  connect(token: string): boolean;
  getCredential(): string | null;
  getSnapshot(): ApiSessionSnapshot;
  subscribe(listener: () => void): () => void;
  invalidate(generation: number): void;
}
export function createApiSession(environment: SessionEnvironment): ApiSession;
export const apiSession: ApiSession;
```

Snapshots are stable objects until a transition, never contain credentials, and
increment generation on connection/invalidation. The singleton does not read
storage/fragment until initialize. In the existing client expose the existing
request helper as `export async function request<T>(url: string,
options?: RequestInit): Promise<T>` for focused header-merge tests; public `api`
method signatures remain unchanged.

- [x] Write session tests with compiling shells: valid fragment connects before
  subscribers/data effects, removes the fragment with replaceState preserving
  pathname/query, stores exact key, and overrides old storage. Empty/duplicate/
  padded/malformed token fragments disconnect despite a valid stored credential.
  Absent fragment restores only a canonical stored token; unrelated navigation
  fragments do not establish credentials. Repeat initialize is idempotent.
- [x] Run `npm test -- tests/api/session.test.ts` in the UI; record red behavior.
- [x] Add blocked storage getter/getItem/setItem/removeItem tests: valid fragment
  still works in memory when storage fails, invalid fragment never falls back,
  invalidation clears memory even if removal fails, and replaceState failure
  leaves disconnected state. Assert localStorage/cookie unchanged, snapshots and
  caught errors contain no token. `subscribe` cleanup prevents later callbacks.
- [x] Run the session filter red again with storage/history failures and precedence
  cases before implementing them.
- [x] Implement createApiSession with canonical 32-byte token validation and
  spec precedence. Keep storage access lazy and guarded. Scrub any credential
  fragment before mounting; never expose the token through state/UI/error copy.
- [x] Write request regressions **before editing request behavior**: disconnected
  `api.getAccounts()` rejects `"Authentication required."` with zero fetch calls;
  connected calls carry Bearer auth, JSON headers and `redirect: 'error'`; caller
  Headers/object/tuple options cannot overwrite auth. Parameterize every existing
  exported API method and retain exact URLs, methods, bodies, successful decoding,
  and existing structured-error expectations. Record these new tests red against
  the current unauthenticated request function.

  ```typescript
  it('DisconnectedRequest_DoesNotFetch', async () => {
    apiSession.invalidate(apiSession.getSnapshot().generation);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(api.getAccounts()).rejects.toThrow('Authentication required.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  ```

- [x] Write deferred-Response tests: 401 invalidates that generation, clears the
  owned key, notifies subscribers and never retries; 403 preserves it. Complete
  another request after that 401 and assert rejection rather than data return.
  Reconnect with token B while token A's request is pending: both a late A success
  and a late A 401 must reject without clearing B. Check generation again after
  asynchronous body decoding. A fetch redirect error must not trigger retries.
- [x] Run `npm test -- tests/api/client.test.ts` red with the deferred response
  cases before editing the request function.
- [x] Implement request auth/header merge and capture the generation per call.
  Invalidate only the generation that received 401; reject stale results before
  returning decoded data. Keep existing success/error decoding otherwise intact.
  Update old exact-call tests only for intentionally added headers/redirects.
- [x] Run `npm test -- tests/api/session.test.ts tests/api/client.test.ts` green,
  then the task gate. Commit `feat: authenticate client requests with session capability`.
  Fresh independent reviewer examines secret exposure, generation races, all
  exported methods and test isolation; fix/re-review before task 4.

## Task 4: React Connection Gate and Development Entry

**Files:** create UI `src/components/ApiSessionGate.tsx`,
`tests/components/ApiSessionGate.test.tsx`, and `src/vite-env.d.ts` with only
`/// <reference types="vite/client" />`; modify `src/main.tsx`.
The type-only prerequisite was confirmed from the current tsconfig and installed
Vite declarations during execution preflight; its ruling is recorded in the ledger.

**Consumes:** task 3 session. **Produces:**

```typescript
export type ApiSessionGateProps = {
  children: React.ReactNode;
  session?: ApiSession;
  allowDevelopmentEntry?: boolean;
};
export function ApiSessionGate(props: ApiSessionGateProps): React.ReactElement;
```

Default session is apiSession; default allowDevelopmentEntry is false. Main
initializes apiSession synchronously, then renders the existing StrictMode/App
inside the gate with `allowDevelopmentEntry={import.meta.env.DEV}`.

- [x] Write `DisconnectedProduction_DoesNotMountDataEffects`: child effect calls
  a fetch spy if mounted; disconnected gate shows relaunch instruction, no token
  input, zero effect/fetch calls. A minimal gate shell initially renders children;
  record intended failure with `npm test -- tests/components/ApiSessionGate.test.tsx`.

  ```typescript
  it('DisconnectedProduction_DoesNotMountDataEffects', () => {
    const mounted = vi.fn();
    const Child = () => { React.useEffect(mounted, []); return <div>Data view</div>; };
    render(<ApiSessionGate session={apiSession} allowDevelopmentEntry={false}>
      <Child />
    </ApiSessionGate>);
    expect(mounted).not.toHaveBeenCalled();
    expect(screen.queryByText('Data view')).not.toBeInTheDocument();
  });
  ```

- [x] Add connected-child mounting, invalidation/unmount, StrictMode subscription
  cleanup, valid development token entry, invalid input zero-fetch, and production
  no-entry tests. Use isolated sessions/synthetic tokens. Assert input type password,
  entered credential absent from surrounding text/error messages, and input cleared
  after submission. No login network endpoint or anonymous continuation exists.
- [x] Add a real App integration case with one-shot synthetic game/account/system
  Responses: no initial requests without bootstrap; initialized session sends only
  authenticated requests after mounting. A 401 moves back to disconnected UI and
  a later success cannot restore the old app. Do not mock the shared API module.
- [x] Run all gate cases red before implementation; use the singleton session for
  the real-App case so the gate and actual client observe the same transitions.
- [x] Implement gate subscription with `useSyncExternalStore`, minimal connection
  copy and development-only entry, then integrate Main initialization before render.
  Do not rewrite useGames, GameLibrary, or unrelated components.
- [x] Run gate and full UI tests green, then the task gate. Commit
  `feat: gate launcher UI on authenticated session`; fresh independent reviewer
  checks real effects, production entry isolation, and no secret UI leakage;
  fix/re-review before task 5.

## Task 5: Native/Headless Host Integration and Operational Evidence

**Files:** create `Hosting/LocalApiHost.cs`,
`tests/PenguinLauncher.Tests/Hosting/LocalApiHostTests.cs`, and test-only
`Fixtures/RecordingConnectionListenerFactory.cs`; modify `Program.cs` only for
boundary wiring/startup/diagnostics. Create `docs/development-api.md`; update
authenticated `wwwroot`, roadmap, plan, and execution reports.

**Consumes:** tasks 1-4. **Produces:**

```csharp
public static class LocalApiHost {
    public static ApiSessionPolicy? CreateSessionPolicy(LaunchMode mode,
        bool isDevelopment, string? configuredToken, string? developmentOrigin);
    public static void ConfigureLoopback(WebApplicationBuilder builder);
    public static void StartDesktop(WebApplication app, ApiSessionPolicy policy,
        bool isDevelopment, Action<Uri, bool> loadAndWait);
    public static Task RunServerAsync(WebApplication app, Action announceReady,
        CancellationToken cancellationToken = default);
    public static string FormatStartupFailure(Exception error);
}
```

StartDesktop synchronously awaits StartAsync before invoking loadAndWait **on the
calling STA thread**, which then constructs Photino and waits for close. Do not
move Photino creation onto an async/thread-pool continuation. RunServerAsync
announces after successful StartAsync, then waits for host shutdown.
The desktop callback receives `(bootstrapUri, enableDevTools)`; the second value
equals isDevelopment and is the sole input to Photino's SetDevToolsEnabled call.

- [ ] Write readiness tests using safe TestServer/throwing server doubles: callback
  observes ApplicationStarted; failed StartAsync invokes neither load nor ready
  callback; desktop callback thread equals caller thread. Headless readiness is
  announced once only after startup. Generic diagnostics from an exception whose
  message contains a synthetic bootstrap token/URI must contain neither value.
  Parameterize desktop Development/Production to assert the callback's developer
  tools flag is true/false respectively, without constructing a native window.
- [ ] Write mode-composition tests: CreateSessionPolicy returns null for scan-only
  despite malformed environment values; other modes use task 1's policy rules.
  Add configured-origin forwarded/proxied-header integration cases to the safe
  fixture before changing Main; preserve authenticated real guard responses.

  ```csharp
  [Fact]
  public void ScanOnly_DoesNotValidateHttpCredentials() => Assert.Null(
      LocalApiHost.CreateSessionPolicy(LaunchMode.ScanOnly, false,
          "invalid-token", "invalid-origin"));
  ```

- [ ] Write `HostConfiguration_CannotAddNonLoopbackBindings`: replace all transport
  factories with test-only IConnectionListenerFactory capturing requested endpoints
  without opening sockets. Supply hostile `--urls`, URL config corresponding to
  ASPNETCORE_URLS, and Kestrel Endpoints including `0.0.0.0:6200`; mutate endpoint
  configuration/reload after startup. Assert requested endpoints are loopback
  only, port 5100 only, and no additional endpoint appears. Dispose/cancel fake
  listeners and host; never bind or probe an existing port in automated tests.
- [ ] Run `dotnet test PenguinLauncher.sln --filter FullyQualifiedName~LocalApiHostTests --verbosity normal`; record intended red assertions with minimal helper shells.
- [ ] Implement ConfigureLoopback using final Kestrel option configuration: replace
  its configuration loader with an empty IConfiguration and reload disabled,
  then ListenLocalhost(5100). Remove Main's UseUrls. Use service PostConfigure
  ordering so default Kestrel configuration cannot reintroduce extra endpoints.
  The recording transport tests, not assumptions about configuration precedence,
  must establish the invariant. Implement readiness and generic diagnostics.
- [ ] Wire Main: resolve mode first; retain offline scan before token validation;
  read headless token/dev origin directly from process environment (not command
  arguments/configurable credential files); use CreateSessionPolicy and construct
  policy before listener
  startup; add shared boundary before static files/endpoints; remove wildcard
  CORS; use safe API fallback; protect existing health/system maps; headless
  readiness after binding; desktop load via StartDesktop/CreateBootstrapUri.
  Feed the callback's flag into SetDevToolsEnabled. Existing crash path may remain
  but write FormatStartupFailure, not raw exception.ToString or bootstrap URL;
  print that same generic startup diagnostic to standard error for CLI visibility.
- [ ] Re-run the mode, proxied-header and authenticated guard regressions green;
  inspect Main wiring for scan-only policy omission and shared boundary usage.
  A fixture cannot alone prove all entry-point code, so retain this direct review
  requirement rather than calling synthetic tests full native integration.
- [ ] Document PowerShell process-local random-token setup (random .NET bytes,
  base64url) and server-only/Development environment variables without echoing the
  token or embedding it in command arguments. Explain manual password entry,
  exact Vite origin, authenticated health checks, no anonymous option, cleanup of
  task-specific environment variables, reload/restart, and same-user limitations.
- [ ] Run focused host/boundary/guard tests green, then the task gate sequentially.
  Inspect source-to-generated bundle diff; confirm no synthetic/real token or
  development credential is embedded. Commit `feat: integrate authenticated native and headless hosts`.
  Independent reviewer checks entry-point coverage, STA/readiness, fixed-loopback
  enforcement, shipped UI, and docs; fix/re-review important findings.
- [ ] Perform controlled native smoke with a synthetic-only API host and isolated
  profile: initial fragment bootstrap, reload, close/reopen with new credential,
  and occupied-port failure. Do not launch Main against real vendor services or
  kill an existing listener. Check Photino's actual isolation facilities first;
  if GUI/profile isolation cannot be guaranteed, record the smoke as unavailable
  and do not claim native runtime delivery verified. No substitute jsdom claim.

## Mandatory Task Gate and Final Branch Review

After **each task**, run focused tests and then the full matrix below. Capture
exact cwd, command, native exit code, discovered counts, and complete outputs in
the task evidence. Serial execution avoids wwwroot/build races. Generated-only
newline drift before task 4/5 is not a source change; use apply_patch on that
specific artifact if normalization is needed, never broad checkout/reset.

| Cwd | Command | Required interpretation |
| --- | --- | --- |
| Worktree root | `dotnet test PenguinLauncher.sln --verbosity minimal` | Nonzero discovered cases; zero failures/skips unless explicitly justified |
| UI | `npm test` | Nonzero discovered cases; zero failures |
| UI | `npm run typecheck` | Both production and test checks exit 0 |
| UI | `npm run build` | Exit 0; review authenticated/generated assets |
| Root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | Exit 0; no new warnings/errors |
| Root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | Preserve/document 233 baseline whitespace diagnostics separately; no new formatter issues |
| UI | `npm ls --all` | Exit 0; no invalid dependencies |
| UI | `npm audit --json` | Record actual advisories; nine baseline package entries are not newly introduced by auth |
| Root | `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive` | Record fresh advisory result |
| Root | `git diff --check` | Exit 0 |

Focused commits stage only named task files and necessary generated assets.
Use command-local Codex Git identity if no identity is configured. Do not merge,
push, release, or remove the worktree as part of this plan.

- [ ] Reconcile every spec section with implemented files/tests and attach the
  native smoke evidence or explicit gap. Confirm M3 and remaining M2 are pending,
  not accidentally marked fixed. Update roadmap project 2a accurately.
- [ ] Obtain a fresh whole-project/whole-branch review for auth bypass, stale UI
  regressions, CLI compatibility, resource leaks, secret disclosure, and unrelated
  changes; inspect branch `3c1f2c3..HEAD` plus focused auth commits. Important
  findings require regression tests, fixes, and independent re-review.
- [ ] Run the entire matrix again after final review fixes. Apply
  superpowers:verification-before-completion before every completion claim;
  report baseline failures and any smoke gap without declaring the whole roadmap
  or application secure. Record review/verification evidence in the durable report.
- [ ] Hand off project 2a evidence and propose project 2b's bounded error-redaction
  design; do not start an unreviewed structural follow-on.

## Plan Self-Review and Execution Handoff

Coverage: credentials/configuration/CLI policy -> task 1; authority/origin/auth/
preflight/fallback/cache policy -> task 2; bootstrap/reload/generation/client
transport -> task 3; mounted effects/dev entry -> task 4; listeners/native startup/
shipping/docs -> task 5. Review Focus cases have explicit owning tests. TestServer
and recording transport are distinct evidence from the conditional native smoke.
No undefined cross-task interface or unrelated roadmap implementation is required.

The user approved this written plan and implementation on 2026-10-03 and selected
**subagent-driven development**. Execution uses a fresh implementer and independent
reviewer for each task. Preserve that execution choice.

Implementation references: [Kestrel Configure](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserveroptions.configure?view=aspnetcore-10.0),
[ListenLocalhost](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserveroptions.listenlocalhost?view=aspnetcore-10.0),
and the [installed runtime version's source](https://github.com/dotnet/aspnetcore/blob/v10.0.12/src/Servers/Kestrel/Core/src/KestrelServerOptions.cs)
were checked during planning; listener precedence still requires the regression
tests above, not reliance on a documentation summary.
