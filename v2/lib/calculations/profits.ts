import type { PayoutRules, RoundProfits } from './types';

/**
 * Calculate round-by-round profit projections.
 *
 * For each round, computes the cumulative payout (sum of all payouts
 * from R32 through that round) and subtracts the purchase price.
 *
 * Example: If pot = $10K, R32 payout = 0.5%, S16 = 1%:
 *   R32 payout = $50, cumulative = $50
 *   S16 payout = $100, cumulative = $150
 *   R32 profit = $50 - purchasePrice
 *   S16 profit = $150 - purchasePrice
 */
export function calculateRoundProfits(
  purchasePrice: number,
  payoutRules: PayoutRules,
  potSize: number
): RoundProfits {
  const price = purchasePrice || 0;

  // Individual round payouts (% of pot)
  const r32Payout = potSize * (payoutRules.roundOf64 / 100);
  const s16Payout = potSize * (payoutRules.roundOf32 / 100);
  const e8Payout = potSize * (payoutRules.sweet16 / 100);
  const f4Payout = potSize * (payoutRules.elite8 / 100);
  const f2Payout = potSize * (payoutRules.finalFour / 100);
  const champPayout = potSize * (payoutRules.champion / 100);

  // Cumulative payouts
  const cumR32 = r32Payout;
  const cumS16 = cumR32 + s16Payout;
  const cumE8 = cumS16 + e8Payout;
  const cumF4 = cumE8 + f4Payout;
  const cumF2 = cumF4 + f2Payout;
  const cumChamp = cumF2 + champPayout;

  return {
    r32: cumR32 - price,
    s16: cumS16 - price,
    e8: cumE8 - price,
    f4: cumF4 - price,
    f2: cumF2 - price,
    champ: cumChamp - price,
  };
}
