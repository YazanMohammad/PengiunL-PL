# Task 4 verification — final commands and diagnostics

Full command content below; ANSI styling, line endings and trailing whitespace normalized. Commands ran serially. UI tests: 90/90; backend tests: 327/327. No live services or Program.Main were exercised. Initial typecheck failure and its resolved cause appear in task-4-debugging.md.

## Focused gate/Main GREEN

Cwd: src/penguinlauncher-ui. Command: `npm test -- tests/components/ApiSessionGate.test.tsx`; native exit 0.

```text

> penguinlauncher-ui@1.0.0 test
> vitest run tests/components/ApiSessionGate.test.tsx


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ✓ tests/components/ApiSessionGate.test.tsx (11 tests) 730ms
   ✓ RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests  435ms

 Test Files  1 passed (1)
      Tests  11 passed (11)
   Start at  01:12:44
   Duration  1.78s (transform 228ms, setup 198ms, collect 35ms, tests 730ms, environment 493ms, prepare 84ms)

NATIVE_EXIT=0
```

## backend-tests

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening

Command: `dotnet test PenguinLauncher.sln --verbosity minimal`; native exit 0.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Debug\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll
Test run for C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Debug\net10.0\PenguinLauncher.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   327, Skipped:     0, Total:   327, Duration: 862 ms - PenguinLauncher.Tests.dll (net10.0)
NATIVE_EXIT=0
```

## ui-tests

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

Command: `npm test`; native exit 0.

```text

> penguinlauncher-ui@1.0.0 test
> vitest run


 RUN  v3.2.6 C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

 ✓ tests/api/session.test.ts (36 tests) 20ms
 ✓ tests/isolation.test.tsx (3 tests) 17ms
 ✓ tests/api/client.test.ts (35 tests) 26ms
 ✓ tests/components/AccountSelectorModal.test.tsx (5 tests) 115ms
 ✓ tests/components/ApiSessionGate.test.tsx (11 tests) 682ms
   ✓ RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests  406ms

 Test Files  5 passed (5)
      Tests  90 passed (90)
   Start at  01:13:20
   Duration  1.84s (transform 319ms, setup 1.06s, collect 427ms, tests 860ms, environment 2.81s, prepare 438ms)

NATIVE_EXIT=0
```

## typecheck-final

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

Command: `npm run typecheck`; native exit 0.

```text

> penguinlauncher-ui@1.0.0 typecheck
> tsc --noEmit && tsc --project tsconfig.test.json --noEmit

NATIVE_EXIT=0
```

## ui-build

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening/src/penguinlauncher-ui

Command: `npm run build`; native exit 0.

```text

> penguinlauncher-ui@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 1989 modules transformed.
rendering chunks...
computing gzip size...
../PenguinLauncher/wwwroot/index.html                   0.73 kB │ gzip:   0.42 kB
../PenguinLauncher/wwwroot/assets/index-D9HK_ItX.css   47.10 kB │ gzip:   8.70 kB
../PenguinLauncher/wwwroot/assets/index-DNZ_BUpz.js   363.24 kB │ gzip: 108.64 kB
✓ built in 3.44s
NATIVE_EXIT=0
```

## release-build

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening

Command: `dotnet build PenguinLauncher.sln --no-restore --configuration Release --verbosity minimal`; native exit 0.

```text
  PenguinLauncher -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\src\PenguinLauncher\bin\Release\net10.0\win-x64\PenguinLauncher.dll
  PenguinLauncher.Tests -> C:\Users\Yzn\Desktop\PengiunL-PL\.worktrees\production-hardening\tests\PenguinLauncher.Tests\bin\Release\net10.0\PenguinLauncher.Tests.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:02.27
NATIVE_EXIT=0
```

## dotnet-audit

Cwd: C:/Users/Yzn/Desktop/PengiunL-PL/.worktrees/production-hardening

Command: `dotnet list PenguinLauncher.sln package --vulnerable --include-transitive`; native exit 0.

```text
  Determining projects to restore...
  All projects are up-to-date for restore.

The following sources were used:
   https://api.nuget.org/v3/index.json

The given project `PenguinLauncher` has no vulnerable packages given the current sources.
The given project `PenguinLauncher.Tests` has no vulnerable packages given the current sources.
NATIVE_EXIT=0
```

## Generated bundle review

PowerShell reads the generated JS and checks string literals, credential environment names, the synthetic token and the production entry flag. Git verifies unchanged CSS. Native git exit 0.

```text
onSelect:F=>M(F.id),density:w,accounts:t},O.id))}):l.jsxs("div",{className:"space-y-2",children:[l.jsxs("div",{className:"flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/5 select-none",children:[l.jsx("span",{className:"flex-1",children:"Title & Directory"}),l.jsx("span",{className:"hidden sm:block w-48 text-center",children:"Owning Profile"}),l.jsx("span",{className:"hidden md:block w-36 text-center",children:"Status"}),l.jsx("span",{className:"w-44 text-right pr-2",children:"Session Control"})]}),Ae.map(O=>l.jsx(OS,{game:O,onPlay:ge,onDetails:F=>G(F),onSelect:F=>M(F.id),isSelected:(_==null?void 0:_.id)===O.id,accounts:t},O.id))]}),ne.length>E&&l.jsxs("div",{className:"py-8 flex flex-col items-center justify-center gap-2.5",children:[l.jsxs("p",{className:"text-xs text-muted-foreground",children:["Displaying ",l.jsx("span",{className:"font-semibold text-white",children:Ae.length})," of"," ",l.jsx("span",{className:"font-semibold text-white",children:ne.length})," titles"]}),l.jsxs("div",{className:"flex items-center gap-2",children:[l.jsx(ee,{variant:"outline",size:"sm",onClick:()=>C(O=>O+100),className:"text-xs font-semibold rounded-xl border-white/10 hover:bg-white/10",children:"Load More Titles (+100)"}),l.jsxs(ee,{variant:"ghost",size:"sm",onClick:()=>C(ne.length),className:"text-xs text-muted-foreground hover:text-white",children:["Show All (",ne.length,")"]})]})]})]})]})]}),l.jsx(YS,{conflict:$,onSelect:Te,onCancel:()=>L(null)}),l.jsx(XS,{open:J,onOpenChange:H,accounts:t,games:U,onSwapAccount:Re,onRefresh:()=>{a(),i()},onViewAccountGames:O=>{y(O),d("All"),H(!1)},swappingAccountId:s}),l.jsx(ZS,{game:V,accounts:t,onClose:()=>G(null),onPlay:ge,onMapAccount:yt,launching:B===(V==null?void 0:V.id)}),I&&l.jsxs("div",{className:`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold z-50 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${I.type==="success"?"bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/30":I.type==="error"?"bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-900/30":"bg-zinc-900/95 border-violet-500/40 text-zinc-100 shadow-violet-900/20"}`,children:[I.type==="success"?l.jsx($a,{className:"w-4 h-4 text-emerald-400 shrink-0"}):I.type==="error"?l.jsx(Fa,{className:"w-4 h-4 text-rose-400 shrink-0"}):l.jsx("div",{className:"w-3.5 h-3.5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin shrink-0"}),l.jsx("span",{children:I.message})]})]})},eC=()=>l.jsx(JS,{});function tC({children:e,session:t=Mr,allowDevelopmentEntry:n=!1}){const r=h.useSyncExternalStore(t.subscribe,t.getSnapshot),o=h.useId(),s=h.useRef(null),[i,a]=h.useState(!1);if(r.connected)return l.jsx(l.Fragment,{children:e});function c(u){var f;u.preventDefault();const g=((f=s.current)==null?void 0:f.value)??"";s.current&&(s.current.value=""),a(!t.connect(g))}return l.jsxs("main",{className:"h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground",children:[l.jsx("h1",{children:"Launcher disconnected"}),n?l.jsxs("form",{onSubmit:c,children:[l.jsx("p",{children:"Enter the session token configured for the development server."}),l.jsx("label",{htmlFor:o,children:"Session token"}),l.jsx("input",{id:o,ref:s,type:"password",autoComplete:"off",spellCheck:!1}),l.jsx("button",{type:"submit",children:"Connect"}),i&&l.jsx("p",{role:"alert",children:"Enter a valid session token."})]}):l.jsx("p",{children:"Relaunch the native Penguin Launcher to reconnect."})]})}Mr.initialize();Hl.createRoot(document.getElementById("root")).render(l.jsx(_f.StrictMode,{children:l.jsx(tC,{allowDevelopmentEntry:!1,children:l.jsx(eC,{})})}));

{
    "Canonical43CharacterStringLiterals":  0,
    "SyntheticTokenEmbedded":  false,
    "CredentialEnvironmentNamesEmbedded":  false,
    "MainDevelopmentEntryDisabled":  true
}
NATIVE_EXIT=0
```
