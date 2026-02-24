import type {
  Team,
  PayoutRules,
  RegionFilter,
  StatusFilter,
  SortOption,
  SortDirection,
  SavedTeamData,
} from '@/lib/calculations/types';
import { DEFAULT_PAYOUT_RULES } from '@/lib/calculations/types';
import { calculateTeamValues } from '@/lib/calculations/values';
import { calculateProjectedPotSize } from '@/lib/calculations/pot';

// ─── State ───────────────────────────────────────────────────────────

export interface AuctionState {
  teams: Team[];
  payoutRules: PayoutRules;
  estimatedPotSize: number;
  projectedPotSize: number;
  regionFilter: RegionFilter;
  statusFilter: StatusFilter;
  sortOption: SortOption;
  sortDirection: SortDirection;
  searchTerm: string;
  isDirty: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
}

export const INITIAL_STATE: AuctionState = {
  teams: [],
  payoutRules: DEFAULT_PAYOUT_RULES,
  estimatedPotSize: 10000,
  projectedPotSize: 0,
  regionFilter: 'All',
  statusFilter: 'All',
  sortOption: 'seed',
  sortDirection: 'asc',
  searchTerm: '',
  isDirty: false,
  isLoading: true,
  lastSaved: null,
};

// ─── Actions ─────────────────────────────────────────────────────────

export type AuctionAction =
  | { type: 'SET_INITIAL_DATA'; teams: Team[]; payoutRules: PayoutRules; estimatedPotSize: number }
  | { type: 'UPDATE_PURCHASE_PRICE'; teamId: number; price: number }
  | { type: 'TOGGLE_MY_TEAM'; teamId: number; isMyTeam: boolean }
  | { type: 'UPDATE_PAYOUT_RULES'; payoutRules: PayoutRules }
  | { type: 'UPDATE_ESTIMATED_POT_SIZE'; potSize: number }
  | { type: 'SET_REGION_FILTER'; filter: RegionFilter }
  | { type: 'SET_STATUS_FILTER'; filter: StatusFilter }
  | { type: 'SET_SORT'; option: SortOption; direction: SortDirection }
  | { type: 'SET_SEARCH_TERM'; term: string }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_AUCTION' };

// ─── Helpers ─────────────────────────────────────────────────────────

function recalculateValues(state: AuctionState): AuctionState {
  const potSize =
    state.projectedPotSize > 0 ? state.projectedPotSize : state.estimatedPotSize;
  calculateTeamValues(state.teams, state.payoutRules, potSize);
  return state;
}

function recalculateProjectedPot(state: AuctionState): AuctionState {
  state.projectedPotSize = calculateProjectedPotSize(state.teams);
  return state;
}

// ─── Reducer ─────────────────────────────────────────────────────────

export function auctionReducer(
  state: AuctionState,
  action: AuctionAction
): AuctionState {
  switch (action.type) {
    case 'SET_INITIAL_DATA': {
      const newState: AuctionState = {
        ...state,
        teams: action.teams,
        payoutRules: action.payoutRules,
        estimatedPotSize: action.estimatedPotSize,
        isLoading: false,
        isDirty: false,
      };
      recalculateProjectedPot(newState);
      recalculateValues(newState);
      return newState;
    }

    case 'UPDATE_PURCHASE_PRICE': {
      const teams = state.teams.map((t) => {
        if (t.id !== action.teamId) return t;
        return {
          ...t,
          purchasePrice: action.price,
          // Reset isMyTeam if price set to 0 (legacy lines 1461-1463)
          isMyTeam: action.price === 0 ? false : t.isMyTeam,
        };
      });
      const newState: AuctionState = { ...state, teams, isDirty: true };
      recalculateProjectedPot(newState);
      recalculateValues(newState);
      return newState;
    }

    case 'TOGGLE_MY_TEAM': {
      const teams = state.teams.map((t) =>
        t.id === action.teamId ? { ...t, isMyTeam: action.isMyTeam } : t
      );
      return { ...state, teams, isDirty: true };
    }

    case 'UPDATE_PAYOUT_RULES': {
      const newState: AuctionState = {
        ...state,
        payoutRules: action.payoutRules,
        isDirty: true,
      };
      recalculateValues(newState);
      return newState;
    }

    case 'UPDATE_ESTIMATED_POT_SIZE': {
      const newState: AuctionState = {
        ...state,
        estimatedPotSize: action.potSize,
        isDirty: true,
      };
      recalculateValues(newState);
      return newState;
    }

    case 'SET_REGION_FILTER':
      return { ...state, regionFilter: action.filter };

    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.filter };

    case 'SET_SORT':
      return { ...state, sortOption: action.option, sortDirection: action.direction };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.term };

    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSaved: new Date() };

    case 'RESET_AUCTION':
      return { ...INITIAL_STATE, isLoading: false };

    default:
      return state;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────

export function getEffectivePotSize(state: AuctionState): number {
  return state.projectedPotSize > 0 ? state.projectedPotSize : state.estimatedPotSize;
}

export function getFilteredTeams(state: AuctionState): Team[] {
  let filtered = [...state.teams];

  // Region filter
  if (state.regionFilter !== 'All') {
    filtered = filtered.filter((t) => t.region === state.regionFilter);
  }

  // Status filter
  if (state.statusFilter === 'Available') {
    filtered = filtered.filter((t) => t.purchasePrice === 0);
  } else if (state.statusFilter === 'Taken') {
    filtered = filtered.filter((t) => t.purchasePrice > 0);
  } else if (state.statusFilter === 'My Teams') {
    filtered = filtered.filter((t) => t.isMyTeam);
  }

  // Search filter
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.region.toLowerCase().includes(term) ||
        t.seed.toString().includes(term)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let result: number;
    switch (state.sortOption) {
      case 'name':
        result = a.name.localeCompare(b.name);
        break;
      case 'seed':
        result = a.seed - b.seed;
        if (result === 0) result = a.region.localeCompare(b.region);
        break;
      case 'valuePercentage':
        result = (a.valuePercentage || 0) - (b.valuePercentage || 0);
        break;
      case 'region':
        result = a.region.localeCompare(b.region);
        break;
      default:
        result = a.seed - b.seed;
    }
    return state.sortDirection === 'asc' ? result : -result;
  });

  return filtered;
}

export interface SummaryStats {
  myTeams: { count: number; totalPaid: number; projectedValue: number; expectedProfit: number; roi: number };
  opponents: { count: number; totalPaid: number; projectedValue: number; expectedProfit: number; roi: number };
  available: { count: number; projectedValue: number };
}

export function getSummaryStats(state: AuctionState): SummaryStats {
  const potSize = getEffectivePotSize(state);

  const myTeams = state.teams.filter((t) => t.isMyTeam);
  const opponents = state.teams.filter((t) => t.purchasePrice > 0 && !t.isMyTeam);
  const available = state.teams.filter((t) => t.purchasePrice === 0);

  const calcStats = (teams: Team[]) => {
    const totalPaid = teams.reduce((s, t) => s + t.purchasePrice, 0);
    const projectedValue = teams.reduce((s, t) => s + t.valuePercentage * potSize, 0);
    const expectedProfit = projectedValue - totalPaid;
    const roi = totalPaid > 0 ? (expectedProfit / totalPaid) * 100 : 0;
    return { count: teams.length, totalPaid, projectedValue, expectedProfit, roi };
  };

  return {
    myTeams: calcStats(myTeams),
    opponents: calcStats(opponents),
    available: {
      count: available.length,
      projectedValue: available.reduce((s, t) => s + t.valuePercentage * potSize, 0),
    },
  };
}

/** Extract minimal data for saving to Supabase */
export function getTeamsForSave(teams: Team[]): SavedTeamData[] {
  return teams
    .filter((t) => t.purchasePrice > 0 || t.isMyTeam)
    .map((t) => ({ id: t.id, purchasePrice: t.purchasePrice, isMyTeam: t.isMyTeam }));
}
