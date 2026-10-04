# Fresh whole-project / whole-branch review

Reviewed range: `3c1f2c32d9156ac4669771afb36d9e607617def4..064f297bc89af6fe01cd5d3834d36ee73de0e70a`, branch `improvement/production-hardening`. Review date: 2026-10-04. UI project begins after `0c6261e`; earlier test-infrastructure and authenticated-API changes are evaluated under their own approved scope, not incorrectly treated as UI scope expansion.

## Strengths

- The design is implemented through the existing components and shared tokens. `src/penguinlauncher-ui/src/index.css:5` supplies fixed dark surfaces, restrained sage controls and dark primary foreground; `GameLibrary.tsx:270` keeps three density choices while reducing the standard desktop grid to three columns. Search, all five library platforms, account filters, sort choices and 80/+100/Show All pagination remain reachable. Removing the spotlight does not remove Play or Details.
- Presentation changes preserve orchestration: the library's preflight, selected-account targeting, conflict selection and mapping callbacks remain in their existing owner. `tests/components/GameLibrary.test.tsx:86` and subsequent tests assert selected standby targeting, local multi-owner selection, server conflicts and pagination with real child components and synthetic boundaries. Card/list actions are siblings of their keyboard-accessible details body, preventing nested controls and duplicate launch events.
- Dialog fields now have actual label associations and platform groups, icon actions identify the account, and errors/busy states have alert/status semantics. The deletion warning and destructive action remain explicit. Opaque dialogs and bounded scrolling use the existing Radix primitives.
- The whole branch keeps the capability policy, HTTP boundary, host startup and client session concerns separate. `src/PenguinLauncher/Hosting/LocalApiBoundary.cs:7` enforces authority/origin/authentication before handlers and restores CORS/no-store at response start; `LocalApiHost.cs:23` awaits readiness before native delivery. `src/penguinlauncher-ui/src/api/client.ts:6` protects credentials/redirect handling and rejects stale responses after invalidation. Gate integration still prevents initial unauthenticated effects.
- Test fixtures avoid real vendor services: TestServer synthetic handlers, rejecting swappers, guard-only storage sentinels, controlled fetch and recording Kestrel transport are explicit. Characterization and RED/GREEN evidence are distinguished. Task 2 reports 152 frontend/355 backend tests plus passing typecheck/build; controller final fresh verification is still required and was deliberately not duplicated here.

## Issues

### Critical (Must Fix)

None found in reviewed source.

### Important (Should Fix)

1. **The new keyboard details path loses its originating focus on dismissal.**

   Evidence: `src/penguinlauncher-ui/src/components/GameLibrary.tsx:427`, `:447`, `:517`; `GameDetailsModal.tsx:38`; `ui/dialog.tsx:34`. Card/row body activation opens a controlled `Dialog`, but the dialog has neither a `DialogTrigger` nor custom close autofocus restoring the initiating element. The installed Radix implementation (`node_modules/@radix-ui/react-dialog/dist/index.js:205`) prevents default close autofocus and focuses only its trigger ref, which is unset in this composition.

   The controller's actual React browser check at this HEAD focused `Open details for Hades`, pressed Enter, observed the dialog focus Launch, then pressed Escape; `document.activeElement` became `{tag:'BODY',label:null}`. This confirms a keyboard usability defect, beyond an ambiguous accessibility-tree observation: after inspecting a game, the user loses their position in an up-to-80-item library instead of returning to that game. The new body action routes an ordinary library interaction into this defective cycle. The existing Details/Accounts controlled paths share the same restoration limitation.

   `tests/components/DialogPresentation.test.tsx:60` proves restoration only for a standalone primitive with `DialogTrigger`; the application does not use that composition. `LibraryControls.test.tsx:76` tests keyboard callback invocation, not the complete open/close cycle.

   Fix: preserve and restore the actual initiating element for controlled dialogs (with a safe fallback if it no longer exists), respecting stacked dialogs and caller autofocus handlers. Add an observed failing integration regression using the real GameLibrary for both grid/list body and Details button: focus origin, activate via keyboard, dismiss via Escape/Close, assert the original control has focus. Check nested account-dialog dismissal returns to its parent action, and retain the existing Radix focus trap/close behavior. No launch/account request is needed for this regression.

### Minor (Nice to Have)

1. **Nested account forms can announce an unrelated previous operation's error.**

   `src/penguinlauncher-ui/src/components/AccountsManagerModal.tsx:192` derives every form alert from the same manager-wide status. It is rendered at `:531`, `:622`, `:704` and `:761`, while form-opening handlers (`:292`, `:305`, `:445`, `:460`) do not clear or scope it. Fail Capture, Cancel, then open Add/Rename/Remove during the four-second lifetime (`:74`): the new form announces the capture failure. This is misleading feedback, not evidence of wrong account mutation. Scope form errors to their originating operation or clear them when entering another form; a synthetic failed-capture-then-open-add regression is sufficient. This confirms the deferred Task 2 minor.

2. **Exact approved palette is not protected by the current theme tests.**

   `src/penguinlauncher-ui/tests/components/DarkTheme.test.tsx:6` checks absence of gradient/shadow/blur classes but never loads/asserts CSS token values or primary foreground. Current values in `src/index.css:9`, `:17`, `:18`, `:22` match the approved palette; this is a coverage improvement, not a current visual defect. A small palette contract test could catch returning to the old purple theme or white text on sage while all current tests still pass. Keep it focused rather than snapshotting complete component markup. This remains optional and confirms the deferred Task 1 minor.

## Plan alignment and evidence limits

The approved artwork-led UI direction, opaque shared presentation, persistent actions, platform/density/sort/pagination preservation and unchanged API/account/security contracts are supported by the source and supplied synthetic evidence. The three-column desktop ruling is consistent with the intended calmer layout and the controller's 1200x800 observation. The list metadata correction is present. No UI dependency/backend/storage addition was found; earlier boundary work legitimately changes authentication under its separate approved spec.

Review used the supplied complete-range commit/stat package and readable source companion, then read final production code and relevant tests/fixtures in bounded passes. Reviewed the UI spec/plan, preceding phase specs, roadmap, task reviews/reports and prior boundary acceptance. Large combined outputs that truncated were followed by focused source reads for the affected production areas. This is a whole-branch source review, not a claim to have independently semantically verified every minified artifact or every historical log line. HEAD was verified as `064f297`; tracked status was clean. No suite, build, vendor operation or native app was run by this reviewer, and only this ignored report was written.

## Recommendations

Fix the Important focus defect with RED/GREEN integration evidence and scoped re-review before accepting the UI. Resolve or explicitly disposition the two minors. Then perform the controller's planned fresh complete test/typecheck/build/Release/diff matrix and repeat the actual keyboard browser check. Keep existing formatter 165 diagnostics and npm 9 advisory entries visible as pending debt; passing UI tests do not close them.

## Declined to judge

- Actual Photino token-fragment delivery, session reload/reopen, native focus/geometry and occupied-port desktop behavior: no isolated native execution evidence; browser/jsdom/managed callbacks cannot certify these. Remains unverified, not passed.
- Live screen-reader announcements and geometry outside the supplied 1200x800 and 640x800 synthetic browser observations: no direct assistive-technology or exhaustive viewport evidence. Source semantics were reviewed; no universal accessibility certification is claimed.
- Generated minified bundle equivalence and packaged release reproducibility: controller fresh build/comparison follows review; inspecting authored source and build reports is insufficient to certify final artifacts.
- General API exception leakage and error-decoder robustness, account ID/backup containment, transactional persistence, serialized/recoverable session operations, referential integrity, desktop command parsing, Steam configuration/deletion, ownership truth and metadata propagation: explicitly pending roadmap 2b and 3-8, unchanged implementations in this range; review does not declare them secure or correct.
- Broader desktop host disposal, dynamic ports and recovery: remaining project 7 scope. Managed readiness, listener restrictions and restored headless disposal were reviewed; full lifecycle certification is withheld.
- Same-user malware/debugger/native-dependency compromise and trusted-origin script compromise: explicit capability threat-model exclusions, not properties supplied by this branch.
- Successful real vendor capture/switch/logout/install/launch and credential persistence: prohibited as review tests and not isolated by the current successful-business-flow seams. Synthetic request/callback preservation is the evidence available.
- Adding a game/account mapping UI for the existing unused `onMapAccount` prop: no rendered mapping control exists in the baseline; adding one would introduce a new workflow beyond preservation. Existing callback/API contracts remain present.
- Restoring resilience for arbitrary unknown platform values, account-ID case-consistency across every pre-existing consumer, overlapping operation coordination and old status timeout races: no demonstrated new supported-data regression from this UI change; broader validation/ownership/session work remains pending. All five supported library platform values are retained.
- Dependency advisory remediation, broad formatter cleanup, release pipeline changes and module extraction: explicit roadmap 9-10 work; UI dependency set is unchanged. Existing formatter/advisory failures remain real pending issues, not waived successes.

## Assessment

**Ready to merge? With fixes.**

No Critical issue or additional Important backend/client regression was found, and most UI preservation requirements are well supported. The confirmed loss of focus on the new details interaction must be fixed and re-reviewed before acceptance; final controller verification and the explicit native/release limits still apply. This verdict is not merge/push authorization or a production-security certification.
