'use client';

import { useCallback } from 'react';
import { useAuction } from '@/lib/auction/auction-context';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TeamTableRow } from './team-table-row';
import { ArrowUpDown } from 'lucide-react';
import type { GroupFilter, StatusFilter, SortOption } from '@/lib/calculations/types';

const STATUSES: StatusFilter[] = ['All', 'Available', 'Taken', 'My Teams'];

export function TeamTable() {
  const { state, dispatch, filteredTeams, effectivePotSize, config } = useAuction();

  const groups: GroupFilter[] = config
    ? ['All', ...config.groups.map((g) => g.key)]
    : ['All'];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'seed', label: 'Seed' },
    { value: 'name', label: 'Name' },
    { value: 'valuePercentage', label: 'Value' },
    { value: 'group', label: config?.groupLabel ?? 'Group' },
  ];

  const handlePriceChange = useCallback(
    (teamId: number, price: number) => {
      dispatch({ type: 'UPDATE_PURCHASE_PRICE', teamId, price });
    },
    [dispatch]
  );

  const handleMyTeamToggle = useCallback(
    (teamId: number, isMyTeam: boolean) => {
      dispatch({ type: 'TOGGLE_MY_TEAM', teamId, isMyTeam });
    },
    [dispatch]
  );

  const toggleSortDirection = () => {
    dispatch({
      type: 'SET_SORT',
      option: state.sortOption,
      direction: state.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  };

  const rounds = config?.rounds ?? [];

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={state.groupFilter}
          onValueChange={(v) =>
            dispatch({ type: 'SET_GROUP_FILTER', filter: v as GroupFilter })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={config?.groupLabel ?? 'Group'} />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={state.statusFilter}
          onValueChange={(v) =>
            dispatch({ type: 'SET_STATUS_FILTER', filter: v as StatusFilter })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={state.sortOption}
          onValueChange={(v) =>
            dispatch({
              type: 'SET_SORT',
              option: v as SortOption,
              direction: state.sortDirection,
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={toggleSortDirection} className="h-9 w-9">
          <ArrowUpDown className="h-4 w-4" />
        </Button>

        <Input
          type="text"
          placeholder={`Search ${config?.teamLabel?.toLowerCase() ?? 'team'}s...`}
          value={state.searchTerm}
          onChange={(e) =>
            dispatch({ type: 'SET_SEARCH_TERM', term: e.target.value })
          }
          className="w-[180px]"
        />

        <span className="ml-auto text-xs text-muted-foreground">
          {filteredTeams.length} {config?.teamLabel?.toLowerCase() ?? 'team'}s
        </span>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {/* Group headers */}
            <TableRow className="bg-muted/50">
              <TableHead colSpan={3} className="text-center text-xs font-semibold">
                {config?.teamLabel ?? 'Team'} Info
              </TableHead>
              <TableHead colSpan={rounds.length} className="text-center text-xs font-semibold">
                Profit After Reaching Round
              </TableHead>
              <TableHead colSpan={3} className="text-center text-xs font-semibold">
                Value Info
              </TableHead>
              <TableHead rowSpan={2} className="text-center text-xs font-semibold align-middle">
                Mine
              </TableHead>
            </TableRow>
            {/* Column headers */}
            <TableRow>
              <TableHead className="px-2 text-xs w-12">Seed</TableHead>
              <TableHead className="px-2 text-xs">{config?.teamLabel ?? 'Team'}</TableHead>
              <TableHead className="px-2 text-xs w-16">{config?.groupLabel ?? 'Group'}</TableHead>
              {rounds.map((round) => (
                <TableHead key={round.key} className="px-2 text-center text-xs">
                  {round.label}
                </TableHead>
              ))}
              <TableHead className="px-2 text-right text-xs">Bid</TableHead>
              <TableHead className="px-2 text-right text-xs">Fair Val</TableHead>
              <TableHead className="px-2 text-right text-xs w-24">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TeamTableRow
                key={team.id}
                team={team}
                payoutRules={state.payoutRules}
                potSize={effectivePotSize}
                onPriceChange={handlePriceChange}
                onMyTeamToggle={handleMyTeamToggle}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
