'use client';

import { memo, useCallback } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, formatPercent } from '@/lib/calculations/format';
import { calculateRoundProfits } from '@/lib/calculations/profits';
import type { Team, PayoutRules, RoundKey } from '@/lib/calculations/types';
import { ROUND_KEYS } from '@/lib/calculations/types';

interface TeamTableRowProps {
  team: Team;
  payoutRules: PayoutRules;
  potSize: number;
  onPriceChange: (teamId: number, price: number) => void;
  onMyTeamToggle: (teamId: number, isMyTeam: boolean) => void;
}

function ProfitCell({
  profit,
  odds,
  roundValue,
}: {
  profit: number;
  odds: number;
  roundValue: number;
}) {
  return (
    <TableCell className="px-2 py-1.5 text-center">
      <div
        className={`text-xs font-medium tabular-nums ${
          profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-red-400' : ''
        }`}
      >
        {formatCurrency(profit)}
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums">
        {formatPercent(odds)} ({formatPercent(roundValue)})
      </div>
    </TableCell>
  );
}

export const TeamTableRow = memo(function TeamTableRow({
  team,
  payoutRules,
  potSize,
  onPriceChange,
  onMyTeamToggle,
}: TeamTableRowProps) {
  const profits = calculateRoundProfits(team.purchasePrice, payoutRules, potSize);

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPriceChange(team.id, parseFloat(e.target.value) || 0);
    },
    [team.id, onPriceChange]
  );

  const handleMyTeamToggle = useCallback(
    (checked: boolean | 'indeterminate') => {
      onMyTeamToggle(team.id, checked === true);
    },
    [team.id, onMyTeamToggle]
  );

  return (
    <TableRow className={team.isMyTeam ? 'bg-emerald-500/10' : undefined}>
      <TableCell className="px-2 py-1.5 text-xs">{team.seed}</TableCell>
      <TableCell className="px-2 py-1.5 text-xs font-medium whitespace-nowrap">
        {team.name}
      </TableCell>
      <TableCell className="px-2 py-1.5 text-xs">{team.region}</TableCell>

      {ROUND_KEYS.map((round: RoundKey) => (
        <ProfitCell
          key={round}
          profit={profits[round]}
          odds={team.odds[round]}
          roundValue={team.roundValues[round]}
        />
      ))}

      <TableCell className="px-2 py-1.5 text-right text-xs font-medium tabular-nums text-emerald-400">
        {formatCurrency(team.fairValue * 0.95)}
      </TableCell>
      <TableCell className="px-2 py-1.5 text-right text-xs font-medium tabular-nums">
        {formatCurrency(team.fairValue)}
      </TableCell>
      <TableCell className="px-2 py-1.5">
        <Input
          type="number"
          min={0}
          step={1}
          value={team.purchasePrice || ''}
          onChange={handlePriceChange}
          placeholder="0"
          className="h-7 w-20 text-right text-xs tabular-nums"
        />
      </TableCell>
      <TableCell className="px-2 py-1.5 text-center">
        <Checkbox
          checked={team.isMyTeam}
          onCheckedChange={handleMyTeamToggle}
          disabled={team.purchasePrice === 0}
        />
      </TableCell>
    </TableRow>
  );
});
