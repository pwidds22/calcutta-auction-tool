'use client';

import { useAuctionChannel } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { BidEntry, SoldTeam } from '@/lib/auction/live/use-auction-channel';
import { AuctionStatusBar } from './auction-status-bar';
import { TeamSpotlight } from './team-spotlight';
import { BidPanel } from './bid-panel';
import { BidLadder } from './bid-ladder';
import { ParticipantList } from './participant-list';
import { ResultsTable } from './results-table';
import { MyPortfolio } from './my-portfolio';
import { StrategyOverlay } from './strategy-overlay';

interface ParticipantViewProps {
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

export function ParticipantView({
  session,
  participants,
  participantMap,
  winningBids,
  currentBids,
  config,
  baseTeams,
  userId,
  hasPaid,
}: ParticipantViewProps) {
  const myParticipant = participants.find((p) => p.user_id === userId);

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

  const currentHighestBidderName = session.current_highest_bidder_id
    ? (participantMap[session.current_highest_bidder_id] ?? null)
    : null;

  const channel = useAuctionChannel({
    sessionId: session.id,
    userId,
    displayName: myParticipant?.display_name ?? 'Participant',
    isCommissioner: false,
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

  if (channel.auctionStatus === 'lobby') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-4 space-y-4">
        <AuctionStatusBar
          sessionName={session.name}
          joinCode={session.join_code}
          isConnected={channel.isConnected}
          onlineCount={channel.onlineUsers.length}
          auctionStatus={channel.auctionStatus}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-16">
          <p className="text-lg font-medium text-white/60">
            Waiting for the commissioner to start...
          </p>
          <p className="mt-2 text-sm text-white/30">
            {channel.onlineUsers.length} participant{channel.onlineUsers.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <ParticipantList onlineUsers={channel.onlineUsers} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 space-y-4">
      <AuctionStatusBar
        sessionName={session.name}
        joinCode={session.join_code}
        isConnected={channel.isConnected}
        onlineCount={channel.onlineUsers.length}
        auctionStatus={channel.auctionStatus}
      />

      {!channel.isConnected && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-center text-sm text-red-400">
          Reconnecting...
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Main area */}
        <div className="col-span-12 space-y-4 lg:col-span-8">
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

          <BidPanel
            sessionId={session.id}
            biddingStatus={channel.biddingStatus}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
            userId={userId}
          />

          <BidLadder
            bids={channel.bidHistory}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
          />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <ParticipantList onlineUsers={channel.onlineUsers} />
          <MyPortfolio
            soldTeams={channel.soldTeams}
            baseTeams={baseTeams}
            userId={userId}
          />
          <ResultsTable
            soldTeams={channel.soldTeams}
            baseTeams={baseTeams}
          />
        </div>
      </div>
    </div>
  );
}
