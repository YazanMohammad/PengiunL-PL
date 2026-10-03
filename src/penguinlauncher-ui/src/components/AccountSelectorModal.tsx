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
import { ShieldAlert, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import type { ConflictInfo, Account } from '../types';

interface AccountSelectorModalProps {
  conflict: ConflictInfo | null;
  onSelect: (account: Account) => void;
  onCancel: () => void;
}

export const AccountSelectorModal: React.FC<AccountSelectorModalProps> = ({
  conflict,
  onSelect,
  onCancel,
}) => {
  if (!conflict) return null;

  return (
    <Dialog open={!!conflict} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-lg border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Account Conflict Resolution
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Multiple launcher profiles own <span className="font-semibold text-white">{conflict.gameName}</span>.
            Select the profile you want to authenticate for this session.
          </DialogDescription>
        </DialogHeader>

        {/* Account Selection Cards */}
        <div className="space-y-2.5 my-3">
          {conflict.availableAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => onSelect(account)}
              className="group relative flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-violet-500/40 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Initial */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/10 shrink-0">
                  {account.displayName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                      {account.displayName}
                    </p>
                    {account.isActive && (
                      <Badge variant="active" className="text-[10px] px-1.5 py-0 h-4">
                        <CheckCircle className="w-2.5 h-2.5 mr-1" />
                        Currently Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {account.platform} · {account.platformUserId}
                  </p>
                </div>
              </div>

              {/* Action */}
              <Button
                size="sm"
                variant={account.isActive ? 'default' : 'glow'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(account);
                }}
                className="h-8 text-xs font-semibold gap-1.5 rounded-lg shrink-0"
              >
                <span>{account.isActive ? 'Launch' : 'Switch & Play'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Footer info banner */}
        <div className="rounded-xl p-3 bg-violet-950/20 border border-violet-500/20 text-violet-300 text-xs flex items-center gap-2.5">
          <Zap className="w-4 h-4 shrink-0 text-violet-400" />
          <span>
            TcNo Hot-Swap will terminate the launcher process, update auth tokens & registry, and boot the session seamlessly.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
