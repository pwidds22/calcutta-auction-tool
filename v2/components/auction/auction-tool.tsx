'use client';

import { useEffect } from 'react';
import { AuctionProvider, useAuction } from '@/lib/auction/auction-context';
import { useAutoSave } from '@/lib/auction/use-auto-save';
import { PotSizeSection } from './pot-size-section';
import { PayoutRulesEditor } from './payout-rules-editor';
import { SummaryStatsCards } from './summary-stats-cards';
import { TeamTable } from './team-table';
import { initializeTeams } from '@/lib/calculations/initialize';
import { MARCH_MADNESS_2026_TEAMS } from '@/lib/data/march-madness-2026';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { Separator } from '@/components/ui/separator';
import type { SavedTeamData, PayoutRules } from '@/lib/calculations/types';
import { DEFAULT_PAYOUT_RULES } from '@/lib/calculations/types';

interface AuctionToolInnerProps {
  initialTeams: SavedTeamData[];
  initialPayoutRules: PayoutRules;
  initialPotSize: number;
  userEmail: string;
}

function AuctionToolInner({
  initialTeams,
  initialPayoutRules,
  initialPotSize,
  userEmail,
}: AuctionToolInnerProps) {
  const { state, dispatch } = useAuction();
  const { isSaving, lastSaved, error } = useAutoSave();

  // Initialize on mount
  useEffect(() => {
    const teams = initializeTeams(
      MARCH_MADNESS_2026_TEAMS,
      initialTeams,
      initialPayoutRules,
      initialPotSize
    );
    dispatch({
      type: 'SET_INITIAL_DATA',
      teams,
      payoutRules: initialPayoutRules,
      estimatedPotSize: initialPotSize,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading auction data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calcutta Auction Tool</h1>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {isSaving
              ? 'Saving...'
              : lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : ''}
            {error && <span className="text-red-500"> Error: {error}</span>}
          </span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      <Separator />

      {/* Pot size */}
      <PotSizeSection />

      {/* Payout rules */}
      <PayoutRulesEditor />

      {/* Summary stats */}
      <SummaryStatsCards />

      {/* Team table */}
      <TeamTable />
    </div>
  );
}

export function AuctionTool(props: AuctionToolInnerProps) {
  return (
    <AuctionProvider>
      <AuctionToolInner {...props} />
    </AuctionProvider>
  );
}
