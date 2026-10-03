
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Users,
  CheckCircle2,
  Zap,
  RefreshCw,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Camera,
  Gamepad2,
  AlertCircle,
} from 'lucide-react';
import type { Account, Platform, Game } from '../types';
import { api } from '../api/client';

interface AccountsManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  games?: Game[];
  onSwapAccount: (account: Account) => Promise<void>;
  onRefresh: () => void;
  swappingAccountId: string | null;
  onViewAccountGames?: (accountId: string) => void;
}

export const AccountsManagerModal: React.FC<AccountsManagerModalProps> = ({
  open,
  onOpenChange,
  accounts,
  games = [],
  onSwapAccount,
  onRefresh,
  swappingAccountId,
  onViewAccountGames,
}) => {
  const [activeTab, setActiveTab] = useState<Platform | 'All'>('All');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Sub-dialogs state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [addPlatform, setAddPlatform] = useState<Platform>('Steam');
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addUserId, setAddUserId] = useState('');

  const [capturePlatform, setCapturePlatform] = useState<Platform>('Steam');
  const [captureDisplayName, setCaptureDisplayName] = useState('');

  const [renameValue, setRenameValue] = useState('');

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Grouped counts
  const platformCounts = useMemo<Record<string, number>>(() => {
    return {
      Steam: accounts.filter((a) => a.platform === 'Steam').length,
      Epic: accounts.filter((a) => a.platform === 'Epic').length,
      EA: accounts.filter((a) => a.platform === 'EA').length,
      Riot: accounts.filter((a) => a.platform === 'Riot').length,
    };
  }, [accounts]);

  // Filtered accounts
  const displayedAccounts = useMemo(() => {
    if (activeTab === 'All') return accounts;
    return accounts.filter((a) => a.platform === activeTab);
  }, [accounts, activeTab]);

  // Handle Add Account
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDisplayName.trim()) return;

    setBusyAction('add');
    try {
      await api.addAccount({
        displayName: addDisplayName.trim(),
        platform: addPlatform,
        platformUserId: addUserId.trim() || undefined,
      });
      showStatus(`Added profile: ${addDisplayName}`);
      setIsAddOpen(false);
      setAddDisplayName('');
      setAddUserId('');
      onRefresh();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Failed to add profile', true);
    } finally {
      setBusyAction(null);
    }
  };

  // Handle Capture Session
  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('capture');
    try {
      const captured = await api.captureActiveSession(
        capturePlatform,
        captureDisplayName.trim() || undefined
      );
      showStatus(`Captured session for ${captured.displayName}!`);
      setIsCaptureOpen(false);
      setCaptureDisplayName('');
      onRefresh();
    } catch (err) {
      showStatus(
        err instanceof Error ? err.message : `No active session found for ${capturePlatform}`,
        true
      );
    } finally {
      setBusyAction(null);
    }
  };

  // Handle Rename
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount || !renameValue.trim()) return;

    setBusyAction('rename');
    try {
      await api.renameAccount(targetAccount.id, renameValue.trim());
      showStatus(`Renamed to "${renameValue.trim()}"`);
      setIsRenameOpen(false);
      setTargetAccount(null);
      setRenameValue('');
      onRefresh();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Failed to rename account', true);
    } finally {
      setBusyAction(null);
    }
  };

  // Handle Remove Account
  const handleConfirmDelete = async () => {
    if (!targetAccount) return;

    setBusyAction('delete');
    try {
      await api.removeAccount(targetAccount.id);
      showStatus(`Removed ${targetAccount.displayName}`);
      setIsDeleteOpen(false);
      setTargetAccount(null);
      onRefresh();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Failed to remove account', true);
    } finally {
      setBusyAction(null);
    }
  };

  // Handle Logout Platform
  const handleLogoutPlatform = async (platform: Platform) => {
    setBusyAction(`logout_${platform}`);
    try {
      await api.logoutPlatform(platform);
      showStatus(`Logged out of ${platform}. Client will open to clean login.`);
      onRefresh();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : `Failed to logout of ${platform}`, true);
    } finally {
      setBusyAction(null);
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'Steam':
        return {
          bg: 'bg-sky-950/60',
          border: 'border-sky-500/30',
          text: 'text-sky-300',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'Epic':
        return {
          bg: 'bg-violet-950/60',
          border: 'border-violet-500/30',
          text: 'text-violet-300',
          badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        };
      case 'EA':
        return {
          bg: 'bg-orange-950/60',
          border: 'border-orange-500/30',
          text: 'text-orange-300',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
      case 'Riot':
        return {
          bg: 'bg-rose-950/60',
          border: 'border-rose-500/30',
          text: 'text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      default:
        return {
          bg: 'bg-zinc-900',
          border: 'border-white/10',
          text: 'text-zinc-200',
          badge: 'bg-white/10 text-white border-white/20',
        };
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[88vh] flex flex-col border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6 overflow-hidden">
          <DialogHeader className="space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30 shadow-md">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white tracking-tight">
                    Account Hot-Switcher & Manager
                  </DialogTitle>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 gap-1.5 text-xs rounded-xl border-white/10 hover:bg-white/5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            <DialogDescription className="text-xs text-muted-foreground">
              Universal multi-platform session vault (TcNo logic). Hot-swap between Steam, Epic Games, EA App, and Riot accounts without manual re-authentication.
            </DialogDescription>
          </DialogHeader>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 shrink-0 ${
                statusMessage.isError
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Platform Tabs & Quick Actions */}
          <div className="space-y-3 pt-1 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
                {(['All', 'Steam', 'Epic', 'EA', 'Riot'] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  const count =
                    tab === 'All'
                      ? accounts.length
                      : platformCounts[tab as Platform] || 0;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-sm font-semibold'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{tab === 'All' ? 'All Platforms' : tab === 'EA' ? 'EA App' : tab}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-muted-foreground'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCapturePlatform(activeTab !== 'All' ? activeTab : 'Steam');
                    setIsCaptureOpen(true);
                  }}
                  className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-white/10 hover:border-violet-500/40 hover:bg-violet-950/20"
                >
                  <Camera className="w-3.5 h-3.5 text-violet-400" />
                  <span>Capture Active</span>
                </Button>

                <Button
                  size="sm"
                  variant="glow"
                  onClick={() => {
                    setAddPlatform(activeTab !== 'All' ? activeTab : 'Steam');
                    setIsAddOpen(true);
                  }}
                  className="h-8 text-xs font-semibold gap-1.5 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Profile</span>
                </Button>
              </div>
            </div>

            {/* Platform Quick Bar (Log out platform) */}
            {activeTab !== 'All' && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/5 text-xs">
                <span className="text-muted-foreground">
                  Need to connect a new {activeTab} account?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogoutPlatform(activeTab)}
                  disabled={busyAction === `logout_${activeTab}`}
                  className="h-7 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 gap-1.5"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Clear {activeTab} Session to Log In</span>
                </Button>
              </div>
            )}
          </div>

          {/* Accounts List Container with Clean Fluid Scroll */}
          <div className="flex-1 min-h-0 space-y-2.5 my-3 overflow-y-auto pr-1.5">
            {displayedAccounts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
                <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-muted-foreground mb-2">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-white">No accounts found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  {activeTab === 'All'
                    ? 'No accounts registered yet. Use "Capture Active" to automatically detect your current session, or click "Add Profile".'
                    : `No ${activeTab} profiles detected. Click "Capture Active" to vault your current ${activeTab} login.`}
                </p>
              </div>
            ) : (
              displayedAccounts.map((account) => {
                const isSwapping = swappingAccountId === account.id;
                const colors = getPlatformColor(account.platform);

                // Compute games for this specific account
                const accountGames = games.filter(
                  (g) =>
                    g.associatedAccountIds.some(
                      (aid) => aid.toLowerCase() === account.id.toLowerCase()
                    ) ||
                    (g.associatedAccountIds.length === 0 && g.platform === account.platform)
                );

                return (
                  <div
                    key={account.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border ${colors.text} font-bold flex items-center justify-center text-sm shadow-md shrink-0 mt-0.5`}
                      >
                        {account.displayName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                            {account.displayName}
                          </p>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border ${colors.badge}`}>
                            {account.platform}
                          </Badge>
                          {account.isActive ? (
                            <Badge variant="active" className="text-[10px] px-2 py-0.5 h-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              Active Session
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-white/10 text-muted-foreground">
                              Ready
                            </Badge>
                          )}

                          {/* Games Count Badge */}
                          <span className="text-[11px] font-medium text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                            <Gamepad2 className="w-3 h-3 text-violet-400" />
                            <span>{accountGames.length} {accountGames.length === 1 ? 'game' : 'games'}</span>
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">
                          ID: {account.platformUserId}
                        </p>

                        {/* Games Preview & Quick Browse */}
                        {accountGames.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-muted-foreground font-medium">Owned:</span>
                            {accountGames.slice(0, 3).map((g) => (
                              <span
                                key={g.id}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 border border-white/5 text-zinc-300 truncate max-w-[140px]"
                                title={g.name}
                              >
                                {g.name}
                              </span>
                            ))}
                            {accountGames.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800/40 text-muted-foreground">
                                +{accountGames.length - 3} more
                              </span>
                            )}
                            {onViewAccountGames && (
                              <button
                                type="button"
                                onClick={() => onViewAccountGames(account.id)}
                                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold ml-auto flex items-center gap-1 hover:underline"
                              >
                                View in Library →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Rename Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTargetAccount(account);
                          setRenameValue(account.displayName);
                          setIsRenameOpen(true);
                        }}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-white"
                        title="Rename alias"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Remove Profile Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTargetAccount(account);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-400"
                        title="Remove profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Switch Button */}
                      <Button
                        size="sm"
                        variant={account.isActive ? 'outline' : 'glow'}
                        disabled={account.isActive || isSwapping}
                        onClick={() => onSwapAccount(account)}
                        className="h-8 text-xs font-semibold gap-1.5 rounded-xl ml-1"
                      >
                        {isSwapping ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Swapping...</span>
                          </>
                        ) : account.isActive ? (
                          <span className="text-emerald-400 font-medium">● Current</span>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Switch</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground shrink-0 mt-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Password Local Vault Active · Supports Steam, Epic, EA App, Riot</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-lg"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Add Profile Dialog */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[92vw] max-w-md border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" />
              Add Account Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register an account profile entry. You can map games to this profile or switch into it once configured.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Launcher Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Steam', 'Epic', 'EA', 'Riot'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setAddPlatform(plat)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      addPlatform === plat
                        ? 'bg-violet-600 border-violet-500 text-white font-semibold shadow-md'
                        : 'bg-zinc-900 border-white/10 text-muted-foreground hover:bg-zinc-800'
                    }`}
                  >
                    {plat === 'EA' ? 'EA App' : plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Profile Display Name / Alias <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Main Account, Brother's Smurf"
                value={addDisplayName}
                onChange={(e) => setAddDisplayName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Platform User ID / Account Name (Optional)
              </label>
              <Input
                placeholder="e.g. SteamID64, Nucleus ID, Epic User ID"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="sm"
                disabled={busyAction === 'add' || !addDisplayName.trim()}
                className="h-8 text-xs font-semibold"
              >
                {busyAction === 'add' ? 'Saving...' : 'Add Profile'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Capture Active Session Dialog */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isCaptureOpen} onOpenChange={setIsCaptureOpen}>
        <DialogContent className="w-[92vw] max-w-md border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-violet-400" />
              Capture Active Session
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reads your currently logged-in account tokens from the official client files and vaults them as a switchable profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCaptureSubmit} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Target Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Steam', 'Epic', 'EA', 'Riot'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setCapturePlatform(plat)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      capturePlatform === plat
                        ? 'bg-violet-600 border-violet-500 text-white font-semibold shadow-md'
                        : 'bg-zinc-900 border-white/10 text-muted-foreground hover:bg-zinc-800'
                    }`}
                  >
                    {plat === 'EA' ? 'EA App' : plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Custom Name (Optional)
              </label>
              <Input
                placeholder="Leave blank to use auto-detected persona name"
                value={captureDisplayName}
                onChange={(e) => setCaptureDisplayName(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-[11px] text-violet-300">
              💡 Tip: Make sure you are logged into your desired account in the official launcher before capturing.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCaptureOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="sm"
                disabled={busyAction === 'capture'}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{busyAction === 'capture' ? 'Capturing...' : 'Capture Session'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Rename Profile Dialog */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="w-[92vw] max-w-sm border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-violet-400" />
              Rename Profile Alias
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 my-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                New Display Name
              </label>
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new display name"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRenameOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="sm"
                disabled={busyAction === 'rename' || !renameValue.trim()}
                className="h-8 text-xs font-semibold"
              >
                {busyAction === 'rename' ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Delete Confirmation Dialog */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[92vw] max-w-sm border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Remove Profile?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove <span className="text-white font-semibold">{targetAccount?.displayName}</span>?
              This will delete the local session backup from the vault.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={busyAction === 'delete'}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700"
            >
              {busyAction === 'delete' ? 'Removing...' : 'Remove Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
