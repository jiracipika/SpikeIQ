-- Test user for Jiracipika
-- Email: jiracipika@test.local
-- Password: test (will be hashed by Supabase Auth)

-- Note: This creates a profile record. The auth user should be created via Supabase UI or CLI
INSERT INTO profiles (
  id,
  display_name,
  tagline,
  region,
  account_linked
) VALUES (
  'test-user-jiracipika',
  'Jiracipika',
  '#NA1',
  'NA',
  false
) ON CONFLICT DO NOTHING;

-- Insert test Riot account link
INSERT INTO connected_riot_accounts (
  user_id,
  riot_puuid,
  game_name,
  tag_line,
  region,
  access_token_encrypted,
  refresh_token_encrypted,
  created_at,
  last_synced_at
) VALUES (
  'test-user-jiracipika',
  'test-puuid-jiracipika-12345',
  'Jiracipika',
  'NA1',
  'NA',
  'mock_token_encrypted',
  'mock_refresh_encrypted',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Optional: Insert some mock match data for testing
INSERT INTO matches (
  user_id,
  riot_match_id,
  agent_picked,
  map_played,
  rank_rp_before,
  rank_rp_after,
  won,
  kills,
  deaths,
  assists,
  playtime_seconds,
  first_blood,
  first_death,
  clutch_count,
  downloaded_at
) VALUES
  ('test-user-jiracipika', 'match-001', 'Jett', 'Ascent', 18, 24, true, 20, 3, 5, 2400, true, false, 0, now()),
  ('test-user-jiracipika', 'match-002', 'Sova', 'Bind', 24, 27, true, 12, 4, 8, 2100, false, true, 1, now()),
  ('test-user-jiracipika', 'match-003', 'Reyna', 'Haven', 27, 24, false, 15, 6, 4, 1800, false, false, 0, now()),
  ('test-user-jiracipika', 'match-004', 'KAY/O', 'Split', 24, 21, false, 8, 5, 12, 2200, true, true, 0, now()),
  ('test-user-jiracipika', 'match-005', 'Jett', 'Lotus', 21, 26, true, 18, 4, 3, 2350, true, false, 0, now())
ON CONFLICT DO NOTHING;
