import React from 'react';
import { Gamepad2, Layers, Disc, Flame, Shield, Terminal, Users, User, CheckCircle2, Zap, HardDrive, DownloadCloud } from 'lucide-react';
import type { Platform, Account, InstallationFilter } from '../types';

interface SidebarProps {
  selectedPlatform: Platform | 'All';
  onSelectPlatform: (platform: Platform | 'All') => void;
  selectedAccountId: string | 'All';
  onSelectAccount: (accountId: string | 'All') => void;
  installationFilter: InstallationFilter;
  onSelectInstallationFilter: (filter: InstallationFilter) => void;
  platformCounts: Record<string, number>;
  totalGames: number;
  installedCount: number;
  uninstalledCount: number;
  accounts: Account[];
  accountGameCounts: Record<string, number>;
}

interface NavItem {
  key: Platform | 'All';
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  badgeColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedPlatform,
  onSelectPlatform,
  selectedAccountId,
  onSelectAccount,
  installationFilter,
  onSelectInstallationFilter,
  platformCounts,
  totalGames,
  installedCount,
  uninstalledCount,
  accounts,
  accountGameCounts,
}) => {
  const navItems: NavItem[] = [
    {
      key: 'All',
      label: 'All Titles',
      icon: <Layers className="w-4 h-4 text-violet-400" />,
      activeColor: 'bg-violet-600/15 text-violet-300 border-violet-500/30',
      badgeColor: 'bg-violet-500/20 text-violet-300',
    },
    {
      key: 'Steam',
      label: 'Steam',
      icon: <Disc className="w-4 h-4 text-sky-400" />,
      activeColor: 'bg-sky-600/15 text-sky-300 border-sky-500/30',
      badgeColor: 'bg-sky-500/20 text-sky-300',
    },
    {
      key: 'Riot',
      label: 'Riot Games',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      activeColor: 'bg-rose-600/15 text-rose-300 border-rose-500/30',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      key: 'Epic',
      label: 'Epic Games',
      icon: <Shield className="w-4 h-4 text-neutral-300" />,
      activeColor: 'bg-neutral-600/20 text-white border-neutral-500/30',
      badgeColor: 'bg-neutral-500/20 text-neutral-300',
    },
    {
      key: 'EA',
      label: 'EA App',
      icon: <Gamepad2 className="w-4 h-4 text-amber-400" />,
      activeColor: 'bg-amber-600/15 text-amber-300 border-amber-500/30',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      key: 'LinuxNative',
      label: 'Linux Native',
      icon: <Terminal className="w-4 h-4 text-yellow-400" />,
      activeColor: 'bg-yellow-600/15 text-yellow-300 border-yellow-500/30',
      badgeColor: 'bg-yellow-500/20 text-yellow-300',
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950/60 border-r border-white/5 p-3 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Installation State Filter */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 flex items-center justify-between">
            <span>Library Status</span>
          </p>
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => onSelectInstallationFilter('all')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                installationFilter === 'all'
                  ? 'bg-violet-600/30 text-white border border-violet-500/40 font-bold shadow'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>All</span>
              <span className="text-[9px] opacity-75">{totalGames}</span>
            </button>
            <button
              onClick={() => onSelectInstallationFilter('installed')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                installationFilter === 'installed'
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 font-bold shadow'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>Installed</span>
              <span className="text-[9px] opacity-75">{installedCount}</span>
            </button>
            <button
              onClick={() => onSelectInstallationFilter('uninstalled')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                installationFilter === 'uninstalled'
                  ? 'bg-sky-600/30 text-sky-200 border border-sky-500/40 font-bold shadow'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>Ready</span>
              <span className="text-[9px] opacity-75">{uninstalledCount}</span>
            </button>
          </div>
        </div>

        {/* Platforms Navigation */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
            Platforms
          </p>

          {navItems.map(({ key, label, icon, activeColor, badgeColor }) => {
            const count = key === 'All' ? totalGames : (platformCounts[key] ?? 0);
            const isActive = selectedPlatform === key && selectedAccountId === 'All';

            return (
              <button
                key={key}
                onClick={() => {
                  onSelectPlatform(key);
                  onSelectAccount('All');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? `${activeColor} shadow-sm font-semibold`
                    : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {icon}
                  <span className="truncate">{label}</span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? badgeColor : 'bg-white/5 text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separate Accounts Section */}
        {accounts.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between px-3 py-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                By Account
              </p>
              {selectedAccountId !== 'All' && (
                <button
                  onClick={() => onSelectAccount('All')}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* All Profiles */}
            <button
              onClick={() => onSelectAccount('All')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                selectedAccountId === 'All'
                  ? 'bg-white/10 text-white border-white/20 font-semibold'
                  : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm">🌐</span>
                <span className="truncate">All User Accounts</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/5 text-muted-foreground">
                {totalGames}
              </span>
            </button>

            {/* Individual Accounts */}
            {accounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              const count = accountGameCounts[acc.id] ?? 0;
              const platformColor =
                acc.platform === 'Steam'
                  ? 'border-sky-500/30 bg-sky-950 text-sky-300'
                  : acc.platform === 'Epic'
                  ? 'border-violet-500/30 bg-violet-950 text-violet-300'
                  : acc.platform === 'EA'
                  ? 'border-orange-500/30 bg-orange-950 text-orange-300'
                  : 'border-rose-500/30 bg-rose-950 text-rose-300';

              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border group ${
                    isSelected
                      ? 'bg-violet-600/20 text-white border-violet-500/40 font-semibold shadow-sm shadow-violet-500/10'
                      : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border shrink-0 ${platformColor}`}
                    >
                      {acc.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-white/90 group-hover:text-white">
                          {acc.displayName}
                        </span>
                        {acc.isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Active Session" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 block truncate">
                        {acc.platform}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-violet-500/30 text-violet-200'
                        : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1 mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Engine</span>
          <span className="text-white font-mono">Photino + .NET 10</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Session Vault</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Synchronized
          </span>
        </div>
      </div>
    </aside>
  );
};
