'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { broadcastToChannel } from '@/lib/supabase/broadcast';

function channelName(sessionId: string) {
  return `auction:${sessionId}`;
}

export async function startAuction(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, status, team_order')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.status !== 'lobby' && session.status !== 'paused')
    return { error: 'Cannot start auction in current state' };
  if (!session.team_order?.length) return { error: 'No teams in order' };

  const { error } = await supabase
    .from('auction_sessions')
    .update({
      status: 'active',
      current_team_idx: 0,
      bidding_status: 'waiting',
      current_highest_bid: 0,
      current_highest_bidder_id: null,
    })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  await broadcastToChannel(channelName(sessionId), 'AUCTION_STARTED', {
    currentTeamIdx: 0,
    teamId: session.team_order[0],
  });

  return { success: true };
}

export async function presentTeam(sessionId: string, teamIdx: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, status, team_order')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.status !== 'active') return { error: 'Auction not active' };
  if (teamIdx < 0 || teamIdx >= session.team_order.length)
    return { error: 'Invalid team index' };

  const { error } = await supabase
    .from('auction_sessions')
    .update({
      current_team_idx: teamIdx,
      bidding_status: 'waiting',
      current_highest_bid: 0,
      current_highest_bidder_id: null,
    })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  await broadcastToChannel(channelName(sessionId), 'TEAM_PRESENTED', {
    teamIdx,
    teamId: session.team_order[teamIdx],
  });

  return { success: true };
}

export async function openBidding(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, status, bidding_status')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.status !== 'active') return { error: 'Auction not active' };
  if (session.bidding_status !== 'waiting')
    return { error: 'Bidding already open or closed' };

  const { error } = await supabase
    .from('auction_sessions')
    .update({ bidding_status: 'open' })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  await broadcastToChannel(channelName(sessionId), 'BIDDING_OPEN', {});

  return { success: true };
}

export async function placeBid(sessionId: string, amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Validate participant
  const { data: participant } = await supabase
    .from('auction_participants')
    .select('id, display_name')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!participant) return { error: 'Not a participant in this session' };

  // Validate session state
  const { data: session } = await supabase
    .from('auction_sessions')
    .select(
      'status, bidding_status, current_highest_bid, team_order, current_team_idx'
    )
    .eq('id', sessionId)
    .single();

  if (!session) return { error: 'Session not found' };
  if (session.status !== 'active') return { error: 'Auction not active' };
  if (session.bidding_status !== 'open')
    return { error: 'Bidding is not open' };
  if (amount <= 0) return { error: 'Bid must be positive' };
  if (amount <= (session.current_highest_bid ?? 0)) {
    return {
      error: `Bid must be higher than $${session.current_highest_bid}`,
    };
  }

  const teamId = session.team_order[session.current_team_idx];
  const admin = createAdminClient();

  // Atomic conditional update (handles race conditions)
  const { error: updateError } = await admin
    .from('auction_sessions')
    .update({
      current_highest_bid: amount,
      current_highest_bidder_id: user.id,
    })
    .eq('id', sessionId)
    .eq('bidding_status', 'open')
    .lt('current_highest_bid', amount);

  if (updateError) return { error: updateError.message };

  // Insert bid record
  await admin.from('auction_bids').insert({
    session_id: sessionId,
    team_id: teamId,
    bidder_id: user.id,
    amount,
    is_winning_bid: false,
  });

  await broadcastToChannel(channelName(sessionId), 'NEW_BID', {
    teamId,
    bidderId: user.id,
    bidderName: participant.display_name,
    amount,
  });

  return { success: true };
}

export async function closeBidding(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, bidding_status')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.bidding_status !== 'open')
    return { error: 'Bidding is not open' };

  const { error } = await supabase
    .from('auction_sessions')
    .update({ bidding_status: 'closed' })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  await broadcastToChannel(channelName(sessionId), 'BIDDING_CLOSED', {});

  return { success: true };
}

export async function sellTeam(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.bidding_status !== 'closed')
    return { error: 'Close bidding first' };
  if (
    !session.current_highest_bidder_id ||
    session.current_highest_bid <= 0
  ) {
    return { error: 'No bids placed' };
  }

  const teamId = session.team_order[session.current_team_idx];
  const winnerId = session.current_highest_bidder_id;
  const winAmount = session.current_highest_bid;

  const admin = createAdminClient();

  // 1. Mark winning bid
  await admin
    .from('auction_bids')
    .update({ is_winning_bid: true })
    .eq('session_id', sessionId)
    .eq('team_id', teamId)
    .eq('bidder_id', winnerId)
    .eq('amount', winAmount);

  // 2. Get winner's display name
  const { data: winnerParticipant } = await admin
    .from('auction_participants')
    .select('display_name')
    .eq('session_id', sessionId)
    .eq('user_id', winnerId)
    .single();

  // 3. Auto-sync: update paid participants' auction_data
  await syncAuctionData(
    admin,
    sessionId,
    session.tournament_id,
    teamId,
    winnerId,
    winAmount
  );

  // 4. Advance to next team
  const nextIdx = session.current_team_idx + 1;
  const isLastTeam = nextIdx >= session.team_order.length;

  await admin
    .from('auction_sessions')
    .update({
      current_team_idx: isLastTeam ? session.current_team_idx : nextIdx,
      bidding_status: 'waiting',
      current_highest_bid: 0,
      current_highest_bidder_id: null,
      ...(isLastTeam ? { status: 'completed' } : {}),
    })
    .eq('id', sessionId);

  // 5. Broadcast
  await broadcastToChannel(channelName(sessionId), 'TEAM_SOLD', {
    teamId,
    winnerId,
    winnerName: winnerParticipant?.display_name ?? 'Unknown',
    amount: winAmount,
    nextTeamIdx: isLastTeam ? null : nextIdx,
    isComplete: isLastTeam,
  });

  if (isLastTeam) {
    await broadcastToChannel(
      channelName(sessionId),
      'AUCTION_COMPLETED',
      {}
    );
  }

  return { success: true, isComplete: isLastTeam };
}

/** Update each paid participant's auction_data with the sale result */
async function syncAuctionData(
  admin: ReturnType<typeof createAdminClient>,
  sessionId: string,
  tournamentId: string,
  teamId: number,
  winnerId: string,
  winAmount: number
) {
  const { data: participants } = await admin
    .from('auction_participants')
    .select('user_id')
    .eq('session_id', sessionId);

  if (!participants?.length) return;

  const userIds = participants.map((p) => p.user_id);
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, has_paid')
    .in('id', userIds);

  const paidUsers = profiles?.filter((p) => p.has_paid).map((p) => p.id) ?? [];

  for (const userId of paidUsers) {
    const isWinner = userId === winnerId;

    const { data: existing } = await admin
      .from('auction_data')
      .select('teams')
      .eq('user_id', userId)
      .eq('event_type', tournamentId)
      .single();

    const existingTeams: Array<{
      id: number;
      purchasePrice: number;
      isMyTeam: boolean;
    }> =
      (existing?.teams as Array<{
        id: number;
        purchasePrice: number;
        isMyTeam: boolean;
      }>) ?? [];

    const teamIdx = existingTeams.findIndex((t) => t.id === teamId);
    const teamEntry = {
      id: teamId,
      purchasePrice: winAmount,
      isMyTeam: isWinner,
    };

    if (teamIdx >= 0) {
      existingTeams[teamIdx] = teamEntry;
    } else {
      existingTeams.push(teamEntry);
    }

    await admin.from('auction_data').upsert(
      {
        user_id: userId,
        event_type: tournamentId,
        teams: existingTeams,
      },
      { onConflict: 'user_id,event_type' }
    );
  }
}

export async function skipTeam(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, status, team_order, current_team_idx')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };

  const teamId = session.team_order[session.current_team_idx];
  const nextIdx = session.current_team_idx + 1;
  const isLastTeam = nextIdx >= session.team_order.length;

  await supabase
    .from('auction_sessions')
    .update({
      current_team_idx: isLastTeam ? session.current_team_idx : nextIdx,
      bidding_status: 'waiting',
      current_highest_bid: 0,
      current_highest_bidder_id: null,
    })
    .eq('id', sessionId);

  await broadcastToChannel(channelName(sessionId), 'TEAM_SKIPPED', {
    teamId,
    nextTeamIdx: isLastTeam ? null : nextIdx,
  });

  return { success: true };
}

export async function undoLastSale(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, team_order, current_team_idx')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };

  const admin = createAdminClient();

  // Find most recent winning bid
  const { data: lastSale } = await admin
    .from('auction_bids')
    .select('id, team_id, bidder_id, amount')
    .eq('session_id', sessionId)
    .eq('is_winning_bid', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastSale) return { error: 'No sales to undo' };

  // Unmark winning bid and delete all bids for that team
  await admin
    .from('auction_bids')
    .delete()
    .eq('session_id', sessionId)
    .eq('team_id', lastSale.team_id);

  // Move back to that team
  const teamIdx = session.team_order.indexOf(lastSale.team_id);
  await admin
    .from('auction_sessions')
    .update({
      current_team_idx: teamIdx >= 0 ? teamIdx : session.current_team_idx - 1,
      bidding_status: 'waiting',
      current_highest_bid: 0,
      current_highest_bidder_id: null,
      status: 'active',
    })
    .eq('id', sessionId);

  await broadcastToChannel(channelName(sessionId), 'SALE_UNDONE', {
    teamId: lastSale.team_id,
    teamIdx: teamIdx >= 0 ? teamIdx : session.current_team_idx - 1,
  });

  return { success: true };
}

export async function pauseAuction(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id, status')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };
  if (session.status !== 'active') return { error: 'Auction not active' };

  await supabase
    .from('auction_sessions')
    .update({ status: 'paused', bidding_status: 'waiting' })
    .eq('id', sessionId);

  await broadcastToChannel(channelName(sessionId), 'AUCTION_PAUSED', {});

  return { success: true };
}

export async function completeAuction(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id)
    return { error: 'Not authorized' };

  await supabase
    .from('auction_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId);

  await broadcastToChannel(
    channelName(sessionId),
    'AUCTION_COMPLETED',
    {}
  );

  return { success: true };
}
