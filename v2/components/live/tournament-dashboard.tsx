'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { TournamentResult } from '@/actions/tournament-results';
import { AuctionComplete } from './auction-complete';
import { ResultsEntry } from './results-entry';
import { Leaderboard } from './leaderboard';
import { SettlementMatrix } from './settlement-matrix';
import { ClipboardList, Trophy, BarChart3, Calculator, DollarSign } from 'lucide-react';

interface TournamentDashboardProps {
  sessionId: string;
  soldTeams: SoldTeam[];
  baseTeams: BaseTeam[];
  sessionName: string;
  isCommissioner: boolean;
  config: TournamentConfig;
  payoutRules: PayoutRules;
  initialResults: TournamentResult[];
}

type TabKey = 'summary' | 'results' | 'leaderboard' | 'settlement';

export function TournamentDashboard({
  sessionId,
  soldTeams,
  baseTeams,
  sessionName,
  isCommissioner,
  config,
  payoutRules,
  initialResults,
}: TournamentDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialResults.length > 0 ? 'leaderboard' : 'summary'
  );
  const [results, setResults] = useState<TournamentResult[]>(initialResults);

  // Listen for real-time result updates from broadcast
  const handleResultUpdate = useCallback(
    (data: { teamId: number; roundKey: string; result: string }) => {
      setResults((prev) => {
        const idx = prev.findIndex(
          (r) => r.team_id === data.teamId && r.round_key === data.roundKey
        );
        const updated: TournamentResult = {
          team_id: data.teamId,
          round_key: data.roundKey,
          result: data.result as TournamentResult['result'],
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    },
    []
  );

  const handleBulkUpdate = useCallback(
    (data: {
      updates: Array<{ teamId: number; roundKey: string; result: string }>;
    }) => {
      setResults((prev) => {
        const next = [...prev];
        for (const u of data.updates) {
          const idx = next.findIndex(
            (r) => r.team_id === u.teamId && r.round_key === u.roundKey
          );
          const updated: TournamentResult = {
            team_id: u.teamId,
            round_key: u.roundKey,
            result: u.result as TournamentResult['result'],
          };
          if (idx >= 0) {
            next[idx] = updated;
          } else {
            next.push(updated);
          }
        }
        return next;
      });
    },
    []
  );

  // Expose handlers for parent to wire up broadcast events
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__tournamentResultUpdate = handleResultUpdate;
    (window as unknown as Record<string, unknown>).__tournamentBulkUpdate = handleBulkUpdate;
    return () => {
      delete (window as unknown as Record<string, unknown>).__tournamentResultUpdate;
      delete (window as unknown as Record<string, unknown>).__tournamentBulkUpdate;
    };
  }, [handleResultUpdate, handleBulkUpdate]);

  const tabs: Array<{ key: TabKey; label: string; icon: typeof Trophy; commissionerOnly?: boolean }> = [
    { key: 'summary', label: 'Auction Summary', icon: ClipboardList },
    ...(isCommissioner
      ? [{ key: 'results' as TabKey, label: 'Enter Results', icon: Calculator, commissionerOnly: true }]
      : []),
    { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { key: 'settlement', label: 'Settlement', icon: DollarSign },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <AuctionComplete
          soldTeams={soldTeams}
          baseTeams={baseTeams}
          sessionName={sessionName}
          isCommissioner={isCommissioner}
          config={config}
          payoutRules={payoutRules}
        />
      )}

      {activeTab === 'results' && isCommissioner && (
        <ResultsEntry
          sessionId={sessionId}
          soldTeams={soldTeams}
          baseTeams={baseTeams}
          config={config}
          payoutRules={payoutRules}
          results={results}
          isCommissioner={isCommissioner}
        />
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard
          soldTeams={soldTeams}
          baseTeams={baseTeams}
          config={config}
          payoutRules={payoutRules}
          results={results}
        />
      )}

      {activeTab === 'settlement' && (
        <SettlementMatrix
          soldTeams={soldTeams}
          baseTeams={baseTeams}
          config={config}
          payoutRules={payoutRules}
          results={results}
        />
      )}
    </div>
  );
}
