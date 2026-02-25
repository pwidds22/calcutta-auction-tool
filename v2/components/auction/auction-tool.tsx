'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AuctionProvider, useAuction } from '@/lib/auction/auction-context';
import { useAutoSave } from '@/lib/auction/use-auto-save';
import { PotSizeSection } from './pot-size-section';
import { PayoutRulesEditor } from './payout-rules-editor';
import { SummaryStatsCards } from './summary-stats-cards';
import { TeamTable } from './team-table';
import { initializeTeams } from '@/lib/calculations/initialize';
import { Lock } from 'lucide-react';
import type { SavedTeamData, PayoutRules, TournamentConfig, BaseTeam } from '@/lib/calculations/types';

interface AuctionToolInnerProps {
  initialTeams: SavedTeamData[];
  initialPayoutRules: PayoutRules;
  initialPotSize: number;
  userEmail: string;
  config: TournamentConfig;
  baseTeams: BaseTeam[];
  hasPaid: boolean;
}

function AuctionToolInner({
  initialTeams,
  initialPayoutRules,
  initialPotSize,
  userEmail,
  config,
  baseTeams,
  hasPaid,
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
      {/* Upgrade banner for unpaid users */}
      {!hasPaid && (
        <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/20 p-2">
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  You&apos;re viewing a preview
                </p>
                <p className="text-xs text-white/50">
                  Unlock all {state.teams.length || 64} teams with fair values, bid recommendations, and profit projections.
                </p>
              </div>
            </div>
            <Link
              href="/payment"
              className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              Unlock — $29.99
            </Link>
          </div>
        </div>
      )}

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
    <AuctionProvider hasPaid={props.hasPaid}>
      <AuctionToolInner {...props} />
    </AuctionProvider>
  );
}
