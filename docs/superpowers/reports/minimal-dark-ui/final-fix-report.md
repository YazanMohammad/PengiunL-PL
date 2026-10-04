# Consolidated final-review fix report

Status: DONE_WITH_CONCERNS (the bounded fixes are implemented and verified; controller browser/native/release checks and inherited debt remain separate).

Worktree: `C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening`.
BASE: `064f297bc89af6fe01cd5d3834d36ee73de0e70a`.
Final HEAD: `d8cce0d8fa41fc7c3591b6a90526bea902d7cf41`.

Read the complete final-fix brief, final-review findings, approved UI design, TDD skill, writing-good-tests reference, systematic-debugging skill, and verification-before-completion skill. No subagents were used. No controller ledger/preview, backend, API client, hooks, session, storage, configuration, or dependencies were changed. No real account/vendor action, restart, merge, or push occurred.

## Implementation and root causes

### Controlled-dialog focus

The real library details modal uses a controlled Radix Root without a Trigger. Installed Radix modal close autofocus prevents default and focuses only its trigger ref, which is absent. Its FocusScope captures previous focus internally but Radix's modal handler prevents that fallback. AccountsManager's Add/Rename fields additionally use React `autoFocus`, which can run before Radix's `onOpenAutoFocus`; capturing only in that callback would already have lost the initiating parent action.

The shared `Dialog` now wraps the existing Radix Root with one focus context. It keeps controlled/uncontrolled/default-open semantics and snapshots the active element on the closed-to-open render transition, before descendants commit autofocus. React render-state adjustment avoids mutating a ref during an abandoned render. It retains the origin across closing renders. Existing props, children, modal selection, and `onOpenChange` are forwarded; no new trap or dialog framework was added.

`DialogContent` keeps Radix opening autofocus unchanged. Its stable close handler invokes the caller's close autofocus first, respects `preventDefault`, and restores the captured origin only for modal dialogs. It retains focus inside a newer open dialog if an underlying dialog closes, returns a nested form to its connected parent action, and otherwise uses a connected enabled visible-by-attribute candidate in the remaining parent dialog or main/body region. If a remaining parent has no candidate, the parent dialog itself is focused. Existing Radix trapping, dismissal, portal, Trigger/Close primitives, callbacks, and busy controls remain in place.

Regression tests render real GameLibrary, GameDetailsModal, AccountsManagerModal and shared Radix components. Eight combinations cover grid/list, body/Details, and Escape/Close, asserting the initiating control regains focus and no launch occurs. Native button keyboard click synthesis is explicitly supplied by `fireEvent.click` after Enter because jsdom does not synthesize it; the body uses its real Enter handler. Four nested forms cover Add/Capture/Rename/Remove, including Add/Rename input autofocus. Removed-origin fallback is exercised. Compatibility checks cover caller opening/closing autofocus override, existing Trigger restoration, outside-focus trapping, and an underlying modal closing without moving focus from the newer modal's second action. Only the existing synthetic external hook/API boundaries are replaced.

### Form-error scope

The manager previously rendered the same manager-wide error in every nested form. Status now carries an optional operation name; add/capture/rename/delete catch handlers tag their existing error message, and each form renders only its matching error. Manager-wide status and the existing four-second timeout remain unchanged. Existing successful results, error copy, busy updates, refresh callbacks, API calls and payloads are unchanged. The Capture -> failure -> Cancel -> Add regression confirms Capture's relevant failure is announced, remains in the manager before/after Add, and is absent from Add before timeout.

### Palette characterization

The current palette was already correct. The test parses the actual CSS with the already-declared PostCSS dependency, loads the root declarations into the document, asserts the seven approved HSL tokens through computed custom properties, and checks the default Button consumes primary and dark primary foreground classes. It does not alter CSS values or snapshot component markup. This is characterization, not RED evidence.

## Exact test sequence and results

Frontend commands ran in `src/penguinlauncher-ui`; backend/diff commands ran at the worktree root. Counts below include every failure observed. Vitest 3.2.6 was used. No test was skipped.

### Initial RED (before either behavior fix)

Command at 16:20:18:

```text
npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx
Test Files  2 failed (2)
Tests       14 failed | 36 passed (50)
Duration    12.06s
exit 1
```

Failures were the eight `%s %s restores initiating focus after %s` library combinations, four `%s nested dismissal restores its parent action` form cases, `uses a connected fallback when a controlled dialog origin is removed`, and `does not announce a previous capture failure in a newly opened Add form`.

The focus failures were actual assertions, not setup errors: `expect(element).toHaveFocus()` expected the initiating body/Details/parent button (or `Library fallback`) but received `<body>`. The stale-error failure was:

```text
expect(element).not.toBeInTheDocument()
expected document not to contain element, found <p
  class="rounded-md border border-destructive bg-background p-3 text-sm text-red-300"
  role="alert"
>
  Synthetic capture unavailable
</p> instead
```

Caller autofocus composition and the existing Trigger restoration test passed at this stage; these are preserved-behavior checks, not newly RED regressions.

The removed-origin fixture was tightened so the originating DOM node remains permanently removed after dismissal rather than rendering a new replacement button. Before implementation, reran at 16:21:12:

```text
$env:DEBUG_PRINT_LIMIT='200'; npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx --reporter=dot
Test Files  2 failed (2)
Tests       14 failed | 36 passed (50)
Duration    11.43s
exit 1
```

This was the same correct RED set, including the disconnected-origin focus assertion. Large rendered DOM diagnostics were truncated by tool output limits; names/counts/reasons and the final summaries were inspected.

### Intermediate diagnosis, then behavioral GREEN

After the first focus implementation, at 16:22:01:

```text
npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx --reporter=dot
Test Files  1 failed | 1 passed (2)
Tests       4 failed | 46 passed (50)
Duration    5.56s
exit 1
```

Remaining failures were Capture/Rename/Remove nested focus (expected origin, received manager `Refresh`) and the still-unfixed Capture -> Add error. Add and all eight library paths passed. Investigation showed Radix's parent scope may already refocus its first action during child removal. The initial newer-dialog safeguard wrongly treated this ordinary remaining parent as a newer modal. Restricted the safeguard to a remaining dialog that does not contain the recorded origin, allowing return to the correct parent action. Applied the separately RED-proven form status scope.

At 16:22:40:

```text
npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx --reporter=dot
Test Files  2 passed (2)
Tests       50 passed (50)
Duration    4.08s
exit 0
```

### Characterization/compatibility coverage and harness correction

Added palette characterization and a stacked-dialog/trap compatibility check. At 16:24:18:

```text
npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx tests/components/DarkTheme.test.tsx --reporter=dot
Test Files  1 failed | 2 passed (3)
Tests       1 failed | 62 passed (63)
Duration    3.53s
exit 1
```

The only failure was a test-harness error, not a palette regression:

```text
TypeError: The URL must be of scheme file
at readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8')
```

Vitest transforms that module URL to the browser-style test URL. Corrected only the test file read to `readFileSync('src/index.css', 'utf8')`, using the frontend command's project directory. No production palette edit was made; this failure is explicitly not RED.

At 16:24:52:

```text
npm test -- tests/components/GameLibrary.test.tsx tests/components/DialogPresentation.test.tsx tests/components/DarkTheme.test.tsx tests/components/AccountSelectorModal.test.tsx tests/components/LibraryControls.test.tsx --reporter=dot
Test Files  5 passed (5)
Tests       83 passed (83)
Duration    3.69s
exit 0
```

### Full verification

At 16:25:09 `npm test` passed 169/169, nine files, duration 6.42s, exit 0. `npm run typecheck` passed, exit 0 (`tsc --noEmit && tsc --project tsconfig.test.json --noEmit`). Independently:

```text
dotnet test PenguinLauncher.sln --no-restore
Passed! - Failed: 0, Passed: 355, Skipped: 0, Total: 355
Duration: 945 ms - PenguinLauncher.Tests.dll (net10.0)
exit 0
```

First `npm run build` passed (1988 modules, exit 0) and generated `index-CZ1jX1xe.js` / `index-C9g2mKlh.css`. Asset review identified an accidental unused `.container` rule emitted by Tailwind scanning the newly introduced local variable named `container`. Renamed only that new local variable to `focusRegion`; this kept the generated CSS exactly at its original `index-npkNKYyz.css` hash. No palette or configuration change occurred.

After that source-only rename, at 16:27:50 `npm test` again passed 169/169, nine files, duration 3.79s, exit 0. Final production build:

```text
npm run build
tsc && vite build
vite v5.4.21 building for production...
transforming...
1988 modules transformed.
../PenguinLauncher/wwwroot/index.html                 0.73 kB | gzip: 0.42 kB
../PenguinLauncher/wwwroot/assets/index-npkNKYyz.css 25.96 kB | gzip: 5.89 kB
../PenguinLauncher/wwwroot/assets/index-B_76knR7.js 348.01 kB | gzip: 105.41 kB
built in 2.13s
exit 0
```

Strengthened the compatibility assertions without further production changes: focus the newer dialog's second action before closing its parent, and check the Capture result remains in the manager after Add cancellation. Latest full suite at 16:29:56:

```text
npm test
tests/api/client.test.ts                      35 passed
tests/components/DarkTheme.test.tsx           12 passed
tests/components/AccountSelectorModal.test.tsx 6 passed
tests/components/LibraryControls.test.tsx     14 passed
tests/components/ApiSessionGate.test.tsx      12 passed
tests/api/session.test.ts                    36 passed
tests/isolation.test.tsx                      3 passed
tests/components/DialogPresentation.test.tsx 23 passed
tests/components/GameLibrary.test.tsx        28 passed
Test Files  9 passed (9)
Tests       169 passed (169)
Duration    3.74s
exit 0
```

Latest `npm run typecheck` again exited 0 after the final test assertions. No warnings/errors appeared in the final npm/.NET test, typecheck, or build output.

## Generated formatting and commit handling

The build reproduced inherited CR/CRCR whitespace in generated HTML. The initial working diff check listed HTML lines 1-9 and 12-16 as trailing whitespace. Normalized CRs only in the generated HTML with native PowerShell/.NET formatting, matching the existing tracked LF artifact; no source normalization was done.

An attempted delete/add-same-file `apply_patch` for that formatting was rejected before changing anything (`multiple operations target .../wwwroot/index.html`). A diagnostic `git diff --no-index` against the already-removed old generated CSS failed because that old file no longer existed; corrected comparison used `git show HEAD:<old CSS>` and inspected the added `.container` rules. Both were diagnostic/formatting missteps, not concealed test successes.

The first unstaged check could not include untracked JS. After staging, `git diff --cached --check` exposed five inherited blank-line trailing-space diagnostics in the new bundle at lines 277, 281, 285, 289, and 293. Mechanically removed whitespace on otherwise blank lines only in the generated bundle, then reran `node --check` and staged/unstaged/range checks. No generated executable text was manually rewritten.

Initial commit attempts failed with `Author identity unknown`; no commit was created. Unstaged only this wave's palette/assets to recover the intended grouping. The controller supplied the already-established command-local identity, used as `git -c user.name=Codex -c user.email=codex@openai.com commit ...`. No repository/global identity configuration was changed.

## Commits

1. `8249b168b5c391ea45af8e3a96dd18b4ca458ba2` — `fix(ui): restore controlled dialog focus and scope form errors` (shared Dialog, AccountsManager, real-library/dialog regressions and compatibility checks).
2. `a3984d051939aeebc5fc4e3ecc0651210f5754b4` — `test(ui): characterize approved dark palette tokens` (test only).
3. `d8cce0d8fa41fc7c3591b6a90526bea902d7cf41` — `build(ui): regenerate assets for dialog review fixes` (JS replacement and HTML reference; baseline stylesheet unchanged).

After these commits, separately executed:

```text
git diff --check                                      exit 0, empty
git diff --cached --check                             exit 0, empty
git diff --check 064f297bc89af6fe01cd5d3834d36ee73de0e70a..HEAD
                                                     exit 0, empty
git status --short                                    exit 0, empty
node --check src/PenguinLauncher/wwwroot/assets/index-B_76knR7.js
                                                     exit 0, empty
```

This ignored report is the only subsequently written file. Git's expected LF-to-CRLF notices during add/diff operations reflect inherited autocrlf behavior; the actual final diff checks pass.

## Self-review and concerns

- The original Important focus regression now has observed RED/GREEN evidence through actual library composition, not only a standalone Trigger. The original stale-error regression has its own observed correct RED and GREEN; relevant form and manager feedback remain available.
- The root captures before automatic input focus, preserves default/control callbacks, and retains Radix modal mechanics. The close callback is memoized so internal status updates do not replace the close-focus behavior. Caller prevention remains authoritative; non-modal close handling stays with Radix.
- Mutation reasoning: removing origin capture/restoration breaks the library/nested focus regressions; removing the disconnected-origin fallback breaks the fallback test; removing the newer-dialog safeguard moves focus away from its second action; removing the operation match exposes Capture in Add again; old purple/white-on-sage tokens fail the palette characterization.
- Scope review of the final diff found only the two targeted source files, three test files, and generated JS/HTML. No account/API payload, busy-state branch, trap implementation, platform/filter/sort/density/pagination contract, backend, hook, session, storage, dependency, configuration, or preview change.
- The palette test and later compatibility checks are explicitly not claimed as initial RED regressions. The palette test asserts the deliberate styling contract requested by the approved spec and brief.
- No known unresolved failure remains in this bounded fix wave. Actual browser keyboard verification, native Photino/screen-reader verification, independent scoped re-review, and controller final Release/matrix remain for the controller. jsdom's Details-keyboard click limitation is disclosed above.
- Existing formatter debt (165 diagnostics) and npm advisory debt (9 entries) remain as documented in the incoming review; this wave did not rerun or remediate those unrelated workflows. Native/vendor/security/roadmap limits from that review remain unchanged. Passing these UI regressions does not certify them.
