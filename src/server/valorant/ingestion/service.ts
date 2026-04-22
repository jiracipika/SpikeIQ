import { SupabaseClient } from "@supabase/supabase-js";
import { enqueueJob } from "./jobs";
import { ValorantRegion } from "../provider/types";

export interface OnRiotLinkedInput {
  userId: string;
  puuid: string;
  region: ValorantRegion;
  gameName?: string;
  tagLine?: string;
  scopes?: string[];
  optInVersion: string;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: string;
}

export class ValorantIngestionService {
  constructor(private readonly supabase: SupabaseClient) {}

  async onRiotLinked(input: OnRiotLinkedInput): Promise<void> {
    const connectionPayload = {
      user_id: input.userId,
      puuid: input.puuid,
      region: input.region,
      game_name: input.gameName ?? null,
      tag_line: input.tagLine ?? null,
      scopes: input.scopes ?? [],
      access_token_encrypted: input.encryptedAccessToken ?? null,
      refresh_token_encrypted: input.encryptedRefreshToken ?? null,
      token_expires_at: input.tokenExpiresAt ?? null,
      revoked_at: null,
      opt_in_version: input.optInVersion,
      opt_in_at: new Date().toISOString(),
      connected_at: new Date().toISOString(),
    };

    const { error: connectionError } = await this.supabase
      .from("riot_connections")
      .upsert(connectionPayload, { onConflict: "user_id" });

    if (connectionError) {
      throw new Error(`Failed to save Riot connection: ${connectionError.message}`);
    }

    const { error: syncError } = await this.supabase.from("valorant_sync_state").upsert(
      {
        user_id: input.userId,
        phase: "backfill",
        backfill_status: "pending",
        error_count: 0,
        last_error: null,
      },
      { onConflict: "user_id" },
    );

    if (syncError) {
      throw new Error(`Failed to initialize sync state: ${syncError.message}`);
    }

    await enqueueJob(this.supabase, {
      jobType: "sync_backfill_seed",
      payload: {
        userId: input.userId,
        region: input.region,
        puuid: input.puuid,
      },
      dedupeKey: `sync:seed:${input.userId}`,
      priority: 10,
    });
  }

  async scheduleRecentSync(userId: string, region: ValorantRegion, puuid: string): Promise<void> {
    await enqueueJob(this.supabase, {
      jobType: "sync_recent",
      payload: {
        userId,
        region,
        puuid,
      },
      dedupeKey: `sync:recent:${userId}`,
      priority: 25,
    });
  }

  async scheduleRecentSyncForConnectedUsers(limit = 500): Promise<number> {
    const { data, error } = await this.supabase
      .from("riot_connections")
      .select("user_id, region, puuid")
      .is("revoked_at", null)
      .order("connected_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to load connected users: ${error.message}`);
    }

    let scheduled = 0;

    for (const row of data ?? []) {
      await this.scheduleRecentSync(row.user_id, row.region, row.puuid);
      scheduled += 1;
    }

    return scheduled;
  }
}
