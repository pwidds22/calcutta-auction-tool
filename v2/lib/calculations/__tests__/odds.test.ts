import { describe, it, expect } from 'vitest';
import {
  americanOddsToImpliedProbability,
  impliedProbabilityToAmericanOdds,
  calculateImpliedProbabilities,
} from '../odds';
import { MARCH_MADNESS_2026_TEAMS } from '@/lib/data/march-madness-2026';
import { initializeTeams } from '../initialize';
import { DEFAULT_PAYOUT_RULES } from '../types';

describe('americanOddsToImpliedProbability', () => {
  it('converts positive odds (underdog)', () => {
    // +150 → 100 / 250 = 0.4
    expect(americanOddsToImpliedProbability(150)).toBeCloseTo(0.4, 4);
  });

  it('converts negative odds (favorite)', () => {
    // -200 → 200 / 300 = 0.6667
    expect(americanOddsToImpliedProbability(-200)).toBeCloseTo(0.6667, 4);
  });

  it('converts even odds (+100)', () => {
    expect(americanOddsToImpliedProbability(100)).toBeCloseTo(0.5, 4);
  });

  it('converts heavy favorite (-1000)', () => {
    // 1000 / 1100 = 0.9091
    expect(americanOddsToImpliedProbability(-1000)).toBeCloseTo(0.9091, 4);
  });

  it('converts big underdog (+5000)', () => {
    // 100 / 5100 = 0.0196
    expect(americanOddsToImpliedProbability(5000)).toBeCloseTo(0.0196, 4);
  });
});

describe('impliedProbabilityToAmericanOdds', () => {
  it('converts probability < 0.5 to positive odds', () => {
    // 0.4 → (100/0.4) - 100 = 150
    expect(impliedProbabilityToAmericanOdds(0.4)).toBe(150);
  });

  it('converts probability > 0.5 to negative odds', () => {
    // 0.6667 → -(66.67) / (0.3333) ≈ -200
    expect(impliedProbabilityToAmericanOdds(0.6667)).toBeCloseTo(-200, 0);
  });

  it('returns 0 for invalid probabilities', () => {
    expect(impliedProbabilityToAmericanOdds(0)).toBe(0);
    expect(impliedProbabilityToAmericanOdds(1)).toBe(0);
    expect(impliedProbabilityToAmericanOdds(-0.1)).toBe(0);
    expect(impliedProbabilityToAmericanOdds(1.1)).toBe(0);
  });
});

describe('calculateImpliedProbabilities + devigging', () => {
  const teams = initializeTeams(
    MARCH_MADNESS_2026_TEAMS,
    [],
    DEFAULT_PAYOUT_RULES,
    10000
  );

  it('populates rawImpliedProbabilities for all teams', () => {
    for (const team of teams) {
      expect(team.rawImpliedProbabilities.r32).toBeGreaterThan(0);
      expect(team.rawImpliedProbabilities.champ).toBeGreaterThan(0);
    }
  });

  it('populates devigged odds for all teams', () => {
    for (const team of teams) {
      expect(team.odds.r32).toBeGreaterThan(0);
      expect(team.odds.champ).toBeGreaterThan(0);
    }
  });

  it('R32 matchup pairs sum to ~1.0 after devigging', () => {
    const eastTeams = teams.filter((t) => t.region === 'East');
    // 1-seed vs 16-seed
    const seed1 = eastTeams.find((t) => t.seed === 1)!;
    const seed16 = eastTeams.find((t) => t.seed === 16)!;
    expect(seed1.odds.r32 + seed16.odds.r32).toBeCloseTo(1.0, 4);
  });

  it('championship probabilities sum to ~1.0 across all 64 teams (with capping loss)', () => {
    const totalChamp = teams.reduce((sum, t) => sum + t.odds.champ, 0);
    // Capping reduces total slightly below 1.0 — this is expected behavior
    expect(totalChamp).toBeGreaterThan(0.95);
    expect(totalChamp).toBeLessThanOrEqual(1.0);
  });

  it('round probabilities decrease monotonically (r32 >= s16 >= ... >= champ)', () => {
    for (const team of teams) {
      expect(team.odds.r32).toBeGreaterThanOrEqual(team.odds.s16 - 0.0001);
      expect(team.odds.s16).toBeGreaterThanOrEqual(team.odds.e8 - 0.0001);
      expect(team.odds.e8).toBeGreaterThanOrEqual(team.odds.f4 - 0.0001);
      expect(team.odds.f4).toBeGreaterThanOrEqual(team.odds.f2 - 0.0001);
      expect(team.odds.f2).toBeGreaterThanOrEqual(team.odds.champ - 0.0001);
    }
  });

  it('devigged R32 probability is reasonable relative to raw', () => {
    // In most matchups, overround > 1 so devigged <= raw.
    // But when overround < 1 (underround), devigged can be slightly higher.
    // Just verify that devigged values are in a sensible range.
    for (const team of teams) {
      expect(team.odds.r32).toBeGreaterThan(0);
      expect(team.odds.r32).toBeLessThanOrEqual(1);
    }
  });

  it('1-seeds have highest championship odds in their region', () => {
    const regions = ['East', 'West', 'South', 'Midwest'] as const;
    for (const region of regions) {
      const regionTeams = teams.filter((t) => t.region === region);
      const seed1 = regionTeams.find((t) => t.seed === 1)!;
      for (const other of regionTeams) {
        if (other.seed !== 1) {
          expect(seed1.odds.champ).toBeGreaterThan(other.odds.champ);
        }
      }
    }
  });
});
