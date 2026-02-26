'use client';

import type { BaseTeam } from '@/lib/tournaments/types';
import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import { presentTeam } from '@/actions/bidding';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';

interface TeamQueueProps {
  sessionId: string;
  teamOrder: number[];
  baseTeams: BaseTeam[];
  soldTeams: SoldTeam[];
  currentTeamIdx: number | null;
  auctionStatus: string;
}

export function TeamQueue({
  sessionId,
  teamOrder,
  baseTeams,
  soldTeams,
  currentTeamIdx,
  auctionStatus,
}: TeamQueueProps) {
  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));
  const soldMap = new Map(soldTeams.map((s) => [s.teamId, s]));

  const handleJump = async (idx: number) => {
    if (auctionStatus === 'active') {
      await presentTeam(sessionId, idx);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <List className="size-3.5 text-white/40" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Team Queue ({teamOrder.length})
        </h3>
      </div>
      <div className="max-h-[40vh] lg:max-h-[calc(100vh-16rem)] overflow-y-auto p-1.5">
        {teamOrder.map((teamId, idx) => {
          const team = teamMap.get(teamId);
          const sold = soldMap.get(teamId);
          const isCurrent = idx === currentTeamIdx;

          return (
            <button
              key={teamId}
              onClick={() => handleJump(idx)}
              disabled={auctionStatus !== 'active' || !!sold}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                isCurrent
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : sold
                    ? 'text-white/25'
                    : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-xs text-white/30 w-5 text-right">
                  {idx + 1}
                </span>
                <span className="truncate">
                  ({team?.seed}) {team?.name ?? `Team ${teamId}`}
                </span>
              </span>
              {sold && (
                <span className="ml-2 flex-shrink-0 text-xs font-mono text-white/30">
                  ${sold.amount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
