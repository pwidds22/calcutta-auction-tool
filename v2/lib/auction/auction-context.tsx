'use client';

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import {
  auctionReducer,
  INITIAL_STATE,
  getFilteredTeams,
  getSummaryStats,
  getEffectivePotSize,
  type AuctionState,
  type AuctionAction,
  type SummaryStats,
} from './auction-state';
import type { Team, TournamentConfig } from '@/lib/calculations/types';

interface AuctionContextValue {
  state: AuctionState;
  dispatch: Dispatch<AuctionAction>;
  filteredTeams: Team[];
  summaryStats: SummaryStats;
  effectivePotSize: number;
  config: TournamentConfig | null;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(auctionReducer, INITIAL_STATE);

  const filteredTeams = useMemo(() => getFilteredTeams(state), [
    state.teams,
    state.groupFilter,
    state.statusFilter,
    state.sortOption,
    state.sortDirection,
    state.searchTerm,
  ]);

  const summaryStats = useMemo(() => getSummaryStats(state), [
    state.teams,
    state.projectedPotSize,
    state.estimatedPotSize,
  ]);

  const effectivePotSize = useMemo(() => getEffectivePotSize(state), [
    state.projectedPotSize,
    state.estimatedPotSize,
  ]);

  const value = useMemo(
    () => ({ state, dispatch, filteredTeams, summaryStats, effectivePotSize, config: state.config }),
    [state, filteredTeams, summaryStats, effectivePotSize]
  );

  return (
    <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
  );
}

export function useAuction(): AuctionContextValue {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}
