# Task 2 independent review

Initial range: `b9e1a1b..860257f`. Reviewer: fresh independent
`gpt-6-astra`, high reasoning. Review was read-only; the reported matrix was not
rerun by the reviewer. Status: accepted after fix round 1 and scoped re-review.

## Initial verdict

Spec compliance: issues found. Task quality: Needs fixes.

Important finding: `tests/PenguinLauncher.Tests/Fixtures/ApiBoundaryFixture.cs:66`
uses parameterless `MapFallback`, whose nonfile constraint skips filename-like
unknown API paths. Authenticated `/api/unknown.json` returns an empty framework
404 instead of the required JSON error. Existing fallback tests at
`tests/PenguinLauncher.Tests/Hosting/LocalApiBoundaryTests.cs:234` only cover
nonfile paths. The original implementer owns regression-first reproduction and
a scoped fixture fallback fix. Main must handle the same case in task 5.

No Critical findings. The reviewer found authority/origin/preflight/auth order,
shared guard composition and response-start no-store enforcement sound on
inspection. Malformed-header direct contexts avoid HttpClient normalization.
The recorded matrix supports 204 focused and 325 backend tests.

## Cross-task checks and deferred observations

Production composition, static ordering and native transport are task 5
deliverables. No production protection is claimed from task 2 alone.

The controller checked the synthetic GET/POST/DELETE route table against every
`group.Map` mapping in `GameEndpoints.cs`, `AccountEndpoints.cs`, and
`LaunchEndpoints.cs`, plus Program's health/system mappings. The shapes match;
`/api/synthetic-error` is an additional test-only handler.

Minor observations are carried to final review and roadmap 9a/9b/10a: the
unchanged 233 formatter diagnostics, nine npm advisory entries, and Git LF/CRLF
warnings. These are not attributed to authentication changes.

## Controller fresh verification before the fix

Root command:
`dotnet test PenguinLauncher.sln --filter 'FullyQualifiedName~LocalApiBoundaryTests|FullyQualifiedName~AuthenticatedRequestGuardTests|FullyQualifiedName~RequestGuardTests' --verbosity minimal`.
Native exit 0; 204 passed, 0 failed, 0 skipped; duration 758 ms. This is the
pre-fix suite and does not certify the missing dotted-path regression.

## Fix round 1 and acceptance

Fix range: `860257f..1b2aa69`. A fresh independent `gpt-6.1-sol` reviewer
returned ADDRESSED, no new breakage, no out-of-scope observations. The fixture
adds `MapFallback("/api/{**path}", LocalApiBoundary.WriteApiNotFoundAsync)`;
the regression verifies JSON 404/no-store/zero handlers for a dotted API path,
and a separate preservation case retains the missing static-asset framework 404.
The original implementer recorded RED 1 failed/1 passed before the fix and GREEN
206 passed afterwards. Only fixture/tests/evidence changed in the fix.

Controller fresh covering run after the fix used the same full boundary/guard
filter shown above: 206 passed, 0 failed, 0 skipped, duration 772 ms. The initial
full matrix remains explicitly dated to the pre-fix implementation; the
fixture-only review fix had focused verification. Every next task and final
branch verification will run the full matrix again.

Task 2 has no open Critical/Important findings. Production Main wiring remains
task 5; this acceptance does not close C1 or certify native runtime delivery.
