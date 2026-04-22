-- Enable Row Level Security on every user-owned table and scope access
-- strictly to the owning auth user.

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.connected_riot_accounts enable row level security;
alter table public.matches enable row level security;
alter table public.match_round_summaries enable row level security;
alter table public.aggregated_agent_stats enable row level security;
alter table public.aggregated_map_stats enable row level security;
alter table public.generated_insights enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- ---------- user_preferences ----------
drop policy if exists "prefs_select_own" on public.user_preferences;
drop policy if exists "prefs_insert_own" on public.user_preferences;
drop policy if exists "prefs_update_own" on public.user_preferences;
drop policy if exists "prefs_delete_own" on public.user_preferences;

create policy "prefs_select_own" on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "prefs_insert_own" on public.user_preferences
  for insert with check (auth.uid() = user_id);
create policy "prefs_update_own" on public.user_preferences
  for update using (auth.uid() = user_id);
create policy "prefs_delete_own" on public.user_preferences
  for delete using (auth.uid() = user_id);

-- ---------- connected_riot_accounts ----------
drop policy if exists "riot_select_own" on public.connected_riot_accounts;
drop policy if exists "riot_insert_own" on public.connected_riot_accounts;
drop policy if exists "riot_update_own" on public.connected_riot_accounts;
drop policy if exists "riot_delete_own" on public.connected_riot_accounts;

create policy "riot_select_own" on public.connected_riot_accounts
  for select using (auth.uid() = user_id);
create policy "riot_insert_own" on public.connected_riot_accounts
  for insert with check (auth.uid() = user_id);
create policy "riot_update_own" on public.connected_riot_accounts
  for update using (auth.uid() = user_id);
create policy "riot_delete_own" on public.connected_riot_accounts
  for delete using (auth.uid() = user_id);

-- ---------- matches ----------
drop policy if exists "matches_select_own" on public.matches;
drop policy if exists "matches_insert_own" on public.matches;
drop policy if exists "matches_update_own" on public.matches;
drop policy if exists "matches_delete_own" on public.matches;

create policy "matches_select_own" on public.matches
  for select using (auth.uid() = user_id);
create policy "matches_insert_own" on public.matches
  for insert with check (auth.uid() = user_id);
create policy "matches_update_own" on public.matches
  for update using (auth.uid() = user_id);
create policy "matches_delete_own" on public.matches
  for delete using (auth.uid() = user_id);

-- ---------- match_round_summaries ----------
drop policy if exists "rounds_select_own" on public.match_round_summaries;
drop policy if exists "rounds_insert_own" on public.match_round_summaries;
drop policy if exists "rounds_update_own" on public.match_round_summaries;
drop policy if exists "rounds_delete_own" on public.match_round_summaries;

create policy "rounds_select_own" on public.match_round_summaries
  for select using (auth.uid() = user_id);
create policy "rounds_insert_own" on public.match_round_summaries
  for insert with check (auth.uid() = user_id);
create policy "rounds_update_own" on public.match_round_summaries
  for update using (auth.uid() = user_id);
create policy "rounds_delete_own" on public.match_round_summaries
  for delete using (auth.uid() = user_id);

-- ---------- aggregated_agent_stats ----------
drop policy if exists "agent_stats_select_own" on public.aggregated_agent_stats;
drop policy if exists "agent_stats_insert_own" on public.aggregated_agent_stats;
drop policy if exists "agent_stats_update_own" on public.aggregated_agent_stats;
drop policy if exists "agent_stats_delete_own" on public.aggregated_agent_stats;

create policy "agent_stats_select_own" on public.aggregated_agent_stats
  for select using (auth.uid() = user_id);
create policy "agent_stats_insert_own" on public.aggregated_agent_stats
  for insert with check (auth.uid() = user_id);
create policy "agent_stats_update_own" on public.aggregated_agent_stats
  for update using (auth.uid() = user_id);
create policy "agent_stats_delete_own" on public.aggregated_agent_stats
  for delete using (auth.uid() = user_id);

-- ---------- aggregated_map_stats ----------
drop policy if exists "map_stats_select_own" on public.aggregated_map_stats;
drop policy if exists "map_stats_insert_own" on public.aggregated_map_stats;
drop policy if exists "map_stats_update_own" on public.aggregated_map_stats;
drop policy if exists "map_stats_delete_own" on public.aggregated_map_stats;

create policy "map_stats_select_own" on public.aggregated_map_stats
  for select using (auth.uid() = user_id);
create policy "map_stats_insert_own" on public.aggregated_map_stats
  for insert with check (auth.uid() = user_id);
create policy "map_stats_update_own" on public.aggregated_map_stats
  for update using (auth.uid() = user_id);
create policy "map_stats_delete_own" on public.aggregated_map_stats
  for delete using (auth.uid() = user_id);

-- ---------- generated_insights ----------
drop policy if exists "insights_select_own" on public.generated_insights;
drop policy if exists "insights_insert_own" on public.generated_insights;
drop policy if exists "insights_update_own" on public.generated_insights;
drop policy if exists "insights_delete_own" on public.generated_insights;

create policy "insights_select_own" on public.generated_insights
  for select using (auth.uid() = user_id);
create policy "insights_insert_own" on public.generated_insights
  for insert with check (auth.uid() = user_id);
create policy "insights_update_own" on public.generated_insights
  for update using (auth.uid() = user_id);
create policy "insights_delete_own" on public.generated_insights
  for delete using (auth.uid() = user_id);
