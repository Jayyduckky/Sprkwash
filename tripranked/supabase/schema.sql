-- TripRanked · optional live global leaderboard
--
-- 1. Create a (free) Supabase project
-- 2. Paste this whole file into the SQL Editor and run it
-- 3. Put your project URL + anon key into tripranked/js/config.js
--
-- Note: this is an open, arcade-style board — anyone with the anon key can
-- write their own row (that's what makes it zero-signup). Don't store
-- anything sensitive here. For a hardened board, add Supabase Auth and
-- tighten the policies to auth.uid().

create table if not exists public.leaderboard (
  tag                text primary key,          -- e.g. 'TR-4821' (device-generated)
  name               text not null default 'Driver',
  emoji              text not null default '🚗',
  top_speed_ms       double precision not null default 0,
  distance_m         double precision not null default 0,
  trips              integer not null default 0,
  week_key           text not null default '',  -- e.g. '2026-W28'
  week_top_speed_ms  double precision not null default 0,
  week_distance_m    double precision not null default 0,
  week_trips         integer not null default 0,
  updated_at         timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "public read" on public.leaderboard;
create policy "public read"
  on public.leaderboard for select
  to anon using (true);

drop policy if exists "public insert" on public.leaderboard;
create policy "public insert"
  on public.leaderboard for insert
  to anon with check (true);

drop policy if exists "public update" on public.leaderboard;
create policy "public update"
  on public.leaderboard for update
  to anon using (true) with check (true);

create index if not exists leaderboard_speed_idx    on public.leaderboard (top_speed_ms desc);
create index if not exists leaderboard_distance_idx on public.leaderboard (distance_m desc);
create index if not exists leaderboard_week_idx     on public.leaderboard (week_key);
