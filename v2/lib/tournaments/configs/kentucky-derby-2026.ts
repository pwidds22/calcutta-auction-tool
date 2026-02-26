import type { TournamentConfig, BaseTeam } from '../types';

export const KENTUCKY_DERBY_2026_CONFIG: TournamentConfig = {
  id: 'kentucky_derby_2026',
  name: 'Kentucky Derby 2026',
  sport: 'horse_racing',
  rounds: [
    { key: 'show', label: 'Show', teamsAdvancing: 3, payoutLabel: 'Show (Top 3)' },
    { key: 'place', label: 'Place', teamsAdvancing: 2, payoutLabel: 'Place (Top 2)' },
    { key: 'win', label: 'Win', teamsAdvancing: 1, payoutLabel: 'Win' },
  ],
  groups: [
    { key: 'favorites', label: 'Favorites' },
    { key: 'contenders', label: 'Contenders' },
    { key: 'longshots', label: 'Longshots' },
  ],
  devigStrategy: 'global',
  defaultPayoutRules: {
    show: 5.0,
    place: 10.0,
    win: 50.0,
    bestName: 0.0,
  },
  defaultPotSize: 5000,
  propBets: [
    { key: 'bestName', label: 'Best Horse Name' },
  ],
  badge: 'Kentucky Derby 2026',
  teamLabel: 'Horse',
  groupLabel: 'Tier',
  startDate: '2026-05-02',
  isActive: false,
};

/**
 * 2026 Kentucky Derby field — placeholder horses and odds.
 * The actual field is finalized much closer to race day.
 * These are representative early futures odds.
 */
export const KENTUCKY_DERBY_2026_TEAMS: BaseTeam[] = [
  { id: 1, name: 'Secretariat Jr', seed: 1, group: 'favorites', americanOdds: { show: -300, place: -150, win: +300 } },
  { id: 2, name: 'Thunder Road', seed: 2, group: 'favorites', americanOdds: { show: -250, place: -120, win: +400 } },
  { id: 3, name: 'Midnight Run', seed: 3, group: 'favorites', americanOdds: { show: -200, place: -100, win: +500 } },
  { id: 4, name: 'Golden Stride', seed: 4, group: 'favorites', americanOdds: { show: -180, place: +100, win: +600 } },
  { id: 5, name: 'Bold Venture', seed: 5, group: 'favorites', americanOdds: { show: -150, place: +120, win: +800 } },
  { id: 6, name: 'Fast Company', seed: 6, group: 'contenders', americanOdds: { show: -120, place: +150, win: +1000 } },
  { id: 7, name: 'Crown Royal', seed: 7, group: 'contenders', americanOdds: { show: -110, place: +170, win: +1200 } },
  { id: 8, name: 'Lucky Seven', seed: 8, group: 'contenders', americanOdds: { show: +100, place: +200, win: +1500 } },
  { id: 9, name: 'Iron Will', seed: 9, group: 'contenders', americanOdds: { show: +110, place: +220, win: +1800 } },
  { id: 10, name: 'Desert Storm', seed: 10, group: 'contenders', americanOdds: { show: +120, place: +250, win: +2000 } },
  { id: 11, name: 'Bourbon Street', seed: 11, group: 'contenders', americanOdds: { show: +130, place: +280, win: +2500 } },
  { id: 12, name: 'Rebel Yell', seed: 12, group: 'contenders', americanOdds: { show: +150, place: +300, win: +2800 } },
  { id: 13, name: 'Blue Grass', seed: 13, group: 'longshots', americanOdds: { show: +180, place: +400, win: +4000 } },
  { id: 14, name: 'Dark Horse', seed: 14, group: 'longshots', americanOdds: { show: +200, place: +500, win: +5000 } },
  { id: 15, name: 'Long Shot Larry', seed: 15, group: 'longshots', americanOdds: { show: +250, place: +600, win: +6000 } },
  { id: 16, name: 'Wild Card', seed: 16, group: 'longshots', americanOdds: { show: +300, place: +800, win: +8000 } },
  { id: 17, name: 'Dream Catcher', seed: 17, group: 'longshots', americanOdds: { show: +400, place: +1000, win: +10000 } },
  { id: 18, name: 'Underdog', seed: 18, group: 'longshots', americanOdds: { show: +500, place: +1500, win: +15000 } },
  { id: 19, name: 'Miracle Mile', seed: 19, group: 'longshots', americanOdds: { show: +600, place: +2000, win: +20000 } },
  { id: 20, name: 'No Chance', seed: 20, group: 'longshots', americanOdds: { show: +800, place: +3000, win: +30000 } },
];
