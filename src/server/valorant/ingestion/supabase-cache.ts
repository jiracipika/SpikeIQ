import { SupabaseClient } from "@supabase/supabase-js";
import { ProviderCache } from "../provider/types";

export class SupabaseProviderCache implements ProviderCache {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly provider: string,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from("valorant_api_cache")
      .select("value_jsonb, expires_at")
      .eq("provider", this.provider)
      .eq("cache_key", key)
      .maybeSingle();

    if (error) {
      throw new Error(`Cache get failed for ${key}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    return data.value_jsonb as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const { error } = await this.supabase.from("valorant_api_cache").upsert(
      {
        provider: this.provider,
        cache_key: key,
        value_jsonb: value,
        expires_at: expiresAt,
      },
      {
        onConflict: "provider,cache_key",
      },
    );

    if (error) {
      throw new Error(`Cache set failed for ${key}: ${error.message}`);
    }
  }
}
