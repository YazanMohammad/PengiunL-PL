# Task 4 RED evidence — before gate/Main implementation

Cwd: src/penguinlauncher-ui. Command: `npm test -- tests/components/ApiSessionGate.test.tsx`.

The minimal compiling gate shell rendered children unconditionally. First one-case run: native exit 1, effect called once instead of zero. Full gate suite: all 9 failed before implementation. The final pre-implementation run includes the two Main cases: all 11 failed for absent gate behavior and absent synchronous initialization. DEBUG_PRINT_LIMIT=300 only limits Testing Library's DOM diagnostic, not command output.

Outputs preserve command content; ANSI styling, line endings and trailing whitespace are normalized for durable Markdown.

## First one-case RED run

```text
> penguinlauncher-ui@1.0.0 test
> vitest run tests/components/ApiSessionGate.test.tsx

 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ❯ tests/components/ApiSessionGate.test.tsx (1 test | 1 failed) 18ms
   × DisconnectedProduction_DoesNotMountDataEffects 17ms
     → expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []

Number of calls: 1

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > DisconnectedProduction_DoesNotMountDataEffects
AssertionError: expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []

Number of calls: 1

 ❯ tests/components/ApiSessionGate.test.tsx:14:23
     12|   const Child = () => { React.useEffect(mounted, []); return <div>Data…
     13|   render(<ApiSessionGate session={apiSession} allowDevelopmentEntry={f…
     14|   expect(mounted).not.toHaveBeenCalled();
       |                       ^
     15|   expect(fetchSpy).not.toHaveBeenCalled();
     16|   expect(screen.queryByText('Data view')).not.toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  01:08:56
   Duration  1.13s (transform 36ms, setup 246ms, collect 33ms, tests 18ms, environment 530ms, prepare 103ms)

NATIVE_EXIT=1
```

## Final pre-implementation run, full native output

```text

> penguinlauncher-ui@1.0.0 test
> vitest run tests/components/ApiSessionGate.test.tsx


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ❯ tests/components/ApiSessionGate.test.tsx (11 tests | 11 failed) 1687ms
   × DisconnectedProduction_DoesNotMountDataEffects 17ms
     → expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []


Number of calls: 1

   × ConnectedSession_MountsChildEffectsOnlyAfterConnection 2ms
     → expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []


Number of calls: 1

   × Invalidation_UnmountsDataEffectsAndClearsCredential 4ms
     → expected "spy" to be called once, but got 0 times
   × StrictMode_CleansSubscriptionsDuringRemountAndFinalUnmount 3ms
     → expected +0 to be 1 // Object.is equality
   × DevelopmentEntry_ConnectsWithPasswordInputAndClearsEnteredCredential 4ms
     → Unable to find a label with the text of: /session token/i

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Development data
    </div>
  </div>
</body>
   × InvalidDevelopmentEntry_ClearsInputWithoutMountingOrFetchingOrLeaking 1ms
     → Unable to find a label with the text of: /session token/i

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Data view
    </div>
  </div>
</body>
   × ProductionDefault_OffersRelaunchWithoutTokenEntryOrContinuation 1ms
     → Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Production data
    </div>
  </div>
</body>
   × RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests 435ms
     → Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...
   × RealApp_401DisconnectsAndLateSuccessCannotRestoreOldApp 1047ms
     → Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
      >
        <header
          class="flex items-c...
   × Main_InitializesAndScrubsBootstrapBeforeCreatingRootAndDataEffects 132ms
     → expected false to be true // Object.is equality
   × Main_DisconnectedDevelopmentRendersEntryBeforeAnyAppRequests 41ms
     → Unable to find a label with the text of: /session token/i

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

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > DisconnectedProduction_DoesNotMountDataEffects
AssertionError: expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []


Number of calls: 1

 ❯ tests/components/ApiSessionGate.test.tsx:51:23
     49|   const Child = () => { React.useEffect(mounted, []); return <div>Data…
     50|   render(<ApiSessionGate session={apiSession} allowDevelopmentEntry={f…
     51|   expect(mounted).not.toHaveBeenCalled();
       |                       ^
     52|   expect(fetchSpy).not.toHaveBeenCalled();
     53|   expect(screen.queryByText('Data view')).not.toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > ConnectedSession_MountsChildEffectsOnlyAfterConnection
AssertionError: expected "spy" to not be called at all, but actually been called 1 times

Received:

  1st spy call:

    Array []


Number of calls: 1

 ❯ tests/components/ApiSessionGate.test.tsx:63:23
     61|   const Child = () => { React.useEffect(mounted, []); return <div>Conn…
     62|   render(<ApiSessionGate session={session}><Child /></ApiSessionGate>);
     63|   expect(mounted).not.toHaveBeenCalled();
       |                       ^
     64|   act(() => { session.connect(TOKEN); });
     65|   expect(mounted).toHaveBeenCalledOnce();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > Invalidation_UnmountsDataEffectsAndClearsCredential
AssertionError: expected "spy" to be called once, but got 0 times
 ❯ tests/components/ApiSessionGate.test.tsx:77:21
     75|   expect(screen.getByText('Private data')).toBeInTheDocument();
     76|   act(() => session.invalidate(session.getSnapshot().generation));
     77|   expect(unmounted).toHaveBeenCalledOnce();
       |                     ^
     78|   expect(screen.queryByText('Private data')).not.toBeInTheDocument();
     79|   expect(screen.getByText(/relaunch/i)).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > StrictMode_CleansSubscriptionsDuringRemountAndFinalUnmount
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ tests/components/ApiSessionGate.test.tsx:94:32
     92|   });
     93|   const view = render(<React.StrictMode><ApiSessionGate session={sessi…
     94|   expect(activeListeners.size).toBe(1);
       |                                ^
     95|   expect(unsubscribe).toHaveBeenCalledOnce();
     96|   act(() => { session.connect(TOKEN); });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > DevelopmentEntry_ConnectsWithPasswordInputAndClearsEnteredCredential
TestingLibraryElementError: Unable to find a label with the text of: /session token/i

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Development data
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/@testing-library/dom/dist/queries/label-text.js:111:38
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ tests/components/ApiSessionGate.test.tsx:106:24
    104|   const session = isolatedSession();
    105|   render(<ApiSessionGate session={session} allowDevelopmentEntry><div>…
    106|   const input = screen.getByLabelText(/session token/i) as HTMLInputEl…
       |                        ^
    107|   expect(input.type).toBe('password');
    108|   fireEvent.change(input, { target: { value: TOKEN } });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > InvalidDevelopmentEntry_ClearsInputWithoutMountingOrFetchingOrLeaking
TestingLibraryElementError: Unable to find a label with the text of: /session token/i

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Data view
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/@testing-library/dom/dist/queries/label-text.js:111:38
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ tests/components/ApiSessionGate.test.tsx:122:24
    120|   vi.mocked(fetch).mockResolvedValueOnce(json({}));
    121|   render(<ApiSessionGate session={session} allowDevelopmentEntry><Chil…
    122|   const input = screen.getByLabelText(/session token/i) as HTMLInputEl…
       |                        ^
    123|   fireEvent.change(input, { target: { value: INVALID_TOKEN } });
    124|   fireEvent.click(screen.getByRole('button', { name: /connect/i }));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > ProductionDefault_OffersRelaunchWithoutTokenEntryOrContinuation
TestingLibraryElementError: Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      Production data
    </div>
  </div>
</body>
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ tests/components/ApiSessionGate.test.tsx:135:17
    133| it('ProductionDefault_OffersRelaunchWithoutTokenEntryOrContinuation', …
    134|   render(<ApiSessionGate><div>Production data</div></ApiSessionGate>);
    135|   expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
       |                 ^
    136|   expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
    137|   expect(screen.queryByRole('button')).not.toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests
TestingLibraryElementError: Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ tests/components/ApiSessionGate.test.tsx:148:17
    146|     .mockResolvedValueOnce(json(system));
    147|   render(<Gate session={session}><App /></Gate>);
    148|   expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
       |                 ^
    149|   expect(fetchSpy).not.toHaveBeenCalled();
    150|   history.replaceState(null, '', `/#penguin-session=${TOKEN}`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > RealApp_401DisconnectsAndLateSuccessCannotRestoreOldApp
TestingLibraryElementError: Unable to find an element with the text: /relaunch/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      <header
        class="flex items-center justify-between px-6 py-3.5 border-b border-wh...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
      >
        <header
          class="flex items-c...
 ❯ Proxy.waitForWrapper node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ tests/components/ApiSessionGate.test.tsx:175:9
    173|   expect(fetchSpy).toHaveBeenCalledTimes(3);
    174|   await act(async () => { rejectSession(new Response('{"error":"Authen…
    175|   await waitFor(() => expect(screen.getByText(/relaunch/i)).toBeInTheD…
       |         ^
    176|   expect(session.getCredential()).toBeNull();
    177|   expect(sessionStorage.getItem('penguin.api.session')).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > Main_InitializesAndScrubsBootstrapBeforeCreatingRootAndDataEffects
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ Object.<anonymous> tests/components/ApiSessionGate.test.tsx:192:45
    190|   let tree: React.ReactNode;
    191|   vi.spyOn(ReactDOM, 'createRoot').mockImplementation(() => {
    192|     expect(session.getSnapshot().connected).toBe(true);
       |                                             ^
    193|     expect(location.hash).toBe('');
    194|     return { render: node => { tree = node; }, unmount: vi.fn() };
 ❯ src/main.tsx:6:10
 ❯ tests/components/ApiSessionGate.test.tsx:204:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  tests/components/ApiSessionGate.test.tsx > Main_DisconnectedDevelopmentRendersEntryBeforeAnyAppRequests
TestingLibraryElementError: Unable to find a label with the text of: /session token/i

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
 ❯ Object.getElementError node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getAllByLabelText node_modules/@testing-library/dom/dist/queries/label-text.js:111:38
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ tests/components/ApiSessionGate.test.tsx:225:19
    223|     await import('../../src/main');
    224|     render(tree);
    225|     expect(screen.getByLabelText(/session token/i)).toHaveAttribute('t…
       |                   ^
    226|     expect(screen.queryByText('Penguin Launcher')).not.toBeInTheDocume…
    227|     expect(fetch).not.toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed (11)
   Start at  01:11:20
   Duration  2.70s (transform 242ms, setup 205ms, collect 37ms, tests 1.69s, environment 501ms, prepare 86ms)

NATIVE_EXIT=1
```
