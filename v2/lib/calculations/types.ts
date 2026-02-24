// Re-export all types from the canonical tournament types module.
// This file exists for backward compatibility — consumers can import from
// either '@/lib/calculations/types' or '@/lib/tournaments/types'.
export type {
  RoundKey,
  GroupKey,
  DevigStrategy,
  RoundConfig,
  GroupConfig,
  PropBetConfig,
  BracketDevigConfig,
  TournamentConfig,
  BaseTeam,
  Team,
  SavedTeamData,
  PayoutRules,
  GroupFilter,
  StatusFilter,
  SortOption,
  SortDirection,
} from '@/lib/tournaments/types';
