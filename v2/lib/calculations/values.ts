import type { Team, PayoutRules } from './types';
import { PAYOUT_TO_ROUND } from './types';

/**
 * Calculate team values based on devigged odds and payout rules.
 *
 * For each team:
 *   roundValues[round] = odds[round] * (payoutRule / 100)
 *   valuePercentage = sum of all roundValues
 *   fairValue = valuePercentage * potSize
 *
 * Note: payoutRules.roundOf64 maps to odds.r32 (winning R64 = advancing TO R32).
 *
 * Mutates teams in place and returns them.
 */
export function calculateTeamValues(
  teams: Team[],
  payoutRules: PayoutRules,
  potSize: number
): Team[] {
  for (const team of teams) {
    let totalValue = 0;
    const roundValues = { r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0 };

    for (const [payoutKey, roundKey] of PAYOUT_TO_ROUND) {
      const value = team.odds[roundKey] * ((payoutRules[payoutKey] as number) / 100);
      roundValues[roundKey] = value;
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
