import React from 'react';
import {
  Search,
  RefreshCw,
  Users,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Monitor,
  Terminal,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
  onRescan,
  gameCount,
  loading,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  gridDensity,
  onGridDensityChange,
  sortOption,
  onSortOptionChange,
  onOpenAccounts,
  accountCount,
  systemInfo,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-40">
      {/* Brand & Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-md shadow-violet-500/20 text-white font-bold text-lg select-none">
            🐧
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Penguin Launcher
              </h1>
              {systemInfo && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono text-muted-foreground border-white/10">
                  {systemInfo.os === 'Linux' ? <Terminal className="w-2.5 h-2.5 mr-1 text-yellow-400" /> : <Monitor className="w-2.5 h-2.5 mr-1 text-sky-400" />}
                  {systemInfo.os}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Universal Library & Account Switcher
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

        <Badge variant="secondary" className="hidden sm:inline-flex bg-white/5 hover:bg-white/10 text-xs px-2.5 py-0.5 font-medium border border-white/5">
          {gameCount} {gameCount === 1 ? 'game' : 'games'}
        </Badge>
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative w-56 md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search games, app IDs... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-zinc-900/60 border-white/10 focus-visible:ring-violet-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-zinc-900/80 p-0.5 rounded-xl border border-white/10">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-lg ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-lg ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Display Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Display</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sort By
            </div>
            <DropdownMenuItem
              onClick={() => onSortOptionChange('name-asc')}
              className={sortOption === 'name-asc' ? 'text-violet-400 font-medium' : ''}
            >
              Name (A - Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortOptionChange('name-desc')}
              className={sortOption === 'name-desc' ? 'text-violet-400 font-medium' : ''}
            >
              Name (Z - A)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortOptionChange('platform')}
              className={sortOption === 'platform' ? 'text-violet-400 font-medium' : ''}
            >
              Platform
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Grid Density
            </div>
            <DropdownMenuItem
              onClick={() => onGridDensityChange('compact')}
              className={gridDensity === 'compact' ? 'text-violet-400 font-medium' : ''}
            >
              Compact
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onGridDensityChange('standard')}
              className={gridDensity === 'standard' ? 'text-violet-400 font-medium' : ''}
            >
              Standard
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onGridDensityChange('spacious')}
              className={gridDensity === 'spacious' ? 'text-violet-400 font-medium' : ''}
            >
              Spacious
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Accounts Switcher Panel Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAccounts}
          className="h-9 gap-2 rounded-xl text-xs hover:border-violet-500/40 relative"
        >
          <Users className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">Accounts</span>
          {accountCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-violet-500/20 text-violet-300">
              {accountCount}
            </Badge>
          )}
        </Button>

        {/* Rescan Button */}
        <Button
          variant="glow"
          size="sm"
          onClick={onRescan}
          disabled={loading}
          className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning...' : 'Rescan'}</span>
        </Button>
      </div>
    </header>
  );
};
