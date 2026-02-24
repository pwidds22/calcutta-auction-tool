import type { Team, PayoutRules, TournamentConfig } from './types';

/**
 * Calculate team values based on devigged odds and payout rules.
 *
 * For each team:
 *   roundValues[round] = odds[round] * (payoutRule / 100)
 *   valuePercentage = sum of all roundValues
 *   fairValue = valuePercentage * potSize
 *
 * Payout rules are keyed by round key (e.g., 'r32', 's16').
 *
 * Mutates teams in place and returns them.
 */
export function calculateTeamValues(
  teams: Team[],
  payoutRules: PayoutRules,
  potSize: number,
  config: TournamentConfig
): Team[] {
  for (const team of teams) {
    let totalValue = 0;
    const roundValues: Record<string, number> = {};

    for (const round of config.rounds) {
      const payout = (payoutRules[round.key] ?? 0) / 100;
      const value = team.odds[round.key] * payout;
      roundValues[round.key] = value;
      totalValue += value;
    }

    team.roundValues = roundValues;
    team.valuePercentage = totalValue;
    team.fairValue = potSize * totalValue;
  }

  return teams;
}

/**
 * Calculate fair value for a single team.
 */
export function calculateFairValue(
  valuePercentage: number,
  potSize: number
): number {
  return valuePercentage * potSize;
}

/**
 * Calculate suggested bid (5% below fair value to ensure buyer profit).
 */
export function calculateSuggestedBid(
  valuePercentage: number,
  potSize: number
): number {
  return valuePercentage * potSize * 0.95;
}
