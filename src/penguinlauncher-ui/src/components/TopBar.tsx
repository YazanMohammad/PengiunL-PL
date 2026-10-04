import React from 'react';
import { Search, RefreshCw, Users, LayoutGrid, List, SlidersHorizontal, Monitor, Terminal, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import type { ViewMode, GridDensity, SortOption, SystemInfo } from '../types';

interface TopBarProps {
  onRescan: () => void;
  gameCount: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  gridDensity: GridDensity;
  onGridDensityChange: (density: GridDensity) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  onOpenAccounts: () => void;
  accountCount: number;
  systemInfo: SystemInfo | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  onRescan, gameCount, loading, searchQuery, onSearchChange, viewMode, onViewModeChange,
  gridDensity, onGridDensityChange, sortOption, onSortOptionChange, onOpenAccounts, accountCount, systemInfo,
}) => {
  const sorts: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Name (A - Z)' },
    { value: 'name-desc', label: 'Name (Z - A)' },
    { value: 'platform', label: 'Platform' },
  ];
  const densities: { value: GridDensity; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'standard', label: 'Standard' },
    { value: 'spacious', label: 'Spacious' },
  ];

  return (
    <header className="z-40 flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 lg:px-6">
      <div className="mr-auto flex items-center gap-2.5">
        <span className="text-lg" aria-hidden="true">🐧</span>
        <h1 className="text-sm font-medium tracking-tight">Penguin Launcher</h1>
        {systemInfo && (
          <Badge variant="outline" className="hidden gap-1 text-[10px] lg:inline-flex">
            {systemInfo.os === 'Linux' ? <Terminal className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            {systemInfo.os}
          </Badge>
        )}
        <span className="hidden text-xs text-muted-foreground xl:inline">{gameCount} {gameCount === 1 ? 'game' : 'games'}</span>
      </div>
      <div className="relative order-last w-full lg:order-none lg:w-64 xl:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input type="text" aria-label="Search games" placeholder="Search games, app IDs, paths..." value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="h-9 rounded-lg border-border bg-background pl-9 pr-9 text-xs shadow-none focus-visible:ring-ring" />
        {searchQuery && (
          <button aria-label="Clear search" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-border p-0.5" role="group" aria-label="Library view">
          <Button variant="ghost" size="icon-sm" onClick={() => onViewModeChange('grid')} aria-label="Grid View" aria-pressed={viewMode === 'grid'} title="Grid View" className={viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onViewModeChange('list')} aria-label="List View" aria-pressed={viewMode === 'list'} title="List View" className={viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}>
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Display settings" className="h-9 gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Display</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg border-border bg-popover shadow-none backdrop-blur-none">
            <div className="px-2.5 py-2 text-[11px] text-muted-foreground">Sort by</div>
            {sorts.map(({ value, label }) => (
              <DropdownMenuItem key={value} role="menuitemradio" aria-checked={sortOption === value} onClick={() => onSortOptionChange(value)} className="justify-between text-xs">
                {label}{sortOption === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2.5 py-2 text-[11px] text-muted-foreground">Grid density</div>
            {densities.map(({ value, label }) => (
              <DropdownMenuItem key={value} role="menuitemradio" aria-checked={gridDensity === value} onClick={() => onGridDensityChange(value)} className="justify-between text-xs">
                {label}{gridDensity === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" aria-label="Accounts" onClick={onOpenAccounts} className="h-9 gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Accounts</span>
          {accountCount > 0 && <span aria-hidden="true" className="text-[10px] text-muted-foreground">{accountCount}</span>}
        </Button>
        <Button variant="outline" size="sm" onClick={onRescan} disabled={loading} className="h-9 gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning...' : 'Rescan'}</span>
        </Button>
      </div>
    </header>
  );
};
