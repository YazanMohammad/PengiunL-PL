import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Folder, Link2, User, Gamepad2, ShieldAlert, Zap, CheckCircle2, Download } from 'lucide-react';
import type { Game, Account } from '../types';

interface GameDetailsModalProps {
  game: Game | null;
  accounts: Account[];
  onClose: () => void;
  onPlay: (game: Game, accountId?: string) => void;
  onMapAccount: (gameId: string, accountId: string) => void;
  launching: boolean;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  accounts,
  onClose,
  onPlay,
  onMapAccount,
  launching,
}) => {
  if (!game) return null;

  const associatedAccounts = accounts.filter((a) =>
    game.associatedAccountIds.includes(a.id)
  );

  return (
    <Dialog open={!!game} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-4">
            {/* Poster Thumbnail */}
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 shadow-lg">
              {game.coverImageUrl ? (
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white/50 text-sm">
                  {game.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  {game.platform}
                </Badge>
                <Badge
                  variant={game.isInstalled ? 'active' : 'outline'}
                  className={`text-[10px] uppercase font-semibold ${!game.isInstalled ? 'border-dashed border-sky-400/40 text-sky-300' : ''}`}
                >
                  {game.isInstalled ? 'Installed' : 'Ready to Install'}
                </Badge>
                {game.platformGameId && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ID: {game.platformGameId}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-white truncate">
                {game.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {game.installPath || (game.isInstalled ? 'Managed by official launcher' : `Ready to install via ${game.platform}`)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Metadata Details */}
        <div className="space-y-3 my-2 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 space-y-2 font-mono">
            <div className="flex items-start gap-2">
              <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-muted-foreground">Installation Path:</span>
                <p className="text-white/90 break-all select-all">{game.installPath || 'N/A'}</p>
              </div>
            </div>

            {game.launchUri && (
              <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-muted-foreground">Launch Protocol:</span>
                  <p className="text-sky-300 break-all select-all">{game.launchUri}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Profile Association */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" />
                Owning User Profiles ({associatedAccounts.length})
              </span>
              {associatedAccounts.length > 1 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Multiple Profiles
                </Badge>
              )}
            </div>

            {associatedAccounts.length === 0 ? (
              <p className="text-muted-foreground italic text-xs">
                No specific user profile recorded. Active launcher session will be used.
              </p>
            ) : (
              <div className="space-y-2">
                {associatedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-violet-950 border border-violet-500/30 text-violet-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {acc.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white truncate text-xs">{acc.displayName}</span>
                          {acc.isActive && (
                            <Badge variant="active" className="text-[9px] px-1 py-0 h-3.5">
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono truncate block">
                          {acc.platformUserId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={acc.isActive ? (game.isInstalled ? 'default' : 'secondary') : 'glow'}
                        onClick={() => onPlay(game, acc.id)}
                        disabled={launching}
                        className="h-7 text-xs font-semibold px-2.5 rounded-lg gap-1"
                      >
                        {acc.isActive ? (
                          game.isInstalled ? (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Launch</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 text-sky-400" />
                              <span>Install</span>
                            </>
                          )
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>{game.isInstalled ? 'Switch & Play' : 'Switch & Install'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => onPlay(game)}
            disabled={launching}
            className="gap-2 font-bold px-5 text-xs h-9 rounded-xl"
          >
            {launching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{game.isInstalled ? 'Launching...' : 'Preparing Install...'}</span>
              </>
            ) : game.isInstalled ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Launch Title</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Auto-Install Title</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
