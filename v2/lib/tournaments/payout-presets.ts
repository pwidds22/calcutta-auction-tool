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

export const MASTERS_PAYOUT_PRESETS: Record<string, PayoutPreset> = {
  balanced: {
    label: 'Balanced',
    description: 'Spread payouts across finishes — rewards consistency',
    rules: {
      makeCut: 0.5,
      top20: 1.5,
      top10: 3.0,
      top5: 6.0,
      winner: 25.0,
      lowRound: 0,
    },
  },
  topHeavy: {
    label: 'Winner Takes Most',
    description: 'Majority of the pot goes to the champion',
    rules: {
      makeCut: 0.25,
      top20: 0.75,
      top10: 1.5,
      top5: 3.0,
      winner: 50.0,
      lowRound: 0,
    },
  },
  withProps: {
    label: 'With Low Round',
    description: '85% placement payouts, 15% for low round bonus',
    rules: {
      makeCut: 0.4,
      top20: 1.2,
      top10: 2.5,
      top5: 5.0,
      winner: 21.0,
      lowRound: 15.0,
    },
  },
};

export const KENTUCKY_DERBY_PAYOUT_PRESETS: Record<string, PayoutPreset> = {
  balanced: {
    label: 'Balanced',
    description: 'Reward show, place, and win finishes',
    rules: {
      show: 5.0,
      place: 10.0,
      win: 50.0,
      bestName: 0,
    },
  },
  topHeavy: {
    label: 'Winner Takes Most',
    description: 'Heavy payout for the winner — small show/place bonus',
    rules: {
      show: 2.0,
      place: 5.0,
      win: 75.0,
      bestName: 0,
    },
  },
  withProps: {
    label: 'With Best Name',
    description: '85% race payouts, 15% for best horse name vote',
    rules: {
      show: 4.0,
      place: 8.0,
      win: 43.0,
      bestName: 15.0,
    },
  },
};

export const NFL_PLAYOFFS_PAYOUT_PRESETS: Record<string, PayoutPreset> = {
  balanced: {
    label: 'Balanced',
    description: 'Reward every playoff win — keeps owners engaged all postseason',
    rules: {
      wildcard: 2.0,
      divisional: 4.0,
      conference: 8.0,
      superBowl: 30.0,
      mvp: 0,
    },
  },
  topHeavy: {
    label: 'Super Bowl Heavy',
    description: 'Most of the pot goes to the champion',
    rules: {
      wildcard: 1.0,
      divisional: 2.0,
      conference: 5.0,
      superBowl: 50.0,
      mvp: 0,
    },
  },
  withProps: {
    label: 'With MVP',
    description: '80% game payouts, 20% for Super Bowl MVP owner',
    rules: {
      wildcard: 1.5,
      divisional: 3.0,
      conference: 6.0,
      superBowl: 25.0,
      mvp: 20.0,
    },
  },
};

const PRESET_MAP: Record<string, Record<string, PayoutPreset>> = {
  march_madness_2026: MARCH_MADNESS_PAYOUT_PRESETS,
  masters_2026: MASTERS_PAYOUT_PRESETS,
  kentucky_derby_2026: KENTUCKY_DERBY_PAYOUT_PRESETS,
  nfl_playoffs_2026: NFL_PLAYOFFS_PAYOUT_PRESETS,
};

/**
 * Get payout presets for a given tournament.
 * Falls back to March Madness presets if tournament not found.
 */
export function getPayoutPresets(tournamentId: string): Record<string, PayoutPreset> {
  return PRESET_MAP[tournamentId] ?? MARCH_MADNESS_PAYOUT_PRESETS;
}
