'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { broadcastToChannel } from '@/lib/supabase/broadcast';
import { getTournament } from '@/lib/tournaments/registry';
import type { PayoutRules } from '@/lib/tournaments/types';
import type { SessionSettings } from '@/lib/auction/live/types';

// 6-char code using unambiguous characters (no I/O/1/0)
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createSession(input: {
  tournamentId: string;
  name: string;
  payoutRules: PayoutRules;
  estimatedPotSize: number;
  settings?: SessionSettings;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const tournament = getTournament(input.tournamentId);
  if (!tournament) return { error: 'Invalid tournament' };

  // Generate unique join code (retry on collision)
  const admin = createAdminClient();
  let joinCode = generateJoinCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const { data: existing } = await admin
      .from('auction_sessions')
      .select('id')
      .eq('join_code', joinCode)
      .single();
    if (!existing) break;
    joinCode = generateJoinCode();
  }

  // Default team order: as listed in tournament config
  const teamOrder = tournament.teams.map((t) => t.id);

  const { data: session, error } = await supabase
    .from('auction_sessions')
    .insert({
      join_code: joinCode,
      tournament_id: input.tournamentId,
      commissioner_id: user.id,
      name: input.name,
      payout_rules: input.payoutRules,
      estimated_pot_size: input.estimatedPotSize,
      team_order: teamOrder,
      status: 'lobby',
      settings: input.settings ?? {},
    })
    .select('id, join_code')
    .single();

  if (error) return { error: error.message };

  // Add commissioner as first participant
  await supabase.from('auction_participants').insert({
    session_id: session.id,
    user_id: user.id,
    display_name: user.email?.split('@')[0] ?? 'Commissioner',
    is_commissioner: true,
  });

  return { sessionId: session.id, joinCode: session.join_code };
}

export async function joinSession(joinCode: string, displayName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!displayName.trim()) return { error: 'Display name is required' };

  // Case-insensitive join code lookup
  const { data: session, error: lookupError } = await supabase
    .from('auction_sessions')
    .select('id, status, name')
    .eq('join_code', joinCode.toUpperCase().trim())
    .single();

  if (lookupError || !session) return { error: 'Invalid join code' };
  if (session.status === 'completed') return { error: 'This auction has ended' };

  // Check if already joined
  const { data: existing } = await supabase
    .from('auction_participants')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return { sessionId: session.id, name: session.name };
  }

  const { error: joinError } = await supabase
    .from('auction_participants')
    .insert({
      session_id: session.id,
      user_id: user.id,
      display_name: displayName.trim(),
      is_commissioner: false,
    });

  if (joinError) return { error: joinError.message };
  return { sessionId: session.id, name: session.name };
}

export async function getSessionState(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Load session
  const { data: session, error } = await supabase
    .from('auction_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) return { error: 'Session not found' };

  // Load participants
  const { data: participants } = await supabase
    .from('auction_participants')
    .select('id, user_id, display_name, is_commissioner, joined_at')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });

  // Load winning bids (sold teams)
  const { data: winningBids } = await supabase
    .from('auction_bids')
    .select('team_id, bidder_id, amount, created_at')
    .eq('session_id', sessionId)
    .eq('is_winning_bid', true)
    .order('created_at', { ascending: true });

  // Load current team's bid history
  const currentTeamId = session.team_order?.[session.current_team_idx];
  let currentBids: Array<{
    bidder_id: string;
    amount: number;
    created_at: string;
  }> = [];
  if (currentTeamId != null && session.status === 'active') {
    const { data } = await supabase
      .from('auction_bids')
      .select('bidder_id, amount, created_at')
      .eq('session_id', sessionId)
      .eq('team_id', currentTeamId)
      .order('created_at', { ascending: true });
    currentBids = data ?? [];
  }

  const isCommissioner = session.commissioner_id === user.id;

  // Load tournament results (for post-auction tournament lifecycle)
  const { data: tournamentResults } = await supabase
    .from('tournament_results')
    .select('team_id, round_key, result')
    .eq('session_id', sessionId);

  // Check payment status for strategy overlay
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single();

  // Build display name lookup for bid history
  const participantMap: Record<string, string> = {};
  for (const p of participants ?? []) {
    participantMap[p.user_id] = p.display_name;
  }

  return {
    session,
    participants: participants ?? [],
    participantMap,
    winningBids: winningBids ?? [],
    currentBids,
    tournamentResults: (tournamentResults ?? []) as Array<{
      team_id: number;
      round_key: string;
      result: 'won' | 'lost' | 'pending';
    }>,
    isCommissioner,
    hasPaid: profile?.has_paid ?? false,
    userId: user.id,
  };
}

export async function updateTeamOrder(
  sessionId: string,
  teamOrder: number[]
) {
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

  if (!session || session.commissioner_id !== user.id) {
    return { error: 'Not authorized' };
  }
  if (session.status !== 'lobby') {
    return { error: 'Can only reorder teams before auction starts' };
  }

  const { error } = await supabase
    .from('auction_sessions')
    .update({ team_order: teamOrder })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  // Broadcast to connected clients
  await broadcastToChannel(`auction:${sessionId}`, 'TEAM_ORDER_UPDATED', {
    teamOrder,
  });

  return { success: true };
}

export async function getMyHostedSessions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { sessions: [], joined: [] };

  // Sessions I created
  const { data: hosted } = await supabase
    .from('auction_sessions')
    .select('id, name, join_code, status, tournament_id, created_at')
    .eq('commissioner_id', user.id)
    .order('created_at', { ascending: false });

  // Sessions I joined (not as commissioner)
  const { data: participations } = await supabase
    .from('auction_participants')
    .select('session_id')
    .eq('user_id', user.id)
    .eq('is_commissioner', false);

  let joined: typeof hosted = [];
  if (participations && participations.length > 0) {
    const sessionIds = participations.map((p) => p.session_id);
    const { data } = await supabase
      .from('auction_sessions')
      .select('id, name, join_code, status, tournament_id, created_at')
      .in('id', sessionIds)
      .order('created_at', { ascending: false });
    joined = data ?? [];
  }

  return { sessions: hosted ?? [], joined: joined ?? [] };
}
