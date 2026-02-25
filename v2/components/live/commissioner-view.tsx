'use client';

import { useCallback, useEffect } from 'react';
import { useAuctionChannel } from '@/lib/auction/live/use-auction-channel';
import { useTimer } from '@/lib/auction/live/use-timer';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { BidEntry, SoldTeam } from '@/lib/auction/live/use-auction-channel';
import type { SessionSettings } from '@/lib/auction/live/types';
import { updateTeamOrder } from '@/actions/session';
import { AuctionStatusBar } from './auction-status-bar';
import { TeamSpotlight } from './team-spotlight';
import { BiddingControls } from './bidding-controls';
import { BidPanel } from './bid-panel';
import { BidLadder } from './bid-ladder';
import { TeamQueue } from './team-queue';
import { ParticipantList } from './participant-list';
import { MyPortfolio } from './my-portfolio';
import { ResultsTable } from './results-table';
import { StrategyOverlay } from './strategy-overlay';
import { TimerDisplay } from './timer-display';
import { closeBidding } from '@/actions/bidding';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    settings: SessionSettings;
    timer_ends_at: string | null;
    timer_duration_ms: number | null;
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
      teamOrder: session.team_order,
    },
  });

  // Use dynamic team order from channel (updated via broadcast) or fallback to session
  const activeTeamOrder = channel.teamOrder ?? session.team_order;

  const teamMap = new Map(baseTeams.map((t) => [t.id, t]));
  const currentTeamId =
    channel.currentTeamIdx !== null
      ? activeTeamOrder[channel.currentTeamIdx]
      : null;

  // Fisher-Yates shuffle
  const handleShuffle = useCallback(async () => {
    const order = [...activeTeamOrder];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    await updateTeamOrder(session.id, order);
  }, [activeTeamOrder, session.id]);

  // Timer: commissioner auto-closes bidding on expiry
  const timer = useTimer({
    isCommissioner: true,
    onExpire: useCallback(() => {
      closeBidding(session.id);
    }, [session.id]),
  });

  // Initialize timer from DB state on mount (for page refresh)
  useEffect(() => {
    if (session.timer_ends_at && session.timer_duration_ms && new Date(session.timer_ends_at) > new Date()) {
      timer.start(session.timer_ends_at, session.timer_duration_ms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync timer state from channel broadcasts
  useEffect(() => {
    if (channel.timerIsRunning && channel.timerEndsAt) {
      timer.start(channel.timerEndsAt, channel.timerDurationMs);
    } else if (!channel.timerIsRunning) {
      timer.stop();
    }
  }, [channel.timerIsRunning, channel.timerEndsAt, channel.timerDurationMs]);

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
          {channel.auctionStatus === 'lobby' && (
            <Button
              onClick={handleShuffle}
              variant="outline"
              className="mb-2 w-full gap-2 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
            >
              <Shuffle className="size-3.5" />
              Shuffle Team Order
            </Button>
          )}
          <TeamQueue
            sessionId={session.id}
            teamOrder={activeTeamOrder}
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
            totalTeams={activeTeamOrder.length}
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

          <TimerDisplay timer={timer.state} />

          <BiddingControls
            sessionId={session.id}
            auctionStatus={channel.auctionStatus}
            biddingStatus={channel.biddingStatus}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
            hasSoldTeams={channel.soldTeams.length > 0}
            currentTeamIdx={channel.currentTeamIdx}
            timerIsRunning={timer.state.isRunning}
          />

          {/* Commissioner can bid too */}
          <BidPanel
            sessionId={session.id}
            biddingStatus={channel.biddingStatus}
            currentHighestBid={channel.currentHighestBid}
            currentHighestBidderName={channel.currentHighestBidderName}
            userId={userId}
            bidIncrements={session.settings?.bidIncrements}
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
