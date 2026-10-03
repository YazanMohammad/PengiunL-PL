# Local API caller boundary design

Status: conversational approach approved on 2026-10-03. Written spec awaiting
user review; no implementation plan or runtime changes authorized by this stage.

## Intent and classification

Architectural: introduce an authenticated contract between the native host,
React client, and local HTTP API. Close audit C1 without rewriting endpoint,
scanner, storage, or account-swap implementations. Preserve authenticated route
behavior and successful JSON payloads. Intentionally stop anonymous API access.

This is project 2a of the approved roadmap. General exception-response redaction
(M3) becomes a separate, immediately following project 2b. This spec covers safe
boundary errors and credential handling, not a claim that M3 is fully resolved.
Project 1's isolated test infrastructure is the prerequisite. Work remains in
the existing `improvement/production-hardening` worktree.

## Repository evidence

- `src/PenguinLauncher/Program.cs`: `Main` registers unrestricted CORS, serves
  unauthenticated API routes, launches Photino at `http://localhost:5100`, and
  ignores the task from `app.RunAsync()`. Developer tools are always enabled.
  The fallback also serves HTML for unknown API paths.
- `src/PenguinLauncher/Endpoints/{Account,Game,Launch}Endpoints.cs`: existing
  mappings reach account discovery, session mutation, scans, and process launch.
  Their individual validation guards are not caller authentication.
- `src/penguinlauncher-ui/src/api/client.ts`: every exported method uses the
  shared relative `/api` request function without credentials. Its options
  spread currently replaces default headers when custom headers are supplied.
- `src/penguinlauncher-ui/src/main.tsx` and
  `src/penguinlauncher-ui/src/hooks/useGames.ts`: React mounts
  immediately, and initial effects request games, accounts, and system details.
- `src/penguinlauncher-ui/vite.config.ts`: development proxies `/api` to port
  5100. There is no authenticated development bootstrap.
- `tests/PenguinLauncher.Tests/Fixtures/GuardApiFixture.cs`: tests deliberately
  exercise inner endpoint guards with rejecting dependencies, not `Program.Main`
  or a production authentication pipeline. Retain that distinction explicitly.

## Alternatives and security limits

Choose a random bearer capability per desktop process, delivered through the
native window's initial URL fragment, with explicit host/origin validation.
This preserves the current HTTP and Photino structure and needs no new package.
A native-message request bridge could avoid bearer HTTP requests but would
replace the client transport and couple endpoint operations to Photino callbacks.
Origin/CORS restrictions alone do not authenticate non-browser callers, so they
are insufficient.

The boundary is intended to reject unrelated websites, DNS-rebinding authorities,
and local requests without the capability. It is not isolation from malware
running as the same OS user, debugger access, compromised native dependencies,
or script injection in the trusted UI. A stolen bearer token grants the API's
existing privileges. No user accounts, roles, JWTs, remote access, TLS service,
or credential database are introduced.

## Credential lifecycle and native bootstrap

Desktop mode generates 32 cryptographically random bytes once per process and
encodes them as canonical unpadded base64url (43 characters). The in-memory
credential policy is immutable for that process. No configurable desktop token,
fallback token, anonymous mode, or public token-discovery endpoint exists.

After the server has successfully bound its loopback endpoint, Photino loads
`http://localhost:5100/#penguin-session=<token>`. The fragment is a private
bootstrap carrier, not an HTTP query parameter. Before mounting the app or
requesting API data, the client reads a single canonical credential, removes
the bootstrap fragment using `history.replaceState`, and holds it in memory.
Duplicate, malformed, or empty credential fragments fail closed, remove any
previous credential, and are scrubbed as well. A present invalid fragment must
not fall back to a previously stored token.

Store the credential under the single `penguin.api.session` sessionStorage key
to support reload in the same window. A valid fresh fragment overrides any old
stored token. With no credential fragment, reload may use a canonical stored
token. Never use localStorage, cookies, a repository file, a public static asset,
or Vite environment substitution for the token. Storage access failures leave
the current valid bootstrap credential in memory; a subsequent reload without
a stored credential returns to the disconnected state. If fragment scrubbing
fails, do not mount the API-consuming app or send requests.

Session storage is a pragmatic reload mechanism, not encrypted protection; a
webview may retain its backing data. Server retirement/restart invalidates the
desktop token irrespective of retained browser data. It does not support sharing
credentials across independently opened windows. Trusted same-origin scripts
can access this state; keep the bootstrap URL and credentials out of console,
request-body, application, and crash logging. Disable Photino developer tools
outside the Development environment. Startup diagnostics must not serialize
the bootstrap URI or raw exceptions that could contain it.

## Headless and development contracts

`--scan-only` remains an offline diagnostic flow: no HTTP listener, credential
requirement, browser, or change to scan semantics. Scan-only takes precedence
over server-only when both existing flags are supplied.

`--server-only` requires `PENGUIN_SESSION_TOKEN` in its process environment. Its
value must be a canonical base64url encoding of 32 bytes. Missing or malformed
configuration prevents binding and produces a generic diagnostic without the
value. The operator generates a fresh random token for each invocation and
supplies it explicitly to diagnostic clients. The server does not print it,
accept it on the command line, write it to disk, or generate an inaccessible
token silently. Reuse is technically possible in this explicit headless mode;
the default desktop per-process randomness is not weakened by this exception.

Development browser access additionally requires `--server-only`, the backend
Development environment, and one `PENGUIN_DEV_ORIGIN`, for example
`http://localhost:5173`.
Validate it as a single canonical HTTP origin with an explicit valid port and
host exactly `localhost`, `127.0.0.1`, or `[::1]`, without credentials, a path,
query, fragment, wildcard, or trailing slash. The backend port is not a
development-origin override. A configured development origin in another mode
or environment is a startup configuration error, not a permissive fallback.

The Vite dev UI offers a minimal password-style token-entry view only in its
development build. On submission it establishes the same in-memory/session
credential as the desktop bootstrap, then mounts the existing app. The token
must match the server-only environment token. Vite does not receive the token
as configuration, inject it into JavaScript, or add proxy-side authentication.
The existing relative `/api` proxy remains. Configure the backend's development
origin to the actual Vite origin; no default cross-origin permission is granted.
Document process-local environment setup without using real secrets in examples
or putting token values in command arguments or committed files.

## Listener and request-boundary policy

Keep port 5100 for this project. Construct only loopback HTTP listeners; host
configuration (`--urls`, `ASPNETCORE_URLS`, or Kestrel endpoint configuration)
must not add external listeners. Verify that hostile configuration cannot
broaden the binding. Dynamic ports and the complete shutdown/recovery lifecycle
remain project 7. Await successful server startup before passing a credential
to Photino; on bind failure, do not open the window or announce readiness. These
are the minimum M2 prerequisites for private bootstrap, not full M2 completion.

Use one production boundary-composition entry point shared by `Program` and
isolated TestServer fixtures. Keep credential/origin policy, HTTP enforcement,
and client bootstrap separate from business services. No general host rewrite
or storage interface extraction is needed.

Enforce the following order and rules:

1. Validate the request authority before static files or endpoint execution.
   Only `localhost:5100`, `127.0.0.1:5100`, and `[::1]:5100` are accepted (DNS
   hostname comparison is case-insensitive). Reject missing ports, foreign
   names, trailing-dot names, wildcard subdomains, and malformed/multiple host
   values. Never trust forwarded host/protocol headers.
2. For `/api` and all segment descendants (case-insensitive, matching ASP.NET
   route matching; `/apiary` is not an API segment), validate any supplied Origin. Accept
   only the exact canonical HTTP origin matching the accepted request authority,
   or the explicitly configured development origin. Reject `null`, multiple
   origins, unexpected scheme/port, and lookalike/prefix/suffix domains. No Origin
   is permitted for authenticated diagnostic clients, not anonymous access.
   Reject `Sec-Fetch-Site: cross-site` unless the supplied Origin is the explicit
   development origin; other fetch-metadata values do not replace authentication.
3. Handle valid CORS preflight before bearer authentication. Only API OPTIONS
   requests from the explicit development origin, with requested method GET,
   POST, DELETE, or HEAD and requested headers drawn from Authorization and
   Content-Type, receive 204 without a token. Empty requested headers are valid.
   Invalid preflights receive 403 and invoke no handler. Production grants no
   cross-origin preflight permission. Emit the exact allowed origin and Vary:
   Origin, never `*` or credential-cookie permission. Ordinary OPTIONS requests
   without a preflight declaration remain authenticated requests.
4. Authenticate every other API request before model binding or service access,
   regardless of method, endpoint existence, or body validity. Accept exactly one
   Authorization field containing a Bearer scheme (case-insensitive), one space,
   and one canonical 43-character token. Reject comma-combined, duplicate,
   malformed, wrong, absent, and retired-process tokens. Decode to 32 bytes and
   compare fixed-length credential bytes with a constant-time comparison.
5. Execute existing mapped API handlers only after the boundary succeeds.
   Authenticated unknown API paths return JSON 404 instead of the SPA fallback;
   ordinary non-API SPA navigation and static files remain token-free after
   authority validation. Protect `/api/health` and `/api/system/info` as well.

Use 401 with `{"error":"Authentication required."}` and a Bearer challenge for
authentication failure, 403 with `{"error":"Request not allowed."}` for boundary
policy failure, and `{"error":"API endpoint not found."}` for API fallback 404.
Do not disclose expected tokens, rejected header values, exception messages, or
machine details. Every API response carries Cache-Control: no-store; static
assets retain their existing caching behavior. Apply CORS to
valid development-origin error responses too, so the UI can distinguish a 401.
Malformed transport headers that Kestrel rejects before middleware may retain
Kestrel's 400 response; they must never reach application handlers.

## React/client behavior and compatibility

The shared request function obtains the current credential immediately before
each call, adds Authorization, and merges other headers without allowing request
options to remove or override authentication. Retain existing relative URLs,
HTTP methods, bodies, and successful decoding. Do not forward credentials to a
different origin on redirects: API requests use redirect-error behavior.

Without a valid credential, do not issue fetch calls or mount data-loading
components. Production displays a small disconnected message instructing the
user to relaunch the native app; it never offers anonymous continuation. A 401
clears memory and session storage, unmounts API-consuming components, and returns
to disconnected/token-entry state. Do not automatically retry a mutation with a
new credential. Concurrent successful requests must not restore invalidated
state after a 401. A 403 is an access-policy error, not an instruction to disable
checks or discard an otherwise valid credential. No bearer values appear in
rendered messages or test snapshots.

Intentional compatibility changes: anonymous callers now need a token; health
checks need authentication; server-only requires explicit environment setup;
unknown API paths return 404 rather than HTML; default desktop developer tools
are disabled. Existing authenticated validation and business responses remain
unchanged in 2a. General exception leakage remains visible until 2b is reviewed
and implemented. No changes to saved state, backup paths, vendor sessions,
account IDs, launch commands, or platform ownership are included.

## Acceptance evidence and safe testing

Strict TDD applies to every behavioral change. Record each regression failing
for the intended reason before changing production behavior. Tests use synthetic
tokens and endpoints, isolated TestServer hosts, rejecting service dependencies,
mocked fetch, and jsdom. Never call `Program.Main`, start an installed launcher,
scan actual accounts, or write real AppData in automated tests.

Required evidence covers:

- Missing/wrong/retired/malformed/duplicate credentials across every current API
  route and relevant methods, including health, system information, unknown
  routes, and malformed request bodies: no business-handler invocation.
- Authenticated synthetic requests succeed; actual endpoint guard tests still
  produce the same validation responses behind the shared production boundary.
  Preserve the existing guard-only tests rather than pretending they prove auth.
- Host/origin/lookalike/null/multi-value rejection, diagnostic no-Origin access,
  valid and invalid preflights, production no-CORS default, development error
  visibility, fetch metadata, and absence of an anonymous OPTIONS bypass.
- Random desktop generation, exact token parsing/comparison, immutable policy,
  server-only and scan-only precedence/configuration, startup failure before
  window loading, explicit loopback binding under hostile host configuration,
  and no credentials in errors, assets, or diagnostics.
- Client bootstrap before initial effects; fragment removal and replacement;
  malformed fragment fail-closed behavior; same-window reload; inaccessible
  storage; absent-token zero-fetch behavior; protected header merge; all API
  methods; redirect rejection; 401 invalidation including in-flight completion;
  no automatic mutation retry; and development entry versus production message.

Use the existing suites plus focused regressions, then run the complete backend
and frontend suites, both TypeScript checks, frontend and Release backend builds,
formatter verification, dependency inventory/audits, and `git diff --check`.
Record pre-existing formatting/advisory failures separately. Review generated
`wwwroot` changes as the necessary authenticated UI bundle, not unrelated churn.

A significant implementation task gets a fresh implementer and independent
reviewer, with fix/re-review loops. After implementation, perform a separate
whole-project regression review. Native webview delivery requires a controlled
desktop smoke test (initial load, reload, close/reopen, and occupied-port failure)
using a synthetic API host and isolated profile, not real scanner/swapper/launch
services. This smoke test proves webview delivery, not real vendor workflows.
If GUI execution is unavailable, report that
gap explicitly; jsdom alone cannot certify Photino fragment/session behavior.

## Risks, dependencies, and deferred work

Changing middleware order or bootstrap timing can strand the UI; the shared
composition tests and controlled desktop smoke test are required mitigations.
Strict origin checks can expose proxy/header differences; explicitly configured
development access and integration tests address them. A fixed port and bearer
storage leave lifecycle and same-user limitations, not reasons for an anonymous
escape hatch. Project 7 must preserve/extend this policy when introducing dynamic
ports or improving host disposal. Project 9b must ensure packaged UI assets carry
the same bootstrap/client logic. Project 2b follows this work to redact existing
exception responses without mixing session/storage redesign into authentication.

No forced dependency upgrade, broad formatter pass, account migration, encryption
subsystem, scanner cleanup, generic DI abstraction, or route rename belongs here.
Rollback is a reviewed source revert, not a runtime switch disabling protection;
rolling back reopens C1 and must be identified as such. The next step after written
spec approval is a reviewable implementation plan, not immediate coding.

## Protocol references checked during design

- [RFC 3986, section 3.5](https://www.rfc-editor.org/rfc/rfc3986#section-3.5): URI
  fragments are separated before dereferencing; the bootstrap carrier therefore
  does not place the token in the initial HTTP request target. This does not
  prevent browser/native history, debugger, or same-origin script access.
- [ASP.NET Core CORS documentation](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0):
  CORS is not authentication; origin scope and middleware ordering are explicit.
- [Kestrel endpoint documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0):
  listener configuration must be controlled independently of request authority.
- [sessionStorage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage):
  browser storage supports page-session reload and can be unavailable. Webview
  persistence behavior remains a native smoke-test requirement.
