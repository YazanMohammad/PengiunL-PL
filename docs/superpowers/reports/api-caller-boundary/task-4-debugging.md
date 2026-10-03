# Task 4 resolved verification issues

Systematic debugging was read and applied before changes.

1. Integration selector: the first implementation run passed nine of eleven cases. The App rendered Synthetic Game in h2, a span and its card h3; the singular findByText query was ambiguous. A repeat run confirmed it. Source inspection confirmed the card heading. Only the two test selectors changed to findByRole(heading, level 3); no App/component behavior changed. The original RED failures occurred earlier on missing disconnected copy and absent initialization, so this test correction did not replace the intended gate RED.
2. Test typecheck: npm run typecheck initially exited 2 on ImportMeta.env in Main. Production tsc includes src/vite-env.d.ts and passed; test tsconfig includes tests/vitest config, excluding the declaration even when importing Main. listFiles confirmed Main was included without vite/client or vite-env. The gate test now references the approved declaration with a type-only triple-slash reference. No compiler config, dependency or production behavior changed. Both tsc checks now pass.
3. A read-only Node bundle probe exited 1 because PowerShell's native argument handling removed nested quotes. It was replaced with a native PowerShell read-only probe, exit 0, shown in verification evidence. This was tooling syntax, not a build/product issue.

## Reproduced integration query issue — full output

Command: npm test -- tests/components/ApiSessionGate.test.tsx (DEBUG_PRINT_LIMIT=300); native exit 1.

```text

> penguinlauncher-ui@1.0.0 test
> vitest run tests/components/ApiSessionGate.test.tsx


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ❯ tests/components/ApiSessionGate.test.tsx (11 tests | 2 failed) 2692ms
   ✓ DisconnectedProduction_DoesNotMountDataEffects 17ms
   ✓ ConnectedSession_MountsChildEffectsOnlyAfterConnection 3ms
   ✓ Invalidation_UnmountsDataEffectsAndClearsCredential 2ms
   ✓ StrictMode_CleansSubscriptionsDuringRemountAndFinalUnmount 2ms
   ✓ DevelopmentEntry_ConnectsWithPasswordInputAndClearsEnteredCredential 35ms
   ✓ InvalidDevelopmentEntry_ClearsInputWithoutMountingOrFetchingOrLeaking 8ms
   ✓ ProductionDefault_OffersRelaunchWithoutTokenEntryOrContinuation 1ms
   × RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests 1416ms
     → Found multiple elements with the text: Synthetic Game

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
>
  Synthetic Game
</h2>

Ignored nodes: comments, script, style
<span
  class="text-sm font-semibold text-white/90 line-clamp-2 px-2"
>
  Synthetic Game
</span>

Ignored nodes: comments, script, style
<h3
  class="text-white font-semibold text-xs md:text-sm leading-tight drop-shadow line-clamp-1 group-hover:line-clamp-2 transition-all"
>
  Synthetic Game
</h3>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...
   ✓ RealApp_401DisconnectsAndLateSuccessCannotRestoreOldApp 39ms
   × Main_InitializesAndScrubsBootstrapBeforeCreatingRootAndDataEffects 1135ms
     → Found multiple elements with the text: Synthetic Game

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
>
  Synthetic Game
</h2>

Ignored nodes: comments, script, style
<span
  class="text-sm font-semibold text-white/90 line-clamp-2 px-2"
>
  Synthetic Game
</span>

Ignored nodes: comments, script, style
<h3
  class="text-white font-semibold text-xs md:text-sm leading-tight drop-shadow line-clamp-1 group-hover:line-clamp-2 transition-all"
>
  Synthetic Game
</h3>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div
    id="root"
  />
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class=[32...

Ignored nodes: comments, script, style
<body>
  <div
    id="root"
  />
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class=[32...
   ✓ Main_DisconnectedDevelopmentRendersEntryBeforeAnyAppRequests 32ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests
TestingLibraryElementError: Found multiple elements with the text: Synthetic Game

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
>
  Synthetic Game
</h2>

Ignored nodes: comments, script, style
<span
  class="text-sm font-semibold text-white/90 line-clamp-2 px-2"
>
  Synthetic Game
</span>

Ignored nodes: comments, script, style
<h3
  class="text-white font-semibold text-xs md:text-sm leading-tight drop-shadow line-clamp-1 group-hover:line-clamp-2 transition-all"
>
  Synthetic Game
</h3>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...
 ❯ waitForWrapper node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:86:33
 ❯ tests/components/ApiSessionGate.test.tsx:153:23
    151|   act(() => session.initialize());
    152|   expect(location.hash).toBe('');
    153|   expect(await screen.findByText('Synthetic Game')).toBeInTheDocument(…
       |                       ^
    154|   expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual(['/api/games…
    155|   for (const [, options] of fetchSpy.mock.calls) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > Main_InitializesAndScrubsBootstrapBeforeCreatingRootAndDataEffects
TestingLibraryElementError: Found multiple elements with the text: Synthetic Game

Here are the matching elements:

Ignored nodes: comments, script, style
<h2
  class="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
>
  Synthetic Game
</h2>

Ignored nodes: comments, script, style
<span
  class="text-sm font-semibold text-white/90 line-clamp-2 px-2"
>
  Synthetic Game
</span>

Ignored nodes: comments, script, style
<h3
  class="text-white font-semibold text-xs md:text-sm leading-tight drop-shadow line-clamp-1 group-hover:line-clamp-2 transition-all"
>
  Synthetic Game
</h3>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div
    id="root"
  />
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class=[32...

Ignored nodes: comments, script, style
<body>
  <div
    id="root"
  />
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class=[32...
 ❯ waitForWrapper node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:86:33
 ❯ tests/components/ApiSessionGate.test.tsx:207:25
    205|     expect(fetchSpy).not.toHaveBeenCalled();
    206|     render(tree);
    207|     expect(await screen.findByText('Synthetic Game')).toBeInTheDocumen…
       |                         ^
    208|     for (const [, options] of fetchSpy.mock.calls) {
    209|       expect(new Headers(options?.headers).get('Authorization')).toBe(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 9 passed (11)
   Start at  01:12:27
   Duration  3.74s (transform 226ms, setup 201ms, collect 37ms, tests 2.69s, environment 530ms, prepare 86ms)

NATIVE_EXIT=1
```

## typecheck

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

Command: `npm run typecheck`; native exit 2.

```text

> penguinlauncher-ui@1.0.0 typecheck
> tsc --noEmit && tsc --project tsconfig.test.json --noEmit

src/main.tsx(12,56): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
NATIVE_EXIT=2
```

## Targeted test-project declaration diagnosis

Command: npx tsc --project tsconfig.test.json --noEmit --listFiles, Select-String filters error/vite-env/vite-client/Main; native exit 2. The filter is a diagnostic, not the full matrix evidence.

```text

src/main.tsx(12,56): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui/src/main.tsx
NATIVE_EXIT=2
```
