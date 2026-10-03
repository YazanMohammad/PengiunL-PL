import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { apiSession } from '../src/api/session';

const originalUrl = location.pathname + location.search + location.hash;

function resetSession() {
  apiSession.invalidate(apiSession.getSnapshot().generation);
  sessionStorage.removeItem('penguin.api.session');
  history.replaceState(null, '', originalUrl);
}

beforeEach(() => {
  resetSession();
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    throw new Error(`Unexpected fetch request: ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resetSession();
});
