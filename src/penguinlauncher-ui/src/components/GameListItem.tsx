import React, { useState } from 'react';
import { Play, Info, User, Zap, Download, Users, CheckCircle2 } from 'lucide-react';
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

export const GameListItem: React.FC<GameListItemProps> = ({ game, onPlay, onDetails, onSelect, isSelected, accounts }) => {
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
    <article className={`flex flex-wrap items-center gap-4 rounded-lg border bg-card p-3 ${isSelected ? 'border-primary/50' : 'border-border'}`}>
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
        className="flex min-w-0 flex-1 basis-56 cursor-pointer items-center gap-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
          {game.coverImageUrl && !imgError ? (
            <img src={game.coverImageUrl} alt={game.name} className="h-full w-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-medium text-muted-foreground" aria-hidden="true">{game.name.substring(0, 2).toUpperCase()}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-foreground" title={game.name}>{game.name}</h4>
          <p className="mt-1 truncate text-[11px] text-muted-foreground" title={game.installPath}>
            {game.installPath || (game.isInstalled ? 'Installed Title' : `Ready to install via ${platformInfo.label} (AppID: ${game.platformGameId})`)}
          </p>
          <Badge variant={platformInfo.variant} className="mt-1.5 text-[10px]">{platformInfo.label}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground lg:w-56">
        {owningAccounts.length > 0 && (
          <span className={`flex min-w-0 items-center gap-1.5 ${isMismatch ? 'text-amber-300' : ''}`} title={owningAccounts.map(a => a.displayName).join(', ')}>
            {owningAccounts.length > 1 ? <Users className="h-3 w-3 shrink-0" /> : isMismatch ? <Zap className="h-3 w-3 shrink-0" /> : <User className="h-3 w-3 shrink-0" />}
            <span className="max-w-36 truncate">{owningAccounts.length > 1 ? `${owningAccounts.length} Accounts` : singleOwner?.displayName}</span>
            {singleOwner && <span>{singleOwner.isActive ? 'Active' : 'Auto-swaps'}</span>}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          {game.isInstalled ? <CheckCircle2 className="h-3 w-3" /> : <Download className="h-3 w-3" />}
          {game.isInstalled ? 'Installed' : 'Ready to Install'}
        </span>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onDetails(game); }} className="gap-1.5">
          <Info className="h-3.5 w-3.5" />Details
        </Button>
        <Button size="sm" variant={game.isInstalled ? 'default' : 'secondary'} onClick={handlePlay} disabled={launching} className="gap-1.5">
          {launching ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : isMismatch ? <Zap className="h-3 w-3" /> : game.isInstalled ? <Play className="h-3 w-3" /> : <Download className="h-3 w-3" />}
          <span>{launching ? (game.isInstalled ? 'Launching' : 'Preparing') : isMismatch ? (game.isInstalled ? 'Switch & Play' : 'Switch & Install') : game.isInstalled ? 'Play' : 'Install'}</span>
        </Button>
      </div>
    </article>
  );
};
