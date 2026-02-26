-- ============================================
-- Tournament Results: Track team outcomes per round
-- Enables post-auction tournament lifecycle
-- ============================================

-- ============================================
-- tournament_results: Per-team, per-round outcomes
-- ============================================
create table public.tournament_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.auction_sessions(id) on delete cascade not null,
  team_id integer not null,
  round_key text not null,
  result text not null default 'pending'
    check (result in ('won', 'lost', 'pending')),
  entered_by uuid references public.profiles(id),
  entered_at timestamptz default now(),
  unique(session_id, team_id, round_key)
);

alter table public.tournament_results enable row level security;

-- Participants can view results in sessions they belong to
create policy "Participants can view tournament results"
  on public.tournament_results for select
  to authenticated
  using (public.is_session_participant(session_id));

-- Commissioners can insert results for their sessions
create policy "Commissioners can insert tournament results"
  on public.tournament_results for insert
  to authenticated
  with check (
    session_id in (
      select s.id from public.auction_sessions s
      where s.commissioner_id = (select auth.uid())
    )
  );

-- Commissioners can update results (change won/lost/pending)
create policy "Commissioners can update tournament results"
  on public.tournament_results for update
  to authenticated
  using (
    session_id in (
      select s.id from public.auction_sessions s
      where s.commissioner_id = (select auth.uid())
    )
  );

-- Commissioners can delete results (undo mistakes)
create policy "Commissioners can delete tournament results"
  on public.tournament_results for delete
  to authenticated
  using (
    session_id in (
      select s.id from public.auction_sessions s
      where s.commissioner_id = (select auth.uid())
    )
  );

-- ============================================
-- Indexes for performance
-- ============================================
create index idx_tournament_results_session on public.tournament_results(session_id);
create index idx_tournament_results_session_round on public.tournament_results(session_id, round_key);

-- ============================================
-- Add tournament lifecycle fields to auction_sessions
-- ============================================
alter table public.auction_sessions
  add column tournament_status text default 'pre_tournament'
    check (tournament_status in ('pre_tournament', 'in_progress', 'settled'));
