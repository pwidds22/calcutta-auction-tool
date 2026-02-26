import type { TournamentConfig, BaseTeam } from '../types';

export const MASTERS_2026_CONFIG: TournamentConfig = {
  id: 'masters_2026',
  name: 'The Masters 2026',
  sport: 'golf',
  rounds: [
    { key: 'makeCut', label: 'Cut', teamsAdvancing: 50, payoutLabel: 'Make the Cut' },
    { key: 'top20', label: 'T20', teamsAdvancing: 20, payoutLabel: 'Top 20' },
    { key: 'top10', label: 'T10', teamsAdvancing: 10, payoutLabel: 'Top 10' },
    { key: 'top5', label: 'T5', teamsAdvancing: 5, payoutLabel: 'Top 5' },
    { key: 'winner', label: 'Win', teamsAdvancing: 1, payoutLabel: 'Winner' },
  ],
  groups: [
    { key: 'favorites', label: 'Favorites' },
    { key: 'contenders', label: 'Contenders' },
    { key: 'longshots', label: 'Longshots' },
    { key: 'fieldPlayers', label: 'Field' },
  ],
  devigStrategy: 'global',
  defaultPayoutRules: {
    makeCut: 0.5,
    top20: 1.5,
    top10: 3.0,
    top5: 6.0,
    winner: 25.0,
    lowRound: 0.0,
  },
  defaultPotSize: 5000,
  propBets: [
    { key: 'lowRound', label: 'Low Round' },
  ],
  badge: 'The Masters 2026',
  teamLabel: 'Golfer',
  groupLabel: 'Tier',
  startDate: '2026-04-09',
  isActive: false,
};

/**
 * 2026 Masters field — placeholder odds. Will be updated closer to tournament.
 * Using outright win odds, with derived cut/top20/top10/top5 probabilities.
 */
export const MASTERS_2026_TEAMS: BaseTeam[] = [
  { id: 1, name: 'Scottie Scheffler', seed: 1, group: 'favorites', americanOdds: { makeCut: -800, top20: -200, top10: +100, top5: +250, winner: +500 } },
  { id: 2, name: 'Rory McIlroy', seed: 2, group: 'favorites', americanOdds: { makeCut: -600, top20: -150, top10: +130, top5: +300, winner: +800 } },
  { id: 3, name: 'Jon Rahm', seed: 3, group: 'favorites', americanOdds: { makeCut: -500, top20: -120, top10: +150, top5: +350, winner: +1000 } },
  { id: 4, name: 'Xander Schauffele', seed: 4, group: 'favorites', americanOdds: { makeCut: -500, top20: -110, top10: +160, top5: +400, winner: +1200 } },
  { id: 5, name: 'Collin Morikawa', seed: 5, group: 'favorites', americanOdds: { makeCut: -400, top20: +100, top10: +200, top5: +500, winner: +1400 } },
  { id: 6, name: 'Ludvig Åberg', seed: 6, group: 'favorites', americanOdds: { makeCut: -400, top20: +110, top10: +220, top5: +500, winner: +1600 } },
  { id: 7, name: 'Viktor Hovland', seed: 7, group: 'contenders', americanOdds: { makeCut: -350, top20: +120, top10: +250, top5: +600, winner: +2000 } },
  { id: 8, name: 'Patrick Cantlay', seed: 8, group: 'contenders', americanOdds: { makeCut: -350, top20: +130, top10: +270, top5: +650, winner: +2200 } },
  { id: 9, name: 'Bryson DeChambeau', seed: 9, group: 'contenders', americanOdds: { makeCut: -300, top20: +140, top10: +280, top5: +700, winner: +2500 } },
  { id: 10, name: 'Tommy Fleetwood', seed: 10, group: 'contenders', americanOdds: { makeCut: -300, top20: +150, top10: +300, top5: +750, winner: +2800 } },
  { id: 11, name: 'Brooks Koepka', seed: 11, group: 'contenders', americanOdds: { makeCut: -250, top20: +160, top10: +350, top5: +800, winner: +3000 } },
  { id: 12, name: 'Tony Finau', seed: 12, group: 'contenders', americanOdds: { makeCut: -250, top20: +170, top10: +370, top5: +850, winner: +3300 } },
  { id: 13, name: 'Hideki Matsuyama', seed: 13, group: 'contenders', americanOdds: { makeCut: -250, top20: +180, top10: +380, top5: +900, winner: +3500 } },
  { id: 14, name: 'Shane Lowry', seed: 14, group: 'contenders', americanOdds: { makeCut: -200, top20: +200, top10: +400, top5: +1000, winner: +4000 } },
  { id: 15, name: 'Sahith Theegala', seed: 15, group: 'contenders', americanOdds: { makeCut: -200, top20: +220, top10: +450, top5: +1100, winner: +4500 } },
  { id: 16, name: 'Cameron Smith', seed: 16, group: 'contenders', americanOdds: { makeCut: -180, top20: +250, top10: +500, top5: +1200, winner: +5000 } },
  { id: 17, name: 'Justin Thomas', seed: 17, group: 'longshots', americanOdds: { makeCut: -150, top20: +300, top10: +600, top5: +1500, winner: +6000 } },
  { id: 18, name: 'Jordan Spieth', seed: 18, group: 'longshots', americanOdds: { makeCut: -150, top20: +300, top10: +600, top5: +1500, winner: +6500 } },
  { id: 19, name: 'Dustin Johnson', seed: 19, group: 'longshots', americanOdds: { makeCut: -120, top20: +350, top10: +700, top5: +1800, winner: +8000 } },
  { id: 20, name: 'Adam Scott', seed: 20, group: 'longshots', americanOdds: { makeCut: -110, top20: +400, top10: +800, top5: +2000, winner: +10000 } },
  { id: 21, name: 'Max Homa', seed: 21, group: 'longshots', americanOdds: { makeCut: -110, top20: +400, top10: +800, top5: +2200, winner: +10000 } },
  { id: 22, name: 'Russell Henley', seed: 22, group: 'longshots', americanOdds: { makeCut: +100, top20: +450, top10: +900, top5: +2500, winner: +12000 } },
  { id: 23, name: 'Corey Conners', seed: 23, group: 'longshots', americanOdds: { makeCut: +100, top20: +500, top10: +1000, top5: +2800, winner: +15000 } },
  { id: 24, name: 'Sungjae Im', seed: 24, group: 'longshots', americanOdds: { makeCut: +110, top20: +500, top10: +1000, top5: +3000, winner: +15000 } },
  { id: 25, name: 'Keegan Bradley', seed: 25, group: 'fieldPlayers', americanOdds: { makeCut: +120, top20: +600, top10: +1200, top5: +3500, winner: +20000 } },
  { id: 26, name: 'Phil Mickelson', seed: 26, group: 'fieldPlayers', americanOdds: { makeCut: +200, top20: +1000, top10: +2000, top5: +5000, winner: +30000 } },
  { id: 27, name: 'Tiger Woods', seed: 27, group: 'fieldPlayers', americanOdds: { makeCut: +250, top20: +1200, top10: +2500, top5: +6000, winner: +40000 } },
  { id: 28, name: 'Fred Couples', seed: 28, group: 'fieldPlayers', americanOdds: { makeCut: +500, top20: +2000, top10: +5000, top5: +10000, winner: +100000 } },
];
