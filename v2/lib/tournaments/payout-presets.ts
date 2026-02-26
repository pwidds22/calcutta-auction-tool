import type { PayoutRules } from './types';

export interface PayoutPreset {
  label: string;
  description: string;
  rules: PayoutRules;
}

/**
 * Standard payout presets for March Madness Calcuttas.
 * Per-win percentages — a champion earns cumulative payouts from all rounds.
 *
 * Sources: PrintYourBrackets, CBS Sports, Bet The Process.
 */
export const MARCH_MADNESS_PAYOUT_PRESETS: Record<string, PayoutPreset> = {
  balanced: {
    label: 'Balanced',
    description: 'Equal reward per round — keeps all owners engaged',
    rules: {
      r32: 0.5,
      s16: 1.0,
      e8: 2.5,
      f4: 4.0,
      f2: 8.0,
      champ: 16.0,
      biggestUpset: 0,
      highestSeed: 0,
      largestMargin: 0,
      customProp: 0,
    },
  },
  topHeavy: {
    label: 'Top Heavy',
    description: 'Most of the pot goes to deep runs and the champion',
    rules: {
      r32: 0.125,
      s16: 0.375,
      e8: 2.5,
      f4: 7.5,
      f2: 12.5,
      champ: 45.0,
      biggestUpset: 0,
      highestSeed: 0,
      largestMargin: 0,
      customProp: 0,
    },
  },
  withProps: {
    label: 'With Props',
    description: '80% round payouts, 20% across prop bets',
    rules: {
      r32: 0.4,
      s16: 0.8,
      e8: 2.0,
      f4: 3.2,
      f2: 6.4,
      champ: 12.8,
      biggestUpset: 5.0,
      highestSeed: 5.0,
      largestMargin: 5.0,
      customProp: 5.0,
    },
  },
};

/**
 * Get payout presets for a given tournament.
 * For now, all tournaments use the March Madness presets.
 * Extend with sport-specific presets as we add golf, NFL, etc.
 */
export function getPayoutPresets(_tournamentId: string): Record<string, PayoutPreset> {
  return MARCH_MADNESS_PAYOUT_PRESETS;
}
