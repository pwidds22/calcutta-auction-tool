import { describe, it, expect } from 'vitest';
import { calculateTeamValues, calculateFairValue, calculateSuggestedBid } from '../values';
import { initializeTeams } from '../initialize';
import { MARCH_MADNESS_2026_TEAMS } from '@/lib/data/march-madness-2026';
import { DEFAULT_PAYOUT_RULES, TEAMS_PER_ROUND, PAYOUT_TO_ROUND } from '../types';
import type { Team } from '../types';

describe('calculateTeamValues', () => {
  const potSize = 10000;
  const teams = initializeTeams(
    MARCH_MADNESS_2026_TEAMS,
    [],
    DEFAULT_PAYOUT_RULES,
    potSize
  );

  it('calculates valuePercentage for every team', () => {
    for (const team of teams) {
      expect(team.valuePercentage).toBeGreaterThan(0);
    }
  });

  it('calculates fairValue = valuePercentage * potSize', () => {
    for (const team of teams) {
      expect(team.fairValue).toBeCloseTo(team.valuePercentage * potSize, 4);
    }
  });

  it('calculates roundValues for all rounds', () => {
    for (const team of teams) {
      expect(team.roundValues.r32).toBeGreaterThan(0);
      expect(team.roundValues.champ).toBeGreaterThan(0);
    }
  });

  it('valuePercentage equals sum of all roundValues', () => {
    for (const team of teams) {
      const sum =
        team.roundValues.r32 +
        team.roundValues.s16 +
        team.roundValues.e8 +
        team.roundValues.f4 +
        team.roundValues.f2 +
        team.roundValues.champ;
      expect(team.valuePercentage).toBeCloseTo(sum, 8);
    }
  });

  it('total of all teams fairValues is close to pot size (within 5%)', () => {
    // Total payout % for standard rounds = 32*0.5 + 16*1 + 8*2.5 + 4*4 + 2*8 + 1*16 = 100%
    // Capping reduces devigged probabilities slightly, so total fair value < potSize
    const totalFairValue = teams.reduce((sum, t) => sum + t.fairValue, 0);
    expect(totalFairValue).toBeGreaterThan(potSize * 0.95);
    expect(totalFairValue).toBeLessThanOrEqual(potSize * 1.05);
  });

  it('1-seeds have higher value than 16-seeds', () => {
    const eastSeed1 = teams.find((t) => t.region === 'East' && t.seed === 1)!;
    const eastSeed16 = teams.find((t) => t.region === 'East' && t.seed === 16)!;
    expect(eastSeed1.valuePercentage).toBeGreaterThan(eastSeed16.valuePercentage);
  });
});

describe('calculateFairValue', () => {
  it('returns valuePercentage * potSize', () => {
    expect(calculateFairValue(0.05, 10000)).toBe(500);
    expect(calculateFairValue(0.01, 50000)).toBe(500);
    expect(calculateFairValue(0, 10000)).toBe(0);
  });
});

describe('calculateSuggestedBid', () => {
  it('returns 95% of fair value', () => {
    expect(calculateSuggestedBid(0.05, 10000)).toBe(475);
    expect(calculateSuggestedBid(0.01, 50000)).toBe(475);
  });

  it('is always less than fair value', () => {
    const bid = calculateSuggestedBid(0.1, 10000);
    const fair = calculateFairValue(0.1, 10000);
    expect(bid).toBeLessThan(fair);
  });
});
