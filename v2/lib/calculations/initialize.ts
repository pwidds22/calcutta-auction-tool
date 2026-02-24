import type { BaseTeam, Team, SavedTeamData, PayoutRules } from './types';
import { calculateImpliedProbabilities } from './odds';
import { calculateTeamValues } from './values';

/**
 * Initialize teams from base data + optional saved state.
 *
 * 1. Creates full Team objects from BaseTeam data
 * 2. Merges saved purchase prices and ownership flags
 * 3. Calculates implied probabilities (with devigging)
 * 4. Calculates team values based on payout rules and pot size
 */
export function initializeTeams(
  baseTeams: BaseTeam[],
  savedData: SavedTeamData[],
  payoutRules: PayoutRules,
  potSize: number
): Team[] {
  // Build lookup from saved data
  const savedMap = new Map<number, SavedTeamData>();
  for (const saved of savedData) {
    savedMap.set(saved.id, saved);
  }

  // Create full Team objects
  const teams: Team[] = baseTeams.map((base) => {
    const saved = savedMap.get(base.id);
    return {
      ...base,
      rawImpliedProbabilities: { r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0 },
      odds: { r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0 },
      roundValues: { r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0 },
      valuePercentage: 0,
      fairValue: 0,
      purchasePrice: saved?.purchasePrice ?? 0,
      isMyTeam: saved?.isMyTeam ?? false,
    };
  });

  // Calculate devigged probabilities
  calculateImpliedProbabilities(teams);

  // Calculate values
  calculateTeamValues(teams, payoutRules, potSize);

  return teams;
}
