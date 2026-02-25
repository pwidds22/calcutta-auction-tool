'use client';

import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam } from '@/lib/tournaments/types';
import { Trophy } from 'lucide-react';

interface ResultsTableProps {
  soldTeams: SoldTeam[];
  baseTeams: BaseTeam[];
}

export function ResultsTable({ soldTeams, baseTeams }: ResultsTableProps) {
  const totalSpent = soldTeams.reduce((sum, t) => sum + t.amount, 0);
  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Trophy className="size-3.5 text-white/40" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Results ({soldTeams.length})
          </h3>
        </div>
        {totalSpent > 0 && (
          <span className="text-xs font-medium text-emerald-400">
            Pot: ${totalSpent.toLocaleString()}
          </span>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {soldTeams.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-white/30">
            No teams sold yet
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {[...soldTeams].reverse().map((sold, idx) => {
                const team = teamMap.get(sold.teamId);
                return (
                  <tr
                    key={`${sold.teamId}-${idx}`}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-3 py-1.5 text-white/70">
                      <span className="text-white/40 text-xs mr-1.5">
                        ({team?.seed})
                      </span>
                      {team?.name ?? `Team ${sold.teamId}`}
                    </td>
                    <td className="px-3 py-1.5 text-right text-white/50 text-xs">
                      {sold.winnerName}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-medium text-emerald-400">
                      ${sold.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
