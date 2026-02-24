import { describe, it, expect } from 'vitest';
import { calculateProjectedPotSize } from '../pot';
import { initializeTeams } from '../initialize';
import { MARCH_MADNESS_2026_TEAMS, MARCH_MADNESS_2026_CONFIG } from '@/lib/tournaments/configs/march-madness-2026';

const config = MARCH_MADNESS_2026_CONFIG;

describe('calculateProjectedPotSize', () => {
  it('returns 0 when no teams are purchased', () => {
    const teams = initializeTeams(
      MARCH_MADNESS_2026_TEAMS,
      [],
      config.defaultPayoutRules,
      10000,
      config
    );
    expect(calculateProjectedPotSize(teams)).toBe(0);
  });

  it('infers pot size from purchases (totalPaid / totalValuePercentage)', () => {
    const teams = initializeTeams(
      MARCH_MADNESS_2026_TEAMS,
      [],
      config.defaultPayoutRules,
      10000,
      config
    );

    // Buy team 0 for $100
    const team = teams[0];
    team.purchasePrice = 100;

    const projected = calculateProjectedPotSize(teams);

    // projected = 100 / team.valuePercentage
    expect(projected).toBeCloseTo(100 / team.valuePercentage, 2);
    expect(projected).toBeGreaterThan(0);
  });

  it('updates correctly when multiple teams are purchased', () => {
    const teams = initializeTeams(
      MARCH_MADNESS_2026_TEAMS,
      [],
      config.defaultPayoutRules,
      10000,
      config
    );

    teams[0].purchasePrice = 200;
    teams[1].purchasePrice = 50;

    const projected = calculateProjectedPotSize(teams);
    const totalPaid = 250;
    const totalValue = teams[0].valuePercentage + teams[1].valuePercentage;

    expect(projected).toBeCloseTo(totalPaid / totalValue, 2);
  });

  it('ignores teams with $0 purchase price', () => {
    const teams = initializeTeams(
      MARCH_MADNESS_2026_TEAMS,
      [],
      config.defaultPayoutRules,
      10000,
      config
    );

    teams[0].purchasePrice = 100;
    teams[1].purchasePrice = 0;

    const projected = calculateProjectedPotSize(teams);
    expect(projected).toBeCloseTo(100 / teams[0].valuePercentage, 2);
  });
});
