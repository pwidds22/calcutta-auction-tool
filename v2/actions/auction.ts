'use server';

import { createClient } from '@/lib/supabase/server';
import type { SavedTeamData, PayoutRules } from '@/lib/calculations/types';

export async function loadAuctionData(
  eventType: string = 'march_madness_2026'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('auction_data')
    .select('teams, payout_rules, estimated_pot_size')
    .eq('user_id', user.id)
    .eq('event_type', eventType)
    .single();

  if (error || !data) return null;

  return {
    teams: (data.teams as SavedTeamData[]) ?? [],
    payoutRules: data.payout_rules as PayoutRules,
    estimatedPotSize: data.estimated_pot_size as number,
  };
}

export async function saveAuctionData(payload: {
  teams: SavedTeamData[];
  payoutRules: PayoutRules;
  estimatedPotSize: number;
  eventType?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const eventType = payload.eventType ?? 'march_madness_2026';

  const { error } = await supabase.from('auction_data').upsert(
    {
      user_id: user.id,
      event_type: eventType,
      teams: payload.teams,
      payout_rules: payload.payoutRules,
      estimated_pot_size: payload.estimatedPotSize,
    },
    { onConflict: 'user_id,event_type' }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function resetAuctionData(
  eventType: string = 'march_madness_2026'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('auction_data')
    .delete()
    .eq('user_id', user.id)
    .eq('event_type', eventType);

  if (error) return { error: error.message };
  return { success: true };
}
