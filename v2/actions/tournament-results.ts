'use server';

import { createClient } from '@/lib/supabase/server';
import { broadcastToChannel } from '@/lib/supabase/broadcast';

export interface TournamentResult {
  team_id: number;
  round_key: string;
  result: 'won' | 'lost' | 'pending';
}

/**
 * Fetch all tournament results for a session.
 */
export async function getTournamentResults(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('tournament_results')
    .select('team_id, round_key, result')
    .eq('session_id', sessionId);

  if (error) return { error: error.message };
  return { results: (data ?? []) as TournamentResult[] };
}

/**
 * Commissioner upserts a single result (won/lost/pending).
 * Uses ON CONFLICT to handle both insert and update.
 */
export async function updateResult(
  sessionId: string,
  teamId: number,
  roundKey: string,
  result: 'won' | 'lost' | 'pending'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify user is commissioner
  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id) {
    return { error: 'Not authorized' };
  }

  // Upsert the result
  const { error } = await supabase.from('tournament_results').upsert(
    {
      session_id: sessionId,
      team_id: teamId,
      round_key: roundKey,
      result,
      entered_by: user.id,
      entered_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,team_id,round_key' }
  );

  if (error) return { error: error.message };

  // Update tournament status if needed
  if (result !== 'pending') {
    await supabase
      .from('auction_sessions')
      .update({ tournament_status: 'in_progress' })
      .eq('id', sessionId)
      .eq('tournament_status', 'pre_tournament');
  }

  // Broadcast to all connected participants
  await broadcastToChannel(`auction:${sessionId}`, 'RESULT_UPDATED', {
    teamId,
    roundKey,
    result,
  });

  return { success: true };
}

/**
 * Commissioner bulk-updates results for a round.
 * Used when marking multiple teams at once.
 */
export async function bulkUpdateResults(
  sessionId: string,
  updates: Array<{ teamId: number; roundKey: string; result: 'won' | 'lost' | 'pending' }>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify commissioner
  const { data: session } = await supabase
    .from('auction_sessions')
    .select('commissioner_id')
    .eq('id', sessionId)
    .single();

  if (!session || session.commissioner_id !== user.id) {
    return { error: 'Not authorized' };
  }

  const now = new Date().toISOString();
  const rows = updates.map((u) => ({
    session_id: sessionId,
    team_id: u.teamId,
    round_key: u.roundKey,
    result: u.result,
    entered_by: user.id,
    entered_at: now,
  }));

  const { error } = await supabase
    .from('tournament_results')
    .upsert(rows, { onConflict: 'session_id,team_id,round_key' });

  if (error) return { error: error.message };

  // Update tournament status
  await supabase
    .from('auction_sessions')
    .update({ tournament_status: 'in_progress' })
    .eq('id', sessionId)
    .eq('tournament_status', 'pre_tournament');

  // Broadcast bulk update
  await broadcastToChannel(`auction:${sessionId}`, 'RESULTS_BULK_UPDATED', {
    updates,
  });

  return { success: true };
}

/**
 * Mark the tournament as settled (all results entered, final payouts calculated).
 */
export async function settleTournament(sessionId: string) {
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

  if (!session || session.commissioner_id !== user.id) {
    return { error: 'Not authorized' };
  }

  const { error } = await supabase
    .from('auction_sessions')
    .update({ tournament_status: 'settled' })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  await broadcastToChannel(`auction:${sessionId}`, 'TOURNAMENT_SETTLED', {});

  return { success: true };
}
