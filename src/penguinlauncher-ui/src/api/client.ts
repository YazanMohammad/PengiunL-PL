import type { Game, Account, LaunchRequest, LaunchResult, PreflightResponse, SystemInfo } from '../types';
import { apiSession } from './session';

const BASE_URL = '/api';

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const credential = apiSession.getCredential();
  const generation = apiSession.getSnapshot().generation;
  if (credential === null) throw new Error('Authentication required.');
  const assertCurrentSession = () => {
    const current = apiSession.getSnapshot();
    if (!current.connected || current.generation !== generation) throw new Error('Authentication required.');
  };
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${credential}`);
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    redirect: 'error',
  });

  if (response.status === 401) {
    apiSession.invalidate(generation);
    throw new Error('Authentication required.');
  }
  assertCurrentSession();

  if (!response.ok) {
    let errorMsg = '';
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.detail || errorJson.error || errorJson.message || (typeof errorJson === 'string' ? errorJson : JSON.stringify(errorJson));
    } catch {
      errorMsg = await response.text().catch(() => '');
    }
    assertCurrentSession();

    if (!errorMsg || errorMsg.trim() === '') {
      errorMsg = `Server error (${response.status}: ${response.statusText || 'Operation failed'})`;
    }
    throw new Error(errorMsg);
  }

  // Safe parsing for empty response bodies (e.g. 200/204 No Content)
  const text = await response.text();
  assertCurrentSession();
  if (!text || text.trim() === '') {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  // System
  getSystemInfo: () =>
    request<SystemInfo>('/system/info'),

  // Games
  getGames: (rescan = false) =>
    request<Game[]>(`/games?rescan=${rescan}`),

  scanGames: () =>
    request<Game[]>('/games/scan', { method: 'POST' }),

  // Accounts
  getAccounts: () =>
    request<Account[]>('/accounts'),

  getAccountsByPlatform: (platform: string) =>
    request<Account[]>(`/accounts/${platform}`),

  mapGameToAccount: (gameId: string, accountId: string) =>
    request<void>('/accounts/map', {
      method: 'POST',
      body: JSON.stringify({ gameId, accountId }),
    }),

  swapAccount: (accountId: string) =>
    request<{ success: boolean; account: Account }>('/accounts/swap', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    }),

  addAccount: (req: { displayName: string; platform: string; platformUserId?: string }) =>
    request<Account>('/accounts/add', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  removeAccount: (accountId: string) =>
    request<{ success: boolean; message: string }>(`/accounts/${accountId}`, {
      method: 'DELETE',
    }),

  captureActiveSession: (platform: string, displayName?: string) =>
    request<Account>('/accounts/capture', {
      method: 'POST',
      body: JSON.stringify({ platform, displayName }),
    }),

  logoutPlatform: (platform: string) =>
    request<{ success: boolean; message: string }>(`/accounts/logout/${platform}`, {
      method: 'POST',
    }),

  renameAccount: (accountId: string, newDisplayName: string) =>
    request<Account>('/accounts/rename', {
      method: 'POST',
      body: JSON.stringify({ accountId, newDisplayName }),
    }),

  // Launch
  preflight: (gameId: string) =>
    request<PreflightResponse>(`/launch/preflight/${gameId}`),

  launch: (req: LaunchRequest) =>
    request<LaunchResult>('/launch', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
};
