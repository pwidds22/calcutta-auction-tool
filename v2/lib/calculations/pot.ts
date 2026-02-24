import type { Team } from './types';

/**
 * Infer projected pot size from auction purchases.
 *
 * Formula: projectedPotSize = totalPaid / totalValuePercentage
 *
 * Logic: If purchased teams represent X% of total value and buyers paid $Y,
 * then the total pot is inferred to be $Y / X.
 *
 * Returns 0 if no teams have been purchased or totalValuePercentage is 0.
 */
export function calculateProjectedPotSize(teams: Team[]): number {
  const purchased = teams.filter((t) => t.purchasePrice > 0);

  if (purchased.length === 0) return 0;

  let totalPaid = 0;
  let totalValuePercentage = 0;

  for (const team of purchased) {
    totalPaid += team.purchasePrice;
    totalValuePercentage += team.valuePercentage;
  }

  if (totalValuePercentage <= 0) return 0;

  return totalPaid / totalValuePercentage;
}
