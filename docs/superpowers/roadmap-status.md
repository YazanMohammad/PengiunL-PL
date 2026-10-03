# Approved roadmap tracking

Audit: repository assessment delivered in the conversation on 2026-10-03.
Source baseline: `3c1f2c3`.
Implementation branch: `improvement/production-hardening`.
Worktree: `.worktrees/production-hardening`.

The roadmap is approved in scope. Individual architectural specs and task plans
remain subject to the requested Superpowers design review stages. Test
infrastructure is implemented without runtime source changes; later runtime
improvements remain pending their own design and plan reviews.

| Project | Brainstorming classification | Audit coverage | Status |
| --- | --- | --- | --- |
| 1. Test infrastructure | Architectural: new test projects and verification interfaces | H7; prerequisite for behavior changes | Implemented/reviewed; final 64 backend + 19 frontend tests and builds verified; report records residual tooling checks |
| 2a. Local API caller boundary | Architectural: per-run client authentication and host/UI contract | C1; minimal M2 bootstrap prerequisites | Written [spec](specs/2026-10-03-api-caller-boundary-design.md) approved; [plan](plans/2026-10-03-api-caller-boundary.md) awaiting review; implementation not started |
| 2b. API exception-response redaction | Bounded if shared error contract fits existing handlers; upgrade if interfaces change | M3; coordinated with 2a boundary errors | Next focused design after 2a; existing exception leakage remains unresolved |
| 3. Account identifiers and backup containment | Architectural: persisted storage identity and reversible migration | C2 | Pending its own spec and plan |
| 4. Transactional persistence | Architectural: storage interface and commit/recovery semantics | H2 | Pending its own spec and plan |
| 5. Serialized and recoverable session operations | Architectural: per-platform coordinator, staged restore, protected backups | H1, H3, M1 | Pending its own spec and plan |
| 6a. Account/game referential integrity | Bounded if existing storage update API suffices; otherwise upgrade to architectural | H6 | Pending short design after project 4 |
| 6b. Desktop command parsing and process launch | Architectural: typed launch command replaces shell execution | H4 | Pending its own spec and plan |
| 6c. Steam configuration and deletion semantics | Architectural: lossless edits, atomic writes, explicit deletion contract | H5 | Pending its own spec and plan |
| 7. Host lifecycle | Architectural: readiness, port selection, shutdown and credential coordination | M2 | Pending its own spec and plan |
| 8a. Ownership semantics | Architectural: verified/inferred/unknown data and UI contract | M4 | Pending its own spec and plan |
| 8b. Metadata refresh propagation | Architectural: lifecycle-owned background updates and persistent publication | M5 | Pending its own spec and plan |
| 9a. Frontend tooling advisory remediation | Bounded dependency/configuration migration if interfaces remain intact; upgrade if complexity grows | M6 plus new Vitest/mocker GHSA-82fw-gwwq-j7x9 and encoding deprecation | Pending compatibility investigation/design; required before test API/browser/public mocker serving |
| 9b. Unified reproducible release pipeline | Architectural: pinned tools, clean build, CI and package verification | M7 | Pending its own spec and plan |
| 10a. Formatting | Bounded mechanical change, separate commit | L1 formatter failures | Deferred until behavior projects are reviewed |
| 10b. Responsibility-based module extraction | Classify each extraction against actual changed interfaces; do not split on size alone | L1 maintainability hotspots | Deferred, evidence-driven |
| 10c. Repository hygiene and documentation | Bounded repository configuration and operational documentation | L2 and missing docs | Git baseline and ignore rules established; docs/release cleanup pending |

## Setup decisions

- The original snapshot had no Git history to recover. Initialized a local
  `main` branch and committed the existing source and shipped `wwwroot` assets.
- Added ignore rules for installed dependencies, generated builds, release
  output, test artifacts, and local worktrees. No existing artifact was deleted.
- No configured Git author identity was available. The baseline commit uses
  the automation identity `Codex <codex@openai.com>` via command-local options;
  global identity configuration was not changed.
- Runtime source changes, security remediations, and claims of completion are
  pending the design and implementation stages.

## Fresh isolated-worktree baseline

| Working directory | Command | Observed result |
| --- | --- | --- |
| Worktree root | `dotnet restore PenguinLauncher.sln` | Exit 0; restored existing references |
| UI | `npm ci --ignore-scripts` | Exit 0; 181 packages installed from unchanged lockfile; seven advisory findings |
| UI | `npm run build` | Exit 0; TypeScript and Vite build succeeded; 1,987 modules |
| Worktree root | `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal` | Exit 0; zero warnings/errors |
| Worktree root | `dotnet test PenguinLauncher.sln --no-restore --verbosity normal` | Exit 0; no test projects/cases discovered |
| Worktree root | `dotnet format PenguinLauncher.sln --verify-no-changes --no-restore --verbosity minimal` | Exit 2; 233 WHITESPACE diagnostics; original audit reported exit 1 with the same diagnostic count |
| Worktree root | `git diff --quiet -- src` | Exit 0 after reverting only the build-generated HTML newline drift with apply_patch |

The worktree checkout converted source HTML to CRLF under existing Git defaults;
Vite preserved some CRLF while adding LF script/style lines. The resulting
generated HTML differed only in line endings (`git diff --ignore-space-at-eol`
was empty). The generated HTML was returned to the committed baseline; no
production source change was retained. Line-ending policy belongs to the release
pipeline project and was not bundled into setup.

## Required execution evidence

For every behavioral improvement: regression test red result before code;
minimal fix; green focused test; full project tests; applicable typecheck,
lint/formatter and builds; focused commit; independent review and fix/re-review.
Keep distinct baseline failures visible until the owning project resolves them.

At the end, obtain a fresh whole-branch review for regressions, verify every
roadmap row and all audit IDs, run the full matrix again, and apply
`superpowers:verification-before-completion` before claims of completion.
