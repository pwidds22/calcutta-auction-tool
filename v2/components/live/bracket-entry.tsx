'use client';

import { useState, useCallback, useMemo } from 'react';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { TournamentResult } from '@/actions/tournament-results';
import { bulkUpdateResults } from '@/actions/tournament-results';
import {
  generateFullBracket,
  computeCascadeClears,
  type BracketMatchup,
  type BracketTeamSlot,
  type FullBracket,
} from '@/lib/auction/live/bracket-utils';
import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import { Trophy, ChevronRight, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BracketEntryProps {
  sessionId: string;
  baseTeams: BaseTeam[];
  config: TournamentConfig;
  results: TournamentResult[];
  isCommissioner: boolean;
  soldTeams: SoldTeam[];
  payoutRules: PayoutRules;
}

/* ------------------------------------------------------------------ */
/*  Matchup Card                                                       */
/* ------------------------------------------------------------------ */

function MatchupCard({
  matchup,
  isCommissioner,
  onPickWinner,
  saving,
  soldTeamMap,
}: {
  matchup: BracketMatchup;
  isCommissioner: boolean;
  onPickWinner: (matchup: BracketMatchup, winnerId: number) => void;
  saving: string | null;
  soldTeamMap: Map<number, SoldTeam>;
}) {
  const isSaving = saving === matchup.id;

  return (
    <div className="relative rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {isSaving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <Loader2 className="size-4 animate-spin text-white/60" />
        </div>
      )}
      <TeamSlotRow
        team={matchup.teamA}
        isWinner={matchup.winnerId !== null && matchup.winnerId === matchup.teamA?.teamId}
        isLoser={matchup.winnerId !== null && matchup.winnerId !== matchup.teamA?.teamId && matchup.teamA !== null}
        canClick={isCommissioner && matchup.teamA !== null && !isSaving}
        onClick={() => matchup.teamA && onPickWinner(matchup, matchup.teamA.teamId)}
        soldTeam={matchup.teamA ? soldTeamMap.get(matchup.teamA.teamId) : undefined}
        position="top"
      />
      <div className="border-t border-white/[0.04]" />
      <TeamSlotRow
        team={matchup.teamB}
        isWinner={matchup.winnerId !== null && matchup.winnerId === matchup.teamB?.teamId}
        isLoser={matchup.winnerId !== null && matchup.winnerId !== matchup.teamB?.teamId && matchup.teamB !== null}
        canClick={isCommissioner && matchup.teamB !== null && !isSaving}
        onClick={() => matchup.teamB && onPickWinner(matchup, matchup.teamB.teamId)}
        soldTeam={matchup.teamB ? soldTeamMap.get(matchup.teamB.teamId) : undefined}
        position="bottom"
      />
    </div>
  );
}

function TeamSlotRow({
  team,
  isWinner,
  isLoser,
  canClick,
  onClick,
  soldTeam,
  position,
}: {
  team: BracketTeamSlot | null;
  isWinner: boolean;
  isLoser: boolean;
  canClick: boolean;
  onClick: () => void;
  soldTeam?: SoldTeam;
  position: 'top' | 'bottom';
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 min-h-[40px]">
        <span className="text-[10px] text-white/15 w-5 text-right">—</span>
        <span className="text-xs text-white/15 italic">TBD</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canClick}
      className={`flex w-full items-center gap-2 px-3 py-2 min-h-[40px] text-left transition-colors ${
        isWinner
          ? 'bg-emerald-500/10'
          : isLoser
            ? 'bg-red-500/5 opacity-50'
            : ''
      } ${
        canClick
          ? 'hover:bg-white/[0.06] cursor-pointer'
          : 'cursor-default'
      }`}
    >
      <span className={`text-[10px] w-5 text-right flex-shrink-0 ${
        isWinner ? 'text-emerald-400/80' : 'text-white/30'
      }`}>
        ({team.seed})
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${
          isWinner
            ? 'text-emerald-400'
            : isLoser
              ? 'text-white/30 line-through'
              : 'text-white/80'
        }`}>
          {team.name}
        </p>
        {soldTeam && (
          <p className="text-[9px] text-white/20 truncate">
            {soldTeam.winnerName}
          </p>
        )}
      </div>
      {isWinner && (
        <ChevronRight className="size-3 flex-shrink-0 text-emerald-400/60" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Region Bracket View                                                */
/* ------------------------------------------------------------------ */

function RegionBracketView({
  regionBracket,
  regionalRoundKeys,
  config,
  isCommissioner,
  onPickWinner,
  saving,
  soldTeamMap,
}: {
  regionBracket: { region: string; rounds: Record<string, BracketMatchup[]> };
  regionalRoundKeys: string[];
  config: TournamentConfig;
  isCommissioner: boolean;
  onPickWinner: (matchup: BracketMatchup, winnerId: number) => void;
  saving: string | null;
  soldTeamMap: Map<number, SoldTeam>;
}) {
  const roundLabelMap = new Map(config.rounds.map((r) => [r.key, r.label]));

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {regionalRoundKeys.map((roundKey) => {
        const matchups = regionBracket.rounds[roundKey] ?? [];
        return (
          <div key={roundKey} className="flex-shrink-0" style={{ minWidth: 180 }}>
            <div className="mb-2 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {roundLabelMap.get(roundKey) ?? roundKey}
              </span>
            </div>
            <div className="space-y-2 flex flex-col justify-around h-full">
              {matchups.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  isCommissioner={isCommissioner}
                  onPickWinner={onPickWinner}
                  saving={saving}
                  soldTeamMap={soldTeamMap}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cross-Region Bracket View (Final Four + Championship)              */
/* ------------------------------------------------------------------ */

function CrossRegionView({
  crossRegion,
  crossRegionRoundKeys,
  bracket,
  config,
  isCommissioner,
  onPickWinner,
  saving,
  soldTeamMap,
}: {
  crossRegion: Record<string, BracketMatchup[]>;
  crossRegionRoundKeys: string[];
  bracket: FullBracket;
  config: TournamentConfig;
  isCommissioner: boolean;
  onPickWinner: (matchup: BracketMatchup, winnerId: number) => void;
  saving: string | null;
  soldTeamMap: Map<number, SoldTeam>;
}) {
  const roundLabelMap = new Map(config.rounds.map((r) => [r.key, r.label]));

  // Find champion if champ round has a winner
  const champRound = crossRegionRoundKeys[crossRegionRoundKeys.length - 1];
  const champMatchup = crossRegion[champRound]?.[0];
  const champTeam = champMatchup?.winnerId
    ? (champMatchup.teamA?.teamId === champMatchup.winnerId ? champMatchup.teamA : champMatchup.teamB)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
        {crossRegionRoundKeys.map((roundKey) => {
          const matchups = crossRegion[roundKey] ?? [];
          if (matchups.length === 0) return null;
          return (
            <div key={roundKey} className="flex-shrink-0" style={{ minWidth: 200 }}>
              <div className="mb-2 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {roundLabelMap.get(roundKey) ?? roundKey}
                </span>
              </div>
              <div className="space-y-2 flex flex-col justify-around">
                {matchups.map((matchup) => (
                  <MatchupCard
                    key={matchup.id}
                    matchup={matchup}
                    isCommissioner={isCommissioner}
                    onPickWinner={onPickWinner}
                    saving={saving}
                    soldTeamMap={soldTeamMap}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Champion display */}
      {champTeam && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <Trophy className="mx-auto mb-2 size-8 text-amber-400" />
          <p className="text-lg font-bold text-white">{champTeam.name}</p>
          <p className="text-sm text-amber-400/80">
            ({champTeam.seed}) seed · Champion
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Bracket Entry Component                                       */
/* ------------------------------------------------------------------ */

type BracketTab = string; // region name or 'final_four'

export function BracketEntry({
  sessionId,
  baseTeams,
  config,
  results,
  isCommissioner,
  soldTeams,
  payoutRules,
}: BracketEntryProps) {
  const bracket = useMemo(
    () => generateFullBracket(config, baseTeams, results),
    [config, baseTeams, results]
  );

  const [activeTab, setActiveTab] = useState<BracketTab>(
    bracket.regions[0]?.region ?? 'final_four'
  );
  const [saving, setSaving] = useState<string | null>(null);

  const soldTeamMap = useMemo(
    () => new Map(soldTeams.map((t) => [t.teamId, t])),
    [soldTeams]
  );

  const handlePickWinner = useCallback(
    async (matchup: BracketMatchup, winnerId: number) => {
      if (!isCommissioner) return;

      // Determine if this is a change (existing winner → different winner)
      const oldWinnerId = matchup.winnerId;
      const loserId =
        matchup.teamA?.teamId === winnerId
          ? matchup.teamB?.teamId
          : matchup.teamA?.teamId;

      // If clicking the same team that already won, undo it (set both to pending)
      if (oldWinnerId === winnerId) {
        setSaving(matchup.id);
        const updates: Array<{ teamId: number; roundKey: string; result: 'won' | 'lost' | 'pending' }> = [
          { teamId: winnerId, roundKey: matchup.roundKey, result: 'pending' },
        ];
        if (loserId) {
          updates.push({ teamId: loserId, roundKey: matchup.roundKey, result: 'pending' });
        }
        // Also cascade-clear any downstream results for the old winner
        const cascadeClears = computeCascadeClears(oldWinnerId, bracket, matchup.roundKey, results);
        for (const c of cascadeClears) {
          updates.push({ teamId: c.team_id, roundKey: c.round_key, result: 'pending' });
        }
        await bulkUpdateResults(sessionId, updates);
        setSaving(null);
        return;
      }

      setSaving(matchup.id);

      // Build bulk update: winner won, loser lost
      const updates: Array<{ teamId: number; roundKey: string; result: 'won' | 'lost' | 'pending' }> = [
        { teamId: winnerId, roundKey: matchup.roundKey, result: 'won' },
      ];
      if (loserId) {
        updates.push({ teamId: loserId, roundKey: matchup.roundKey, result: 'lost' });
      }

      // If changing a result, cascade-clear downstream results for old winner
      if (oldWinnerId && oldWinnerId !== winnerId) {
        const cascadeClears = computeCascadeClears(oldWinnerId, bracket, matchup.roundKey, results);
        for (const c of cascadeClears) {
          updates.push({ teamId: c.team_id, roundKey: c.round_key, result: 'pending' });
        }
        // Also clear any downstream loser results (old loser might have been used somewhere)
        if (loserId) {
          const loserCascade = computeCascadeClears(loserId, bracket, matchup.roundKey, results);
          for (const c of loserCascade) {
            updates.push({ teamId: c.team_id, roundKey: c.round_key, result: 'pending' });
          }
        }
      }

      await bulkUpdateResults(sessionId, updates);
      setSaving(null);
    },
    [sessionId, isCommissioner, bracket, results]
  );

  // Count wins per region for progress indication
  const getRegionProgress = (region: string) => {
    const regionBracket = bracket.regions.find((r) => r.region === region);
    if (!regionBracket) return { completed: 0, total: 0 };
    const firstRound = bracket.regionalRoundKeys[0];
    const totalMatchups = regionBracket.rounds[firstRound]?.length ?? 0;
    const lastRound = bracket.regionalRoundKeys[bracket.regionalRoundKeys.length - 1];
    const lastMatchup = regionBracket.rounds[lastRound]?.[0];
    const isComplete = lastMatchup?.winnerId !== null;

    let totalDecided = 0;
    let totalGames = 0;
    for (const rk of bracket.regionalRoundKeys) {
      const matchups = regionBracket.rounds[rk] ?? [];
      totalGames += matchups.length;
      totalDecided += matchups.filter((m) => m.winnerId !== null).length;
    }

    return { completed: totalDecided, total: totalGames, isComplete };
  };

  const getCrossRegionProgress = () => {
    let totalDecided = 0;
    let totalGames = 0;
    for (const rk of bracket.crossRegionRoundKeys) {
      const matchups = bracket.crossRegion[rk] ?? [];
      totalGames += matchups.length;
      totalDecided += matchups.filter((m) => m.winnerId !== null).length;
    }
    return { completed: totalDecided, total: totalGames };
  };

  // Build tabs: one per region + Final Four
  const tabs: Array<{ key: BracketTab; label: string; progress: { completed: number; total: number } }> = [
    ...bracket.regions.map((rb) => ({
      key: rb.region,
      label: rb.region,
      progress: getRegionProgress(rb.region),
    })),
  ];

  if (bracket.crossRegionRoundKeys.length > 0) {
    tabs.push({
      key: 'final_four',
      label: 'Final Four',
      progress: getCrossRegionProgress(),
    });
  }

  const activeRegionBracket = bracket.regions.find((r) => r.region === activeTab);

  return (
    <div className="space-y-4">
      {/* Region tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const pct = tab.progress.total > 0
            ? Math.round((tab.progress.completed / tab.progress.total) * 100)
            : 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                  : pct === 100
                    ? 'bg-emerald-500/5 text-emerald-400/60 hover:bg-emerald-500/10'
                    : pct > 0
                      ? 'bg-amber-500/5 text-amber-400/60 hover:bg-amber-500/10'
                      : 'bg-white/[0.02] text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
              {tab.progress.total > 0 && (
                <span className="text-[9px] opacity-60">
                  {tab.progress.completed}/{tab.progress.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bracket content */}
      {activeTab === 'final_four' ? (
        <CrossRegionView
          crossRegion={bracket.crossRegion}
          crossRegionRoundKeys={bracket.crossRegionRoundKeys}
          bracket={bracket}
          config={config}
          isCommissioner={isCommissioner}
          onPickWinner={handlePickWinner}
          saving={saving}
          soldTeamMap={soldTeamMap}
        />
      ) : activeRegionBracket ? (
        <RegionBracketView
          regionBracket={activeRegionBracket}
          regionalRoundKeys={bracket.regionalRoundKeys}
          config={config}
          isCommissioner={isCommissioner}
          onPickWinner={handlePickWinner}
          saving={saving}
          soldTeamMap={soldTeamMap}
        />
      ) : (
        <div className="py-8 text-center text-sm text-white/30">
          Select a region to view the bracket.
        </div>
      )}

      {/* Instructions */}
      {isCommissioner && (
        <p className="text-[10px] text-white/20 text-center">
          Click a team to mark as winner. Click the winner again to undo. Changes cascade automatically.
        </p>
      )}
    </div>
  );
}
