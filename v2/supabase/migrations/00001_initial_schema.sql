-- ============================================
-- Calcutta Edge: Initial Database Schema
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- profiles: extends auth.users with app-specific fields
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  has_paid boolean not null default false,
  payment_date timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Trigger: auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- auction_data: per-user per-event auction state
-- ============================================
create table public.auction_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  teams jsonb not null default '[]'::jsonb,
  payout_rules jsonb not null default '{
    "roundOf64": 0.50,
    "roundOf32": 1.00,
    "sweet16": 2.50,
    "elite8": 4.00,
    "finalFour": 8.00,
    "champion": 16.00,
    "biggestUpset": 5,
    "highestSeed": 5,
    "largestMargin": 5,
    "customProp": 5
  }'::jsonb,
  estimated_pot_size numeric not null default 10000,
  event_type text not null default 'march_madness_2026',
  updated_at timestamptz not null default now(),

  unique(user_id, event_type)
);

alter table public.auction_data enable row level security;

create policy "Users can view their own auction data"
  on public.auction_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own auction data"
  on public.auction_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own auction data"
  on public.auction_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own auction data"
  on public.auction_data for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Auto-update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.auction_data
  for each row execute function public.handle_updated_at();
