import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { api, request } from '../../src/api/client';
import { apiSession } from '../../src/api/session';

const TOKEN_A = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const TOKEN_B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA';
const authHeaders = () => new Headers({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN_A}` });
beforeEach(() => apiSession.connect(TOKEN_A));

function respond(body: string | null, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  }));
}

describe('API client', () => {
  it.each([
    { rescan: undefined, url: '/api/games?rescan=false' },
    { rescan: true, url: '/api/games?rescan=true' },
  ])('requests games with rescan=$rescan', async ({ rescan, url }) => {
    const fetchSpy = respond('[]');

    expect(await api.getGames(rescan)).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(url, {
      headers: authHeaders(), redirect: 'error',
    });
  });

  it('decodes the account list from JSON', async () => {
    const fetchSpy = respond('[{"id":"account-a","displayName":"Alice","platform":"Steam","platformUserId":"synthetic-alice","isActive":true,"sessionBackupPath":null,"lastLogin":null}]');

    expect(await api.getAccounts()).toEqual([{
      id: 'account-a',
      displayName: 'Alice',
      platform: 'Steam',
      platformUserId: 'synthetic-alice',
      isActive: true,
      sessionBackupPath: null,
      lastLogin: null,
    }]);
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/accounts', {
      headers: authHeaders(), redirect: 'error',
    });
  });

  it('posts the game and account identifiers when mapping', async () => {
    const fetchSpy = respond('{}');

    await api.mapGameToAccount('game-a', 'account-b');

    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/accounts/map', {
      method: 'POST',
      headers: authHeaders(), redirect: 'error',
      body: '{"gameId":"game-a","accountId":"account-b"}',
    });
  });

  it('posts the selected game and account when launching', async () => {
    const fetchSpy = respond('{"success":true,"message":"Synthetic launch accepted","accountSwapped":true}');

    expect(await api.launch({ gameId: 'game-a', accountId: 'account-b' })).toEqual({
      success: true,
      message: 'Synthetic launch accepted',
      accountSwapped: true,
    });
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/launch', {
      method: 'POST',
      headers: authHeaders(), redirect: 'error',
      body: '{"gameId":"game-a","accountId":"account-b"}',
    });
  });

  it('deletes the account at its relative URL', async () => {
    const fetchSpy = respond('{"success":true,"message":"Synthetic account removed"}');

    expect(await api.removeAccount('account-b')).toEqual({
      success: true,
      message: 'Synthetic account removed',
    });
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/accounts/account-b', {
      method: 'DELETE',
      headers: authHeaders(), redirect: 'error',
    });
  });

  it.each([
    { body: '{"detail":"Synthetic detail failure"}', message: 'Synthetic detail failure' },
    { body: '{"error":"Synthetic error failure"}', message: 'Synthetic error failure' },
    { body: '{"message":"Synthetic message failure"}', message: 'Synthetic message failure' },
  ])('rejects a 400 response containing $message', async ({ body, message }) => {
    respond(body, 400);

    await expect(api.getAccounts()).rejects.toThrow(message);
  });

  it.each([200, 204])('decodes an empty successful %s response as an empty object', async (status) => {
    respond(null, status);

    expect(await api.mapGameToAccount('game-a', 'account-b')).toEqual({});
  });
});

describe('authenticated API request contract', () => {
  it('DisconnectedRequest_DoesNotFetch', async () => {
    apiSession.invalidate(apiSession.getSnapshot().generation);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(api.getAccounts()).rejects.toThrow('Authentication required.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  const account = { id: 'account-a', displayName: 'Alice', platform: 'Steam', platformUserId: 'synthetic-alice', isActive: true, sessionBackupPath: null, lastLogin: null };
  const game = { id: 'game-a', name: 'Synthetic Game', platform: 'Steam', installPath: '/synthetic', launchUri: null, coverImageUrl: null, backgroundImageUrl: null, associatedAccountIds: [], platformGameId: 'synthetic-game', isInstalled: true };
  it.each([
    { name: 'getSystemInfo', call: () => api.getSystemInfo(), url: '/api/system/info', method: undefined, body: undefined, value: { os: 'Synthetic', isWindows: true, isLinux: false, machineName: 'synthetic', framework: 'synthetic', architecture: 'X64' } },
    { name: 'getGames', call: () => api.getGames(), url: '/api/games?rescan=false', method: undefined, body: undefined, value: [game] },
    { name: 'scanGames', call: () => api.scanGames(), url: '/api/games/scan', method: 'POST', body: undefined, value: [game] },
    { name: 'getAccounts', call: () => api.getAccounts(), url: '/api/accounts', method: undefined, body: undefined, value: [account] },
    { name: 'getAccountsByPlatform', call: () => api.getAccountsByPlatform('Steam'), url: '/api/accounts/Steam', method: undefined, body: undefined, value: [account] },
    { name: 'mapGameToAccount', call: () => api.mapGameToAccount('game-a', 'account-a'), url: '/api/accounts/map', method: 'POST', body: '{"gameId":"game-a","accountId":"account-a"}', value: {} },
    { name: 'swapAccount', call: () => api.swapAccount('account-a'), url: '/api/accounts/swap', method: 'POST', body: '{"accountId":"account-a"}', value: { success: true, account } },
    { name: 'addAccount', call: () => api.addAccount({ displayName: 'Alice', platform: 'Steam', platformUserId: 'synthetic-alice' }), url: '/api/accounts/add', method: 'POST', body: '{"displayName":"Alice","platform":"Steam","platformUserId":"synthetic-alice"}', value: account },
    { name: 'removeAccount', call: () => api.removeAccount('account-a'), url: '/api/accounts/account-a', method: 'DELETE', body: undefined, value: { success: true, message: 'Removed' } },
    { name: 'captureActiveSession', call: () => api.captureActiveSession('Steam', 'Alice'), url: '/api/accounts/capture', method: 'POST', body: '{"platform":"Steam","displayName":"Alice"}', value: account },
    { name: 'logoutPlatform', call: () => api.logoutPlatform('Steam'), url: '/api/accounts/logout/Steam', method: 'POST', body: undefined, value: { success: true, message: 'Logged out' } },
    { name: 'renameAccount', call: () => api.renameAccount('account-a', 'Alice'), url: '/api/accounts/rename', method: 'POST', body: '{"accountId":"account-a","newDisplayName":"Alice"}', value: account },
    { name: 'preflight', call: () => api.preflight('game-a'), url: '/api/launch/preflight/game-a', method: undefined, body: undefined, value: { hasConflict: false } },
    { name: 'launch', call: () => api.launch({ gameId: 'game-a', accountId: 'account-a' }), url: '/api/launch', method: 'POST', body: '{"gameId":"game-a","accountId":"account-a"}', value: { success: true, message: 'Launched', accountSwapped: true } },
  ])('$name preserves its URL, method, body and decoding while adding auth', async ({ call, url, method, body, value }) => {
    const fetchSpy = respond(JSON.stringify(value));
    expect(await call()).toEqual(value);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [actualUrl, options] = fetchSpy.mock.calls[0];
    expect(actualUrl).toBe(url);
    expect(options?.method).toBe(method);
    expect(options?.body).toBe(body);
    expect(options?.redirect).toBe('error');
    const headers = new Headers(options?.headers);
    expect(headers.get('authorization')).toBe(`Bearer ${TOKEN_A}`);
    expect(headers.get('content-type')).toBe('application/json');
  });

  it.each([
    { name: 'object', headers: { authorization: 'Bearer attacker', 'X-Custom': 'kept', 'Content-Type': 'application/custom' } },
    { name: 'Headers', headers: new Headers({ Authorization: 'Bearer attacker', 'X-Custom': 'kept', 'Content-Type': 'application/custom' }) },
    { name: 'tuples', headers: [['AUTHORIZATION', 'Bearer attacker'], ['X-Custom', 'kept'], ['Content-Type', 'application/custom']] as [string, string][] },
  ])('merges $name headers while forcing current auth and redirect protection', async ({ headers }) => {
    const fetchSpy = respond('{}');
    await request('/accounts', { headers, redirect: 'follow' });
    const sent = new Headers(fetchSpy.mock.calls[0][1]?.headers);
    expect(sent.get('authorization')).toBe(`Bearer ${TOKEN_A}`);
    expect(sent.get('x-custom')).toBe('kept');
    expect(sent.get('content-type')).toBe('application/custom');
    expect(fetchSpy.mock.calls[0][1]?.redirect).toBe('error');
  });

  it('redirect fetch failure rejects without retrying a mutation', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Redirect disallowed'));
    await expect(api.swapAccount('account-a')).rejects.toThrow('Redirect disallowed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][1]?.redirect).toBe('error');
    expect(apiSession.getCredential()).toBe(TOKEN_A);
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

describe('request session generations', () => {
  it('401 clears the session and owned key, notifies once, never retries, and rejects concurrent success', async () => {
    const pending = deferred<Response>();
    const denied = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(pending.promise).mockReturnValueOnce(denied.promise);
    const success = api.getAccounts();
    const failure = api.swapAccount('account-a');
    const listener = vi.fn();
    const unsubscribe = apiSession.subscribe(listener);
    onTestFinished(unsubscribe);
    const failureAssertion = expect(failure).rejects.toThrow('Authentication required.');
    denied.resolve(new Response('{"error":"Authentication required."}', { status: 401 }));
    await failureAssertion;
    expect(apiSession.getCredential()).toBeNull();
    expect(sessionStorage.getItem('penguin.api.session')).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
    const successAssertion = expect(success).rejects.toThrow('Authentication required.');
    pending.resolve(new Response('[]'));
    await successAssertion;
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('403 reports policy failure while preserving credential and generation', async () => {
    const before = apiSession.getSnapshot();
    const fetchSpy = respond('{"error":"Request not allowed."}', 403);
    await expect(api.getAccounts()).rejects.toThrow('Request not allowed.');
    expect(apiSession.getSnapshot()).toBe(before);
    expect(apiSession.getCredential()).toBe(TOKEN_A);
    expect(sessionStorage.getItem('penguin.api.session')).toBe(TOKEN_A);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it.each([200, 401])('late token A response %s cannot return data or invalidate token B', async (status) => {
    const pending = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(pending.promise);
    const result = api.getAccounts();
    apiSession.connect(TOKEN_B);
    const current = apiSession.getSnapshot();
    const assertion = expect(result).rejects.toThrow('Authentication required.');
    pending.resolve(new Response(status === 200 ? '[]' : '{"error":"Authentication required."}', { status }));
    await assertion;
    expect(apiSession.getSnapshot()).toBe(current);
    expect(apiSession.getCredential()).toBe(TOKEN_B);
    expect(sessionStorage.getItem('penguin.api.session')).toBe(TOKEN_B);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('rechecks generation after asynchronous successful body decoding', async () => {
    const body = deferred<string>();
    const started = deferred<void>();
    const response = new Response('[]');
    vi.spyOn(response, 'text').mockImplementation(() => { started.resolve(); return body.promise; });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
    const result = api.getAccounts();
    await started.promise;
    apiSession.connect(TOKEN_B);
    const assertion = expect(result).rejects.toThrow('Authentication required.');
    body.resolve('[]');
    await assertion;
    expect(apiSession.getCredential()).toBe(TOKEN_B);
  });
});
