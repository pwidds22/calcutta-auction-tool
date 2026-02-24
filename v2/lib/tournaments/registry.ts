import type { TournamentConfig, BaseTeam } from './types';
import {
  MARCH_MADNESS_2026_CONFIG,
  MARCH_MADNESS_2026_TEAMS,
} from './configs/march-madness-2026';

interface TournamentEntry {
  config: TournamentConfig;
  teams: BaseTeam[];
}

const TOURNAMENTS: Record<string, TournamentEntry> = {
  march_madness_2026: {
    config: MARCH_MADNESS_2026_CONFIG,
    teams: MARCH_MADNESS_2026_TEAMS,
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
