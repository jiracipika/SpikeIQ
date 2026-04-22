-- SpikeIQ initial schema
-- Creates all tables used by the app. RLS + triggers live in later migrations.

-- =====================================================================
-- profiles: public-facing user info, 1:1 with auth.users
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  region text check (region in ('NA', 'EU', 'AP')) default 'NA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- =====================================================================
-- user_preferences: app settings per user
-- =====================================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_role text check (preferred_role in ('duelist','initiator','controller','sentinel')) default 'initiator',
  preferred_agents text[] not null default array[]::text[],
  profile_visibility text check (profile_visibility in ('private','friends','public')) default 'public',
  email_updates boolean not null default true,
  weekly_recap boolean not null default true,
  auto_sync boolean not null default true,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- connected_riot_accounts: Riot OAuth link (tokens ready for future use)
-- =====================================================================
create table if not exists public.connected_riot_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  riot_puuid text not null,
  riot_game_name text not null,
  riot_tag_line text not null,
  region text not null check (region in ('NA', 'EU', 'AP')),
  is_verified boolean not null default false,
  -- Placeholders for encrypted token storage when Riot OAuth is wired up.
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (riot_puuid)
);

create index if not exists connected_riot_user_idx on public.connected_riot_accounts (user_id);

-- =====================================================================
-- matches: one row per completed match
-- =====================================================================
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_match_id text,
  map_name text not null,
  mode text,
  queue text not null check (queue in ('competitive','unrated','premier')),
  agent_name text not null,
  role text check (role in ('duelist','initiator','controller','sentinel')),
  started_at timestamptz not null,
  duration_minutes integer,
  won boolean not null,
  score_for integer not null,
  score_against integer not null,
  kills integer not null default 0,
  deaths integer not null default 0,
  assists integer not null default 0,
  headshot_percent numeric(5,2) not null default 0,
  adr numeric(6,2) not null default 0,
  acs integer not null default 0,
  first_bloods integer not null default 0,
  plants integer not null default 0,
  defuses integer not null default 0,
  econ_rating integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, external_match_id)
);

create index if not exists matches_user_started_idx on public.matches (user_id, started_at desc);
create index if not exists matches_user_map_idx on public.matches (user_id, map_name);
create index if not exists matches_user_agent_idx on public.matches (user_id, agent_name);

-- =====================================================================
-- match_round_summaries: per-round breakdown
-- =====================================================================
create table if not exists public.match_round_summaries (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  round_number integer not null,
  won boolean not null,
  side text not null check (side in ('attack','defense')),
  buy_type text check (buy_type in ('pistol','eco','force','full-buy','bonus')),
  kills integer not null default 0,
  deaths integer not null default 0,
  assists integer not null default 0,
  first_blood boolean not null default false,
  first_death boolean not null default false,
  clutch boolean not null default false,
  highlight text check (
    highlight in ('first-blood','clutch','ace','triple-kill','retake','save','thrifty')
  ),
  created_at timestamptz not null default now(),
  unique (match_id, round_number)
);

create index if not exists match_rounds_match_idx on public.match_round_summaries (match_id, round_number);
create index if not exists match_rounds_user_idx on public.match_round_summaries (user_id);

-- =====================================================================
-- aggregated_agent_stats: rollup per agent per user
-- =====================================================================
create table if not exists public.aggregated_agent_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  role text check (role in ('duelist','initiator','controller','sentinel')),
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_rate numeric(5,2) not null default 0,
  kd_ratio numeric(5,2) not null default 0,
  avg_kills numeric(6,2) not null default 0,
  avg_deaths numeric(6,2) not null default 0,
  avg_assists numeric(6,2) not null default 0,
  avg_adr numeric(6,2) not null default 0,
  avg_acs integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, agent_name)
);

create index if not exists agent_stats_user_idx on public.aggregated_agent_stats (user_id, win_rate desc);

-- =====================================================================
-- aggregated_map_stats: rollup per map per user
-- =====================================================================
create table if not exists public.aggregated_map_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  map_name text not null,
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_rate numeric(5,2) not null default 0,
  attack_round_win_rate numeric(5,2) not null default 0,
  defense_round_win_rate numeric(5,2) not null default 0,
  avg_kills numeric(6,2) not null default 0,
  avg_deaths numeric(6,2) not null default 0,
  avg_assists numeric(6,2) not null default 0,
  avg_adr numeric(6,2) not null default 0,
  avg_acs integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, map_name)
);

create index if not exists map_stats_user_idx on public.aggregated_map_stats (user_id, win_rate desc);

-- =====================================================================
-- generated_insights: coaching insights produced by the analysis pipeline
-- =====================================================================
create table if not exists public.generated_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('mechanics','macro','consistency','mindset')),
  title text not null,
  description text not null,
  action text,
  severity text not null check (severity in ('high','medium','low')) default 'medium',
  related_entity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insights_user_idx on public.generated_insights (user_id, created_at desc);
