import { describe, it, expect } from 'vitest';
import { calculateRoundProfits } from '../profits';
import { MARCH_MADNESS_2026_CONFIG } from '@/lib/tournaments/configs/march-madness-2026';

const config = MARCH_MADNESS_2026_CONFIG;
const rules = config.defaultPayoutRules;

describe('calculateRoundProfits', () => {
  const potSize = 10000;

  it('returns all positive profits with $0 purchase price', () => {
    const profits = calculateRoundProfits(0, rules, potSize, config);
    for (const round of config.rounds) {
      expect(profits[round.key]).toBeGreaterThan(0);
    }
  });

  it('profits are cumulative (later rounds > earlier rounds)', () => {
    const profits = calculateRoundProfits(0, rules, potSize, config);
    const roundKeys = config.rounds.map((r) => r.key);
    for (let i = 1; i < roundKeys.length; i++) {
      expect(profits[roundKeys[i]]).toBeGreaterThan(profits[roundKeys[i - 1]]);
    }
  });

  it('calculates correct R32 profit', () => {
    // R32 payout = potSize * (0.5 / 100) = $50
    // Profit = $50 - $100 = -$50
    const profits = calculateRoundProfits(100, rules, potSize, config);
    expect(profits['r32']).toBeCloseTo(-50, 2);
  });

  it('calculates correct championship cumulative payout', () => {
    // Cumulative: 50 + 100 + 250 + 400 + 800 + 1600 = 3200
    // Profit = 3200 - 500 = 2700
    const profits = calculateRoundProfits(500, rules, potSize, config);
    let expectedCumulative = 0;
    for (const round of config.rounds) {
      expectedCumulative += potSize * ((rules[round.key] ?? 0) / 100);
    }
    expect(profits['champ']).toBeCloseTo(expectedCumulative - 500, 2);
  });

  it('handles very high purchase price (all profits negative)', () => {
    const profits = calculateRoundProfits(50000, rules, potSize, config);
    for (const round of config.rounds) {
      expect(profits[round.key]).toBeLessThan(0);
    }
  });

  it('handles undefined/NaN purchase price as 0', () => {
    const profits = calculateRoundProfits(NaN, rules, potSize, config);
    expect(profits['r32']).toBeGreaterThan(0);
  });
});
