import type { TournamentConfig, BaseTeam } from '../types';

export const WORLD_CUP_2026_CONFIG: TournamentConfig = {
  id: 'world_cup_2026',
  name: 'FIFA World Cup 2026',
  sport: 'soccer',
  rounds: [
    { key: 'groupStage', label: 'Group', teamsAdvancing: 32, payoutLabel: 'Advance from Group' },
    { key: 'r32', label: 'R32', teamsAdvancing: 16, payoutLabel: 'Win Round of 32' },
    { key: 'r16', label: 'R16', teamsAdvancing: 8, payoutLabel: 'Win Round of 16' },
    { key: 'qf', label: 'QF', teamsAdvancing: 4, payoutLabel: 'Win Quarterfinal' },
    { key: 'sf', label: 'SF', teamsAdvancing: 2, payoutLabel: 'Win Semifinal' },
    { key: 'champion', label: 'Final', teamsAdvancing: 1, payoutLabel: 'Win Final' },
  ],
  groups: [
    { key: 'A', label: 'Group A' },
    { key: 'B', label: 'Group B' },
    { key: 'C', label: 'Group C' },
    { key: 'D', label: 'Group D' },
    { key: 'E', label: 'Group E' },
    { key: 'F', label: 'Group F' },
    { key: 'G', label: 'Group G' },
    { key: 'H', label: 'Group H' },
    { key: 'I', label: 'Group I' },
    { key: 'J', label: 'Group J' },
    { key: 'K', label: 'Group K' },
    { key: 'L', label: 'Group L' },
  ],
  devigStrategy: 'group',
  defaultPayoutRules: {
    groupStage: 0.25,
    r32: 0.5,
    r16: 1.5,
    qf: 4.0,
    sf: 8.0,
    champion: 25.0,
    goldenBoot: 0.0,
    goldenBall: 0.0,
  },
  defaultPotSize: 10000,
  propBets: [
    { key: 'goldenBoot', label: 'Golden Boot (Top Scorer)' },
    { key: 'goldenBall', label: 'Golden Ball (Best Player)' },
  ],
  badge: 'World Cup 2026',
  teamLabel: 'Nation',
  groupLabel: 'Group',
  startDate: '2026-06-11',
  isActive: false,
};

/**
 * FIFA World Cup 2026 — 48 teams across 12 groups.
 * First expanded World Cup (USA/Mexico/Canada).
 * Odds are estimated placeholders — will be updated with actual futures odds.
 * Groups are placeholder until official draw.
 */
export const WORLD_CUP_2026_TEAMS: BaseTeam[] = [
  // Group A
  { id: 1, name: 'United States', seed: 1, group: 'A', americanOdds: { groupStage: -500, r32: -200, r16: +100, qf: +250, sf: +500, champion: +1200 } },
  { id: 2, name: 'Wales', seed: 2, group: 'A', americanOdds: { groupStage: +100, r32: +300, r16: +800, qf: +2000, sf: +5000, champion: +12000 } },
  { id: 3, name: 'Costa Rica', seed: 3, group: 'A', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +4000, sf: +10000, champion: +25000 } },
  { id: 4, name: 'New Zealand', seed: 4, group: 'A', americanOdds: { groupStage: +400, r32: +1000, r16: +3000, qf: +8000, sf: +20000, champion: +50000 } },
  // Group B
  { id: 5, name: 'Argentina', seed: 1, group: 'B', americanOdds: { groupStage: -800, r32: -400, r16: -120, qf: +130, sf: +250, champion: +500 } },
  { id: 6, name: 'Peru', seed: 2, group: 'B', americanOdds: { groupStage: +100, r32: +300, r16: +800, qf: +2000, sf: +5000, champion: +12000 } },
  { id: 7, name: 'Canada', seed: 3, group: 'B', americanOdds: { groupStage: +120, r32: +350, r16: +1000, qf: +2500, sf: +6000, champion: +15000 } },
  { id: 8, name: 'Honduras', seed: 4, group: 'B', americanOdds: { groupStage: +500, r32: +1200, r16: +3500, qf: +10000, sf: +25000, champion: +60000 } },
  // Group C
  { id: 9, name: 'France', seed: 1, group: 'C', americanOdds: { groupStage: -700, r32: -350, r16: -100, qf: +150, sf: +300, champion: +600 } },
  { id: 10, name: 'Denmark', seed: 2, group: 'C', americanOdds: { groupStage: -120, r32: +150, r16: +500, qf: +1500, sf: +3500, champion: +8000 } },
  { id: 11, name: 'Australia', seed: 3, group: 'C', americanOdds: { groupStage: +150, r32: +400, r16: +1200, qf: +3000, sf: +7000, champion: +18000 } },
  { id: 12, name: 'Tunisia', seed: 4, group: 'C', americanOdds: { groupStage: +300, r32: +700, r16: +2000, qf: +5000, sf: +12000, champion: +30000 } },
  // Group D
  { id: 13, name: 'Brazil', seed: 1, group: 'D', americanOdds: { groupStage: -700, r32: -350, r16: -110, qf: +140, sf: +280, champion: +550 } },
  { id: 14, name: 'Colombia', seed: 2, group: 'D', americanOdds: { groupStage: -120, r32: +150, r16: +500, qf: +1200, sf: +3000, champion: +7000 } },
  { id: 15, name: 'Paraguay', seed: 3, group: 'D', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +4000, sf: +10000, champion: +25000 } },
  { id: 16, name: 'Saudi Arabia', seed: 4, group: 'D', americanOdds: { groupStage: +350, r32: +800, r16: +2500, qf: +6000, sf: +15000, champion: +35000 } },
  // Group E
  { id: 17, name: 'England', seed: 1, group: 'E', americanOdds: { groupStage: -600, r32: -300, r16: -100, qf: +160, sf: +350, champion: +700 } },
  { id: 18, name: 'Serbia', seed: 2, group: 'E', americanOdds: { groupStage: +100, r32: +300, r16: +800, qf: +2000, sf: +5000, champion: +12000 } },
  { id: 19, name: 'Mexico', seed: 3, group: 'E', americanOdds: { groupStage: -110, r32: +200, r16: +600, qf: +1800, sf: +4500, champion: +10000 } },
  { id: 20, name: 'Jamaica', seed: 4, group: 'E', americanOdds: { groupStage: +500, r32: +1200, r16: +3500, qf: +10000, sf: +25000, champion: +60000 } },
  // Group F
  { id: 21, name: 'Spain', seed: 1, group: 'F', americanOdds: { groupStage: -700, r32: -350, r16: -120, qf: +130, sf: +270, champion: +550 } },
  { id: 22, name: 'Croatia', seed: 2, group: 'F', americanOdds: { groupStage: -100, r32: +180, r16: +600, qf: +1500, sf: +3500, champion: +8000 } },
  { id: 23, name: 'Ecuador', seed: 3, group: 'F', americanOdds: { groupStage: +150, r32: +400, r16: +1200, qf: +3000, sf: +7000, champion: +18000 } },
  { id: 24, name: 'Cameroon', seed: 4, group: 'F', americanOdds: { groupStage: +350, r32: +800, r16: +2500, qf: +6000, sf: +15000, champion: +35000 } },
  // Group G
  { id: 25, name: 'Germany', seed: 1, group: 'G', americanOdds: { groupStage: -600, r32: -280, r16: -100, qf: +180, sf: +380, champion: +800 } },
  { id: 26, name: 'Japan', seed: 2, group: 'G', americanOdds: { groupStage: -110, r32: +200, r16: +600, qf: +1500, sf: +4000, champion: +9000 } },
  { id: 27, name: 'Uruguay', seed: 3, group: 'G', americanOdds: { groupStage: +100, r32: +280, r16: +800, qf: +2000, sf: +5000, champion: +12000 } },
  { id: 28, name: 'Ghana', seed: 4, group: 'G', americanOdds: { groupStage: +300, r32: +700, r16: +2000, qf: +5000, sf: +12000, champion: +30000 } },
  // Group H
  { id: 29, name: 'Portugal', seed: 1, group: 'H', americanOdds: { groupStage: -600, r32: -300, r16: -110, qf: +160, sf: +350, champion: +700 } },
  { id: 30, name: 'Netherlands', seed: 2, group: 'H', americanOdds: { groupStage: -200, r32: +100, r16: +400, qf: +1000, sf: +2500, champion: +6000 } },
  { id: 31, name: 'South Korea', seed: 3, group: 'H', americanOdds: { groupStage: +150, r32: +400, r16: +1200, qf: +3000, sf: +7000, champion: +18000 } },
  { id: 32, name: 'Morocco', seed: 4, group: 'H', americanOdds: { groupStage: +120, r32: +350, r16: +1000, qf: +2500, sf: +6000, champion: +15000 } },
  // Group I
  { id: 33, name: 'Belgium', seed: 1, group: 'I', americanOdds: { groupStage: -400, r32: -180, r16: +100, qf: +300, sf: +700, champion: +1500 } },
  { id: 34, name: 'Switzerland', seed: 2, group: 'I', americanOdds: { groupStage: -110, r32: +200, r16: +600, qf: +1500, sf: +4000, champion: +9000 } },
  { id: 35, name: 'Chile', seed: 3, group: 'I', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +4000, sf: +10000, champion: +25000 } },
  { id: 36, name: 'Nigeria', seed: 4, group: 'I', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +3500, sf: +8000, champion: +20000 } },
  // Group J
  { id: 37, name: 'Italy', seed: 1, group: 'J', americanOdds: { groupStage: -500, r32: -220, r16: +100, qf: +250, sf: +550, champion: +1200 } },
  { id: 38, name: 'Austria', seed: 2, group: 'J', americanOdds: { groupStage: -100, r32: +200, r16: +700, qf: +1800, sf: +4500, champion: +10000 } },
  { id: 39, name: 'Senegal', seed: 3, group: 'J', americanOdds: { groupStage: +180, r32: +450, r16: +1300, qf: +3500, sf: +8000, champion: +20000 } },
  { id: 40, name: 'Bolivia', seed: 4, group: 'J', americanOdds: { groupStage: +500, r32: +1200, r16: +3500, qf: +10000, sf: +25000, champion: +60000 } },
  // Group K
  { id: 41, name: 'Mexico', seed: 1, group: 'K', americanOdds: { groupStage: -300, r32: -120, r16: +200, qf: +600, sf: +1500, champion: +3500 } },
  { id: 42, name: 'Turkey', seed: 2, group: 'K', americanOdds: { groupStage: -100, r32: +200, r16: +700, qf: +1800, sf: +4500, champion: +10000 } },
  { id: 43, name: 'IR Iran', seed: 3, group: 'K', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +4000, sf: +10000, champion: +25000 } },
  { id: 44, name: 'Egypt', seed: 4, group: 'K', americanOdds: { groupStage: +250, r32: +600, r16: +1800, qf: +5000, sf: +12000, champion: +30000 } },
  // Group L
  { id: 45, name: 'Colombia', seed: 1, group: 'L', americanOdds: { groupStage: -350, r32: -150, r16: +150, qf: +400, sf: +1000, champion: +2500 } },
  { id: 46, name: 'Poland', seed: 2, group: 'L', americanOdds: { groupStage: -100, r32: +220, r16: +700, qf: +1800, sf: +4500, champion: +10000 } },
  { id: 47, name: 'Ivory Coast', seed: 3, group: 'L', americanOdds: { groupStage: +200, r32: +500, r16: +1500, qf: +4000, sf: +10000, champion: +25000 } },
  { id: 48, name: 'Panama', seed: 4, group: 'L', americanOdds: { groupStage: +350, r32: +800, r16: +2500, qf: +6000, sf: +15000, champion: +35000 } },
];
