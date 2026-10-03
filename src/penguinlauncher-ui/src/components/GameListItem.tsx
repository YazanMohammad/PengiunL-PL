import React, { useState } from 'react';
import { Play, Info, User, Zap, Download, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Game, Platform, Account } from '../types';

interface GameListItemProps {
  game: Game;
  onPlay: (game: Game) => void;
  onDetails: (game: Game) => void;
  onSelect: (game: Game) => void;
  isSelected: boolean;
  accounts: Account[];
}

const PLATFORM_BADGES: Record<Platform, { variant: 'steam' | 'riot' | 'epic' | 'ea' | 'linux'; label: string }> = {
  Steam: { variant: 'steam', label: 'Steam' },
  Riot: { variant: 'riot', label: 'Riot' },
  Epic: { variant: 'epic', label: 'Epic' },
  EA: { variant: 'ea', label: 'EA' },
  LinuxNative: { variant: 'linux', label: 'Linux' },
};

export const GameListItem: React.FC<GameListItemProps> = ({
  game,
  onPlay,
  onDetails,
  onSelect,
  isSelected,
  accounts,
}) => {
  const [imgError, setImgError] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLaunching(true);
    try {
      await onPlay(game);
    } finally {
      setTimeout(() => setLaunching(false), 2000);
    }
  };

  const owningAccounts = accounts.filter(
    (a) =>
      game.associatedAccountIds.some((aid) => aid.toLowerCase() === a.id.toLowerCase()) ||
      (game.associatedAccountIds.length === 0 && game.platform === a.platform)
  );
  const singleOwner = owningAccounts.length === 1 ? owningAccounts[0] : null;
  const isMismatch = singleOwner && !singleOwner.isActive;
  const platformInfo = PLATFORM_BADGES[game.platform] || { variant: 'default', label: game.platform };

  return (
    <div
      onClick={() => onSelect(game)}
      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-violet-950/25 border-violet-500/50 shadow-lg shadow-violet-500/10'
          : 'bg-zinc-950/40 border-white/5 hover:border-white/15 hover:bg-zinc-900/60'
      }`}
    >
      {/* Left: 16:9 Thumbnail + Title + Subtitle */}
      <div className="flex items-center gap-4 min-w-0 flex-1 pr-3">
        {/* Widescreen Banner Thumbnail (Steam 460x215 ratio) */}
        <div className="w-28 sm:w-36 h-14 sm:h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10 relative shadow-sm group-hover:border-violet-500/40 transition-all">
          {game.coverImageUrl && !imgError ? (
            <img
              src={game.coverImageUrl}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground bg-zinc-900">
              {game.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {!game.isInstalled && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] text-sky-300 font-bold flex items-center gap-1 border border-sky-500/40 shadow">
              <Download className="w-2 h-2" />
              <span>Ready</span>
            </div>
          )}
        </div>

        {/* Title, Platform & Monospace Path */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
              {game.name}
            </h4>
            <Badge variant={platformInfo.variant} className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold">
              {platformInfo.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-muted-foreground/80 truncate font-mono">
              {game.installPath || (game.isInstalled ? 'Installed Title' : `Steam Install Protocol (AppID: ${game.platformGameId})`)}
            </p>
            {isMismatch && (
              <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1 shrink-0">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                Auto-swaps on Play
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Accounts Tag (High-visibility stacked avatar tag) */}
      <div className="hidden sm:flex items-center justify-center w-48 px-3 shrink-0">
        {owningAccounts.length > 1 ? (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-200 text-xs font-semibold backdrop-blur-md shadow-md shadow-violet-950/40"
            title={`Multi-Account Game: Owned by ${owningAccounts.map((a) => a.displayName).join(', ')}`}
          >
            <div className="flex -space-x-1.5 shrink-0">
              {owningAccounts.slice(0, 3).map((acc, idx) => (
                <span
                  key={acc.id}
                  className={`w-4 h-4 rounded-full border border-black text-[9px] font-black flex items-center justify-center shrink-0 ${
                    acc.isActive
                      ? 'bg-emerald-500 text-white'
                      : idx % 2 === 0
                      ? 'bg-violet-600 text-white'
                      : 'bg-sky-600 text-white'
                  }`}
                  title={`${acc.displayName} (${acc.isActive ? 'Active' : 'Standby'})`}
                >
                  {acc.displayName.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
            <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="text-[11px] truncate max-w-[120px]">
              {owningAccounts.length} Accounts
            </span>
          </div>
        ) : singleOwner ? (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              singleOwner.isActive
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-zinc-900/60 border-white/10 text-zinc-300'
            }`}
            title={`Account: ${singleOwner.displayName} (${singleOwner.isActive ? 'Active Session' : 'Standby Profile'})`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                singleOwner.isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              {singleOwner.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate max-w-[110px] text-[11px] font-semibold">{singleOwner.displayName}</span>
            {singleOwner.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
          </div>
        ) : null}
      </div>

      {/* Middle-Right: Installation State */}
      <div className="hidden md:flex items-center justify-center w-36 px-3 shrink-0">
        {game.isInstalled ? (
          <Badge variant="active" className="text-[10px] px-2.5 py-0.5 font-semibold gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Installed</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] px-2.5 py-0.5 font-semibold gap-1 border-dashed border-sky-400/40 text-sky-300 bg-sky-950/40 shadow-sm"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Ready to Install</span>
          </Badge>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end w-44 gap-2 shrink-0 pl-3">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onDetails(game);
          }}
          className="h-8 px-2.5 text-xs rounded-lg border-white/10 text-muted-foreground hover:text-white"
        >
          <Info className="w-3.5 h-3.5 mr-1" />
          <span>Details</span>
        </Button>

        <Button
          size="sm"
          variant={isMismatch ? 'glow' : game.isInstalled ? 'default' : 'secondary'}
          onClick={handlePlay}
          disabled={launching}
          className="h-8 px-3.5 text-xs font-bold rounded-lg gap-1.5 shadow-md"
        >
          {launching ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{game.isInstalled ? 'Launching' : 'Preparing'}</span>
            </>
          ) : isMismatch ? (
            <>
              <Zap className="w-3 h-3 text-amber-300 fill-current" />
              <span>{game.isInstalled ? 'Switch & Play' : 'Switch & Install'}</span>
            </>
          ) : game.isInstalled ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </>
          ) : (
            <>
              <Download className="w-3 h-3 text-sky-300" />
              <span>Install</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
