// Round keys for tournament progression
export type RoundKey = 'r32' | 's16' | 'e8' | 'f4' | 'f2' | 'champ';

export const ROUND_KEYS: RoundKey[] = ['r32', 's16', 'e8', 'f4', 'f2', 'champ'];

// Display labels for rounds
export const ROUND_LABELS: Record<RoundKey, string> = {
  r32: 'R32',
  s16: 'S16',
  e8: 'E8',
  f4: 'F4',
  f2: 'F2',
  champ: 'Champ',
};

// American odds per round (from sportsbook)
export interface AmericanOdds {
  r32: number;
  s16: number;
  e8: number;
  f4: number;
  f2: number;
  champ: number;
}

// Probability per round (0-1 values)
export interface RoundOdds {
  r32: number;
  s16: number;
  e8: number;
  f4: number;
  f2: number;
  champ: number;
}

// Value contribution per round (odds × payout%)
export interface RoundValues {
  r32: number;
  s16: number;
  e8: number;
  f4: number;
  f2: number;
  champ: number;
}

// Profit per round (cumulative payout - purchase price)
export interface RoundProfits {
  r32: number;
  s16: number;
  e8: number;
  f4: number;
  f2: number;
  champ: number;
}

export type Region = 'East' | 'West' | 'South' | 'Midwest';

// Base team data (before calculations)
export interface BaseTeam {
  id: number;
  name: string;
  seed: number;
  region: Region;
  americanOdds: AmericanOdds;
}

// Fully hydrated team with all calculated fields
export interface Team extends BaseTeam {
  rawImpliedProbabilities: RoundOdds;
  odds: RoundOdds; // devigged probabilities
  roundValues: RoundValues;
  valuePercentage: number; // sum of roundValues
  fairValue: number;
  purchasePrice: number;
  isMyTeam: boolean;
}

// Minimal shape saved to Supabase teams jsonb
export interface SavedTeamData {
  id: number;
  purchasePrice: number;
  isMyTeam: boolean;
}

// Payout rules — confusing naming preserved from legacy:
// "roundOf64" = payout for winning R64 (i.e., advancing TO R32)
// "roundOf32" = payout for winning R32 (i.e., advancing TO S16)
// etc.
export interface PayoutRules {
  roundOf64: number; // % per team that makes R32
  roundOf32: number; // % per team that makes S16
  sweet16: number; // % per team that makes E8
  elite8: number; // % per team that makes F4
  finalFour: number; // % per team that makes F2
  champion: number; // % for champion
  biggestUpset: number;
  highestSeed: number;
  largestMargin: number;
  customProp: number;
}

export const DEFAULT_PAYOUT_RULES: PayoutRules = {
  roundOf64: 0.5,
  roundOf32: 1.0,
  sweet16: 2.5,
  elite8: 4.0,
  finalFour: 8.0,
  champion: 16.0,
  biggestUpset: 0.0,
  highestSeed: 0.0,
  largestMargin: 0.0,
  customProp: 0.0,
};

// Maps payout rule keys to their corresponding round keys
// roundOf64 payout → r32 odds (winning R64 = making it to R32)
export const PAYOUT_TO_ROUND: [keyof PayoutRules, RoundKey][] = [
  ['roundOf64', 'r32'],
  ['roundOf32', 's16'],
  ['sweet16', 'e8'],
  ['elite8', 'f4'],
  ['finalFour', 'f2'],
  ['champion', 'champ'],
];

// Number of teams that can win each round's payout
export const TEAMS_PER_ROUND: Record<RoundKey, number> = {
  r32: 32,
  s16: 16,
  e8: 8,
  f4: 4,
  f2: 2,
  champ: 1,
};

// Filter and sort types
export type RegionFilter = 'All' | Region;
export type StatusFilter = 'All' | 'Available' | 'Taken' | 'My Teams';
export type SortOption = 'seed' | 'name' | 'valuePercentage' | 'region';
export type SortDirection = 'asc' | 'desc';

// Bracket sides for F2 devigging
export const LEFT_SIDE_REGIONS: Region[] = ['East', 'West'];
export const RIGHT_SIDE_REGIONS: Region[] = ['South', 'Midwest'];

// R32 matchup pairs (seed pairings)
export const R32_MATCHUPS: [number, number][] = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

// S16 quadrants (groups of 4 seeds)
export const S16_QUADRANTS: number[][] = [
  [1, 16, 8, 9],
  [5, 12, 4, 13],
  [6, 11, 3, 14],
  [7, 10, 2, 15],
];

// E8 halves (groups of 8 seeds)
export const E8_HALVES: number[][] = [
  [1, 16, 8, 9, 5, 12, 4, 13],
  [6, 11, 3, 14, 7, 10, 2, 15],
];
