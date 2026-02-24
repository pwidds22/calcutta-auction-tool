'use client';

import { useAuctionChannel } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { BidEntry, SoldTeam } from '@/lib/auction/live/use-auction-channel';
import { AuctionStatusBar } from './auction-status-bar';
import { TeamSpotlight } from './team-spotlight';
import { BiddingControls } from './bidding-controls';
import { BidLadder } from './bid-ladder';
import { TeamQueue } from './team-queue';
import { ParticipantList } from './participant-list';
import { ResultsTable } from './results-table';
import { StrategyOverlay } from './strategy-overlay';

interface CommissionerViewProps {
  session: {
    id: string;
    name: string;
    join_code: string;
    status: string;
    team_order: number[];
    current_team_idx: number;
    bidding_status: string;
    current_highest_bid: number;
    current_highest_bidder_id: string | null;
    payout_rules: PayoutRules;
    estimated_pot_size: number;
    tournament_id: string;
  };
  participants: Array<{
    user_id: string;
    display_name: string;
    is_commissioner: boolean;
  }>;
  participantMap: Record<string, string>;
  winningBids: Array<{
    team_id: number;
    bidder_id: string;
    amount: number;
  }>;
  currentBids: Array<{
    bidder_id: string;
    amount: number;
    created_at: string;
  }>;
  config: TournamentConfig;
  baseTeams: BaseTeam[];
  userId: string;
  hasPaid: boolean;
}

export function CommissionerView({
  session,
  participants,
  participantMap,
  winningBids,
  currentBids,
  config,
  baseTeams,
  userId,
  hasPaid,
}: CommissionerViewProps) {
  const myParticipant = participants.find((p) => p.user_id === userId);

  // Build initial state from server data
  const initialSoldTeams: SoldTeam[] = winningBids.map((wb) => ({
    teamId: wb.team_id,
    winnerId: wb.bidder_id,
    winnerName: participantMap[wb.bidder_id] ?? 'Unknown',
    amount: wb.amount,
  }));

  const initialBidHistory: BidEntry[] = currentBids.map((b) => ({
    bidderId: b.bidder_id,
    bidderName: participantMap[b.bidder_id] ?? 'Unknown',
    amount: b.amount,
    timestamp: b.created_at,
  }));

  // Get current highest bidder name from initial data
  const currentHighestBidderName = session.current_highest_bidder_id
    ? (participantMap[session.current_highest_bidder_id] ?? null)
    : null;

  const channel = useAuctionChannel({
    sessionId: session.id,
    userId,
    displayName: myParticipant?.display_name ?? 'Commissioner',
    isCommissioner: true,
    initialState: {
      currentTeamIdx: session.current_team_idx,
      biddingStatus: session.bidding_status as 'waiting' | 'open' | 'closed',
      currentHighestBid: session.current_highest_bid,
      currentHighestBidderName,
      bidHistory: initialBidHistory,
      soldTeams: initialSoldTeams,
      auctionStatus: session.status,
    },
  });

  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));
  const currentTeamId =
    channel.currentTeamIdx !== null
      ? session.team_order[channel.currentTeamIdx]
      : null;
  const currentTeam = currentTeamId ? teamMap.get(currentTeamId) ?? null : null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 space-y-4">
      <AuctionStatusBar
        sessionName={session.name}
        joinCode={session.join_code}
        isConnected={channel.isConnected}
        onlineCount={channel.onlineUsers.length}
        auctionStatus={channel.auctionStatus}
      />

      {!channel.isConnected && channel.auctionStatus !== 'lobby' && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-center text-sm text-red-400">
          Reconnecting...
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Team Queue */}
        <div className="col-span-12 lg:col-span-3">
          <TeamQueue
            sessionId={session.id}
            teamOrder={session.team_order}
            baseTeams={baseTeams}
            soldTeams={channel.soldTeams}
            currentTeamIdx={channel.currentTeamIdx}
            auctionStatus={channel.auctionStatus}
          />
        </div>

        {/* Center: Auction area */}
        <div className="col-span-12 space-y-4 lg:col-span-6">
          <TeamSpotlight
            team={currentTeam}
            config={config}
            teamIndex={channel.currentTeamIdx ?? 0}
            totalTeams={session.team_order.length}
          />

          <StrategyOverlay
            hasPaid={hasPaid}
            currentTeamId={currentTeamId}
            currentHighestBid={channel.currentHighestBid}
            config={config}
            baseTeams={baseTeams}
            payoutRules={session.payout_rules}
            estimatedPotSize={session.estimated_pot_size}
            soldTeams={channel.soldTeams}
          />

          <BiddingControls
            sessionId={session.id}
            auctionStatus={channel.auctionStatus}
            biddingStatus={channel.biddingStatus}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
            hasSoldTeams={channel.soldTeams.length > 0}
            currentTeamIdx={channel.currentTeamIdx}
          />

          <BidLadder
            bids={channel.bidHistory}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
          />
        </div>

        {/* Right: Participants + Results */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          <ParticipantList onlineUsers={channel.onlineUsers} />
          <ResultsTable
            soldTeams={channel.soldTeams}
            baseTeams={baseTeams}
          />
        </div>
      </div>
    </div>
  );
}
