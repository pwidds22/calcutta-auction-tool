import type { PayoutRules, TournamentConfig } from '@/lib/tournaments/types';

/**
 * Map legacy DB key names to current tournament config key names.
 * The initial migration (00001) used descriptive keys like "roundOf64"
 * but the tournament config system uses short keys like "r32".
 */
const LEGACY_KEY_MAP: Record<string, string> = {
  roundOf64: 'r32',
  roundOf32: 's16',
  sweet16: 'e8',
  elite8: 'f4',
  finalFour: 'f2',
  champion: 'champ',
};

/**
 * Normalize payout rules from DB format to match the active tournament config.
 * - Maps legacy key names to current config keys
 * - Falls back to config.defaultPayoutRules for any missing keys
 * - Preserves prop bet keys that already match
 */
export function normalizePayoutRules(
  dbRules: PayoutRules | null | undefined,
  config: TournamentConfig
): PayoutRules {
  if (!dbRules || Object.keys(dbRules).length === 0) {
    return { ...config.defaultPayoutRules };
  }

  // Check if rules already use current keys
  const configKeys = new Set([
    ...config.rounds.map((r) => r.key),
    ...(config.propBets ?? []).map((p) => p.key),
  ]);

  const hasCurrentKeys = config.rounds.some((r) => dbRules[r.key] !== undefined);
  const hasLegacyKeys = Object.keys(dbRules).some((k) => k in LEGACY_KEY_MAP);

  // If already using current keys and no legacy keys, pass through
  if (hasCurrentKeys && !hasLegacyKeys) {
    // Still fill in missing keys from defaults
    const normalized: PayoutRules = { ...config.defaultPayoutRules };
    for (const key of configKeys) {
      if (dbRules[key] !== undefined) {
        normalized[key] = dbRules[key];
      }
    }
    return normalized;
  }

  // Map legacy keys to current keys, fall back to defaults
  const normalized: PayoutRules = { ...config.defaultPayoutRules };
  for (const [legacyKey, currentKey] of Object.entries(LEGACY_KEY_MAP)) {
    if (dbRules[legacyKey] !== undefined && configKeys.has(currentKey)) {
      normalized[currentKey] = dbRules[legacyKey];
    }
  }

  // Preserve any prop bet keys that match directly
  for (const prop of config.propBets ?? []) {
    if (dbRules[prop.key] !== undefined) {
      normalized[prop.key] = dbRules[prop.key];
    }
  }

  return normalized;
}
