# VALORANT Match Ingestion (Spike IQ)

## Goals
- Post-match analytics and coaching insights only.
- User-consented, user-owned data model.
- Server-only provider communication.
- Mock mode now, live mode later without changing transform/metrics code.

## Module Layout
- `src/server/valorant/provider`: live/mock adapters + provider interface.
- `src/server/valorant/ingestion`: queue helpers, service entrypoints, worker.
- `src/server/valorant/transform`: raw payload -> normalized user match/round rows.
- `src/server/valorant/metrics`: round and match rating math.
- `src/server/valorant/insights`: rule-based coaching insights.
- `supabase/migrations`: queue/data schema + RLS + SQL helper functions.

## Job Types and Flow
1. `sync_backfill_seed`
2. `fetch_matchlist` (`mode=backfill`)
3. `fetch_match` for unknown IDs
4. `transform_match`
5. `recompute_metrics`

Refresh cadence flow:
1. `sync_recent`
2. `fetch_matchlist` (`mode=recent`)
3. unknown IDs only -> same downstream jobs

## Backfill Strategy
- Triggered from `onRiotLinked`.
- Seeds `sync_backfill_seed`, then `fetch_matchlist(mode=backfill)`.
- Backfill matchlist reads are paged (`startIndex`/`endIndex`) to pull deeper history, not only the first page.
- Worker compares remote IDs against existing local match IDs.
- Only unseen matches are fetched and transformed.
- Backfill is marked complete only when downstream `fetch_match` + `transform_match` + `recompute_metrics` jobs are fully drained.
- Sync cursor state (`high_watermark_start_ms`, `last_match_id_seen`, timestamps) is persisted in `valorant_sync_state`.

## Refresh Strategy
- Use `scheduleRecentSync` for active users (example: every 10-15 minutes).
- Use `scheduleRecentSyncForConnectedUsers` for batch cron refresh.
- Refresh work stays lightweight because it only enqueues unseen match IDs.

## Retry and Dedup
- SQL queue supports `attempts`, `max_attempts`, `run_after`, dead-letter transition.
- `computeRetryDelaySeconds` uses exponential backoff + jitter.
- Dedup via `dedupe_key` unique index for active (`queued`/`running`) jobs.

## Data Layers
- Raw: `valorant_raw_matches`
- Normalized: `valorant_user_matches`, `valorant_user_rounds`
- Derived: `valorant_user_match_aggregates`, `valorant_user_daily_aggregates`, `valorant_user_insights`

## Rating Minimum
Round inputs:
- kills/deaths/assists/damage
- first kill/death
- trade kill/traded death
- plant/defuse
- survived round
- round result

Match score:
- average round rating + consistency blend
- output is a coaching/performance signal, not rank/MMR/ELO

## Integration Entry Points
- On RSO link: `ValorantIngestionService.onRiotLinked(...)`
- Recurring refresh scheduler: `scheduleRecentSync(...)` or `scheduleRecentSyncForConnectedUsers(...)`
- Queue worker loop: `ValorantIngestionWorker.runOnce(...)`
- Mock demo seed helper: `seedMockValorantPipeline(...)`

## Mock vs Live Adapter Pattern
- Shared interface: `ValorantMatchProvider`.
- `MockRiotProvider` serves fixture matchlist + payloads.
- `LiveRiotProvider` calls Riot API from server only, with retry/backoff and cache.
- Switch with `VAL_PROVIDER=mock|live` without changing transform/metrics code.

## Risks and Assumptions
- Assumes approved Riot access and compliant user consent copy.
- Assumes service-role backend path for queue/raw/derived writes.
- Side inference is objective-aware (planter/defuser team ownership + half swap fallback), but overtime/no-objective rounds can still resolve to `unknown`.
- Insight generation is rule-based v1 and should be tuned with real match distributions.

## Implementation Order
1. Run migration and verify RLS behavior with your existing auth.
2. Wire `onRiotLinked` into your RSO callback flow.
3. Run worker in mock mode and verify dashboard hydration.
4. Add scheduler for `scheduleRecentSync` cadence.
5. Enable live provider for internal test accounts behind a feature flag.
6. Tune scoring weights and insight rules from collected real data.

## Environment
- `VAL_PROVIDER=mock|live`
- `RIOT_API_KEY` for live provider
- Server must use Supabase service-role client for internal queue/raw writes.

## Next Steps
- Wire worker into your job runtime (cron/queue runner).
- Add account token refresh logic before live provider calls.
- Tune scoring weights with real match distributions.
- Add migration for deleting user data on account disconnect/opt-out.
