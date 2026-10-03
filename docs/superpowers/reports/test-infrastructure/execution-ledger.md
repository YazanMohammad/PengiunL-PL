# SDD ledger â€” plan: docs/superpowers/plans/2026-10-03-test-infrastructure.md

Written design and task plan approved in conversation; execution confirmed.
Branch: improvement/production-hardening. Source baseline: 3c1f2c3.
Initial execution HEAD: b56a7d5264660e51bd4ca8123cae3f36c79fce8d.
Isolation verified: linked worktree, no superproject, clean status.
Baseline dotnet test --no-restore --verbosity minimal: exit 0, no tests.

## Preflight interface and consistency scan

| Tasks | Producer / consumer or internal consistency | Result |
| --- | --- | --- |
| 1 / 2 | Test project pins and solution discovery / API guard fixtures compile in same project | Compatible; no production seam required |
| 1 / 3 | DTO JSON contracts / TS synthetic DTO fields and public client assertions | Compatible; literal camel-case data; no shared edited runtime files |
| 2 / 3 | Backend error field contracts / frontend structured-error decoding | Compatible; guards supply error and client accepts error/detail/message |
| 1 | Parser/DTO tests and temporary helper match file map and existing signatures | Consistent; helper TDD and deliberate assertion probe distinct from characterization |
| 2 | Guard test inputs / sentinel dependencies and allowlist | Consistent; sentinel fails before I/O and no valid mutation paths tested |
| 3 | Separate config/test paths / scripts, pinned additions and verification | Consistent; production include and Vite config untouched |

No preflight rulings required.

## Task state

- [x] Task 1 implementation, independent review, any fix/re-review
- [x] Task 2 implementation, independent review, any fix/re-review
- [x] Task 3 implementation, independent review, any fix/re-review
- [x] Whole-branch review and fresh complete matrix

Task 1: dispatched from base b56a7d5264660e51bd4ca8123cae3f36c79fce8d.
Task 1 implementer: /root/test_backend_core; report task-1-report.md.
Task 1: implementation commit 4ba808bf76ec9bc878a8838a08cca14c5b918848; Debug/Release 9 tests and runner probe reported; independent reviewer /root/review_backend_core dispatched.
Task 1 review: spec compliant and quality approved; no findings. Historical red/probe cannot be inferred from final diff; controller read full report containing exact commands, diagnostic literals, counts/exits and observed implementer milestone messages; no evidence gap confirmed.
Task 1: complete (commits b56a7d5..4ba808b, review clean).
Task 2: dispatched from base 4ba808bf76ec9bc878a8838a08cca14c5b918848.
Task 2 implementer: /root/test_api_guards; report task-2-report.md.
Task 2: implementation 64360c5d079feba402be11816b5ded4e28f577ad; 55 focused/64 full backend cases reported. Reviewer /root/review_api_guards dispatched.
Task 2 review: spec compliant, quality approved; no findings. Reviewer checked unchanged storage ordering, constructors/launch first storage call, nullable binding/service routing and production JSON setting; no cannot-verify gaps.
Task 2: complete (commits 4ba808b..64360c5, review clean).
Task 3: dispatched from base 64360c5d079feba402be11816b5ded4e28f577ad.
Task 3 implementer: /root/test_frontend; report task-3-report.md.
Task 3: implementation 06f1ca07a42afef1a10d47c510fff44f0c6a32cc; 19 frontend and 64 backend tests reported, matrix recorded. DONE_WITH_CONCERNS: new GHSA-82fw-gwwq-j7x9 on vitest/mocker pins; jsdom/api:false/no public mocker plugin; watch snapshot zero listeners. Reviewer /root/review_frontend evaluating independently; no acceptance ruling yet.
Task 3 review: spec compliant and quality Approved; no Critical/Important findings for configured workflows.
Task 3: minor (deferred): Vitest/mocker GHSA-82fw-gwwq-j7x9, unmaintained affected pin; migrate in tooling project before enabling browser/API/public plugin serving.
Task 3: minor (deferred): whatwg-encoding transitive deprecation; address in tooling project without unrelated overrides.
Task 3 cannot-verify historical execution/listener/byte-restoration items: controller read detailed report and live milestones; will rerun full matrix and scoped production diff. Durable report now authored; all cross-task implementations/reviews accounted for. No real requirement gap confirmed.
Task 3: complete (commits 64360c5..06f1ca0, review approved with two deferred minors).
Durable report/tracking commit: 1a5270b. Whole-branch reviewer /root/review_test_whole_branch dispatched range 3c1f2c3..1a5270b; spec/plan/report/ledger supplied, including both deferred minors.
Whole-branch reviewer initially hit usage limit, then resumed on user's request and delivered full review. No Critical/Important findings; two dependency minors independently reassessed nonblocking for configured workflows. Declined: existing audited runtime defects, success persistence/launch, desktop packaging, unsupported parser/error/accessibility behavior and firsthand historical observations; these remain their owning later roadmap scope, not silently discarded.
Fresh serial controller matrix: backend64, frontend19, typechecks and both builds exit0; formatter2/233 baseline, npm audit1/nine entries, npm ls0, NuGet0/no known vulnerable packages. Generated HTML CR drift normalized; final diff check0 and runtime/config/assets baseline diff0.
All six spec acceptance criteria verified in durable report. No fixes required by review, no rulings, no merge/push/publish. Plan complete; later roadmap projects pending design stages.
