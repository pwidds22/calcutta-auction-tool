import type { BaseTeam, Team, SavedTeamData, PayoutRules, TournamentConfig } from './types';
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
  potSize: number,
  config: TournamentConfig
): Team[] {
  // Build lookup from saved data
  const savedMap = new Map<number, SavedTeamData>();
  for (const saved of savedData) {
    savedMap.set(saved.id, saved);
  }

  // Helper to create an empty Record<RoundKey, number> for this tournament
  const roundKeys = config.rounds.map((r) => r.key);
  const emptyRounds = (): Record<string, number> =>
    Object.fromEntries(roundKeys.map((k) => [k, 0]));

  // Create full Team objects
  const teams: Team[] = baseTeams.map((base) => {
    const saved = savedMap.get(base.id);
    return {
      ...base,
      rawImpliedProbabilities: emptyRounds(),
      odds: emptyRounds(),
      roundValues: emptyRounds(),
      valuePercentage: 0,
      fairValue: 0,
      purchasePrice: saved?.purchasePrice ?? 0,
      isMyTeam: saved?.isMyTeam ?? false,
    };
  });

  // Calculate devigged probabilities
  calculateImpliedProbabilities(teams, config);

  // Calculate values
  calculateTeamValues(teams, payoutRules, potSize, config);

  return teams;
}
