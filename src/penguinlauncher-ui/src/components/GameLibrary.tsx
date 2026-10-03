import React, { useState, useMemo, useEffect } from 'react';
import type { Game, Account, Platform, ConflictInfo, ViewMode, GridDensity, SortOption, InstallationFilter } from '../types';
import { api } from '../api/client';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { HeroSpotlight } from './HeroSpotlight';
import { GameCard } from './GameCard';
import { GameListItem } from './GameListItem';
import { AccountSelectorModal } from './AccountSelectorModal';
import { AccountsManagerModal } from './AccountsManagerModal';
import { GameDetailsModal } from './GameDetailsModal';
import { useGames } from '../hooks/useGames';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Gamepad2, AlertCircle, CheckCircle2, User, Zap, X, Download } from 'lucide-react';

export const GameLibrary: React.FC = () => {
  const {
    games,
    accounts,
    systemInfo,
    loading,
    error,
    swappingAccountId,
    rescan,
    refreshAccounts,
    hotSwap,
  } = useGames();

  // Search, filter & view state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'All'>('All');
  const [selectedAccountId, setSelectedAccountId] = useState<string | 'All'>('All');
  const [installationFilter, setInstallationFilter] = useState<InstallationFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridDensity, setGridDensity] = useState<GridDensity>('standard');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [visibleLimit, setVisibleLimit] = useState(80);

  // Modals & Selected elements
  const [spotlightGameId, setSpotlightGameId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [detailedGame, setDetailedGame] = useState<Game | null>(null);
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [launchingGameId, setLaunchingGameId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Reset pagination limit when filters change
  useEffect(() => {
    setVisibleLimit(80);
  }, [searchQuery, selectedPlatform, selectedAccountId, installationFilter, sortOption]);

  // Deduplicate games by id to guarantee zero duplicate cards/rows and merge associated accounts
  const uniqueGames = useMemo(() => {
    const seen = new Map<string, Game>();
    for (const g of games) {
      const existing = seen.get(g.id);
      if (!existing) {
        seen.set(g.id, { ...g });
      } else {
        // Merge associated accounts and preserve installed status & paths
        const mergedAccountIds = Array.from(
          new Set([...existing.associatedAccountIds, ...g.associatedAccountIds])
        );
        seen.set(g.id, {
          ...existing,
          isInstalled: existing.isInstalled || g.isInstalled,
          installPath: existing.installPath || g.installPath,
          launchUri: existing.launchUri || g.launchUri,
          coverImageUrl: existing.coverImageUrl || g.coverImageUrl,
          backgroundImageUrl: existing.backgroundImageUrl || g.backgroundImageUrl,
          associatedAccountIds: mergedAccountIds,
        });
      }
    }
    return Array.from(seen.values());
  }, [games]);

  // Overall installed vs uninstalled counters
  const installedCount = useMemo(() => uniqueGames.filter((g) => g.isInstalled).length, [uniqueGames]);
  const uninstalledCount = useMemo(() => uniqueGames.filter((g) => !g.isInstalled).length, [uniqueGames]);

  // Platform counters
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const game of uniqueGames) {
      counts[game.platform] = (counts[game.platform] ?? 0) + 1;
    }
    return counts;
  }, [uniqueGames]);

  // Per-account game counts
  const accountGameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const acc of accounts) {
      counts[acc.id] = uniqueGames.filter((g) =>
        g.associatedAccountIds.some((aid) => aid.toLowerCase() === acc.id.toLowerCase()) ||
        (g.associatedAccountIds.length === 0 && g.platform === acc.platform)
      ).length;
    }
    return counts;
  }, [uniqueGames, accounts]);

  // Selected account object
  const activeSelectedAccount = useMemo(() => {
    if (selectedAccountId === 'All') return null;
    return accounts.find((a) => a.id.toLowerCase() === selectedAccountId.toLowerCase()) ?? null;
  }, [selectedAccountId, accounts]);

  // Filter & sort games
  const filteredGames = useMemo(() => {
    let result = [...uniqueGames];

    // Filter by platform
    if (selectedPlatform !== 'All') {
      result = result.filter((g) => g.platform === selectedPlatform);
    }

    // Filter by specific account
    if (selectedAccountId !== 'All') {
      const targetAcc = accounts.find((a) => a.id.toLowerCase() === selectedAccountId.toLowerCase());
      result = result.filter((g) =>
        g.associatedAccountIds.some((aid) => aid.toLowerCase() === selectedAccountId.toLowerCase()) ||
        (targetAcc && g.associatedAccountIds.length === 0 && g.platform === targetAcc.platform)
      );
    }

    // Filter by installation state
    if (installationFilter === 'installed') {
      result = result.filter((g) => g.isInstalled);
    } else if (installationFilter === 'uninstalled') {
      result = result.filter((g) => !g.isInstalled);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.platformGameId.toLowerCase().includes(q) ||
          g.installPath.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'platform') return a.platform.localeCompare(b.platform);
      return 0;
    });

    return result;
  }, [uniqueGames, selectedPlatform, selectedAccountId, installationFilter, searchQuery, sortOption]);

  const displayedGames = useMemo(() => filteredGames.slice(0, visibleLimit), [filteredGames, visibleLimit]);

  // Highlighted spotlight game (default to first filtered game or explicitly chosen)
  const spotlightGame = useMemo(() => {
    if (filteredGames.length === 0) return null;
    if (spotlightGameId) {
      const match = filteredGames.find((g) => g.id === spotlightGameId);
      if (match) return match;
    }
    return filteredGames[0];
  }, [filteredGames, spotlightGameId]);

  // Toast notifier
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Play button handler with smart account targeting
  const handlePlay = async (game: Game, explicitAccountId?: string) => {
    // If the game is owned by multiple accounts and no specific account was chosen,
    // show the account choice modal immediately!
    const owningAccounts = accounts.filter((a) =>
      game.associatedAccountIds.some((aid) => aid.toLowerCase() === a.id.toLowerCase())
    );

    if (!explicitAccountId && selectedAccountId === 'All' && owningAccounts.length > 1) {
      setConflict({
        gameId: game.id,
        gameName: game.name,
        availableAccounts: owningAccounts,
      });
      return;
    }

    setLaunchingGameId(game.id);

    try {
      // Determine desired account
      let targetAccountId = explicitAccountId;
      if (!targetAccountId && selectedAccountId !== 'All') {
        targetAccountId = selectedAccountId;
      }

      showToast(`Preparing session for ${game.name}...`, 'info');

      // Pre-flight check if no specific account was explicitly passed
      if (!targetAccountId) {
        const preflight = await api.preflight(game.id);
        if (preflight.hasConflict && preflight.conflict) {
          setConflict(preflight.conflict);
          return;
        }
      }

      // Execute launch (with auto hot-swap if needed)
      const result = await api.launch({
        gameId: game.id,
        accountId: targetAccountId,
      });

      if (result.success) {
        showToast(
          `Successfully launched ${game.name}${result.accountSwapped ? ' (profile hot-swapped)' : ''}!`,
          'success'
        );
        refreshAccounts();
      } else {
        showToast(result.message || 'Failed to start game process', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error executing launch', 'error');
    } finally {
      setLaunchingGameId(null);
    }
  };

  // Conflict modal account selection
  const handleAccountSelect = async (account: Account) => {
    if (!conflict) return;
    const targetConflict = conflict;
    setConflict(null);
    setLaunchingGameId(targetConflict.gameId);

    try {
      showToast(`Swapping to profile ${account.displayName} and launching...`, 'info');

      const result = await api.launch({
        gameId: targetConflict.gameId,
        accountId: account.id,
      });

      if (result.success) {
        showToast(`Booted ${targetConflict.gameName} as ${account.displayName}!`, 'success');
        refreshAccounts();
      } else {
        showToast(result.message || 'Launch error', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Launch error', 'error');
    } finally {
      setLaunchingGameId(null);
    }
  };

  // Manual hot-swap from accounts modal
  const handleManualSwap = async (account: Account) => {
    showToast(`Hot-swapping active profile to ${account.displayName}...`, 'info');
    const success = await hotSwap(account.id);
    if (success) {
      showToast(`Profile active: ${account.displayName}`, 'success');
    } else {
      showToast(`Failed to hot-swap into ${account.displayName}`, 'error');
    }
  };

  // Map game to account
  const handleMapAccount = async (gameId: string, accountId: string) => {
    try {
      await api.mapGameToAccount(gameId, accountId);
      showToast('Account association saved', 'success');
      rescan();
    } catch {
      showToast('Failed to save association', 'error');
    }
  };

  // Density column grid class
  const gridClasses = useMemo(() => {
    if (gridDensity === 'compact') {
      return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3';
    }
    if (gridDensity === 'spacious') {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
    }
    // standard
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
  }, [gridDensity]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* TopBar */}
      <TopBar
        onRescan={rescan}
        gameCount={filteredGames.length}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridDensity={gridDensity}
        onGridDensityChange={setGridDensity}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        onOpenAccounts={() => setAccountsModalOpen(true)}
        accountCount={accounts.length}
        systemInfo={systemInfo}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with Platforms and Separate Account Navigator */}
        <Sidebar
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          installationFilter={installationFilter}
          onSelectInstallationFilter={setInstallationFilter}
          platformCounts={platformCounts}
          totalGames={games.length}
          installedCount={installedCount}
          uninstalledCount={uninstalledCount}
          accounts={accounts}
          accountGameCounts={accountGameCounts}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Account Filter Banner */}
          {activeSelectedAccount && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900/60 to-black/40 border border-violet-500/30 flex items-center justify-between gap-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 font-bold flex items-center justify-center text-sm shrink-0">
                  {activeSelectedAccount.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeSelectedAccount.displayName}&apos;s Library
                    </h3>
                    <Badge variant={activeSelectedAccount.isActive ? 'active' : 'outline'} className="text-[10px]">
                      {activeSelectedAccount.isActive ? 'Active Session' : 'Standby Profile'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {filteredGames.length} title{filteredGames.length !== 1 ? 's' : ''} owned by this account.{' '}
                    {!activeSelectedAccount.isActive && (
                      <span className="text-amber-300 font-medium">
                        Clicking Play will automatically hot-swap into this profile first!
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!activeSelectedAccount.isActive && (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => handleManualSwap(activeSelectedAccount)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-lg"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Switch Active Session</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedAccountId('All')}
                  className="h-8 text-xs rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  View All
                </Button>
              </div>
            </div>
          )}

          {/* Hero Spotlight (shown when not searching) */}
          {!searchQuery && spotlightGame && (
            <HeroSpotlight
              game={spotlightGame}
              onPlay={handlePlay}
              onDetails={(g) => setDetailedGame(g)}
              launching={launchingGameId === spotlightGame.id}
              accounts={accounts}
            />
          )}

          {/* Games Container */}
          {loading && games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl animate-bounce">
                  🐧
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Scanning Game Repositories...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Querying Steam userdata, library manifests, and local game vaults
                </p>
              </div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3 text-center border border-dashed border-white/10 rounded-2xl p-8 bg-zinc-950/40">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">No games detected</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {searchQuery
                  ? `No games matched "${searchQuery}".`
                  : activeSelectedAccount
                  ? `No games registered for account ${activeSelectedAccount.displayName} under this filter.`
                  : 'No games found for this platform or filter. Click Rescan in the top right to refresh.'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className={`grid ${gridClasses}`}>
                  {displayedGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlay}
                      onDetails={(g) => setDetailedGame(g)}
                      onSelect={(g) => setSpotlightGameId(g.id)}
                      density={gridDensity}
                      accounts={accounts}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Sleek Table Header for List Preview */}
                  <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/5 select-none">
                    <span className="flex-1">Title & Directory</span>
                    <span className="hidden sm:block w-48 text-center">Owning Profile</span>
                    <span className="hidden md:block w-36 text-center">Status</span>
                    <span className="w-44 text-right pr-2">Session Control</span>
                  </div>
                  {displayedGames.map((game) => (
                    <GameListItem
                      key={game.id}
                      game={game}
                      onPlay={handlePlay}
                      onDetails={(g) => setDetailedGame(g)}
                      onSelect={(g) => setSpotlightGameId(g.id)}
                      isSelected={spotlightGame?.id === game.id}
                      accounts={accounts}
                    />
                  ))}
                </div>
              )}

              {/* Incremental Pagination for Large Libraries (Smooth 60FPS) */}
              {filteredGames.length > visibleLimit && (
                <div className="py-8 flex flex-col items-center justify-center gap-2.5">
                  <p className="text-xs text-muted-foreground">
                    Displaying <span className="font-semibold text-white">{displayedGames.length}</span> of{' '}
                    <span className="font-semibold text-white">{filteredGames.length}</span> titles
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleLimit((prev) => prev + 100)}
                      className="text-xs font-semibold rounded-xl border-white/10 hover:bg-white/10"
                    >
                      Load More Titles (+100)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVisibleLimit(filteredGames.length)}
                      className="text-xs text-muted-foreground hover:text-white"
                    >
                      Show All ({filteredGames.length})
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Conflict Resolution Modal */}
      <AccountSelectorModal
        conflict={conflict}
        onSelect={handleAccountSelect}
        onCancel={() => setConflict(null)}
      />

      {/* Standalone Accounts Manager Modal (TcNo Switcher) */}
      <AccountsManagerModal
        open={accountsModalOpen}
        onOpenChange={setAccountsModalOpen}
        accounts={accounts}
        games={uniqueGames}
        onSwapAccount={handleManualSwap}
        onRefresh={() => {
          refreshAccounts();
          rescan();
        }}
        onViewAccountGames={(accountId) => {
          setSelectedAccountId(accountId);
          setSelectedPlatform('All');
          setAccountsModalOpen(false);
        }}
        swappingAccountId={swappingAccountId}
      />

      {/* Game Details Inspector */}
      <GameDetailsModal
        game={detailedGame}
        accounts={accounts}
        onClose={() => setDetailedGame(null)}
        onPlay={handlePlay}
        onMapAccount={handleMapAccount}
        launching={launchingGameId === detailedGame?.id}
      />

      {/* Floating Status Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold z-50 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/30'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-900/30'
              : 'bg-zinc-900/95 border-violet-500/40 text-zinc-100 shadow-violet-900/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <div className="w-3.5 h-3.5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
