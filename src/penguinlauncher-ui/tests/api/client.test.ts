import { describe, expect, it, vi } from 'vitest';
import { api } from '../../src/api/client';

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('posts the game and account identifiers when mapping', async () => {
    const fetchSpy = respond('{}');

    await api.mapGameToAccount('game-a', 'account-b');

    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('/api/accounts/map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
