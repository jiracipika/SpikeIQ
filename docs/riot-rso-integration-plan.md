# SpikeIQ Riot Sign On (RSO) Integration Plan

## 1) Architecture (additive, no rewrite)

- Auth model:
  - User is authenticated with Supabase first.
  - User initiates Riot linking from `/connect-riot`.
  - OAuth authorization code flow runs server-side only.
- Routing model:
  - Start: `GET /api/riot/start?region=NA|EU|AP`
  - Callback: `GET /api/riot/callback?code=...&state=...`
  - Legacy compatibility retained:
    - `/api/riot/connect` -> alias of `/api/riot/start`
    - `/auth/riot/callback` -> alias of `/api/riot/callback`
- Service/model boundaries:
  - `lib/riot/config.ts`: runtime config + mode switches (mock vs real).
  - `lib/riot/oauth.ts`: state generation + auth URL + token exchange.
  - `lib/riot/client.ts`: identity fetch (`/riot/account/v1/accounts/me`).
  - `lib/riot/store.ts`: persisted Riot link + token metadata in Supabase.
  - `lib/riot/handlers.ts`: route-level orchestration for start/callback.
- Security boundary:
  - `RIOT_CLIENT_SECRET`, `RIOT_API_KEY`, token encryption key are server-only.
  - UI receives only safe linked-account status, never OAuth secrets/tokens.

## 2) File Plan

- Existing + maintained:
  - `app/connect-riot/page.tsx`
  - `lib/riot/config.ts`
  - `lib/riot/oauth.ts`
  - `lib/riot/client.ts`
  - `lib/riot/store.ts`
- Added:
  - `app/api/riot/start/route.ts`
  - `app/api/riot/callback/route.ts`
  - `lib/riot/handlers.ts`
  - `lib/riot/crypto.ts`
- Compatibility wrappers:
  - `app/api/riot/connect/route.ts` (legacy alias)
  - `app/auth/riot/callback/route.ts` (legacy alias)

## 3) Secure State/Callback/Token Strategy

- State:
  - 32-byte random base64url `state`.
  - Stored in HttpOnly cookie (`riot_oauth_state`, 10-minute max age).
  - Compared using constant-time equality.
  - Callback rejects missing/invalid/mismatched state.
- Callback validation:
  - Requires active Supabase session.
  - Handles Riot denial (`error=access_denied`) gracefully.
  - Clears OAuth cookies on success and error.
  - Uses safe status redirects to `/connect-riot?status=...`.
- Token storage:
  - Access/refresh tokens stored in `connected_riot_accounts`.
  - Encrypted at rest with AES-256-GCM via `RIOT_TOKEN_ENCRYPTION_KEY`.
  - Non-production fallback can allow plaintext only if
    `RIOT_ALLOW_PLAINTEXT_TOKENS_IN_DEV=true` (default dev convenience).
  - Production expectation: encryption key always set.

## 4) Exact Environment Variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RIOT_OAUTH_MOCK`
- `RIOT_CLIENT_ID`
- `RIOT_CLIENT_SECRET`
- `RIOT_REDIRECT_URI`
- `RIOT_TOKEN_ENCRYPTION_KEY`
- `RIOT_ALLOW_PLAINTEXT_TOKENS_IN_DEV`
- `RIOT_API_KEY`

## 5) Mock Mode Design

- Trigger conditions:
  - `RIOT_OAUTH_MOCK=true`, or
  - Riot client id/secret missing.
- Behavior:
  - Start route creates valid OAuth cookies and redirects directly to callback
    with a deterministic mock code.
  - Token exchange returns deterministic mock token set.
  - Identity client returns deterministic synthetic Riot identity.
  - Persist + UI states behave exactly like real mode for end-to-end testing.
- UI signaling:
  - Connect page and settings show clear demo badges when in mock mode.

## 6) Implementation Steps (recommended order)

1. Configure env and Supabase values in each environment.
2. Keep `RIOT_OAUTH_MOCK=true` in local/dev until Riot approval is granted.
3. Register callback URI in Riot portal to match `RIOT_REDIRECT_URI`.
4. Validate link flow from `/connect-riot` in mock mode.
5. Flip to real mode in staging (`RIOT_OAUTH_MOCK=false`) with approved creds.
6. Verify:
   - start/callback redirects
   - state mismatch handling
   - token encryption writes
   - disconnect flow
7. Enable production rollout and monitoring.

## 7) Riot Approval Readiness Checklist

- Product positioning:
  - Clearly post-match coaching/analytics.
  - No real-time in-match advice or assistance.
- Consent and privacy:
  - Explicit user opt-in before collecting personal Riot-linked data.
  - Clear disconnect/delete path.
  - Data retention + privacy policy disclosed.
- Security:
  - Secrets server-side only.
  - OAuth callback + state CSRF protection.
  - Token encryption at rest.
- UX clarity:
  - "Connect Riot account" explains what is imported and why.
  - User can use product without mandatory Riot connection (where applicable).
- Operational:
  - Error handling and rate-limit handling for Riot APIs.
  - Logging without token leakage.

## 8) What To Say In Riot Application

Use language like:

"SpikeIQ is a post-match VALORANT analytics and improvement platform. Players explicitly opt in via Riot Sign On to connect their own account. We use this access strictly to import their personal match history and generate coaching-style insights (mechanics, map decisions, consistency trends) after games are completed. We do not provide real-time, in-match guidance or overlays. Users can disconnect at any time, and we keep all credentials and secrets server-side with encrypted token storage and privacy-first defaults."

## 9) Notes About Your Current Dev Key

- The provided `RGAPI-9636a6a7-9236-4a76-adb8-3fac44c224d4` should be treated as
  temporary development-only and server-side only.
- Do not ship this key in client code or rely on it for production approval.
