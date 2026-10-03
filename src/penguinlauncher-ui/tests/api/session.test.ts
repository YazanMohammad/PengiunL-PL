import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiSession, type SessionEnvironment } from '../../src/api/session';

const KEY = 'penguin.api.session';
const TOKEN_A = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const TOKEN_B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA';

function environment(hash = ''): SessionEnvironment {
  return {
    location: { hash, pathname: '/games', search: '?view=grid' },
    history: { replaceState: vi.fn() },
    storage: () => window.sessionStorage,
  };
}

beforeEach(() => sessionStorage.removeItem(KEY));

describe('API session bootstrap', () => {
  it('does not read fragment or storage until initialize', () => {
    const location = { pathname: '/', search: '', get hash(): string { throw new Error('read too early'); } };
    const session = createApiSession({ ...environment(), location, storage: () => { throw new Error('read too early'); } });
    expect(session.getCredential()).toBeNull();
    expect(session.getSnapshot()).toEqual({ connected: false, generation: 0 });
  });

  it('scrubs the fragment and persists the fresh credential before notifying subscribers', () => {
    sessionStorage.setItem(KEY, TOKEN_B);
    const env = environment(`#penguin-session=${TOKEN_A}`);
    const session = createApiSession(env);
    const observed: unknown[] = [];
    session.subscribe(() => observed.push({
      snapshot: session.getSnapshot(),
      stored: sessionStorage.getItem(KEY),
      scrubbed: vi.mocked(env.history.replaceState).mock.calls.length,
    }));
    session.initialize();
    expect(session.getCredential()).toBe(TOKEN_A);
    expect(env.history.replaceState).toHaveBeenCalledExactlyOnceWith(null, '', '/games?view=grid');
    expect(observed).toEqual([{ snapshot: { connected: true, generation: 1 }, stored: TOKEN_A, scrubbed: 1 }]);
  });

  it.each([
    '#penguin-session=',
    `#penguin-session=${TOKEN_A}&penguin-session=${TOKEN_B}`,
    `#penguin-session=${TOKEN_A}=`,
    '#penguin-session=malformed',
    `#penguin-session=${'A'.repeat(42)}B`,
    `#penguin-session=%41${'A'.repeat(42)}`,
    '#penguin-session=%ZZ',
    `#penguin-session=${TOKEN_A}\n`,
    `#penguin-session=${TOKEN_A}&%70enguin-session=${TOKEN_B}`,
    `#%70enguin-session=${TOKEN_A}`,
  ])('fails closed and scrubs invalid credential fragment %s', (hash) => {
    sessionStorage.setItem(KEY, TOKEN_B);
    const env = environment(hash);
    const session = createApiSession(env);
    session.initialize();
    expect(session.getCredential()).toBeNull();
    expect(session.getSnapshot().connected).toBe(false);
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(env.history.replaceState).toHaveBeenCalledExactlyOnceWith(null, '', '/games?view=grid');
  });

  it.each(['', '#games'])('restores canonical storage without using unrelated hash %s', (hash) => {
    sessionStorage.setItem(KEY, TOKEN_B);
    const env = environment(hash);
    const session = createApiSession(env);
    session.initialize();
    expect(session.getCredential()).toBe(TOKEN_B);
    expect(env.history.replaceState).not.toHaveBeenCalled();
  });

  it('unrelated navigation fragments alone cannot connect', () => {
    const session = createApiSession(environment(`#games=${TOKEN_A}`));
    session.initialize();
    expect(session.getSnapshot().connected).toBe(false);
    expect(session.getCredential()).toBeNull();
  });

  it.each(['', 'not-a-token', `${TOKEN_A}=`, `${'A'.repeat(42)}B`])('removes noncanonical stored credential %s', (token) => {
    sessionStorage.setItem(KEY, token);
    const session = createApiSession(environment());
    session.initialize();
    expect(session.getCredential()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('initialize is idempotent and snapshots remain stable between transitions', () => {
    const env = environment(`#penguin-session=${TOKEN_A}`);
    const session = createApiSession(env);
    const disconnected = session.getSnapshot();
    const listener = vi.fn();
    session.subscribe(listener);
    session.initialize();
    const connected = session.getSnapshot();
    session.initialize();
    expect(connected).not.toBe(disconnected);
    expect(session.getSnapshot()).toBe(connected);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(env.history.replaceState).toHaveBeenCalledTimes(1);
  });
});

describe('session failures and transitions', () => {
  it.each([`${TOKEN_A}\n`, ` ${TOKEN_A}`, `${TOKEN_A} `])('rejects credential whitespace without accepting a partial match', (token) => {
    const session = createApiSession(environment());
    expect(session.connect(token)).toBe(false);
    expect(session.getCredential()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });
  it.each(['getter', 'getItem', 'setItem', 'removeItem'] as const)('keeps valid bootstrap in memory when storage %s fails', (failure) => {
    const env = environment(`#penguin-session=${TOKEN_A}`);
    if (failure === 'getter') env.storage = () => { throw new Error(TOKEN_A); };
    else vi.spyOn(Storage.prototype, failure).mockImplementation(() => { throw new Error(TOKEN_A); });
    const session = createApiSession(env);
    expect(() => session.initialize()).not.toThrow();
    expect(session.getCredential()).toBe(TOKEN_A);
    expect(JSON.stringify(session.getSnapshot())).not.toContain(TOKEN_A);
  });

  it.each(['getter', 'getItem', 'removeItem'] as const)('never restores old storage after invalid fragment when %s fails', (failure) => {
    sessionStorage.setItem(KEY, TOKEN_B);
    const env = environment('#penguin-session=');
    if (failure === 'getter') env.storage = () => { throw new Error(TOKEN_B); };
    else vi.spyOn(Storage.prototype, failure).mockImplementation(() => { throw new Error(TOKEN_B); });
    const session = createApiSession(env);
    expect(() => session.initialize()).not.toThrow();
    expect(session.getSnapshot().connected).toBe(false);
    expect(session.getCredential()).toBeNull();
    expect(env.history.replaceState).toHaveBeenCalledOnce();
  });

  it('storage read failure without a fragment remains disconnected', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error(TOKEN_A); });
    const session = createApiSession(environment());
    expect(() => session.initialize()).not.toThrow();
    expect(session.getCredential()).toBeNull();
  });

  it('scrubbing failure stays disconnected and clears old storage without exposing its error', () => {
    sessionStorage.setItem(KEY, TOKEN_B);
    const env = environment(`#penguin-session=${TOKEN_A}`);
    vi.mocked(env.history.replaceState).mockImplementation(() => { throw new Error(TOKEN_A); });
    const session = createApiSession(env);
    expect(() => session.initialize()).not.toThrow();
    expect(session.getCredential()).toBeNull();
    expect(session.getSnapshot().connected).toBe(false);
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(session.connect(TOKEN_B)).toBe(false);
  });

  it('connect validates canonical values and invalid input clears a prior credential', () => {
    const session = createApiSession(environment());
    expect(session.connect(TOKEN_A)).toBe(true);
    const connected = session.getSnapshot();
    expect(connected).toEqual({ connected: true, generation: 1 });
    expect(sessionStorage.getItem(KEY)).toBe(TOKEN_A);
    expect(session.connect(`${TOKEN_B}=`)).toBe(false);
    expect(session.getCredential()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(session.getSnapshot()).toEqual({ connected: false, generation: 2 });
  });

  it('invalidation clears memory and notifies even when storage removal throws', () => {
    const session = createApiSession(environment());
    session.connect(TOKEN_A);
    const connected = session.getSnapshot();
    const listener = vi.fn();
    session.subscribe(listener);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error(TOKEN_A); });
    expect(() => session.invalidate(connected.generation)).not.toThrow();
    expect(session.getCredential()).toBeNull();
    expect(session.getSnapshot()).toEqual({ connected: false, generation: 2 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('stale invalidation cannot clear a reconnected session and unsubscribe prevents callbacks', () => {
    const session = createApiSession(environment());
    session.connect(TOKEN_A);
    const old = session.getSnapshot();
    const listener = vi.fn();
    const unsubscribe = session.subscribe(listener);
    session.connect(TOKEN_B);
    const current = session.getSnapshot();
    session.invalidate(old.generation);
    expect(session.getCredential()).toBe(TOKEN_B);
    expect(session.getSnapshot()).toBe(current);
    expect(sessionStorage.getItem(KEY)).toBe(TOKEN_B);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    session.invalidate(current.generation);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('leaves unrelated storage and cookies untouched and snapshots contain no secrets', () => {
    const localBefore = Object.entries(localStorage);
    const cookieBefore = document.cookie;
    sessionStorage.setItem('unrelated.application.preference', 'preserve');
    const session = createApiSession(environment(`#penguin-session=${TOKEN_A}`));
    session.initialize();
    expect(Object.isFrozen(session.getSnapshot())).toBe(true);
    expect(session.getSnapshot()).toEqual({ connected: true, generation: 1 });
    expect(JSON.stringify(session.getSnapshot())).not.toContain(TOKEN_A);
    session.invalidate(session.getSnapshot().generation);
    expect(sessionStorage.getItem('unrelated.application.preference')).toBe('preserve');
    expect(Object.entries(localStorage)).toEqual(localBefore);
    expect(document.cookie).toBe(cookieBefore);
    sessionStorage.removeItem('unrelated.application.preference');
  });
});
