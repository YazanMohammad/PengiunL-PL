/// <reference path="../../src/vite-env.d.ts" />
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { apiSession, createApiSession } from '../../src/api/session';
import type { Account, Game, SystemInfo } from '../../src/types';
import { ApiSessionGate } from '../../src/components/ApiSessionGate';

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const INVALID_TOKEN = 'invalid-synthetic-credential';

it('DisconnectedState_IsAnnouncedAndDevelopmentFormUsesNeutralSurfaces', () => {
  render(<ApiSessionGate session={isolatedSession()} allowDevelopmentEntry><div>Private data</div></ApiSessionGate>);
  expect(screen.getByRole('status')).toHaveTextContent('Launcher disconnected');
  expect(screen.getByRole('main')).toHaveClass('overflow-y-auto');
  expect(screen.getByLabelText('Session token')).toHaveClass('bg-background', 'border-border');
  expect(screen.getByRole('button', { name: 'Connect' })).toHaveClass('bg-primary');
});

function isolatedSession() {
  return createApiSession({
    location: { hash: '', pathname: '/', search: '' },
    history: { replaceState: vi.fn() },
    storage: () => sessionStorage,
  });
}

const game: Game = {
  id: 'synthetic-game', name: 'Synthetic Game', platform: 'Steam',
  installPath: 'C:/synthetic/game', launchUri: null, coverImageUrl: null,
  backgroundImageUrl: null, associatedAccountIds: ['synthetic-account'],
  platformGameId: 'synthetic-platform-game', isInstalled: true,
};
const account: Account = {
  id: 'synthetic-account', displayName: 'Synthetic Account', platform: 'Steam',
  platformUserId: 'synthetic-user', isActive: true, sessionBackupPath: null, lastLogin: null,
};
const system: SystemInfo = {
  os: 'Synthetic OS', isWindows: true, isLinux: false, machineName: 'synthetic-machine',
  framework: 'Synthetic Framework', architecture: 'x64',
};
const json = (value: unknown) => new Response(JSON.stringify(value));

async function realAppModules() {
  // Fresh lazy singleton shares the exact instance consumed by the real client.
  vi.resetModules();
  const { apiSession: session } = await import('../../src/api/session');
  const { ApiSessionGate: Gate } = await import('../../src/components/ApiSessionGate');
  const { default: App } = await import('../../src/App');
  return { session, Gate, App };
}

it('DisconnectedProduction_DoesNotMountDataEffects', () => {
  const fetchSpy = vi.mocked(fetch);
  const mounted = vi.fn(() => { void fetch('/data-effect'); });
  // The fetch double is the external boundary; mounting must never reach it.
  fetchSpy.mockResolvedValueOnce(new Response('{}'));
  const Child = () => { React.useEffect(mounted, []); return <div>Data view</div>; };
  render(<ApiSessionGate session={apiSession} allowDevelopmentEntry={false}><Child /></ApiSessionGate>);
  expect(mounted).not.toHaveBeenCalled();
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(screen.queryByText('Data view')).not.toBeInTheDocument();
  expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
});

it('ConnectedSession_MountsChildEffectsOnlyAfterConnection', () => {
  const session = isolatedSession();
  const mounted = vi.fn();
  const Child = () => { React.useEffect(mounted, []); return <div>Connected data</div>; };
  render(<ApiSessionGate session={session}><Child /></ApiSessionGate>);
  expect(mounted).not.toHaveBeenCalled();
  act(() => { session.connect(TOKEN); });
  expect(mounted).toHaveBeenCalledOnce();
  expect(screen.getByText('Connected data')).toBeInTheDocument();
});

it('Invalidation_UnmountsDataEffectsAndClearsCredential', () => {
  const session = isolatedSession();
  session.connect(TOKEN);
  const unmounted = vi.fn();
  const Child = () => { React.useEffect(() => unmounted, []); return <div>Private data</div>; };
  render(<ApiSessionGate session={session}><Child /></ApiSessionGate>);
  expect(screen.getByText('Private data')).toBeInTheDocument();
  act(() => session.invalidate(session.getSnapshot().generation));
  expect(unmounted).toHaveBeenCalledOnce();
  expect(screen.queryByText('Private data')).not.toBeInTheDocument();
  expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
  expect(session.getCredential()).toBeNull();
});

it('StrictMode_CleansSubscriptionsDuringRemountAndFinalUnmount', () => {
  const session = isolatedSession();
  const subscribe = session.subscribe;
  const activeListeners = new Set<() => void>();
  const unsubscribe = vi.fn();
  vi.spyOn(session, 'subscribe').mockImplementation(listener => {
    activeListeners.add(listener);
    const release = subscribe(listener);
    return () => { activeListeners.delete(listener); release(); unsubscribe(); };
  });
  const view = render(<React.StrictMode><ApiSessionGate session={session}><div>Strict data</div></ApiSessionGate></React.StrictMode>);
  expect(activeListeners.size).toBe(1);
  expect(unsubscribe).toHaveBeenCalledOnce();
  act(() => { session.connect(TOKEN); });
  expect(screen.getByText('Strict data')).toBeInTheDocument();
  view.unmount();
  expect(activeListeners.size).toBe(0);
  expect(unsubscribe).toHaveBeenCalledTimes(2);
});

it('DevelopmentEntry_ConnectsWithPasswordInputAndClearsEnteredCredential', () => {
  const session = isolatedSession();
  render(<ApiSessionGate session={session} allowDevelopmentEntry><div>Development data</div></ApiSessionGate>);
  const input = screen.getByLabelText(/session token/i) as HTMLInputElement;
  expect(input.type).toBe('password');
  fireEvent.change(input, { target: { value: TOKEN } });
  expect(document.body.textContent).not.toContain(TOKEN);
  fireEvent.click(screen.getByRole('button', { name: /connect/i }));
  expect(input.value).toBe('');
  expect(session.getCredential()).toBe(TOKEN);
  expect(screen.getByText('Development data')).toBeInTheDocument();
  expect(document.body.textContent).not.toContain(TOKEN);
});

it('InvalidDevelopmentEntry_ClearsInputWithoutMountingOrFetchingOrLeaking', () => {
  const session = isolatedSession();
  const Child = () => { React.useEffect(() => { void fetch('/data-effect'); }, []); return <div>Data view</div>; };
  vi.mocked(fetch).mockResolvedValueOnce(json({}));
  render(<ApiSessionGate session={session} allowDevelopmentEntry><Child /></ApiSessionGate>);
  const input = screen.getByLabelText(/session token/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: INVALID_TOKEN } });
  fireEvent.click(screen.getByRole('button', { name: /connect/i }));
  expect(input.value).toBe('');
  expect(screen.getByRole('alert')).toHaveTextContent(/valid session token/i);
  expect(document.body.textContent).not.toContain(INVALID_TOKEN);
  expect(session.getCredential()).toBeNull();
  expect(screen.queryByText('Data view')).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it('ProductionDefault_OffersRelaunchWithoutTokenEntryOrContinuation', () => {
  render(<ApiSessionGate><div>Production data</div></ApiSessionGate>);
  expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByText('Production data')).not.toBeInTheDocument();
});

it('RealApp_NoRequestsUntilBootstrapThenOnlyAuthenticatedRequests', async () => {
  const { session, Gate, App } = await realAppModules();
  const fetchSpy = vi.mocked(fetch)
    .mockResolvedValueOnce(json([game]))
    .mockResolvedValueOnce(json([account]))
    .mockResolvedValueOnce(json(system));
  render(<Gate session={session}><App /></Gate>);
  expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
  expect(fetchSpy).not.toHaveBeenCalled();
  history.replaceState(null, '', `/#penguin-session=${TOKEN}`);
  act(() => session.initialize());
  expect(location.hash).toBe('');
  expect(await screen.findByRole('heading', { name: 'Synthetic Game', level: 3 })).toBeInTheDocument();
  expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual(['/api/games?rescan=false', '/api/accounts', '/api/system/info']);
  for (const [, options] of fetchSpy.mock.calls) {
    expect(new Headers(options?.headers).get('Authorization')).toBe(`Bearer ${TOKEN}`);
    expect(options?.redirect).toBe('error');
  }
  expect(document.body.textContent).not.toContain(TOKEN);
});

it('RealApp_401DisconnectsAndLateSuccessCannotRestoreOldApp', async () => {
  const { session, Gate, App } = await realAppModules();
  history.replaceState(null, '', `/#penguin-session=${TOKEN}`);
  session.initialize();
  let finishGames!: (response: Response) => void;
  let rejectSession!: (response: Response) => void;
  const fetchSpy = vi.mocked(fetch)
    .mockImplementationOnce(() => new Promise<Response>(resolve => { finishGames = resolve; }))
    .mockImplementationOnce(() => new Promise<Response>(resolve => { rejectSession = resolve; }))
    .mockResolvedValueOnce(json(system));
  render(<Gate session={session}><App /></Gate>);
  expect(fetchSpy).toHaveBeenCalledTimes(3);
  await act(async () => { rejectSession(new Response('{"error":"Authentication required."}', { status: 401 })); });
  await waitFor(() => expect(screen.getByText(/relaunch/i)).toBeInTheDocument());
  expect(session.getCredential()).toBeNull();
  expect(sessionStorage.getItem('penguin.api.session')).toBeNull();
  await act(async () => { finishGames(json([game])); });
  expect(screen.getByText(/relaunch/i)).toBeInTheDocument();
  expect(screen.queryByText('Synthetic Game')).not.toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledTimes(3);
  expect(document.body.textContent).not.toContain(TOKEN);
});

it('Main_InitializesAndScrubsBootstrapBeforeCreatingRootAndDataEffects', async () => {
  vi.resetModules();
  history.replaceState(null, '', `/#penguin-session=${TOKEN}`);
  const { apiSession: session } = await import('../../src/api/session');
  const { default: ReactDOM } = await import('react-dom/client');
  let tree: React.ReactNode;
  vi.spyOn(ReactDOM, 'createRoot').mockImplementation(() => {
    expect(session.getSnapshot().connected).toBe(true);
    expect(location.hash).toBe('');
    return { render: node => { tree = node; }, unmount: vi.fn() };
  });
  const fetchSpy = vi.mocked(fetch);
  for (let mount = 0; mount < 2; mount++) {
    fetchSpy.mockResolvedValueOnce(json([game])).mockResolvedValueOnce(json([account])).mockResolvedValueOnce(json(system));
  }
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  try {
    await import('../../src/main');
    expect(fetchSpy).not.toHaveBeenCalled();
    render(tree);
    expect(await screen.findByRole('heading', { name: 'Synthetic Game', level: 3 })).toBeInTheDocument();
    for (const [, options] of fetchSpy.mock.calls) {
      expect(new Headers(options?.headers).get('Authorization')).toBe(`Bearer ${TOKEN}`);
    }
  } finally { root.remove(); }
});

it('Main_DisconnectedDevelopmentRendersEntryBeforeAnyAppRequests', async () => {
  vi.resetModules();
  const { default: ReactDOM } = await import('react-dom/client');
  let tree: React.ReactNode;
  vi.spyOn(ReactDOM, 'createRoot').mockReturnValue({ render: node => { tree = node; }, unmount: vi.fn() });
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  try {
    await import('../../src/main');
    render(tree);
    expect(screen.getByLabelText(/session token/i)).toHaveAttribute('type', 'password');
    expect(screen.queryByText('Penguin Launcher')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  } finally { root.remove(); }
});
