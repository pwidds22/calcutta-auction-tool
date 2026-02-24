import type { BaseTeam } from '@/lib/calculations/types';

/**
 * 2025 NCAA March Madness teams with American odds per round.
 * 64 teams across 4 regions (East, Midwest, South, West).
 * Odds sourced from sportsbook lines — will update for 2026 bracket.
 */
export const MARCH_MADNESS_2026_TEAMS: BaseTeam[] = [
  // ===== East Region =====
  { id: 1, name: 'Duke', seed: 1, region: 'East', americanOdds: { r32: -3752, s16: -700, e8: -240, f4: -125, f2: +172, champ: +329 } },
  { id: 2, name: 'Alabama', seed: 2, region: 'East', americanOdds: { r32: -2389, s16: -240, e8: +120, f4: +378, f2: +860, champ: +1847 } },
  { id: 3, name: 'Wisconsin', seed: 3, region: 'East', americanOdds: { r32: -1256, s16: -116, e8: +310, f4: +993, f2: +3100, champ: +5634 } },
  { id: 4, name: 'Arizona', seed: 4, region: 'East', americanOdds: { r32: -783, s16: -192, e8: +390, f4: +1022, f2: +3700, champ: +5528 } },
  { id: 5, name: 'Oregon', seed: 5, region: 'East', americanOdds: { r32: -275, s16: +230, e8: +1360, f4: +2993, f2: +14000, champ: +18207 } },
  { id: 6, name: 'BYU', seed: 6, region: 'East', americanOdds: { r32: -133, s16: +215, e8: +600, f4: +1929, f2: +14000, champ: +10977 } },
  { id: 7, name: "Saint Mary's", seed: 7, region: 'East', americanOdds: { r32: -171, s16: +300, e8: +680, f4: +1964, f2: +9900, champ: +12178 } },
  { id: 8, name: 'Mississippi State', seed: 8, region: 'East', americanOdds: { r32: -105, s16: +900, e8: +1750, f4: +3843, f2: +2300, champ: +20610 } },
  { id: 9, name: 'Baylor', seed: 9, region: 'East', americanOdds: { r32: +105, s16: +960, e8: +1700, f4: +3216, f2: +9000, champ: +18207 } },
  { id: 10, name: 'Vanderbilt', seed: 10, region: 'East', americanOdds: { r32: +171, s16: +770, e8: +1800, f4: +7454, f2: +40000, champ: +36173 } },
  { id: 11, name: 'VCU', seed: 11, region: 'East', americanOdds: { r32: +133, s16: +380, e8: +1060, f4: +3771, f2: +40000, champ: +20610 } },
  { id: 12, name: 'Liberty', seed: 12, region: 'East', americanOdds: { r32: +275, s16: +1220, e8: +10000, f4: +21215, f2: +50000, champ: +48087 } },
  { id: 13, name: 'Akron', seed: 13, region: 'East', americanOdds: { r32: +783, s16: +2100, e8: +25000, f4: +21215, f2: +50000, champ: +71809 } },
  { id: 14, name: 'Montana', seed: 14, region: 'East', americanOdds: { r32: +1256, s16: +10000, e8: +8000, f4: +21215, f2: +50000, champ: +95390 } },
  { id: 15, name: 'Robert Morris', seed: 15, region: 'East', americanOdds: { r32: +2389, s16: +15000, e8: +10000, f4: +21215, f2: +50000, champ: +118853 } },
  { id: 16, name: "American/Mount St. Mary's", seed: 16, region: 'East', americanOdds: { r32: +3752, s16: +8000, e8: +15000, f4: +26497, f2: +50000, champ: +118853 } },

  // ===== Midwest Region =====
  { id: 33, name: 'Houston', seed: 1, region: 'Midwest', americanOdds: { r32: -3752, s16: -310, e8: -144, f4: +153, f2: +317, champ: +645 } },
  { id: 34, name: 'SIU Edwardsville', seed: 16, region: 'Midwest', americanOdds: { r32: +3752, s16: +8000, e8: +15000, f4: +50080, f2: +50000, champ: +118853 } },
  { id: 35, name: 'Gonzaga', seed: 8, region: 'Midwest', americanOdds: { r32: -240, s16: +280, e8: +450, f4: +802, f2: +2300, champ: +4392 } },
  { id: 36, name: 'Georgia', seed: 9, region: 'Midwest', americanOdds: { r32: +240, s16: +1550, e8: +3400, f4: +8896, f2: +40000, champ: +24215 } },
  { id: 37, name: 'Clemson', seed: 5, region: 'Midwest', americanOdds: { r32: -278, s16: +118, e8: +620, f4: +1009, f2: +3900, champ: +7268 } },
  { id: 38, name: 'McNeese', seed: 12, region: 'Midwest', americanOdds: { r32: +278, s16: +720, e8: +3600, f4: +10192, f2: +40000, champ: +48087 } },
  { id: 39, name: 'Purdue', seed: 4, region: 'Midwest', americanOdds: { r32: -330, s16: +134, e8: +690, f4: +1057, f2: +6500, champ: +7950 } },
  { id: 40, name: 'High Point', seed: 13, region: 'Midwest', americanOdds: { r32: +330, s16: +1300, e8: +13000, f4: +15279, f2: +50000, champ: +71809 } },
  { id: 41, name: 'Illinois', seed: 6, region: 'Midwest', americanOdds: { r32: -133, s16: +144, e8: +390, f4: +1108, f2: +19000, champ: +6134 } },
  { id: 42, name: 'Texas/Xavier', seed: 11, region: 'Midwest', americanOdds: { r32: +144, s16: +1160, e8: +3100, f4: +7120, f2: +40000, champ: +48087 } },
  { id: 43, name: 'Kentucky', seed: 3, region: 'Midwest', americanOdds: { r32: -544, s16: +106, e8: +320, f4: +1000, f2: +2000, champ: +6134 } },
  { id: 44, name: 'Troy', seed: 14, region: 'Midwest', americanOdds: { r32: +544, s16: +2100, e8: +13000, f4: +25451, f2: +50000, champ: +95390 } },
  { id: 45, name: 'UCLA', seed: 7, region: 'Midwest', americanOdds: { r32: -200, s16: +290, e8: +720, f4: +2213, f2: +11000, champ: +12178 } },
  { id: 46, name: 'Utah State', seed: 10, region: 'Midwest', americanOdds: { r32: +200, s16: +1020, e8: +2900, f4: +10035, f2: +40000, champ: +48087 } },
  { id: 47, name: 'Tennessee', seed: 2, region: 'Midwest', americanOdds: { r32: -1553, s16: -260, e8: +124, f4: +341, f2: +880, champ: +2273 } },
  { id: 48, name: 'Wofford', seed: 15, region: 'Midwest', americanOdds: { r32: +1553, s16: +7500, e8: +10000, f4: +25451, f2: +50000, champ: +118853 } },

  // ===== South Region =====
  { id: 65, name: 'Florida', seed: 1, region: 'South', americanOdds: { r32: -3560, s16: -700, e8: -107, f4: -125, f2: +257, champ: +411 } },
  { id: 66, name: 'Norfolk St.', seed: 16, region: 'South', americanOdds: { r32: +3560, s16: +8000, e8: +34542, f4: +25000, f2: +50000, champ: +118853 } },
  { id: 67, name: 'Connecticut', seed: 8, region: 'South', americanOdds: { r32: -203, s16: +640, e8: +2590, f4: +2600, f2: +7500, champ: +10369 } },
  { id: 68, name: 'Oklahoma', seed: 9, region: 'South', americanOdds: { r32: +203, s16: +1480, e8: +9309, f4: +8000, f2: +10000, champ: +24215 } },
  { id: 69, name: 'Memphis', seed: 5, region: 'South', americanOdds: { r32: +113, s16: +500, e8: +5973, f4: +9000, f2: +12000, champ: +19940 } },
  { id: 70, name: 'Colorado State', seed: 12, region: 'South', americanOdds: { r32: -113, s16: +360, e8: +3810, f4: +6000, f2: +40000, champ: +16137 } },
  { id: 71, name: 'Maryland', seed: 4, region: 'South', americanOdds: { r32: -461, s16: -168, e8: +1048, f4: +1000, f2: +7200, champ: +4833 } },
  { id: 72, name: 'Grand Canyon', seed: 13, region: 'South', americanOdds: { r32: +461, s16: +1280, e8: +23104, f4: +25000, f2: +50000, champ: +71809 } },
  { id: 73, name: 'Missouri', seed: 6, region: 'South', americanOdds: { r32: -235, s16: +196, e8: +1775, f4: +1400, f2: +14000, champ: +9769 } },
  { id: 74, name: 'Drake', seed: 11, region: 'South', americanOdds: { r32: +235, s16: +1160, e8: +12987, f4: +15000, f2: +12000, champ: +48087 } },
  { id: 75, name: 'Texas Tech', seed: 3, region: 'South', americanOdds: { r32: -1049, s16: -174, e8: +520, f4: +550, f2: +2000, champ: +2830 } },
  { id: 76, name: 'UNCW', seed: 14, region: 'South', americanOdds: { r32: +1049, s16: +3800, e8: +23104, f4: +25000, f2: +50000, champ: +95390 } },
  { id: 77, name: 'Kansas', seed: 7, region: 'South', americanOdds: { r32: -187, s16: +205, e8: +1661, f4: +1400, f2: +8200, champ: +7349 } },
  { id: 78, name: 'Arkansas', seed: 10, region: 'South', americanOdds: { r32: +187, s16: +630, e8: +7458, f4: +6000, f2: +40000, champ: +24215 } },
  { id: 79, name: "Saint John's", seed: 2, region: 'South', americanOdds: { r32: -1548, s16: -152, e8: +616, f4: +650, f2: +860, champ: +2247 } },
  { id: 80, name: 'Omaha', seed: 15, region: 'South', americanOdds: { r32: +1548, s16: +13000, e8: +23104, f4: +25000, f2: +50000, champ: +118853 } },

  // ===== West Region =====
  { id: 49, name: 'Auburn', seed: 1, region: 'West', americanOdds: { r32: -3752, s16: -430, e8: +112, f4: +100, f2: +257, champ: +491 } },
  { id: 50, name: 'Alabama State/St. Francis (PA)', seed: 16, region: 'West', americanOdds: { r32: +3752, s16: +15000, e8: +31074, f4: +25000, f2: +50000, champ: +118853 } },
  { id: 51, name: 'Louisville', seed: 8, region: 'West', americanOdds: { r32: -135, s16: +540, e8: +1905, f4: +1800, f2: +7600, champ: +10977 } },
  { id: 52, name: 'Creighton', seed: 9, region: 'West', americanOdds: { r32: +135, s16: +840, e8: +3126, f4: +3100, f2: +30000, champ: +18207 } },
  { id: 53, name: 'Michigan', seed: 5, region: 'West', americanOdds: { r32: -133, s16: +210, e8: +2086, f4: +2200, f2: +30000, champ: +14433 } },
  { id: 54, name: 'UC San Diego', seed: 12, region: 'West', americanOdds: { r32: +133, s16: +390, e8: +5130, f4: +5000, f2: +30000, champ: +48087 } },
  { id: 55, name: 'Texas A&M', seed: 4, region: 'West', americanOdds: { r32: -273, s16: +118, e8: +1213, f4: +1300, f2: +3000, champ: +9030 } },
  { id: 56, name: 'Yale', seed: 13, region: 'West', americanOdds: { r32: +273, s16: +920, e8: +10386, f4: +18000, f2: +50000, champ: +59970 } },
  { id: 57, name: 'Ole Miss', seed: 6, region: 'West', americanOdds: { r32: +113, s16: +280, e8: +2295, f4: +2100, f2: +12500, champ: +12178 } },
  { id: 58, name: 'San Diego State/UNC', seed: 11, region: 'West', americanOdds: { r32: -113, s16: +1900, e8: +12458, f4: +18000, f2: +50000, champ: +48087 } },
  { id: 59, name: 'Iowa State', seed: 3, region: 'West', americanOdds: { r32: -919, s16: -160, e8: +646, f4: +550, f2: +1750, champ: +3206 } },
  { id: 60, name: 'Lipscomb', seed: 14, region: 'West', americanOdds: { r32: +919, s16: +3400, e8: +20735, f4: +25000, f2: +50000, champ: +71809 } },
  { id: 61, name: 'Marquette', seed: 7, region: 'West', americanOdds: { r32: -153, s16: +290, e8: +2502, f4: +2200, f2: +4000, champ: +19540 } },
  { id: 62, name: 'New Mexico', seed: 10, region: 'West', americanOdds: { r32: +153, s16: +660, e8: +5934, f4: +7500, f2: +40000, champ: +18903 } },
  { id: 63, name: 'Michigan State', seed: 2, region: 'West', americanOdds: { r32: -1244, s16: -210, e8: +343, f4: +480, f2: +860, champ: +2645 } },
  { id: 64, name: 'Bryant', seed: 15, region: 'West', americanOdds: { r32: +1244, s16: +9000, e8: +25907, f4: +25000, f2: +50000, champ: +95390 } },
];
