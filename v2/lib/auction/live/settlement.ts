import type { SoldTeam } from './use-auction-channel';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';

export interface TeamSettlement {
  teamId: number;
  teamName: string;
  seed: number;
  group: string;
  purchasePrice: number;
  /** Cumulative payout if the team wins through each round */
  roundPayouts: Record<string, number>;
  /** Profit (payout - price) at each round */
  roundProfits: Record<string, number>;
}

export interface ParticipantSettlement {
  participantId: string;
  participantName: string;
  totalOwed: number;
  teamCount: number;
  teams: TeamSettlement[];
}

export interface SettlementSummary {
  /** Actual pot = sum of all winning bids */
  actualPot: number;
  participants: ParticipantSettlement[];
  roundLabels: Array<{ key: string; label: string }>;
}

/**
 * Calculate settlement data for all participants after an auction completes.
 *
 * Uses the ACTUAL pot (sum of all bids) — not the pre-auction estimate.
 * For each team, computes cumulative round-by-round payouts based on payout rules.
 */
export function calculateSettlement(
  soldTeams: SoldTeam[],
  baseTeams: BaseTeam[],
  config: TournamentConfig,
  payoutRules: PayoutRules
): SettlementSummary {
  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));
  const actualPot = soldTeams.reduce((sum, t) => sum + t.amount, 0);

  // Group sold teams by participant
  const byParticipant = new Map<string, { name: string; teams: SoldTeam[] }>();
  for (const sold of soldTeams) {
    if (!byParticipant.has(sold.winnerId)) {
      byParticipant.set(sold.winnerId, { name: sold.winnerName, teams: [] });
    }
    byParticipant.get(sold.winnerId)!.teams.push(sold);
  }

  const participants: ParticipantSettlement[] = [];

  for (const [participantId, { name, teams }] of byParticipant) {
    const totalOwed = teams.reduce((sum, t) => sum + t.amount, 0);
    const teamSettlements: TeamSettlement[] = [];

    for (const sold of teams) {
      const baseTeam = teamMap.get(sold.teamId);
      const teamName = baseTeam?.name ?? `Team ${sold.teamId}`;
      const seed = baseTeam?.seed ?? 0;
      const group = baseTeam?.group ?? '';

      let cumulative = 0;
      const roundPayouts: Record<string, number> = {};
      const roundProfits: Record<string, number> = {};

      for (const round of config.rounds) {
        const roundPayout = actualPot * ((payoutRules[round.key] ?? 0) / 100);
        cumulative += roundPayout;
        roundPayouts[round.key] = cumulative;
        roundProfits[round.key] = cumulative - sold.amount;
      }

      teamSettlements.push({
        teamId: sold.teamId,
        teamName,
        seed,
        group,
        purchasePrice: sold.amount,
        roundPayouts,
        roundProfits,
      });
    }

    participants.push({
      participantId,
      participantName: name,
      totalOwed,
      teamCount: teams.length,
      teams: teamSettlements.sort((a, b) => a.seed - b.seed),
    });
  }

  // Sort by total owed descending
  participants.sort((a, b) => b.totalOwed - a.totalOwed);

  return {
    actualPot,
    participants,
    roundLabels: config.rounds.map((r) => ({ key: r.key, label: r.label })),
  };
}
