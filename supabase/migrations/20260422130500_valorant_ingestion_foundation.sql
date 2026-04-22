-- VALORANT match ingestion foundation (mock-first, live-ready)
-- Safe for post-match analytics and per-user ownership.

create extension if not exists pgcrypto;

-- Enums ---------------------------------------------------------------------
do $$
begin
  create type public.valorant_job_status as enum ('queued', 'running', 'completed', 'failed', 'dead_letter');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.valorant_sync_phase as enum ('idle', 'backfill', 'refresh');
exception
  when duplicate_object then null;
end $$;

-- Shared trigger function ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auth-linked Riot connection ------------------------------------------------
create table if not exists public.riot_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'riot',
  puuid text not null unique,
  game_name text,
  tag_line text,
  region text not null,
  scopes text[] not null default '{}',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  opt_in_version text not null,
  opt_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint riot_connections_region_check check (region in ('na', 'latam', 'br', 'eu', 'ap', 'kr', 'esports'))
);

create trigger trg_riot_connections_updated_at
before update on public.riot_connections
for each row
execute function public.set_updated_at();

-- Per-user sync cursor state -------------------------------------------------
create table if not exists public.valorant_sync_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phase public.valorant_sync_phase not null default 'idle',
  backfill_status text not null default 'pending',
  high_watermark_start_ms bigint,
  last_match_id_seen text,
  last_synced_at timestamptz,
  last_backfill_at timestamptz,
  last_refresh_at timestamptz,
  error_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_valorant_sync_state_updated_at
before update on public.valorant_sync_state
for each row
execute function public.set_updated_at();

-- Internal job queue ---------------------------------------------------------
create table if not exists public.valorant_ingestion_jobs (
  id bigserial primary key,
  job_type text not null,
  dedupe_key text,
  payload jsonb not null default '{}'::jsonb,
  status public.valorant_job_status not null default 'queued',
  priority integer not null default 100,
  attempts integer not null default 0,
  max_attempts integer not null default 8,
  run_after timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists valorant_ingestion_jobs_sched_idx
  on public.valorant_ingestion_jobs (status, run_after, priority, id);

create unique index if not exists valorant_ingestion_jobs_dedupe_active_idx
  on public.valorant_ingestion_jobs (dedupe_key)
  where dedupe_key is not null and status in ('queued', 'running');

create trigger trg_valorant_ingestion_jobs_updated_at
before update on public.valorant_ingestion_jobs
for each row
execute function public.set_updated_at();

-- Raw payload persistence ----------------------------------------------------
create table if not exists public.valorant_raw_matches (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  region text not null,
  payload_jsonb jsonb not null,
  payload_hash text not null,
  schema_version integer not null default 1,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_user_id, match_id)
);

create index if not exists valorant_raw_matches_owner_idx
  on public.valorant_raw_matches (owner_user_id, fetched_at desc);

create index if not exists valorant_raw_matches_match_idx
  on public.valorant_raw_matches (match_id);

-- Normalized per-user match facts -------------------------------------------
create table if not exists public.valorant_user_matches (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  region text not null,
  queue_id text,
  mode_id text,
  map_id text,
  season_id text,
  game_start_ms bigint,
  game_start_at timestamptz,
  game_length_ms integer,
  team_id text,
  won boolean,
  agent_id text,
  kills integer not null default 0,
  deaths integer not null default 0,
  assists integer not null default 0,
  damage_dealt integer not null default 0,
  score integer not null default 0,
  first_kills integer not null default 0,
  first_deaths integer not null default 0,
  trade_kills integer not null default 0,
  traded_deaths integer not null default 0,
  plants integer not null default 0,
  defuses integer not null default 0,
  rounds_played integer not null default 0,
  rounds_won integer not null default 0,
  avg_round_rating numeric(6,2),
  consistency_score numeric(6,2),
  match_rating numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, match_id)
);

create index if not exists valorant_user_matches_owner_start_idx
  on public.valorant_user_matches (owner_user_id, game_start_at desc);

create trigger trg_valorant_user_matches_updated_at
before update on public.valorant_user_matches
for each row
execute function public.set_updated_at();

-- Normalized per-user round facts -------------------------------------------
create table if not exists public.valorant_user_rounds (
  owner_user_id uuid not null,
  match_id text not null,
  round_num integer not null,
  side text not null default 'unknown',
  round_won boolean,
  survived_round boolean,
  kills integer not null default 0,
  deaths integer not null default 0,
  assists integer not null default 0,
  damage_dealt integer not null default 0,
  first_kill boolean not null default false,
  first_death boolean not null default false,
  trade_kill boolean not null default false,
  traded_death boolean not null default false,
  plant boolean not null default false,
  defuse boolean not null default false,
  loadout_value integer,
  spent_credits integer,
  remaining_credits integer,
  round_rating numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, match_id, round_num),
  constraint valorant_user_rounds_side_check check (side in ('attack', 'defense', 'unknown')),
  constraint valorant_user_rounds_match_fk
    foreign key (owner_user_id, match_id)
    references public.valorant_user_matches(owner_user_id, match_id)
    on delete cascade
);

create index if not exists valorant_user_rounds_owner_match_idx
  on public.valorant_user_rounds (owner_user_id, match_id, round_num);

create trigger trg_valorant_user_rounds_updated_at
before update on public.valorant_user_rounds
for each row
execute function public.set_updated_at();

-- Derived match aggregate vector --------------------------------------------
create table if not exists public.valorant_user_match_aggregates (
  owner_user_id uuid not null,
  match_id text not null,
  pipeline_version text not null default 'v1',
  feature_vector jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, match_id),
  constraint valorant_user_match_aggregates_match_fk
    foreign key (owner_user_id, match_id)
    references public.valorant_user_matches(owner_user_id, match_id)
    on delete cascade
);

create trigger trg_valorant_user_match_aggregates_updated_at
before update on public.valorant_user_match_aggregates
for each row
execute function public.set_updated_at();

-- Daily trend rollups --------------------------------------------------------
create table if not exists public.valorant_user_daily_aggregates (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  matches_played integer not null default 0,
  rounds_played integer not null default 0,
  avg_round_rating numeric(6,2),
  avg_match_rating numeric(6,2),
  kd_ratio numeric(8,3),
  first_duel_win_rate numeric(8,3),
  trade_participation_rate numeric(8,3),
  objective_participation_rate numeric(8,3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, metric_date)
);

create index if not exists valorant_user_daily_aggregates_owner_date_idx
  on public.valorant_user_daily_aggregates (owner_user_id, metric_date desc);

create trigger trg_valorant_user_daily_aggregates_updated_at
before update on public.valorant_user_daily_aggregates
for each row
execute function public.set_updated_at();

-- Generated coaching insights ------------------------------------------------
create table if not exists public.valorant_user_insights (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  match_id text,
  insight_type text not null,
  title text not null,
  body text not null,
  severity smallint not null default 1,
  rule_id text not null,
  metric_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  acknowledged_at timestamptz,
  constraint valorant_user_insights_match_fk
    foreign key (owner_user_id, match_id)
    references public.valorant_user_matches(owner_user_id, match_id)
    on delete cascade
);

create index if not exists valorant_user_insights_owner_created_idx
  on public.valorant_user_insights (owner_user_id, created_at desc);

-- Provider response cache ----------------------------------------------------
create table if not exists public.valorant_api_cache (
  provider text not null,
  cache_key text not null,
  value_jsonb jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider, cache_key)
);

create index if not exists valorant_api_cache_expiry_idx
  on public.valorant_api_cache (expires_at);

create trigger trg_valorant_api_cache_updated_at
before update on public.valorant_api_cache
for each row
execute function public.set_updated_at();

-- Internal queue helpers -----------------------------------------------------
create or replace function public.enqueue_valorant_job(
  p_job_type text,
  p_payload jsonb default '{}'::jsonb,
  p_dedupe_key text default null,
  p_run_after timestamptz default now(),
  p_priority integer default 100,
  p_max_attempts integer default 8
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id bigint;
begin
  if p_dedupe_key is null then
    insert into public.valorant_ingestion_jobs (
      job_type,
      payload,
      run_after,
      priority,
      max_attempts
    )
    values (
      p_job_type,
      p_payload,
      p_run_after,
      p_priority,
      p_max_attempts
    )
    returning id into v_job_id;

    return v_job_id;
  end if;

  insert into public.valorant_ingestion_jobs (
    job_type,
    dedupe_key,
    payload,
    run_after,
    priority,
    max_attempts
  )
  values (
    p_job_type,
    p_dedupe_key,
    p_payload,
    p_run_after,
    p_priority,
    p_max_attempts
  )
  on conflict (dedupe_key)
  where dedupe_key is not null and status in ('queued', 'running')
  do update
  set
    run_after = least(public.valorant_ingestion_jobs.run_after, excluded.run_after),
    priority = least(public.valorant_ingestion_jobs.priority, excluded.priority),
    payload = excluded.payload,
    updated_at = now()
  returning id into v_job_id;

  return v_job_id;
end;
$$;

create or replace function public.claim_valorant_jobs(
  p_worker_id text,
  p_limit integer default 10
)
returns setof public.valorant_ingestion_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.valorant_ingestion_jobs
    where status = 'queued'
      and run_after <= now()
    order by priority asc, run_after asc, id asc
    limit greatest(1, p_limit)
    for update skip locked
  ), claimed as (
    update public.valorant_ingestion_jobs j
    set
      status = 'running',
      attempts = j.attempts + 1,
      locked_by = p_worker_id,
      locked_at = now(),
      updated_at = now()
    from candidate c
    where j.id = c.id
    returning j.*
  )
  select * from claimed;
end;
$$;

create or replace function public.complete_valorant_job(
  p_job_id bigint,
  p_success boolean,
  p_error text default null,
  p_retry_delay_seconds integer default 60
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempts integer;
  v_max_attempts integer;
begin
  select attempts, max_attempts
    into v_attempts, v_max_attempts
  from public.valorant_ingestion_jobs
  where id = p_job_id;

  if not found then
    raise exception 'valorant job % not found', p_job_id;
  end if;

  if p_success then
    update public.valorant_ingestion_jobs
    set
      status = 'completed',
      completed_at = now(),
      locked_at = null,
      locked_by = null,
      last_error = null,
      updated_at = now()
    where id = p_job_id;

    return;
  end if;

  if v_attempts >= v_max_attempts then
    update public.valorant_ingestion_jobs
    set
      status = 'dead_letter',
      completed_at = now(),
      last_error = p_error,
      locked_at = null,
      locked_by = null,
      updated_at = now()
    where id = p_job_id;

    return;
  end if;

  update public.valorant_ingestion_jobs
  set
    status = 'queued',
    run_after = now() + make_interval(secs => greatest(1, p_retry_delay_seconds)),
    last_error = p_error,
    locked_at = null,
    locked_by = null,
    updated_at = now()
  where id = p_job_id;
end;
$$;

-- RLS: user-owned analytics data --------------------------------------------
alter table public.riot_connections enable row level security;
alter table public.valorant_sync_state enable row level security;
alter table public.valorant_user_matches enable row level security;
alter table public.valorant_user_rounds enable row level security;
alter table public.valorant_user_match_aggregates enable row level security;
alter table public.valorant_user_daily_aggregates enable row level security;
alter table public.valorant_user_insights enable row level security;

-- Internal-only tables remain RLS-enabled with no user policies.
alter table public.valorant_ingestion_jobs enable row level security;
alter table public.valorant_raw_matches enable row level security;
alter table public.valorant_api_cache enable row level security;

create policy riot_connections_own
on public.riot_connections
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy valorant_sync_state_own
on public.valorant_sync_state
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy valorant_user_matches_own
on public.valorant_user_matches
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy valorant_user_rounds_own
on public.valorant_user_rounds
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy valorant_user_match_aggregates_own
on public.valorant_user_match_aggregates
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy valorant_user_daily_aggregates_own
on public.valorant_user_daily_aggregates
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy valorant_user_insights_own
on public.valorant_user_insights
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);
