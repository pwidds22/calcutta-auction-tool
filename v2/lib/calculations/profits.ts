import type { PayoutRules, RoundKey, TournamentConfig } from './types';

/**
 * Calculate round-by-round profit projections.
 *
 * For each round, computes the cumulative payout (sum of all payouts
 * from first round through that round) and subtracts the purchase price.
 *
 * Returns a Record keyed by round key with profit values.
 */
export function calculateRoundProfits(
  purchasePrice: number,
  payoutRules: PayoutRules,
  potSize: number,
  config: TournamentConfig
): Record<RoundKey, number> {
  const price = purchasePrice || 0;
  let cumulative = 0;
  const profits: Record<string, number> = {};

  for (const round of config.rounds) {
    const roundPayout = potSize * ((payoutRules[round.key] ?? 0) / 100);
    cumulative += roundPayout;
    profits[round.key] = cumulative - price;
  }

  return profits;
}
