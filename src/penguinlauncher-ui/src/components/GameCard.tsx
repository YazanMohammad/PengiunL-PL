import React, { useState } from 'react';
import { Play, Info, User, Zap, Download, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, onDetails, onSelect, density, accounts }) => {
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

  const owningAccounts = accounts.filter(a =>
    game.associatedAccountIds.some(aid => aid.toLowerCase() === a.id.toLowerCase()) ||
    (game.associatedAccountIds.length === 0 && game.platform === a.platform)
  );
  const singleOwner = owningAccounts.length === 1 ? owningAccounts[0] : null;
  const isMismatch = singleOwner && !singleOwner.isActive;
  const platformInfo = PLATFORM_BADGES[game.platform];

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open details for ${game.name}`}
        onClick={() => onSelect(game)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(game);
          }
        }}
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="relative overflow-hidden bg-secondary" style={{ aspectRatio: density === 'compact' ? '3/4' : '4/5' }}>
          {game.coverImageUrl && !imgError ? (
            <img src={game.coverImageUrl} alt={game.name} className="h-full w-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-4xl font-medium text-muted-foreground" aria-hidden="true">
              {game.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <Badge variant={platformInfo.variant} className="absolute left-3 top-3 text-[10px]">{platformInfo.label}</Badge>
        </div>
        <div className="px-4 pt-4 pb-3">
          <h3 className="truncate text-sm font-medium text-foreground" title={game.name}>{game.name}</h3>
          <p className={`mt-1.5 flex min-h-4 items-center gap-1.5 text-[11px] ${isMismatch ? 'text-amber-300' : 'text-muted-foreground'}`} title={owningAccounts.map(a => a.displayName).join(', ')}>
            {owningAccounts.length > 1 ? <Users className="h-3 w-3 shrink-0" /> : isMismatch ? <Zap className="h-3 w-3 shrink-0" /> : <User className="h-3 w-3 shrink-0" />}
            <span className="truncate">
              {owningAccounts.length > 1 ? `Shared: ${owningAccounts.map(a => a.displayName).join(', ')}` : isMismatch ? `Swaps to ${singleOwner?.displayName}` : singleOwner ? `${singleOwner.displayName} · Active session` : game.isInstalled ? 'Installed' : 'Ready to install'}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
        <Button size="sm" variant={game.isInstalled ? 'default' : 'secondary'} onClick={handlePlay} disabled={launching} className="flex-1 gap-1.5">
          {launching ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : isMismatch ? <Zap className="h-3 w-3" /> : game.isInstalled ? <Play className="h-3 w-3" /> : <Download className="h-3 w-3" />}
          <span>{launching ? (game.isInstalled ? 'Launching' : 'Preparing') : isMismatch ? (game.isInstalled ? 'Switch & Play' : 'Switch & Install') : game.isInstalled ? 'Play' : 'Install'}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onDetails(game); }} className="gap-1.5">
          <Info className="h-3 w-3" />
          Details
        </Button>
      </div>
    </article>
  );
};
