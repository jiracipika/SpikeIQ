# Supabase Schema Proposal (Future Integration)

This schema is designed so the current mock repository can be swapped with a Supabase-backed repository without changing page/component code.

## 1) auth.users (managed by Supabase Auth)

- id (uuid, primary key)
- email (text)
- created_at (timestamptz)

## 2) public.profiles

- id (uuid, primary key, references auth.users.id)
- display_name (text)
- tagline (text)
- region (text)
- riot_puuid (text, nullable)
- riot_game_name (text, nullable)
- riot_tag_line (text, nullable)
- account_linked (boolean default false)
- created_at (timestamptz default now())
- updated_at (timestamptz default now())

## 3) public.user_settings

- user_id (uuid, primary key, references profiles.id)
- preferred_role (text)
- preferred_agents (text[])
- profile_visibility (text check in ('private','friends','public'))
- email_updates (boolean default true)
- updated_at (timestamptz default now())

## 4) public.matches

- id (text, primary key) -- Riot match id
- user_id (uuid, references profiles.id)
- played_at (timestamptz)
- queue (text)
- map (text)
- agent (text)
- role (text)
- result (text check in ('win','loss'))
- scoreline (text)
- kills (int)
- deaths (int)
- assists (int)
- hs_percentage (numeric)
- combat_score (int)
- econ_rating (int)
- first_bloods (int)
- plants (int)
- defuses (int)
- raw_payload (jsonb) -- optional cached Riot payload for future features
- created_at (timestamptz default now())

Recommended index:
- (user_id, played_at desc)

## 5) public.agent_performance_snapshots

- id (bigint generated always as identity, primary key)
- user_id (uuid, references profiles.id)
- computed_at (timestamptz)
- agent (text)
- role (text)
- matches (int)
- win_rate (numeric)
- kd_ratio (numeric)
- avg_acs (numeric)

## 6) public.map_performance_snapshots

- id (bigint generated always as identity, primary key)
- user_id (uuid, references profiles.id)
- computed_at (timestamptz)
- map (text)
- matches (int)
- win_rate (numeric)
- attack_round_win_rate (numeric)
- defense_round_win_rate (numeric)

## 7) public.coaching_insights

- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- title (text)
- category (text check in ('mechanics','macro','consistency','mindset'))
- priority (text check in ('high','medium','low'))
- description (text)
- action (text)
- source (text) -- rule_engine, llm, or hybrid
- created_at (timestamptz default now())

## RLS direction (high-level)

- Enable RLS on all public tables.
- Policy: user can read/write rows where user_id = auth.uid() (or id = auth.uid() for profiles).
- Service role for backend ingestion jobs (Riot sync).

## Migration strategy from current code

1. Keep service contract unchanged (`ValorantDataRepository`).
2. Add `SupabaseValorantRepository` implementing same methods.
3. Switch service wiring from mock to Supabase via env flag.
4. Keep mock repository for local demo/dev fallback.
