import React from 'react';
import { Gamepad2, Layers, Disc, Flame, Shield, Terminal, Users, CheckCircle2 } from 'lucide-react';
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

const navItems: { key: Platform | 'All'; label: string; icon: React.ElementType }[] = [
  { key: 'All', label: 'All Titles', icon: Layers },
  { key: 'Steam', label: 'Steam', icon: Disc },
  { key: 'Riot', label: 'Riot Games', icon: Flame },
  { key: 'Epic', label: 'Epic Games', icon: Shield },
  { key: 'EA', label: 'EA App', icon: Gamepad2 },
  { key: 'LinuxNative', label: 'Linux Native', icon: Terminal },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedPlatform, onSelectPlatform, selectedAccountId, onSelectAccount, installationFilter,
  onSelectInstallationFilter, platformCounts, totalGames, installedCount, uninstalledCount, accounts, accountGameCounts,
}) => {
  const statusItems: { key: InstallationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalGames },
    { key: 'installed', label: 'Installed', count: installedCount },
    { key: 'uninstalled', label: 'Ready', count: uninstalledCount },
  ];
  const rowClass = (selected: boolean) => `flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-border bg-secondary text-foreground' : 'border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`;
  const countClass = 'shrink-0 text-[10px] tabular-nums text-muted-foreground';

  return (
    <aside aria-label="Library filters" className="max-h-48 w-full shrink-0 overflow-y-auto border-b border-border bg-card p-3 md:max-h-none md:w-52 md:border-b-0 md:border-r lg:w-56">
      <div className="space-y-7">
        <section className="space-y-1" aria-label="Installation filters">
          <p className="px-3 pb-2 text-[11px] font-medium text-muted-foreground">Library status</p>
          <div className="flex gap-1">
            {statusItems.map(({ key, label, count }) => (
              <button key={key} aria-pressed={installationFilter === key} onClick={() => onSelectInstallationFilter(key)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md border py-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${installationFilter === key ? 'border-border bg-secondary text-foreground' : 'border-transparent text-muted-foreground hover:bg-secondary/50'}`}>
                <span>{label}</span><span className={countClass}>{count}</span>
              </button>
            ))}
          </div>
        </section>
        <nav aria-label="Platforms" className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-medium text-muted-foreground">Platforms</p>
          {navItems.map(({ key, label, icon: Icon }) => {
            const selected = selectedPlatform === key && selectedAccountId === 'All';
            return (
              <button key={key} aria-pressed={selected} onClick={() => { onSelectPlatform(key); onSelectAccount('All'); }} className={rowClass(selected)}>
                <span className="flex min-w-0 items-center gap-2.5"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{label}</span></span>
                <span className={countClass}>{key === 'All' ? totalGames : platformCounts[key] ?? 0}</span>
              </button>
            );
          })}
        </nav>
        {accounts.length > 0 && (
          <nav aria-label="Accounts" className="space-y-1 border-t border-border pt-5">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-[11px] font-medium text-muted-foreground">By account</p>
              {selectedAccountId !== 'All' && <button aria-label="Clear account filter" onClick={() => onSelectAccount('All')} className="rounded text-[11px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Clear</button>}
            </div>
            <button aria-pressed={selectedAccountId === 'All'} onClick={() => onSelectAccount('All')} className={rowClass(selectedAccountId === 'All')}>
              <span className="flex min-w-0 items-center gap-2.5"><Users className="h-3.5 w-3.5 shrink-0" /><span className="truncate">All User Accounts</span></span>
              <span className={countClass}>{totalGames}</span>
            </button>
            {accounts.map(acc => (
              <button key={acc.id} aria-pressed={selectedAccountId.toLowerCase() === acc.id.toLowerCase()} onClick={() => onSelectAccount(acc.id)} className={rowClass(selectedAccountId.toLowerCase() === acc.id.toLowerCase())}>
                <span className="flex min-w-0 items-center gap-2.5 text-left">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-[11px]">{acc.displayName.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{acc.displayName}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      {acc.platform} · {acc.isActive ? 'Active' : 'Standby'}
                      {acc.isActive && <CheckCircle2 className="h-2.5 w-2.5 text-primary" />}
                    </span>
                  </span>
                </span>
                <span className={countClass}>{accountGameCounts[acc.id] ?? 0}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
      <p className="mt-8 px-3 py-2 text-[10px] text-muted-foreground">Photino + .NET 10</p>
    </aside>
  );
};
