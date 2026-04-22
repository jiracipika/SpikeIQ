# Riot Production Launch Checklist (SpikeIQ)

## 1) Environment and Secrets

- Confirm production values are set:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RIOT_CLIENT_ID`
  - `RIOT_CLIENT_SECRET`
  - `RIOT_REDIRECT_URI`
  - `RIOT_API_KEY`
  - `RIOT_TOKEN_ENCRYPTION_KEY`
  - `RIOT_OAUTH_MOCK=false`
  - `RIOT_ALLOW_PLAINTEXT_TOKENS_IN_DEV=false`
  - `RIOT_SYNC_MATCH_LIMIT` (recommended `20`)
- Validate `RIOT_TOKEN_ENCRYPTION_KEY` decodes to exactly 32 bytes.
- Confirm no Riot secrets exist in client-exposed env vars.

## 2) Callback and OAuth Validation

- In Riot Developer Portal, set callback URI to the exact production value:
  - `https://YOUR_DOMAIN/api/riot/callback`
- Verify OAuth flow:
  - `/api/riot/start` redirects to Riot login
  - callback reaches `/api/riot/callback`
  - `/connect-riot?status=success` appears after approval
- Verify rejection path:
  - cancel on Riot site yields `riot_denied` UX message
- Verify CSRF path:
  - tampered callback state yields `state_mismatch` and no account link write

## 3) Mock-Off Cutover Plan

- Final staging check:
  - run with real Riot credentials in staging
  - confirm `Sync now` imports and analytics recompute completes
  - confirm no plaintext token writes
- Production cutover:
  - deploy with `RIOT_OAUTH_MOCK=false`
  - run smoke test with one test account:
    - link account
    - sync matches
    - view dashboard aggregates

## 4) Rollback Plan

- Fast rollback option:
  - set `RIOT_OAUTH_MOCK=true` and redeploy
  - this keeps connect flow functional in demo mode while production Riot calls are bypassed
- If callback issues occur:
  - revert `RIOT_REDIRECT_URI` to last known-good value
  - keep existing compatibility callback route enabled (`/auth/riot/callback`)
- If ingestion fails:
  - keep linking enabled
  - temporarily hide/disable `Sync now` button in UI
  - continue serving existing analytics data
- Post-rollback checks:
  - confirm users can still sign in and access dashboards
  - confirm no repeated OAuth error loops

## 5) Observability Smoke Checks

- Verify logs include structured events:
  - `riot_oauth_failure` for `state_mismatch`, `token_exchange_failed`, `identity_failed`
  - `riot_sync` with `start`, `complete`, and `failed` stages
- Ensure logs do not include access tokens, refresh tokens, or client secrets.
