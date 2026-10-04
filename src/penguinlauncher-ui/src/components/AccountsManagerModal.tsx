
import React, { useState, useMemo, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
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
  const formId = useId();
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

  const formError = statusMessage?.isError ? (
    <p role="alert" className="rounded-md border border-destructive bg-background p-3 text-sm text-red-300">
      {statusMessage.text}
    </p>
  ) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[88dvh] flex flex-col border-border bg-card p-5 sm:p-6">
          <DialogHeader className="space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary text-muted-foreground flex items-center justify-center border border-border shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-foreground tracking-tight break-words">
                    Account Hot-Switcher & Manager
                  </DialogTitle>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 gap-1.5 text-xs rounded-lg border-border hover:bg-secondary"
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
              role={statusMessage.isError ? 'alert' : 'status'}
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in duration-200 shrink-0 ${
                statusMessage.isError
                  ? 'bg-background border-destructive text-red-300'
                  : 'bg-background border-border text-foreground'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Platform Tabs & Quick Actions */}
          <div className="space-y-3 pt-1 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 bg-background p-1 rounded-lg border border-border">
                {(['All', 'Steam', 'Epic', 'EA', 'Riot'] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  const count =
                    tab === 'All'
                      ? accounts.length
                      : platformCounts[tab as Platform] || 0;

                  return (
                    <button
                      key={tab}
                      aria-pressed={isSelected}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-secondary text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <span>{tab === 'All' ? 'All Platforms' : tab === 'EA' ? 'EA App' : tab}</span>
                      <span
                        className="text-xs text-muted-foreground"
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
                  className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border hover:border-muted-foreground hover:bg-secondary"
                >
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>Capture Active</span>
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setAddPlatform(activeTab !== 'All' ? activeTab : 'Steam');
                    setIsAddOpen(true);
                  }}
                  className="h-8 text-xs font-semibold gap-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Profile</span>
                </Button>
              </div>
            </div>

            {/* Platform Quick Bar (Log out platform) */}
            {activeTab !== 'All' && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background border border-border text-xs">
                <span className="text-muted-foreground">
                  Need to connect a new {activeTab} account?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogoutPlatform(activeTab)}
                  disabled={busyAction === `logout_${activeTab}`}
                  className="h-auto min-h-7 text-xs text-amber-300 hover:text-amber-200 hover:bg-secondary gap-1.5 whitespace-normal text-left"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Clear {activeTab} Session to Log In</span>
                </Button>
              </div>
            )}
          </div>

          {/* Accounts List Container with Clean Fluid Scroll */}
          <div className="flex-1 min-h-0 space-y-2.5 my-3 overflow-y-auto pr-1.5 shrink-0 sm:shrink">
            {displayedAccounts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-lg bg-background">
                <div className="w-10 h-10 rounded-lg bg-secondary mx-auto flex items-center justify-center text-muted-foreground mb-2">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">No accounts found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  {activeTab === 'All'
                    ? 'No accounts registered yet. Use "Capture Active" to automatically detect your current session, or click "Add Profile".'
                    : `No ${activeTab} profiles detected. Click "Capture Active" to vault your current ${activeTab} login.`}
                </p>
              </div>
            ) : (
              displayedAccounts.map((account) => {
                const isSwapping = swappingAccountId === account.id;

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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-lg border border-border bg-background"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-md bg-secondary border border-border text-muted-foreground font-semibold flex items-center justify-center text-sm shrink-0 mt-0.5"
                      >
                        {account.displayName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                            {account.displayName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {account.platform}
                          </span>
                          {account.isActive ? (
                            <span className="inline-flex items-center text-xs text-primary">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              Active Session
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Ready
                            </span>
                          )}

                          {/* Games Count Badge */}
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Gamepad2 className="w-3 h-3 text-primary" />
                            <span>{accountGames.length} {accountGames.length === 1 ? 'game' : 'games'}</span>
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">
                          ID: {account.platformUserId}
                        </p>

                        {/* Games Preview & Quick Browse */}
                        {accountGames.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-border">
                            <span className="text-[10px] text-muted-foreground font-medium">Owned:</span>
                            {accountGames.slice(0, 3).map((g) => (
                              <span
                                key={g.id}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground truncate max-w-[140px]"
                                title={g.name}
                              >
                                {g.name}
                              </span>
                            ))}
                            {accountGames.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-background text-muted-foreground">
                                +{accountGames.length - 3} more
                              </span>
                            )}
                            {onViewAccountGames && (
                              <button
                                type="button"
                                onClick={() => onViewAccountGames(account.id)}
                                className="text-[10px] text-primary hover:text-foreground font-semibold ml-auto flex items-center gap-1 hover:underline"
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
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Rename alias"
                        aria-label={`Rename ${account.displayName}`}
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
                        aria-label={`Remove ${account.displayName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Switch Button */}
                      <Button
                        size="sm"
                        variant={account.isActive ? 'outline' : 'default'}
                        disabled={account.isActive || isSwapping}
                        onClick={() => onSwapAccount(account)}
                        className="h-8 text-xs font-semibold gap-1.5 rounded-lg ml-1"
                      >
                        {isSwapping ? (
                          <>
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span role="status">Swapping...</span>
                          </>
                        ) : account.isActive ? (
                          <span className="text-primary font-medium">● Current</span>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
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
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground shrink-0 mt-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
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
        <DialogContent className="w-[92vw] max-w-md border-border bg-card p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add Account Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register an account profile entry. You can map games to this profile or switch into it once configured.
            </DialogDescription>
          </DialogHeader>

          {formError}

          <form onSubmit={handleAddSubmit} className="space-y-4 my-2">
            <fieldset>
              <legend className="text-xs font-medium text-muted-foreground block mb-1.5">
                Launcher Platform
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Steam', 'Epic', 'EA', 'Riot'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setAddPlatform(plat)}
                    aria-pressed={addPlatform === plat}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      addPlatform === plat
                        ? 'bg-secondary border-border text-foreground font-semibold'
                        : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {plat === 'EA' ? 'EA App' : plat}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`${formId}-add-name`} className="text-xs font-medium text-muted-foreground block mb-1.5">
                Profile Display Name / Alias <span className="text-rose-400">*</span>
              </label>
              <Input
                id={`${formId}-add-name`}
                placeholder="e.g. Main Account, Brother's Smurf"
                value={addDisplayName}
                onChange={(e) => setAddDisplayName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor={`${formId}-add-user`} className="text-xs font-medium text-muted-foreground block mb-1.5">
                Platform User ID / Account Name (Optional)
              </label>
              <Input
                id={`${formId}-add-user`}
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
                variant="default"
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
        <DialogContent className="w-[92vw] max-w-md border-border bg-card p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Capture Active Session
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reads your currently logged-in account tokens from the official client files and vaults them as a switchable profile.
            </DialogDescription>
          </DialogHeader>

          {formError}

          <form onSubmit={handleCaptureSubmit} className="space-y-4 my-2">
            <fieldset>
              <legend className="text-xs font-medium text-muted-foreground block mb-1.5">
                Target Platform
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Steam', 'Epic', 'EA', 'Riot'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setCapturePlatform(plat)}
                    aria-pressed={capturePlatform === plat}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      capturePlatform === plat
                        ? 'bg-secondary border-border text-foreground font-semibold'
                        : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {plat === 'EA' ? 'EA App' : plat}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`${formId}-capture-name`} className="text-xs font-medium text-muted-foreground block mb-1.5">
                Custom Name (Optional)
              </label>
              <Input
                id={`${formId}-capture-name`}
                placeholder="Leave blank to use auto-detected persona name"
                value={captureDisplayName}
                onChange={(e) => setCaptureDisplayName(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-lg bg-background border border-border text-[11px] text-primary">
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
                variant="default"
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
        <DialogContent className="w-[92vw] max-w-sm border-border bg-card p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" />
              Rename Profile Alias
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the display name for {targetAccount?.displayName}.
            </DialogDescription>
          </DialogHeader>

          {formError}

          <form onSubmit={handleRenameSubmit} className="space-y-4 my-2">
            <div>
              <label htmlFor={`${formId}-rename-name`} className="text-xs font-medium text-muted-foreground block mb-1.5">
                New Display Name
              </label>
              <Input
                id={`${formId}-rename-name`}
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
                variant="default"
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
        <DialogContent className="w-[92vw] max-w-sm border-border bg-card p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Remove Profile?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove <span className="text-foreground font-semibold">{targetAccount?.displayName}</span>?
              This will delete the local session backup from the vault.
            </DialogDescription>
          </DialogHeader>

          {formError}

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
