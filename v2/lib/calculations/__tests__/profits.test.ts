import { describe, it, expect } from 'vitest';
import { calculateRoundProfits } from '../profits';
import { DEFAULT_PAYOUT_RULES } from '../types';

describe('calculateRoundProfits', () => {
  const potSize = 10000;
  const rules = DEFAULT_PAYOUT_RULES;

  it('returns all positive profits with $0 purchase price', () => {
    const profits = calculateRoundProfits(0, rules, potSize);
    expect(profits.r32).toBeGreaterThan(0);
    expect(profits.s16).toBeGreaterThan(0);
    expect(profits.e8).toBeGreaterThan(0);
    expect(profits.f4).toBeGreaterThan(0);
    expect(profits.f2).toBeGreaterThan(0);
    expect(profits.champ).toBeGreaterThan(0);
  });

  it('profits are cumulative (champ > f2 > f4 > ...)', () => {
    const profits = calculateRoundProfits(0, rules, potSize);
    expect(profits.champ).toBeGreaterThan(profits.f2);
    expect(profits.f2).toBeGreaterThan(profits.f4);
    expect(profits.f4).toBeGreaterThan(profits.e8);
    expect(profits.e8).toBeGreaterThan(profits.s16);
    expect(profits.s16).toBeGreaterThan(profits.r32);
  });

  it('calculates correct R32 profit', () => {
    // R32 payout = potSize * (0.5 / 100) = $50
    // Profit = $50 - $100 = -$50
    const profits = calculateRoundProfits(100, rules, potSize);
    expect(profits.r32).toBeCloseTo(-50, 2);
  });

  it('calculates correct championship cumulative payout', () => {
    // Cumulative: 50 + 100 + 250 + 400 + 800 + 1600 = 3200
    // Profit = 3200 - 500 = 2700
    const profits = calculateRoundProfits(500, rules, potSize);
    const expectedCumulative =
      potSize * (0.5 / 100) +
      potSize * (1.0 / 100) +
      potSize * (2.5 / 100) +
      potSize * (4.0 / 100) +
      potSize * (8.0 / 100) +
      potSize * (16.0 / 100);
    expect(profits.champ).toBeCloseTo(expectedCumulative - 500, 2);
  });

  it('handles very high purchase price (all profits negative)', () => {
    const profits = calculateRoundProfits(50000, rules, potSize);
    expect(profits.r32).toBeLessThan(0);
    expect(profits.champ).toBeLessThan(0);
  });

  it('handles undefined/NaN purchase price as 0', () => {
    const profits = calculateRoundProfits(NaN, rules, potSize);
    expect(profits.r32).toBeGreaterThan(0);
  });
});
