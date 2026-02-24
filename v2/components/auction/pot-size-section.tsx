'use client';

import { useAuction } from '@/lib/auction/auction-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/calculations/format';

export function PotSizeSection() {
  const { state, dispatch, effectivePotSize } = useAuction();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="estimatedPotSize">Estimated Pot Size</Label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="estimatedPotSize"
            type="number"
            min={0}
            step={100}
            value={state.estimatedPotSize}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_ESTIMATED_POT_SIZE',
                potSize: parseFloat(e.target.value) || 0,
              })
            }
            className="pl-7 text-right"
          />
        </div>
      </div>
      <div>
        <Label>Projected Pot (from purchases)</Label>
        <div className="mt-1 flex h-9 items-center rounded-md border bg-muted px-3 text-right text-sm font-medium tabular-nums">
          {state.projectedPotSize > 0
            ? formatCurrency(state.projectedPotSize)
            : '—'}
        </div>
      </div>
      <div>
        <Label>Effective Pot Size</Label>
        <div className="mt-1 flex h-9 items-center rounded-md border bg-muted px-3 text-right text-sm font-semibold tabular-nums">
          {formatCurrency(effectivePotSize)}
        </div>
      </div>
    </div>
  );
}
