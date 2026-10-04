import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLibrary } from '../../src/components/GameLibrary';
import { useGames } from '../../src/hooks/useGames';
import { api } from '../../src/api/client';
import type { Account, Game } from '../../src/types';

// The hook loads local/vendor state and the API launches real processes. Keep the
// library and every child component real; replace only these external boundaries.
vi.mock('../../src/hooks/useGames');

const alice: Account = { id: 'alice', displayName: 'Alice', platform: 'Steam', platformUserId: 'synthetic-a', isActive: true, sessionBackupPath: null, lastLogin: null };
const bob: Account = { ...alice, id: 'bob', displayName: 'Bob', platformUserId: 'synthetic-b', isActive: false };
const alpha: Game = { id: 'alpha', name: 'Alpha', platform: 'Steam', platformGameId: '100', installPath: 'C:/Synthetic/Alpha', launchUri: null, coverImageUrl: null, backgroundImageUrl: null, associatedAccountIds: ['alice'], isInstalled: true };
const beta: Game = { ...alpha, id: 'beta', name: 'Beta', platform: 'LinuxNative', platformGameId: '200', installPath: '', associatedAccountIds: [], isInstalled: false };
let state: ReturnType<typeof useGames>;
const titles = () => screen.queryAllByRole('heading', { level: 3 }).filter(h => ['Alpha', 'Beta'].includes(h.textContent ?? ''));

beforeEach(() => {
  state = { games: [alpha, beta], accounts: [alice, bob], systemInfo: null, loading: false, error: null, swappingAccountId: null, rescan: vi.fn().mockResolvedValue(undefined), refetch: vi.fn().mockResolvedValue(undefined), refreshAccounts: vi.fn().mockResolvedValue(undefined), hotSwap: vi.fn().mockResolvedValue(true) };
  vi.mocked(useGames).mockImplementation(() => state);
  vi.spyOn(api, 'preflight').mockResolvedValue({ hasConflict: false });
  vi.spyOn(api, 'launch').mockResolvedValue({ success: true, message: 'Synthetic launch', accountSwapped: false });
});

describe('library characterization', () => {
  it('rescans through the hook and keeps an empty library understandable', () => {
    state.games = [];
    render(<GameLibrary />);
    expect(screen.getByText('No games detected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rescan' }));
    expect(state.rescan).toHaveBeenCalledTimes(1);
  });

  it('sorts descending and keeps the chosen density when changing view', () => {
    render(<GameLibrary />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Display settings' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Name (Z - A)' }));
    expect(titles().map(h => h.textContent)).toEqual(['Beta', 'Alpha']);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Display settings' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Compact' }));
    fireEvent.click(screen.getByRole('button', { name: 'List View' }));
    fireEvent.click(screen.getByRole('button', { name: 'Grid View' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Display settings' }), { key: 'Enter' });
    expect(screen.getByRole('menuitemradio', { name: 'Compact' })).toHaveAttribute('aria-checked', 'true');
  });

  it('searches by title, app ID, and path without duplicate cards', () => {
    state.games.push({ ...alpha });
    render(<GameLibrary />);
    expect(titles()).toHaveLength(2);
    const search = screen.getByRole('textbox');
    for (const query of ['Alpha', '100', 'Synthetic/Alpha']) {
      fireEvent.change(search, { target: { value: query } });
      expect(titles().map(h => h.textContent)).toEqual(['Alpha']);
    }
    fireEvent.change(search, { target: { value: 'missing' } });
    expect(screen.getByText('No games detected')).toBeInTheDocument();
  });

  it('filters installation state and retains Linux-native navigation', () => {
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: /^Installed/ }));
    expect(titles().map(h => h.textContent)).toEqual(['Alpha']);
    fireEvent.click(screen.getByRole('button', { name: /^Ready/ }));
    expect(titles().map(h => h.textContent)).toEqual(['Beta']);
    fireEvent.click(screen.getByRole('button', { name: /^All \d/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Linux Native/ }));
    expect(titles().map(h => h.textContent)).toEqual(['Beta']);
  });

  it('toggles list and grid while retaining titles and actions', () => {
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: 'List View' }));
    expect(screen.getByText('Title & Directory')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Beta', level: 4 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Grid View' }));
    expect(titles()).toHaveLength(2);
  });

  it('targets the selected standby account and skips automatic preflight', async () => {
    state.games = [{ ...alpha, associatedAccountIds: ['alice', 'BOB'] }];
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: /Bob.*Steam/ }));
    expect(screen.getByText(/automatically hot-swap/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    await waitFor(() => expect(api.launch).toHaveBeenCalledExactlyOnceWith({ gameId: 'alpha', accountId: 'bob' }));
    expect(api.preflight).not.toHaveBeenCalled();
  });

  it('asks for a profile before launching a multi-owner title', async () => {
    state.games = [{ ...alpha, associatedAccountIds: ['alice', 'bob'] }];
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Account Conflict Resolution' }));
    expect(api.launch).not.toHaveBeenCalled();
    fireEvent.click(dialog.getByRole('button', { name: 'Switch & Play' }));
    await waitFor(() => expect(api.launch).toHaveBeenCalledExactlyOnceWith({ gameId: 'alpha', accountId: 'bob' }));
  });

  it('honors a server preflight conflict before a launch', async () => {
    vi.mocked(api.preflight).mockResolvedValue({ hasConflict: true, conflict: { gameId: 'alpha', gameName: 'Alpha', availableAccounts: [alice, bob] } });
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(await screen.findByRole('dialog', { name: 'Account Conflict Resolution' })).toBeInTheDocument();
    expect(api.launch).not.toHaveBeenCalled();
  });

  it('shows initial loading and disables rescan during a scan', () => {
    state.games = [];
    state.loading = true;
    render(<GameLibrary />);
    expect(screen.getByText('Scanning Game Repositories...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scanning...' })).toBeDisabled();
  });

  it('retains cached games and the scan error', () => {
    state.error = 'Synthetic scan unavailable';
    render(<GameLibrary />);
    expect(screen.getByText('Synthetic scan unavailable')).toBeInTheDocument();
    expect(titles()).toHaveLength(2);
  });

  it('paginates 80 then 180 then all and resets on search', () => {
    state.accounts = [];
    state.games = Array.from({ length: 185 }, (_, i) => ({ ...alpha, id: `game-${i}`, name: `Game ${String(i).padStart(3, '0')}`, associatedAccountIds: [] }));
    render(<GameLibrary />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(80);
    fireEvent.click(screen.getByRole('button', { name: 'Load More Titles (+100)' }));
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(180);
    fireEvent.click(screen.getByRole('button', { name: 'Show All (185)' }));
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(185);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Game' } });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(80);
  });
});

describe('artwork-led library', () => {
  it('list installation metadata opens existing details without launching', () => {
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: 'List View' }));
    fireEvent.click(within(screen.getByRole('main')).getByText('Installed'));
    expect(screen.getByRole('dialog', { name: 'Alpha' })).toBeInTheDocument();
    expect(api.launch).not.toHaveBeenCalled();
  });

  it('uses three comfortable standard columns at desktop widths', () => {
    render(<GameLibrary />);
    const grid = screen.getByRole('heading', { name: 'Alpha', level: 3 }).closest('article')?.parentElement;
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('keeps compact density meaningfully denser at desktop widths', () => {
    render(<GameLibrary />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Display settings' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Compact' }));
    const grid = screen.getByRole('heading', { name: 'Alpha', level: 3 }).closest('article')?.parentElement;
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('announces a failed launch without opening details', async () => {
    vi.mocked(api.launch).mockResolvedValue({ success: false, message: 'Synthetic launch rejected', accountSwapped: false });
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Synthetic launch rejected');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a library heading and useful count without spotlight', () => {
    render(<GameLibrary />);
    expect(screen.getByRole('heading', { name: 'All games' })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByText('2 games')).toBeInTheDocument();
    expect(screen.queryByText('Spotlight Title')).not.toBeInTheDocument();
  });

  it.each(['grid', 'list'])('%s body opens details without launching', mode => {
    render(<GameLibrary />);
    if (mode === 'list') fireEvent.click(screen.getByRole('button', { name: 'List View' }));
    fireEvent.click(screen.getByRole('heading', { name: 'Alpha', level: mode === 'list' ? 4 : 3 }));
    expect(screen.getByRole('dialog', { name: 'Alpha' })).toBeInTheDocument();
    expect(api.launch).not.toHaveBeenCalled();
  });

  it('reports cached errors as alerts', () => {
    state.error = 'Synthetic scan unavailable';
    render(<GameLibrary />);
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic scan unavailable');
  });

  it('disables the selected session switch during hot swap', () => {
    state.swappingAccountId = 'bob';
    render(<GameLibrary />);
    fireEvent.click(screen.getByRole('button', { name: /Bob.*Steam/ }));
    expect(screen.getByRole('button', { name: /Switch.*Session|Switching/ })).toBeDisabled();
  });
});
