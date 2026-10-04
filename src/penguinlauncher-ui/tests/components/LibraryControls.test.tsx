import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from '../../src/components/TopBar';
import { GameCard } from '../../src/components/GameCard';
import { GameListItem } from '../../src/components/GameListItem';
import { Sidebar } from '../../src/components/Sidebar';
import type { Account, Game } from '../../src/types';

const game: Game = { id: 'synthetic', name: 'Synthetic Game', platform: 'Steam', platformGameId: '100', installPath: '', launchUri: null, coverImageUrl: '/synthetic-cover.png', backgroundImageUrl: null, associatedAccountIds: [], isInstalled: true };
const alice: Account = { id: 'alice', displayName: 'Alice', platform: 'Steam', platformUserId: 'synthetic-alice', isActive: true, sessionBackupPath: null, lastLogin: null };

describe('library controls', () => {
  it.each([
    { label: 'Alice', isInstalled: true },
    { label: 'Installed', isInstalled: true },
    { label: 'Ready to Install', isInstalled: false },
  ])('row $label metadata selects details exactly once', ({ label, isInstalled }) => {
    const selectedGame = { ...game, associatedAccountIds: ['alice'], isInstalled };
    const onSelect = vi.fn();
    const onPlay = vi.fn();
    const onDetails = vi.fn();
    render(<GameListItem game={selectedGame} accounts={[alice]} onSelect={onSelect} onPlay={onPlay} onDetails={onDetails} isSelected={false} />);
    fireEvent.click(screen.getByText(label));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(selectedGame);
    expect(onPlay).not.toHaveBeenCalled();
    expect(onDetails).not.toHaveBeenCalled();
    const body = screen.getByRole('button', { name: 'Open details for Synthetic Game' });
    expect(body.querySelector('button, [role="button"], a, input, select, textarea')).toBeNull();
  });

  it('retains all sort and density choices with readable selected state', () => {
    render(<TopBar onRescan={vi.fn()} gameCount={1} loading={false} searchQuery="" onSearchChange={vi.fn()} viewMode="grid" onViewModeChange={vi.fn()} gridDensity="standard" onGridDensityChange={vi.fn()} sortOption="name-asc" onSortOptionChange={vi.fn()} onOpenAccounts={vi.fn()} accountCount={0} systemInfo={null} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /Display/ }), { key: 'Enter' });
    expect(screen.getByRole('menuitemradio', { name: 'Name (A - Z)' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Name (Z - A)' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemradio', { name: 'Platform' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Standard' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Compact' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Spacious' })).toBeInTheDocument();
  });

  it('exposes installation and platform selected states in quiet navigation', () => {
    render(<Sidebar selectedPlatform="LinuxNative" onSelectPlatform={vi.fn()} selectedAccountId="All" onSelectAccount={vi.fn()} installationFilter="installed" onSelectInstallationFilter={vi.fn()} platformCounts={{ LinuxNative: 1 }} totalGames={1} installedCount={1} uninstalledCount={0} accounts={[]} accountGameCounts={{}} />);
    expect(screen.getByRole('button', { name: /Linux Native/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Installed/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('complementary').className).toContain('bg-card');
  });

  it('names search, clear and icon controls and exposes selected view', () => {
    render(<TopBar onRescan={vi.fn()} gameCount={1} loading={false} searchQuery="test" onSearchChange={vi.fn()} viewMode="grid" onViewModeChange={vi.fn()} gridDensity="standard" onGridDensityChange={vi.fn()} sortOption="name-asc" onSortOptionChange={vi.fn()} onOpenAccounts={vi.fn()} accountCount={0} systemInfo={null} />);
    expect(screen.getByRole('textbox', { name: 'Search games' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grid View' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'List View' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Display settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('placeholder', expect.stringContaining('Ctrl+K'));
  });

  it.each(['card', 'row'])('%s play invokes once without selecting and details stays separate', kind => {
    const onPlay = vi.fn();
    const onSelect = vi.fn();
    const onDetails = vi.fn();
    const props = { game, onPlay, onSelect, onDetails, accounts: [] };
    render(kind === 'card' ? <GameCard {...props} density="standard" /> : <GameListItem {...props} isSelected={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlay).toHaveBeenCalledExactlyOnceWith(game);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onDetails).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Details/ }));
    expect(onDetails).toHaveBeenCalledExactlyOnceWith(game);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledExactlyOnceWith(game);
  });

  it.each(['card', 'row'])('%s body supports keyboard details selection', kind => {
    const onSelect = vi.fn();
    const props = { game, onPlay: vi.fn(), onDetails: vi.fn(), onSelect, accounts: [] };
    render(kind === 'card' ? <GameCard {...props} density="standard" /> : <GameListItem {...props} isSelected={false} />);
    const body = screen.getByRole('button', { name: 'Open details for Synthetic Game' });
    fireEvent.keyDown(body, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(game);
    fireEvent.keyDown(body, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(game);
  });

  it.each(['card', 'row'])('%s uses an opaque, flat surface with persistent actions', kind => {
    const props = { game, onPlay: vi.fn(), onSelect: vi.fn(), onDetails: vi.fn(), accounts: [] };
    const { container } = render(kind === 'card' ? <GameCard {...props} density="standard" /> : <GameListItem {...props} isSelected />);
    expect(container.firstElementChild?.className).toContain('bg-card');
    expect(container.firstElementChild?.className).not.toMatch(/glass|gradient|shadow|blur|scale/);
    expect(screen.getByRole('button', { name: /Details/ }).className).not.toMatch(/opacity-0/);
  });

  it.each(['card', 'row'])('%s broken artwork keeps the title and actions', kind => {
    const props = { game, onPlay: vi.fn(), onSelect: vi.fn(), onDetails: vi.fn(), accounts: [] };
    render(kind === 'card' ? <GameCard {...props} density="standard" /> : <GameListItem {...props} isSelected={false} />);
    fireEvent.error(screen.getByRole('img', { name: 'Synthetic Game' }));
    expect(screen.getByRole('heading', { name: 'Synthetic Game' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Details/ })).toBeEnabled();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
