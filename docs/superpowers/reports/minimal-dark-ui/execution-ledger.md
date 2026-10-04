# SDD ledger — plan: docs/superpowers/plans/2026-10-04-minimal-dark-ui.md

UI starting HEAD: 0c6261eb9079964fcb50d33d1fbf2deeb6d3f661. Design/plan commit and Task 1 BASE: 144854bbf325f12d5f341597f2e9e96ea5265eb8.

User chose A, approved complete in-chat scope, and explicitly requested implementation at once instead of additional approval pauses. Preserve their earlier subagent/TDD/worktree/review requirements. Spec/plan reviewed inline for consistency, scope, and concrete task coverage before execution. No product edits yet.

Baseline 2026-10-04: frontend `npm test` 90/90; `npm run typecheck` exit 0; root `dotnet test PenguinLauncher.sln --no-restore` 355/355; clean tracked worktree, git diff --check exit 0. Existing dependencies are already installed; no dependency installation needed.

## Preflight conflict scan

| Tasks | Shared file/interface | Check/result |
| --- | --- | --- |
| 1 / 2 | CSS variables, Button/Badge consumed by existing dialogs | Task 1 keeps variant names/props; Task 2 restyles consumers. No conflicting palette or API changes. Sequential implementation. |
| 1 | Library props, hook/API fixtures, removal of spotlight | Tests require details routing and one Play callback; implementation does the same. Preserve filtering/account/preflight/pagination. |
| 2 | Existing dialogs and Radix primitives | Tests demand flat surfaces/accessible controls; no new interfaces required. Preserve gate/close/account callbacks. |

## Tasks

- [x] Task 1 implementation and independent review
- [x] Task 2 implementation and independent review
- [x] Fresh whole-UI/branch review
- [x] Actual synthetic React preview visual inspection
- [x] Fresh final verification and report

Task 1: independent review spec issues / quality Needs fixes. Important: GameListItem ownership/status is outside details body, leaving row metadata inert. Controller verified lines48–88; fix round1 dispatched to original implementer, FIX_BASE aee2d00. Task1-review.md records exact evidence.
Task 1: fix round1/5 (1 addressed, 0 open; commits aee2d00..b7849a2). Reported RED4 expected metadata failures, focused34/UI135/backend355 green, typecheck/build/syntax/diff clean. Covering output read from appended report. Scoped re-review /root/rereview_dark_library wrote complete task-1-rereview.md before its final delivery hit a usage limit; recovered on user resume, verdict All findings addressed/no new Critical/Important. No duplicate re-review needed.
Task 1: complete (commits 144854b..b7849a2, important review findings resolved; minor palette suggestion deferred to final review).
Task 1: minor (deferred): DarkTheme tests do not pin exact palette values/primary foreground; current HSL values verified correct by reviewer. Final reviewer to triage whether a visual CSS contract is worthwhile.
Task 1: cross-task checks from reviewer — Task2 dialog/gate styles/focus and final unchanged orchestration/native checks still pending. Synthetic targeting/conflict/pagination support preservation; native remains unverified.

Task 1 original implementation record: /root/implement_dark_library DONE; BASE 144854b, initial HEAD aee2d00. Commits e79350d (theme/primitives), aee2d00 (library). Original focused41/UI131/backend355, typecheck/build/syntax/diff green. Original review found one Important, resolved by the fix/re-review above. Authored companion diff excludes only generated minified assets (raw full diff remains available); fresh deterministic final build will verify generated artifacts match sources.

Task 2: active implementer /root/implement_dark_dialogs, BASE b7849a252df7c4cbbf572f5dcedffcd8957bc9b4. User resumed; continue same plan without restarting completed tasks. Inspection confirms onMapAccount is an existing unused interface; preserve it without inventing mapping UI. Nonexistent separator/scroll-area and unused ui/card are outside this scoped task.
Task 2: implementation complete b7b87d0 (source/tests), 064f297 (generated assets), report read in full; clean tracked tree verified. RED13 + scoped RED2 before primitive fixes, GREEN focused33/UI152/backend355/typecheck/build/syntax/diff. Independent /root/review_dark_dialogs active; no task completion until both review verdicts.
Task 2: complete (commits b7849a2..064f297, spec compliant and quality approved; no Critical/Important). Cannot-verify palette/library/auth/persistence resolved from Task1 tests/review, unchanged backend/client/session/manifest diff and final whole-branch review; browser geometry checks recorded visual-qa.md. Native/live-assistive-technology remain explicit limits, generated bundle equivalence awaits fresh final build.
Task 2: minor (deferred): manager-wide error is newly repeated inside every nested form; opening a different form within the four-second status lifetime can show an unrelated prior error. Final reviewer must triage; task-2-review.md has evidence and regression proposal.
Final review active /root/review_final_dark_branch on full original branch 3c1f2c3..064f297 (33 commits), readable source/spec/config/tests package excludes only minified assets and prior report logs; complete raw package retained. Controller browser confirms keyboard body-details dismissal loses focus to BODY; reviewer preliminary Important, await full consolidated report before one fix wave.
Final review completed With fixes: Important controlled-dialog focus loss; Minor unrelated nested-form stale error and exact palette coverage. All three enter one consolidated bounded fix wave, BASE064f297; final-fix-brief.md records requirements/TDD. No additional Critical/Important backend/client regression found.
Final fix wave /root/fix_final_dark_ui complete: 8249b16 focus/status/source+regressions, a3984d0 palette characterization, d8cce0d generated assets. Full report read; correct RED14, GREEN focused83/UI169/backend355/typecheck/build/syntax/diff. Fresh independent /root/rereview_final_dark_fixes addresses all three original findings, no new Critical/Important. One new Minor below adjudicated after the single permitted final re-review.
Final fix: parked Minor — unfocused/programmatic DialogTrigger activation restores previous focus rather than Radix Trigger — Ruling: defer this unused-consumer compatibility edge; rg confirms production has only the Trigger definition/export, while actual controlled app keyboard/nested paths pass — cost if wrong: a future or programmatic Trigger consumer can restore focus to the wrong control. Report final-rereview.md contains the focused baseline/fix comparison; no second fix wave or claim of perfect primitive compatibility.

Controller fresh final source d8cce0d: UI169/9 files, backend355/0 skipped, typecheck/build/Release0 warnings/errors, formatter exit2/165 unchanged, generated whitespace-only normalization matches HEAD. Current boundary/manifest/hooks/auth remain unchanged by UI range. Browser actual grid/list and nested focus restoration confirmed; viewport reset and synthetic preview marked deliverable. Durable report/evidence commit still pending.
Final verification/report: complete. Durable docs/superpowers/reports/2026-10-04-minimal-dark-ui.md and evidence folder contain commands/results/TDD/task+whole-branch+scoped reviews/QA and explicit residuals. Final fresh audit exit1/9 (6high/3moderate). Collector wrong-relative-path and generated text EOF whitespace were diagnosed and corrected in evidence only; final staged checks clean. Source HEAD remains d8cce0d; final documentation commit and integration menu pending. Workspace retained because fixes are not merged and synthetic preview depends on it.

Ruling: accept the review's declined judgments as explicit limits rather than adding unrelated scope or claiming certification — each aligns with the approved UI non-goals, pending roadmap or unavailable execution evidence — cost if wrong: native/vendor/unsupported-data behavior or remaining security/release issues can still fail despite synthetic checks. Dispositions: native delivery/reopen/ports/focus remains unverified; live screen-reader/exhaustive geometry remains unverified; generated equivalence is resolved by the final fresh build but release reproducibility remains pending; exception/storage/transactions/session/integrity/launch/Steam/ownership/metadata roadmap remains pending; broad host lifecycle remains pending; same-user/trusted-origin compromise stays excluded by the established threat model; successful real vendor operations are not tested; unused mapping interface is retained without new mapping UI; unknown-platform/case/overlap/timer resilience remains pending supported-data validation work; dependencies/formatter/pipeline/extraction stay separate debt.

Formatter diagnostic investigation: verify command exit2, initial line-based `error WHITESPACE` count95 omitted70 Program diagnostics wrapped by PowerShell native stderr rendering; raw `WHITESPACE:` occurrence count165 confirms unchanged baseline. Log final-formatter.log. No formatting/source fix attempted.

Ruling: use three standard columns starting at the existing lg/1024px breakpoint — actual 1200×800 synthetic preview showed two ~440×550 covers with actions at the viewport edge; three better matches approved direction A — cost if wrong: the default desktop grid is denser than a two-column preference. Existing density alternatives remain available. Sent to implementer before task completion; compact/window validation still required.

## Preview instrumentation

Ignored synthetic React preview in this plan workspace imports actual GameLibrary, substitutes only hook/API module boundaries via an isolated Vite config, and has no backend proxy. All account mutations reject; launch returns preview-only failure. Original production auth/session/bootstrap source is untouched. Preview server session 40019, loopback 5176; browser tab 123899630. Actual old UI rendered after setup fixes.

Setup debugging (not production bugs): package metadata confirmed React plugin exports index.js, not initially assumed index.mjs; plugin config bundled under scratch could not resolve react-refresh, so fixture uses Vite's built-in JSX transform; Tailwind config is discovered from process cwd, so preview starts from the UI directory. Root causes were confirmed from logs/package/config paths before each scoped fixture adjustment. No new dependency or product configuration was added.
