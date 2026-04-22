/**
 * Persistence for connected Riot accounts.
 *
 * Writes go through the per-request Supabase server client so RLS enforces
 * that each row only ever belongs to the authenticated user.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { allowPlaintextTokenStorageInDev, isMockMode, type RiotRegion } from "./config";
import type { RiotIdentity } from "./client";
import type { RiotTokenSet } from "./oauth";
import { encryptTokenForStorage } from "./crypto";

export interface ConnectedRiotAccount {
  id: string;
  userId: string;
  puuid: string;
  gameName: string;
  tagLine: string;
  region: RiotRegion;
  isVerified: boolean;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type Row = {
  id: string;
  user_id: string;
  riot_puuid: string;
  riot_game_name: string;
  riot_tag_line: string;
  region: RiotRegion;
  is_verified: boolean;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

function toDomain(row: Row): ConnectedRiotAccount {
  return {
    id: row.id,
    userId: row.user_id,
    puuid: row.riot_puuid,
    gameName: row.riot_game_name,
    tagLine: row.riot_tag_line,
    region: row.region,
    isVerified: row.is_verified,
    tokenExpiresAt: row.token_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getConnectedRiotAccount(): Promise<ConnectedRiotAccount | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("connected_riot_accounts")
    .select(
      "id, user_id, riot_puuid, riot_game_name, riot_tag_line, region, is_verified, token_expires_at, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle<Row>();

  if (error) throw error;
  return data ? toDomain(data) : null;
}

/** Upsert the authenticated user's Riot link and profile regional pointer. */
export async function saveRiotAccountLink(params: {
  identity: RiotIdentity;
  tokens: RiotTokenSet;
  verified: boolean;
}): Promise<ConnectedRiotAccount> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const allowPlaintextFallback = isMockMode() || allowPlaintextTokenStorageInDev();
  const payload = {
    user_id: user.id,
    riot_puuid: params.identity.puuid,
    riot_game_name: params.identity.gameName,
    riot_tag_line: params.identity.tagLine,
    region: params.identity.region,
    is_verified: params.verified,
    access_token_encrypted: encryptTokenForStorage(params.tokens.accessToken, {
      allowPlaintextFallback,
    }),
    refresh_token_encrypted: encryptTokenForStorage(params.tokens.refreshToken, {
      allowPlaintextFallback,
    }),
    token_expires_at: params.tokens.expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  } satisfies Record<string, unknown>;

  const { data, error } = await supabase
    .from("connected_riot_accounts")
    .upsert(payload, { onConflict: "user_id" })
    .select(
      "id, user_id, riot_puuid, riot_game_name, riot_tag_line, region, is_verified, token_expires_at, created_at, updated_at",
    )
    .single<Row>();

  if (error) throw error;

  // Keep `profiles.region` in sync so non-Riot parts of the UI have a region hint.
  await supabase
    .from("profiles")
    .update({ region: params.identity.region, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return toDomain(data);
}

export async function deleteRiotAccountLink(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("connected_riot_accounts")
    .delete()
    .eq("user_id", user.id);

  if (error) throw error;
}
