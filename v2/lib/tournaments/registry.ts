import type { TournamentConfig, BaseTeam } from './types';
import {
  MARCH_MADNESS_2026_CONFIG,
  MARCH_MADNESS_2026_TEAMS,
} from './configs/march-madness-2026';
import {
  MASTERS_2026_CONFIG,
  MASTERS_2026_TEAMS,
} from './configs/masters-2026';
import {
  KENTUCKY_DERBY_2026_CONFIG,
  KENTUCKY_DERBY_2026_TEAMS,
} from './configs/kentucky-derby-2026';
import {
  NFL_PLAYOFFS_2026_CONFIG,
  NFL_PLAYOFFS_2026_TEAMS,
} from './configs/nfl-playoffs-2026';

interface TournamentEntry {
  config: TournamentConfig;
  teams: BaseTeam[];
}

const TOURNAMENTS: Record<string, TournamentEntry> = {
  march_madness_2026: {
    config: MARCH_MADNESS_2026_CONFIG,
    teams: MARCH_MADNESS_2026_TEAMS,
  },
  masters_2026: {
    config: MASTERS_2026_CONFIG,
    teams: MASTERS_2026_TEAMS,
  },
  kentucky_derby_2026: {
    config: KENTUCKY_DERBY_2026_CONFIG,
    teams: KENTUCKY_DERBY_2026_TEAMS,
  },
  nfl_playoffs_2026: {
    config: NFL_PLAYOFFS_2026_CONFIG,
    teams: NFL_PLAYOFFS_2026_TEAMS,
  },
};

export function getTournament(id: string): TournamentEntry | undefined {
  return TOURNAMENTS[id];
}

export function getActiveTournament(): TournamentEntry {
  const active = Object.values(TOURNAMENTS).find((t) => t.config.isActive);
  if (!active) {
    // Fallback to first tournament
    return Object.values(TOURNAMENTS)[0];
  }
  return active;
}

export function listTournaments(): TournamentConfig[] {
  return Object.values(TOURNAMENTS).map((t) => t.config);
}

export function listTournamentsWithTeams(): TournamentEntry[] {
  return Object.values(TOURNAMENTS);
}
