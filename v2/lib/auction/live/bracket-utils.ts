import type { TournamentConfig, BaseTeam } from '@/lib/tournaments/types';
import type { TournamentResult } from '@/actions/tournament-results';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BracketTeamSlot {
  teamId: number;
  seed: number;
  name: string;
}

export interface BracketMatchup {
  /** e.g. "East-r32-0", "f2-0", "champ-0" */
  id: string;
  roundKey: string;
  region: string | null;
  /** Position within the round (per-region for regional rounds) */
  slotIndex: number;
  teamA: BracketTeamSlot | null;
  teamB: BracketTeamSlot | null;
  winnerId: number | null;
}

export interface RegionBracket {
  region: string;
  /** roundKey → matchups[] in visual bracket order */
  rounds: Record<string, BracketMatchup[]>;
}

export interface FullBracket {
  regions: RegionBracket[];
  /** Cross-region rounds (Final Four + Championship) */
  crossRegion: Record<string, BracketMatchup[]>;
  /** All round keys in order */
  roundOrder: string[];
  /** Round keys that are per-region */
  regionalRoundKeys: string[];
  /** Round keys that are cross-region */
  crossRegionRoundKeys: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildResultMap(results: TournamentResult[]): Map<string, 'won' | 'lost' | 'pending'> {
  const map = new Map<string, 'won' | 'lost' | 'pending'>();
  for (const r of results) {
    map.set(`${r.team_id}:${r.round_key}`, r.result);
  }
  return map;
}

function findTeamBySeedAndRegion(
  baseTeams: BaseTeam[],
  seed: number,
  region: string
): BracketTeamSlot | null {
  const team = baseTeams.find((t) => t.seed === seed && t.group === region);
  if (!team) return null;
  return { teamId: team.id, seed: team.seed, name: team.name };
}

function teamSlotFromId(baseTeams: BaseTeam[], teamId: number): BracketTeamSlot | null {
  const team = baseTeams.find((t) => t.id === teamId);
  if (!team) return null;
  return { teamId: team.id, seed: team.seed, name: team.name };
}

/* ------------------------------------------------------------------ */
/*  Bracket generation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Generate the full bracket for a tournament with bracket devig config.
 * Derives matchups from the config's bracketDevigConfig matchupPairs and
 * uses tournament results to populate winners / next-round slots.
 */
export function generateFullBracket(
  config: TournamentConfig,
  baseTeams: BaseTeam[],
  results: TournamentResult[]
): FullBracket {
  const devigConfig = config.bracketDevigConfig;
  if (!devigConfig) throw new Error('Tournament does not have bracketDevigConfig');

  const resultMap = buildResultMap(results);
  const roundKeys = config.rounds.map((r) => r.key);

  // Determine which rounds are regional vs cross-region.
  // For NCAA: first N rounds are per-region (r32, s16, e8, f4), last rounds are cross (f2, champ).
  // Heuristic: a round is regional if the number of first-round matchups (per region)
  // halved repeatedly still produces at least 1 matchup per region.
  // For 16 teams per region: 8 → 4 → 2 → 1 = 4 regional rounds.
  const pairsPerRegion = devigConfig.matchupPairs.length; // 8 for NCAA
  let regionalRoundCount = 0;
  let matchupsPerRegion = pairsPerRegion;
  while (matchupsPerRegion >= 1 && regionalRoundCount < roundKeys.length) {
    regionalRoundCount++;
    matchupsPerRegion = Math.floor(matchupsPerRegion / 2);
  }

  const regionalRoundKeys = roundKeys.slice(0, regionalRoundCount);
  const crossRegionRoundKeys = roundKeys.slice(regionalRoundCount);

  // Get regions from config groups (preserves order)
  const regions = config.groups.map((g) => g.key);

  // Build each region's bracket
  const regionBrackets: RegionBracket[] = regions.map((region) => {
    const rounds: Record<string, BracketMatchup[]> = {};

    // First round: use seed pairs from config
    const firstRoundKey = regionalRoundKeys[0];
    const firstRoundMatchups: BracketMatchup[] = devigConfig.matchupPairs.map(
      ([seedA, seedB], idx) => {
        const teamA = findTeamBySeedAndRegion(baseTeams, seedA, region);
        const teamB = findTeamBySeedAndRegion(baseTeams, seedB, region);
        const winnerId = getMatchupWinner(teamA, teamB, firstRoundKey, resultMap);
        return {
          id: `${region}-${firstRoundKey}-${idx}`,
          roundKey: firstRoundKey,
          region,
          slotIndex: idx,
          teamA,
          teamB,
          winnerId,
        };
      }
    );
    rounds[firstRoundKey] = firstRoundMatchups;

    // Subsequent regional rounds: derive from previous round's winners
    for (let r = 1; r < regionalRoundKeys.length; r++) {
      const roundKey = regionalRoundKeys[r];
      const prevMatchups = rounds[regionalRoundKeys[r - 1]];
      const matchups: BracketMatchup[] = [];

      for (let i = 0; i < prevMatchups.length; i += 2) {
        const matchupA = prevMatchups[i];
        const matchupB = prevMatchups[i + 1];
        const teamA = matchupA.winnerId ? teamSlotFromId(baseTeams, matchupA.winnerId) : null;
        const teamB = matchupB?.winnerId ? teamSlotFromId(baseTeams, matchupB.winnerId) : null;
        const winnerId = getMatchupWinner(teamA, teamB, roundKey, resultMap);
        const slotIdx = Math.floor(i / 2);

        matchups.push({
          id: `${region}-${roundKey}-${slotIdx}`,
          roundKey,
          region,
          slotIndex: slotIdx,
          teamA,
          teamB,
          winnerId,
        });
      }
      rounds[roundKey] = matchups;
    }

    return { region, rounds };
  });

  // Cross-region rounds
  const crossRegion: Record<string, BracketMatchup[]> = {};

  if (crossRegionRoundKeys.length > 0) {
    const firstCrossKey = crossRegionRoundKeys[0];

    // Build from bracket sides config: { left: ['East', 'West'], right: ['South', 'Midwest'] }
    // Convert to array of sides: [['East', 'West'], ['South', 'Midwest']]
    const { left, right } = devigConfig.bracketSides;
    const sidesArray = [left, right];

    const matchups: BracketMatchup[] = sidesArray.map((side, idx) => {
      // Each "side" is an array of region names, e.g. ["East", "West"]
      // The regional winner is the last regional round's single matchup winner
      const lastRegionalKey = regionalRoundKeys[regionalRoundKeys.length - 1];

      const regionA = regionBrackets.find((rb) => rb.region === side[0]);
      const regionB = regionBrackets.find((rb) => rb.region === side[1]);

      const regionAFinal = regionA?.rounds[lastRegionalKey]?.[0];
      const regionBFinal = regionB?.rounds[lastRegionalKey]?.[0];

      const teamA = regionAFinal?.winnerId
        ? teamSlotFromId(baseTeams, regionAFinal.winnerId)
        : null;
      const teamB = regionBFinal?.winnerId
        ? teamSlotFromId(baseTeams, regionBFinal.winnerId)
        : null;

      const winnerId = getMatchupWinner(teamA, teamB, firstCrossKey, resultMap);

      return {
        id: `${firstCrossKey}-${idx}`,
        roundKey: firstCrossKey,
        region: null,
        slotIndex: idx,
        teamA,
        teamB,
        winnerId,
      };
    });
    crossRegion[firstCrossKey] = matchups;

    // Championship and beyond: chain from previous cross-region round
    for (let r = 1; r < crossRegionRoundKeys.length; r++) {
      const roundKey = crossRegionRoundKeys[r];
      const prevKey = crossRegionRoundKeys[r - 1];
      const prevMatchups = crossRegion[prevKey] ?? [];
      const matchups: BracketMatchup[] = [];

      for (let i = 0; i < prevMatchups.length; i += 2) {
        const matchupA = prevMatchups[i];
        const matchupB = prevMatchups[i + 1];
        const teamA = matchupA?.winnerId
          ? teamSlotFromId(baseTeams, matchupA.winnerId)
          : null;
        const teamB = matchupB?.winnerId
          ? teamSlotFromId(baseTeams, matchupB.winnerId)
          : null;

        const winnerId = getMatchupWinner(teamA, teamB, roundKey, resultMap);
        matchups.push({
          id: `${roundKey}-${Math.floor(i / 2)}`,
          roundKey,
          region: null,
          slotIndex: Math.floor(i / 2),
          teamA,
          teamB,
          winnerId,
        });
      }
      crossRegion[roundKey] = matchups;
    }
  }

  return {
    regions: regionBrackets,
    crossRegion,
    roundOrder: roundKeys,
    regionalRoundKeys,
    crossRegionRoundKeys,
  };
}

function getMatchupWinner(
  teamA: BracketTeamSlot | null,
  teamB: BracketTeamSlot | null,
  roundKey: string,
  resultMap: Map<string, string>
): number | null {
  if (teamA && resultMap.get(`${teamA.teamId}:${roundKey}`) === 'won') return teamA.teamId;
  if (teamB && resultMap.get(`${teamB.teamId}:${roundKey}`) === 'won') return teamB.teamId;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Cascade clearing                                                   */
/* ------------------------------------------------------------------ */

/**
 * When a matchup result changes, compute all downstream results that need
 * to be cleared (set to 'pending') because the bracket path has changed.
 *
 * Returns an array of { team_id, round_key, result } updates to send.
 */
export function computeCascadeClears(
  oldWinnerId: number | null,
  bracket: FullBracket,
  roundKey: string,
  results: TournamentResult[]
): Array<{ team_id: number; round_key: string; result: 'pending' }> {
  if (!oldWinnerId) return [];

  const resultMap = buildResultMap(results);
  const allRounds = bracket.roundOrder;
  const roundIdx = allRounds.indexOf(roundKey);
  if (roundIdx < 0) return [];

  const clears: Array<{ team_id: number; round_key: string; result: 'pending' }> = [];

  // Clear all downstream results for the old winner
  for (let i = roundIdx + 1; i < allRounds.length; i++) {
    const rk = allRounds[i];
    const existing = resultMap.get(`${oldWinnerId}:${rk}`);
    if (existing && existing !== 'pending') {
      clears.push({ team_id: oldWinnerId, round_key: rk, result: 'pending' });
    }
  }

  return clears;
}
