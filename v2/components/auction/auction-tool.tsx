'use client';

import { useEffect } from 'react';
import { AuctionProvider, useAuction } from '@/lib/auction/auction-context';
import { useAutoSave } from '@/lib/auction/use-auto-save';
import { PotSizeSection } from './pot-size-section';
import { PayoutRulesEditor } from './payout-rules-editor';
import { SummaryStatsCards } from './summary-stats-cards';
import { TeamTable } from './team-table';
import { initializeTeams } from '@/lib/calculations/initialize';
import type { SavedTeamData, PayoutRules, TournamentConfig, BaseTeam } from '@/lib/calculations/types';

interface AuctionToolInnerProps {
  initialTeams: SavedTeamData[];
  initialPayoutRules: PayoutRules;
  initialPotSize: number;
  userEmail: string;
  config: TournamentConfig;
  baseTeams: BaseTeam[];
}

function AuctionToolInner({
  initialTeams,
  initialPayoutRules,
  initialPotSize,
  userEmail,
  config,
  baseTeams,
}: AuctionToolInnerProps) {
  const { state, dispatch } = useAuction();
  const { isSaving, lastSaved, error } = useAutoSave();

  // Initialize on mount
  useEffect(() => {
    const teams = initializeTeams(
      baseTeams,
      initialTeams,
      initialPayoutRules,
      initialPotSize,
      config
    );
    dispatch({
      type: 'SET_INITIAL_DATA',
      teams,
      payoutRules: initialPayoutRules,
      estimatedPotSize: initialPotSize,
      config,
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
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{userEmail}</p>
        <span className="text-xs text-white/30">
          {isSaving
            ? 'Saving...'
            : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString()}`
              : ''}
          {error && <span className="text-red-400"> Error: {error}</span>}
        </span>
      </div>

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
