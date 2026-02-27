-- ============================================
-- Live Auction Hosting: Tables + RLS + Indexes
-- Run in Supabase SQL Editor or via MCP apply_migration
-- ============================================

-- ============================================
-- auction_sessions: The auction room
-- ============================================
create table public.auction_sessions (
  id uuid primary key default gen_random_uuid(),
  join_code text unique not null,
  tournament_id text not null,
  commissioner_id uuid references public.profiles(id) not null,
  name text not null,
  payout_rules jsonb not null default '{}'::jsonb,
  estimated_pot_size numeric not null default 10000,
  status text not null default 'lobby'
    check (status in ('lobby', 'active', 'paused', 'completed')),
  current_team_idx integer default 0,
  team_order integer[] not null default '{}'::integer[],
  bidding_status text default 'waiting'
    check (bidding_status in ('waiting', 'open', 'closed')),
  current_highest_bid numeric default 0,
  current_highest_bidder_id uuid references public.profiles(id),
  settings jsonb default '{}'::jsonb,
  timer_ends_at timestamptz default null,
  timer_duration_ms integer default null,
  password_hash text default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.auction_sessions enable row level security;

-- Any authenticated user can read sessions (needed for join-code lookup)
create policy "Authenticated users can view sessions"
  on public.auction_sessions for select
  to authenticated
  using (true);

-- Authenticated users can create sessions (they become commissioner)
create policy "Authenticated users can create sessions"
  on public.auction_sessions for insert
  to authenticated
  with check ((select auth.uid()) = commissioner_id);

-- Commissioners can update their own sessions
create policy "Commissioners can update their sessions"
  on public.auction_sessions for update
  to authenticated
  using (commissioner_id = (select auth.uid()))
  with check (commissioner_id = (select auth.uid()));

-- Commissioners can delete their own sessions (CASCADE deletes participants + bids)
create policy "Commissioners can delete their sessions"
  on public.auction_sessions for delete
  to authenticated
  using (commissioner_id = (select auth.uid()));

-- Reuse existing handle_updated_at() trigger function
create trigger set_auction_sessions_updated_at
  before update on public.auction_sessions
  for each row execute function public.handle_updated_at();

-- ============================================
-- auction_participants: Who's in each session
-- ============================================
create table public.auction_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.auction_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  display_name text not null,
  is_commissioner boolean default false,
  joined_at timestamptz default now(),
  unique(session_id, user_id)
);

alter table public.auction_participants enable row level security;

-- Helper function: avoids infinite recursion from self-referencing RLS policies
create or replace function public.is_session_participant(p_session_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.auction_participants
    where session_id = p_session_id and user_id = auth.uid()
  );
$$;

-- Participants can view all members in sessions they belong to
create policy "Participants can view session members"
  on public.auction_participants for select
  to authenticated
  using (public.is_session_participant(session_id));

-- Users can join sessions (insert themselves)
create policy "Users can join sessions"
  on public.auction_participants for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Commissioners can remove participants from their sessions
create policy "Commissioners can remove participants"
  on public.auction_participants for delete
  to authenticated
  using (
    session_id in (
      select s.id from public.auction_sessions s
      where s.commissioner_id = (select auth.uid())
    )
  );

-- ============================================
-- auction_bids: Bid history and results
-- ============================================
create table public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.auction_sessions(id) on delete cascade not null,
  team_id integer not null,
  bidder_id uuid references public.profiles(id) not null,
  amount numeric not null check (amount > 0),
  is_winning_bid boolean default false,
  created_at timestamptz default now()
);

alter table public.auction_bids enable row level security;

-- Participants can view bids in sessions they belong to
create policy "Participants can view session bids"
  on public.auction_bids for select
  to authenticated
  using (public.is_session_participant(session_id));

-- Participants can place bids in sessions they belong to
create policy "Participants can place bids"
  on public.auction_bids for insert
  to authenticated
  with check (
    (select auth.uid()) = bidder_id
    and public.is_session_participant(session_id)
  );

-- ============================================
-- Indexes for performance
-- ============================================
create index idx_auction_sessions_join_code on public.auction_sessions(join_code);
create index idx_auction_participants_session on public.auction_participants(session_id);
create index idx_auction_participants_user on public.auction_participants(user_id);
create index idx_auction_bids_session_team on public.auction_bids(session_id, team_id);
