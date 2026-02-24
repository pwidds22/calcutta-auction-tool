'use client';

import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam } from '@/lib/tournaments/types';
import { Wallet } from 'lucide-react';

interface MyPortfolioProps {
  soldTeams: SoldTeam[];
  baseTeams: BaseTeam[];
  userId: string;
}

export function MyPortfolio({ soldTeams, baseTeams, userId }: MyPortfolioProps) {
  const myTeams = soldTeams.filter((s) => s.winnerId === userId);
  const totalSpent = myTeams.reduce((sum, t) => sum + t.amount, 0);
  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Wallet className="size-3.5 text-white/40" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            My Teams ({myTeams.length})
          </h3>
        </div>
        {totalSpent > 0 && (
          <span className="text-xs font-medium text-amber-400">
            ${totalSpent.toLocaleString()} spent
          </span>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto">
        {myTeams.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-white/30">
            No teams won yet
          </p>
        ) : (
          <div className="p-2 space-y-0.5">
            {myTeams.map((sold) => {
              const team = teamMap.get(sold.teamId);
              return (
                <div
                  key={sold.teamId}
                  className="flex items-center justify-between rounded-md px-3 py-1.5"
                >
                  <span className="text-sm text-white/70">
                    <span className="text-xs text-white/40 mr-1">
                      ({team?.seed})
                    </span>
                    {team?.name ?? `Team ${sold.teamId}`}
                  </span>
                  <span className="font-mono text-xs font-medium text-emerald-400">
                    ${sold.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
