# Task 3: Client Session Bootstrap and Authenticated Requests

Implemented in the existing production-hardening worktree, based on ac663b41ea447213ee22ef7574dbe8cdde677806. Commit subject: feat: authenticate client requests with session capability.

## Implementation

Added the required ApiSession interface, lazy singleton and injectable session factory. The factory accepts only literal canonical unpadded base64url encodings of 32 bytes, including the required final zero padding bits. A fresh valid fragment replaces stored credentials; invalid, empty, duplicate, encoded or padded credential fragments fail closed, remove the owned key and scrub the fragment while preserving pathname/query. Encoded credential keys are detected but rejected as nonliteral carriers. Unrelated navigation fragments use the ordinary canonical storage restore path.

Storage getters and operations are guarded. Valid bootstrap survives storage failures in memory; invalidation clears memory despite removal errors. History failure leaves a permanently disconnected session. Snapshots are frozen, stable until a transition and contain only connected/generation. Connection/invalidation increment generation. Unsubscribe and stale-generation invalidation are covered.

The existing request helper is exported without changing api method signatures. Disconnected calls fail with Authentication required. and zero fetches. Requests merge all supported header forms through Headers, set current Bearer authorization after caller options, retain default JSON content type when not supplied, and force redirect error. A 401 invalidates only the originating generation and never retries. A 403 preserves the session. Generation is checked after fetch and asynchronous body decoding, so invalidated or replaced sessions cannot return stale data. Existing non-401 error and successful decoding remain unchanged.

Task 4 owns initialize-before-mount and the React gate. No Main/gate changes or implicit singleton initialize invocation were added. Until that next task, the generated UI deliberately cannot make authenticated requests through the lazy disconnected singleton.

## Changed files

- src/penguinlauncher-ui/src/api/session.ts (new)
- src/penguinlauncher-ui/src/api/client.ts
- src/penguinlauncher-ui/tests/api/session.test.ts (new)
- src/penguinlauncher-ui/tests/api/client.test.ts
- src/penguinlauncher-ui/tests/setup.ts
- src/PenguinLauncher/wwwroot/index.html and its required regenerated JS/CSS assets (replace previous hashes)
- docs/superpowers/reports/api-caller-boundary/task-3-* durable evidence
- Local full report: .superpowers/sdd/2026-10-03-api-caller-boundary/task-3-report.md

Setup invalidates the singleton, removes only penguin.api.session and restores the original URL. Storage/cookie preservation tests use synthetic fixtures; they do not clear application storage wholesale.

## TDD evidence

All output paths below are under docs/superpowers/reports/api-caller-boundary/. Native outputs are complete, with explicit native exit codes, and separate RED/GREEN logs. Evidence normalizes line endings, trailing whitespace and blank EOF lines for Git; diagnostic text and counts are retained in full. Test doubles replace only fetch, failing storage operations and history; real session and request behavior runs under jsdom.

| Phase | Command (UI cwd) | Exit/result | Output |
| --- | --- | --- | --- |
| Session RED 1, compiling no-op shell | npm test -- tests/api/session.test.ts | 1; 15 failed / 2 passed / 17 total | task-3-session-red1.log |
| Expanded session RED before implementation | npm test -- tests/api/session.test.ts | 1; 27 failed / 3 passed / 30 total | task-3-session-red2.log |
| Session GREEN | npm test -- tests/api/session.test.ts | 0; 30 passed | task-3-session-green.log |
| Client RED against unchanged unauthenticated request behavior (only helper export) | npm test -- tests/api/client.test.ts | 1; 28 failed / 7 passed / 35 total | task-3-client-red.log |
| Combined GREEN after request implementation | npm test -- tests/api/session.test.ts tests/api/client.test.ts | 0; 65 passed | task-3-focused-green.log |
| Supplemental boundary characterization | npm test -- tests/api/session.test.ts | 0; 36 passed | task-3-canonical-characterization.log |
| Final focused verification after resume | npm test -- tests/api/session.test.ts tests/api/client.test.ts | 0; 71 passed | task-3-final-focused-green.log |

Intended RED failures demonstrated absent connection/scrubbing/storage removal/notifications, missing authentication/redirect policy, caller auth overriding defaults, a 401 not clearing the session, and stale fetch/body completions returning data. The client RED contains deferred Response tests before request behavior edits. Tests cover all fourteen exported API methods with exact URLs/methods/bodies and decoded results; rescan variants and previous structured 400/empty-body expectations remain.

A self-review hypothesis about regex newline tolerance was disproven by six added passing boundary cases (whitespace, encoded key and duplicate encoded key). No production change was made for that hypothesis; task-3-canonical-characterization.log is explicitly not RED evidence.

## Full serial verification matrix

Completed before the usage interruption, in the prescribed order. The interruption occurred during final asset inspection/report preparation, not during an unfinished matrix command. No source behavior changed after these matrix runs. The only subsequent artifact change normalized generated HTML line endings; final focused tests were run after resume.

| Cwd | Command | Native exit / actual result | Output |
| --- | --- | --- | --- |
| Root | dotnet test PenguinLauncher.sln --verbosity minimal | 0; 327 passed, 0 failed/skipped | task-3-backend-tests.log |
| UI | npm test | 0; 79 passed across 4 files | task-3-ui-tests.log |
| UI | npm run typecheck | 0; production and test TypeScript checks passed | task-3-typecheck.log |
| UI | npm run build | 0; 1988 modules, production assets generated | task-3-ui-build.log |
| Root | dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal | 0; 0 warnings/errors | task-3-release-build.log |
| Root | dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal | 1; 233 existing WHITESPACE diagnostics in Program/LaunchManager | task-3-formatter.log |
| UI | npm ls --all | 0; dependency inventory complete | task-3-npm-inventory.log |
| UI | npm audit --json | 1; 9 known package entries (6 high, 3 moderate) | task-3-npm-audit.log |
| Root | dotnet list PenguinLauncher.sln package --vulnerable --include-transitive | 0; neither project has vulnerable packages | task-3-dotnet-audit.log |
| Root | git diff --check (and git diff --cached --check) | 0 for both; no diagnostics after HTML/evidence normalization | task-3-diff-check.log |

npm audit entries: @vitest/mocker, braces, chokidar, esbuild, fast-glob, micromatch, tailwindcss, vite, vitest. No dependencies changed and no forced upgrades were attempted. Vitest API serving remains disabled.

## Self-review and generated assets

Reviewed source and test diffs, the session interface and implementation, all exported api methods, request generation checks, header merge semantics, storage/history failures, subscription cleanup and storage isolation.

Inspected the generated JS snippets against source: session key, canonical validator, lazy factory, protected headers, redirect error and generation checks are present. Neither synthetic token is embedded in assets. No localStorage/cookie access, token Vite substitution or singleton initialize call was added. New JS is index-5Ei8pO9O.js. CSS index-D9HK_ItX.css differs solely by Tailwind's generated .transition utility, triggered by the source transition function identifier; this is the deterministic source-to-build output, not a styling edit.

The build introduced mixed CRLF/extra carriage returns in generated HTML. git diff --check caught that; task-3-generated-html-drift.log preserves the failure. Recreated only that HTML using apply_patch, preserving committed content except necessary JS/CSS hash references. Old hashed assets were replaced by the required build outputs. Two harmless orchestration issues were corrected during inspection: a PowerShell diagnostic quoting error and apply_patch's refusal to combine delete/add for one path in a single patch. Neither affected source or test behavior.

## Concerns and next gate

No unresolved Task 3 correctness concern. Existing formatter/advisory debt remains and is reported separately from introduced changes. Native Photino bootstrap/reload delivery is not certified by jsdom; controlled desktop smoke testing remains the approved later integration gate. Task 4 must initialize and gate mounting before this capability is usable in the UI. Independent review is owned by the controller; no subagents/reviewers were dispatched.
