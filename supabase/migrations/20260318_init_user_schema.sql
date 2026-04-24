create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null check (char_length(trim(display_name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric_key text not null check (
    metric_key in (
      'leagueWinCount',
      'dailyStepCount',
      'leaguePosition',
      'highestStepCount',
      'totalStepCount',
      'activeDaysCount',
      'currentStreakCount',
      'longestStreakCount',
      'weeklyStepCount'
    )
  ),
  metric_value numeric not null,
  unit text not null,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.league_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  league_id text not null,
  final_rank integer not null check (final_rank >= 1),
  final_points integer not null check (final_points >= 0),
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, league_id)
);

create table if not exists public.active_leagues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  league_id text not null,
  current_rank integer not null check (current_rank >= 1),
  current_points integer not null check (current_points >= 0),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, league_id)
);

create index if not exists user_metrics_user_id_recorded_at_idx
  on public.user_metrics (user_id, recorded_at desc);

create index if not exists league_results_user_id_completed_at_idx
  on public.league_results (user_id, completed_at desc);

create index if not exists active_leagues_user_id_updated_at_idx
  on public.active_leagues (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_active_leagues_set_updated_at on public.active_leagues;
create trigger trg_active_leagues_set_updated_at
before update on public.active_leagues
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'Compfit User'), '@', 1), 'Compfit User')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_metrics enable row level security;
alter table public.league_results enable row level security;
alter table public.active_leagues enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = id);

drop policy if exists "user_metrics_select_own" on public.user_metrics;
create policy "user_metrics_select_own"
  on public.user_metrics
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_metrics_insert_own" on public.user_metrics;
create policy "user_metrics_insert_own"
  on public.user_metrics
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_metrics_update_own" on public.user_metrics;
create policy "user_metrics_update_own"
  on public.user_metrics
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_metrics_delete_own" on public.user_metrics;
create policy "user_metrics_delete_own"
  on public.user_metrics
  for delete
  using (auth.uid() = user_id);

drop policy if exists "league_results_select_own" on public.league_results;
create policy "league_results_select_own"
  on public.league_results
  for select
  using (auth.uid() = user_id);

drop policy if exists "league_results_insert_own" on public.league_results;
create policy "league_results_insert_own"
  on public.league_results
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "league_results_update_own" on public.league_results;
create policy "league_results_update_own"
  on public.league_results
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "league_results_delete_own" on public.league_results;
create policy "league_results_delete_own"
  on public.league_results
  for delete
  using (auth.uid() = user_id);

drop policy if exists "active_leagues_select_own" on public.active_leagues;
create policy "active_leagues_select_own"
  on public.active_leagues
  for select
  using (auth.uid() = user_id);

drop policy if exists "active_leagues_insert_own" on public.active_leagues;
create policy "active_leagues_insert_own"
  on public.active_leagues
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "active_leagues_update_own" on public.active_leagues;
create policy "active_leagues_update_own"
  on public.active_leagues
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "active_leagues_delete_own" on public.active_leagues;
create policy "active_leagues_delete_own"
  on public.active_leagues
  for delete
  using (auth.uid() = user_id);
