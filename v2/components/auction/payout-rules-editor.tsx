'use client';

import { useState } from 'react';
import { useAuction } from '@/lib/auction/auction-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TEAMS_PER_ROUND } from '@/lib/calculations/types';
import type { PayoutRules } from '@/lib/calculations/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ROUND_RULES: { key: keyof PayoutRules; label: string; teams: number }[] = [
  { key: 'roundOf64', label: 'Round of 32', teams: TEAMS_PER_ROUND.r32 },
  { key: 'roundOf32', label: 'Sweet 16', teams: TEAMS_PER_ROUND.s16 },
  { key: 'sweet16', label: 'Elite 8', teams: TEAMS_PER_ROUND.e8 },
  { key: 'elite8', label: 'Final Four', teams: TEAMS_PER_ROUND.f4 },
  { key: 'finalFour', label: 'Championship', teams: TEAMS_PER_ROUND.f2 },
  { key: 'champion', label: 'Winner', teams: TEAMS_PER_ROUND.champ },
];

const PROP_RULES: { key: keyof PayoutRules; label: string }[] = [
  { key: 'biggestUpset', label: 'Biggest Upset' },
  { key: 'highestSeed', label: 'Highest Seed' },
  { key: 'largestMargin', label: 'Largest Margin' },
  { key: 'customProp', label: 'Custom Prop' },
];

export function PayoutRulesEditor() {
  const { state, dispatch } = useAuction();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<PayoutRules>(state.payoutRules);

  const totalPercent = ROUND_RULES.reduce(
    (sum, r) => sum + (draft[r.key] as number) * r.teams,
    0
  ) + PROP_RULES.reduce((sum, r) => sum + (draft[r.key] as number), 0);

  const handleChange = (key: keyof PayoutRules, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleApply = () => {
    dispatch({ type: 'UPDATE_PAYOUT_RULES', payoutRules: draft });
  };

  // Sync draft when state changes externally
  if (!isOpen && draft !== state.payoutRules) {
    // Only sync when collapsed to avoid overwriting user edits
  }

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Payout Rules</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              Math.abs(totalPercent - 100) < 0.01
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {totalPercent.toFixed(1)}%
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            {ROUND_RULES.map((rule) => (
              <div key={rule.key}>
                <Label className="text-xs">{rule.label} ({rule.teams} teams)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={draft[rule.key]}
                    onChange={(e) => handleChange(rule.key, e.target.value)}
                    className="pr-7 text-right text-sm"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Total: {((draft[rule.key] as number) * rule.teams).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            {PROP_RULES.map((rule) => (
              <div key={rule.key}>
                <Label className="text-xs">{rule.label}</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={draft[rule.key]}
                    onChange={(e) => handleChange(rule.key, e.target.value)}
                    className="pr-7 text-right text-sm"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm">
              Total:{' '}
              <span
                className={`font-semibold ${
                  Math.abs(totalPercent - 100) < 0.01
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {totalPercent.toFixed(1)}%
              </span>
            </span>
            <Button size="sm" onClick={handleApply}>
              Apply Rules
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
