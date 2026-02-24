import type { Team, RoundKey, Region } from './types';
import {
  R32_MATCHUPS,
  S16_QUADRANTS,
  E8_HALVES,
  LEFT_SIDE_REGIONS,
  RIGHT_SIDE_REGIONS,
} from './types';

/**
 * Convert American odds to implied probability.
 * Positive odds (underdog): 100 / (odds + 100)
 * Negative odds (favorite): |odds| / (|odds| + 100)
 */
export function americanOddsToImpliedProbability(americanOdds: number): number {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  } else {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
  }
}

/**
 * Convert implied probability back to American odds.
 */
export function impliedProbabilityToAmericanOdds(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }
  if (probability < 0.5) {
    return Math.round(100 / probability - 100);
  } else {
    return Math.round((-1 * (probability * 100)) / (1 - probability));
  }
}

/**
 * Devig a group of teams for a specific round.
 * Normalizes raw implied probabilities by dividing by the overround (sum of all probs).
 * Optionally caps at a previous round's devigged probability.
 */
function devigGroup(
  teams: Team[],
  round: RoundKey,
  capRound?: RoundKey
): void {
  const overround = teams.reduce(
    (sum, t) => sum + t.rawImpliedProbabilities[round],
    0
  );
  if (overround === 0) return;

  for (const team of teams) {
    team.odds[round] = team.rawImpliedProbabilities[round] / overround;
    if (capRound) {
      team.odds[round] = Math.min(team.odds[round], team.odds[capRound]);
    }
  }
}

/**
 * Structure-aware devigging for the entire NCAA tournament bracket.
 *
 * Each round is devigged within the appropriate grouping:
 * - R32: by matchup pair (2 teams) per region
 * - S16: by quadrant (4 teams) per region
 * - E8: by half (8 teams) per region
 * - F4: by region (16 teams)
 * - F2: by bracket side (32 teams — East+West vs South+Midwest)
 * - Championship: globally (all 64 teams)
 *
 * Each round is capped so a team's probability can't exceed the prior round.
 */
export function devigRoundOdds(teams: Team[]): void {
  const regions: Region[] = ['East', 'West', 'South', 'Midwest'];

  // Process each region
  for (const region of regions) {
    const regionTeams = teams.filter((t) => t.region === region);

    // R32: devig by matchup pairs
    for (const [seedA, seedB] of R32_MATCHUPS) {
      const matchup = regionTeams.filter(
        (t) => t.seed === seedA || t.seed === seedB
      );
      if (matchup.length >= 2) {
        devigGroup(matchup, 'r32');
      }
    }

    // S16: devig by quadrants, cap at R32
    for (const quadrantSeeds of S16_QUADRANTS) {
      const quadrant = regionTeams.filter((t) =>
        quadrantSeeds.includes(t.seed)
      );
      devigGroup(quadrant, 's16', 'r32');
    }

    // E8: devig by halves, cap at S16
    for (const halfSeeds of E8_HALVES) {
      const half = regionTeams.filter((t) => halfSeeds.includes(t.seed));
      devigGroup(half, 'e8', 's16');
    }

    // F4: devig by full region, cap at E8
    devigGroup(regionTeams, 'f4', 'e8');
  }

  // F2: devig by bracket side, cap at F4
  const leftSide = teams.filter((t) =>
    LEFT_SIDE_REGIONS.includes(t.region)
  );
  const rightSide = teams.filter((t) =>
    RIGHT_SIDE_REGIONS.includes(t.region)
  );
  devigGroup(leftSide, 'f2', 'f4');
  devigGroup(rightSide, 'f2', 'f4');

  // Championship: devig globally, cap at F2
  devigGroup(teams, 'champ', 'f2');
}

/**
 * Calculate implied probabilities for all teams.
 * 1. Converts American odds → raw implied probabilities (includes vig)
 * 2. Devigs by tournament structure → fair probabilities
 *
 * Mutates teams in place and returns them.
 */
export function calculateImpliedProbabilities(teams: Team[]): Team[] {
  for (const team of teams) {
    // Default odds if missing
    const ao = team.americanOdds ?? {
      r32: -1000,
      s16: +150,
      e8: +300,
      f4: +600,
      f2: +1200,
      champ: +2500,
    };

    team.rawImpliedProbabilities = {
      r32: americanOddsToImpliedProbability(ao.r32),
      s16: americanOddsToImpliedProbability(ao.s16),
      e8: americanOddsToImpliedProbability(ao.e8),
      f4: americanOddsToImpliedProbability(ao.f4),
      f2: americanOddsToImpliedProbability(ao.f2),
      champ: americanOddsToImpliedProbability(ao.champ),
    };

    team.odds = { r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0 };
  }

  devigRoundOdds(teams);

  return teams;
}
