create table if not exists public.progress_shares (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  share_code text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists progress_shares_owner_active_unique_idx
  on public.progress_shares (owner_user_id)
  where is_active = true;

create index if not exists progress_shares_share_code_idx
  on public.progress_shares (share_code);

alter table public.progress_shares enable row level security;

drop policy if exists "progress_shares_select_own" on public.progress_shares;
create policy "progress_shares_select_own"
  on public.progress_shares
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "progress_shares_insert_own" on public.progress_shares;
create policy "progress_shares_insert_own"
  on public.progress_shares
  for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "progress_shares_update_own" on public.progress_shares;
create policy "progress_shares_update_own"
  on public.progress_shares
  for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "progress_shares_delete_own" on public.progress_shares;
create policy "progress_shares_delete_own"
  on public.progress_shares
  for delete
  using (auth.uid() = owner_user_id);

create or replace function public.get_public_progress_snapshot(input_share_code text)
returns table (
  display_name text,
  date_key text,
  label text,
  steps integer,
  streak integer
)
language sql
security definer
set search_path = public
as $$
  with active_share as (
    select owner_user_id
    from public.progress_shares
    where share_code = input_share_code
      and is_active = true
      and (expires_at is null or expires_at > now())
    limit 1
  ),
  owner_profile as (
    select p.display_name
    from public.profiles p
    join active_share s on s.owner_user_id = p.id
  ),
  owner_streak as (
    select coalesce((
      select um.metric_value::integer
      from public.user_metrics um
      join active_share s on s.owner_user_id = um.user_id
      where um.metric_key = 'currentStreakCount'
      order by um.recorded_at desc
      limit 1
    ), 0) as value
  ),
  days as (
    select generate_series((current_date - 6)::date, current_date::date, interval '1 day')::date as day
  ),
  daily_steps as (
    select (um.recorded_at at time zone 'utc')::date as day, max(um.metric_value)::integer as steps
    from public.user_metrics um
    join active_share s on s.owner_user_id = um.user_id
    where um.metric_key = 'dailyStepCount'
      and um.recorded_at >= (current_date - 6)::timestamp
    group by (um.recorded_at at time zone 'utc')::date
  )
  select
    p.display_name,
    to_char(d.day, 'YYYY-MM-DD') as date_key,
    trim(to_char(d.day, 'Dy')) as label,
    coalesce(ds.steps, 0) as steps,
    st.value as streak
  from days d
  cross join owner_profile p
  cross join owner_streak st
  left join daily_steps ds on ds.day = d.day
  order by d.day;
$$;
