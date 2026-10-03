import React, { useState } from 'react';
import { Play, MoreVertical, Info, ExternalLink, ShieldAlert, CheckCircle2, User, Zap, Download, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Game, Platform, GridDensity, Account } from '../types';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  onDetails: (game: Game) => void;
  onSelect: (game: Game) => void;
  density: GridDensity;
  accounts: Account[];
}

const PLATFORM_BADGES: Record<Platform, { variant: 'steam' | 'riot' | 'epic' | 'ea' | 'linux'; label: string }> = {
  Steam: { variant: 'steam', label: 'Steam' },
  Riot: { variant: 'riot', label: 'Riot' },
  Epic: { variant: 'epic', label: 'Epic' },
  EA: { variant: 'ea', label: 'EA' },
  LinuxNative: { variant: 'linux', label: 'Linux' },
};

const PLATFORM_FALLBACK_GRADIENTS: Record<Platform, string> = {
  Steam: 'from-slate-900 via-sky-950 to-blue-900',
  Riot: 'from-zinc-950 via-rose-950 to-red-900',
  Epic: 'from-zinc-900 via-neutral-900 to-zinc-800',
  EA: 'from-neutral-950 via-amber-950 to-orange-900',
  LinuxNative: 'from-zinc-900 via-yellow-950 to-amber-900',
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPlay,
  onDetails,
  onSelect,
  density,
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
      className="group relative rounded-2xl overflow-hidden glass-card transition-all duration-300 hover:scale-[1.03] cursor-pointer flex flex-col justify-end"
      style={{
        aspectRatio: density === 'compact' ? '3/4' : '2/3',
      }}
    >
      {/* Cover Image or Monogram Fallback */}
      {game.coverImageUrl && !imgError ? (
        <img
          src={game.coverImageUrl}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${PLATFORM_FALLBACK_GRADIENTS[game.platform]} flex flex-col items-center justify-center p-4 text-center select-none`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 font-bold text-xl mb-3 shadow-inner border border-white/10">
            {game.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-white/90 line-clamp-2 px-2">
            {game.name}
          </span>
        </div>
      )}

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-75 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Top Header Tags */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 gap-1.5">
        <Badge variant={platformInfo.variant} className="text-[10px] px-2 py-0.5 backdrop-blur-md font-semibold tracking-wide">
          {platformInfo.label}
        </Badge>

        <div className="flex items-center gap-1">
          {/* Uninstalled Tag */}
          {!game.isInstalled && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-5 border-dashed border-sky-400/40 text-sky-300 bg-sky-950/40 backdrop-blur-md"
              title="Not locally installed. Clicking Install will launch installation via official client."
            >
              <Download className="w-2.5 h-2.5 mr-1" />
              Ready
            </Badge>
          )}

          {/* Owning Account Badge */}
          {owningAccounts.length > 1 ? (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-950/90 border border-violet-500/40 text-violet-200 text-[10px] font-semibold backdrop-blur-md shadow-md shadow-violet-950/60"
              title={`Multi-Account Game: Owned by ${owningAccounts.map((a) => a.displayName).join(', ')}`}
            >
              <div className="flex -space-x-1 shrink-0">
                {owningAccounts.slice(0, 3).map((acc, idx) => (
                  <span
                    key={acc.id}
                    className={`w-3.5 h-3.5 rounded-full border border-black text-[8px] font-black flex items-center justify-center shrink-0 ${
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
              <span className="truncate">{owningAccounts.length} Accts</span>
            </div>
          ) : singleOwner ? (
            <Badge
              variant={singleOwner.isActive ? 'active' : 'outline'}
              className="text-[9px] px-1.5 py-0 h-5 max-w-[110px] truncate backdrop-blur-md"
              title={`Belongs to account: ${singleOwner.displayName}`}
            >
              <User className="w-2.5 h-2.5 mr-1 shrink-0" />
              <span className="truncate">{singleOwner.displayName}</span>
            </Badge>
          ) : null}

          {/* Context Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onPlay(game)}>
                {game.isInstalled ? (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                    Launch Game
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-2 text-sky-400" />
                    Install Game
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDetails(game)}>
                <Info className="w-3.5 h-3.5 mr-2 text-sky-400" />
                Game Details & Accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Information & Hover Actions */}
      <div className="relative z-10 p-3.5 w-full flex flex-col justify-end">
        <h3 className="text-white font-semibold text-xs md:text-sm leading-tight drop-shadow line-clamp-1 group-hover:line-clamp-2 transition-all">
          {game.name}
        </h3>

        {/* Ownership / Auto-Swap Indicators */}
        {owningAccounts.length > 1 ? (
          <p className="text-[10px] text-violet-300 font-medium flex items-center gap-1 mt-1 truncate">
            <Users className="w-2.5 h-2.5 text-violet-400 shrink-0" />
            <span className="truncate">Shared: {owningAccounts.map((a) => a.displayName).join(', ')}</span>
          </p>
        ) : isMismatch ? (
          <p className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 mt-1 truncate">
            <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>Swaps to {singleOwner?.displayName}</span>
          </p>
        ) : singleOwner ? (
          <p className="text-[10px] text-zinc-400/80 font-medium flex items-center gap-1 mt-1 truncate">
            <User className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
            <span className="truncate">{singleOwner.displayName}</span>
          </p>
        ) : null}

        {/* Action Button */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
          <Button
            size="sm"
            variant={isMismatch ? 'glow' : game.isInstalled ? 'default' : 'secondary'}
            onClick={handlePlay}
            disabled={launching}
            className="w-full h-8 text-xs font-bold gap-1.5 shadow-md rounded-lg"
          >
            {launching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

          <Button
            size="icon-sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDetails(game);
            }}
            className="h-8 w-8 rounded-lg border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white shrink-0"
            title="Details & Account Mapping"
          >
            <Info className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
