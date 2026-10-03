import React from 'react';
import { Play, Info, Sparkles, Download, Users, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Game, Platform, Account } from '../types';

interface HeroSpotlightProps {
  game: Game | null;
  onPlay: (game: Game) => void;
  onDetails: (game: Game) => void;
  launching: boolean;
  accounts?: Account[];
}

const PLATFORM_BADGE_VARIANTS: Record<Platform, 'steam' | 'riot' | 'epic' | 'ea' | 'linux'> = {
  Steam: 'steam',
  Riot: 'riot',
  Epic: 'epic',
  EA: 'ea',
  LinuxNative: 'linux',
};

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  game,
  onPlay,
  onDetails,
  launching,
  accounts = [],
}) => {
  if (!game) return null;

  const owningAccounts = accounts.filter((a) =>
    game.associatedAccountIds.includes(a.id)
  );

  const bgImage = game.backgroundImageUrl || game.coverImageUrl;

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 group">
      {/* Background Artwork */}
      {bgImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={bgImage}
            alt={game.name}
            className="w-full h-full object-cover object-center opacity-30 blur-[2px] scale-105 transition-transform duration-700 group-hover:scale-100"
          />
        </div>
      )}

      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={PLATFORM_BADGE_VARIANTS[game.platform]} className="uppercase tracking-wider">
              {game.platform}
            </Badge>
            <Badge variant="outline" className="gap-1 border-white/10 text-muted-foreground text-[11px]">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Spotlight Title
            </Badge>
            {!game.isInstalled && (
              <Badge variant="outline" className="gap-1 border-sky-500/40 text-sky-300 bg-sky-950/40 text-[11px]">
                <Download className="w-3 h-3 text-sky-400" />
                Ready to Install
              </Badge>
            )}
            {owningAccounts.length > 1 ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-200 text-xs font-semibold backdrop-blur-md shadow-lg shadow-violet-950/50"
                title={`Multi-Account Game: Owned by ${owningAccounts.map((a) => a.displayName).join(', ')}`}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  {owningAccounts.slice(0, 4).map((acc, idx) => (
                    <span
                      key={acc.id}
                      className={`w-4 h-4 rounded-full border border-black text-[9px] font-black flex items-center justify-center shrink-0 ${
                        acc.isActive
                          ? 'bg-emerald-500 text-white'
                          : idx % 2 === 0
                          ? 'bg-violet-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}
                      title={`${acc.displayName} (${acc.isActive ? 'Active Session' : 'Standby Profile'})`}
                    >
                      {acc.displayName.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </div>
                <span>Owned across {owningAccounts.length} Accounts</span>
              </div>
            ) : owningAccounts.length === 1 ? (
              <Badge
                variant={owningAccounts[0].isActive ? 'active' : 'outline'}
                className="gap-1 border-white/10 text-[11px]"
              >
                <User className="w-3 h-3" />
                {owningAccounts[0].displayName}
              </Badge>
            ) : game.associatedAccountIds.length > 1 ? (
              <Badge variant="secondary" className="gap-1 text-[11px] bg-violet-950/60 border-violet-500/30 text-violet-200">
                <Users className="w-3 h-3 text-violet-400" />
                {game.associatedAccountIds.length} Accounts Owned
              </Badge>
            ) : null}
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            {game.name}
          </h2>

          <p className="text-xs md:text-sm text-zinc-300/80 line-clamp-2 max-w-xl font-mono">
            {game.installPath || (game.isInstalled ? 'Installed Local Title' : `Owned Title - Ready to Install via ${game.platform}`)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="glow"
            size="lg"
            onClick={() => onPlay(game)}
            disabled={launching}
            className="gap-2.5 font-bold shadow-xl flex-1 md:flex-none text-sm h-11 px-6 rounded-xl"
          >
            {launching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{game.isInstalled ? 'Launching...' : 'Preparing Install...'}</span>
              </>
            ) : game.isInstalled ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Session</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-sky-300" />
                <span>Install Title</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => onDetails(game)}
            className="gap-2 rounded-xl text-xs h-11 px-4 border-white/10 hover:bg-white/10 text-zinc-300"
          >
            <Info className="w-4 h-4" />
            <span>Details</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
